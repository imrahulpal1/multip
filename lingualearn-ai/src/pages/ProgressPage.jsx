import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import { progressData, timeline } from '../utils/mockData'
import { useAppStore } from '../hooks/useAppStore'

export default function ProgressPage() {
  const { moduleProgress, toggleModuleComplete, timeSpentMinutes, performance, recordQuizScore, getAdaptivePathForUser } =
    useAppStore()
  const adaptivePath = getAdaptivePathForUser()

  return (
    <div className="space-y-5">
      <Card title="Progress Dashboard" subtitle="Track growth across language skills">
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vocabulary" stroke="#a78bfa" strokeWidth={2} />
              <Line type="monotone" dataKey="grammar" stroke="#60a5fa" strokeWidth={2} />
              <Line type="monotone" dataKey="speaking" stroke="#f472b6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Skill Progress">
        <div className="space-y-4">
          <ProgressBar label="Vocabulary" value={86} />
          <ProgressBar label="Grammar" value={74} />
          <ProgressBar label="Speaking" value={62} />
          <ProgressBar label="Listening" value={70} />
        </div>
      </Card>

      <Card title="Basic Progress Tracking">
        <p className="mb-3 text-sm text-slate-300">Total time spent: {timeSpentMinutes} minutes</p>
        <div className="space-y-2">
          {moduleProgress.map((module) => (
            <button
              key={module.id}
              onClick={() => toggleModuleComplete(module.id)}
              className="flex w-full items-center justify-between rounded-lg bg-slate-900/40 p-3 text-left text-sm text-slate-100"
            >
              <span>{module.title}</span>
              <span>{module.completed ? 'Completed' : 'Pending'}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Adaptive Content Path">
        <p className="text-sm text-slate-200">Average quiz score: {performance.averageScore}%</p>
        <p className="mt-1 text-sm text-slate-200">Recommended difficulty: {adaptivePath.difficulty}</p>
        <p className="mt-1 text-sm text-slate-300">{adaptivePath.recommendedReading}</p>
        <p className="mt-1 text-sm text-slate-300">{adaptivePath.quizMode}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => recordQuizScore(55)}
            className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-xs"
          >
            Simulate low score
          </button>
          <button
            onClick={() => recordQuizScore(92)}
            className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-xs"
          >
            Simulate high score
          </button>
        </div>
      </Card>

      <Card title="Activity Timeline">
        <ol className="space-y-2">
          {timeline.map((event) => (
            <li key={event} className="rounded-lg bg-slate-900/40 p-3 text-sm text-slate-100">
              {event}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
