import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, TabInfo } from '../shared/ipc'

const api = {
  navigate: (url: string) => ipcRenderer.send(IPC_CHANNELS.NAVIGATE, url),
  goBack: () => ipcRenderer.send(IPC_CHANNELS.GO_BACK),
  goForward: () => ipcRenderer.send(IPC_CHANNELS.GO_FORWARD),
  reload: () => ipcRenderer.send(IPC_CHANNELS.RELOAD),
  newTab: (url?: string) => ipcRenderer.send(IPC_CHANNELS.NEW_TAB, url),
  closeTab: (id: string) => ipcRenderer.send(IPC_CHANNELS.CLOSE_TAB, id),
  switchTab: (id: string) => ipcRenderer.send(IPC_CHANNELS.SWITCH_TAB, id),

  onUrlUpdated: (cb: (tabId: string, url: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.URL_UPDATED, (_e, tabId, url) => cb(tabId, url))
  },
  onTitleUpdated: (cb: (tabId: string, title: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.TITLE_UPDATED, (_e, tabId, title) => cb(tabId, title))
  },
  onLoadingChanged: (cb: (tabId: string, loading: boolean) => void) => {
    ipcRenderer.on(IPC_CHANNELS.LOADING_CHANGED, (_e, tabId, loading) => cb(tabId, loading))
  },
  onFaviconUpdated: (cb: (tabId: string, favicon: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.FAVICON_UPDATED, (_e, tabId, favicon) => cb(tabId, favicon))
  },
  onTabList: (cb: (tabs: TabInfo[], activeId: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.TAB_LIST, (_e, tabs, activeId) => cb(tabs, activeId))
  },
  onActiveTab: (cb: (tabId: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.ACTIVE_TAB, (_e, tabId) => cb(tabId))
  },
  onCanGoBack: (cb: (can: boolean) => void) => {
    ipcRenderer.on(IPC_CHANNELS.CAN_GO_BACK, (_e, can) => cb(can))
  },
  onCanGoForward: (cb: (can: boolean) => void) => {
    ipcRenderer.on(IPC_CHANNELS.CAN_GO_FORWARD, (_e, can) => cb(can))
  },
}

contextBridge.exposeInMainWorld('melt', api)

export type MeltAPI = typeof api
