import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider, GenerateRecipeRequest, GenerateRecipeResponse, ChatRequest, ChatResponse } from '../../shared/ai'

let anthropicClient: Anthropic | null = null
let geminiClient: GoogleGenerativeAI | null = null
let currentProvider: AIProvider = 'gemini'

export function setProvider(provider: AIProvider) {
  currentProvider = provider
}

export function getProvider(): AIProvider {
  return currentProvider
}

export function setApiKey(key: string) {
  if (currentProvider === 'claude') {
    anthropicClient = new Anthropic({ apiKey: key })
  } else {
    geminiClient = new GoogleGenerativeAI(key)
  }
}

export function setClaudeKey(key: string) {
  anthropicClient = new Anthropic({ apiKey: key })
}

export function setGeminiKey(key: string) {
  geminiClient = new GoogleGenerativeAI(key)
}

const SYSTEM_PROMPT = `You are Melt, an AI browser assistant that generates CSS and JavaScript customizations for web pages.

When the user describes a change they want on a page, generate CSS and/or JS to achieve it.

Rules:
- Return ONLY valid JSON with this exact shape: { "name": "short recipe name", "css": "css code or empty string", "js": "js code or empty string", "domActions": "[...]", "urlPattern": "glob pattern" }
- domActions is a JSON string array of structural DOM changes (hide, remove, replaceText, setAttribute, insertHtml, etc.)
- CSS should be clean, specific, and use !important only when necessary
- JS should be minimal, safe, and self-contained (no external dependencies)
- JS runs once on page load — use MutationObserver if you need to watch for DOM changes
- The urlPattern should match the site broadly (e.g. "*google.com*") unless the user asks for something page-specific
- No markdown, no explanation, no code fences — just the JSON object
- If the request is unclear or impossible, return { "name": "", "css": "", "js": "", "domActions": "[]", "urlPattern": "", "error": "brief explanation" }`

const CHAT_SYSTEM_PROMPT = `You are Melt, an AI assistant built into an AI-first web browser. You help users customize and interact with web pages.

You can have natural conversations AND generate page customizations. Decide based on the user's message:

1. If the user wants to MODIFY the page (change colors, hide elements, restyle, add features, remove ads, etc.):
   - Respond with a JSON block containing the recipe
   - Format: \`\`\`recipe
   {"name":"short name","css":"...","js":"...","domActions":"[...]","urlPattern":"*hostname*"}
   \`\`\`
   - domActions is a JSON string array of objects with these types:
     - {"type":"hide","selector":"..."} — hides element with display:none
     - {"type":"remove","selector":"..."} — removes element from DOM
     - {"type":"replaceText","selector":"...","newText":"..."} — replaces text content
     - {"type":"setAttribute","selector":"...","attr":"...","value":"..."} — sets an attribute
     - {"type":"moveAfter","selector":"...","targetSelector":"..."} — moves element after target
     - {"type":"wrap","selector":"...","wrapperHtml":"<div class='...'>"} — wraps element in HTML
     - {"type":"insertHtml","selector":"...","position":"before|after|prepend|append","html":"..."}
   - Use CSS for styling changes, JS for complex behavior, domActions for structural DOM changes
   - domActions persist across SPA navigations via MutationObserver
   - Include conversational text BEFORE the recipe block explaining what you did

2. If the user is asking questions, chatting, or needs help:
   - Just respond conversationally — no recipe block needed
   - You can answer questions about the page content, explain HTML/CSS, suggest modifications

3. If refining a previous recipe:
   - Generate a NEW complete recipe block with the updated version
   - Explain what changed

Keep responses concise. You're inside a browser sidebar — space is limited.`

// --- Claude implementation ---

