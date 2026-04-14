import { Bell, Moon, Search, Sun, UserCircle2 } from 'lucide-react'
import Badge from '../ui/Badge'
import { useAppStore } from '../../hooks/useAppStore'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'
import { languageOptions, t } from '../../utils/i18n'
import { useClerk, useUser } from '@clerk/clerk-react'

export default function TopNavbar({ notifications }) {
  const { theme, toggleTheme, language, setLanguage, adminAuthenticated, setAdminAuthenticated, setRole } =
    useAppStore()
  const { signOut } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (adminAuthenticated) {
      setAdminAuthenticated(false)
      setRole('student')
      navigate('/admin/login')
      return
    }
    await signOut()
    navigate('/login')
  }

  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <label className="flex min-w-56 items-center gap-2 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
        <Search size={16} className="text-slate-300" />
        <input
          type="text"
          placeholder={t(language, 'searchPlaceholder')}
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />
      </label>

      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-xs"
        >
          {languageOptions.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-white/10 bg-slate-900/40 p-2 text-slate-100"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Badge className="flex items-center gap-2">
          <Bell size={14} />
          {notifications} new
        </Badge>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
          <UserCircle2 size={18} className="text-indigo-300" />
          <p className="text-sm text-white">{user?.firstName || user?.username || 'Learner'}</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          {t(language, 'logout')}
        </Button>
      </div>
    </header>
  )
}
