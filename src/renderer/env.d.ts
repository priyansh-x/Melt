import type { MeltAPI } from '../preload/index'

declare global {
  interface Window {
    melt: MeltAPI
  }
}

export {}
