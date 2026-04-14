import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../hooks/useAppStore'
import { aiApi } from '../services/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Heart, Clock, Trophy, X, CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'

const FALLBACK_QUESTIONS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  question: `Question ${i + 1}: Which of the following best describes a key concept from this lecture?`,
  options: ['A. Theoretical framework', 'B. Practical application', 'C. Historical context', 'D. Empirical evidence'],
  correctIndex: i % 4,
  topic: 'General',
  explanation: 'This answer best captures the core principle discussed in the lecture.',
  wrongExplanations: [
    'This option describes a different aspect.',
    'While related, this does not directly answer the question.',
    'This is a common misconception.',
    'This option is too broad.',
  ],
}))

const TOTAL_LIVES = 3
const QUESTION_TIME = 20 // seconds per question
const POINTS_PER_CORRECT = 100
const STREAK_BONUS = 50

export default function LectureTestPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addMistakes, recordTestResult, points } = useAppStore()

  const { questions: passedQuestions, language = 'English', discipline = 'General', lectureText } = location.state || {}

  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(!passedQuestions)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [lives, setLives] = useState(TOTAL_LIVES)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [mistakes, setMistakes] = useState([])
  const [phase, setPhase] = useState('playing') // playing | result
  const [showExplanation, setShowExplanation] = useState(false)
  const timerRef = useRef(null)

  // Load questions
  useEffect(() => {
    if (passedQuestions) { setQuestions(passedQuestions); return }
    if (!lectureText) { setQuestions(FALLBACK_QUESTIONS); setLoading(false); return }
    aiApi.generateTest({ lectureText, language, discipline, mistakeTopics: [] })
      .then((d) => setQuestions(d.questions || FALLBACK_QUESTIONS))
      .catch(() => setQuestions(FALLBACK_QUESTIONS))
      .finally(() => setLoading(false))
  }, [])

  // Timer
  useEffect(() => {
    if (!questions || phase !== 'playing' || answered) return
    setTimeLeft(QUESTION_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [current, questions, phase, answered])

  const handleTimeout = () => {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    setSelected(-1)
    setStreak(0)
    setLives((l) => {
      const next = l - 1
      if (next <= 0) setTimeout(() => endGame(), 1200)
      return next
    })
    const q = questions[current]
    setMistakes((m) => [...m, { topic: q.topic, question: q.question, wrongAnswer: 'Timed out', correctAnswer: q.options[q.correctIndex] }])
  }

  const handleSelect = (idx) => {
    if (answered) return
    clearInterval(timerRef.current)
    setSelected(idx)
    setAnswered(true)
    const q = questions[current]
    const correct = idx === q.correctIndex
    if (correct) {
      const bonus = streak >= 2 ? STREAK_BONUS : 0
      setScore((s) => s + POINTS_PER_CORRECT + bonus)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
      setLives((l) => {
        const next = l - 1
        if (next <= 0) setTimeout(() => endGame(), 1500)
        return next
      })
      setMistakes((m) => [...m, { topic: q.topic, question: q.question, wrongAnswer: q.options[idx] || 'Timed out', correctAnswer: q.options[q.correctIndex] }])
    }
  }

  const endGame = () => {
    if (mistakes.length > 0) addMistakes(mistakes)
    const pct = Math.round((score / (questions.length * POINTS_PER_CORRECT)) * 100)
    recordTestResult({ score: pct, pointsEarned: score })
    setPhase('result')
  }

  const next = () => {
    setAnswered(false)
    setSelected(null)
    setShowExplanation(false)
    if (current + 1 >= questions.length || lives <= 0) {
      endGame()
    } else {
      setCurrent((c) => c + 1)
    }
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-3">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
        <p className="text-slate-300 text-sm">Generating your personalised test...</p>
      </div>
    </div>
  )

  if (!questions) return null

  // Result screen
  if (phase === 'result') {
    const pct = Math.round((score / (questions.length * POINTS_PER_CORRECT)) * 100)
    const correct = questions.length - mistakes.length
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <Card>
          <div className="text-center space-y-3 py-4">
            <div className="text-5xl">{pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📚'}</div>
            <h2 className="text-2xl font-bold text-white">{pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}</h2>
            <p className="text-slate-300 text-sm">{language} · {discipline}</p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl bg-slate-900/40 p-3 text-center">
                <p className="text-2xl font-bold text-indigo-300">{score}</p>
                <p className="text-xs text-slate-400">Points Earned</p>
              </div>
              <div className="rounded-xl bg-slate-900/40 p-3 text-center">
                <p className="text-2xl font-bold text-green-300">{correct}/{questions.length}</p>
                <p className="text-xs text-slate-400">Correct</p>
              </div>
              <div className="rounded-xl bg-slate-900/40 p-3 text-center">
                <p className="text-2xl font-bold text-orange-300">{pct}%</p>
                <p className="text-xs text-slate-400">Score</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Wrong answers review */}
        {mistakes.length > 0 && (
          <Card title="Review Mistakes" subtitle="These topics will appear in your next test">
            <div className="space-y-3">
              {mistakes.map((m, i) => (
                <div key={i} className="rounded-xl bg-red-500/10 border border-red-400/20 p-3 space-y-1">
                  <p className="text-xs font-semibold text-red-300">Topic: {m.topic}</p>
                  <p className="text-sm text-slate-200">{m.question}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-red-300 flex items-center gap-1"><XCircle size={12} /> Your answer: {m.wrongAnswer}</span>
                    <span className="text-xs text-green-300 flex items-center gap-1"><CheckCircle size={12} /> Correct: {m.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={() => { setCurrent(0); setScore(0); setLives(TOTAL_LIVES); setStreak(0); setMistakes([]); setAnswered(false); setSelected(null); setPhase('playing') }} variant="secondary">
            <span className="flex items-center gap-2"><RotateCcw size={14} /> Retry</span>
          </Button>
          <Button onClick={() => navigate('/lecture-assistant')}>Back to Lectures</Button>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const timerPct = (timeLeft / QUESTION_TIME) * 100
  const timerColor = timeLeft > 10 ? 'bg-green-400' : timeLeft > 5 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
            <Heart key={i} size={18} className={i < lives ? 'text-red-400 fill-red-400' : 'text-slate-600'} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-xs text-amber-300">
              🔥 {streak}x streak
            </span>
          )}
          <span className="flex items-center gap-1 text-sm text-indigo-300 font-semibold">
            <Trophy size={14} /> {score}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Clock size={14} className={timeLeft <= 5 ? 'text-red-400' : ''} />
          <span className={timeLeft <= 5 ? 'text-red-400 font-bold' : ''}>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-700">
        <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
      </div>

      {/* Question */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400">Question {current + 1} of {questions.length}</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">{q.topic}</span>
        </div>
        <p className="text-base font-medium text-white leading-relaxed">{q.question}</p>

        <div className="mt-4 space-y-2">
          {q.options.map((opt, idx) => {
            let cls = 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-indigo-400'
            if (answered) {
              if (idx === q.correctIndex) cls = 'border-green-500 bg-green-500/20 text-green-200'
              else if (idx === selected) cls = 'border-red-500 bg-red-500/20 text-red-200'
              else cls = 'border-white/5 bg-slate-900/20 text-slate-500'
            }
            return (
              <button
                key={idx}
                disabled={answered}
                onClick={() => handleSelect(idx)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition-all ${cls}`}
              >
                {answered && idx === q.correctIndex && <CheckCircle size={15} className="text-green-400 shrink-0" />}
                {answered && idx === selected && idx !== q.correctIndex && <XCircle size={15} className="text-red-400 shrink-0" />}
                {opt}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mt-4 space-y-2">
            <button onClick={() => setShowExplanation((v) => !v)}
              className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1">
              {showExplanation ? 'Hide' : 'Show'} explanation
            </button>
            {showExplanation && (
              <div className="rounded-xl bg-slate-900/60 p-3 space-y-2">
                <p className="text-xs font-semibold text-green-300 flex items-center gap-1"><CheckCircle size={12} /> Why this is correct:</p>
                <p className="text-xs text-slate-300">{q.explanation}</p>
                {selected !== null && selected !== q.correctIndex && selected >= 0 && (
                  <>
                    <p className="text-xs font-semibold text-red-300 flex items-center gap-1 mt-2"><XCircle size={12} /> Why your answer was wrong:</p>
                    <p className="text-xs text-slate-300">{q.wrongExplanations?.[selected] || 'This option does not correctly address the question.'}</p>
                  </>
                )}
              </div>
            )}
            <Button className="w-full mt-2" onClick={next}>
              <span className="flex items-center justify-center gap-2">
                {current + 1 >= questions.length || lives <= 0 ? 'See Results' : 'Next Question'} <ChevronRight size={15} />
              </span>
            </Button>
          </div>
        )}
      </Card>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 flex-wrap">
        {questions.map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i < current ? 'bg-indigo-400' : i === current ? 'bg-white' : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  )
}
