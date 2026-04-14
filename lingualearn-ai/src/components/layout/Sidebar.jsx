import {
  BookOpen,
  Brain,
  ChartNoAxesCombined,
  Flame,
  House,
  Settings,
  Shield,
  Trophy,
  Users,
} from 'lucide-react'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { navItems } from '../../utils/mockData'
import { useAppStore } from '../../hooks/useAppStore'
import { t } from '../../utils/i18n'

const icons = {
  dashboard: House,
  lecture: BookOpen,
  tutor: Brain,
  peer: Users,
  gamification: Trophy,
  progress: ChartNoAxesCombined,
  courses: BookOpen,
  preferences: Settings,
  admin: Shield,
}

export default function Sidebar() {
  const { role, language } = useAppStore()
  const visibleNav = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl md:flex">
      <div className="mb-8 flex items-center gap-2">
        <div className="rounded-lg bg-gradient-to-br from-indigo-400 to-pink-400 p-2 text-slate-950">
          <Flame size={16} />
        </div>
        <div>
          <p className="font-semibold text-white">LinguaLearn AI</p>
          <p className="text-xs text-slate-300">Context-Aware Learning</p>
        </div>
      </div>

      <nav className="space-y-2">
        {visibleNav.map((item) => {
          const Icon = icons[item.id]
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/70 to-violet-500/70 text-white'
                    : 'text-slate-300 hover:bg-white/10',
                )
              }
            >
              <Icon size={16} />
              {t(language, item.labelKey)}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
