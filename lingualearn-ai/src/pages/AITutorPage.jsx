import { useState, useRef, useEffect } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { aiService } from '../utils/api'
import { contextAwareExplain } from '../utils/learningEngines'
import { useAppStore } from '../hooks/useAppStore'
import { chatSeeds } from '../utils/mockData'

const DISCIPLINES = ['General', 'Biology', 'Physics', 'History', 'Mathematics']
const ALL_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Arabic', 'Mandarin', 'Korean', 'Portuguese']

export default function AITutorPage() {
  const { preferences } = useAppStore()

  // Always show full language list in dropdown
  const availableLangs = ALL_LANGUAGES

  const [language, setLanguage] = useState(preferences.targetLanguage || 'English')
  const [discipline, setDiscipline] = useState('General')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Type any text and I'll translate it to ${language}.`,
      language,
      discipline: 'General',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text = input) => {
    if (!text.trim()) return
    const userMsg = { sender: 'user', text, language, discipline }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Generate context-aware explanation locally first
    const contextReply = contextAwareExplain({
      question: text,
      language,
      discipline: discipline === 'General' ? 'default' : discipline.toLowerCase(),
    })

    // Try real API, fall back to context-aware local response
    try {
      const data = await aiService.chat(text, language, discipline)
      const reply = data || contextReply
      setMessages((prev) => [...prev, { sender: 'ai', text: reply, language, discipline }])
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: contextReply, language, discipline }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const selectCls = 'rounded-xl border border-white/10 bg-slate-900/50 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <div className="space-y-4">
      <Card title="AI Chat Tutor" subtitle="Context-aware explanations in your preferred language">

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Explanation Language</span>
            <select className={selectCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {availableLangs.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Subject Context</span>
            <select className={selectCls} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
              {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs text-indigo-300">
              {language} · {discipline}
            </span>
          </div>
        </div>

        {/* Chat window */}
        <div className="h-80 space-y-3 overflow-auto rounded-xl bg-slate-900/40 p-3">
          {messages.map((message, idx) => (
            <div key={idx} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] space-y-1 ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                {message.sender === 'ai' && message.discipline && message.discipline !== 'General' && (
                  <span className="text-xs text-indigo-400 px-1">
                    {message.language} · {message.discipline}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-indigo-500/70 text-white'
                      : 'border border-white/10 bg-slate-800/70 text-slate-100'
                  }`}
                >
                  {message.text}
                </div>
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
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        <div className="mt-3 flex flex-wrap gap-2">
          {chatSeeds.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100 hover:bg-white/20 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Type text to translate to ${language}...`}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Button onClick={() => sendMessage()}>Send</Button>
        </div>
      </Card>
    </div>
  )
}
