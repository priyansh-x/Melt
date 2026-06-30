import { useState } from 'react'
import { RecipeCreate } from '../../../shared/recipe'

interface Props {
  currentUrl: string
  onSave: (data: RecipeCreate) => void
  onCancel: () => void
}

export default function RecipeEditor({ currentUrl, onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [urlPattern, setUrlPattern] = useState(() => {
    try {
      const u = new URL(currentUrl)
      return u.hostname + '/*'
    } catch {
      return '*'
    }
  })
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')
  const [activeTab, setActiveTab] = useState<'css' | 'js'>('css')

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      urlPattern,
      css,
      js,
      enabled: true,
    })
  }

  return (
    <div className="recipe-editor">
      <div className="recipe-editor-header">
        <h3>New recipe</h3>
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
        <button className="recipe-btn primary" onClick={handleSave} disabled={!name.trim()}>
          Save recipe
        </button>
      </div>
    </div>
  )
}
