import { useState, useEffect, useCallback } from 'react'
import { TabInfo } from '../../shared/ipc'

export function useTabs() {
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const { melt } = window

    melt.onTabList((tabList, activeId) => {
      setTabs(tabList)
      setActiveTabId(activeId)
    })

    melt.onActiveTab((tabId) => {
      setActiveTabId(tabId)
    })

    melt.onUrlUpdated((tabId, url) => {
      setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, url } : t)))
      setCurrentUrl(url)
    })

    melt.onTitleUpdated((tabId, title) => {
      setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, title } : t)))
    })

    melt.onFaviconUpdated((tabId, favicon) => {
      setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, favicon } : t)))
    })

    melt.onLoadingChanged((tabId, loading) => {
      setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, isLoading: loading } : t)))
      setIsLoading(loading)
    })

    melt.onCanGoBack((can) => setCanGoBack(can))
    melt.onCanGoForward((can) => setCanGoForward(can))

    melt.newTab()
  }, [])

  const navigate = useCallback((url: string) => window.melt.navigate(url), [])
  const goBack = useCallback(() => window.melt.goBack(), [])
  const goForward = useCallback(() => window.melt.goForward(), [])
  const reload = useCallback(() => window.melt.reload(), [])
  const newTab = useCallback((url?: string) => window.melt.newTab(url), [])
  const closeTab = useCallback((id: string) => window.melt.closeTab(id), [])
  const switchTab = useCallback((id: string) => window.melt.switchTab(id), [])

  return {
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
  }
}
