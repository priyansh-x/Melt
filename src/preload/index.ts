import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'

const api = {
  navigate: (url: string) => ipcRenderer.send(IPC_CHANNELS.NAVIGATE, url),
  goBack: () => ipcRenderer.send(IPC_CHANNELS.GO_BACK),
  goForward: () => ipcRenderer.send(IPC_CHANNELS.GO_FORWARD),
  reload: () => ipcRenderer.send(IPC_CHANNELS.RELOAD),
  newTab: () => ipcRenderer.send(IPC_CHANNELS.NEW_TAB),
  closeTab: (id: number) => ipcRenderer.send(IPC_CHANNELS.CLOSE_TAB, id),
  switchTab: (id: number) => ipcRenderer.send(IPC_CHANNELS.SWITCH_TAB, id),

  onUrlUpdated: (callback: (url: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.URL_UPDATED, (_e, url) => callback(url))
  },
  onTitleUpdated: (callback: (title: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.TITLE_UPDATED, (_e, title) => callback(title))
  },
  onLoadingChanged: (callback: (loading: boolean) => void) => {
    ipcRenderer.on(IPC_CHANNELS.LOADING_CHANGED, (_e, loading) => callback(loading))
  },
}

contextBridge.exposeInMainWorld('melt', api)

export type MeltAPI = typeof api
