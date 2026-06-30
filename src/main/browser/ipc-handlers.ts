import { ipcMain } from 'electron'
import { HISTORY_IPC, BOOKMARK_IPC } from '../../shared/history'
import * as db from './db'

export function registerBrowserHandlers() {
  ipcMain.handle(HISTORY_IPC.ADD, (_e, url: string, title: string) => db.addHistoryEntry(url, title))
  ipcMain.handle(HISTORY_IPC.SEARCH, (_e, query: string) => db.searchHistory(query))
  ipcMain.handle(HISTORY_IPC.GET_RECENT, (_e, limit?: number) => db.getRecentHistory(limit))
  ipcMain.handle(HISTORY_IPC.CLEAR, () => db.clearHistory())

  ipcMain.handle(BOOKMARK_IPC.GET_ALL, () => db.getAllBookmarks())
  ipcMain.handle(BOOKMARK_IPC.ADD, (_e, url: string, title: string, favicon: string) => db.addBookmark(url, title, favicon))
  ipcMain.handle(BOOKMARK_IPC.REMOVE, (_e, url: string) => db.removeBookmark(url))
  ipcMain.handle(BOOKMARK_IPC.IS_BOOKMARKED, (_e, url: string) => db.isBookmarked(url))
}
