import { useState, useMemo } from 'react'
import { Recipe, RecipeCreate } from '../../../shared/recipe'
import RecipeList from './RecipeList'
import RecipeEditor from './RecipeEditor'
import RecipeTemplates from './RecipeTemplates'

interface Props {
  allRecipes: Recipe[]
  activeRecipes: Recipe[]
  currentUrl: string
  onCreateRecipe: (data: RecipeCreate) => void
  onUpdateRecipe: (id: string, data: Partial<RecipeCreate>) => void
  onToggleRecipe: (id: string) => void
  onDeleteRecipe: (id: string) => void
  onClose: () => void
}

type Tab = 'list' | 'editor' | 'templates'

export default function RecipePanel({
  allRecipes,
  activeRecipes,
  currentUrl,
  onCreateRecipe,
  onUpdateRecipe,
  onToggleRecipe,
  onDeleteRecipe,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('list')
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>()
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const installedNames = useMemo(() => new Set(allRecipes.map(r => r.name)), [allRecipes])

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

      <div className="recipe-tabs" style={{ margin: '8px 12px 0' }}>
        <button className={`recipe-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => { setTab('list'); setEditingRecipe(undefined) }}>
          My Recipes
        </button>
        <button className={`recipe-tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
          Templates
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '6px 12px', fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid var(--border)' }}>
          {statusMsg}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'editor' ? (
          <RecipeEditor
            currentUrl={currentUrl}
            existingRecipe={editingRecipe}
            onSave={(data) => {
              onCreateRecipe(data)
              setTab('list')
              setEditingRecipe(undefined)
            }}
            onUpdate={(id, data) => {
              onUpdateRecipe(id, data)
              setTab('list')
              setEditingRecipe(undefined)
            }}
            onCancel={() => { setTab('list'); setEditingRecipe(undefined) }}
          />
        ) : tab === 'templates' ? (
          <RecipeTemplates
            onInstall={(data) => {
              onCreateRecipe(data)
              setStatusMsg('Recipe installed!')
              setTimeout(() => setStatusMsg(null), 2000)
            }}
            installedNames={installedNames}
          />
        ) : (
          <RecipeList
            recipes={allRecipes}
            activeRecipes={activeRecipes}
            onToggle={onToggleRecipe}
            onDelete={onDeleteRecipe}
            onEdit={(recipe) => { setEditingRecipe(recipe); setTab('editor') }}
            onNew={() => { setEditingRecipe(undefined); setTab('editor') }}
          />
        )}
      </div>
    </div>
  )
}
