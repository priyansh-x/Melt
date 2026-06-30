import { contextBridge, ipcRenderer } from 'electron'
import { RECIPE_IPC, Recipe, RecipeCreate, RecipeUpdate } from '../shared/recipe'

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
}

contextBridge.exposeInMainWorld('melt', api)

export type MeltAPI = typeof api
