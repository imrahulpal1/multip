import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Button from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { forumApi, setAuthToken } from '../services/api'
import { Languages, MessageSquare, ThumbsUp, ChevronDown, ChevronUp, AlertCircle, Trash2 } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { io } from 'socket.io-client'

const ALL_LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Japanese', 'Portuguese', 'Korean', 'Mandarin Chinese']
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080'

// ── Live Activity Pulse ────────────────────────────────────────────────────
function LivePulse({ active }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex h-2.5 w-2.5">
        {active && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      </div>
      <span className="text-xs text-slate-400">{active ? 'Someone is typing...' : 'No activity'}</span>
    </div>
  )
}

// ── 3D Tilt Card ───────────────────────────────────────────────────────────
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 30 })
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 30 })

  const onMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rotX.set(((e.clientY - cy) / rect.height) * -14)
    rotY.set(((e.clientX - cx) / rect.width) * 14)
  }

  const onMouseLeave = () => { rotX.set(0); rotY.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Flip Doubt Card ────────────────────────────────────────────────────────
function DoubtCard({ q, viewerLanguage, onUpvote, onReply, onDelete, typingId, isOwner }) {
  const [flipped, setFlipped] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplies, setShowReplies] = useState(false)
  const [replying, setReplying] = useState(false)

  const sourceLang = q.sourceLanguage || q.language
  const isSameLang = sourceLang === viewerLanguage
  const displayTitle = showOriginal ? q.title : (q.translatedTitle || q.title)
  const displayContent = showOriginal ? q.content : (q.translatedContent || q.content)
  const isTyping = typingId === (q._id || q.id)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setReplying(true)
    await onReply(replyText)
    setReplyText('')
    setShowReplies(true)
    setReplying(false)
  }

  return (
    <TiltCard className="break-inside-avoid mb-4">
      <div style={{ perspective: 1000 }} className="relative">
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          style={{ transformStyle: 'preserve-3d', position: 'relative' }}
        >
          {/* Front */}
          <div
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white leading-snug">{displayTitle}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-400">
                    in <span className="text-indigo-300">{sourceLang}</span>
                  </span>
                  {!isSameLang && (
                    <button
                      onClick={() => setShowOriginal((v) => !v)}
                      className="flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200 transition-colors"
                    >
                      <Languages size={11} />
                      {showOriginal ? `Show ${viewerLanguage}` : `Show original`}
                    </button>
                  )}
                  {q.technicalTerms?.map((t) => (
                    <span key={t} className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-xs text-amber-200">{t}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={onUpvote}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-slate-200 transition-all"
              >
                <ThumbsUp size={12} /> {q.upvotes}
              </button>
              {isOwner && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs text-red-300 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <p className="rounded-xl bg-slate-900/50 p-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>

            <LivePulse active={isTyping} />

            {/* Translate flip button */}
            {!isSameLang && (
              <button
                onClick={() => setFlipped(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-[#64ffda] hover:text-[#64ffda]/80 transition-colors"
              >
                <Languages size={13} /> Flip to see translation
              </button>
            )}

            {q.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <MessageSquare size={12} /> {q.replies.length} {q.replies.length === 1 ? 'reply' : 'replies'}
                {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            {showReplies && (
              <div className="space-y-2 pl-3 border-l-2 border-white/10">
                {q.replies.map((reply) => (
                  <ReplyCard key={reply._id || reply.id} reply={reply} viewerLanguage={viewerLanguage} />
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                placeholder={`Reply in ${viewerLanguage}...`}
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <Button variant="secondary" onClick={handleReply} disabled={replying}>
                {replying ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" /> : 'Reply'}
              </Button>
            </div>
          </div>

          {/* Back (translation) */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#64ffda]/30 bg-slate-900/95 backdrop-blur-xl p-4 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-3">
                Translation · {viewerLanguage}
              </p>
              <p className="font-semibold text-white mb-2">{q.translatedTitle || q.title}</p>
              <p className="text-sm text-slate-200 leading-relaxed">{q.translatedContent || q.content}</p>
            </div>
            <button
              onClick={() => setFlipped(false)}
              className="mt-4 text-xs text-slate-400 hover:text-white transition-colors self-start"
            >
              ← Flip back
            </button>
          </div>
        </motion.div>
      </div>
    </TiltCard>
  )
}

function ReplyCard({ reply, viewerLanguage }) {
  const [showOriginal, setShowOriginal] = useState(false)
  const sourceLang = reply.sourceLanguage || reply.language
  const isSameLang = sourceLang === viewerLanguage
  const display = showOriginal ? reply.content : (reply.translatedContent || reply.content)

  return (
    <div className="rounded-xl bg-slate-800/40 p-3 text-sm text-slate-200 space-y-1">
      <p className="leading-relaxed">{display}</p>
      {!isSameLang && (
        <button
          onClick={() => setShowOriginal((v) => !v)}
          className="flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200 transition-colors"
        >
          <Languages size={10} />
          {showOriginal ? `Show ${viewerLanguage}` : `Original (${sourceLang})`}
        </button>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PeerLearningPage() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [questionLanguage, setQuestionLanguage] = useState('Hindi')
  const [forumThreads, setForumThreads] = useState([])
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [typingId, setTypingId] = useState(null)
  const { preferences, completeChallenge } = useAppStore()
  const viewerLanguage = preferences.nativeLanguage || 'English'
  const socketRef = useRef(null)

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setAuthToken(`clerk:${user.primaryEmailAddress.emailAddress}`)
    }
  }, [user])

  const loadThreads = useCallback(async () => {
    try {
      const data = await forumApi.list(viewerLanguage)
      setForumThreads(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('loadThreads failed:', e.message)
    }
  }, [viewerLanguage])

  useEffect(() => { loadThreads() }, [loadThreads])

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 5000,
    })
    socketRef.current = socket
    socket.on('discussion:new', () => loadThreads())
    socket.on('discussion:reply', () => loadThreads())
    socket.on('discussion:deleted', () => loadThreads())
    socket.on('discussion:typing', ({ threadId }) => {
      setTypingId(threadId)
      setTimeout(() => setTypingId(null), 3000)
    })
    socket.on('connect_error', () => {})
    return () => socket.disconnect()
  }, [loadThreads])

  const handlePost = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    const email = user?.primaryEmailAddress?.emailAddress
    if (!email) { setError('You must be signed in'); return }
    setAuthToken(`clerk:${email}`)
    setError('')
    setPosting(true)
    try {
      await forumApi.create({ title, content: body, language: questionLanguage })
      setTitle(''); setBody(''); setIsOpen(false)
      await loadThreads()
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to post. Is the server running?')
    } finally {
      setPosting(false) }
  }

  const handleDelete = async (threadId) => {
    if (user?.primaryEmailAddress?.emailAddress) setAuthToken(`clerk:${user.primaryEmailAddress.emailAddress}`)
    try {
      await forumApi.remove(threadId)
      await loadThreads()
    } catch (e) { console.error('Delete failed:', e.message) }
  }

  const handleReply = async (threadId, content) => {
    try {
      await forumApi.reply(threadId, { content, language: viewerLanguage })
      completeChallenge('w1')
      await loadThreads()
    } catch (e) { console.error('Reply failed:', e.message) }
  }

  const handleUpvote = async (threadId) => {
    if (user?.primaryEmailAddress?.emailAddress) setAuthToken(`clerk:${user.primaryEmailAddress.emailAddress}`)
    try {
      await forumApi.upvote(threadId)
      completeChallenge('w1')
      await loadThreads()
    } catch (e) { console.error('Upvote failed:', e.message) }
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-1">Peer Learning Hub</p>
        <p className="text-xs text-slate-400 mb-4">Ask doubts in your language — everyone sees it in theirs</p>
        <Button onClick={() => { setError(''); setIsOpen(true) }}>Ask Question</Button>
      </motion.div>

      {/* Masonry grid */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
        {forumThreads.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-12">No questions yet — be the first to ask!</p>
        )}
        {forumThreads.map((q) => (
          <DoubtCard
            key={q._id || q.id}
            q={q}
            viewerLanguage={viewerLanguage}
            typingId={typingId}
            isOwner={q.user?.toString() === user?.id || q.userEmail === user?.primaryEmailAddress?.emailAddress}
            onUpvote={() => handleUpvote(q._id)}
            onReply={(text) => handleReply(q._id, text)}
            onDelete={() => handleDelete(q._id)}
          />
        ))}
      </div>

      {/* Ask modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 grid place-items-center bg-slate-950/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-5 space-y-4"
            >
              <h3 className="text-lg font-semibold text-white">Ask a New Question</h3>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-3 py-2 text-sm text-red-300">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 mb-1">Your language</p>
                <select
                  value={questionLanguage}
                  onChange={(e) => setQuestionLanguage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  {ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Question title"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe your doubt in detail..."
                className="h-28 w-full rounded-xl border border-white/10 bg-slate-800 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
              <p className="text-xs text-slate-500">
                AI will auto-translate your question for all other users while preserving technical terms.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handlePost} disabled={posting}>
                  {posting
                    ? <span className="flex items-center gap-2"><span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />Posting...</span>
                    : 'Post Question'
                  }
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
