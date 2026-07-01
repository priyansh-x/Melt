import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { TabData } from '../../shared/ipc'
import { Recipe } from '../../shared/recipe'
import { getDomActionsScript } from '../visual-edit/inject'

interface Props {
  tab: TabData
  isActive: boolean
  onUpdate: (id: string, updates: Partial<TabData>) => void
  recipesToInject: Recipe[]
  onNewTab?: (url: string) => void
}

const WebviewPanel = forwardRef<HTMLDivElement, Props>(({ tab, isActive, onUpdate, recipesToInject, onNewTab }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const tabId = useRef(tab.id)
  const pendingUrl = useRef<string | null>(null)
  const injectedCssKeys = useRef<Map<string, string>>(new Map())

  useImperativeHandle(ref, () => containerRef.current!)

  // Track URL changes — if URL changes while webview is ready, navigate to it
  useEffect(() => {
    if (!tab.url || tab.url === 'melt://newtab') return

    const container = containerRef.current
    if (!container) return
    const wv = container.querySelector('webview') as Electron.WebviewTag | null
    if (!wv) return

    if (initialized.current) {
      // Webview is ready — check if we need to navigate
      try {
        const currentUrl = wv.getURL()
        if (currentUrl === 'about:blank' || currentUrl !== tab.url) {
          wv.loadURL(tab.url)
        }
      } catch {
        wv.loadURL(tab.url)
      }
    } else {
      // Webview not ready yet — store pending URL
      pendingUrl.current = tab.url
    }
  }, [tab.url])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wv = container.querySelector('webview') as Electron.WebviewTag | null
    if (!wv) return

    if (initialized.current) return

    const onDomReady = () => {
      initialized.current = true
      // Set a Chrome-like user agent so sites like YouTube don't block us
      const chromeUA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36`
      wv.setUserAgent(chromeUA)
      // Load pending URL if any
      const urlToLoad = pendingUrl.current || tab.url
      if (urlToLoad && urlToLoad !== 'melt://newtab' && urlToLoad !== 'about:blank') {
        wv.loadURL(urlToLoad)
        pendingUrl.current = null
      }
    }

    wv.addEventListener('dom-ready', onDomReady, { once: true })

    wv.addEventListener('did-start-loading', () => {
      onUpdate(tabId.current, { isLoading: true })
    })

    wv.addEventListener('did-stop-loading', () => {
      onUpdate(tabId.current, { isLoading: false })
    })

    wv.addEventListener('page-title-updated', (e: any) => {
      onUpdate(tabId.current, { title: e.title })
    })

    wv.addEventListener('page-favicon-updated', (e: any) => {
      if (e.favicons?.length > 0) {
        onUpdate(tabId.current, { favicon: e.favicons[0] })
      }
    })

    wv.addEventListener('did-navigate', (e: any) => {
      if (e.url === 'about:blank') return
      onUpdate(tabId.current, {
        url: e.url,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
      ;(window as any).melt.history.add(e.url, wv.getTitle?.() || '')
    })

    wv.addEventListener('new-window', (e: any) => {
      e.preventDefault()
      if (e.url && onNewTab) {
        onNewTab(e.url)
      }
    })

    wv.addEventListener('did-navigate-in-page', (e: any) => {
      if (e.url === 'about:blank') return
      onUpdate(tabId.current, {
        url: e.url,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
    })

    return () => {
      wv.removeEventListener('dom-ready', onDomReady)
    }
  }, [onUpdate])

  // Inject recipes when they change or page finishes loading
  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return
    const wv = container.querySelector('webview') as Electron.WebviewTag | null
    if (!wv) return

    const injectRecipes = async () => {
      for (const [, cssKey] of injectedCssKeys.current) {
        try { wv.removeInsertedCSS(cssKey) } catch {}
      }
      injectedCssKeys.current.clear()

      for (const recipe of recipesToInject) {
        if (recipe.css) {
          try {
            const key = await wv.insertCSS(recipe.css)
            injectedCssKeys.current.set(recipe.id, key)
          } catch {}
        }
        if (recipe.js) {
          try {
            await wv.executeJavaScript(recipe.js)
          } catch {}
        }
        if (recipe.domActions && recipe.domActions !== '[]') {
          try {
            await wv.executeJavaScript(getDomActionsScript(recipe.domActions))
          } catch {}
        }
      }
    }

    const timer = setTimeout(injectRecipes, 100)
    return () => clearTimeout(timer)
  }, [recipesToInject, isActive, tab.isLoading])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: isActive ? 'flex' : 'none',
        position: 'absolute',
        inset: 0,
      }}
    >
      <webview
        src="about:blank"
        style={{ width: '100%', height: '100%' }}
        partition="persist:melt"
        allowpopups={'true' as any}
      />
    </div>
  )
})

WebviewPanel.displayName = 'WebviewPanel'
export default WebviewPanel
