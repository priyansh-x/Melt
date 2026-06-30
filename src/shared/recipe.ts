export interface Recipe {
  id: string
  name: string
  urlPattern: string
  css: string
  js: string
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export type RecipeCreate = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
export type RecipeUpdate = Partial<RecipeCreate> & { id: string }

export const RECIPE_IPC = {
  GET_ALL: 'recipe:get-all',
  GET_FOR_URL: 'recipe:get-for-url',
  CREATE: 'recipe:create',
  UPDATE: 'recipe:update',
  DELETE: 'recipe:delete',
  TOGGLE: 'recipe:toggle',
  INJECT: 'recipe:inject',
} as const
