import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationFrame, useMotionValue } from 'framer-motion'
import { contextAwareExplain } from '../utils/learningEngines'
import { useAppStore } from '../hooks/useAppStore'
import { chatSeeds } from '../utils/mockData'
import { Send, Sparkles, Brain } from 'lucide-react'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'openai/gpt-oss-120b:free',
]

async function askAI(messages, language, discipline) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('No API key')

  const systemPrompt = `You are LinguaLearn AI, an expert multilingual language tutor.

Your job:
1. When the user sends ANY text or phrase — translate it into ${language} and explain it.
2. When the user asks a question — answer it clearly and educationally in ${language}.
3. When the user asks to quiz, roleplay, or practice — do exactly that in ${language}.

Subject context: ${discipline}.

Rules:
- ALWAYS respond in ${language} language.
- For translations: show the translated text clearly, then explain 2-3 key words/phrases.
- For questions: give a direct answer with a practical example.
- Keep responses concise (3-6 sentences max unless asked for more).
- Never say you cannot help. Always provide a useful response.
- Do NOT respond in English unless ${language} is English.`

  for (const model of MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LinguaLearn AI',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.warn(`[OpenRouter] ${model} HTTP ${res.status}:`, json?.error?.message || json)
        continue
      }
      const content = json.choices?.[0]?.message?.content?.trim()
      if (content) return content
      console.warn(`[OpenRouter] ${model} returned empty content`)
    } catch (err) {
      console.warn(`[OpenRouter] ${model} fetch error:`, err.message)
    }
  }
  throw new Error('All models failed')
}

const DISCIPLINES = ['General', 'Biology', 'Physics', 'History', 'Mathematics', 'Computer Science', 'Economics']
const ALL_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Arabic', 'Mandarin', 'Korean', 'Portuguese']

// ── 1. Neural Network Canvas Background ───────────────────────────────────
function NeuralBackground() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const particles = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1.5 + Math.random() * 2,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const pts = particles.current

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(139,92,246,${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw particles + mouse repulsion
      pts.forEach((p) => {
        const mdx = p.x - mouse.current.x
        const mdy = p.y - mouse.current.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < 100) {
          p.vx += (mdx / mdist) * 0.6
          p.vy += (mdy / mdist) * 0.6
        }
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(167,139,250,0.6)'
        ctx.shadowColor = '#7c3aed'
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />
}

// ── 2. AI Thinking Animation ───────────────────────────────────────────────
function AIThinking() {
  const dots = Array.from({ length: 9 }, (_, i) => ({
    x: (i % 3) * 14 - 14,
    y: Math.floor(i / 3) * 14 - 14,
  }))
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-slate-800/70 w-fit">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {dots.map((d, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-violet-400"
            style={{ left: d.x + 16, top: d.y + 16 }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
              x: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4],
              y: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4],
            }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <span className="text-xs text-violet-300 font-medium">AI is thinking...</span>
    </div>
  )
}

