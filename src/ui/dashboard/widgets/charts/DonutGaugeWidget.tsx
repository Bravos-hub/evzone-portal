import type { WidgetProps } from '../../types'
import { Card } from '@/ui/components/Card'

export type DonutGaugeConfig = {
  title?: string
  subtitle?: string
  value: number
  label?: string
  color?: string
  target?: number
  secondaryLabel?: string
  secondaryValue?: string
}

export function DonutGaugeWidget({ config }: WidgetProps<DonutGaugeConfig>) {
  const {
    title,
    subtitle,
    value = 0,
    label = 'Value',
    color = 'rgba(3,205,140,.95)',
    target,
    secondaryLabel,
    secondaryValue,
  } = config ?? {}

  const pct = Math.max(0, Math.min(100, value))
  const r = 54
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  const rest = c - dash

  return (
    <Card>
      {title && (
        <div className="mb-3">
          <div className="card-title">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
      )}
      <div className="flex items-center justify-center gap-5 flex-wrap">
        <svg width={150} height={150} viewBox="0 0 150 150" aria-hidden="true">
          <circle cx="75" cy="75" r={r} stroke="rgba(255,255,255,.08)" strokeWidth="14" fill="none" />
          <circle
            cx="75"
            cy="75"
            r={r}
            stroke={color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${dash} ${rest}`}
            strokeLinecap="round"
            transform="rotate(-90 75 75)"
          />
          <text x="75" y="78" textAnchor="middle" fontSize="22" fill="white" fontWeight="800">
            {pct.toFixed(1)}%
          </text>
          <text x="75" y="100" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.6)" fontWeight="600">
            {label}
          </text>
        </svg>
        <div className="grid gap-2">
          {target !== undefined && (
            <div className="panel">
              <div className="text-xs text-muted">Target</div>
              <div className="text-sm font-extrabold text-text">{target}%</div>
            </div>
          )}
          {secondaryLabel && secondaryValue && (
            <div className="panel">
              <div className="text-xs text-muted">{secondaryLabel}</div>
              <div className="text-sm font-extrabold text-text">{secondaryValue}</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

