import { useState, useRef } from 'react'
import { TabData, TabGroup } from '../../shared/ipc'

interface Props {
  tabs: TabData[]
  activeTabId: string
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
  onPin?: (id: string) => void
  onDuplicate?: (id: string) => void
  onMute?: (id: string) => void
  onSplitView?: (id: string) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  mutedTabs?: Set<string>
  tabGroups?: TabGroup[]
}

export default function TabStrip({ tabs, activeTabId, onSwitch, onClose, onNew, onPin, onDuplicate, onMute, onSplitView, onReorder, mutedTabs, tabGroups }: Props) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null)
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleContextMenu(e: React.MouseEvent, tabId: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  function closeContextMenu() {
    setContextMenu(null)
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    dragIndex.current = index
    e.dataTransfer.effectAllowed = 'move'
    ;(e.target as HTMLElement).style.opacity = '0.4'
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  function handleDragEnd(e: React.DragEvent) {
    ;(e.target as HTMLElement).style.opacity = '1'
    if (dragIndex.current !== null && dragOverIndex !== null && dragIndex.current !== dragOverIndex) {
      onReorder?.(dragIndex.current, dragOverIndex)
    }
    dragIndex.current = null
    setDragOverIndex(null)
  }

  const contextTab = contextMenu ? tabs.find(t => t.id === contextMenu.tabId) : null

  return (
    <div className="tab-strip">
      <div className="tab-list">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isPinned ? 'pinned' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
            onClick={() => onSwitch(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={() => setDragOverIndex(null)}
            style={tab.groupId ? { borderTop: `2px solid ${tabGroups?.find(g => g.id === tab.groupId)?.color || 'transparent'}` } : undefined}
          >
            {tab.favicon ? (
              <img className="tab-favicon" src={tab.favicon} alt="" />
            ) : (
              <div className="tab-favicon-placeholder" />
            )}
            {mutedTabs?.has(tab.id) && <span className="tab-muted-icon" title="Muted">🔇</span>}
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
            {onSplitView && (
              <button onClick={() => { onSplitView(contextMenu.tabId); closeContextMenu() }}>
                Open in Split View
              </button>
            )}
            {onMute && (
              <button onClick={() => { onMute(contextMenu.tabId); closeContextMenu() }}>
                {mutedTabs?.has(contextMenu.tabId) ? 'Unmute Tab' : 'Mute Tab'}
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
