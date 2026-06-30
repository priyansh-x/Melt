import { useState, useEffect } from 'react'
import { Recipe, RecipeCreate } from '../../../shared/recipe'

interface Props {
  currentUrl: string
  existingRecipe?: Recipe
  onSave: (data: RecipeCreate) => void
  onUpdate?: (id: string, data: Partial<RecipeCreate>) => void
  onCancel: () => void
}

export default function RecipeEditor({ currentUrl, existingRecipe, onSave, onUpdate, onCancel }: Props) {
  const isEditing = !!existingRecipe
  const [name, setName] = useState(existingRecipe?.name || '')
  const [urlPattern, setUrlPattern] = useState(existingRecipe?.urlPattern || (() => {
    try { return new URL(currentUrl).hostname + '/*' } catch { return '*' }
  }))
  const [css, setCss] = useState(existingRecipe?.css || '')
  const [js, setJs] = useState(existingRecipe?.js || '')
  const [activeTab, setActiveTab] = useState<'css' | 'js'>('css')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (showHistory && existingRecipe) {
      (window as any).melt.recipes.getHistory(existingRecipe.id).then(setHistory)
    }
  }, [showHistory, existingRecipe])

  async function handleRestore(historyId: number) {
    if (!existingRecipe) return
    const restored = await (window as any).melt.recipes.restoreVersion(existingRecipe.id, historyId)
    if (restored) {
      setName(restored.name)
      setUrlPattern(restored.urlPattern)
      setCss(restored.css)
      setJs(restored.js)
      setShowHistory(false)
    }
  }

  function handleSave() {
    if (!name.trim()) return
    if (isEditing && onUpdate && existingRecipe) {
      onUpdate(existingRecipe.id, {
        name: name.trim(),
        urlPattern,
        css,
        js,
        domActions: existingRecipe.domActions || '[]',
      })
    } else {
      onSave({
        name: name.trim(),
        urlPattern,
        css,
        js,
        domActions: '[]',
        enabled: true,
      })
    }
  }

  return (
    <div className="recipe-editor">
      <div className="recipe-editor-header">
        <h3>{isEditing ? 'Edit recipe' : 'New recipe'}</h3>
        <button className="recipe-editor-close" onClick={onCancel}>×</button>
      </div>

      <div className="recipe-field">
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dark mode for Reddit"
          autoFocus
        />
      </div>

      <div className="recipe-field">
        <label>URL pattern</label>
        <input
          value={urlPattern}
          onChange={(e) => setUrlPattern(e.target.value)}
          placeholder="reddit.com/*"
        />
        <span className="recipe-hint">Use * as wildcard. e.g. github.com/*/issues</span>
      </div>

      <div className="recipe-tabs">
        <button
          className={`recipe-tab ${activeTab === 'css' ? 'active' : ''}`}
          onClick={() => setActiveTab('css')}
        >
          CSS
        </button>
        <button
          className={`recipe-tab ${activeTab === 'js' ? 'active' : ''}`}
          onClick={() => setActiveTab('js')}
        >
          JavaScript
        </button>
      </div>

      {activeTab === 'css' ? (
        <textarea
          className="recipe-code"
          value={css}
          onChange={(e) => setCss(e.target.value)}
          placeholder="body { background: #1a1a1a !important; color: #e0e0e0 !important; }"
          spellCheck={false}
        />
      ) : (
        <textarea
          className="recipe-code"
          value={js}
          onChange={(e) => setJs(e.target.value)}
          placeholder="// Runs after page load&#10;document.querySelectorAll('.ad').forEach(el => el.remove())"
          spellCheck={false}
        />
      )}

      <div className="recipe-actions">
        <button className="recipe-btn secondary" onClick={onCancel}>Cancel</button>
        {isEditing && (
          <button className="recipe-btn secondary" onClick={() => setShowHistory(!showHistory)}>
            History
          </button>
        )}
        <button className="recipe-btn primary" onClick={handleSave} disabled={!name.trim()}>
          {isEditing ? 'Update recipe' : 'Save recipe'}
        </button>
      </div>
      {showHistory && (
        <div className="recipe-history">
          <h4 style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-secondary)' }}>Version History</h4>
          {history.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No previous versions</div>
          ) : (
            history.map(h => (
              <div key={h.id} className="recipe-history-item">
                <span>{new Date(h.savedAt).toLocaleString()}</span>
                <button className="recipe-btn secondary" onClick={() => handleRestore(h.id)} style={{ fontSize: 10, padding: '2px 6px' }}>
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
