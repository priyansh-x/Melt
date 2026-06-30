import { useState, useEffect } from 'react'

declare global {
  interface Window {
    melt: any
  }
}

interface Props {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [masked, setMasked] = useState(true)
  const [historyCleared, setHistoryCleared] = useState(false)
  const [recipeCount, setRecipeCount] = useState(0)

  useEffect(() => {
    window.melt.ai.getApiKey().then((key: string) => {
      if (key) setApiKey(key)
    })
    window.melt.recipes.getAll().then((recipes: any[]) => {
      setRecipeCount(recipes.length)
    })
  }, [])

  async function handleSave() {
    await window.melt.ai.setApiKey(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleClearHistory() {
    await window.melt.history.clear()
    setHistoryCleared(true)
    setTimeout(() => setHistoryCleared(false), 2000)
  }

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>Settings</h2>
        <button className="recipe-panel-close" onClick={onClose}>×</button>
      </div>
      <div className="recipe-editor" style={{ gap: 16 }}>
        <div className="recipe-field">
          <label>Claude API Key</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type={masked ? 'password' : 'text'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ flex: 1 }}
            />
            <button
              className="recipe-btn secondary"
              onClick={() => setMasked(!masked)}
              style={{ flexShrink: 0 }}
            >
              {masked ? 'Show' : 'Hide'}
            </button>
          </div>
          <span className="recipe-hint">
            Get your key from console.anthropic.com
          </span>
        </div>
        <div className="recipe-actions">
          {saved && <span style={{ color: '#22c55e', fontSize: 12, alignSelf: 'center' }}>Saved!</span>}
          <button className="recipe-btn primary" onClick={handleSave} disabled={!apiKey}>
            Save Key
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="recipe-field">
            <label>Browsing Data</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="recipe-btn secondary" onClick={handleClearHistory}>
                Clear History
              </button>
              {historyCleared && <span style={{ color: '#22c55e', fontSize: 11 }}>Cleared!</span>}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="recipe-field">
            <label>Stats</label>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>{recipeCount} recipe{recipeCount !== 1 ? 's' : ''} installed</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="recipe-field">
            <label>About</label>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div><strong>Melt Browser</strong> v0.1.0</div>
              <div>AI-first browser with persistent page customization</div>
              <div style={{ marginTop: 4, opacity: 0.6 }}>Built with Electron + React + Claude</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="recipe-field">
            <label>Shortcuts</label>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div><kbd style={{ background: 'var(--hover)', padding: '2px 5px', borderRadius: 3, fontSize: 10 }}>⌘K</kbd> AI prompt bar</div>
              <div><kbd style={{ background: 'var(--hover)', padding: '2px 5px', borderRadius: 3, fontSize: 10 }}>⌘/</kbd> All shortcuts</div>
              <div><kbd style={{ background: 'var(--hover)', padding: '2px 5px', borderRadius: 3, fontSize: 10 }}>⌘F</kbd> Find in page</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
