import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { dashboardStats, leaderboard } from '../utils/mockData'
import { useAppStore } from '../hooks/useAppStore'
import { t } from '../utils/i18n'
import { useUser } from '@clerk/clerk-react'

// ── Morphic Radar Chart ────────────────────────────────────────────────────
const SKILL_KEYS = ['Vocabulary', 'Grammar', 'Speaking', 'Listening', 'Writing']

function MorphicRadar({ moduleProgress }) {
  const completed = moduleProgress.filter((m) => m.completed).length
  const ratio = moduleProgress.length ? completed / moduleProgress.length : 0

  const data = SKILL_KEYS.map((skill, i) => ({
    skill,
    value: Math.round(30 + ratio * 55 + Math.sin(i * 1.3 + ratio * 4) * 12),
  }))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-1">Skill Radar</p>
      <p className="text-xs text-slate-400 mb-4">Shape morphs as you complete modules</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="rgba(100,255,218,0.12)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Radar
              dataKey="value"
              stroke="#64ffda"
              fill="#64ffda"
              fillOpacity={0.18}
              strokeWidth={2}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Daily Goal Card ────────────────────────────────────────────────────────
function GoalCard({ goal, onComplete }) {
  const [done, setDone] = useState(goal.completed)

  const handleClick = () => {
    if (done) return
    setDone(true)
    onComplete(goal.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={done ? { opacity: 0, scale: 0, height: 0, marginBottom: 0 } : { opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={done
        ? { type: 'spring', stiffness: 400, damping: 28 }
        : { type: 'spring', stiffness: 260, damping: 22 }
      }
      onClick={handleClick}
      className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex items-center gap-3 hover:border-[#64ffda]/40 hover:bg-[#64ffda]/5 transition-colors overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(100,255,218,0.04)' }}
    >
      <div className="h-8 w-8 rounded-full border-2 border-[#64ffda]/40 flex items-center justify-center flex-shrink-0">
        <span className="text-base">{goal.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{goal.title}</p>
        <p className="text-xs text-slate-400">+{goal.reward} pts</p>
      </div>
      <div className="h-5 w-5 rounded-full border-2 border-[#64ffda]/50 flex-shrink-0" />
    </motion.div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────
export default function DashboardPage({ points, level, streak }) {
  const { timeSpentMinutes, moduleProgress, challenges, language, completeChallenge } = useAppStore()
  const { user } = useUser()
  const name = user?.firstName || user?.username || 'Learner'

  const completionRate = Math.round(
    (moduleProgress.filter((m) => m.completed).length / moduleProgress.length) * 100,
  )

  const dailyGoals = challenges.map((c, i) => ({
    id: c.id,
    title: c.title,
    reward: c.reward,
    completed: c.completed,
    emoji: ['📖', '💬', '🎯', '🔥', '⚡'][i % 5],
  }))

  return (
    <div className="space-y-5">
      {/* Hero stats — glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        style={{ boxShadow: '0 8px 40px rgba(100,255,218,0.06)' }}
      >
        <p className="text-sm text-slate-300">{t(language, 'welcomeBack')}, {name} 👋</p>
        <h1 className="mt-1 text-2xl font-bold text-white">{t(language, 'momentum')}</h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {[
            { label: t(language, 'points'), value: points, color: 'text-[#64ffda]' },
            { label: t(language, 'currentLevel'), value: level, color: 'text-white' },
            { label: t(language, 'dailyStreak'), value: `${streak} ${t(language, 'days')}`, color: 'text-orange-300' },
            { label: t(language, 'timeSpent'), value: `${timeSpentMinutes} ${t(language, 'mins')}`, color: 'text-cyan-300' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03 }}
              className="rounded-xl border border-white/8 bg-white/5 p-3"
            >
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{t(language, 'moduleCompletion')}</span>
            <span className="text-[#64ffda]">{completionRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #64ffda, #7c3aed)' }}
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Radar + Daily Goals */}
      <div className="grid gap-5 lg:grid-cols-2">
        <MorphicRadar moduleProgress={moduleProgress} />

        {/* Daily Goals with layout animations */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-1">Daily Goals</p>
          <p className="text-xs text-slate-400 mb-4">Tap to complete — cards glide to fill the gap</p>
          <LayoutGroup>
            <AnimatePresence>
              {dailyGoals.filter((g) => !g.completed).map((goal) => (
                <GoalCard key={goal.id} goal={goal} onComplete={completeChallenge} />
              ))}
            </AnimatePresence>
            {dailyGoals.every((g) => g.completed) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-sm font-semibold text-[#64ffda]">All goals complete!</p>
              </motion.div>
            )}
          </LayoutGroup>
        </div>
      </div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#64ffda] mb-1">{t(language, 'leaderboard')}</p>
        <p className="text-xs text-slate-400 mb-4">{t(language, 'topLearners')}</p>
        <div className="space-y-2">
          {leaderboard.map((player, index) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.06 }}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 p-3"
            >
              <div className="flex items-center gap-3">
                <Badge>#{index + 1}</Badge>
                <div>
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-slate-400">{player.level}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[#64ffda]">{player.points} pts</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
