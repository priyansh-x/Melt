import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { Recipe, RecipeCreate, RecipeUpdate } from '../../shared/recipe'
import { randomUUID } from 'crypto'

let db: Database.Database

function getDb(): Database.Database {
  if (db) return db

  const dbPath = path.join(app.getPath('userData'), 'recipes.db')
  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      urlPattern TEXT NOT NULL,
      css TEXT DEFAULT '',
      js TEXT DEFAULT '',
      domActions TEXT DEFAULT '[]',
      enabled INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS recipe_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId TEXT NOT NULL,
      name TEXT NOT NULL,
      urlPattern TEXT NOT NULL,
      css TEXT DEFAULT '',
      js TEXT DEFAULT '',
      domActions TEXT DEFAULT '[]',
      savedAt INTEGER NOT NULL
    )
  `)

  // Migration: add domActions column if missing
  try {
    db.prepare("SELECT domActions FROM recipes LIMIT 1").get()
  } catch {
    db.exec("ALTER TABLE recipes ADD COLUMN domActions TEXT DEFAULT '[]'")
  }

  return db
}

export function getAllRecipes(): Recipe[] {
  return getDb().prepare('SELECT * FROM recipes ORDER BY createdAt DESC').all() as Recipe[]
}

export function getRecipesForUrl(url: string): Recipe[] {
  const all = getAllRecipes()
  return all.filter((r) => r.enabled && matchesUrl(r.urlPattern, url))
}

export function createRecipe(data: RecipeCreate): Recipe {
  const now = Date.now()
  const recipe: Recipe = {
    id: randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  getDb().prepare(`
    INSERT INTO recipes (id, name, urlPattern, css, js, domActions, enabled, createdAt, updatedAt)
    VALUES (@id, @name, @urlPattern, @css, @js, @domActions, @createdAt, @updatedAt)
  `).run(recipe)

  return recipe
}

export function getRecipeHistory(recipeId: string): any[] {
  return getDb().prepare('SELECT * FROM recipe_history WHERE recipeId = ? ORDER BY savedAt DESC LIMIT 20').all(recipeId)
}

export function restoreRecipeVersion(recipeId: string, historyId: number): Recipe | null {
  const version = getDb().prepare('SELECT * FROM recipe_history WHERE id = ? AND recipeId = ?').get(historyId, recipeId) as any
  if (!version) return null
  return updateRecipe({ id: recipeId, name: version.name, urlPattern: version.urlPattern, css: version.css, js: version.js, domActions: version.domActions })
}

export function updateRecipe(data: RecipeUpdate): Recipe | null {
  const existing = getDb().prepare('SELECT * FROM recipes WHERE id = ?').get(data.id) as Recipe | undefined
  if (!existing) return null

  getDb().prepare(`
    INSERT INTO recipe_history (recipeId, name, urlPattern, css, js, domActions, savedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(existing.id, existing.name, existing.urlPattern, existing.css, existing.js, existing.domActions, Date.now())

  const updated = { ...existing, ...data, updatedAt: Date.now() }
  getDb().prepare(`
    UPDATE recipes SET name=@name, urlPattern=@urlPattern, css=@css, js=@js,
    domActions=@domActions, enabled=@enabled, updatedAt=@updatedAt WHERE id=@id
  `).run(updated)

  return updated
}

export function deleteRecipe(id: string): boolean {
  const result = getDb().prepare('DELETE FROM recipes WHERE id = ?').run(id)
  return result.changes > 0
}

export function toggleRecipe(id: string): Recipe | null {
  const existing = getDb().prepare('SELECT * FROM recipes WHERE id = ?').get(id) as Recipe | undefined
  if (!existing) return null
  return updateRecipe({ id, enabled: existing.enabled ? 0 as any : 1 as any })
}

function matchesUrl(pattern: string, url: string): boolean {
  if (pattern === '*') return true

  try {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
    return new RegExp(`^https?://(www\\.)?${escaped}`, 'i').test(url)
  } catch {
    return url.includes(pattern)
  }
}
