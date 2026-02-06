import { useState, useEffect, useRef } from 'react'

function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [currentChatId, setCurrentChatId] = useState(null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [messages, setMessages] = useState([])
  const eventSourceRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Save to localStorage whenever chats change
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(chats))
  }, [chats])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startNewChat = () => {
    stopStreaming()
    setCurrentChatId(null)
    setMessages([])
    setInput('')
  }

  const selectChat = (chat) => {
    stopStreaming()
    setCurrentChatId(chat.id)
    setMessages(chat.messages)
  }

  const handleSend = () => {
    if (!input.trim() || isStreaming) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    const url = `http://localhost:3001/chat?prompt=${encodeURIComponent(input)}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    let aiResponse = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }])

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        stopStreaming(true, aiResponse, userMessage)
        return
      }

      try {
        const { token } = JSON.parse(event.data)
        aiResponse += token
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: aiResponse }]
          }
          return prev
        })
      } catch (err) {
        console.error('Error parsing token:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err)
      stopStreaming(true, aiResponse, userMessage)
    }
  }

  const stopStreaming = (isFinished = false, finalResponse = '', initialUserMessage = null) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)

    if (isFinished || finalResponse) {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: finalResponse || last.content, isStreaming: false }]
        }
        return prev
      })

      // Update chat history
      setChats(prev => {
        const chatMessages = (initialUserMessage && finalResponse)
          ? [...messages, initialUserMessage, { role: 'assistant', content: finalResponse }]
          : null; // This logic is simplified for now

        // Re-calculate the actual messages to save
        const currentMessages = [...messages];
        if (initialUserMessage) currentMessages.push(initialUserMessage);
        currentMessages.push({ role: 'assistant', content: finalResponse || 'Stream stopped.' });

        if (currentChatId) {
          return prev.map(c => c.id === currentChatId ? { ...c, messages: currentMessages } : c)
        } else {
          const newChat = {
            id: Date.now(),
            title: initialUserMessage?.content.substring(0, 30) || 'New Chat',
            messages: currentMessages,
            date: new Date().toISOString()
          }
          setCurrentChatId(newChat.id)
          return [newChat, ...prev]
        }
      })
    }
  }

  return (
    <div className="flex h-screen bg-[#212121] text-[#ececec] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#171717] flex flex-col border-r border-white/10">
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Chat
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 text-sm truncate transition-colors ${currentChatId === chat.id ? 'bg-[#212121]' : 'hover:bg-white/5'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 text-xs text-gray-500 text-center">
          SSE Chat Demo
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <div className="w-12 h-12 mb-4 rounded-full border border-white/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">How can I help you today?</h1>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-10 px-4 space-y-8">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                      AI
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-[#2f2f2f] text-white'
                      : 'bg-transparent text-[#ececec]'
                    }`}>
                    <div className={msg.isStreaming ? 'streaming-cursor' : ''}>
                      {msg.content}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                      ME
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8">
          <div className="max-w-3xl mx-auto relative group">
            <div className={`flex flex-col bg-[#2f2f2f] rounded-3xl border border-white/10 transition-all ${!isStreaming ? 'hover:border-white/20 focus-within:border-white/20' : ''}`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isStreaming}
                placeholder="Message AI..."
                className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[56px] max-h-48 overflow-y-auto resize-none text-white placeholder-gray-500"
                rows="1"
              />
              <div className="flex justify-end p-2 px-3">
                {isStreaming ? (
                  <button
                    onClick={() => stopStreaming(true, messages[messages.length - 1].content)}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
                    title="Stop generation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${input.trim() ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-gray-600'
                      }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 text-center">
              AI can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
