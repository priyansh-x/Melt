import { useState } from 'react'
import { TabData } from '../../shared/ipc'

interface Props {
  tabs: TabData[]
  activeTabId: string
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
  onPin?: (id: string) => void
  onDuplicate?: (id: string) => void
}

export default function TabStrip({ tabs, activeTabId, onSwitch, onClose, onNew, onPin, onDuplicate }: Props) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null)

  function handleContextMenu(e: React.MouseEvent, tabId: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  function closeContextMenu() {
    setContextMenu(null)
  }

  const contextTab = contextMenu ? tabs.find(t => t.id === contextMenu.tabId) : null

  return (
    <div className="tab-strip">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isPinned ? 'pinned' : ''}`}
            onClick={() => onSwitch(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
          >
            {tab.favicon ? (
              <img className="tab-favicon" src={tab.favicon} alt="" />
            ) : (
              <div className="tab-favicon-placeholder" />
            )}
            {!tab.isPinned && <span className="tab-title">{tab.title || 'New Tab'}</span>}
            {!tab.isPinned && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(tab.id)
                }}
                aria-label="Close tab"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="tab-new" onClick={onNew} aria-label="New tab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={closeContextMenu}
          />
          <div
            className="tab-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {onPin && (
              <button onClick={() => { onPin(contextMenu.tabId); closeContextMenu() }}>
                {contextTab?.isPinned ? 'Unpin Tab' : 'Pin Tab'}
              </button>
            )}
            {onDuplicate && (
              <button onClick={() => { onDuplicate(contextMenu.tabId); closeContextMenu() }}>
                Duplicate Tab
              </button>
            )}
            <button onClick={() => { onClose(contextMenu.tabId); closeContextMenu() }}>
              Close Tab
            </button>
          </div>
        </>
      )}
    </div>
  )
}
