import { ipcMain } from 'electron'
import { AI_IPC, GenerateRecipeRequest, ChatRequest } from '../../shared/ai'
import { generateRecipe, chat, setApiKey } from './service'
import { loadApiKey, saveApiKey } from './store'

export function registerAIHandlers() {
  const saved = loadApiKey()
  if (saved) setApiKey(saved)

  ipcMain.handle(AI_IPC.GENERATE_RECIPE, async (_event, req: GenerateRecipeRequest) => {
    return generateRecipe(req)
  })

  ipcMain.handle(AI_IPC.CHAT, async (_event, req: ChatRequest) => {
    return chat(req)
  })

  ipcMain.handle(AI_IPC.SET_API_KEY, async (_event, key: string) => {
    saveApiKey(key)
    setApiKey(key)
    return { success: true }
  })

  ipcMain.handle(AI_IPC.GET_API_KEY, async () => {
    return loadApiKey()
  })
}
