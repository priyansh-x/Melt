import { contextBridge, ipcRenderer } from 'electron'
import { RECIPE_IPC, Recipe, RecipeCreate, RecipeUpdate } from '../shared/recipe'
import { AI_IPC, GenerateRecipeRequest, GenerateRecipeResponse, ChatRequest, ChatResponse } from '../shared/ai'
import { HISTORY_IPC, BOOKMARK_IPC, NOTES_IPC, HistoryEntry, Bookmark } from '../shared/history'
import { DOWNLOAD_IPC, DownloadItem } from '../shared/downloads'

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
    export: (): Promise<{ success: boolean; count?: number }> =>
      ipcRenderer.invoke(RECIPE_IPC.EXPORT),
    import: (): Promise<{ success: boolean; count?: number; error?: string }> =>
      ipcRenderer.invoke(RECIPE_IPC.IMPORT),
    getHistory: (recipeId: string) =>
      ipcRenderer.invoke(RECIPE_IPC.GET_HISTORY, recipeId),
    restoreVersion: (recipeId: string, historyId: number) =>
      ipcRenderer.invoke(RECIPE_IPC.RESTORE_VERSION, recipeId, historyId),
  },

  ai: {
    generateRecipe: (req: GenerateRecipeRequest): Promise<GenerateRecipeResponse> =>
      ipcRenderer.invoke(AI_IPC.GENERATE_RECIPE, req),
    chat: (req: ChatRequest): Promise<ChatResponse> =>
      ipcRenderer.invoke(AI_IPC.CHAT, req),
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

  notes: {
    getForUrl: (url: string) =>
      ipcRenderer.invoke(NOTES_IPC.GET_FOR_URL, url),
    add: (url: string, note: string) =>
      ipcRenderer.invoke(NOTES_IPC.ADD, url, note),
    update: (id: number, note: string) =>
      ipcRenderer.invoke(NOTES_IPC.UPDATE, id, note),
    delete: (id: number) =>
      ipcRenderer.invoke(NOTES_IPC.DELETE, id),
    getAll: () =>
      ipcRenderer.invoke(NOTES_IPC.GET_ALL),
  },

  downloads: {
    getAll: (): Promise<DownloadItem[]> =>
      ipcRenderer.invoke(DOWNLOAD_IPC.GET_ALL),
    open: (savePath: string) =>
      ipcRenderer.invoke(DOWNLOAD_IPC.OPEN, savePath),
    showInFolder: (savePath: string) =>
      ipcRenderer.invoke(DOWNLOAD_IPC.SHOW_IN_FOLDER, savePath),
    onStarted: (cb: (dl: DownloadItem) => void) =>
      ipcRenderer.on(DOWNLOAD_IPC.ON_STARTED, (_e, dl) => cb(dl)),
    onProgress: (cb: (dl: DownloadItem) => void) =>
      ipcRenderer.on(DOWNLOAD_IPC.ON_PROGRESS, (_e, dl) => cb(dl)),
    onDone: (cb: (dl: DownloadItem) => void) =>
      ipcRenderer.on(DOWNLOAD_IPC.ON_DONE, (_e, dl) => cb(dl)),
  },
}

contextBridge.exposeInMainWorld('melt', api)

export type MeltAPI = typeof api
