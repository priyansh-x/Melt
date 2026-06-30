import { useState, useEffect } from 'react'
import { DownloadItem } from '../../shared/downloads'

export default function DownloadBar() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const melt = (window as any).melt
    if (!melt?.downloads) return

    melt.downloads.onStarted((dl: DownloadItem) => {
      setDownloads(prev => [dl, ...prev])
      setVisible(true)
    })

    melt.downloads.onProgress((dl: DownloadItem) => {
      setDownloads(prev => prev.map(d => d.id === dl.id ? dl : d))
    })

    melt.downloads.onDone((dl: DownloadItem) => {
      setDownloads(prev => prev.map(d => d.id === dl.id ? dl : d))
    })
  }, [])

  if (!visible || downloads.length === 0) return null

  return (
    <div className="download-bar">
      <div className="download-bar-items">
        {downloads.slice(0, 5).map((dl) => {
          const progress = dl.totalBytes > 0 ? Math.round((dl.receivedBytes / dl.totalBytes) * 100) : 0
          return (
            <div key={dl.id} className="download-item">
              <div className="download-info">
                <span className="download-name">{dl.filename}</span>
                {dl.state === 'progressing' ? (
                  <span className="download-progress">{progress}%</span>
                ) : dl.state === 'completed' ? (
                  <span className="download-complete">Done</span>
                ) : (
                  <span className="download-failed">Failed</span>
                )}
              </div>
              {dl.state === 'progressing' && (
                <div className="download-progress-bar">
                  <div className="download-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              )}
              {dl.state === 'completed' && (
                <div className="download-actions">
                  <button onClick={() => (window as any).melt.downloads.open(dl.savePath)}>Open</button>
                  <button onClick={() => (window as any).melt.downloads.showInFolder(dl.savePath)}>Show</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <button className="download-bar-close" onClick={() => setVisible(false)}>×</button>
    </div>
  )
}
