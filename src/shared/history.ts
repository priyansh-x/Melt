export interface HistoryEntry {
  id: number
  url: string
  title: string
  visitedAt: string
}

export interface Bookmark {
  id: number
  url: string
  title: string
  favicon: string
  createdAt: string
}

export const HISTORY_IPC = {
  ADD: 'history:add',
  SEARCH: 'history:search',
  GET_RECENT: 'history:get-recent',
  CLEAR: 'history:clear',
} as const

export const BOOKMARK_IPC = {
  GET_ALL: 'bookmark:get-all',
  ADD: 'bookmark:add',
  REMOVE: 'bookmark:remove',
  IS_BOOKMARKED: 'bookmark:is-bookmarked',
} as const
