interface Props {
  onClose: () => void
}

const SHORTCUTS = [
  { category: 'Navigation', items: [
    { keys: '⌘L', action: 'Focus URL bar' },
    { keys: '⌘R', action: 'Reload page' },
    { keys: '⌘[', action: 'Go back' },
    { keys: '⌘]', action: 'Go forward' },
  ]},
  { category: 'Tabs', items: [
    { keys: '⌘T', action: 'New tab' },
    { keys: '⌘W', action: 'Close tab' },
    { keys: '⌘⇧]', action: 'Next tab' },
    { keys: '⌘⇧[', action: 'Previous tab' },
  ]},
  { category: 'View', items: [
    { keys: '⌘+', action: 'Zoom in' },
    { keys: '⌘-', action: 'Zoom out' },
    { keys: '⌘0', action: 'Reset zoom' },
    { keys: '⌘F', action: 'Find in page' },
  ]},
  { category: 'Melt', items: [
    { keys: '⌘K', action: 'AI prompt bar' },
    { keys: '⌘⌥I', action: 'Toggle DevTools' },
    { keys: '⌘/', action: 'Keyboard shortcuts' },
  ]},
]

export default function ShortcutsOverlay({ onClose }: Props) {
  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="shortcuts-grid">
          {SHORTCUTS.map(({ category, items }) => (
            <div key={category} className="shortcuts-section">
              <h3>{category}</h3>
              {items.map(({ keys, action }) => (
                <div key={keys} className="shortcut-row">
                  <span className="shortcut-action">{action}</span>
                  <kbd className="shortcut-keys">{keys}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