async function generateRecipeClaude(req: GenerateRecipeRequest): Promise<GenerateRecipeResponse> {
  if (!anthropicClient) {
    return { success: false, error: 'Claude API key not set. Open Settings to add it.' }
  }
  const truncatedHtml = req.pageHtml.slice(0, 8000)
  try {
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Page URL: ${req.url}\nPage title: ${req.pageTitle}\n\nPage HTML (truncated):\n${truncatedHtml}\n\nUser request: ${req.prompt}`,
      }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    if (parsed.error) return { success: false, error: parsed.error }
    return {
      success: true,
      recipe: {
        name: parsed.name || 'Untitled Recipe',
        css: parsed.css || '',
        js: parsed.js || '',
        domActions: parsed.domActions || '[]',
        urlPattern: parsed.urlPattern || `*${new URL(req.url).hostname}*`,
      },
    }
  } catch (e: any) {
    if (e.message?.includes('JSON')) return { success: false, error: 'AI returned invalid response. Try rephrasing.' }
    return { success: false, error: e.message || 'Failed to generate recipe' }
  }
}

async function chatClaude(req: ChatRequest): Promise<ChatResponse> {
  if (!anthropicClient) {
    return { success: false, error: 'Claude API key not set. Open Settings to add it.' }
  }
  const truncatedHtml = req.pageHtml.slice(0, 6000)
  const pageContext = `[Current page: ${req.url} — "${req.pageTitle}"]\n\nHTML (truncated):\n${truncatedHtml}`
  try {
    const messages = req.messages.map((m, i) => ({
      role: m.role as 'user' | 'assistant',
      content: i === 0 ? `${pageContext}\n\n${m.content}` : m.content,
    }))
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return parseRecipeResponse(text, req.url)
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to get response' }
  }
}

// --- Gemini implementation ---

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite']

async function geminiGenerate(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!geminiClient) throw new Error('Gemini API key not set. Open Settings to add it.')

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = geminiClient.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt })
        const result = await model.generateContent(userPrompt)
        return result.response.text()
      } catch (e: any) {
        const is429 = e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('rate')
        if (is429 && attempt < 2) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 5000))
          continue
        }
        if (is429 && modelName !== GEMINI_MODELS[GEMINI_MODELS.length - 1]) {
          break // try next model
        }
        throw e
      }
    }
  }
  throw new Error('All Gemini models are rate-limited. Wait a minute and try again.')
}

async function generateRecipeGemini(req: GenerateRecipeRequest): Promise<GenerateRecipeResponse> {
  const truncatedHtml = req.pageHtml.slice(0, 4000)
  try {
    const text = await geminiGenerate(SYSTEM_PROMPT, `Page URL: ${req.url}\nPage title: ${req.pageTitle}\n\nPage HTML (truncated):\n${truncatedHtml}\n\nUser request: ${req.prompt}`)
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.error) return { success: false, error: parsed.error }
    return {
      success: true,
      recipe: {
        name: parsed.name || 'Untitled Recipe',
        css: parsed.css || '',
        js: parsed.js || '',
        domActions: parsed.domActions || '[]',
        urlPattern: parsed.urlPattern || `*${new URL(req.url).hostname}*`,
      },
    }
  } catch (e: any) {
    if (e.message?.includes('JSON')) return { success: false, error: 'AI returned invalid response. Try rephrasing.' }
    return { success: false, error: e.message || 'Failed to generate recipe' }
  }
}

async function chatGemini(req: ChatRequest): Promise<ChatResponse> {
  if (!geminiClient) {
    return { success: false, error: 'Gemini API key not set. Open Settings to add it.' }
  }
  const truncatedHtml = req.pageHtml.slice(0, 3000)
  const pageContext = `[Current page: ${req.url} — "${req.pageTitle}"]\n\nHTML (truncated):\n${truncatedHtml}`
  try {
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = geminiClient.getGenerativeModel({ model: modelName, systemInstruction: CHAT_SYSTEM_PROMPT })
        const chat = model.startChat({
          history: req.messages.slice(0, -1).map((m, i) => ({
            role: m.role === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: i === 0 ? `${pageContext}\n\n${m.content}` : m.content }],
          })),
        })
        const lastMsg = req.messages[req.messages.length - 1]
        const prompt = req.messages.length === 1 ? `${pageContext}\n\n${lastMsg.content}` : lastMsg.content
        const result = await chat.sendMessage(prompt)
        return parseRecipeResponse(result.response.text(), req.url)
      } catch (e: any) {
        const is429 = e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('rate')
        if (is429 && modelName !== GEMINI_MODELS[GEMINI_MODELS.length - 1]) continue
        throw e
      }
    }
    return { success: false, error: 'All models rate-limited. Wait a minute and try again.' }
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to get response' }
  }
}

// --- Shared helpers ---

function parseRecipeResponse(text: string, url: string): ChatResponse {
  const recipeMatch = text.match(/```recipe\s*\n([\s\S]*?)\n```/)
  if (recipeMatch) {
    try {
      const recipe = JSON.parse(recipeMatch[1])
      const conversationalText = text.replace(/```recipe\s*\n[\s\S]*?\n```/, '').trim()
      return {
        success: true,
        message: conversationalText || 'Applied the changes.',
        recipe: {
          name: recipe.name || 'AI Recipe',
          css: recipe.css || '',
          js: recipe.js || '',
          domActions: recipe.domActions || '[]',
          urlPattern: recipe.urlPattern || `*${(() => { try { return new URL(url).hostname } catch { return '*' } })()}*`,
        },
      }
    } catch {
      return { success: true, message: text }
    }
  }
  return { success: true, message: text }
}

// --- Public API (routes to active provider) ---

export async function generateRecipe(req: GenerateRecipeRequest): Promise<GenerateRecipeResponse> {
  return currentProvider === 'claude' ? generateRecipeClaude(req) : generateRecipeGemini(req)
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  return currentProvider === 'claude' ? chatClaude(req) : chatGemini(req)
}
