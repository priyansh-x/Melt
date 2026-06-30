import { useState, useEffect } from 'react'
import { HistoryEntry, Bookmark } from '../../shared/history'

interface Props {
  onNavigate: (url: string) => void
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function NewTabPage({ onNavigate }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [recipeCount, setRecipeCount] = useState(0)

  useEffect(() => {
    (window as any).melt.bookmarks.getAll().then((bm: Bookmark[]) => setBookmarks(bm.slice(0, 8)));
    (window as any).melt.history.getRecent(12).then((h: HistoryEntry[]) => {
      const seen = new Set<string>()
      const deduped: HistoryEntry[] = []
      for (const entry of h) {
        try {
          const host = new URL(entry.url).hostname
          if (!seen.has(host)) {
            seen.add(host)
            deduped.push(entry)
          }
        } catch {
          deduped.push(entry)
        }
      }
      setRecentHistory(deduped.slice(0, 8))
    });
    (window as any).melt.recipes.getAll().then((r: any[]) => setRecipeCount(r.length))
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim()) onNavigate(searchInput.trim())
  }

  return (
    <div className="newtab-page">
      <div className="newtab-content">
        <h1 className="newtab-logo">Melt</h1>
        <p className="newtab-greeting">{getGreeting()}</p>
        <form onSubmit={handleSearch} className="newtab-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search or enter URL"
            autoFocus
            spellCheck={false}
          />
        </form>

        <div className="newtab-stats">
          <span>{recipeCount} recipe{recipeCount !== 1 ? 's' : ''}</span>
          <span>{bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}</span>
          <span>⌘⇧P for commands</span>
        </div>

        {bookmarks.length > 0 && (
          <div className="newtab-section">
            <h3>Bookmarks</h3>
            <div className="newtab-grid">
              {bookmarks.map((bm) => (
                <button key={bm.id} className="newtab-tile" onClick={() => onNavigate(bm.url)}>
                  {bm.favicon ? (
                    <img src={bm.favicon} width={20} height={20} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="newtab-tile-letter">{(bm.title || bm.url)[0]?.toUpperCase()}</div>
                  )}
                  <span>{bm.title || new URL(bm.url).hostname}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {recentHistory.length > 0 && (
          <div className="newtab-section">
            <h3>Recently Visited</h3>
            <div className="newtab-grid">
              {recentHistory.map((entry) => {
                let hostname = ''
                try { hostname = new URL(entry.url).hostname } catch {}
                return (
                  <button key={entry.id} className="newtab-tile" onClick={() => onNavigate(entry.url)}>
                    <div className="newtab-tile-letter">{hostname[0]?.toUpperCase() || '?'}</div>
                    <span>{entry.title || hostname}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
