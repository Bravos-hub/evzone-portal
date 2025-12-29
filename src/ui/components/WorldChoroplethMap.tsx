import { useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath, geoCentroid } from 'd3-geo'
import { feature } from 'topojson-client'
import countries110m from 'world-atlas/countries-110m.json'
import { useTheme } from '@/ui/theme/provider'

export type ChoroplethRegionId = 'N_AMERICA' | 'EUROPE' | 'AFRICA' | 'ASIA' | 'MIDDLE_EAST'

export type ChoroplethDatum = {
  id: ChoroplethRegionId
  label: string
  metrics: {
    stations: number
    sessions: number
    uptime: number // percent
    revenueUsd: number
  }
}

type GeoFeature = any

type MetricId = 'composite' | 'stations' | 'sessions' | 'uptime' | 'revenue'

function fmtUsdShort(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

function metricLabel(m: MetricId) {
  return m === 'stations'
    ? 'Stations'
    : m === 'sessions'
      ? 'Sessions'
      : m === 'uptime'
        ? 'Uptime'
        : m === 'revenue'
          ? 'Revenue'
          : 'Composite'
}

function metricValue(d: ChoroplethDatum, m: MetricId) {
  return m === 'stations'
    ? d.metrics.stations
    : m === 'sessions'
      ? d.metrics.sessions
      : m === 'uptime'
        ? d.metrics.uptime
        : m === 'revenue'
          ? d.metrics.revenueUsd
          : 0
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (x: number) => Math.round(x).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t))
}

function regionForCentroid([lon, lat]: [number, number]): ChoroplethRegionId | null {
  // Very lightweight heuristic assignment (good enough for “real map feel” with mocked regions).
  // Longitude: -180..180, Latitude: -90..90.
  // Middle East carved out of broader Africa/Asia bounds.
  if (lon >= -170 && lon <= -20 && lat >= 5) return 'N_AMERICA'
  if (lon >= -25 && lon <= 45 && lat >= 35 && lat <= 72) return 'EUROPE'
  if (lon >= -20 && lon <= 55 && lat >= -35 && lat <= 35) {
    if (lon >= 35 && lon <= 65 && lat >= 12 && lat <= 40) return 'MIDDLE_EAST'
    return 'AFRICA'
  }
  if (lon >= 45 && lon <= 180 && lat >= 5 && lat <= 80) {
    if (lon >= 35 && lon <= 65 && lat >= 12 && lat <= 40) return 'MIDDLE_EAST'
    return 'ASIA'
  }
  return null
}

