import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { APP_NAME } from '../shared/constants'
import { IPC_CHANNELS } from '../shared/ipc'
import { TabManager } from './tab-manager'

let mainWindow: BrowserWindow | null = null
let tabManager: TabManager | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: APP_NAME,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  tabManager = new TabManager(mainWindow)

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    tabManager = null
  })
}

ipcMain.on(IPC_CHANNELS.NEW_TAB, (_e, url?: string) => {
  tabManager?.createTab(url)
})

ipcMain.on(IPC_CHANNELS.CLOSE_TAB, (_e, id: string) => {
  tabManager?.closeTab(id)
})

ipcMain.on(IPC_CHANNELS.SWITCH_TAB, (_e, id: string) => {
  tabManager?.switchTab(id)
})

ipcMain.on(IPC_CHANNELS.NAVIGATE, (_e, url: string) => {
  tabManager?.navigateActive(url)
})

ipcMain.on(IPC_CHANNELS.GO_BACK, () => {
  tabManager?.goBack()
})

ipcMain.on(IPC_CHANNELS.GO_FORWARD, () => {
  tabManager?.goForward()
})

ipcMain.on(IPC_CHANNELS.RELOAD, () => {
  tabManager?.reload()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
