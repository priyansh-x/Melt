import { useState } from 'react'
import { Recipe } from '../../../shared/recipe'

interface Props {
  recipes: Recipe[]
  activeRecipes: Recipe[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (recipe: Recipe) => void
  onNew: () => void
}

export default function RecipeList({ recipes, activeRecipes, onToggle, onDelete, onEdit, onNew }: Props) {
  const [search, setSearch] = useState('')
  const activeIds = new Set(activeRecipes.map((r) => r.id))

  const filtered = search.trim()
    ? recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.urlPattern.toLowerCase().includes(search.toLowerCase())
      )
    : recipes

  return (
    <div className="recipe-list">
      <div className="recipe-list-header">
        <h3>{recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}</h3>
        <button className="recipe-new-btn" onClick={onNew}>+ New</button>
      </div>

      {recipes.length > 3 && (
        <div style={{ padding: '0 0 8px' }}>
          <input
            className="find-bar-input"
            style={{ width: '100%' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter recipes..."
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="recipe-empty">
          {recipes.length === 0 ? (
            <>
              <p>No recipes yet</p>
              <p className="recipe-hint">Create one to customize any website</p>
            </>
          ) : (
            <p>No matching recipes</p>
          )}
        </div>
      ) : (
        <div className="recipe-items">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="recipe-item">
              <button
                className={`recipe-toggle ${recipe.enabled ? 'on' : 'off'}`}
                onClick={() => onToggle(recipe.id)}
              >
                <div className="recipe-dot" />
              </button>
              <div className="recipe-info" onClick={() => onEdit(recipe)} style={{ cursor: 'pointer' }}>
                <span className="recipe-name">{recipe.name}</span>
                <span className="recipe-pattern">{recipe.urlPattern}</span>
              </div>
              {activeIds.has(recipe.id) && (
                <span className="recipe-active-badge">active</span>
              )}
              <button className="recipe-delete" onClick={() => onDelete(recipe.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
