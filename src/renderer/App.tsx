import { useCallback, useRef, useMemo } from 'react'
import TitleBar from './components/TitleBar'
import TabStrip from './components/TabStrip'
import SideRail from './components/SideRail'
import WebviewPanel from './components/WebviewPanel'
import { useTabs } from './hooks/useTabs'
import { useShortcuts } from './hooks/useShortcuts'

export default function App() {
  const { tabs, activeTabId, activeTab, newTab, closeTab, switchTab, updateTab } = useTabs()
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const urlBarRef = useRef<HTMLInputElement>(null)

  const getActiveWebview = useCallback((): Electron.WebviewTag | null => {
    const container = containerRefs.current.get(activeTabId)
    return container?.querySelector('webview') as Electron.WebviewTag | null
  }, [activeTabId])

  function handleNavigate(input: string) {
    const wv = getActiveWebview()
    if (!wv) return

    let url = input
    if (!/^https?:\/\//i.test(input) && !input.startsWith('file://')) {
      if (input.includes('.') && !input.includes(' ')) {
        url = 'https://' + input
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(input)}`
      }
    }

    wv.loadURL(url)
  }

  function handleBack() {
    const wv = getActiveWebview()
    if (wv?.canGoBack()) wv.goBack()
  }

  function handleForward() {
    const wv = getActiveWebview()
    if (wv?.canGoForward()) wv.goForward()
  }

  function handleReload() {
    getActiveWebview()?.reload()
  }

  const shortcuts = useMemo(() => ({
    newTab: () => newTab(),
    closeTab: () => { if (activeTabId) closeTab(activeTabId) },
    reload: handleReload,
    goBack: handleBack,
    goForward: handleForward,
    focusUrl: () => urlBarRef.current?.focus(),
    nextTab: () => {
      const idx = tabs.findIndex((t) => t.id === activeTabId)
      if (idx < tabs.length - 1) switchTab(tabs[idx + 1].id)
    },
    prevTab: () => {
      const idx = tabs.findIndex((t) => t.id === activeTabId)
      if (idx > 0) switchTab(tabs[idx - 1].id)
    },
    zoomIn: () => {
      const wv = getActiveWebview()
      if (wv) wv.setZoomLevel(wv.getZoomLevel() + 0.5)
    },
    zoomOut: () => {
      const wv = getActiveWebview()
      if (wv) wv.setZoomLevel(wv.getZoomLevel() - 0.5)
    },
    zoomReset: () => {
      getActiveWebview()?.setZoomLevel(0)
    },
  }), [tabs, activeTabId, newTab, closeTab, switchTab, getActiveWebview])

  useShortcuts(shortcuts)

  return (
    <div className="app-shell">
      <SideRail />
      <div className="main-area">
        <TitleBar
          url={activeTab?.url || ''}
          isLoading={activeTab?.isLoading || false}
          canGoBack={activeTab?.canGoBack || false}
          canGoForward={activeTab?.canGoForward || false}
          onNavigate={handleNavigate}
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
          urlBarRef={urlBarRef}
        />
        <TabStrip
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitch={switchTab}
          onClose={closeTab}
          onNew={() => newTab()}
        />
        <div className="webview-container">
          {tabs.map((tab) => (
            <WebviewPanel
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onUpdate={updateTab}
              ref={(el) => {
                if (el) containerRefs.current.set(tab.id, el)
                else containerRefs.current.delete(tab.id)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
