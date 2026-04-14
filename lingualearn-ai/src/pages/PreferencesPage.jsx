import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAppStore } from '../hooks/useAppStore'

export default function PreferencesPage() {
  const { preferences, updatePreferences } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(preferences)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (event) => {
    event.preventDefault()
    updatePreferences(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  return (
    <Card title="User Profiles & Preferences" subtitle="Set native language, target language, level, and accessibility needs">
      <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
        <input
          name="nativeLanguage"
          value={form.nativeLanguage}
          onChange={handleChange}
          className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
          placeholder="Native language"
        />
        <input
          name="targetLanguage"
          value={form.targetLanguage}
          onChange={handleChange}
          className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
          placeholder="Target learning language"
        />
        <select
          name="academicLevel"
          value={form.academicLevel}
          onChange={handleChange}
          className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <input
          name="accessibilityNeeds"
          value={form.accessibilityNeeds}
          onChange={handleChange}
          className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
          placeholder="Accessibility needs (captions, high contrast...)"
        />
        <div className="md:col-span-2 flex items-center gap-3">
          <Button type="submit">Save Preferences</Button>
          {saved && <span className="text-sm text-emerald-300">Saved</span>}
        </div>
      </form>
    </Card>
  )
}
