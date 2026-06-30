import { useState, useCallback } from 'react'
import { TabData } from '../../shared/ipc'

let tabCounter = 0

function createTab(url = 'https://www.google.com'): TabData {
  return {
    id: `tab-${++tabCounter}`,
    url,
    title: 'New Tab',
    favicon: '',
    isLoading: true,
    canGoBack: false,
    canGoForward: false,
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

  return {
    tabs,
    activeTabId,
    activeTab,
    newTab,
    closeTab,
    switchTab,
    updateTab,
  }
}
