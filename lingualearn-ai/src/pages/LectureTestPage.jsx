import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../hooks/useAppStore'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Heart, Clock, Trophy, CheckCircle, XCircle, ChevronRight, RotateCcw, AlertCircle } from 'lucide-react'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-7b-instruct:free',
]

async function generateQuestionsWithAI(lectureText, language, discipline) {
  const prompt = `You are a quiz generator. Read the lecture below and generate exactly 12 multiple-choice questions in ${language} language.

Rules:
- ALL questions, options, explanations MUST be written in ${language}
- Base questions ONLY on the lecture content
- Each question must have exactly 4 options labeled A, B, C, D
- Return ONLY valid JSON, no markdown, no extra text

JSON format:
{"questions":[{"id":1,"topic":"topic name","question":"question text in ${language}","options":["A. option","B. option","C. option","D. option"],"correctIndex":0,"explanation":"why correct answer is right, in ${language}","wrongExplanations":["why A wrong","why B wrong","why C wrong","why D wrong"]}]}

Lecture content:
${lectureText.slice(0, 5000)}`

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('No API key')

  for (const model of MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LinguaLearn AI',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 6000,
        }),
      })
      const json = await res.json()
      console.log('[AI Test] model:', model, 'status:', res.status, 'response:', json)
      const content = json.choices?.[0]?.message?.content
      if (!content) continue
      const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed = JSON.parse(cleaned)
      if (parsed.questions?.length) return parsed.questions
    } catch (e) { console.warn('[AI Test] model failed:', model, e.message); continue }
  }
  throw new Error('All models failed')
}

const DEMO_TEXT_EN = `What is Cloud Computing?
Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing. Instead of buying, owning, and maintaining physical data centers and servers, you can access technology services, such as computing power, storage, and databases, from cloud providers like Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP).

Key Characteristics:
On-demand self-service: Provision resources automatically without human interaction with service providers.
Broad network access: Capabilities are available over the network and accessed through standard mechanisms (mobile phones, tablets, laptops).
Resource pooling: The provider's computing resources are pooled to serve multiple consumers using a multi-tenant model.
Rapid elasticity: Resources can be elastically provisioned and scale rapidly outward and inward commensurate with demand.
Measured service: Cloud systems automatically control and optimize resource use by leveraging a metering capability.

Cloud Service Models:
Infrastructure as a Service (IaaS): Contains the basic building blocks for cloud IT. Provides access to networking features, computers (virtual or on dedicated hardware), and data storage space.
Platform as a Service (PaaS): Removes the need for organizations to manage the underlying infrastructure and allows you to focus on the deployment and management of your applications.
Software as a Service (SaaS): Provides you with a completed product that is run and managed by the service provider (e.g., Gmail, Salesforce, Microsoft 365).`

