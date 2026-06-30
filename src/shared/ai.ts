export const AI_IPC = {
  GENERATE_RECIPE: 'ai:generate-recipe',
  SET_API_KEY: 'ai:set-api-key',
  GET_API_KEY: 'ai:get-api-key',
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
    urlPattern: string
  }
  error?: string
}
