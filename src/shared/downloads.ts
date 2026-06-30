export interface DownloadItem {
  id: string
  url: string
  filename: string
  savePath: string
  totalBytes: number
  receivedBytes: number
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted'
  startTime: number
}

export const DOWNLOAD_IPC = {
  GET_ALL: 'download:get-all',
  ON_STARTED: 'download:started',
  ON_PROGRESS: 'download:progress',
  ON_DONE: 'download:done',
  OPEN: 'download:open',
  SHOW_IN_FOLDER: 'download:show-in-folder',
} as const
