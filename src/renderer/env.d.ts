import type { MeltAPI } from '../preload/index'

declare global {
  interface Window {
    melt: MeltAPI
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      src?: string
      allowpopups?: string
      preload?: string
      partition?: string
    }, HTMLElement>
  }
}

export {}
