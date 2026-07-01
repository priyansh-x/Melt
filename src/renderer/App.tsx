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
import NotesPanel from './components/NotesPanel'
import StatusBar from './components/StatusBar'
import ShortcutsOverlay from './components/ShortcutsOverlay'
import CommandPalette from './components/CommandPalette'
import { useTabs } from './hooks/useTabs'
import { useRecipes } from './hooks/useRecipes'
import { useShortcuts } from './hooks/useShortcuts'
import { GenerateRecipeRequest } from '../shared/ai'
import { getVisualEditScript } from './visual-edit/inject'
import { getReaderModeScript } from './visual-edit/reader-mode'
import { getCopyAsMarkdownScript } from './visual-edit/copy-markdown'
import { getCssInspectorScript } from './visual-edit/css-inspector'
import { getPageStatsScript } from './visual-edit/page-stats'
import { getOutlineViewScript } from './visual-edit/outline-view'
import { getColorPickerScript } from './visual-edit/color-picker'
import { getHighlighterScript } from './visual-edit/highlighter'
import { getGridOverlayScript } from './visual-edit/grid-overlay'
import { getRulerScript } from './visual-edit/ruler'
import { getLinkPreviewScript } from './visual-edit/link-preview'
import { getLiveCssScript } from './visual-edit/live-css'
import { getViewportResizerScript } from './visual-edit/viewport-resizer'
import { getA11yCheckerScript } from './visual-edit/a11y-checker'
import { getPerfMonitorScript } from './visual-edit/perf-monitor'
import { getDomTreeScript } from './visual-edit/dom-tree'
import { getFontInspectorScript } from './visual-edit/font-inspector'
import { getSpacingVizScript } from './visual-edit/spacing-viz'
import { getMetaViewerScript } from './visual-edit/meta-viewer'
import { getZIndexVizScript } from './visual-edit/zindex-viz'

type SidePanel = 'recipes' | 'settings' | 'ai' | 'history' | 'bookmarks' | 'notes' | null

