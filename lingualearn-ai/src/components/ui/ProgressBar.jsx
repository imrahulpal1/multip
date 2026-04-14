export default function ProgressBar({ value, max = 100, label }) {
  const percent = Math.min(100, (value / max) * 100)

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-slate-300">{label}</p>}
      <div className="h-2 w-full rounded-full bg-slate-800/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">{Math.round(percent)}% complete</p>
    </div>
  )
}
