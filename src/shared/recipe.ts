export type DomAction =
  | { type: 'hide'; selector: string }
  | { type: 'remove'; selector: string }
  | { type: 'replaceText'; selector: string; newText: string }
  | { type: 'setAttribute'; selector: string; attr: string; value: string }
  | { type: 'moveAfter'; selector: string; targetSelector: string }
  | { type: 'wrap'; selector: string; wrapperHtml: string }
  | { type: 'insertHtml'; selector: string; position: 'before' | 'after' | 'prepend' | 'append'; html: string }

export interface Recipe {
  id: string
  name: string
  urlPattern: string
  css: string
  js: string
  domActions: string
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
  EXPORT: 'recipe:export',
  IMPORT: 'recipe:import',
  GET_HISTORY: 'recipe:get-history',
  RESTORE_VERSION: 'recipe:restore-version',
} as const
