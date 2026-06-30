import { useState, useRef, useEffect } from 'react'
import { ChatMessage, ChatRequest } from '../../shared/ai'

interface Props {
  currentUrl: string
  pageTitle: string
  getPageHtml: () => Promise<string>
  onRecipeCreated: (recipe: { name: string; css: string; js: string; domActions: string; urlPattern: string }) => void
  onClose: () => void
}

export default function AISidebar({ currentUrl, pageTitle, getPageHtml, onRecipeCreated, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSend(quickMessage?: string) {
    const text = quickMessage || input.trim()
    if (!text || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      let pageHtml = ''
      try { pageHtml = await getPageHtml() } catch {}

      const req: ChatRequest = {
        messages: newMessages,
        url: currentUrl,
        pageTitle,
        pageHtml,
      }

      const res = await (window as any).melt.ai.chat(req)

      if (!res.success) {
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${res.error}` }])
        return
      }

      setMessages([...newMessages, { role: 'assistant', content: res.message || 'Done.' }])

      if (res.recipe) {
        onRecipeCreated(res.recipe)
      }
    } catch (e: any) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-sidebar">
      <div className="ai-sidebar-header">
        <div className="ai-sidebar-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
          </svg>
          <span>Melt AI</span>
        </div>
        <div className="ai-sidebar-actions">
          <button className="ai-sidebar-btn" onClick={() => setMessages([])} title="Clear chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
          </button>
          <button className="ai-sidebar-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="ai-sidebar-messages">
        {messages.length === 0 && (
          <div className="ai-sidebar-empty">
            <p>Describe how you want to modify this page. I can:</p>
            <ul>
              <li>Change colors, fonts, and layouts</li>
              <li>Hide or remove elements</li>
              <li>Add custom features</li>
              <li>Answer questions about the page</li>
            </ul>
            <div className="ai-quick-actions">
              {['Make it dark mode', 'Hide all ads', 'Make text bigger', 'Simplify the layout'].map(q => (
                <button key={q} className="ai-quick-chip" onClick={() => handleSend(q)}>{q}</button>
              ))}
            </div>
            <p className="ai-sidebar-hint">Changes persist every time you visit this site.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
            <div className="ai-msg-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg ai-msg-assistant">
            <div className="ai-msg-content ai-msg-loading">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-sidebar-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Make the background dark..."
          disabled={loading}
          rows={2}
          className="ai-sidebar-input"
        />
        <button
          className="ai-sidebar-send"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
