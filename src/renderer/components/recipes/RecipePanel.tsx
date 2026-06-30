import { useState } from 'react'
import { Recipe, RecipeCreate } from '../../../shared/recipe'
import RecipeList from './RecipeList'
import RecipeEditor from './RecipeEditor'

interface Props {
  allRecipes: Recipe[]
  activeRecipes: Recipe[]
  currentUrl: string
  onCreateRecipe: (data: RecipeCreate) => void
  onToggleRecipe: (id: string) => void
  onDeleteRecipe: (id: string) => void
  onClose: () => void
}

export default function RecipePanel({
  allRecipes,
  activeRecipes,
  currentUrl,
  onCreateRecipe,
  onToggleRecipe,
  onDeleteRecipe,
  onClose,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  async function handleExport() {
    const result = await (window as any).melt.recipes.export()
    if (result.success) {
      setStatusMsg(`Exported ${result.count} recipe(s)`)
      setTimeout(() => setStatusMsg(null), 3000)
    }
  }

  async function handleImport() {
    const result = await (window as any).melt.recipes.import()
    if (result.success) {
      setStatusMsg(`Imported ${result.count} recipe(s)`)
      setTimeout(() => setStatusMsg(null), 3000)
    } else if (result.error) {
      setStatusMsg(`Error: ${result.error}`)
      setTimeout(() => setStatusMsg(null), 3000)
    }
  }

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>Recipes</h2>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button className="ai-sidebar-btn" onClick={handleImport} title="Import recipes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          </button>
          <button className="ai-sidebar-btn" onClick={handleExport} title="Export recipes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          </button>
          <button className="recipe-panel-close" onClick={onClose}>×</button>
        </div>
      </div>
      {statusMsg && (
        <div style={{ padding: '6px 12px', fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid var(--border)' }}>
          {statusMsg}
        </div>
      )}
      {isEditing ? (
        <RecipeEditor
          currentUrl={currentUrl}
          onSave={(data) => {
            onCreateRecipe(data)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <RecipeList
          recipes={allRecipes}
          activeRecipes={activeRecipes}
          onToggle={onToggleRecipe}
          onDelete={onDeleteRecipe}
          onNew={() => setIsEditing(true)}
        />
      )}
    </div>
  )
}
