import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import StudySidebar from '../components/ui/StudySidebar'
import { Mic, Upload, RefreshCw, X, FileText, BookOpen, Languages, AlignLeft, History, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../hooks/useAppStore'
import { langCodeToName } from '../utils/i18n'
import { aiApi } from '../services/api'
import { setAuthToken } from '../services/api'
import { useUser } from '@clerk/clerk-react'

const PROCESSING_STEPS = [
  'Reading your content...',
  'Translating to your language...',
  'Building dual-language explanations...',
  'Generating word meanings & examples...',
]

const DISCIPLINES = ['General', 'Biology', 'Physics', 'History', 'Mathematics', 'Computer Science', 'Economics', 'Chemistry', 'Literature']
const ALL_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Arabic', 'Mandarin Chinese', 'Korean', 'Portuguese']

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result.split(',')[1])
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const readFileAsText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result)
  reader.onerror = reject
  reader.readAsText(file)
})

export default function LectureAssistantPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { language, preferences, lectureHistory, addLectureHistory, mistakeBank } = useAppStore()
  const defaultLang = langCodeToName[language] || preferences.targetLanguage || 'English'

  const [studyData, setStudyData] = useState(null)
  const [studyLoading, setStudyLoading] = useState(false)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [pendingText, setPendingText] = useState('')
  const [pendingSource, setPendingSource] = useState('')
  const [pendingBase64, setPendingBase64] = useState(null)
  const [pendingFileType, setPendingFileType] = useState(null)

  const [explainLang, setExplainLang] = useState(defaultLang)
  const [exampleLang, setExampleLang] = useState(preferences.preferredLanguages?.[1] || 'Spanish')
  const [selectedDiscipline, setSelectedDiscipline] = useState(preferences.studyField || 'General')

  const [recording, setRecording] = useState(false)
  const [lmsLoading, setLmsLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [droppedFile, setDroppedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [rawText, setRawText] = useState('')
  const [expandedHistory, setExpandedHistory] = useState(null)
  const [generatingTest, setGeneratingTest] = useState(false)

  const fileInputRef = useRef()
  const stepRef = useRef(null)

  useEffect(() => () => clearInterval(stepRef.current), [])

  const openLangModal = (text, source, base64 = null, fileType = null) => {
    setPendingText(text)
    setPendingSource(source)
    setPendingBase64(base64)
    setPendingFileType(fileType)
    setShowUploadModal(false)
    setShowLangModal(true)
  }

  const runAI = async () => {
    setShowLangModal(false)
    setProcessing(true)
    setStepIndex(0)
    setResult(null)
    setRawText(pendingText)

    let step = 0
    stepRef.current = setInterval(() => {
      step += 1
      if (step < PROCESSING_STEPS.length) setStepIndex(step)
    }, 900)

    const payload = {
      language: explainLang,
      exampleLanguage: exampleLang,
      discipline: selectedDiscipline,
      fileName: pendingSource,
      ...(pendingBase64
        ? { fileBase64: pendingBase64, fileType: pendingFileType }
        : { text: pendingText }
      ),
    }

    const analyzePayload = {
      language: explainLang,
      discipline: selectedDiscipline,
      sourceTitle: pendingSource,
    }

    try {
      // Run both AI calls in parallel
      setStudyLoading(true)
      if (user?.primaryEmailAddress?.emailAddress) setAuthToken(`clerk:${user.primaryEmailAddress.emailAddress}`)

      const [data] = await Promise.all([
        aiApi.processFile(payload),
        aiApi.analyzeLecture({ ...analyzePayload, transcript: pendingText || '' })
          .then((d) => setStudyData(d))
          .catch(() => {})
          .finally(() => setStudyLoading(false)),
      ])

      clearInterval(stepRef.current)
      const lectureRaw = pendingText || data.translation || `[File: ${pendingSource}]`
      const lecture = {
        title: data.title || pendingSource,
        source: pendingSource,
        explainLang,
        exampleLang,
        discipline: selectedDiscipline,
        result: data,
        rawText: lectureRaw,
      }
      addLectureHistory(lecture)
      setResult(data)
      setRawText(lectureRaw)
    } catch {
      clearInterval(stepRef.current)
      const fallback = {
        title: pendingSource,
        translation: `[${explainLang}] Content from "${pendingSource}" — translation unavailable offline.`,
        explanation: `This lecture covers key concepts in ${selectedDiscipline}. Please ensure the backend is running and OPENAI_API_KEY is set.`,
        keyTerms: [],
      }
      addLectureHistory({ title: pendingSource, source: pendingSource, explainLang, exampleLang, discipline: selectedDiscipline, result: fallback, rawText: pendingText })
      setResult(fallback)
    } finally {
      setProcessing(false)
    }
  }

  const handleRecord = () => {
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      openLangModal(
        'Audio lecture: This session covers advanced topics in language acquisition — contextual learning methods, spaced repetition techniques, and immersive practice strategies for achieving fluency in a second language.',
        'Audio Recording'
      )
    }, 2500)
  }

  const handleLmsSync = () => {
    setLmsLoading(true)
    setTimeout(() => {
      setLmsLoading(false)
      openLangModal(
        'LMS Synced — Week 5: Introduction to Morphology and Syntax. Topics: word formation rules, sentence structure analysis, transformational grammar, and practical parsing exercises with real-world text samples.',
        'LMS Sync'
      )
    }, 1800)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setDroppedFile(f)
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) setDroppedFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!droppedFile) return
    if (droppedFile.type === 'text/plain') {
      const text = await readFileAsText(droppedFile)
      openLangModal(text, droppedFile.name, null, null)
    } else {
      const base64 = await readFileAsBase64(droppedFile)
      openLangModal('', droppedFile.name, base64, droppedFile.type)
    }
  }

  const handleStartTest = async (lectureRawText, lectureDiscipline, lectureLang) => {
    setGeneratingTest(true)
    const weakTopics = mistakeBank.slice(0, 5).map((m) => m.topic)
    try {
      const data = await aiApi.generateTest({ lectureText: lectureRawText, language: lectureLang, discipline: lectureDiscipline, mistakeTopics: weakTopics })
      navigate('/lecture-test', { state: { questions: data.questions, language: lectureLang, discipline: lectureDiscipline, lectureText: lectureRawText } })
    } catch {
      navigate('/lecture-test', { state: { questions: null, language: lectureLang, discipline: lectureDiscipline, lectureText: lectureRawText } })
    } finally {
      setGeneratingTest(false)
    }
  }

  const ResultView = ({ res, rText, eLang, exLang, disc }) => (
    <div className="space-y-4">
      <Card title={<span className="flex items-center gap-2"><Languages size={15} /> Translation ({eLang})</span>}>
        <p className="text-sm text-slate-100 leading-relaxed rounded-xl bg-slate-900/40 p-4 whitespace-pre-wrap">{res.translation}</p>
      </Card>

      <Card title={<span className="flex items-center gap-2"><AlignLeft size={15} /> AI Explanation ({eLang})</span>}>
        <p className="text-sm text-slate-100 leading-relaxed rounded-xl bg-slate-900/40 p-4 whitespace-pre-wrap">{res.explanation}</p>
      </Card>

      {(res.keyTerms || []).length > 0 && (
        <Card title={<span className="flex items-center gap-2"><BookOpen size={15} /> Key Terms — {eLang} & {exLang}</span>}>
          <div className="space-y-4">
            {res.keyTerms.map((kt, i) => (
              <div key={i} className="rounded-xl bg-slate-900/40 p-4 space-y-3">
                <p className="text-sm font-bold text-indigo-300">{kt.term}</p>
                {kt.altMeaning && (
                  <span className="inline-block rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-0.5 text-xs text-amber-200">
                    Multiple meanings: {kt.altMeaning}
                  </span>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-400/20 p-3 space-y-1">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">{eLang}</p>
                    <p className="text-xs text-slate-200">{kt.meaningInLang}</p>
                    {(kt.examplesInLang || []).map((ex, j) => (
                      <p key={j} className="text-xs text-slate-400 pl-2 border-l-2 border-indigo-500/40 mt-1">{ex}</p>
                    ))}
                  </div>
                  <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-3 space-y-1">
                    <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide">{exLang}</p>
                    <p className="text-xs text-slate-200">{kt.meaningInExample}</p>
                    {(kt.examplesInExampleLang || []).map((ex, j) => (
                      <p key={j} className="text-xs text-slate-400 pl-2 border-l-2 border-violet-500/40 mt-1">{ex}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Ready to test your knowledge?</p>
            <p className="text-xs text-slate-400 mt-0.5">AI generates 12 questions from this lecture · gamified with lives & score</p>
          </div>
          <Button onClick={() => handleStartTest(rText, disc, eLang)} disabled={generatingTest}>
            {generatingTest
              ? <span className="flex items-center gap-2"><span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating...</span>
              : <span className="flex items-center gap-2"><PlayCircle size={15} /> Take AI Test 🎮</span>
            }
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <>
      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl w-80">
            <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent mb-4" />
            <p className="text-lg font-semibold text-white">{PROCESSING_STEPS[stepIndex]}</p>
            <p className="text-xs text-indigo-300 mt-1">{explainLang} + {exampleLang}</p>
            <div className="mt-4 flex justify-center gap-1">
              {PROCESSING_STEPS.map((_, i) => (
                <span key={i} className={`h-1.5 w-5 rounded-full transition-all ${i <= stepIndex ? 'bg-indigo-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Lecture</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Subject</p>
              <select value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white">
                {DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Audio Record</p>
              <button onClick={handleRecord} disabled={recording}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all ${recording ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 bg-slate-800/60 text-slate-200 hover:border-indigo-400'}`}>
                {recording && (
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
                <Mic size={16} className={recording ? 'text-red-400' : ''} />
                <span className="text-sm">{recording ? 'Recording...' : 'Start Recording'}</span>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">File / OCR Upload</p>
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop} onClick={() => fileInputRef.current.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${dragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 bg-slate-800/40 hover:border-indigo-400'}`}>
                <Upload size={20} className="mx-auto mb-2 text-slate-400" />
                {droppedFile
                  ? <p className="text-sm text-indigo-300 flex items-center justify-center gap-1"><FileText size={14} />{droppedFile.name}</p>
                  : <p className="text-sm text-slate-400">Drag & drop PDF, image, .txt — or click to browse</p>}
                <input ref={fileInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden" onChange={handleFileChange} />
              </div>
              {droppedFile && <Button className="mt-2 w-full" onClick={handleUpload}>Upload & Process with AI</Button>}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">LMS Sync</p>
              <button onClick={handleLmsSync} disabled={lmsLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-200 hover:border-indigo-400 disabled:opacity-60 transition-all">
                <RefreshCw size={15} className={lmsLoading ? 'animate-spin text-indigo-400' : ''} />
                {lmsLoading ? 'Connecting to Canvas/Moodle...' : 'Sync with College Portal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Choose Languages</h3>
                <p className="text-xs text-slate-400 mt-0.5">AI will explain in both languages with examples</p>
              </div>
              <button onClick={() => setShowLangModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Explanation Language (translate & explain in)</p>
                <select value={explainLang} onChange={(e) => setExplainLang(e.target.value)}
                  className="w-full rounded-xl border border-indigo-400/40 bg-slate-800/60 px-3 py-2 text-sm text-white">
                  {ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Example Language (parallel examples in)</p>
                <select value={exampleLang} onChange={(e) => setExampleLang(e.target.value)}
                  className="w-full rounded-xl border border-violet-400/40 bg-slate-800/60 px-3 py-2 text-sm text-white">
                  {ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="rounded-xl bg-slate-800/40 p-3 text-xs text-slate-300">
                Source: <span className="text-indigo-300">{pendingSource}</span> · Subject: <span className="text-indigo-300">{selectedDiscipline}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" onClick={runAI}>Process with AI →</Button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Card title="Lecture Assistant" subtitle="Upload content — AI translates, explains in 2 languages, and generates a test">
          <Button onClick={() => setShowUploadModal(true)}>+ Add New Lecture</Button>
        </Card>

        {(result || studyLoading) && (
          <div className="grid lg:grid-cols-3 gap-5">
            {result && (
              <div className="lg:col-span-2">
                <ResultView res={result} rText={rawText} eLang={explainLang} exLang={exampleLang} disc={selectedDiscipline} />
              </div>
            )}
            <div className={result ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <StudySidebar data={studyData} loading={studyLoading} />
            </div>
          </div>
        )}

        {lectureHistory.length > 0 && (
          <Card title={<span className="flex items-center gap-2"><History size={15} /> Lecture History ({lectureHistory.length})</span>}>
            <div className="space-y-2">
              {lectureHistory.map((lec) => (
                <div key={lec.id} className="rounded-xl bg-slate-900/40 overflow-hidden">
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === lec.id ? null : lec.id)}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-800/40 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{lec.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{lec.explainLang} + {lec.exampleLang} · {lec.discipline} · {new Date(lec.date).toLocaleDateString()}</p>
                    </div>
                    {expandedHistory === lec.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {expandedHistory === lec.id && (
                    <div className="px-3 pb-3">
                      <ResultView res={lec.result} rText={lec.rawText} eLang={lec.explainLang} exLang={lec.exampleLang} disc={lec.discipline} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
