import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Widget } from '@/ui/dashboard/WidgetRenderer'
import { getDashboardConfig } from '@/ui/dashboard/dashboardConfigs'
import { useScopeStore } from '@/core/scope/scopeStore'

export function AttendantDashboard() {
  const config = getDashboardConfig('ATTENDANT', undefined)
  const { scope } = useScopeStore()
  if (!config) return null

  return (
    <DashboardLayout pageTitle={config.title}>
      {config.kpiRow.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {config.kpiRow.map((w, i) => (
            <Widget key={`kpi-${w.id}-${i}`} widgetId={w.id} size="1" config={w.config} scope={scope} />
          ))}
        </div>
      )}
      {config.kpiRow.length > 0 && config.rows.length > 0 && <div className="h-4" />}
      {config.rows.map((row, i) => (
        <div key={i} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${i > 0 ? 'mt-4' : ''}`}>
          {row.widgets.map((w, idx) => (
            <Widget key={`${w.id}-${idx}`} widgetId={w.id} size={w.size} config={w.config} scope={scope} />
          ))}
        </div>
      ))}
    </DashboardLayout>
  )
}

