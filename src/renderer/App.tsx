import TitleBar from './components/TitleBar'
import TabStrip from './components/TabStrip'
import SideRail from './components/SideRail'
import { useTabs } from './hooks/useTabs'
import { useState } from 'react'

export default function App() {
  const {
    tabs,
    activeTabId,
    canGoBack,
    canGoForward,
    currentUrl,
    isLoading,
    navigate,
    goBack,
    goForward,
    reload,
    newTab,
    closeTab,
    switchTab,
  } = useTabs()

  const [activeRailItem, setActiveRailItem] = useState('home')

  return (
    <div className="app-shell">
      <SideRail activeItem={activeRailItem} onItemClick={setActiveRailItem} />
      <div className="main-area">
        <TitleBar
          url={currentUrl}
          isLoading={isLoading}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onNavigate={navigate}
          onBack={goBack}
          onForward={goForward}
          onReload={reload}
        />
        <TabStrip
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitch={switchTab}
          onClose={closeTab}
          onNew={() => newTab()}
        />
        {/* BrowserView renders below this chrome, managed by main process */}
      </div>
    </div>
  )
}
