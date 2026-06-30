import { BrowserWindow, BrowserView } from 'electron'
import { IPC_CHANNELS, TabInfo } from '../shared/ipc'
import { randomUUID } from 'crypto'

interface Tab {
  id: string
  view: BrowserView
  title: string
  url: string
  favicon: string
  isLoading: boolean
}

const DEFAULT_URL = 'https://www.google.com'
const TOOLBAR_HEIGHT = 92

export class TabManager {
  private tabs: Map<string, Tab> = new Map()
  private activeTabId: string | null = null
  private window: BrowserWindow

  constructor(window: BrowserWindow) {
    this.window = window
    this.window.on('resize', () => this.resizeActiveView())
  }

  createTab(url?: string): string {
    const id = randomUUID()
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    const tab: Tab = {
      id,
      view,
      title: 'New Tab',
      url: url || DEFAULT_URL,
      favicon: '',
      isLoading: true,
    }

    this.tabs.set(id, tab)
    this.window.addBrowserView(view)
    this.switchTab(id)

    view.webContents.loadURL(tab.url)

    view.webContents.on('did-navigate', (_e, navUrl) => {
      tab.url = navUrl
      this.sendToRenderer(IPC_CHANNELS.URL_UPDATED, id, navUrl)
      this.sendNavState()
    })

    view.webContents.on('did-navigate-in-page', (_e, navUrl) => {
      tab.url = navUrl
      this.sendToRenderer(IPC_CHANNELS.URL_UPDATED, id, navUrl)
      this.sendNavState()
    })

    view.webContents.on('page-title-updated', (_e, title) => {
      tab.title = title
      this.sendToRenderer(IPC_CHANNELS.TITLE_UPDATED, id, title)
    })

    view.webContents.on('page-favicon-updated', (_e, favicons) => {
      if (favicons.length > 0) {
        tab.favicon = favicons[0]
        this.sendToRenderer(IPC_CHANNELS.FAVICON_UPDATED, id, favicons[0])
      }
    })

    view.webContents.on('did-start-loading', () => {
      tab.isLoading = true
      this.sendToRenderer(IPC_CHANNELS.LOADING_CHANGED, id, true)
    })

    view.webContents.on('did-stop-loading', () => {
      tab.isLoading = false
      this.sendToRenderer(IPC_CHANNELS.LOADING_CHANGED, id, false)
    })

    this.broadcastTabList()
    return id
  }

  closeTab(id: string) {
    const tab = this.tabs.get(id)
    if (!tab) return

    this.window.removeBrowserView(tab.view)
    tab.view.webContents.close()
    this.tabs.delete(id)

    if (this.activeTabId === id) {
      const remaining = Array.from(this.tabs.keys())
      if (remaining.length > 0) {
        this.switchTab(remaining[remaining.length - 1])
      } else {
        this.activeTabId = null
        this.createTab()
      }
    }

    this.broadcastTabList()
  }

  switchTab(id: string) {
    const tab = this.tabs.get(id)
    if (!tab) return

    if (this.activeTabId && this.activeTabId !== id) {
      const prev = this.tabs.get(this.activeTabId)
      if (prev) {
        prev.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      }
    }

    this.activeTabId = id
    this.window.setTopBrowserView(tab.view)
    this.resizeActiveView()
    this.sendToRenderer(IPC_CHANNELS.ACTIVE_TAB, id)
    this.sendToRenderer(IPC_CHANNELS.URL_UPDATED, id, tab.url)
    this.sendNavState()
  }

  navigateActive(url: string) {
    const tab = this.getActiveTab()
    if (!tab) return

    let finalUrl = url
    if (!/^https?:\/\//i.test(url) && !url.startsWith('file://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }

    tab.view.webContents.loadURL(finalUrl)
  }

  goBack() {
    const tab = this.getActiveTab()
    if (tab?.view.webContents.canGoBack()) {
      tab.view.webContents.goBack()
    }
  }

  goForward() {
    const tab = this.getActiveTab()
    if (tab?.view.webContents.canGoForward()) {
      tab.view.webContents.goForward()
    }
  }

  reload() {
    this.getActiveTab()?.view.webContents.reload()
  }

  private getActiveTab(): Tab | undefined {
    return this.activeTabId ? this.tabs.get(this.activeTabId) : undefined
  }

  private resizeActiveView() {
    const tab = this.getActiveTab()
    if (!tab) return

    const [width, height] = this.window.getContentSize()
    const sideRailWidth = 48
    tab.view.setBounds({
      x: sideRailWidth,
      y: TOOLBAR_HEIGHT,
      width: width - sideRailWidth,
      height: height - TOOLBAR_HEIGHT,
    })
  }

  private sendNavState() {
    const tab = this.getActiveTab()
    if (!tab) return
    this.sendToRenderer(IPC_CHANNELS.CAN_GO_BACK, tab.view.webContents.canGoBack())
    this.sendToRenderer(IPC_CHANNELS.CAN_GO_FORWARD, tab.view.webContents.canGoForward())
  }

  private broadcastTabList() {
    const tabs: TabInfo[] = Array.from(this.tabs.values()).map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      favicon: t.favicon,
      isLoading: t.isLoading,
      canGoBack: t.view.webContents.canGoBack(),
      canGoForward: t.view.webContents.canGoForward(),
    }))
    this.sendToRenderer(IPC_CHANNELS.TAB_LIST, tabs, this.activeTabId)
  }

  private sendToRenderer(channel: string, ...args: unknown[]) {
    if (!this.window.isDestroyed()) {
      this.window.webContents.send(channel, ...args)
    }
  }
}
