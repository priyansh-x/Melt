import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const configPath = () => path.join(app.getPath('userData'), 'config.json')

export function loadApiKey(): string {
  try {
    const data = JSON.parse(fs.readFileSync(configPath(), 'utf-8'))
    return data.anthropicApiKey || ''
  } catch {
    return ''
  }
}

export function saveApiKey(key: string) {
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(fs.readFileSync(configPath(), 'utf-8'))
  } catch {}
  data.anthropicApiKey = key
  fs.writeFileSync(configPath(), JSON.stringify(data, null, 2))
}
