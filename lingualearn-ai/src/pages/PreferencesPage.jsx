import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../hooks/useAppStore'
import { useUser } from '@clerk/clerk-react'

// ── Liquid Glass Avatar ────────────────────────────────────────────────────
function LiquidAvatar({ name }) {
  const [hovered, setHovered] = useState(false)
  const initials = name ? name.slice(0, 2).toUpperCase() : 'LL'

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={hovered
        ? { borderRadius: ['50%', '42% 58% 55% 45%', '55% 45% 48% 52%', '50%'], scale: 1.06 }
        : { borderRadius: '50%', scale: 1 }
      }
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="relative h-24 w-24 flex items-center justify-center cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(100,255,218,0.2), rgba(124,58,237,0.3))',
        border: '2px solid rgba(100,255,218,0.3)',
        backdropFilter: 'blur(12px)',
        boxShadow: hovered ? '0 0 40px rgba(100,255,218,0.25), inset 0 0 20px rgba(100,255,218,0.1)' : '0 0 20px rgba(100,255,218,0.1)',
      }}
    >
      <span className="text-2xl font-black text-white">{initials}</span>
      {hovered && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%)' }}
        />
      )}
    </motion.div>
  )
}

// ── Morphing Toggle ────────────────────────────────────────────────────────
function MorphToggle({ value, onChange, label }) {
  const [ripple, setRipple] = useState(false)

  const handleClick = () => {
    setRipple(true)
    setTimeout(() => setRipple(false), 500)
    onChange(!value)
  }

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="relative" onClick={handleClick}>
        {/* Ripple */}
        <AnimatePresence>
          {ripple && (
            <motion.div
              key="ripple"
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: value ? 'rgba(100,255,218,0.4)' : 'rgba(148,163,184,0.3)', zIndex: 10 }}
            />
          )}
        </AnimatePresence>

        {/* Track */}
        <motion.div
          animate={{
            width: value ? 52 : 44,
            background: value ? 'rgba(100,255,218,0.25)' : 'rgba(255,255,255,0.08)',
            borderColor: value ? 'rgba(100,255,218,0.5)' : 'rgba(255,255,255,0.15)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative h-7 rounded-full border cursor-pointer flex items-center px-1"
          style={{ minWidth: 44 }}
        >
          {/* Thumb */}
          <motion.div
            animate={{
              x: value ? 22 : 0,
              width: value ? 20 : 16,
              height: value ? 20 : 16,
              borderRadius: value ? 10 : 8,
              background: value ? '#64ffda' : '#94a3b8',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="shadow-sm"
          />
        </motion.div>
      </div>
    </div>
  )
}

// ── Tab content variants ───────────────────────────────────────────────────
const tabVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, scale: 0.97 }),
}

const TABS = ['Account', 'Preferences', 'Security']

export default function PreferencesPage() {
  const { preferences, updatePreferences } = useAppStore()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState(0)
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState(preferences)
  const [saved, setSaved] = useState(false)
  const [toggles, setToggles] = useState({
    notifications: true,
    darkMode: true,
    autoTranslate: true,
    soundEffects: false,
    twoFactor: false,
    activityVisible: true,
  })

  const goTab = (i) => { setDir(i > activeTab ? 1 : -1); setActiveTab(i) }

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    updatePreferences(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const name = user?.firstName || user?.username || 'Learner'
  const email = user?.primaryEmailAddress?.emailAddress || 'user@example.com'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex items-center gap-5"
        style={{ boxShadow: '0 8px 40px rgba(100,255,218,0.05)' }}
      >
        <LiquidAvatar name={name} />
        <div>
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <p className="text-sm text-slate-400">{email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full border border-[#64ffda]/30 bg-[#64ffda]/10 px-2.5 py-0.5 text-xs text-[#64ffda]">
              Student
            </span>
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs text-violet-300">
              {preferences.academicLevel || 'Intermediate'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-1.5">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => goTab(i)}
            className="relative flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
            style={{ color: activeTab === i ? '#020617' : '#94a3b8' }}
          >
            {activeTab === i && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #64ffda, #7c3aed)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={activeTab}
            custom={dir}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="p-6"
          >
            {/* Account tab */}
            {activeTab === 0 && (
              <form onSubmit={handleSave} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-4">Account Details</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { name: 'nativeLanguage', placeholder: 'Native language', label: 'Native Language' },
                    { name: 'targetLanguage', placeholder: 'Target language', label: 'Target Language' },
                    { name: 'studyField', placeholder: 'e.g. Computer Science', label: 'Study Field' },
                    { name: 'studyBackground', placeholder: 'Your background', label: 'Background' },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                      <input
                        name={f.name}
                        value={form[f.name] || ''}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#64ffda]/50 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Academic Level</label>
                    <select
                      name="academicLevel"
                      value={form.academicLevel || 'Intermediate'}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#64ffda]/50"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Accessibility</label>
                    <input
                      name="accessibilityNeeds"
                      value={form.accessibilityNeeds || ''}
                      onChange={handleChange}
                      placeholder="Captions, high contrast..."
                      className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#64ffda]/50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-900"
                    style={{ background: 'linear-gradient(135deg, #64ffda, #7c3aed)' }}
                  >
                    Save Changes
                  </motion.button>
                  <AnimatePresence>
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-[#64ffda]"
                      >
                        ✓ Saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            )}

            {/* Preferences tab */}
            {activeTab === 1 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-4">App Preferences</p>
                <MorphToggle label="Push Notifications" value={toggles.notifications} onChange={(v) => setToggles((p) => ({ ...p, notifications: v }))} />
                <MorphToggle label="Dark Mode" value={toggles.darkMode} onChange={(v) => setToggles((p) => ({ ...p, darkMode: v }))} />
                <MorphToggle label="Auto-Translate Forum Posts" value={toggles.autoTranslate} onChange={(v) => setToggles((p) => ({ ...p, autoTranslate: v }))} />
                <MorphToggle label="Sound Effects" value={toggles.soundEffects} onChange={(v) => setToggles((p) => ({ ...p, soundEffects: v }))} />
              </div>
            )}

            {/* Security tab */}
            {activeTab === 2 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-4">Security Settings</p>
                <MorphToggle label="Two-Factor Authentication" value={toggles.twoFactor} onChange={(v) => setToggles((p) => ({ ...p, twoFactor: v }))} />
                <MorphToggle label="Show Activity to Peers" value={toggles.activityVisible} onChange={(v) => setToggles((p) => ({ ...p, activityVisible: v }))} />
                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-4 space-y-3">
                  <p className="text-xs text-slate-400">Signed in via Clerk · Session managed securely</p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-300">Active session</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
