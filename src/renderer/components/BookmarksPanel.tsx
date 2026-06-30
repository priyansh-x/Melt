import { useState, useEffect } from 'react'
import { Bookmark } from '../../shared/history'

interface Props {
  onNavigate: (url: string) => void
  onClose: () => void
}

export default function BookmarksPanel({ onNavigate, onClose }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    loadBookmarks()
  }, [])

  async function loadBookmarks() {
    const data = await (window as any).melt.bookmarks.getAll()
    setBookmarks(data)
  }

  async function handleRemove(url: string) {
    await (window as any).melt.bookmarks.remove(url)
    await loadBookmarks()
  }

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>Bookmarks</h2>
        <button className="recipe-panel-close" onClick={onClose}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {bookmarks.length === 0 ? (
          <div className="recipe-empty">
            <p>No bookmarks yet</p>
            <p className="recipe-hint">Click the bookmark icon in the URL bar to save pages</p>
          </div>
        ) : (
          <div className="recipe-items">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="recipe-item" style={{ cursor: 'pointer' }}>
                <div
                  className="recipe-info"
                  onClick={() => onNavigate(bm.url)}
                >
                  {bm.favicon && (
                    <img
                      src={bm.favicon}
                      width={14}
                      height={14}
                      style={{ borderRadius: 2, marginBottom: 2 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  <span className="recipe-name">{bm.title || bm.url}</span>
                  <span className="recipe-pattern">{bm.url}</span>
                </div>
                <button className="recipe-delete" onClick={() => handleRemove(bm.url)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
