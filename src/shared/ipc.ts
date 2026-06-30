export interface TabData {
  id: string
  url: string
  title: string
  favicon: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  isPinned: boolean
  groupId?: string
}

export interface TabGroup {
  id: string
  name: string
  color: string
}
