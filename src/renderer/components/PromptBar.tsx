import { useState, useRef, useEffect } from 'react'

interface Props {
  onSubmit: (prompt: string) => void
  isLoading: boolean
  error: string | null
  lastResult: string | null
}

export default function PromptBar({ onSubmit, isLoading, error, lastResult }: Props) {
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape' && expanded) {
        setExpanded(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expanded])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSubmit(input.trim())
    setInput('')
  }

  if (!expanded) {
    return (
      <div className="prompt-bar-collapsed" onClick={() => {
        setExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
        </svg>
        <span>Customize this page...</span>
        <kbd>⌘K</kbd>
      </div>
    )
  }

  return (
    <div className="prompt-bar-expanded">
      <form onSubmit={handleSubmit} className="prompt-bar-form">
        <svg className="prompt-bar-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you want to change this page..."
          disabled={isLoading}
          className="prompt-bar-input"
        />
        {isLoading ? (
          <div className="prompt-bar-spinner" />
        ) : (
          <button type="submit" disabled={!input.trim()} className="prompt-bar-submit">
            Generate
          </button>
        )}
        <button type="button" className="prompt-bar-close" onClick={() => setExpanded(false)}>
          Esc
        </button>
      </form>
      {error && <div className="prompt-bar-error">{error}</div>}
      {lastResult && <div className="prompt-bar-success">{lastResult}</div>}
    </div>
  )
}