const FALLBACK_QUESTIONS = [
  { id: 1, topic: 'Cloud Computing', question: 'What is cloud computing?', options: ['A. On-demand delivery of IT resources over the internet', 'B. Buying and owning physical data centers', 'C. A type of local area network', 'D. A programming language'], correctIndex: 0, explanation: 'Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing.', wrongExplanations: ['This is correct.', 'Buying physical infrastructure is the traditional model cloud replaces.', 'LANs are local networks, unrelated to cloud.', 'Cloud computing is a delivery model, not a language.'] },
  { id: 2, topic: 'Cloud Computing', question: 'Which pricing model does cloud computing use?', options: ['A. Annual flat fee', 'B. Pay-as-you-go', 'C. One-time purchase', 'D. Free forever'], correctIndex: 1, explanation: 'Cloud computing uses pay-as-you-go pricing — you only pay for what you use.', wrongExplanations: ['Annual flat fees are not the standard cloud model.', 'This is correct.', 'One-time purchase applies to traditional software licenses.', 'Cloud services are not free.'] },
  { id: 3, topic: 'IaaS', question: 'What does IaaS stand for?', options: ['A. Internet as a Service', 'B. Integration as a Service', 'C. Infrastructure as a Service', 'D. Information as a Service'], correctIndex: 2, explanation: 'IaaS stands for Infrastructure as a Service — it provides raw computing resources like servers and storage.', wrongExplanations: ['Internet as a Service is not a cloud model.', 'Integration as a Service is not a standard cloud tier.', 'This is correct.', 'Information as a Service is not a cloud service model.'] },
  { id: 4, topic: 'PaaS', question: 'Which cloud service model removes the need to manage underlying infrastructure?', options: ['A. IaaS', 'B. PaaS', 'C. SaaS', 'D. DaaS'], correctIndex: 1, explanation: 'PaaS removes the need to manage hardware and OS, letting developers focus on application deployment.', wrongExplanations: ['IaaS still requires users to manage OS and above.', 'This is correct.', 'SaaS is a finished product, not a development platform.', 'DaaS is not one of the three main cloud models.'] },
  { id: 5, topic: 'SaaS', question: 'Which of the following is an example of SaaS?', options: ['A. AWS EC2', 'B. Heroku', 'C. Gmail', 'D. Docker'], correctIndex: 2, explanation: 'Gmail is a SaaS product — a fully managed application you access via browser without managing any infrastructure.', wrongExplanations: ['AWS EC2 is an IaaS product.', 'Heroku is a PaaS platform.', 'This is correct.', 'Docker is a containerization tool, not a SaaS product.'] },
  { id: 6, topic: 'Cloud Characteristics', question: 'What does rapid elasticity mean in cloud computing?', options: ['A. The ability to stretch physical servers', 'B. Resources that scale up or down based on demand', 'C. A billing feature for large enterprises', 'D. A type of network protocol'], correctIndex: 1, explanation: 'Rapid elasticity means cloud resources can be provisioned and released quickly to match demand.', wrongExplanations: ['Physical servers cannot be stretched.', 'This is correct.', 'Elasticity is not a billing feature.', 'It is not a network protocol.'] },
  { id: 7, topic: 'Cloud Characteristics', question: 'What is resource pooling in cloud computing?', options: ['A. Storing data in a swimming pool', 'B. Sharing computing resources among multiple consumers using a multi-tenant model', 'C. Dedicating one server per customer', 'D. Pooling monthly invoices'], correctIndex: 1, explanation: 'Resource pooling means the provider shares computing resources across multiple consumers using a multi-tenant model.', wrongExplanations: ['This is not related to physical pools.', 'This is correct.', 'Dedicated servers per customer is the opposite of pooling.', 'Pooling invoices is a billing concept.'] },
  { id: 8, topic: 'Cloud Providers', question: 'Which cloud providers are mentioned in the lecture?', options: ['A. IBM, Oracle, SAP', 'B. AWS, Azure, GCP', 'C. Salesforce, Shopify, Stripe', 'D. Netflix, Spotify, Uber'], correctIndex: 1, explanation: 'The lecture mentions Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP).', wrongExplanations: ['IBM and Oracle are not mentioned.', 'This is correct.', 'These are SaaS apps, not cloud providers.', 'These are consumer apps, not cloud providers.'] },
  { id: 9, topic: 'Cloud Characteristics', question: 'What does on-demand self-service mean in cloud computing?', options: ['A. Calling a helpdesk to provision resources', 'B. Provisioning resources automatically without human interaction with the provider', 'C. Ordering physical hardware online', 'D. A self-checkout system at a store'], correctIndex: 1, explanation: 'On-demand self-service means users can provision resources automatically without contacting the provider.', wrongExplanations: ['Calling a helpdesk contradicts self-service.', 'This is correct.', 'Ordering physical hardware is the traditional model.', 'This analogy does not apply.'] },
  { id: 10, topic: 'Cloud Characteristics', question: 'What does measured service mean in cloud computing?', options: ['A. Measuring the physical size of servers', 'B. Automatically controlling and optimizing resource use via metering', 'C. A fixed monthly measurement report', 'D. Measuring internet speed'], correctIndex: 1, explanation: 'Measured service means cloud systems automatically monitor and optimize resource usage, enabling pay-as-you-go billing.', wrongExplanations: ['Physical server size is irrelevant.', 'This is correct.', 'It is dynamic metering, not a fixed report.', 'Internet speed is unrelated.'] },
  { id: 11, topic: 'IaaS', question: 'Which service model gives you the most control over the operating system?', options: ['A. SaaS', 'B. PaaS', 'C. IaaS', 'D. All equally'], correctIndex: 2, explanation: 'IaaS gives users control over the OS, runtime, and applications — only physical hardware is managed by the provider.', wrongExplanations: ['SaaS gives no control over OS.', 'PaaS abstracts the OS away.', 'This is correct.', 'Each model offers different levels of control.'] },
  { id: 12, topic: 'Cloud Characteristics', question: 'What does broad network access mean in cloud computing?', options: ['A. Access limited to office networks only', 'B. Capabilities available over the network via standard devices like phones and laptops', 'C. A high-speed fibre connection', 'D. Access only through desktop computers'], correctIndex: 1, explanation: 'Broad network access means cloud services are available over the internet and accessible through standard devices like phones, tablets, and laptops.', wrongExplanations: ['Cloud access is not limited to office networks.', 'This is correct.', 'Broad access is about availability, not connection speed.', 'Cloud services are accessible from any device.'] },
]

