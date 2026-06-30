import Anthropic from '@anthropic-ai/sdk'
import { GenerateRecipeRequest, GenerateRecipeResponse, ChatRequest, ChatResponse } from '../../shared/ai'

let client: Anthropic | null = null

export function setApiKey(key: string) {
  client = new Anthropic({ apiKey: key })
}

export function getClient(): Anthropic | null {
  return client
}

const SYSTEM_PROMPT = `You are Melt, an AI browser assistant that generates CSS and JavaScript customizations for web pages.

When the user describes a change they want on a page, generate CSS and/or JS to achieve it.

Rules:
- Return ONLY valid JSON with this exact shape: { "name": "short recipe name", "css": "css code or empty string", "js": "js code or empty string", "urlPattern": "glob pattern" }
- CSS should be clean, specific, and use !important only when necessary
- JS should be minimal, safe, and self-contained (no external dependencies)
- JS runs once on page load — use MutationObserver if you need to watch for DOM changes
- The urlPattern should match the site broadly (e.g. "*google.com*") unless the user asks for something page-specific
- No markdown, no explanation, no code fences — just the JSON object
- If the request is unclear or impossible, return { "name": "", "css": "", "js": "", "urlPattern": "", "error": "brief explanation" }`

const CHAT_SYSTEM_PROMPT = `You are Melt, an AI assistant built into an AI-first web browser. You help users customize and interact with web pages.

You can have natural conversations AND generate page customizations. Decide based on the user's message:

1. If the user wants to MODIFY the page (change colors, hide elements, restyle, add features, remove ads, etc.):
   - Respond with a JSON block containing the recipe
   - Format: \`\`\`recipe
   {"name":"short name","css":"...","js":"...","domActions":"[{...}]","urlPattern":"*hostname*"}
   \`\`\`
   - domActions is a JSON string array of: {"type":"hide|remove|replaceText","selector":"...","newText":"..."}
   - Include conversational text BEFORE the recipe block explaining what you did

2. If the user is asking questions, chatting, or needs help:
   - Just respond conversationally — no recipe block needed
   - You can answer questions about the page content, explain HTML/CSS, suggest modifications

3. If refining a previous recipe:
   - Generate a NEW recipe block with the updated version
   - Explain what changed

Keep responses concise. You're inside a browser sidebar — space is limited.`

export async function generateRecipe(req: GenerateRecipeRequest): Promise<GenerateRecipeResponse> {
  if (!client) {
    return { success: false, error: 'API key not set. Open Settings to add your Claude API key.' }
  }

  const truncatedHtml = req.pageHtml.slice(0, 8000)

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Page URL: ${req.url}\nPage title: ${req.pageTitle}\n\nPage HTML (truncated):\n${truncatedHtml}\n\nUser request: ${req.prompt}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)

    if (parsed.error) {
      return { success: false, error: parsed.error }
    }

    return {
      success: true,
      recipe: {
        name: parsed.name || 'Untitled Recipe',
        css: parsed.css || '',
        js: parsed.js || '',
        urlPattern: parsed.urlPattern || `*${new URL(req.url).hostname}*`,
      },
    }
  } catch (e: any) {
    if (e.message?.includes('JSON')) {
      return { success: false, error: 'AI returned invalid response. Try rephrasing your request.' }
    }
    return { success: false, error: e.message || 'Failed to generate recipe' }
  }
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  if (!client) {
    return { success: false, error: 'API key not set. Open Settings to add your Claude API key.' }
  }

  const truncatedHtml = req.pageHtml.slice(0, 6000)
  const pageContext = `[Current page: ${req.url} — "${req.pageTitle}"]\n\nHTML (truncated):\n${truncatedHtml}`

  try {
    const messages = req.messages.map((m, i) => ({
      role: m.role as 'user' | 'assistant',
      content: i === 0 ? `${pageContext}\n\n${m.content}` : m.content,
    }))

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Check for recipe block
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
            urlPattern: recipe.urlPattern || `*${(() => { try { return new URL(req.url).hostname } catch { return '*' } })()}*`,
          },
        }
      } catch {
        return { success: true, message: text }
      }
    }

    return { success: true, message: text }
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to get response' }
  }
}
