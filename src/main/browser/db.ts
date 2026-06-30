import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { HistoryEntry, Bookmark } from '../../shared/history'

let db: Database.Database

function getDb(): Database.Database {
  if (db) return db

  const dbPath = path.join(app.getPath('userData'), 'browser.db')
  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT DEFAULT '',
      visitedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_history_visited ON history(visitedAt DESC);
    CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      title TEXT DEFAULT '',
      favicon TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `)

  return db
}

export function addHistoryEntry(url: string, title: string) {
  if (!url || url === 'about:blank') return
  getDb().prepare('INSERT INTO history (url, title, visitedAt) VALUES (?, ?, ?)').run(url, title, new Date().toISOString())
}

export function searchHistory(query: string, limit = 50): HistoryEntry[] {
  return getDb().prepare(
    'SELECT * FROM history WHERE url LIKE ? OR title LIKE ? ORDER BY visitedAt DESC LIMIT ?'
  ).all(`%${query}%`, `%${query}%`, limit) as HistoryEntry[]
}

export function getRecentHistory(limit = 100): HistoryEntry[] {
  return getDb().prepare('SELECT * FROM history ORDER BY visitedAt DESC LIMIT ?').all(limit) as HistoryEntry[]
}

export function clearHistory() {
  getDb().prepare('DELETE FROM history').run()
}

export function getAllBookmarks(): Bookmark[] {
  return getDb().prepare('SELECT * FROM bookmarks ORDER BY createdAt DESC').all() as Bookmark[]
}

export function addBookmark(url: string, title: string, favicon: string): Bookmark {
  const now = new Date().toISOString()
  const result = getDb().prepare(
    'INSERT OR REPLACE INTO bookmarks (url, title, favicon, createdAt) VALUES (?, ?, ?, ?)'
  ).run(url, title, favicon, now)
  return { id: result.lastInsertRowid as number, url, title, favicon, createdAt: now }
}

export function removeBookmark(url: string): boolean {
  return getDb().prepare('DELETE FROM bookmarks WHERE url = ?').run(url).changes > 0
}

export function isBookmarked(url: string): boolean {
  return !!getDb().prepare('SELECT 1 FROM bookmarks WHERE url = ?').get(url)
}
