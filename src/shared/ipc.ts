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
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