// ── 3. Border-Beam Input ───────────────────────────────────────────────────
function BorderBeamInput({ value, onChange, onKeyDown, placeholder, onSend, isSending }) {
  const [focused, setFocused] = useState(false)
  const angle = useMotionValue(0)
  useAnimationFrame((t) => { if (focused) angle.set((t / 8) % 360) })

  return (
    <div className="flex gap-2 items-end">
      <div className="relative flex-1">
        {/* Beam border */}
        {focused && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `conic-gradient(from ${angle.get()}deg at 50% 50%, transparent 0deg, #06b6d4 60deg, #8b5cf6 120deg, transparent 180deg)`,
              padding: '1.5px',
              borderRadius: '1rem',
            }}
          >
            <div className="w-full h-full rounded-2xl bg-slate-900" />
          </motion.div>
        )}
        <motion.div
          animate={{ boxShadow: focused ? '0 0 0 1px rgba(139,92,246,0.4), 0 0 20px rgba(139,92,246,0.1)' : '0 0 0 1px rgba(255,255,255,0.08)' }}
          className="rounded-2xl overflow-hidden"
        >
          <input
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="w-full bg-slate-900/80 backdrop-blur-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none rounded-2xl"
            style={{ caretColor: '#8b5cf6' }}
          />
        </motion.div>
      </div>

      {/* Translation Portal Send Button */}
      <motion.button
        onClick={onSend}
        disabled={isSending || !value.trim()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl overflow-hidden disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
      >
        <motion.div
          animate={isSending ? { rotate: 360 } : { rotate: 0 }}
          transition={isSending ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          {isSending ? <Sparkles size={16} className="text-white" /> : <Send size={15} className="text-white" />}
        </motion.div>
        {/* Portal ripple on send */}
        <AnimatePresence>
          {isSending && (
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-cyan-400"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

// ── 4. Suggestion Pill with Pop animation ─────────────────────────────────
function SuggestionPill({ text, onSelect }) {
  const [popped, setPopped] = useState(false)

  const handleClick = () => {
    setPopped(true)
    setTimeout(() => onSelect(text), 300)
  }

  return (
    <AnimatePresence>
      {!popped && (
        <motion.button
          layout
          initial={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -3, boxShadow: '0 0 16px rgba(139,92,246,0.4)' }}
          whileTap={{ scale: 1.15 }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
          onClick={handleClick}
          className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 hover:border-violet-400/60 hover:bg-violet-500/20 transition-colors"
        >
          {text}
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ── 5. Message Bubble ──────────────────────────────────────────────────────
function MessageBubble({ msg, isNew }) {
  const isUser = msg.sender === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mr-2 mt-1 shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}>
          <Brain size={13} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
        {!isUser && msg.language && (
          <span className="text-[10px] text-violet-400 px-1">{msg.language} · {msg.discipline}</span>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'text-white'
            : 'border border-white/10 bg-slate-800/60 backdrop-blur-sm text-slate-100'
        }`}
          style={isUser ? { background: 'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(139,92,246,0.8))', backdropFilter: 'blur(12px)' } : {}}
        >
          {/* Portal "beam in" effect for AI messages */}
          {!isUser && isNew ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {msg.text}
            </motion.span>
          ) : msg.text}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AITutorPage() {
  const { preferences } = useAppStore()
  const [language, setLanguage] = useState(preferences.targetLanguage || 'English')
  const [discipline, setDiscipline] = useState('General')
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hello! I'm your AI language tutor. Type anything and I'll translate and explain it in ${preferences.targetLanguage || 'English'}.`, language: preferences.targetLanguage || 'English', discipline: 'General' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newMsgIdx, setNewMsgIdx] = useState(-1)
  const [pills, setPills] = useState(chatSeeds.slice(0, 6))
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || isTyping) return

    const newUserMsg = { sender: 'user', text: msg, language, discipline }
    setInput('')
    setMessages((prev) => [...prev, newUserMsg])
    setIsTyping(true)
    setIsSending(true)

    // Build conversation history for the AI (last 10 messages for context)
    const history = [...messages, newUserMsg].slice(-10).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    try {
      const reply = await askAI(history, language, discipline)
      setMessages((prev) => {
        setNewMsgIdx(prev.length)
        return [...prev, { sender: 'ai', text: reply, language, discipline }]
      })
    } catch {
      const fallback = contextAwareExplain({
        question: msg,
        language,
        discipline: discipline === 'General' ? 'default' : discipline.toLowerCase(),
      })
      setMessages((prev) => {
        setNewMsgIdx(prev.length)
        return [...prev, { sender: 'ai', text: fallback, language, discipline }]
      })
    } finally {
      setIsTyping(false)
      setIsSending(false)
    }
  }, [input, language, discipline, isTyping, messages])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const selectCls = 'rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer'

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col">
      {/* Neural Network Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NeuralBackground />
        {/* Deep indigo ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full space-y-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* AI Orb */}
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.4)', '0 0 40px rgba(6,182,212,0.4)', '0 0 20px rgba(124,58,237,0.4)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}
              >
                <Brain size={18} className="text-white" />
              </motion.div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Language Tutor</h2>
                <p className="text-xs text-slate-400">Context-aware explanations · Neural translation</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Language</span>
                <select className={selectCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {ALL_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Subject</span>
                <select className={selectCls} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                  {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <motion.span
                  key={language + discipline}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-cyan-300 border border-cyan-400/30 bg-cyan-400/10"
                >
                  {language} · {discipline}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat window */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} isNew={idx === newMsgIdx} />
              ))}
            </AnimatePresence>

            {/* AI Thinking */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex justify-start"
                >
                  <AIThinking />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Suggestion pills */}
          <div className="px-4 pb-2">
            <AnimatePresence>
              {pills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 py-2 border-t border-white/5"
                >
                  {pills.map((p) => (
                    <SuggestionPill
                      key={p}
                      text={p}
                      onSelect={(t) => {
                        setPills((prev) => prev.filter((x) => x !== t))
                        sendMessage(t)
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <BorderBeamInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Translate or ask anything in ${language}...`}
              onSend={() => sendMessage(input)}
              isSending={isTyping}
            />
            <p className="text-[10px] text-slate-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
