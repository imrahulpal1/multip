import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { mockLecture } from '../utils/mockData'
import { useAppStore } from '../hooks/useAppStore'

export default function LectureViewPage() {
  const navigate = useNavigate()
  const { preferences } = useAppStore()
  // Use user's preferred languages that overlap with available translations, fallback to first available
  const available = Object.keys(lec.multilingualSummary)
  const userLangs = (preferences.preferredLanguages || []).filter((l) => available.includes(l))
  const displayLangs = userLangs.length > 0 ? userLangs : available
  const [lang, setLang] = useState(displayLangs[0] || available[0])
  const [flipped, setFlipped] = useState(null)
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const lec = mockLecture

  const score = submitted
    ? lec.quiz.filter((q, i) => selected[i] === q.answer).length
    : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">{lec.subject} · {lec.duration}</p>
            <h2 className="text-xl font-bold text-white">{lec.title}</h2>
          </div>
          <Button variant="secondary" onClick={() => navigate('/lecture-assistant')}>
            ← Back
          </Button>
        </div>
      </Card>

      {/* Multilingual Summary */}
      <Card title="AI-Generated Summary">
        <div className="flex gap-2 mb-3 flex-wrap">
          {displayLangs.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                lang === l
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-100 rounded-xl bg-slate-900/40 p-3 leading-relaxed">
          {lec.multilingualSummary[lang]}
        </p>
        <p className="mt-3 text-sm text-slate-300 rounded-xl bg-slate-900/40 p-3 leading-relaxed">
          <span className="text-xs uppercase tracking-wide text-slate-400 block mb-1">English</span>
          {lec.summary}
        </p>
      </Card>

      {/* Key Terms Glossary */}
      <Card title="Key Terms Glossary">
        <div className="grid gap-2 sm:grid-cols-2">
          {lec.keyTerms.map((kt) => (
            <div key={kt.term} className="rounded-xl bg-slate-900/40 p-3">
              <p className="text-sm font-semibold text-indigo-300">{kt.term}</p>
              <p className="text-xs text-slate-300 mt-1">{kt.definition}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Flashcards */}
      <Card title="Flashcards">
        <div className="grid gap-3 sm:grid-cols-3">
          {lec.flashcards.map((fc, i) => (
            <button
              key={i}
              onClick={() => setFlipped(flipped === i ? null : i)}
              className="rounded-xl bg-slate-900/40 p-4 text-left transition-all hover:bg-slate-800/60 min-h-[80px]"
            >
              {flipped === i ? (
                <p className="text-sm text-green-300">{fc.a}</p>
              ) : (
                <p className="text-sm text-slate-100">{fc.q}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">{flipped === i ? 'Answer' : 'Tap to reveal'}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Mini Quiz */}
      <Card title="Quick Quiz">
        <div className="space-y-4">
          {lec.quiz.map((q, qi) => (
            <div key={qi}>
              <p className="text-sm text-slate-100 mb-2">{qi + 1}. {q.question}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected[qi] === oi
                  const isCorrect = submitted && oi === q.answer
                  const isWrong = submitted && isSelected && oi !== q.answer
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setSelected((s) => ({ ...s, [qi]: oi }))}
                      className={`rounded-xl px-3 py-2 text-sm text-left transition-all border ${
                        isCorrect
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : isWrong
                          ? 'border-red-500 bg-red-500/20 text-red-300'
                          : isSelected
                          ? 'border-indigo-400 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        {!submitted ? (
          <Button className="mt-4" onClick={() => setSubmitted(true)}>
            Submit Quiz
          </Button>
        ) : (
          <p className="mt-4 text-sm font-semibold text-indigo-300">
            Score: {score}/{lec.quiz.length} {score === lec.quiz.length ? '🎉 Perfect!' : '— Review highlighted answers'}
          </p>
        )}
      </Card>
    </div>
  )
}
