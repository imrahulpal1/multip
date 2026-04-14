import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { aiService } from '../utils/api'
import { chatSeeds } from '../utils/mockData'

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI Tutor. Ask me anything about language learning.' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async (text = input) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { sender: 'user', text }])
    setInput('')
    setIsTyping(true)
    const reply = await aiService.chat(text)
    setIsTyping(false)
    setMessages((prev) => [...prev, { sender: 'ai', text: reply }])
  }

  return (
    <Card title="AI Chat Tutor" subtitle="Conversational learning with context-aware responses">
      <div className="h-80 space-y-3 overflow-auto rounded-xl bg-slate-900/40 p-3">
        {messages.map((message, idx) => (
          <div key={`${message.sender}-${idx}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                message.sender === 'user'
                  ? 'bg-indigo-500/70 text-white'
                  : 'border border-white/10 bg-slate-800/70 text-slate-100'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-100">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chatSeeds.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100 hover:bg-white/20"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <Button onClick={() => sendMessage()}>Send</Button>
      </div>
    </Card>
  )
}
