import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { useEffect, useState } from 'react'
import { gameApi } from '../services/api'
import { useSocket } from '../hooks/useSocket'

export default function GamificationPage({ points }) {
  const { badges, challenges, completeChallenge } = useAppStore()
  const [leaderboard, setLeaderboard] = useState([])
  const { socket } = useSocket()

  useEffect(() => {
    gameApi.leaderboard().then(setLeaderboard).catch(() => {})
  }, [])

  useEffect(() => {
    socket.on('leaderboard:update', setLeaderboard)
    return () => socket.off('leaderboard:update', setLeaderboard)
  }, [socket])

  return (
    <div className="space-y-5">
      <Card title="Gamification Center" subtitle="Motivation, rewards and healthy competition">
        <div className="rounded-xl bg-gradient-to-r from-indigo-500/40 to-pink-500/30 p-4">
          <p className="text-sm text-slate-200">Current points</p>
          <p className="text-3xl font-bold text-white">{points}</p>
        </div>
      </Card>

      <Card title="Badges">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div key={badge} className="animate-float rounded-xl bg-slate-900/40 p-4 text-center">
              <p className="text-3xl">🏅</p>
              <p className="mt-2 text-sm text-white">{badge}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Leaderboard">
          <div className="space-y-2">
            {leaderboard.map((user, idx) => (
              <div key={user.name} className="flex items-center justify-between rounded-lg bg-slate-900/40 p-2">
                <div className="flex items-center gap-2">
                  <Badge>#{idx + 1}</Badge>
                  <p className="text-sm text-white">{user.name}</p>
                </div>
                <p className="text-sm text-indigo-300">{user.points} pts</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Daily / Weekly Challenges">
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between rounded-lg bg-slate-900/40 p-3 text-sm text-slate-100">
                <div>
                  <p>{challenge.scope}: {challenge.title}</p>
                  <p className="text-xs text-slate-300">Reward: +{challenge.reward} points</p>
                </div>
                <Button
                  variant={challenge.completed ? 'secondary' : 'primary'}
                  onClick={() => completeChallenge(challenge.id)}
                  className="text-xs"
                >
                  {challenge.completed ? 'Completed' : 'Complete'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
