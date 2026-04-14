import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { useSignIn } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'

// ── Nebula Canvas ──────────────────────────────────────────────────────────
const WORDS = [
  'こんにちは','Bonjour','مرحبا','Hola','नमस्ते','你好','Привет',
  'Ciao','Olá','Γεια','Merhaba','Shalom','سلام','Aloha',
  'Sawubona','Jambo','Xin chào','Annyeong','Learn','Speak',
  'Grow','Fluent','Explore','Connect','Discover','Achieve',
]

function LanguageNebula() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const particles = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles.current = WORDS.map((word, i) => {
        const angle = (i / WORDS.length) * Math.PI * 2
        const radius = 120 + Math.random() * 340
        return {
          word,
          x: canvas.width / 2 + Math.cos(angle) * radius,
          y: canvas.height / 2 + Math.sin(angle) * radius,
          ox: canvas.width / 2 + Math.cos(angle) * radius,
          oy: canvas.height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          alpha: 0.15 + Math.random() * 0.45,
          size: 11 + Math.random() * 12,
          hue: 170 + Math.random() * 140,
          pulse: Math.random() * Math.PI * 2,
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current.forEach((p) => {
        p.pulse += 0.014
        const pf = 0.85 + Math.sin(p.pulse) * 0.15
        const dx = p.x - mouse.current.x
        const dy = p.y - mouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160 && dist > 0) {
          const force = (160 - dist) / 160
          p.vx += (dx / dist) * force * 1.4
          p.vy += (dy / dist) * force * 1.4
        }
        p.vx += (p.ox - p.x) * 0.001
        p.vy += (p.oy - p.y) * 0.001
        p.vx *= 0.95
        p.vy *= 0.95
        p.x += p.vx
        p.y += p.vy
        ctx.save()
        ctx.globalAlpha = p.alpha * pf
        ctx.font = `${p.size * pf}px Inter, sans-serif`
        ctx.fillStyle = `hsl(${p.hue},80%,75%)`
        ctx.shadowColor = `hsl(${p.hue},90%,65%)`
        ctx.shadowBlur = 16
        ctx.fillText(p.word, p.x, p.y)
        ctx.restore()
      })
      raf = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ── Spring Headline ────────────────────────────────────────────────────────
function SpringHeadline({ text }) {
  const words = text.split(' ')
  let letterIndex = 0
  return (
    <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.25em] last:mr-0">
          {word.split('').map((ch) => {
            const idx = letterIndex++
            return (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ opacity: 0, y: 60, rotateZ: -18, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, rotateZ: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 16,
                  delay: 0.4 + idx * 0.028,
                }}
                style={{
                  background: wi === 0
                    ? 'linear-gradient(135deg,#ffffff,#94a3b8)'
                    : wi === 1
                    ? 'linear-gradient(135deg,#67e8f9,#818cf8)'
                    : 'linear-gradient(135deg,#ffffff,#94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {ch}
              </motion.span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

// ── Liquid Border Button ───────────────────────────────────────────────────
function LiquidButton({ onClick, children, type = 'button', disabled = false, fullWidth = false }) {
  const [hovered, setHovered] = useState(false)
  const angle = useMotionValue(0)
  useAnimationFrame((t) => { if (hovered && !disabled) angle.set(t / 3.5) })

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`rounded-2xl p-[2px] ${fullWidth ? 'w-full' : ''}`}
      style={{
        background: hovered && !disabled
          ? `conic-gradient(from ${angle.get()}deg, #64ffda, #818cf8, #ec4899, #f59e0b, #64ffda)`
          : 'linear-gradient(135deg, rgba(100,255,218,0.4), rgba(129,140,248,0.4))',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${fullWidth ? 'w-full' : ''} rounded-2xl px-8 py-3.5 text-sm font-bold backdrop-blur-xl transition-all`}
        style={{
          background: hovered && !disabled
            ? 'rgba(2,6,23,0.94)'
            : 'rgba(100,255,218,0.08)',
          color: hovered && !disabled ? '#64ffda' : '#e2e8f0',
          boxShadow: hovered && !disabled
            ? '0 0 40px rgba(100,255,218,0.25), inset 0 0 20px rgba(100,255,218,0.05)'
            : 'none',
        }}
      >
        {children}
      </button>
    </motion.div>
  )
}

// ── Glowing Input ──────────────────────────────────────────────────────────
function GlowInput({ label, type, value, onChange, placeholder, autoComplete, icon }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        <span>{icon}</span>{label}
      </label>
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1px rgba(100,255,218,0.5), 0 0 20px rgba(100,255,218,0.1)'
            : '0 0 0 1px rgba(255,255,255,0.08)',
        }}
        className="rounded-xl overflow-hidden"
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-white/[0.04] px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors"
          style={{ caretColor: '#64ffda' }}
        />
      </motion.div>
    </div>
  )
}

// ── Google Button ──────────────────────────────────────────────────────────
function GoogleButton({ onClick, loading }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold backdrop-blur-xl transition-all"
      style={{
        borderColor: hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        color: '#e2e8f0',
        boxShadow: hovered ? '0 0 20px rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
      </svg>
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </motion.button>
  )
}

// ── Main Login Page ────────────────────────────────────────────────────────
export default function LoginPage() {
  const { signIn, isLoaded } = useSignIn()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') navigate('/')
      else setError('Additional verification required. Please check your email.')
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (!isLoaded) return
    setGoogleLoading(true)
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      })
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Google sign-in failed.')
      setGoogleLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#020617' }}
    >
      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      {/* ── Nebula ── */}
      <div className="absolute inset-0">
        <LanguageNebula />
      </div>

      {/* ── Dot grid ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10">

        {/* Logo + badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Logo mark */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black"
            style={{
              background: 'linear-gradient(135deg, rgba(100,255,218,0.15), rgba(129,140,248,0.15))',
              border: '1px solid rgba(100,255,218,0.25)',
              boxShadow: '0 0 30px rgba(100,255,218,0.1)',
            }}
          >
            🌐
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/8 px-4 py-1.5 text-xs font-semibold text-cyan-300 tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            LinguaLearn AI
          </div>
        </motion.div>

        {/* Spring headline */}
        <div className="w-full">
          <SpringHeadline text="Welcome back learner" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-4 text-center text-sm text-slate-500 leading-relaxed"
          >
            Your streak, badges and progress are waiting.
            <br />Sign in to continue your multilingual journey.
          </motion.p>
        </div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-3xl border border-white/10 p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.5), 0 0 80px rgba(100,255,218,0.03)',
          }}
        >
          <div className="flex flex-col gap-5">
            {/* Google */}
            <GoogleButton onClick={handleGoogle} loading={googleLoading} />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <span className="text-[11px] font-medium text-slate-600 tracking-widest uppercase">or</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
            </div>

            {/* Email + password */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <GlowInput
                label="Email address"
                icon="✉"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <GlowInput
                label="Password"
                icon="🔑"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/8 px-4 py-3"
                >
                  <span className="text-rose-400 text-xs mt-0.5">⚠</span>
                  <p className="text-xs text-rose-400 leading-relaxed">{error}</p>
                </motion.div>
              )}

              <LiquidButton type="submit" disabled={loading} fullWidth>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
                    />
                    Signing in…
                  </span>
                ) : (
                  'Sign in →'
                )}
              </LiquidButton>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-600">
                No account?{' '}
                <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Register free
                </Link>
              </p>
              <Link
                to="/admin/login"
                className="text-xs text-slate-700 hover:text-rose-400 transition-colors"
              >
                Admin →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex w-full items-center justify-center gap-8"
        >
          {[['40+', 'Languages'], ['12k+', 'Learners'], ['98%', 'Satisfaction']].map(([val, lbl], i) => (
            <motion.div
              key={lbl}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 + i * 0.1 }}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-lg font-black text-white">{val}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">{lbl}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient bar */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #64ffda44, #818cf844, #ec489944, transparent)' }}
      />
    </div>
  )
}
