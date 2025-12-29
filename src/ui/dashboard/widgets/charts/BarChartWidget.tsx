import type { WidgetProps } from '../../types'
import { Card } from '@/ui/components/Card'

export type BarChartConfig = {
  title?: string
  subtitle?: string
  values: number[]
  color?: string
  labels?: string[]
}

function BarChartSvg({ values, color }: { values: number[]; color: string }) {
  const w = 520
  const h = 180
  const pad = 18
  const max = Math.max(...values, 1)
  const bw = (w - pad * 2) / values.length
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(255,255,255,.08)" />
      {values.map((v, i) => {
        const x = pad + i * bw + bw * 0.18
        const barW = bw * 0.64
        const barH = ((h - pad * 2) * v) / max
        const y = h - pad - barH
        return <rect key={i} x={x} y={y} width={barW} height={barH} rx={8} fill={color} opacity={0.9} />
      })}
    </svg>
  )
}

export function BarChartWidget({ config }: WidgetProps<BarChartConfig>) {
  const { title, subtitle, values = [], color = '#f77f00', labels } = config ?? {}

  return (
    <Card>
      {title && (
        <div className="mb-3">
          <div className="card-title">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
      )}
      <BarChartSvg values={values} color={color} />
      {labels && labels.length > 0 && (
        <div className="flex justify-between text-xs text-muted mt-2 px-4">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </Card>
  )
}

