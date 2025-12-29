import type { WidgetProps } from '../../types'
import { Card } from '@/ui/components/Card'

export type LineChartConfig = {
  title?: string
  subtitle?: string
  values: number[]
  stroke?: string
  labels?: string[]
}

function LineChartSvg({ values, stroke }: { values: number[]; stroke: string }) {
  const w = 520
  const h = 180
  const pad = 18
  const min = Math.min(...values)
  const max = Math.max(...values)
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min))
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1)
    const y = pad + (1 - norm(v)) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path
        d={`M ${pts.join(' L ')}`}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => {
        const [x, y] = p.split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r={4} fill={stroke} opacity={0.9} />
      })}
    </svg>
  )
}

export function LineChartWidget({ config }: WidgetProps<LineChartConfig>) {
  const { title, subtitle, values = [], stroke = '#03cd8c', labels } = config ?? {}

  return (
    <Card>
      {title && (
        <div className="mb-3">
          <div className="card-title">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
      )}
      <LineChartSvg values={values} stroke={stroke} />
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

