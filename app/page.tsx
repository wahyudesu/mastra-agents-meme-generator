'use client'

import React, { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response
        }])
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

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎭 Mastra Workshop: AI-Powered Meme Generator</h1>
      
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
            Try: "I'm a brilliant AI engineer but I'm underpaid"
          </p>
        </div>
        
        <div style={{ 
          flex: 1, 
          padding: '1rem', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
              Share your workplace frustrations to get started! 🚀
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: message.role === 'user' ? '#0070f3' : '#f1f5f9',
              color: message.role === 'user' ? 'white' : 'black',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              alignSelf: 'flex-start',
              maxWidth: '80%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0070f3',
                  animation: 'pulse 1.5s infinite'
                }}></div>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0070f3',
                  animation: 'pulse 1.5s infinite 0.5s'
                }}></div>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0070f3',
                  animation: 'pulse 1.5s infinite 1s'
                }}></div>
                <span style={{ marginLeft: '0.5rem', color: '#666' }}>Generating...</span>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Describe your workplace frustrations..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
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
              backgroundColor: isLoading || !input.trim() ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Rest of the existing content */}
      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Turn your workplace frustrations into shareable memes using AI agents and tools!
        </p>
        
        {/* Hero Section */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '2rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h2>🚀 How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3>1. 😤 Share Frustrations</h3>
              <p>Tell our AI about your work frustrations - meetings, processes, technology issues, etc.</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3>2. 🔍 Extract & Categorize</h3>
              <p>AI analyzes your input and categorizes frustrations using structured generation.</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3>3. 🎨 Find Meme Template</h3>
              <p>Search Imgflip API for the perfect meme template that matches your frustrations.</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3>4. 🤖 Generate Meme</h3>
              <p>Use OpenAI DALL-E to create a custom meme based on your frustrations.</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3>5. 📤 Share & Enjoy</h3>
              <p>Get a shareable URL and spread the laughs with your coworkers!</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div style={{ marginTop: '2rem' }}>
          <h2>🎮 Try It Out</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              borderRadius: '8px',
              flex: '1',
              minWidth: '300px'
            }}>
              <h3>🎪 Mastra Playground</h3>
              <p>The easiest way to test the meme generator! Mastra automatically provides a playground interface.</p>
              <p><strong>Just run:</strong> <code style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>npm run dev</code></p>
              <p>Then visit the Mastra playground to chat with the meme generator agent.</p>
            </div>
            
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#10b981', 
              color: 'white', 
              borderRadius: '8px',
              flex: '1',
              minWidth: '300px'
            }}>
              <h3>🔧 API Testing</h3>
              <p>Test the meme generator programmatically using our API endpoint.</p>
              <p><strong>Endpoint:</strong> <code style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>POST /api/meme-generator</code></p>
              <p>Send your frustrations and get memes back!</p>
            </div>
          </div>
        </div>

        {/* Example Frustrations */}
        <div style={{ marginTop: '2rem' }}>
          <h2>💡 Example Frustrations to Try</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <h4>🏢 Meeting Madness</h4>
              <p><em>"My meetings always run over time and half the people don't even need to be there. We spend more time talking about work than actually doing it!"</em></p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <h4>⚙️ Process Problems</h4>
              <p><em>"The deployment process is broken, code reviews take forever, and our standup meetings are pointless. Everything takes twice as long as it should."</em></p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h4>🔄 Communication Chaos</h4>
              <p><em>"I'm so tired of explaining the same thing over and over to different stakeholders. Why can't we just document things properly?"</em></p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div style={{ marginTop: '2rem' }}>
          <h2>🛠️ What You'll Learn</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4>🤖 Mastra Agents</h4>
              <p>Build conversational AI agents that orchestrate multiple tools</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4>🔧 Mastra Tools</h4>
              <p>Create modular, reusable tools for specific tasks</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4>📊 Structured Generation</h4>
              <p>Use Vercel AI SDK with Zod for reliable data extraction</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4>🌐 API Integration</h4>
              <p>Connect to external services like Imgflip and OpenAI</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4>🔄 Agentic Workflows</h4>
              <p>Chain multiple tools together for complex tasks</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4>🧪 Testing Strategies</h4>
              <p>Test AI-powered workflows locally with Mastra</p>
            </div>
          </div>
        </div>

        {/* Setup Requirements */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fed7aa' }}>
          <h3>⚙️ Setup Requirements</h3>
          <p>To use the full meme generation workflow, you'll need:</p>
          <ul>
            <li><strong>OpenAI API Key:</strong> For DALL-E image generation (set <code>OPENAI_API_KEY</code> in your <code>.env</code> file)</li>
            <li><strong>Node.js 18+:</strong> For running the Mastra application</li>
            <li><strong>Internet Connection:</strong> For accessing Imgflip API and image hosting services</li>
          </ul>
          <p><strong>Note:</strong> Some tools will work without API keys (like frustration extraction), but image generation requires OpenAI access.</p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
          <h3>🎉 Ready to Turn Frustrations into Fun?</h3>
          <p>Start the development server and visit the Mastra playground to begin generating memes!</p>
          <div style={{ marginTop: '1rem' }}>
            <code style={{ 
              backgroundColor: '#1e293b', 
              color: '#f1f5f9', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px',
              fontSize: '1.1rem'
            }}>
              npm run dev
            </code>
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