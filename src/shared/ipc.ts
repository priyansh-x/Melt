export const IPC_CHANNELS = {
  NAVIGATE: 'navigate',
  GO_BACK: 'go-back',
  GO_FORWARD: 'go-forward',
  RELOAD: 'reload',
  NEW_TAB: 'new-tab',
  CLOSE_TAB: 'close-tab',
  SWITCH_TAB: 'switch-tab',
  URL_UPDATED: 'url-updated',
  TITLE_UPDATED: 'title-updated',
  LOADING_CHANGED: 'loading-changed',
  FAVICON_UPDATED: 'favicon-updated',
  CAN_GO_BACK: 'can-go-back',
  CAN_GO_FORWARD: 'can-go-forward',
  TAB_LIST: 'tab-list',
  ACTIVE_TAB: 'active-tab',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

export interface TabInfo {
  id: string
  title: string
  url: string
  favicon: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
}
