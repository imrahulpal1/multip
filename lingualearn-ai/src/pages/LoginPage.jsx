import { motion as Motion } from 'framer-motion'
import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const clerkAppearance = {
    elements: {
      card: 'shadow-none bg-transparent',
      rootBox: 'w-full',
      headerTitle: 'text-slate-900',
      headerSubtitle: 'text-slate-600',
      socialButtonsBlockButton:
        'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors',
      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
      formFieldInput: 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400',
      formFieldLabel: 'text-slate-700',
      footerActionText: 'text-slate-600',
      footerActionLink: 'text-indigo-700 hover:text-indigo-600 font-semibold',
      identityPreviewText: 'text-slate-700',
    },
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <div className="pointer-events-none absolute -left-16 top-8 h-64 w-64 animate-pulse rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-72 w-72 animate-pulse rounded-full bg-pink-500/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-3xl" />

      <Motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-5xl gap-8 rounded-3xl border border-white/30 bg-white/15 p-5 backdrop-blur-xl md:grid-cols-2 md:p-8"
      >
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-100">
            LinguaLearn AI
          </p>
          <h1 className="text-3xl font-bold text-white">Login and continue your learning streak</h1>
          <p className="text-sm leading-relaxed text-slate-100">
            Login with Clerk using Google, email, or OTP verification.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="rounded-lg bg-white/10 px-3 py-2">Google one-click sign in</li>
            <li className="rounded-lg bg-white/10 px-3 py-2">Email / OTP verification flow</li>
            
          </ul>
          <p className="text-sm text-slate-300">
            New user?{' '}
            <Link to="/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Create an account
            </Link>
          </p>
          <p className="text-sm text-slate-300">
            Admin?{' '}
            <Link to="/admin/login" className="font-semibold text-rose-300 hover:text-rose-200">
              Go to admin login
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xl shadow-slate-900/20">
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            forceRedirectUrl="/"
            appearance={clerkAppearance}
          />
        </div>
      </Motion.section>
    </div>
  )
}
