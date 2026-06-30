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

  useEffect(() => {
    window.melt.ai.getApiKey().then((key: string) => {
      if (key) setApiKey(key)
    })
  }, [])

  async function handleSave() {
    await window.melt.ai.setApiKey(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>Settings</h2>
        <button className="recipe-panel-close" onClick={onClose}>×</button>
      </div>
      <div className="recipe-editor">
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
      </div>
    </div>
  )
}
