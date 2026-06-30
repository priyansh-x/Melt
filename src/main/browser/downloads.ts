import { session, shell, ipcMain, BrowserWindow } from 'electron'
import { DOWNLOAD_IPC, DownloadItem as DLItem } from '../../shared/downloads'
import { randomUUID } from 'crypto'
import path from 'path'

const downloads: DLItem[] = []

export function registerDownloadHandlers() {
  session.defaultSession.on('will-download', (_event, item) => {
    const id = randomUUID()
    const dl: DLItem = {
      id,
      url: item.getURL(),
      filename: item.getFilename(),
      savePath: item.getSavePath() || '',
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      state: 'progressing',
      startTime: Date.now(),
    }
    downloads.push(dl)

    const win = BrowserWindow.getFocusedWindow()

    item.on('updated', (_e, state) => {
      dl.receivedBytes = item.getReceivedBytes()
      dl.totalBytes = item.getTotalBytes()
      dl.savePath = item.getSavePath()
      dl.state = state === 'progressing' ? 'progressing' : 'interrupted'
      win?.webContents.send(DOWNLOAD_IPC.ON_PROGRESS, dl)
    })

    item.once('done', (_e, state) => {
      dl.receivedBytes = item.getReceivedBytes()
      dl.savePath = item.getSavePath()
      dl.state = state === 'completed' ? 'completed' : state === 'cancelled' ? 'cancelled' : 'interrupted'
      win?.webContents.send(DOWNLOAD_IPC.ON_DONE, dl)
    })

    win?.webContents.send(DOWNLOAD_IPC.ON_STARTED, dl)
  })

  ipcMain.handle(DOWNLOAD_IPC.GET_ALL, () => downloads)

  ipcMain.handle(DOWNLOAD_IPC.OPEN, (_e, savePath: string) => {
    shell.openPath(savePath)
  })

  ipcMain.handle(DOWNLOAD_IPC.SHOW_IN_FOLDER, (_e, savePath: string) => {
    shell.showItemInFolder(savePath)
  })
}