export default function App() {
  const { tabs, activeTabId, activeTab, newTab, closeTab, switchTab, updateTab, pinTab, duplicateTab, reorderTabs, tabGroups, createTabGroup } = useTabs()
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
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [splitTabId, setSplitTabId] = useState<string | null>(null)
  const [presentationMode, setPresentationMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      }
      if (e.key === 'Escape' && showShortcuts) setShowShortcuts(false)
      if (e.key === 'Escape' && presentationMode) setPresentationMode(false)
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
    // Always update tab URL — WebviewPanel watches tab.url changes and navigates
    updateTab(activeTabId, { url, isLoading: true })
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
    commandPalette: () => setShowCommandPalette(prev => !prev),
    aiPrompt: () => {
      const promptEl = document.querySelector('.prompt-bar-input') as HTMLInputElement
      if (promptEl) promptEl.focus()
    },
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

  async function toggleReaderMode() {
    const wv = getActiveWebview()
    if (wv) {
      await wv.executeJavaScript(getReaderModeScript())
    }
  }

  async function takeScreenshot() {
    const wv = getActiveWebview()
    if (!wv) return
    try {
      const image = await wv.capturePage()
      const dataUrl = image.toDataURL()
      const link = document.createElement('a')
      link.download = `melt-screenshot-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch {}
  }

  async function togglePictureInPicture() {
    const wv = getActiveWebview()
    if (!wv) return
    await wv.executeJavaScript(`(function() {
      var video = document.querySelector('video');
      if (!video) { alert('No video found on this page'); return; }
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        video.requestPictureInPicture().catch(function(e) { console.error(e); });
      }
    })()`)
  }

  async function toggleCssInspector() {
    const wv = getActiveWebview()
    if (wv) await wv.executeJavaScript(getCssInspectorScript())
  }

  async function copyAsMarkdown() {
    const wv = getActiveWebview()
    if (wv) await wv.executeJavaScript(getCopyAsMarkdownScript())
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
        domActions: res.recipe.domActions || '[]',
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
    <div className={`app-shell ${presentationMode ? 'presentation-mode' : ''}`}>
      {presentationMode && (
        <div className="presentation-exit" onClick={() => setPresentationMode(false)}>
          Press Esc to exit presentation mode
        </div>
      )}
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
        onNotesClick={() => togglePanel('notes')}
        onReaderMode={toggleReaderMode}
        onScreenshot={takeScreenshot}
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
          onReorder={reorderTabs}
          onSplitView={(id) => {
            const newId = duplicateTab(id)
            if (newId) setSplitTabId(newId)
          }}
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
          tabGroups={tabGroups}
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
          <div className={`webview-container ${splitTabId ? 'split-view' : ''}`}>
            <div className={`webview-pane ${splitTabId ? 'split-left' : ''}`}>
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
            {splitTabId && (() => {
              const splitTab = tabs.find(t => t.id === splitTabId)
              if (!splitTab) return null
              return (
                <div className="webview-pane split-right">
                  <div className="split-header">
                    <span className="split-title">{splitTab.title || 'Split View'}</span>
                    <button className="split-close" onClick={() => setSplitTabId(null)}>×</button>
                  </div>
                  <WebviewPanel
                    key={`split-${splitTab.id}`}
                    tab={splitTab}
                    isActive={true}
                    onUpdate={updateTab}
                    recipesToInject={[]}
                    onNewTab={(url) => newTab(url)}
                  />
                </div>
              )
            })()}
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
          {sidePanel === 'notes' && (
            <NotesPanel
              currentUrl={activeTab?.url || ''}
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
      <CommandPalette
        visible={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        actions={[
          { id: 'new-tab', label: 'New Tab', shortcut: '⌘T', category: 'Tab', action: () => newTab() },
          { id: 'close-tab', label: 'Close Tab', shortcut: '⌘W', category: 'Tab', action: () => closeTab(activeTabId) },
          { id: 'recipes', label: 'Open Recipes', category: 'Panel', action: () => togglePanel('recipes') },
          { id: 'ai', label: 'Open AI Chat', category: 'Panel', action: () => togglePanel('ai') },
          { id: 'history', label: 'Open History', category: 'Panel', action: () => togglePanel('history') },
          { id: 'bookmarks', label: 'Open Bookmarks', category: 'Panel', action: () => togglePanel('bookmarks') },
          { id: 'settings', label: 'Open Settings', category: 'Panel', action: () => togglePanel('settings') },
          { id: 'notes', label: 'Open Notes', category: 'Panel', action: () => togglePanel('notes') },
          { id: 'visual-edit', label: 'Toggle Visual Edit', category: 'Mode', action: toggleVisualEdit },
          { id: 'xray', label: 'Toggle X-ray', category: 'Mode', action: toggleXray },
          { id: 'reader', label: 'Reader Mode', category: 'Mode', action: toggleReaderMode },
          { id: 'css-inspect', label: 'CSS Inspector', category: 'Mode', action: toggleCssInspector },
          { id: 'highlighter', label: 'Text Highlighter', category: 'Mode', action: () => getActiveWebview()?.executeJavaScript(getHighlighterScript()) },
          { id: 'grid', label: 'Grid Overlay', category: 'Mode', action: () => getActiveWebview()?.executeJavaScript(getGridOverlayScript()) },
          { id: 'ruler', label: 'Ruler / Measure', category: 'Mode', action: () => getActiveWebview()?.executeJavaScript(getRulerScript()) },
          { id: 'link-preview', label: 'Link Previewer', category: 'Mode', action: () => getActiveWebview()?.executeJavaScript(getLinkPreviewScript()) },
          { id: 'live-css', label: 'Live CSS Editor', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getLiveCssScript()) },
          { id: 'viewport-resizer', label: 'Responsive Viewport', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getViewportResizerScript()) },
          { id: 'a11y-checker', label: 'Accessibility Checker', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getA11yCheckerScript()) },
          { id: 'perf-monitor', label: 'Performance Monitor', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getPerfMonitorScript()) },
          { id: 'dom-tree', label: 'DOM Tree Explorer', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getDomTreeScript()) },
          { id: 'font-inspector', label: 'Font Inspector', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getFontInspectorScript()) },
          { id: 'spacing-viz', label: 'Spacing Visualizer', category: 'Mode', action: () => getActiveWebview()?.executeJavaScript(getSpacingVizScript()) },
          { id: 'meta-viewer', label: 'Meta & SEO Viewer', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getMetaViewerScript()) },
          { id: 'zindex-viz', label: 'Z-Index Map', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getZIndexVizScript()) },
          { id: 'page-stats', label: 'Page Stats', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getPageStatsScript()) },
          { id: 'outline', label: 'Page Outline', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getOutlineViewScript()) },
          { id: 'color-picker', label: 'Color Picker', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(getColorPickerScript()) },
          { id: 'clip-selection', label: 'Clip Selection as Note', category: 'Tool', action: async () => {
            const wv = getActiveWebview()
            if (!wv) return
            const text = await wv.executeJavaScript('window.getSelection()?.toString() || ""')
            if (text.trim()) {
              await (window as any).melt.notes.add(activeTab?.url || '', text.trim())
              togglePanel('notes')
            }
          }},
          { id: 'reading-list', label: 'Add to Reading List', category: 'Tool', action: async () => {
            if (activeTab?.url && activeTab.url !== 'melt://newtab') {
              await (window as any).melt.notes.add('melt://reading-list', `${activeTab.title}\n${activeTab.url}`)
            }
          }},
          { id: 'scroll-top', label: 'Scroll to Top', category: 'Nav', action: () => getActiveWebview()?.executeJavaScript('window.scrollTo({top:0,behavior:"smooth"})') },
          { id: 'scroll-bottom', label: 'Scroll to Bottom', category: 'Nav', action: () => getActiveWebview()?.executeJavaScript('window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})') },
          { id: 'presentation', label: 'Presentation Mode', category: 'View', action: () => setPresentationMode(p => !p) },
          { id: 'fullscreen', label: 'Toggle Fullscreen', category: 'View', action: () => {
            if (document.fullscreenElement) document.exitFullscreen()
            else document.documentElement.requestFullscreen()
          }},
          { id: 'translate', label: 'Translate Page', category: 'Tool', action: () => {
            if (activeTab?.url) {
              const translateUrl = 'https://translate.google.com/translate?sl=auto&tl=en&u=' + encodeURIComponent(activeTab.url)
              newTab(translateUrl)
            }
          }},
          { id: 'save-session', label: 'Save Current Session', category: 'Session', action: async () => {
            const name = `Session ${new Date().toLocaleString()}`
            const tabData = tabs.filter(t => t.url !== 'melt://newtab').map(t => ({ url: t.url, title: t.title }))
            if (tabData.length) await (window as any).melt.sessions.save(name, tabData)
          }},
          { id: 'restore-session', label: 'Restore Last Session', category: 'Session', action: async () => {
            const sessions = await (window as any).melt.sessions.getAll()
            if (sessions.length > 0) {
              const latest = sessions[0]
              const tabData = JSON.parse(latest.tabs)
              tabData.forEach((t: { url: string }) => newTab(t.url))
            }
          }},
          { id: 'ua-mobile', label: 'Emulate Mobile UA', category: 'Dev', action: () => {
            const wv = getActiveWebview()
            if (wv) {
              wv.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1')
              wv.reload()
            }
          }},
          { id: 'ua-desktop', label: 'Reset to Desktop UA', category: 'Dev', action: () => {
            const wv = getActiveWebview()
            if (wv) {
              wv.setUserAgent('')
              wv.reload()
            }
          }},
          { id: 'cookies', label: 'View Cookies', category: 'Dev', action: () => {
            getActiveWebview()?.executeJavaScript(`(function() {
              var existing = document.getElementById('__melt-cookies');
              if (existing) { existing.remove(); return; }
              var cookies = document.cookie.split(';').map(function(c) { return c.trim(); }).filter(Boolean);
              var panel = document.createElement('div');
              panel.id = '__melt-cookies';
              panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483645;width:320px;max-height:400px;background:#1a1a1a;border:1px solid #333;border-radius:8px;font:11px/1.5 -apple-system,monospace;color:#ccc;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;display:flex;flex-direction:column;';
              panel.innerHTML = '<div style="padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;"><span style="color:#f59e0b;font-weight:500;">Cookies (' + cookies.length + ')</span><button onclick="this.closest(\\'#__melt-cookies\\').remove()" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button></div>';
              var list = document.createElement('div');
              list.style.cssText = 'overflow-y:auto;flex:1;padding:6px 12px;';
              if (!cookies.length) list.innerHTML = '<div style="color:#666;">No cookies</div>';
              cookies.forEach(function(c) {
                var parts = c.split('=');
                list.innerHTML += '<div style="padding:3px 0;border-bottom:1px solid #222;word-break:break-all;"><span style="color:#f59e0b;">' + parts[0] + '</span> = <span style="color:#e0e0e0;">' + (parts.slice(1).join('=') || '') + '</span></div>';
              });
              panel.appendChild(list);
              document.body.appendChild(panel);
            })()`)
          }},
          { id: 'local-storage', label: 'View Local Storage', category: 'Dev', action: () => {
            getActiveWebview()?.executeJavaScript(`(function() {
              var existing = document.getElementById('__melt-storage');
              if (existing) { existing.remove(); return; }
              var keys = Object.keys(localStorage);
              var panel = document.createElement('div');
              panel.id = '__melt-storage';
              panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483645;width:320px;max-height:400px;background:#1a1a1a;border:1px solid #333;border-radius:8px;font:11px/1.5 -apple-system,monospace;color:#ccc;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;display:flex;flex-direction:column;';
              panel.innerHTML = '<div style="padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;"><span style="color:#3b82f6;font-weight:500;">Local Storage (' + keys.length + ')</span><button onclick="this.closest(\\'#__melt-storage\\').remove()" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button></div>';
              var list = document.createElement('div');
              list.style.cssText = 'overflow-y:auto;flex:1;padding:6px 12px;';
              if (!keys.length) list.innerHTML = '<div style="color:#666;">No items</div>';
              keys.slice(0, 50).forEach(function(k) {
                var val = localStorage.getItem(k) || '';
                list.innerHTML += '<div style="padding:3px 0;border-bottom:1px solid #222;"><div style="color:#3b82f6;word-break:break-all;">' + k + '</div><div style="color:#888;max-height:40px;overflow:hidden;text-overflow:ellipsis;">' + val.substring(0, 100) + '</div></div>';
              });
              panel.appendChild(list);
              document.body.appendChild(panel);
            })()`)
          }},
          { id: 'view-source', label: 'View Page Source', category: 'Dev', action: () => {
            if (activeTab?.url) newTab('view-source:' + activeTab.url)
          }},
          { id: 'dark-toggle', label: 'Toggle Dark Mode', category: 'Tool', action: () => getActiveWebview()?.executeJavaScript(`(function() {
            var s = document.getElementById('__melt-dark-toggle');
            if (s) { s.remove(); return; }
            s = document.createElement('style');
            s.id = '__melt-dark-toggle';
            s.textContent = 'html { filter: invert(1) hue-rotate(180deg) !important; } img, video, canvas, svg, [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }';
            document.head.appendChild(s);
          })()`) },
          { id: 'screenshot', label: 'Take Screenshot', category: 'Tool', action: takeScreenshot },
          { id: 'copy-md', label: 'Copy Page as Markdown', category: 'Tool', action: copyAsMarkdown },
          { id: 'pip', label: 'Picture-in-Picture', category: 'Tool', action: togglePictureInPicture },
          { id: 'print', label: 'Print Page', category: 'Tool', action: () => getActiveWebview()?.print() },
          { id: 'copy-url', label: 'Copy Page URL', category: 'Tool', action: () => {
            if (activeTab?.url) navigator.clipboard.writeText(activeTab.url)
          }},
          { id: 'copy-title', label: 'Copy Page Title', category: 'Tool', action: () => {
            if (activeTab?.title) navigator.clipboard.writeText(activeTab.title)
          }},
          { id: 'find', label: 'Find in Page', shortcut: '⌘F', category: 'Tool', action: () => setShowFindBar(true) },
          { id: 'shortcuts', label: 'Keyboard Shortcuts', shortcut: '⌘/', category: 'Help', action: () => setShowShortcuts(true) },
          { id: 'devtools', label: 'Toggle DevTools', shortcut: '⌘⌥I', category: 'Dev', action: () => {
            const wv = getActiveWebview()
            if (wv) wv.isDevToolsOpened() ? wv.closeDevTools() : wv.openDevTools()
          }},
          { id: 'revert', label: 'Revert All Recipes', category: 'Recipe', action: handleRevertAll },
          { id: 'split', label: splitTabId ? 'Close Split View' : 'Split View', category: 'View', action: () => {
            if (splitTabId) { setSplitTabId(null) }
            else {
              const newId = duplicateTab(activeTabId)
              if (newId) setSplitTabId(newId)
            }
          }},
          { id: 'zoom-in', label: 'Zoom In', shortcut: '⌘+', category: 'View', action: () => {
            const wv = getActiveWebview()
            if (wv) { const n = zoomLevel + 1; setZoomLevel(n); wv.setZoomLevel(n) }
          }},
          { id: 'zoom-out', label: 'Zoom Out', shortcut: '⌘-', category: 'View', action: () => {
            const wv = getActiveWebview()
            if (wv) { const n = zoomLevel - 1; setZoomLevel(n); wv.setZoomLevel(n) }
          }},
          { id: 'zoom-reset', label: 'Reset Zoom', shortcut: '⌘0', category: 'View', action: () => {
            const wv = getActiveWebview()
            if (wv) { setZoomLevel(0); wv.setZoomLevel(0) }
          }},
        ]}
      />
    </div>
  )
}
