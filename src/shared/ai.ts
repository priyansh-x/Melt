export type AIProvider = 'gemini' | 'claude'

export const AI_IPC = {
  GENERATE_RECIPE: 'ai:generate-recipe',
  CHAT: 'ai:chat',
  SET_API_KEY: 'ai:set-api-key',
  GET_API_KEY: 'ai:get-api-key',
  SET_PROVIDER: 'ai:set-provider',
  GET_PROVIDER: 'ai:get-provider',
} as const

export interface GenerateRecipeRequest {
  prompt: string
  url: string
  pageTitle: string
  pageHtml: string
}

export interface GenerateRecipeResponse {
  success: boolean
  recipe?: {
    name: string
    css: string
    js: string
    domActions: string
    urlPattern: string
  }
  error?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  url: string
  pageTitle: string
  pageHtml: string
}

export interface ChatResponse {
  success: boolean
  message?: string
  recipe?: {
    name: string
    css: string
    js: string
    domActions: string
    urlPattern: string
  }
  error?: string
}