const TOTAL_LIVES = 3
const QUESTION_TIME = 25
const POINTS_PER_CORRECT = 100
const STREAK_BONUS = 50

export default function LectureTestPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addMistakes, recordTestResult } = useAppStore()

  const { language = 'English', discipline = 'General', lectureText } = location.state || {}

  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [lives, setLives] = useState(TOTAL_LIVES)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [answeredLog, setAnsweredLog] = useState([]) // { question, selected, correctIndex, options, explanation, wrongExplanations, topic, correct }
  const [phase, setPhase] = useState('playing')
  const [showExplanation, setShowExplanation] = useState(false)
  const timerRef = useRef(null)

  const loadingSteps = [
    `Reading lecture content...`,
    `Analysing key concepts...`,
    `Generating questions in ${language}...`,
    `Preparing your test...`,
  ]

  useEffect(() => {
    const source = lectureText || DEMO_TEXT_EN
    const msgTimer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, loadingSteps.length - 1)), 1800)

    generateQuestionsWithAI(source, language, discipline)
      .then((qs) => setQuestions(qs?.length ? qs : FALLBACK_QUESTIONS))
      .catch((err) => { console.error('[AI Test] failed, using fallback:', err.message); setQuestions(FALLBACK_QUESTIONS) })
      .finally(() => { clearInterval(msgTimer); setLoading(false) })

    return () => clearInterval(msgTimer)
  }, [])

  useEffect(() => {
    if (!questions || phase !== 'playing' || answered) return
    setTimeLeft(QUESTION_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [current, questions, phase, answered])

  const logAnswer = (q, selectedIdx, isCorrect) => {
    setAnsweredLog((prev) => [...prev, {
      topic: q.topic,
      question: q.question,
      options: q.options,
      selected: selectedIdx,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      wrongExplanations: q.wrongExplanations || [],
      correct: isCorrect,
    }])
  }

  const handleTimeout = () => {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    setSelected(-1)
    setStreak(0)
    const q = questions[current]
    logAnswer(q, -1, false)
    setLives((l) => { const next = l - 1; if (next <= 0) setTimeout(() => endGame(), 1200); return next })
  }

  const handleSelect = (idx) => {
    if (answered) return
    clearInterval(timerRef.current)
    setSelected(idx)
    setAnswered(true)
    const q = questions[current]
    const correct = idx === q.correctIndex
    logAnswer(q, idx, correct)
    if (correct) {
      const bonus = streak >= 2 ? STREAK_BONUS : 0
      setScore((s) => s + POINTS_PER_CORRECT + bonus)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
      setLives((l) => { const next = l - 1; if (next <= 0) setTimeout(() => endGame(), 1500); return next })
    }
  }

  const endGame = () => {
    const wrong = answeredLog.filter((a) => !a.correct)
    if (wrong.length > 0) addMistakes(wrong.map((a) => ({ topic: a.topic, question: a.question, wrongAnswer: a.options[a.selected] || 'Timed out', correctAnswer: a.options[a.correctIndex] })))
    const totalAnswered = answeredLog.length + 1 // +1 for current not yet logged edge case
    const correctCount = answeredLog.filter((a) => a.correct).length
    const pct = Math.round((score / (questions.length * POINTS_PER_CORRECT)) * 100)
    recordTestResult({ score: pct, pointsEarned: score })
    setPhase('result')
  }

  const next = () => {
    setAnswered(false)
    setSelected(null)
    setShowExplanation(false)
    if (current + 1 >= questions.length || lives <= 0) endGame()
    else setCurrent((c) => c + 1)
  }

  const retry = () => {
    setCurrent(0); setScore(0); setLives(TOTAL_LIVES); setStreak(0)
    setAnsweredLog([]); setAnswered(false); setSelected(null); setPhase('playing')
  }

  // ── Loading screen ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center space-y-5 max-w-sm w-full px-4">
        <div className="relative mx-auto w-16 h-16">
          <span className="absolute inset-0 inline-block animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
          <span className="absolute inset-2 inline-block animate-spin rounded-full border-4 border-violet-400/40 border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{loadingSteps[loadingStep]}</p>
          <p className="text-xs text-slate-400 mt-1">{language} · {discipline}</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {loadingSteps.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= loadingStep ? 'w-6 bg-indigo-400' : 'w-2 bg-slate-700'}`} />
          ))}
        </div>
      </div>
    </div>
  )

  // ── No questions — should never happen now, always falls back ────────────
  if (!questions) return null

  // ── Result screen ────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = answeredLog.filter((a) => a.correct).length
    const wrongCount = answeredLog.filter((a) => !a.correct).length
    const pct = Math.round((correctCount / answeredLog.length) * 100) || 0
    const wrongAnswers = answeredLog.filter((a) => !a.correct)

    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Score card */}
        <Card>
          <div className="text-center space-y-3 py-4">
            <div className="text-5xl">{pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📚'}</div>
            <h2 className="text-2xl font-bold text-white">
              {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}
            </h2>
            <p className="text-slate-400 text-sm">{language} · {discipline}</p>

            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/20 p-3 text-center">
                <p className="text-2xl font-bold text-indigo-300">{score}</p>
                <p className="text-xs text-slate-400 mt-0.5">Points</p>
              </div>
              <div className="rounded-xl bg-green-500/10 border border-green-400/20 p-3 text-center">
                <p className="text-2xl font-bold text-green-300">{correctCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">Correct</p>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-3 text-center">
                <p className="text-2xl font-bold text-red-300">{wrongCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">Wrong</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-center">
                <p className="text-2xl font-bold text-amber-300">{pct}%</p>
                <p className="text-xs text-slate-400 mt-0.5">Accuracy</p>
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Accuracy</span><span>{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Wrong answers with explanations */}
        {wrongAnswers.length > 0 && (
          <Card
            title={<span className="flex items-center gap-2"><XCircle size={15} className="text-red-400" /> Wrong Answers — Learn the Correct Concept</span>}
            subtitle="Review each mistake with the correct explanation"
          >
            <div className="space-y-4">
              {wrongAnswers.map((a, i) => (
                <div key={i} className="rounded-xl border border-red-400/20 bg-red-500/5 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-300">Q{i + 1}</span>
                    <p className="text-sm font-medium text-white">{a.question}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="rounded-lg bg-red-500/10 border border-red-400/20 px-3 py-2">
                      <p className="text-xs text-red-400 font-semibold mb-0.5 flex items-center gap-1"><XCircle size={11} /> Your answer</p>
                      <p className="text-xs text-slate-300">{a.selected === -1 ? 'Timed out' : a.options[a.selected]}</p>
                    </div>
                    <div className="rounded-lg bg-green-500/10 border border-green-400/20 px-3 py-2">
                      <p className="text-xs text-green-400 font-semibold mb-0.5 flex items-center gap-1"><CheckCircle size={11} /> Correct answer</p>
                      <p className="text-xs text-slate-300">{a.options[a.correctIndex]}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-400/20 px-3 py-2.5">
                    <p className="text-xs font-semibold text-indigo-300 mb-1">💡 Concept Explanation</p>
                    <p className="text-xs text-slate-200 leading-relaxed">{a.explanation}</p>
                    {a.selected !== -1 && a.wrongExplanations?.[a.selected] && (
                      <p className="text-xs text-slate-400 mt-1.5 italic">Why your answer was wrong: {a.wrongExplanations[a.selected]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {wrongAnswers.length === 0 && (
          <Card>
            <div className="flex items-center gap-3 py-2">
              <CheckCircle size={20} className="text-green-400 shrink-0" />
              <p className="text-sm text-green-300 font-medium">Perfect score! You answered every question correctly.</p>
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={retry} variant="secondary">
            <span className="flex items-center gap-2"><RotateCcw size={14} /> Retry</span>
          </Button>
          <Button onClick={() => navigate('/lecture-assistant')}>Back to Lectures</Button>
        </div>
      </div>
    )
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────
  const q = questions[current]
  const timerPct = (timeLeft / QUESTION_TIME) * 100
  const timerColor = timeLeft > 12 ? 'bg-green-400' : timeLeft > 6 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
            <Heart key={i} size={18} className={i < lives ? 'text-red-400 fill-red-400' : 'text-slate-700'} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-xs text-amber-300 font-medium">
              🔥 {streak}x streak
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-indigo-300 font-semibold">
            <Trophy size={14} /> {score}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Clock size={14} className={timeLeft <= 6 ? 'text-red-400' : ''} />
          <span className={timeLeft <= 6 ? 'text-red-400 font-bold' : ''}>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-800">
        <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
      </div>

      {/* Question */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400">Question {current + 1} / {questions.length}</span>
          <span className="rounded-full bg-indigo-500/20 border border-indigo-400/20 px-2.5 py-0.5 text-xs text-indigo-300">{q.topic}</span>
        </div>
        <p className="text-base font-medium text-white leading-relaxed">{q.question}</p>

        <div className="mt-4 space-y-2">
          {q.options.map((opt, idx) => {
            let cls = 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-indigo-400 hover:bg-indigo-500/5'
            if (answered) {
              if (idx === q.correctIndex) cls = 'border-green-500 bg-green-500/15 text-green-200'
              else if (idx === selected) cls = 'border-red-500 bg-red-500/15 text-red-200'
              else cls = 'border-white/5 bg-slate-900/20 text-slate-600'
            }
            return (
              <button key={idx} disabled={answered} onClick={() => handleSelect(idx)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition-all ${cls}`}>
                <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                  {answered && idx === q.correctIndex ? <CheckCircle size={13} className="text-green-400" /> :
                   answered && idx === selected && idx !== q.correctIndex ? <XCircle size={13} className="text-red-400" /> :
                   String.fromCharCode(65 + idx)}
                </span>
                {opt.replace(/^[A-D]\.\s*/, '')}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-4 space-y-3">
            <button onClick={() => setShowExplanation((v) => !v)}
              className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors">
              {showExplanation ? '▲ Hide' : '▼ Show'} explanation
            </button>
            {showExplanation && (
              <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3 space-y-2">
                <p className="text-xs font-semibold text-green-300 flex items-center gap-1.5"><CheckCircle size={12} /> Correct concept:</p>
                <p className="text-xs text-slate-200 leading-relaxed">{q.explanation}</p>
                {selected !== null && selected !== q.correctIndex && selected >= 0 && q.wrongExplanations?.[selected] && (
                  <p className="text-xs text-slate-400 italic mt-1">Why your answer was wrong: {q.wrongExplanations[selected]}</p>
                )}
              </div>
            )}
            <Button className="w-full" onClick={next}>
              <span className="flex items-center justify-center gap-2">
                {current + 1 >= questions.length || lives <= 0 ? 'See Results' : 'Next Question'}
                <ChevronRight size={15} />
              </span>
            </Button>
          </div>
        )}
      </Card>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {questions.map((_, i) => (
          <span key={i} className={`h-2 rounded-full transition-all ${
            i < current ? 'w-4 bg-indigo-400' :
            i === current ? 'w-4 bg-white' :
            'w-2 bg-slate-700'
          }`} />
        ))}
      </div>
    </div>
  )
}
