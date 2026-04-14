import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Lightbulb, List, Loader2, ChevronDown } from 'lucide-react'

// ── Taffy-Pull Accordion ───────────────────────────────────────────────────
function TaffyAccordion({ title, children, accent = '#64ffda' }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-semibold text-slate-200">{title}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <ChevronDown size={13} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, scaleY: 0.6, opacity: 0 }}
            animate={{ height: 'auto', scaleY: 1, opacity: 1 }}
            exit={{ height: 0, scaleY: 0.8, opacity: 0 }}
            transition={{
              height: { type: 'spring', stiffness: 260, damping: 12 },
              scaleY: { type: 'spring', stiffness: 260, damping: 12 },
              opacity: { duration: 0.15 },
            }}
            style={{ transformOrigin: 'top', overflow: 'hidden' }}
          >
            <div
              className="px-3 pb-3 pt-1 border-t border-white/8"
              style={{ borderColor: `${accent}22` }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Blooming Tooltip ───────────────────────────────────────────────────────
function BloomingTooltip({ text }) {
  const [tooltip, setTooltip] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onSelect = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !el.contains(sel.anchorNode)) return
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const parentRect = el.getBoundingClientRect()
      setTooltip({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
        word: sel.toString().trim().slice(0, 60),
      })
    }
    const onDown = (e) => { if (!el.contains(e.target)) setTooltip(null) }
    document.addEventListener('mouseup', onSelect)
    document.addEventListener('mousedown', onDown)
    return () => { document.removeEventListener('mouseup', onSelect); document.removeEventListener('mousedown', onDown) }
  }, [])

  return (
    <div ref={ref} className="relative select-text">
      <p className="text-sm text-slate-200 leading-relaxed">{text}</p>
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="bloom"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            style={{ left: tooltip.x, top: tooltip.y, translateX: '-50%', translateY: '-100%' }}
            className="absolute z-50 pointer-events-none"
          >
            <div className="rounded-xl border border-[#64ffda]/40 bg-slate-900/95 backdrop-blur-xl px-3 py-2 text-xs text-[#64ffda] shadow-lg whitespace-nowrap max-w-[200px] truncate"
              style={{ boxShadow: '0 0 20px rgba(100,255,218,0.2)' }}
            >
              ✦ "{tooltip.word}"
            </div>
            <div className="mx-auto w-2 h-2 rotate-45 border-r border-b border-[#64ffda]/40 bg-slate-900/95 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TABS = [
  { id: 'summary', label: 'Summary', icon: List },
  { id: 'concepts', label: 'Concepts', icon: Lightbulb },
]

// ── Peek Sidebar ───────────────────────────────────────────────────────────
export default function StudySidebar({ data, loading }) {
  const [tab, setTab] = useState('summary')
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      animate={{ width: expanded ? 320 : 48 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="relative flex-shrink-0 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden h-full"
      style={{ minHeight: 400 }}
    >
      {/* Peek tab — always visible */}
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-center justify-center gap-3 z-10">
        <BookOpen size={16} className="text-[#64ffda]" />
        <div className="flex flex-col gap-1">
          {[...'STUDY'].map((ch, i) => (
            <span key={i} className="text-[9px] font-bold text-slate-500 leading-none">{ch}</span>
          ))}
        </div>
      </div>

      {/* Full content — shown when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-12 right-0 top-0 bottom-0 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 pt-4 pb-3 border-b border-white/10">
              <BookOpen size={14} className="text-[#64ffda]" />
              <span className="text-sm font-semibold text-white">Study Guide</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    tab === id ? 'text-[#64ffda] border-b-2 border-[#64ffda]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {loading && (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
                  <Loader2 size={18} className="animate-spin text-[#64ffda]" />
                  <span className="text-xs">Analyzing lecture...</span>
                </div>
              )}

              {!loading && !data && (
                <p className="text-xs text-slate-500 text-center mt-8">
                  Process a lecture to see the AI study guide.
                </p>
              )}

              {!loading && data && tab === 'summary' && (
                <>
                  <TaffyAccordion title="Executive Summary">
                    <BloomingTooltip text={data.executiveSummary} />
                  </TaffyAccordion>
                  <TaffyAccordion title="Key Points">
                    <ul className="space-y-2 mt-1">
                      {(data.keyPoints || []).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#64ffda] shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </TaffyAccordion>
                </>
              )}

              {!loading && data && tab === 'concepts' && (
                <>
                  {(data.coreConcepts || []).map((concept, i) => (
                    <TaffyAccordion key={i} title={concept.title} accent="#a78bfa">
                      <p className="text-xs text-slate-200 leading-relaxed mb-2">{concept.explanation}</p>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-400/20 px-2 py-1.5">
                        <p className="text-xs text-amber-300 font-medium mb-0.5">Analogy</p>
                        <p className="text-xs text-slate-300 italic">{concept.analogy}</p>
                      </div>
                    </TaffyAccordion>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
