import { contextBridge, ipcRenderer } from 'electron'

const api = {
  onShortcut: (channel: string, cb: () => void) => {
    ipcRenderer.on(`shortcut:${channel}`, () => cb())
  },
}

contextBridge.exposeInMainWorld('melt', api)

export type MeltAPI = typeof api
