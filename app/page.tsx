'use client'

import React, { useState, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`)
  const [threadId] = useState('meme_generation_thread')
  const [chatHistory, setChatHistory] = useState<any[]>([])

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory()
  }, [userId, threadId])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat-history?resourceId=${userId}&threadId=${threadId}`)
      const data = await response.json()
      
      if (data.success && data.history) {
        setChatHistory(data.history)
        // Convert history to message format if needed
        const historyMessages = data.history.map((msg: any) => ({
          role: msg.role || 'assistant',
          content: msg.content || msg.text || 'No content'
        }))
        setMessages(historyMessages)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/meme-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          resourceId: userId, 
          threadId: threadId 
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response
        }])
        
        // Reload chat history to get updated conversation
        setTimeout(loadChatHistory, 1000)
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${data.error || 'Something went wrong'}`
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Network error'}`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = async () => {
    setMessages([])
    setChatHistory([])
    // Note: In a real app, you might want to call an API to clear the history from storage
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎭 Mastra Workshop: AI-Powered Meme Generator</h1>
      
      {/* User Session Info */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.5rem', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        💾 <strong>Memory Enabled:</strong> User ID: <code>{userId}</code> | 
        Thread: <code>{threadId}</code> | 
        History: {chatHistory.length} messages
        <button 
          onClick={clearHistory}
          style={{
            marginLeft: '1rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Chat
        </button>
      </div>
      
      {/* Chat Interface */}
      <div style={{ 
        marginTop: '2rem', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px',
        height: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          borderRadius: '12px 12px 0 0'
        }}>
          <h3>💬 Chat with the Meme Generator</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Try: "I'm a brilliant AI engineer but I'm underpaid" | Your conversations are now saved!
          </p>
        </div>

        <div style={{ 
          flex: 1, 
          padding: '1rem', 
          overflowY: 'auto',
          backgroundColor: 'white'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              marginTop: '2rem' 
            }}>
              Start a conversation! Your chat history will be preserved.
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                marginLeft: message.role === 'user' ? '2rem' : 0,
                marginRight: message.role === 'user' ? 0 : '2rem'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '0.8rem',
                  color: message.role === 'user' ? '#1976d2' : '#666',
                  marginBottom: '0.25rem'
                }}>
                  {message.role === 'user' ? '👤 You' : '🤖 Meme Generator'}
                </div>
                <div style={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              fontSize: '0.9rem',
              animation: 'pulse 1.5s infinite'
            }}>
              🤖 Generating meme...
            </div>
          )}
        </div>

        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          borderRadius: '0 0 12px 12px'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Describe your workplace frustration..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '⏳' : '🚀 Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Workshop Info */}
      <div style={{ marginTop: '2rem' }}>
        <h2>🎯 Workshop: Building AI Agents with Memory</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          
          <div style={{ padding: '1.5rem', backgroundColor: '#10b981', color: 'white', borderRadius: '8px' }}>
            <h3>✅ Storage Implemented</h3>
            <p>SQLite storage with LibSQL is now configured! Your conversations persist across sessions.</p>
            <ul style={{ fontSize: '0.9rem', margin: 0 }}>
              <li>LibSQL storage for chat history</li>
              <li>Memory-enabled agents</li> 
              <li>Persistent conversation threads</li>
              <li>User session tracking</li>
            </ul>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px' }}>
            <h3>🔧 Technical Features</h3>
            <p>Mastra framework with complete memory system integration.</p>
            <ul style={{ fontSize: '0.9rem', margin: 0 }}>
              <li>Agent memory with LibSQL</li>
              <li>Chat history API endpoints</li>
              <li>Resource & thread management</li>
              <li>Error handling & fallbacks</li>
            </ul>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '8px' }}>
            <h3>🎨 Try It Out</h3>
            <p>Test the memory system with these examples:</p>
            <ul style={{ fontSize: '0.9rem', margin: 0 }}>
              <li>"I'm frustrated with long meetings"</li>
              <li>"Remember my last meme about deadlines"</li>
              <li>"Create another workplace meme"</li>
              <li>"What did we talk about before?"</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  )
} 