import { useState, useEffect, useRef, useMemo } from 'react'

interface Action {
  id: string
  label: string
  shortcut?: string
  category: string
  action: () => void
}

interface Props {
  visible: boolean
  onClose: () => void
  actions: Action[]
}

export default function CommandPalette({ visible, onClose, actions }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return actions
    const q = query.toLowerCase()
    return actions.filter(a =>
      a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    )
  }, [query, actions])

  useEffect(() => {
    if (visible) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [visible])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!visible) return null

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
        onClose()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="command-palette-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          spellCheck={false}
        />
        <div className="command-palette-list">
          {filtered.map((a, i) => (
            <div
              key={a.id}
              className={`command-palette-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => { a.action(); onClose() }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="command-palette-category">{a.category}</span>
              <span className="command-palette-label">{a.label}</span>
              {a.shortcut && <kbd className="command-palette-shortcut">{a.shortcut}</kbd>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="command-palette-empty">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  )
}
