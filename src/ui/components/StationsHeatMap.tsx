import { useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import countries110m from 'world-atlas/countries-110m.json'

export type StationMapPoint = {
  id: string
  name: string
  region: string
  org: string
  status: 'Online' | 'Degraded' | 'Offline' | 'Maintenance'
  healthScore: number
  openIncidents: number
  lastHeartbeat: string
  lat: number
  lon: number
}

type GeoFeature = any

function parseLatLon(gps: string): { lat: number; lon: number } | null {
  const parts = gps.split(',').map((s) => s.trim())
  if (parts.length !== 2) return null
  const lat = Number(parts[0])
  const lon = Number(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { lat, lon }
}

function statusColor(status: StationMapPoint['status']) {
  return status === 'Online'
    ? '#10b981'
    : status === 'Degraded'
      ? '#f59e0b'
      : status === 'Maintenance'
        ? '#f77f00'
        : '#ef4444'
}

export function StationsHeatMap({
  title,
  subtitle,
  points,
}: {
  title: string
  subtitle?: string
  points: StationMapPoint[]
}) {
  const [hover, setHover] = useState<StationMapPoint | null>(null)

  const countries = useMemo(() => {
    const topo = countries110m as any
    const fc = feature(topo, topo.objects.countries) as any
    return (fc.features ?? []) as GeoFeature[]
  }, [])

  const projection = useMemo(
    () => geoNaturalEarth1().fitSize([900, 420], { type: 'FeatureCollection', features: countries } as any),
    [countries],
  )
  const pathGen = useMemo(() => geoPath(projection as any), [projection])

  const stats = useMemo(() => {
    const total = points.length
    const online = points.filter((p) => p.status === 'Online').length
    const degraded = points.filter((p) => p.status === 'Degraded').length
    const offline = points.filter((p) => p.status === 'Offline').length
    const maint = points.filter((p) => p.status === 'Maintenance').length
    const incidents = points.reduce((a, p) => a + p.openIncidents, 0)
    const avgHealth = total ? Math.round(points.reduce((a, p) => a + p.healthScore, 0) / total) : 0
    return { total, online, degraded, offline, maint, incidents, avgHealth }
  }, [points])

  const projected = useMemo(() => {
    return points
      .map((p) => {
        const xy = (projection as any)([p.lon, p.lat]) as [number, number] | null
        if (!xy) return null
        return { ...p, x: xy[0], y: xy[1] }
      })
      .filter(Boolean) as Array<StationMapPoint & { x: number; y: number }>
  }, [points, projection])

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-text">{title}</div>
          {subtitle ? <div className="text-xs text-muted">{subtitle}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted">Avg health</span>
          <span className="pill approved">{stats.avgHealth}%</span>
          <span className="text-muted">Open incidents</span>
          <span className={stats.incidents ? 'pill sendback' : 'pill approved'}>{stats.incidents}</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 900 420" className="w-full h-auto">
          <rect x="0" y="0" width="900" height="420" rx="18" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.06)" />

          {/* countries */}
          {countries.map((f, idx) => (
            <path
              key={f.id ?? idx}
              d={pathGen(f) ?? ''}
              fill="rgba(255,255,255,.02)"
              stroke="rgba(255,255,255,.08)"
              strokeWidth="0.6"
            />
          ))}

          {/* dots */}
          {projected.map((p) => {
            const r = p.status === 'Offline' ? 5 : p.status === 'Degraded' ? 4.5 : 4
            return (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={r}
                fill={statusColor(p.status)}
                opacity={hover && hover.id !== p.id ? 0.35 : 0.92}
                stroke="rgba(0,0,0,.35)"
                strokeWidth="0.8"
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
              />
            )
          })}
        </svg>

        {hover ? (
          <div className="absolute right-3 top-3 rounded-xl border border-border-light bg-panel px-3 py-2 shadow-soft max-w-[320px]">
            <div className="text-xs text-muted">{hover.id}</div>
            <div className="text-sm font-semibold text-text">{hover.name}</div>
            <div className="text-xs text-muted">
              {hover.region} • {hover.org}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`pill ${hover.status === 'Online' ? 'approved' : hover.status === 'Degraded' ? 'pending' : hover.status === 'Maintenance' ? 'sendback' : 'rejected'}`}>
                {hover.status}
              </span>
              <span className="text-muted">health</span>
              <span className="pill approved">{hover.healthScore}%</span>
              <span className="text-muted">inc</span>
              <span className={hover.openIncidents ? 'pill sendback' : 'pill approved'}>{hover.openIncidents}</span>
              <span className="text-muted">{hover.lastHeartbeat}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="text-muted">Legend:</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: statusColor('Online') }} />
          Online ({stats.online})
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: statusColor('Degraded') }} />
          Degraded ({stats.degraded})
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: statusColor('Maintenance') }} />
          Maintenance ({stats.maint})
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: statusColor('Offline') }} />
          Offline ({stats.offline})
        </span>
      </div>
    </div>
  )
}

export function stationPointFromSeed(x: {
  id: string
  name: string
  region: string
  org: string
  status: StationMapPoint['status']
  healthScore: number
  openIncidents: number
  lastHeartbeat: string
  gps: string
}): StationMapPoint | null {
  const ll = parseLatLon(x.gps)
  if (!ll) return null
  return {
    id: x.id,
    name: x.name,
    region: x.region,
    org: x.org,
    status: x.status,
    healthScore: x.healthScore,
    openIncidents: x.openIncidents,
    lastHeartbeat: x.lastHeartbeat,
    lat: ll.lat,
    lon: ll.lon,
  }
}


