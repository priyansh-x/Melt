import { useState, useEffect, useRef } from 'react'

interface Note {
  id: number
  url: string
  note: string
  createdAt: string
  updatedAt: string
}

interface Props {
  currentUrl: string
  onClose: () => void
}

export default function NotesPanel({ currentUrl, onClose }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadNotes()
  }, [currentUrl])

  async function loadNotes() {
    if (!currentUrl || currentUrl === 'melt://newtab') {
      const all = await (window as any).melt.notes.getAll()
      setNotes(all)
    } else {
      const n = await (window as any).melt.notes.getForUrl(currentUrl)
      setNotes(n)
    }
  }

  async function handleAdd() {
    if (!newNote.trim() || !currentUrl) return
    await (window as any).melt.notes.add(currentUrl, newNote.trim())
    setNewNote('')
    loadNotes()
  }

  async function handleUpdate(id: number) {
    if (!editText.trim()) return
    await (window as any).melt.notes.update(id, editText.trim())
    setEditingId(null)
    loadNotes()
  }

  async function handleDelete(id: number) {
    await (window as any).melt.notes.delete(id)
    loadNotes()
  }

  const isNewTab = !currentUrl || currentUrl === 'melt://newtab'

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>Notes</h2>
        <button className="recipe-panel-close" onClick={onClose}>×</button>
      </div>

      {!isNewTab && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Add a note for this page..."
            style={{
              width: '100%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-primary)',
              padding: '8px',
              fontSize: 12,
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 60,
              outline: 'none',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd()
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="recipe-btn primary" onClick={handleAdd} disabled={!newNote.trim()} style={{ fontSize: 11, padding: '4px 10px' }}>
              Add Note
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {isNewTab && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>All notes across pages</div>}
        {notes.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
            {isNewTab ? 'No notes yet' : 'No notes for this page'}
          </div>
        )}
        {notes.map(n => (
          <div key={n.id} style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 6,
            marginBottom: 6,
            border: '1px solid var(--border)',
          }}>
            {editingId === n.id ? (
              <>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 4, color: 'var(--text-primary)', padding: 6, fontSize: 12,
                    fontFamily: 'inherit', resize: 'vertical', minHeight: 40, outline: 'none',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                  <button className="recipe-btn secondary" onClick={() => setEditingId(null)} style={{ fontSize: 10, padding: '2px 8px' }}>Cancel</button>
                  <button className="recipe-btn primary" onClick={() => handleUpdate(n.id)} style={{ fontSize: 10, padding: '2px 8px' }}>Save</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{n.note}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {isNewTab && <span style={{ color: 'var(--accent)' }}>{(() => { try { return new URL(n.url).hostname } catch { return n.url } })()} · </span>}
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="recipe-btn secondary" onClick={() => { setEditingId(n.id); setEditText(n.note) }} style={{ fontSize: 10, padding: '2px 6px' }}>Edit</button>
                    <button className="recipe-btn secondary" onClick={() => handleDelete(n.id)} style={{ fontSize: 10, padding: '2px 6px', color: '#ef4444' }}>Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
