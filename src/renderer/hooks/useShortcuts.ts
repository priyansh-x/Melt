import { useEffect } from 'react'

interface ShortcutActions {
  newTab: () => void
  closeTab: () => void
  reload: () => void
  goBack: () => void
  goForward: () => void
  focusUrl: () => void
  nextTab: () => void
  prevTab: () => void
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  find: () => void
}

export function useShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const { melt } = window as any
    if (!melt?.onShortcut) return

    const cleanups = [
      melt.onShortcut('new-tab', actions.newTab),
      melt.onShortcut('close-tab', actions.closeTab),
      melt.onShortcut('reload', actions.reload),
      melt.onShortcut('go-back', actions.goBack),
      melt.onShortcut('go-forward', actions.goForward),
      melt.onShortcut('focus-url', actions.focusUrl),
      melt.onShortcut('next-tab', actions.nextTab),
      melt.onShortcut('prev-tab', actions.prevTab),
      melt.onShortcut('zoom-in', actions.zoomIn),
      melt.onShortcut('zoom-out', actions.zoomOut),
      melt.onShortcut('zoom-reset', actions.zoomReset),
      melt.onShortcut('find', actions.find),
    ]

    return () => {
      cleanups.forEach(fn => fn?.())
    }
  }, [actions])
}
