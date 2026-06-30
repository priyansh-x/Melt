import { contextBridge, ipcRenderer } from 'electron'
import { RECIPE_IPC, Recipe, RecipeCreate, RecipeUpdate } from '../shared/recipe'
import { AI_IPC, GenerateRecipeRequest, GenerateRecipeResponse } from '../shared/ai'
import { HISTORY_IPC, BOOKMARK_IPC, HistoryEntry, Bookmark } from '../shared/history'

const api = {
  onShortcut: (channel: string, cb: () => void) => {
    ipcRenderer.on(`shortcut:${channel}`, () => cb())
  },

  recipes: {
    getAll: (): Promise<Recipe[]> =>
      ipcRenderer.invoke(RECIPE_IPC.GET_ALL),
    getForUrl: (url: string): Promise<Recipe[]> =>
      ipcRenderer.invoke(RECIPE_IPC.GET_FOR_URL, url),
    create: (data: RecipeCreate): Promise<Recipe> =>
      ipcRenderer.invoke(RECIPE_IPC.CREATE, data),
    update: (data: RecipeUpdate): Promise<Recipe | null> =>
      ipcRenderer.invoke(RECIPE_IPC.UPDATE, data),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke(RECIPE_IPC.DELETE, id),
    toggle: (id: string): Promise<Recipe | null> =>
      ipcRenderer.invoke(RECIPE_IPC.TOGGLE, id),
  },

  ai: {
    generateRecipe: (req: GenerateRecipeRequest): Promise<GenerateRecipeResponse> =>
      ipcRenderer.invoke(AI_IPC.GENERATE_RECIPE, req),
    setApiKey: (key: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke(AI_IPC.SET_API_KEY, key),
    getApiKey: (): Promise<string> =>
      ipcRenderer.invoke(AI_IPC.GET_API_KEY),
  },

  history: {
    add: (url: string, title: string) =>
      ipcRenderer.invoke(HISTORY_IPC.ADD, url, title),
    search: (query: string): Promise<HistoryEntry[]> =>
      ipcRenderer.invoke(HISTORY_IPC.SEARCH, query),
    getRecent: (limit?: number): Promise<HistoryEntry[]> =>
      ipcRenderer.invoke(HISTORY_IPC.GET_RECENT, limit),
    clear: () =>
      ipcRenderer.invoke(HISTORY_IPC.CLEAR),
  },

  bookmarks: {
    getAll: (): Promise<Bookmark[]> =>
      ipcRenderer.invoke(BOOKMARK_IPC.GET_ALL),
    add: (url: string, title: string, favicon: string): Promise<Bookmark> =>
      ipcRenderer.invoke(BOOKMARK_IPC.ADD, url, title, favicon),
    remove: (url: string): Promise<boolean> =>
      ipcRenderer.invoke(BOOKMARK_IPC.REMOVE, url),
    isBookmarked: (url: string): Promise<boolean> =>
      ipcRenderer.invoke(BOOKMARK_IPC.IS_BOOKMARKED, url),
  },
}

contextBridge.exposeInMainWorld('melt', api)

export type MeltAPI = typeof api
