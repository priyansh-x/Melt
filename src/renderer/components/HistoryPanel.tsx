import { useState, useEffect } from 'react'
import { HistoryEntry } from '../../shared/history'

interface Props {
  onNavigate: (url: string) => void
  onClose: () => void
}

export default function HistoryPanel({ onNavigate, onClose }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const data = await (window as any).melt.history.getRecent(200)
    setEntries(data)
  }

  async function handleSearch(q: string) {
    setSearch(q)
    if (q.trim()) {
      const results = await (window as any).melt.history.search(q)
      setEntries(results)
    } else {
      loadHistory()
    }
  }

  async function handleClear() {
    await (window as any).melt.history.clear()
    setEntries([])
  }

  function groupByDate(items: HistoryEntry[]): Map<string, HistoryEntry[]> {
    const groups = new Map<string, HistoryEntry[]>()
    for (const entry of items) {
      const date = new Date(entry.visitedAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
      })
      if (!groups.has(date)) groups.set(date, [])
      groups.get(date)!.push(entry)
    }
    return groups
  }

  const grouped = groupByDate(entries)

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>History</h2>
        <button className="recipe-panel-close" onClick={onClose}>×</button>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <input
          className="find-bar-input"
          style={{ width: '100%' }}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search history..."
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {entries.length === 0 ? (
          <div className="recipe-empty">No history yet</div>
        ) : (
          Array.from(grouped.entries()).map(([date, items]) => (
            <div key={date}>
              <div style={{ fontSize: 11, color: '#666', padding: '10px 0 4px', fontWeight: 500 }}>{date}</div>
              {items.map((entry) => (
                <div
                  key={entry.id}
                  className="recipe-item"
                  onClick={() => onNavigate(entry.url)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="recipe-info">
                    <span className="recipe-name">{entry.title || entry.url}</span>
                    <span className="recipe-pattern">{entry.url}</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#555', flexShrink: 0 }}>
                    {new Date(entry.visitedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      {entries.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
          <button className="recipe-btn secondary" onClick={handleClear} style={{ width: '100%' }}>
            Clear History
          </button>
        </div>
      )}
    </div>
  )
}
