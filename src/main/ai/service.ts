import Anthropic from '@anthropic-ai/sdk'
import { GenerateRecipeRequest, GenerateRecipeResponse } from '../../shared/ai'

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
