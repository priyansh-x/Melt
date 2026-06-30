import { TabInfo } from '../../shared/ipc'

interface Props {
  tabs: TabInfo[]
  activeTabId: string | null
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
}

export default function TabStrip({ tabs, activeTabId, onSwitch, onClose, onNew }: Props) {
  return (
    <div className="tab-strip">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onSwitch(tab.id)}
          >
            {tab.favicon ? (
              <img className="tab-favicon" src={tab.favicon} alt="" />
            ) : (
              <div className="tab-favicon-placeholder" />
            )}
            <span className="tab-title">{tab.title || 'New Tab'}</span>
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
          </div>
        ))}
      </div>
      <button className="tab-new" onClick={onNew} aria-label="New tab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
