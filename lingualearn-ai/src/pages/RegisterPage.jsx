import { motion as Motion } from 'framer-motion'
import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  const clerkAppearance = {
    elements: {
      card: 'shadow-none bg-transparent',
      rootBox: 'w-full',
      headerTitle: 'text-slate-900',
      headerSubtitle: 'text-slate-600',
      socialButtonsBlockButton:
        'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors',
      formButtonPrimary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm',
      formFieldInput: 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400',
      formFieldLabel: 'text-slate-700',
      footerActionText: 'text-slate-600',
      footerActionLink: 'text-violet-700 hover:text-violet-600 font-semibold',
      identityPreviewText: 'text-slate-700',
    },
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <div className="pointer-events-none absolute -left-10 top-12 h-72 w-72 animate-pulse rounded-full bg-violet-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-12 h-72 w-72 animate-pulse rounded-full bg-sky-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <Motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-6xl gap-8 rounded-3xl border border-white/30 bg-white/15 p-5 backdrop-blur-xl md:grid-cols-2 md:p-8"
      >
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-violet-500/25 px-3 py-1 text-xs font-medium text-violet-100">
            Create Account
          </p>
          <h1 className="text-3xl font-bold text-white">Join LinguaLearn AI in minutes</h1>
          <p className="text-sm leading-relaxed text-slate-100">
            Register with Clerk using Google, email, or OTP verification.
          </p>
          <div className="grid gap-2 text-sm text-slate-200">
            <p className="rounded-lg bg-white/10 px-3 py-2">Step 1: Verify account (Google/Email/OTP)</p>
            <p className="rounded-lg bg-white/10 px-3 py-2">Step 2: Fill academic profile details</p>
            <p className="rounded-lg bg-white/10 px-3 py-2">Step 3: Start dashboard instantly</p>
          </div>
          <p className="text-sm text-slate-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Go to login
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xl shadow-slate-900/20">
          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            forceRedirectUrl="/onboarding"
            appearance={clerkAppearance}
          />
        </div>
      </Motion.section>
    </div>
  )
}
