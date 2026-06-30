import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { TabData } from '../../shared/ipc'

interface Props {
  tab: TabData
  isActive: boolean
  onUpdate: (id: string, updates: Partial<TabData>) => void
}

const WebviewPanel = forwardRef<HTMLDivElement, Props>(({ tab, isActive, onUpdate }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const tabId = useRef(tab.id)

  useImperativeHandle(ref, () => containerRef.current!)

  useEffect(() => {
    const container = containerRef.current
    if (!container || initialized.current) return

    const wv = container.querySelector('webview') as Electron.WebviewTag | null
    if (!wv) return

    const onDomReady = () => {
      initialized.current = true
      if (tab.url && tab.url !== 'about:blank') {
        wv.loadURL(tab.url)
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
      onUpdate(tabId.current, {
        url: e.url,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
    })

    wv.addEventListener('did-navigate-in-page', (e: any) => {
      onUpdate(tabId.current, {
        url: e.url,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
    })

    return () => {
      wv.removeEventListener('dom-ready', onDomReady)
    }
  }, [tab.url, onUpdate])

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
        allowpopups={'true' as any}
      />
    </div>
  )
})

WebviewPanel.displayName = 'WebviewPanel'
export default WebviewPanel
