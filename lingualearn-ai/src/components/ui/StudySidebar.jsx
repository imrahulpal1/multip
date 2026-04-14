import { useState } from 'react'
import { BookOpen, List, Lightbulb, Loader2 } from 'lucide-react'

const TABS = [
  { id: 'summary', label: 'Summary', icon: List },
  { id: 'concepts', label: 'Concepts', icon: Lightbulb },
]

export default function StudySidebar({ data, loading }) {
  const [tab, setTab] = useState('summary')

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/10">
        <BookOpen size={15} className="text-indigo-400" />
        <span className="text-sm font-semibold text-white">Study Sidebar</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              tab === id
                ? 'text-indigo-300 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-indigo-400" />
            <span className="text-xs">Analyzing lecture...</span>
          </div>
        )}

        {!loading && !data && (
          <p className="text-xs text-slate-500 text-center mt-8">
            Process a lecture to see the AI-generated study guide here.
          </p>
        )}

        {!loading && data && tab === 'summary' && (
          <div className="space-y-4">
            {/* Executive Summary */}
            <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/20 p-3">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2">Executive Summary</p>
              <p className="text-sm text-slate-200 leading-relaxed">{data.executiveSummary}</p>
            </div>

            {/* Key Points */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Key Points</p>
              <ul className="space-y-2">
                {(data.keyPoints || []).map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!loading && data && tab === 'concepts' && (
          <div className="space-y-3">
            {(data.coreConcepts || []).map((concept, i) => (
              <div key={i} className="rounded-xl bg-slate-800/60 border border-white/10 p-3 space-y-2">
                <p className="text-sm font-semibold text-indigo-300">{concept.title}</p>
                <p className="text-xs text-slate-200 leading-relaxed">{concept.explanation}</p>
                <div className="rounded-lg bg-amber-500/10 border border-amber-400/20 px-3 py-2">
                  <p className="text-xs text-amber-300 font-medium mb-0.5">Analogy</p>
                  <p className="text-xs text-slate-300 italic">{concept.analogy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
