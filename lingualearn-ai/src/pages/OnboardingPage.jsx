import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAppStore } from '../hooks/useAppStore'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { updatePreferences } = useAppStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    age: '',
    studyLevel: '',
    nativeLanguage: '',
    targetLanguage: '',
    accessibilityNeeds: '',
  })

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.fullName || '',
      email: prev.email || user.primaryEmailAddress?.emailAddress || '',
    }))
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!form.name?.trim()) {
        setError('Please enter your name to continue.')
        return
      }

      updatePreferences({
        nativeLanguage: form.nativeLanguage || 'English',
        targetLanguage: form.targetLanguage || 'Spanish',
        academicLevel: form.studyLevel || 'Beginner',
        accessibilityNeeds: form.accessibilityNeeds || 'None',
      })
      navigate('/')
    } catch {
      setError('Could not save profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card title="Complete Your Profile" subtitle="Store your learner details in the platform database" className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Full Name *</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Email</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Phone Number</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Age</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Study Level</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="studyLevel"
              value={form.studyLevel}
              onChange={handleChange}
              placeholder="Beginner / Intermediate / Advanced"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Native Language</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="nativeLanguage"
              value={form.nativeLanguage}
              onChange={handleChange}
              placeholder="English, Hindi, Spanish..."
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-200">Target Language</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="targetLanguage"
              value={form.targetLanguage}
              onChange={handleChange}
              placeholder="Spanish, French, German..."
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-200">Accessibility Needs</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm"
              name="accessibilityNeeds"
              value={form.accessibilityNeeds}
              onChange={handleChange}
              placeholder="Captions, larger fonts, high contrast..."
            />
          </label>
          <div className="md:col-span-2">
            {error && <p className="mb-2 rounded-lg bg-amber-500/20 p-2 text-sm text-amber-200">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {!isLoaded ? 'Loading account...' : loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
