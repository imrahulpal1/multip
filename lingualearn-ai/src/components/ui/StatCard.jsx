import Card from './Card'

export default function StatCard({ title, value, delta }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-emerald-300">{delta}</p>
    </Card>
  )
}
