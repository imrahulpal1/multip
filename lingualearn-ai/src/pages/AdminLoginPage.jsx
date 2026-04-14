import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminAuthenticated, setAdminAuthenticated, setRole } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (adminAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedPassword = password.trim()
      if (normalizedEmail !== 'admin@example.com' || normalizedPassword !== 'admin@123') {
        setError('Invalid admin credentials')
        return
      }
      setRole('admin')
      setAdminAuthenticated(true)
      navigate('/admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6">
      <div className="pointer-events-none absolute -left-16 top-8 h-64 w-64 animate-pulse rounded-full bg-rose-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-72 w-72 animate-pulse rounded-full bg-orange-500/25 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl gap-8 rounded-3xl border border-white/30 bg-white/15 p-5 backdrop-blur-xl md:grid-cols-2 md:p-8">
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-rose-500/30 px-3 py-1 text-xs font-medium text-rose-100">
            Admin Access
          </p>
          <h1 className="text-3xl font-bold text-white">Administrator Login</h1>
          <p className="text-sm leading-relaxed text-slate-100">
            This portal is only for administrators. Admin registration is disabled.
          </p>
          <div className="space-y-2">
            <p className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-100">Secure email + password sign-in</p>
            <p className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-100">No admin self-registration</p>
            <p className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-100">Access granted only on exact credential match</p>
          </div>
          <p className="text-sm text-slate-300">
            Student?{' '}
            <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Go to student login
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xl shadow-slate-900/20"
        >
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-700">Admin Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-700">Password</p>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-1 py-2 text-sm text-slate-900 outline-none"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="rounded-lg bg-rose-100 p-2 text-sm text-rose-700">{error}</p>}
          <Button type="submit" className="w-full">
            {loading ? 'Signing in...' : 'Login as Admin'}
          </Button>
        </form>
      </section>
    </div>
  )
}
