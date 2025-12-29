import type { WidgetProps } from '../../types'
import { Card } from '@/ui/components/Card'

export type Trend = 'up' | 'down' | 'flat'

export type KpiGenericConfig = {
  title: string
  value: string
  delta?: string
  trend?: Trend
}

function TrendPill({ trend }: { trend: Trend }) {
  if (trend === 'up') return <span className="pill approved">▲ Up</span>
  if (trend === 'down') return <span className="pill rejected">▼ Down</span>
  return <span className="pill pending">• Flat</span>
}

export function KpiGenericWidget({ config }: WidgetProps<KpiGenericConfig>) {
  const { title = 'KPI', value = '—', delta, trend } = config ?? {}

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="card-title mb-2.5">{title}</div>
          <div className="kpi-value">{value}</div>
        </div>
        {(trend || delta) && (
          <div className="text-right">
            {trend && <TrendPill trend={trend} />}
            {delta && <div className="text-xs text-muted mt-2">{delta}</div>}
          </div>
        )}
      </div>
    </Card>
  )
}

/** Simple KPI card without trend (backward compat) */
export function KpiSimpleWidget({ config }: WidgetProps<{ title: string; value: string }>) {
  const { title = 'KPI', value = '—' } = config ?? {}
  return (
    <Card>
      <p className="card-title mb-2.5">{title}</p>
      <p className="kpi-value">{value}</p>
    </Card>
  )
}

