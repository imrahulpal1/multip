import Card from '../components/ui/Card'
import { useAppStore } from '../hooks/useAppStore'
import { t } from '../utils/i18n'

export default function UnauthorizedPage() {
  const { language } = useAppStore()

  return (
    <Card title="Access Restricted">
      <p className="text-sm text-slate-200">{t(language, 'unauthorized')}</p>
    </Card>
  )
}
