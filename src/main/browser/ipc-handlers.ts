import { ipcMain } from 'electron'
import { HISTORY_IPC, BOOKMARK_IPC, NOTES_IPC, SESSION_IPC } from '../../shared/history'
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

  ipcMain.handle(NOTES_IPC.GET_FOR_URL, (_e, url: string) => db.getNotesForUrl(url))
  ipcMain.handle(NOTES_IPC.ADD, (_e, url: string, note: string) => db.addNote(url, note))
  ipcMain.handle(NOTES_IPC.UPDATE, (_e, id: number, note: string) => db.updateNote(id, note))
  ipcMain.handle(NOTES_IPC.DELETE, (_e, id: number) => db.deleteNote(id))
  ipcMain.handle(NOTES_IPC.GET_ALL, () => db.getAllNotes())

  ipcMain.handle(SESSION_IPC.SAVE, (_e, name: string, tabs: { url: string; title: string }[]) => db.saveSession(name, tabs))
  ipcMain.handle(SESSION_IPC.GET_ALL, () => db.getSavedSessions())
  ipcMain.handle(SESSION_IPC.DELETE, (_e, id: number) => db.deleteSavedSession(id))
}
