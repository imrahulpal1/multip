import { useEffect, useMemo, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { adminApi, forumApi, gameApi } from '../services/api'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [discussions, setDiscussions] = useState([])

  const loadAdminData = async () => {
    const [usersData, analyticsData, leaderboardData, discussionsData] = await Promise.all([
      adminApi.users(),
      adminApi.analytics(),
      gameApi.leaderboard(),
      forumApi.list('English'),
    ])
    setUsers(usersData)
    setAnalytics(analyticsData)
    setLeaderboard(leaderboardData)
    setDiscussions(discussionsData)
  }

  useEffect(() => {
    const run = async () => {
      await loadAdminData().catch(() => {})
    }
    setTimeout(run, 0)
  }, [])

  const chartData = useMemo(
    () => [
      { name: 'Users', value: analytics?.totalUsers || 0 },
      { name: 'Courses', value: analytics?.totalCourses || 0 },
      { name: 'Discussions', value: analytics?.totalDiscussions || 0 },
      { name: 'Pending', value: analytics?.pendingDiscussions || 0 },
    ],
    [analytics],
  )

  return (
    <div className="space-y-5">
      <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card title="Admin Analytics" subtitle="Platform health and operations overview">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#7c8cff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Motion.div>

      <Card title="Manage Users">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-300">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-white/10">
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">{user.role}</td>
                  <td className="px-3 py-2">{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Leaderboard Monitor">
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <div key={entry._id} className="flex items-center justify-between rounded-lg bg-slate-900/40 p-3 text-sm">
              <span>
                #{idx + 1} {entry.name}
              </span>
              <span>{entry.points} pts</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Review Discussions">
        <div className="space-y-2">
          {discussions.map((discussion) => (
            <div key={discussion._id} className="rounded-lg bg-slate-900/40 p-3">
              <p className="font-medium">{discussion.title}</p>
              <p className="text-xs text-slate-300">{discussion.content}</p>
              {!discussion.approved && (
                <Button className="mt-2" onClick={() => forumApi.approve(discussion._id).then(loadAdminData)}>
                  Approve
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