export function WorldChoroplethMap({
  title,
  subtitle,
  data,
  defaultMetric = 'composite',
  lowColor,
  highColor,
}: {
  title: string
  subtitle?: string
  data: ChoroplethDatum[]
  defaultMetric?: MetricId
  lowColor?: string
  highColor?: string
}) {
  const t = useTheme()
  const [hover, setHover] = useState<ChoroplethDatum | null>(null)
  const [metric, setMetric] = useState<MetricId>(defaultMetric)

  const low = lowColor ?? '#152033'
  const high = highColor ?? t.theme.colors.accent.DEFAULT

  const byId = useMemo(() => {
    const m = new Map<ChoroplethRegionId, ChoroplethDatum>()
    data.forEach((d) => m.set(d.id, d))
    return m
  }, [data])

  const countries = useMemo(() => {
    const topo = countries110m as any
    const fc = feature(topo, topo.objects.countries) as any
    return (fc.features ?? []) as GeoFeature[]
  }, [])

  const ranges = useMemo(() => {
    const ms: Array<Exclude<MetricId, 'composite'>> = ['stations', 'sessions', 'uptime', 'revenue']
    const r: Record<string, { min: number; max: number }> = {}
    ms.forEach((k) => {
      const vals = data.map((d) => metricValue(d, k as any))
      r[k] = { min: Math.min(...vals), max: Math.max(...vals) }
    })
    return r as Record<Exclude<MetricId, 'composite'>, { min: number; max: number }>
  }, [data])

  const compositeById = useMemo(() => {
    const ms: Array<Exclude<MetricId, 'composite'>> = ['stations', 'sessions', 'uptime', 'revenue']
    const weights: Record<Exclude<MetricId, 'composite'>, number> = { stations: 0.25, sessions: 0.25, uptime: 0.25, revenue: 0.25 }
    const out = new Map<ChoroplethRegionId, number>()
    data.forEach((d) => {
      let s = 0
      ms.forEach((k) => {
        const v = metricValue(d, k as any)
        const rr = ranges[k]
        const denom = rr.max - rr.min || 1
        const t = clamp01((v - rr.min) / denom)
        s += t * weights[k]
      })
      out.set(d.id, s)
    })
    return out
  }, [data, ranges])

  const range = useMemo(() => {
    if (metric === 'composite') return { min: 0, max: 1 }
    const r = ranges[metric]
    return r ?? { min: 0, max: 1 }
  }, [metric, ranges])

  const projection = useMemo(() => geoNaturalEarth1().fitSize([640, 320], { type: 'FeatureCollection', features: countries } as any), [countries])
  const pathGen = useMemo(() => geoPath(projection as any), [projection])

  const colorForRegion = (id: ChoroplethRegionId | null) => {
    if (!id) return 'rgba(255,255,255,.06)'
    const d = byId.get(id)
    const denom = range.max - range.min || 1
    const raw =
      metric === 'composite'
        ? compositeById.get(id) ?? 0
        : d
          ? metricValue(d, metric)
          : 0
    const t = clamp01((raw - range.min) / denom)
    return mixHex(low, high, t)
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-text">{title}</div>
          {subtitle ? <div className="text-xs text-muted">{subtitle}</div> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex gap-1 rounded-xl border border-border-light bg-panel px-1 py-1">
            {(['composite', 'stations', 'sessions', 'uptime', 'revenue'] as MetricId[]).map((m) => (
              <button
                key={m}
                type="button"
                className={m === metric ? 'btn ghost bg-white/5' : 'btn ghost'}
                onClick={() => setMetric(m)}
                style={{ padding: '6px 10px' }}
              >
                {m === 'composite' ? 'All' : metricLabel(m)}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted">
            {metricLabel(metric)}: {metric === 'uptime' ? `${range.min.toFixed(1)}% — ${range.max.toFixed(1)}%` : metric === 'revenue' ? `${fmtUsdShort(range.min)} — ${fmtUsdShort(range.max)}` : `${range.min.toFixed(0)} — ${range.max.toFixed(0)}`}
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 640 320" className="w-full h-auto">
          <defs>
            <linearGradient id="wmLegend" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={lowColor} />
              <stop offset="1" stopColor={high} />
            </linearGradient>
          </defs>

          {/* ocean / frame */}
          <rect x="0" y="0" width="640" height="320" rx="16" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.06)" />

          {/* countries */}
          {countries.map((f, idx) => {
            const c = geoCentroid(f) as [number, number]
            const rid = regionForCentroid(c)
            const d = rid ? byId.get(rid) ?? null : null
            const fill = colorForRegion(rid)
            const dPath = pathGen(f) ?? ''
            return (
              <path
                key={f.id ?? idx}
                d={dPath}
                fill={fill}
                stroke="rgba(255,255,255,.10)"
                strokeWidth="0.5"
                opacity={hover && d && hover.id !== d.id ? 0.45 : 0.95}
                onMouseEnter={() => setHover(d)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: d ? 'default' : 'default' }}
              />
            )
          })}
        </svg>

        {hover ? (
          <div className="absolute right-3 top-3 rounded-xl border border-border-light bg-panel px-3 py-2 shadow-soft">
            <div className="text-xs text-muted">{hover.label}</div>
            <div className="text-sm font-semibold text-text">
              {metric === 'composite'
                ? `${Math.round((compositeById.get(hover.id) ?? 0) * 100)} / 100`
                : metric === 'uptime'
                  ? `${hover.metrics.uptime.toFixed(2)}%`
                  : metric === 'revenue'
                    ? fmtUsdShort(hover.metrics.revenueUsd)
                    : metric === 'sessions'
                      ? hover.metrics.sessions.toLocaleString()
                      : hover.metrics.stations.toLocaleString()}
            </div>
            <div className="text-xs text-muted">
              Stations {hover.metrics.stations.toLocaleString()} • Sessions {hover.metrics.sessions.toLocaleString()} • Uptime {hover.metrics.uptime.toFixed(2)}% • Revenue {fmtUsdShort(hover.metrics.revenueUsd)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 w-40 rounded-full" style={{ background: 'linear-gradient(90deg, ' + low + ', ' + high + ')' }} />
        <div className="text-xs text-muted">Low</div>
        <div className="text-xs text-muted">High</div>
      </div>
    </div>
  )
}


