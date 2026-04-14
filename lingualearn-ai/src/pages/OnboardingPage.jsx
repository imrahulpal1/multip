import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAppStore } from '../hooks/useAppStore'
import { authApi } from '../services/api'

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Mandarin', 'Arabic', 'Portuguese', 'Korean']

const STUDY_FIELDS = {
  Undergraduate: ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Arts & Humanities', 'Law', 'Social Sciences', 'Natural Sciences', 'Education', 'Architecture'],
  Postgraduate: ['MBA', 'M.Tech / M.Eng', 'M.Sc', 'MA', 'LLM', 'MD / Medical PG', 'PhD Research', 'Other'],
  'High School': ['Science Stream', 'Commerce Stream', 'Arts Stream'],
  'Self-Learning': ['Programming', 'Design', 'Business', 'Languages', 'Music', 'Other'],
  Professional: ['Software Development', 'Data Science', 'Marketing', 'Finance', 'Healthcare', 'Legal', 'Other'],
}

const selectCls = 'w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400'
const labelCls = 'text-xs font-medium text-slate-300'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { updatePreferences, setUserProfile } = useAppStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLangs, setSelectedLangs] = useState([])

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    studyBackground: '',
    studyField: '',
    nativeLanguage: '',
    targetLanguage: '',
  })

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.fullName || '',
      email: prev.email || user.primaryEmailAddress?.emailAddress || '',
    }))
  }, [user])

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const toggleLang = (lang) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Name is required.')
    if (!form.studyBackground) return setError('Please select your study background.')
    if (selectedLangs.length === 0) return setError('Select at least one preferred translation language.')
    setLoading(true)
    const payload = {
      ...form,
      age: form.age ? Number(form.age) : undefined,
      preferredLanguages: selectedLangs,
      academicLevel: form.studyBackground,
    }
    // Save to backend if available, but don't block on failure
    try { await authApi.saveProfile(payload) } catch { /* backend offline — continue anyway */ }
    setUserProfile(payload)
    updatePreferences({
      nativeLanguage: form.nativeLanguage || 'English',
      targetLanguage: form.targetLanguage || selectedLangs[0] || 'Spanish',
      academicLevel: form.studyBackground,
      preferredLanguages: selectedLangs,
      studyBackground: form.studyBackground,
      studyField: form.studyField,
    })
    setLoading(false)
    navigate('/')
  }

  const fields = STUDY_FIELDS[form.studyBackground] || []

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Card
        title="Complete Your Profile"
        subtitle="Tell us about yourself so we can personalise your learning experience"
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">

          {/* Name */}
          <label className="space-y-1">
            <span className={labelCls}>Full Name *</span>
            <input
              className={selectCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </label>

          {/* Email */}
          <label className="space-y-1">
            <span className={labelCls}>Email</span>
            <input
              className={selectCls}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="your@email.com"
              type="email"
            />
          </label>

          {/* Phone */}
          <label className="space-y-1">
            <span className={labelCls}>Phone Number</span>
            <input
              className={selectCls}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </label>

          {/* Age */}
          <label className="space-y-1">
            <span className={labelCls}>Age</span>
            <input
              className={selectCls}
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="e.g. 21"
              type="number"
              min="10"
              max="80"
            />
          </label>

          {/* Study Background */}
          <label className="space-y-1">
            <span className={labelCls}>Study Background *</span>
            <select
              className={selectCls}
              value={form.studyBackground}
              onChange={(e) => { set('studyBackground', e.target.value); set('studyField', '') }}
              required
            >
              <option value="">Select level</option>
              {Object.keys(STUDY_FIELDS).map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </label>

          {/* Conditional Study Field */}
          <label className="space-y-1">
            <span className={labelCls}>Field of Study</span>
            <select
              className={selectCls}
              value={form.studyField}
              onChange={(e) => set('studyField', e.target.value)}
              disabled={!form.studyBackground}
            >
              <option value="">{form.studyBackground ? 'Select field' : 'Select background first'}</option>
              {fields.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          {/* Native Language */}
          <label className="space-y-1">
            <span className={labelCls}>Native Language</span>
            <select
              className={selectCls}
              value={form.nativeLanguage}
              onChange={(e) => set('nativeLanguage', e.target.value)}
            >
              <option value="">Select language</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          {/* Primary Target Language */}
          <label className="space-y-1">
            <span className={labelCls}>Primary Target Language</span>
            <select
              className={selectCls}
              value={form.targetLanguage}
              onChange={(e) => set('targetLanguage', e.target.value)}
            >
              <option value="">Select language</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          {/* Preferred Translation Languages (multi-select chips) */}
          <div className="space-y-2 md:col-span-2">
            <span className={labelCls}>Preferred Translation Languages * (select all that apply)</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleLang(lang)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                    selectedLangs.includes(lang)
                      ? 'bg-indigo-500 border-indigo-400 text-white'
                      : 'bg-slate-800/60 border-white/10 text-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {selectedLangs.length > 0 && (
              <p className="text-xs text-indigo-300">Selected: {selectedLangs.join(', ')}</p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            {error && <p className="mb-3 rounded-lg bg-red-500/20 p-2 text-sm text-red-300">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !isLoaded}>
              {!isLoaded ? 'Loading...' : loading ? 'Saving profile...' : 'Save & Start Learning →'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
