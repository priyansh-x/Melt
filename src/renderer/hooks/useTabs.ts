import { useState, useCallback } from 'react'
import { TabData } from '../../shared/ipc'

let tabCounter = 0

function createTab(url = 'melt://newtab'): TabData {
  return {
    id: `tab-${++tabCounter}`,
    url,
    title: 'New Tab',
    favicon: '',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    isPinned: false,
  }
}

export function useTabs() {
  const [tabs, setTabs] = useState<TabData[]>(() => [createTab()])
  const [activeTabId, setActiveTabId] = useState<string>('tab-1')

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const newTab = useCallback((url?: string) => {
    const tab = createTab(url)
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
  }, [])

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const tab = prev.find(t => t.id === id)
      if (tab?.isPinned) return prev

      const next = prev.filter((t) => t.id !== id)
      if (next.length === 0) {
        const fresh = createTab()
        setActiveTabId(fresh.id)
        return [fresh]
      }
      return next
    })
    setActiveTabId((currentActive) => {
      if (currentActive !== id) return currentActive
      const idx = tabs.findIndex((t) => t.id === id)
      const fallback = tabs[idx - 1] || tabs[idx + 1]
      return fallback?.id || tabs[0]?.id || ''
    })
  }, [tabs])

  const switchTab = useCallback((id: string) => {
    setActiveTabId(id)
  }, [])

  const updateTab = useCallback((id: string, updates: Partial<TabData>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const pinTab = useCallback((id: string) => {
    setTabs((prev) => {
      const updated = prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t)
      // Sort: pinned tabs first
      return updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    })
  }, [])

  const duplicateTab = useCallback((id: string): string | undefined => {
    const source = tabs.find(t => t.id === id)
    if (!source) return undefined
    const tab = createTab(source.url)
    tab.title = source.title
    tab.favicon = source.favicon
    setTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
    return tab.id
  }, [tabs])

  return {
    tabs,
    activeTabId,
    activeTab,
    newTab,
    closeTab,
    switchTab,
    updateTab,
    pinTab,
    duplicateTab,
  }
}
