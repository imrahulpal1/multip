import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { aiService } from '../utils/api'
import { contextAwareTranslate, lectureCompanion } from '../utils/learningEngines'

export default function LectureAssistantPage() {
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('Spanish')
  const [discipline, setDiscipline] = useState('biology')
  const [output, setOutput] = useState('Upload lecture notes or paste transcript to begin.')
  const [companion, setCompanion] = useState({ summary: '', keyTakeaways: [], simplified: '' })

  const handleAction = async (mode) => {
    const content = input || 'Sample lecture on contextual language acquisition'
    if (mode === 'summarize') {
      setOutput(await aiService.summarize(content))
      setCompanion(lectureCompanion({ text: content, targetLanguage: language }))
    }
    if (mode === 'translate') {
      const contextual = contextAwareTranslate({
        text: content,
        discipline,
        targetLanguage: language,
      })
      setOutput(await aiService.translate(contextual, language))
    }
    if (mode === 'explain') {
      setOutput(await aiService.explain(content, language))
      setCompanion(lectureCompanion({ text: content, targetLanguage: language }))
    }
  }

  return (
    <div className="space-y-5">
      <Card title="Lecture Assistant" subtitle="Summarize, translate and explain lecture content">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-xl border border-dashed border-white/30 bg-slate-900/40 p-4 text-sm text-slate-300">
            Upload PDF/Audio (placeholder)
            <input type="file" className="mt-2 block w-full text-xs" />
          </label>
          <div>
            <p className="mb-2 text-sm text-slate-300">Explanation language</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
            >
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-300">Academic discipline (context aware)</p>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
            >
              <option value="biology">Biology</option>
              <option value="physics">Physics</option>
              <option value="history">History</option>
            </select>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste lecture transcript or notes..."
          className="mt-4 h-36 w-full rounded-xl border border-white/10 bg-slate-900/40 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => handleAction('summarize')}>Summarize</Button>
          <Button variant="secondary" onClick={() => handleAction('translate')}>
            Translate
          </Button>
          <Button variant="secondary" onClick={() => handleAction('explain')}>
            Explain
          </Button>
        </div>
      </Card>

      <Card title="Summary & Explanation">
        <p className="rounded-xl bg-slate-900/40 p-3 text-sm text-slate-100">{output}</p>
        <div className="mt-4">
          <p className="mb-2 text-sm text-slate-300">Post-Lecture Key Takeaways</p>
          <ul className="space-y-2 text-sm text-slate-100">
            {(companion.keyTakeaways.length ? companion.keyTakeaways : ['Generate summary to see key takeaways']).map((point) => (
              <li key={point} className="rounded-lg bg-slate-900/40 p-3">
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-lg bg-slate-900/40 p-3 text-sm text-slate-100">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-300">Simplified concept breakdown</p>
            {companion.simplified || 'Run Summarize/Explain to generate a simplified concept breakdown.'}
          </div>
        </div>
      </Card>
    </div>
  )
}
