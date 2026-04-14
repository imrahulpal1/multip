import { navItems } from '../../utils/mockData'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../hooks/useAppStore'
import { t } from '../../utils/i18n'

export default function MobileNav() {
  const { role, language } = useAppStore()
  const visibleNav = navItems.filter((item) => item.roles.includes(role))

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
      {visibleNav.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            clsx(
              'rounded-xl border px-3 py-2 text-center text-xs',
              isActive
                ? 'border-indigo-300 bg-indigo-500/40 text-white'
                : 'border-white/10 bg-white/10 text-slate-200',
            )
          }
        >
          {t(language, item.labelKey)}
        </NavLink>
      ))}
    </div>
  )
}
