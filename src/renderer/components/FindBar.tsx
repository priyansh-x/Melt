import { useState, useRef, useEffect } from 'react'

interface Props {
  onFind: (text: string) => void
  onFindNext: () => void
  onFindPrev: () => void
  onClose: () => void
  visible: boolean
}

export default function FindBar({ onFind, onFindNext, onFindPrev, onClose, visible }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [visible])

  if (!visible) return null

  function handleChange(val: string) {
    setQuery(val)
    onFind(val)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.shiftKey ? onFindPrev() : onFindNext()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="find-bar">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in page..."
        className="find-bar-input"
        spellCheck={false}
      />
      <button className="find-bar-btn" onClick={onFindPrev} aria-label="Previous">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
      </button>
      <button className="find-bar-btn" onClick={onFindNext} aria-label="Next">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <button className="find-bar-btn" onClick={onClose} aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  )
}
