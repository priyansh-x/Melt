import { useState, useRef, useEffect, KeyboardEvent, RefObject } from 'react'

interface Suggestion {
  url: string
  title: string
  type: 'history' | 'bookmark'
}

interface Props {
  url: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  onNavigate: (url: string) => void
  onBack: () => void
  onForward: () => void
  onReload: () => void
  onBookmarkToggle: () => void
  isBookmarked: boolean
  onVisualEditToggle: () => void
  isVisualEditActive: boolean
  urlBarRef?: RefObject<HTMLInputElement | null>
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export default function TitleBar({
  url,
  isLoading,
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onBookmarkToggle,
  isBookmarked,
  onVisualEditToggle,
  isVisualEditActive,
  urlBarRef,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: Props) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const fallbackRef = useRef<HTMLInputElement>(null)
  const inputRef = urlBarRef || fallbackRef
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const displayValue = isFocused ? inputValue : url

  function handleFocus() {
    setIsFocused(true)
    setInputValue(url)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setTimeout(() => {
      setIsFocused(false)
      setSuggestions([])
      setSelectedIndex(-1)
    }, 150)
  }

  async function fetchSuggestions(query: string) {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }
    try {
      const [historyResults, bookmarks] = await Promise.all([
        (window as any).melt.history.search(query),
        (window as any).melt.bookmarks.getAll(),
      ])
      const seen = new Set<string>()
      const results: Suggestion[] = []

      // Bookmarks first
      for (const bm of bookmarks) {
        if (bm.url.includes(query) || bm.title?.toLowerCase().includes(query.toLowerCase())) {
          if (!seen.has(bm.url)) {
            seen.add(bm.url)
            results.push({ url: bm.url, title: bm.title, type: 'bookmark' })
          }
        }
      }

      // Then history
      for (const h of historyResults.slice(0, 8)) {
        if (!seen.has(h.url)) {
          seen.add(h.url)
          results.push({ url: h.url, title: h.title, type: 'history' })
        }
      }

      setSuggestions(results.slice(0, 8))
      setSelectedIndex(-1)
    } catch {}
  }

  function handleChange(val: string) {
    setInputValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 120)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onNavigate(suggestions[selectedIndex].url)
      } else {
        onNavigate(inputValue)
      }
      inputRef.current?.blur()
      setSuggestions([])
    } else if (e.key === 'Escape') {
      setSuggestions([])
      inputRef.current?.blur()
    }
  }

  return (
    <div className="title-bar">
      <div className="drag-spacer" />

      <div className="nav-buttons">
        <button className="nav-btn" onClick={onBack} disabled={!canGoBack} aria-label="Go back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button className="nav-btn" onClick={onForward} disabled={!canGoForward} aria-label="Go forward">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button className="nav-btn" onClick={onReload} aria-label="Reload">
          {isLoading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          )}
        </button>
      </div>

      <div className={`url-bar ${isFocused ? 'focused' : ''}`} style={{ position: 'relative' }}>
        <svg className="url-bar-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          className="url-input"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter URL"
          spellCheck={false}
        />
        {suggestions.length > 0 && isFocused && (
          <div className="url-suggestions">
            {suggestions.map((s, i) => (
              <div
                key={s.url}
                className={`url-suggestion ${i === selectedIndex ? 'selected' : ''}`}
                onMouseDown={() => {
                  onNavigate(s.url)
                  setSuggestions([])
                }}
              >
                <span className="url-suggestion-icon">
                  {s.type === 'bookmark' ? '★' : '↗'}
                </span>
                <div className="url-suggestion-text">
                  <span className="url-suggestion-title">{s.title || s.url}</span>
                  <span className="url-suggestion-url">{s.url}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {zoomLevel !== 0 && (
        <div className="zoom-controls">
          <button className="nav-btn" onClick={onZoomOut} title="Zoom out">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
          </button>
          <button className="zoom-level" onClick={onZoomReset} title="Reset zoom">
            {Math.round((1 + zoomLevel * 0.1) * 100)}%
          </button>
          <button className="nav-btn" onClick={onZoomIn} title="Zoom in">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      )}

      <button
        className={`nav-btn visual-edit-btn ${isVisualEditActive ? 'active' : ''}`}
        onClick={onVisualEditToggle}
        aria-label={isVisualEditActive ? 'Exit Visual Edit' : 'Visual Edit Mode'}
        title={isVisualEditActive ? 'Exit Visual Edit (Esc)' : 'Visual Edit Mode'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {isVisualEditActive ? (
            <>
              <path d="M18 6L6 18M6 6l12 12" />
            </>
          ) : (
            <>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </>
          )}
        </svg>
      </button>

      <button
        className={`nav-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
        onClick={onBookmarkToggle}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
        </svg>
      </button>

      {isLoading && <div className="loading-bar" />}
    </div>
  )
}
