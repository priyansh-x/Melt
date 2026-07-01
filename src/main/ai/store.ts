import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { AIProvider } from '../../shared/ai'

const configPath = () => path.join(app.getPath('userData'), 'config.json')

function readConfig(): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf-8'))
  } catch {
    return {}
  }
}

function writeConfig(data: Record<string, unknown>) {
  fs.writeFileSync(configPath(), JSON.stringify(data, null, 2))
}

export function loadApiKey(): string {
  const data = readConfig()
  return (data.anthropicApiKey as string) || ''
}

export function saveApiKey(key: string) {
  const data = readConfig()
  data.anthropicApiKey = key
  writeConfig(data)
}

export function loadGeminiKey(): string {
  const data = readConfig()
  return (data.geminiApiKey as string) || ''
}

export function saveGeminiKey(key: string) {
  const data = readConfig()
  data.geminiApiKey = key
  writeConfig(data)
}

export function loadProvider(): AIProvider {
  const data = readConfig()
  return (data.aiProvider as AIProvider) || 'gemini'
}

export function saveProvider(provider: AIProvider) {
  const data = readConfig()
  data.aiProvider = provider
  writeConfig(data)
}
