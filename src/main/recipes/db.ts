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
      enabled INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `)

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
    INSERT INTO recipes (id, name, urlPattern, css, js, enabled, createdAt, updatedAt)
    VALUES (@id, @name, @urlPattern, @css, @js, @enabled, @createdAt, @updatedAt)
  `).run(recipe)

  return recipe
}

export function updateRecipe(data: RecipeUpdate): Recipe | null {
  const existing = getDb().prepare('SELECT * FROM recipes WHERE id = ?').get(data.id) as Recipe | undefined
  if (!existing) return null

  const updated = { ...existing, ...data, updatedAt: Date.now() }
  getDb().prepare(`
    UPDATE recipes SET name=@name, urlPattern=@urlPattern, css=@css, js=@js,
    enabled=@enabled, updatedAt=@updatedAt WHERE id=@id
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
