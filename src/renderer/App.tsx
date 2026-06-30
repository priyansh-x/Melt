import { useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar'
import TabStrip from './components/TabStrip'
import SideRail from './components/SideRail'
import WebviewPanel from './components/WebviewPanel'
import { useTabs } from './hooks/useTabs'

export default function App() {
  const { tabs, activeTabId, activeTab, newTab, closeTab, switchTab, updateTab } = useTabs()
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map())

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
