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

export const NOTES_IPC = {
  GET_FOR_URL: 'notes:get-for-url',
  ADD: 'notes:add',
  UPDATE: 'notes:update',
  DELETE: 'notes:delete',
  GET_ALL: 'notes:get-all',
} as const

export const SESSION_IPC = {
  SAVE: 'session:save',
  GET_ALL: 'session:get-all',
  DELETE: 'session:delete',
} as const

export const BOOKMARK_IPC = {
  GET_ALL: 'bookmark:get-all',
  ADD: 'bookmark:add',
  REMOVE: 'bookmark:remove',
  IS_BOOKMARKED: 'bookmark:is-bookmarked',
} as const
