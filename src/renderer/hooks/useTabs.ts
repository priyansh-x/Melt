import { useState, useCallback } from 'react'
import { TabData, TabGroup } from '../../shared/ipc'

const GROUP_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

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

  const [tabGroups, setTabGroups] = useState<TabGroup[]>([])

  const createTabGroup = useCallback((name: string, tabIds: string[]) => {
    const group: TabGroup = {
      id: `group-${Date.now()}`,
      name,
      color: GROUP_COLORS[tabGroups.length % GROUP_COLORS.length],
    }
    setTabGroups(prev => [...prev, group])
    setTabs(prev => prev.map(t => tabIds.includes(t.id) ? { ...t, groupId: group.id } : t))
    return group
  }, [tabGroups.length])

  const addTabToGroup = useCallback((tabId: string, groupId: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, groupId } : t))
  }, [])

  const removeTabFromGroup = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, groupId: undefined } : t))
  }, [])

  const deleteTabGroup = useCallback((groupId: string) => {
    setTabGroups(prev => prev.filter(g => g.id !== groupId))
    setTabs(prev => prev.map(t => t.groupId === groupId ? { ...t, groupId: undefined } : t))
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
    tabGroups,
    createTabGroup,
    addTabToGroup,
    removeTabFromGroup,
    deleteTabGroup,
  }
}
