import { ipcMain } from 'electron'
import { AI_IPC, AIProvider, GenerateRecipeRequest, ChatRequest } from '../../shared/ai'
import { generateRecipe, chat, setClaudeKey, setGeminiKey, setProvider, getProvider } from './service'
import { loadApiKey, saveApiKey, loadGeminiKey, saveGeminiKey, loadProvider, saveProvider } from './store'

export function registerAIHandlers() {
  const provider = loadProvider()
  setProvider(provider)

  const claudeKey = loadApiKey()
  if (claudeKey) setClaudeKey(claudeKey)

  const geminiKey = loadGeminiKey()
  if (geminiKey) setGeminiKey(geminiKey)

  ipcMain.handle(AI_IPC.GENERATE_RECIPE, async (_event, req: GenerateRecipeRequest) => {
    return generateRecipe(req)
  })

  ipcMain.handle(AI_IPC.CHAT, async (_event, req: ChatRequest) => {
    return chat(req)
  })

  ipcMain.handle(AI_IPC.SET_API_KEY, async (_event, key: string, provider?: AIProvider) => {
    if (provider === 'gemini') {
      saveGeminiKey(key)
      setGeminiKey(key)
    } else {
      saveApiKey(key)
      setClaudeKey(key)
    }
    return { success: true }
  })

  ipcMain.handle(AI_IPC.GET_API_KEY, async (_event, provider?: AIProvider) => {
    if (provider === 'gemini') return loadGeminiKey()
    return loadApiKey()
  })

  ipcMain.handle(AI_IPC.SET_PROVIDER, async (_event, provider: AIProvider) => {
    saveProvider(provider)
    setProvider(provider)
    return { success: true }
  })

  ipcMain.handle(AI_IPC.GET_PROVIDER, async () => {
    return getProvider()
  })
}
