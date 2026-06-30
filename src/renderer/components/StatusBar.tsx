interface Props {
  url: string
  recipeCount: number
  isLoading: boolean
  zoomLevel: number
}

export default function StatusBar({ url, recipeCount, isLoading, zoomLevel }: Props) {
  let protocol = ''
  let isSecure = false
  try {
    const u = new URL(url)
    protocol = u.protocol.replace(':', '')
    isSecure = u.protocol === 'https:'
  } catch {}

  return (
    <div className="status-bar">
      <div className="status-left">
        {isLoading && <span className="status-loading">Loading...</span>}
        {!isLoading && protocol && (
          <span className={`status-protocol ${isSecure ? 'secure' : ''}`}>
            {isSecure ? '🔒' : ''} {protocol}
          </span>
        )}
      </div>
      <div className="status-right">
        {recipeCount > 0 && (
          <span className="status-recipes">{recipeCount} recipe{recipeCount !== 1 ? 's' : ''} active</span>
        )}
        {zoomLevel !== 0 && (
          <span className="status-zoom">{Math.round((1 + zoomLevel * 0.1) * 100)}%</span>
        )}
      </div>
    </div>
  )
}
