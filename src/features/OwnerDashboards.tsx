import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Widget } from '@/ui/dashboard/WidgetRenderer'
import { getDashboardConfig } from '@/ui/dashboard/dashboardConfigs'
import { useAuthStore } from '@/core/auth/authStore'
import type { DashboardKey } from '@/ui/dashboard/types'
import { useScopeStore } from '@/core/scope/scopeStore'

function OwnerDash({ variant }: { variant: DashboardKey }) {
  const config = getDashboardConfig(variant, 'BOTH')
  const { scope } = useScopeStore()

  if (!config) return null

  return (
    <DashboardLayout pageTitle={config.title}>
      {config.kpiRow.length > 0 && (
        <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
          {config.kpiRow.map((w, i) => (
            <Widget key={`kpi-${w.id}-${i}`} widgetId={w.id} size="1" config={w.config} scope={scope} />
          ))}
        </div>
      )}
      {config.kpiRow.length > 0 && config.rows.length > 0 && <div className="h-4" />}
      {config.rows.map((row, i) => (
        <div key={i} className={`grid grid-cols-4 gap-4 xl:grid-cols-2 ${i > 0 ? 'mt-4' : ''}`}>
          {row.widgets.map((w, idx) => (
            <Widget key={`${w.id}-${idx}`} widgetId={w.id} size={w.size} config={w.config} scope={scope} />
          ))}
        </div>
      ))}
    </DashboardLayout>
  )
}

export function OwnerDashboardCharge() {
  return <OwnerDash variant="OWNER_CHARGE" />
}

export function OwnerDashboardSwap() {
  return <OwnerDash variant="OWNER_SWAP" />
}

export function OwnerDashboardBoth() {
  return <OwnerDash variant="OWNER_BOTH" />
}

