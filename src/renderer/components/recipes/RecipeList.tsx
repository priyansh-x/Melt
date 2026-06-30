import { Recipe } from '../../../shared/recipe'

interface Props {
  recipes: Recipe[]
  activeRecipes: Recipe[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export default function RecipeList({ recipes, activeRecipes, onToggle, onDelete, onNew }: Props) {
  const activeIds = new Set(activeRecipes.map((r) => r.id))

  return (
    <div className="recipe-list">
      <div className="recipe-list-header">
        <h3>Recipes</h3>
        <button className="recipe-new-btn" onClick={onNew}>+ New</button>
      </div>

      {recipes.length === 0 ? (
        <div className="recipe-empty">
          <p>No recipes yet</p>
          <p className="recipe-hint">Create one to customize any website</p>
        </div>
      ) : (
        <div className="recipe-items">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-item">
              <button
                className={`recipe-toggle ${recipe.enabled ? 'on' : 'off'}`}
                onClick={() => onToggle(recipe.id)}
              >
                <div className="recipe-dot" />
              </button>
              <div className="recipe-info">
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
