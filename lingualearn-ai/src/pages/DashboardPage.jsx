import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { dashboardStats, leaderboard } from '../utils/mockData'
import { useAppStore } from '../hooks/useAppStore'
import { t } from '../utils/i18n'
import { useUser } from '@clerk/clerk-react'

export default function DashboardPage({ points, level, streak }) {
  const { timeSpentMinutes, moduleProgress, challenges, language } = useAppStore()
  const { user } = useUser()
  const completionRate = Math.round(
    (moduleProgress.filter((m) => m.completed).length / moduleProgress.length) * 100,
  )
  const name = user?.firstName || user?.username || 'Learner'

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm text-slate-300">{t(language, 'welcomeBack')}, {name} 👋</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{t(language, 'momentum')}</h1>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-slate-300">{t(language, 'points')}</p>
            <p className="text-2xl font-bold text-indigo-300">{points}</p>
          </div>
          <div>
            <p className="text-sm text-slate-300">{t(language, 'currentLevel')}</p>
            <p className="text-2xl font-bold text-white">{level}</p>
          </div>
          <div>
            <p className="text-sm text-slate-300">{t(language, 'dailyStreak')}</p>
            <p className="text-2xl font-bold text-orange-300">{streak} {t(language, 'days')}</p>
          </div>
          <div>
            <p className="text-sm text-slate-300">{t(language, 'timeSpent')}</p>
            <p className="text-2xl font-bold text-cyan-300">{timeSpentMinutes} {t(language, 'mins')}</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={completionRate} label={t(language, 'moduleCompletion')} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card title={t(language, 'leaderboard')} subtitle={t(language, 'topLearners')}>
        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <div key={player.name} className="flex items-center justify-between rounded-xl bg-slate-900/40 p-3">
              <div className="flex items-center gap-3">
                <Badge>#{index + 1}</Badge>
                <div>
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-slate-300">{player.level}</p>
                </div>
              </div>
              <p className="text-sm text-indigo-300">{player.points} pts</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t(language, 'activeChallenges')} subtitle={t(language, 'challengeSubtitle')}>
        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="rounded-lg bg-slate-900/40 p-3 text-sm text-slate-100">
              {challenge.scope}: {challenge.title} {challenge.completed ? '✅' : '⏳'}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
