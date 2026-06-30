import { useCallback, useRef, useMemo, useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import TabStrip from './components/TabStrip'
import SideRail from './components/SideRail'
import WebviewPanel from './components/WebviewPanel'
import RecipePanel from './components/recipes/RecipePanel'
import PromptBar from './components/PromptBar'
import SettingsPanel from './components/SettingsPanel'
import FindBar from './components/FindBar'
import AISidebar from './components/AISidebar'
import HistoryPanel from './components/HistoryPanel'
import BookmarksPanel from './components/BookmarksPanel'
import NewTabPage from './components/NewTabPage'
import DownloadBar from './components/DownloadBar'
import StatusBar from './components/StatusBar'
import ShortcutsOverlay from './components/ShortcutsOverlay'
import { useTabs } from './hooks/useTabs'
import { useRecipes } from './hooks/useRecipes'
import { useShortcuts } from './hooks/useShortcuts'
import { GenerateRecipeRequest } from '../shared/ai'
import { getVisualEditScript } from './visual-edit/inject'

type SidePanel = 'recipes' | 'settings' | 'ai' | 'history' | 'bookmarks' | null

export default function App() {
  const { tabs, activeTabId, activeTab, newTab, closeTab, switchTab, updateTab, pinTab, duplicateTab } = useTabs()
  const { allRecipes, activeRecipes, createRecipe, updateRecipe, toggleRecipe, deleteRecipe, refresh } = useRecipes(activeTab?.url || '')
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const urlBarRef = useRef<HTMLInputElement>(null)
  const [sidePanel, setSidePanel] = useState<SidePanel>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showFindBar, setShowFindBar] = useState(false)
  const findQueryRef = useRef('')
  const [visualEditActive, setVisualEditActive] = useState(false)
  const [xrayActive, setXrayActive] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0)
  const [mutedTabs, setMutedTabs] = useState<Set<string>>(new Set())
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
      if (e.key === 'Escape' && showShortcuts) setShowShortcuts(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showShortcuts])

  const getActiveWebview = useCallback((): Electron.WebviewTag | null => {
    const container = containerRefs.current.get(activeTabId)
    return container?.querySelector('webview') as Electron.WebviewTag | null
  }, [activeTabId])

  function togglePanel(panel: SidePanel) {
    setSidePanel(prev => prev === panel ? null : panel)
  }

  function resolveUrl(input: string): string {
    if (/^https?:\/\//i.test(input) || input.startsWith('file://')) return input
    if (input.startsWith('melt://')) return input
    if (input.includes('.') && !input.includes(' ')) return 'https://' + input
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`
  }

  function handleNavigate(input: string) {
    const url = resolveUrl(input)

    // If currently on newtab, update the tab URL so it transitions to webview
    if (activeTab?.url === 'melt://newtab') {
      updateTab(activeTabId, { url, isLoading: true })
      return
    }

    const wv = getActiveWebview()
    if (!wv) return
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
    find: () => setShowFindBar(true),
  }), [tabs, activeTabId, newTab, closeTab, switchTab, getActiveWebview])

  useShortcuts(shortcuts)

  // Bookmark state
  useEffect(() => {
    const url = activeTab?.url
    if (url && url !== 'about:blank') {
      (window as any).melt.bookmarks.isBookmarked(url).then(setIsBookmarked)
    } else {
      setIsBookmarked(false)
    }
  }, [activeTab?.url])

  async function handleBookmarkToggle() {
    const tab = activeTab
    if (!tab || !tab.url || tab.url === 'about:blank') return
    if (isBookmarked) {
      await (window as any).melt.bookmarks.remove(tab.url)
      setIsBookmarked(false)
    } else {
      await (window as any).melt.bookmarks.add(tab.url, tab.title, tab.favicon || '')
      setIsBookmarked(true)
    }
  }

  // ─── Visual Edit Mode ───
  async function toggleVisualEdit() {
    const wv = getActiveWebview()
    if (!wv) return

    if (visualEditActive) {
      try { await wv.executeJavaScript('window.__meltVisualEditCleanup?.()') } catch {}
      setVisualEditActive(false)
    } else {
      await wv.executeJavaScript(`
        window.__meltBridge = (msg) => {
          if (!window.__meltMessageQueue) window.__meltMessageQueue = [];
          window.__meltMessageQueue.push(msg);
        };
      `)
      await wv.executeJavaScript(getVisualEditScript())
      setVisualEditActive(true)
    }
  }

  // Poll for visual edit messages
  useEffect(() => {
    const wv = getActiveWebview()
    if (!wv || !visualEditActive) return

    const pollMessages = async () => {
      if (!visualEditActive) return
      try {
        const msgs = await wv.executeJavaScript(`
          (function() {
            const q = window.__meltMessageQueue || [];
            window.__meltMessageQueue = [];
            return q;
          })()
        `)
        for (const m of msgs) {
          await handleVisualEditMessage(m)
        }
      } catch {}
    }

    const interval = setInterval(pollMessages, 300)
    return () => clearInterval(interval)
  }, [visualEditActive, activeTabId])

  async function handleVisualEditMessage(msg: any) {
    const url = activeTab?.url || ''
    const hostname = (() => { try { return new URL(url).hostname } catch { return '*' } })()

    if (msg.action === 'domAction') {
      const { type, selector, name, newText } = msg.data
      const domAction = { type, selector, ...(newText ? { newText } : {}) }
      await createRecipe({
        name: name || 'Visual edit',
        urlPattern: `*${hostname}*`,
        css: '',
        js: '',
        domActions: JSON.stringify([domAction]),
        enabled: true as any,
      })
    } else if (msg.action === 'styleRule') {
      const { css, name } = msg.data
      await createRecipe({
        name: name || 'Style edit',
        urlPattern: `*${hostname}*`,
        css,
        js: '',
        domActions: '[]',
        enabled: true as any,
      })
    } else if (msg.action === 'inspect') {
      console.log('[Melt Inspect]', msg.data)
    }
  }

  // ─── Page X-ray Mode ───
  async function toggleXray() {
    const wv = getActiveWebview()
    if (!wv) return

    if (xrayActive) {
      try { await wv.executeJavaScript('window.__meltXrayCleanup?.()') } catch {}
      setXrayActive(false)
    } else {
      await wv.executeJavaScript(getXrayScript())
      setXrayActive(true)
    }
  }

  function getXrayScript(): string {
    const recipeData = JSON.stringify(activeRecipes.map(r => ({
      id: r.id, name: r.name, css: r.css, domActions: r.domActions,
    })))
    return `(function() {
      if (window.__meltXray) return;
      window.__meltXray = true;

      const recipes = ${recipeData};
      const overlay = document.createElement('div');
      overlay.id = '__melt-xray-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483630;pointer-events:none;';
      document.body.appendChild(overlay);

      const info = document.createElement('div');
      info.id = '__melt-xray-info';
      info.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483640;background:#1a1a1a;border:1px solid rgba(168,85,247,0.3);border-radius:8px;padding:10px 14px;font:12px -apple-system,sans-serif;color:#ccc;max-width:320px;pointer-events:auto;';
      info.innerHTML = '<div style="color:#a855f7;font-weight:500;margin-bottom:6px;">Page X-ray</div>' +
        '<div style="color:#888;font-size:11px;margin-bottom:8px;">' + recipes.length + ' recipe(s) active on this page</div>' +
        recipes.map(function(r) {
          var details = [];
          if (r.css) details.push('CSS: ' + r.css.length + ' chars');
          try {
            var da = JSON.parse(r.domActions || '[]');
            if (da.length) details.push(da.length + ' DOM action(s)');
          } catch(e) {}
          return '<div style="padding:4px 0;border-top:1px solid rgba(255,255,255,0.05);">' +
            '<span style="color:#e0e0e0;">' + r.name + '</span>' +
            '<div style="color:#666;font-size:10px;margin-top:2px;">' + details.join(' · ') + '</div></div>';
        }).join('');
      document.body.appendChild(info);

      // Highlight elements affected by DOM actions
      recipes.forEach(function(r) {
        try {
          var actions = JSON.parse(r.domActions || '[]');
          actions.forEach(function(a) {
            document.querySelectorAll(a.selector).forEach(function(el) {
              el.style.outline = '2px dashed rgba(168,85,247,0.5)';
              el.style.outlineOffset = '2px';
              el.dataset.meltXray = r.name;
            });
          });
        } catch(e) {}
      });

      window.__meltXrayCleanup = function() {
        overlay.remove();
        info.remove();
        document.querySelectorAll('[data-melt-xray]').forEach(function(el) {
          el.style.outline = '';
          el.style.outlineOffset = '';
          delete el.dataset.meltXray;
        });
        window.__meltXray = false;
        delete window.__meltXrayCleanup;
      };
    })()`
  }

  // ─── Revert All ───
  async function handleRevertAll() {
    for (const r of activeRecipes) {
      await deleteRecipe(r.id)
    }
    getActiveWebview()?.reload()
  }

  // ─── AI Prompt Bar (one-shot) ───
  async function handleAiPrompt(prompt: string) {
    const wv = getActiveWebview()
    if (!wv) return

    setAiError(null)
    setAiResult(null)
    setAiLoading(true)

    try {
      let pageHtml = ''
      try {
        pageHtml = await wv.executeJavaScript('document.documentElement.outerHTML')
      } catch {}

      const req: GenerateRecipeRequest = {
        prompt,
        url: activeTab?.url || '',
        pageTitle: activeTab?.title || '',
        pageHtml,
      }

      const res = await (window as any).melt.ai.generateRecipe(req)

      if (!res.success) {
        setAiError(res.error || 'Failed to generate recipe')
        return
      }

      await createRecipe({
        name: res.recipe.name,
        urlPattern: res.recipe.urlPattern,
        css: res.recipe.css,
        js: res.recipe.js,
        domActions: '[]',
        enabled: true as any,
      })

      setAiResult(`Created recipe: "${res.recipe.name}"`)
      setTimeout(() => setAiResult(null), 4000)
    } catch (e: any) {
      setAiError(e.message || 'Something went wrong')
    } finally {
      setAiLoading(false)
    }
  }

  // ─── AI Sidebar recipe creation ───
  async function handleAiRecipeCreated(recipe: { name: string; css: string; js: string; domActions: string; urlPattern: string }) {
    await createRecipe({
      name: recipe.name,
      urlPattern: recipe.urlPattern,
      css: recipe.css,
      js: recipe.js,
      domActions: recipe.domActions || '[]',
      enabled: true as any,
    })
  }

  async function getPageHtml(): Promise<string> {
    const wv = getActiveWebview()
    if (!wv) return ''
    try {
      return await wv.executeJavaScript('document.documentElement.outerHTML')
    } catch { return '' }
  }

  return (
    <div className="app-shell">
      <SideRail
        onRecipesClick={() => togglePanel('recipes')}
        onSettingsClick={() => togglePanel('settings')}
        onAiClick={() => togglePanel('ai')}
        onXrayClick={toggleXray}
        onHistoryClick={() => togglePanel('history')}
        onBookmarksClick={() => togglePanel('bookmarks')}
        onDevToolsClick={() => {
          const wv = getActiveWebview()
          if (wv) {
            if (wv.isDevToolsOpened()) wv.closeDevTools()
            else wv.openDevTools()
          }
        }}
        recipeCount={activeRecipes.length}
        xrayActive={xrayActive}
      />
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
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={isBookmarked}
          onVisualEditToggle={toggleVisualEdit}
          isVisualEditActive={visualEditActive}
          urlBarRef={urlBarRef}
          zoomLevel={zoomLevel}
          onZoomIn={() => {
            const wv = getActiveWebview()
            if (wv) {
              const next = zoomLevel + 1
              setZoomLevel(next)
              wv.setZoomLevel(next)
            }
          }}
          onZoomOut={() => {
            const wv = getActiveWebview()
            if (wv) {
              const next = zoomLevel - 1
              setZoomLevel(next)
              wv.setZoomLevel(next)
            }
          }}
          onZoomReset={() => {
            const wv = getActiveWebview()
            if (wv) {
              setZoomLevel(0)
              wv.setZoomLevel(0)
            }
          }}
        />
        <TabStrip
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitch={switchTab}
          onClose={closeTab}
          onNew={() => newTab()}
          onPin={pinTab}
          onDuplicate={duplicateTab}
          mutedTabs={mutedTabs}
          onMute={(id) => {
            const container = containerRefs.current.get(id)
            const wv = container?.querySelector('webview') as Electron.WebviewTag | null
            if (!wv) return
            const isMuted = mutedTabs.has(id)
            wv.setAudioMuted(!isMuted)
            setMutedTabs(prev => {
              const next = new Set(prev)
              if (isMuted) next.delete(id)
              else next.add(id)
              return next
            })
          }}
        />
        <FindBar
          visible={showFindBar}
          onFind={(text) => {
            findQueryRef.current = text
            const wv = getActiveWebview()
            if (!wv) return
            if (text) wv.findInPage(text)
            else wv.stopFindInPage('clearSelection')
          }}
          onFindNext={() => { if (findQueryRef.current) getActiveWebview()?.findInPage(findQueryRef.current, { forward: true, findNext: true }) }}
          onFindPrev={() => { if (findQueryRef.current) getActiveWebview()?.findInPage(findQueryRef.current, { forward: false, findNext: true }) }}
          onClose={() => {
            setShowFindBar(false)
            getActiveWebview()?.stopFindInPage('clearSelection')
          }}
        />
        {activeRecipes.length > 0 && (
          <div className="revert-banner">
            <div className="revert-banner-recipes">
              {activeRecipes.map(r => (
                <span key={r.id} className="revert-recipe-chip">
                  {r.name}
                  <button onClick={() => { deleteRecipe(r.id); getActiveWebview()?.reload() }} title={`Remove ${r.name}`}>×</button>
                </span>
              ))}
            </div>
            <button onClick={handleRevertAll}>Revert All</button>
          </div>
        )}
        <div className="content-area">
          <div className="webview-container">
            {tabs.map((tab) => (
              tab.url === 'melt://newtab' && tab.id === activeTabId ? (
                <NewTabPage
                  key={`ntp-${tab.id}`}
                  onNavigate={(url) => {
                    handleNavigate(url)
                    updateTab(tab.id, { url })
                  }}
                />
              ) : (
                <WebviewPanel
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onUpdate={updateTab}
                  recipesToInject={tab.id === activeTabId ? activeRecipes : []}
                  onNewTab={(url) => newTab(url)}
                  ref={(el) => {
                    if (el) containerRefs.current.set(tab.id, el)
                    else containerRefs.current.delete(tab.id)
                  }}
                />
              )
            ))}
          </div>
          {sidePanel === 'recipes' && (
            <RecipePanel
              allRecipes={allRecipes}
              activeRecipes={activeRecipes}
              currentUrl={activeTab?.url || ''}
              onCreateRecipe={createRecipe}
              onUpdateRecipe={updateRecipe}
              onToggleRecipe={toggleRecipe}
              onDeleteRecipe={deleteRecipe}
              onClose={() => setSidePanel(null)}
            />
          )}
          {sidePanel === 'settings' && (
            <SettingsPanel onClose={() => setSidePanel(null)} />
          )}
          {sidePanel === 'history' && (
            <HistoryPanel
              onNavigate={handleNavigate}
              onClose={() => setSidePanel(null)}
            />
          )}
          {sidePanel === 'bookmarks' && (
            <BookmarksPanel
              onNavigate={handleNavigate}
              onClose={() => setSidePanel(null)}
            />
          )}
          {sidePanel === 'ai' && (
            <AISidebar
              currentUrl={activeTab?.url || ''}
              pageTitle={activeTab?.title || ''}
              getPageHtml={getPageHtml}
              onRecipeCreated={handleAiRecipeCreated}
              onClose={() => setSidePanel(null)}
            />
          )}
        </div>
        <StatusBar
          url={activeTab?.url || ''}
          recipeCount={activeRecipes.length}
          isLoading={activeTab?.isLoading || false}
          zoomLevel={zoomLevel}
        />
        <DownloadBar />
        <PromptBar
          onSubmit={handleAiPrompt}
          isLoading={aiLoading}
          error={aiError}
          lastResult={aiResult}
        />
      </div>
      {visualEditActive && (
        <div className="xray-indicator">Visual Edit Mode</div>
      )}
      {showShortcuts && (
        <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />
      )}
      {xrayActive && (
        <div className="xray-indicator" style={{ bottom: '80px' }}>X-ray Mode</div>
      )}
    </div>
  )
}
