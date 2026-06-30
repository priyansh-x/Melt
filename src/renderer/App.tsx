import { useCallback, useRef, useMemo, useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import TabStrip from './components/TabStrip'
import SideRail from './components/SideRail'
import WebviewPanel from './components/WebviewPanel'
import RecipePanel from './components/recipes/RecipePanel'
import PromptBar from './components/PromptBar'
import SettingsPanel from './components/SettingsPanel'
import FindBar from './components/FindBar'
import { useTabs } from './hooks/useTabs'
import { useRecipes } from './hooks/useRecipes'
import { useShortcuts } from './hooks/useShortcuts'
import { GenerateRecipeRequest } from '../shared/ai'

export default function App() {
  const { tabs, activeTabId, activeTab, newTab, closeTab, switchTab, updateTab } = useTabs()
  const { allRecipes, activeRecipes, createRecipe, toggleRecipe, deleteRecipe } = useRecipes(activeTab?.url || '')
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const urlBarRef = useRef<HTMLInputElement>(null)
  const [showRecipePanel, setShowRecipePanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showFindBar, setShowFindBar] = useState(false)
  const findQueryRef = useRef('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const getActiveWebview = useCallback((): Electron.WebviewTag | null => {
    const container = containerRefs.current.get(activeTabId)
    return container?.querySelector('webview') as Electron.WebviewTag | null
  }, [activeTabId])

  function handleNavigate(input: string) {
    const wv = getActiveWebview()
    if (!wv) return

    let url = input
    if (!/^https?:\/\//i.test(input) && !input.startsWith('file://')) {
      if (input.includes('.') && !input.includes(' ')) {
        url = 'https://' + input
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(input)}`
      }
    }

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
      })

      setAiResult(`Created recipe: "${res.recipe.name}"`)
      setTimeout(() => setAiResult(null), 4000)
    } catch (e: any) {
      setAiError(e.message || 'Something went wrong')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <SideRail
        onRecipesClick={() => { setShowRecipePanel((v) => !v); setShowSettings(false) }}
        onSettingsClick={() => { setShowSettings((v) => !v); setShowRecipePanel(false) }}
        recipeCount={activeRecipes.length}
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
          urlBarRef={urlBarRef}
        />
        <TabStrip
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitch={switchTab}
          onClose={closeTab}
          onNew={() => newTab()}
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
        <div className="content-area">
          <div className="webview-container">
            {tabs.map((tab) => (
              <WebviewPanel
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                onUpdate={updateTab}
                recipesToInject={tab.id === activeTabId ? activeRecipes : []}
                ref={(el) => {
                  if (el) containerRefs.current.set(tab.id, el)
                  else containerRefs.current.delete(tab.id)
                }}
              />
            ))}
          </div>
          {showRecipePanel && (
            <RecipePanel
              allRecipes={allRecipes}
              activeRecipes={activeRecipes}
              currentUrl={activeTab?.url || ''}
              onCreateRecipe={createRecipe}
              onToggleRecipe={toggleRecipe}
              onDeleteRecipe={deleteRecipe}
              onClose={() => setShowRecipePanel(false)}
            />
          )}
          {showSettings && (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          )}
        </div>
        <PromptBar
          onSubmit={handleAiPrompt}
          isLoading={aiLoading}
          error={aiError}
          lastResult={aiResult}
        />
      </div>
    </div>
  )
}
