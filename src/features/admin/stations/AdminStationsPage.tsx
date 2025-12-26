import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StationStatusPill, type StationStatus } from '@/ui/components/StationStatusPill'
import { StationsHeatMap, stationPointFromSeed } from '@/ui/components/StationsHeatMap'

type StationType = 'Charge' | 'Swap' | 'Both'
type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST'

type Station = {
  id: string
  name: string
  region: Region
  country: string
  org: string
  type: StationType
  status: StationStatus
  healthScore: number // 0-100
  utilization: number // 0-100
  connectors: number // for charge
  swapBays: number // for swap
  openIncidents: number
  lastHeartbeat: string
  address: string
  gps: string
}

const regions: Array<{ id: Region | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const types: Array<StationType | 'All'> = ['All', 'Charge', 'Swap', 'Both']
const stati: Array<StationStatus | 'All'> = ['All', 'Online', 'Degraded', 'Offline', 'Maintenance']

const seed: Station[] = [
  {
    id: 'ST-0001',
    name: 'Kampala CBD Hub',
    region: 'AFRICA',
    country: 'UGA',
    org: 'Volt Mobility Ltd',
    type: 'Both',
    status: 'Degraded',
    healthScore: 72,
    utilization: 61,
    connectors: 10,
    swapBays: 24,
    openIncidents: 3,
    lastHeartbeat: '2m ago',
    address: 'Kampala Road, Kampala',
    gps: '0.3163, 32.5822',
  },
  {
    id: 'ST-0002',
    name: 'Entebbe Airport Lot',
    region: 'AFRICA',
    country: 'UGA',
    org: 'GridCity Ltd',
    type: 'Charge',
    status: 'Online',
    healthScore: 94,
    utilization: 49,
    connectors: 12,
    swapBays: 0,
    openIncidents: 0,
    lastHeartbeat: '30s ago',
    address: 'Airport Road, Entebbe',
    gps: '0.0421, 32.4435',
  },
  {
    id: 'ST-0017',
    name: 'Gulu Main Street',
    region: 'AFRICA',
    country: 'UGA',
    org: 'Volt Mobility Ltd',
    type: 'Swap',
    status: 'Maintenance',
    healthScore: 66,
    utilization: 33,
    connectors: 0,
    swapBays: 18,
    openIncidents: 2,
    lastHeartbeat: '—',
    address: 'Main St, Gulu',
    gps: '2.7724, 32.2881',
  },
  {
    id: 'ST-0092',
    name: 'Nairobi Westlands',
    region: 'AFRICA',
    country: 'KEN',
    org: 'SunRun Ops',
    type: 'Charge',
    status: 'Offline',
    healthScore: 12,
    utilization: 0,
    connectors: 8,
    swapBays: 0,
    openIncidents: 5,
    lastHeartbeat: '3h ago',
    address: 'Westlands, Nairobi',
    gps: '-1.2676, 36.8105',
  },
  {
    id: 'ST-1011',
    name: 'Berlin Mitte Garage',
    region: 'EUROPE',
    country: 'DEU',
    org: 'Mall Holdings',
    type: 'Both',
    status: 'Online',
    healthScore: 90,
    utilization: 74,
    connectors: 16,
    swapBays: 30,
    openIncidents: 1,
    lastHeartbeat: '40s ago',
    address: 'Mitte, Berlin',
    gps: '52.5200, 13.4050',
  },
]

async function apiList(): Promise<Station[]> {
  await new Promise((r) => setTimeout(r, 160))
  return seed
}

type DrawerTab = 'overview' | 'assets' | 'incidents' | 'config'

export function AdminStationsPage() {
  const [rows, setRows] = useState<Station[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region | 'ALL'>('ALL')
  const [type, setType] = useState<StationType | 'All'>('All')
  const [status, setStatus] = useState<StationStatus | 'All'>('All')
  const [org, setOrg] = useState<string>('ALL')
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<DrawerTab>('overview')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void (async () => {
      const data = await apiList()
      setRows(data)
    })()
  }, [])

  const orgs = useMemo(() => {
    const s = new Set(rows.map((r) => r.org))
    return ['ALL', ...Array.from(s)]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okQ = !q || (r.id + ' ' + r.name + ' ' + r.org + ' ' + r.country).toLowerCase().includes(q.toLowerCase())
      const okR = region === 'ALL' || r.region === region
      const okT = type === 'All' || r.type === type
      const okS = status === 'All' || r.status === status
      const okO = org === 'ALL' || r.org === org
      return okQ && okR && okT && okS && okO
    })
  }, [rows, q, region, type, status, org])

  const allChecked = filtered.length > 0 && filtered.every((r) => sel[r.id])
  const someChecked = filtered.some((r) => sel[r.id])

  function toggleAll() {
    const next: Record<string, boolean> = {}
    const val = !allChecked
    filtered.forEach((r) => (next[r.id] = val))
    setSel(next)
  }
  function toggle(id: string) {
    setSel((s) => ({ ...s, [id]: !s[id] }))
  }

  async function bulkSetStatus(nextStatus: StationStatus) {
    const ids = filtered.filter((r) => sel[r.id]).map((r) => r.id)
    if (ids.length === 0) return
    setBusy(true)
    try {
      await new Promise((r) => setTimeout(r, 250))
      setRows((list) => list.map((r) => (ids.includes(r.id) ? { ...r, status: nextStatus } : r)))
      setSel({})
    } finally {
      setBusy(false)
    }
  }

  const kpi = useMemo(() => {
    const total = filtered.length
    const online = filtered.filter((r) => r.status === 'Online').length
    const degraded = filtered.filter((r) => r.status === 'Degraded').length
    const offline = filtered.filter((r) => r.status === 'Offline').length
    const incidents = filtered.reduce((a, r) => a + r.openIncidents, 0)
    const avgHealth = total ? Math.round(filtered.reduce((a, r) => a + r.healthScore, 0) / total) : 0
    return { total, online, degraded, offline, incidents, avgHealth }
  }, [filtered])

  const mapPoints = useMemo(() => {
    return filtered
      .map((s) => stationPointFromSeed(s))
      .filter(Boolean) as Array<ReturnType<typeof stationPointFromSeed> extends infer T ? Exclude<T, null> : never>
  }, [filtered])

  const watch = useMemo(() => {
    const topDegraded = [...filtered].sort((a, b) => a.healthScore - b.healthScore).slice(0, 5)
    const repeatIncidents = [...filtered].sort((a, b) => b.openIncidents - a.openIncidents).slice(0, 5)
    const heartbeatGaps = [...filtered]
      .filter((s) => s.lastHeartbeat.includes('h') || s.lastHeartbeat.includes('—'))
      .slice(0, 5)
    return { topDegraded, repeatIncidents, heartbeatGaps }
  }, [filtered])

  const openRow = rows.find((r) => r.id === openId) ?? null

  return (
    <DashboardLayout pageTitle="Stations (All)">
      <div className="card">
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="Search station id/name/org/country"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="grid grid-cols-4 gap-3 md:grid-cols-2">
            <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>

            <select className="select" value={org} onChange={(e) => setOrg(e.target.value)}>
              {orgs.map((o) => (
                <option key={o} value={o}>
                  {o === 'ALL' ? 'All Orgs' : o}
                </option>
              ))}
            </select>

            <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>

            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              {stati.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Status' : s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn secondary"
              onClick={() => {
                setStatus('All')
                setType('All')
                setRegion('ALL')
                setOrg('ALL')
                setQ('')
              }}
            >
              Reset filters
            </button>

            <button className="btn" onClick={() => bulkSetStatus('Maintenance')} disabled={!someChecked || busy}>
              {busy ? 'Working…' : 'Set Maintenance'}
            </button>

            <button className="btn secondary" onClick={() => bulkSetStatus('Online')} disabled={!someChecked || busy}>
              Set Online
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              { k: 'stations', v: kpi.total },
              { k: 'online', v: kpi.online },
              { k: 'degraded', v: kpi.degraded },
              { k: 'offline', v: kpi.offline },
              { k: 'open incidents', v: kpi.incidents },
              { k: 'avg health', v: kpi.avgHealth },
            ].map((x) => (
              <span
                key={x.k}
                className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-panel-2 px-3 py-2 text-xs text-text-secondary"
              >
                <strong className="text-text">{x.v}</strong>
                <span className="whitespace-nowrap">{x.k}</span>
              </span>
            ))}

            <div className="flex-1" />
            <span className="text-xs text-muted">Tip: click a station ID to open the detail drawer.</span>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
        <div className="card">
          <div className="card-title">Map / Region Heat</div>
          <div className="panel">
            <StationsHeatMap
              title="Station clusters & health"
              subtitle="Mocked geo view (country outlines) + station dots by status"
              points={mapPoints}
            />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Watchlist</div>
          <div className="grid gap-3">
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Top degraded (health)</div>
              <div className="grid gap-2">
                {watch.topDegraded.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text">{s.name}</span>
                      <span className="text-xs text-muted">{s.id} • {s.region} • {s.org}</span>
                    </div>
                    <span className="pill pending">{s.healthScore}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Repeat incidents</div>
              <div className="grid gap-2">
                {watch.repeatIncidents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text">{s.name}</span>
                      <span className="text-xs text-muted">{s.id} • {s.region}</span>
                    </div>
                    <span className={s.openIncidents ? 'pill sendback' : 'pill approved'}>{s.openIncidents}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Heartbeat gaps</div>
              <div className="grid gap-2">
                {watch.heartbeatGaps.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text">{s.name}</span>
                      <span className="text-xs text-muted">{s.id} • {s.region}</span>
                    </div>
                    <span className="text-xs text-muted">{s.lastHeartbeat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 42 }}>
                <input className="checkbox" type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>Org</th>
              <th>Type</th>
              <th>Status</th>
              <th>Health</th>
              <th>Utilization</th>
              <th>Incidents</th>
              <th>Heartbeat</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <input className="checkbox" type="checkbox" checked={!!sel[r.id]} onChange={() => toggle(r.id)} />
                </td>
                <td style={{ fontWeight: 800 }}>
                  <button
                    className="btn secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => {
                      setOpenId(r.id)
                      setTab('overview')
                    }}
                  >
                    {r.id}
                  </button>
                </td>
                <td>{r.name}</td>
                <td>
                  {r.region} • {r.country}
                </td>
                <td>{r.org}</td>
                <td>{r.type}</td>
                <td>
                  <StationStatusPill status={r.status} />
                </td>
                <td>{r.healthScore}%</td>
                <td>{r.utilization}%</td>
                <td>{r.openIncidents}</td>
                <td className="small">{r.lastHeartbeat}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      className="btn secondary"
                      onClick={() => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, status: 'Online' } : x)))}
                    >
                      Ping
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, status: 'Maintenance' } : x)))}
                    >
                      Maintain
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openRow ? (
        <StationDrawer
          row={openRow}
          tab={tab}
          setTab={setTab}
          onClose={() => setOpenId(null)}
          onSetStatus={(s) => setRows((list) => list.map((x) => (x.id === openRow.id ? { ...x, status: s } : x)))}
        />
      ) : null}
    </DashboardLayout>
  )
}

function StationDrawer({
  row,
  tab,
  setTab,
  onClose,
  onSetStatus,
}: {
  row: Station
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  onClose: () => void
  onSetStatus: (s: StationStatus) => void
}) {
  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.name}</div>
            <div className="small">
              {row.id} • {row.region} • {row.org}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            Overview
          </button>
          <button className={`tab ${tab === 'assets' ? 'active' : ''}`} onClick={() => setTab('assets')}>
            Assets
          </button>
          <button className={`tab ${tab === 'incidents' ? 'active' : ''}`} onClick={() => setTab('incidents')}>
            Incidents
          </button>
          <button className={`tab ${tab === 'config' ? 'active' : ''}`} onClick={() => setTab('config')}>
            Config
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div className="split">
            <span className="chip">
              Status: <strong>{row.status}</strong>
            </span>
            <span className="chip">
              Health: <strong>{row.healthScore}%</strong>
            </span>
            <span className="chip">
              Utilization: <strong>{row.utilization}%</strong>
            </span>
            <span className="chip">
              Incidents: <strong>{row.openIncidents}</strong>
            </span>
            <span className="chip">
              Heartbeat: <strong>{row.lastHeartbeat}</strong>
            </span>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'overview' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Info label="Address" value={row.address} span2 />
                <Info label="GPS" value={row.gps} />
                <Info label="Country" value={row.country} />
                <Info label="Type" value={row.type} />
                <Info label="Connectors" value={String(row.connectors)} />
                <Info label="Swap Bays" value={String(row.swapBays)} />
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Quick actions</div>
              <div className="split" style={{ justifyContent: 'flex-end' }}>
                <button className="btn secondary" onClick={() => onSetStatus('Online')}>
                  Set Online
                </button>
                <button className="btn secondary" onClick={() => onSetStatus('Degraded')}>
                  Set Degraded
                </button>
                <button className="btn secondary" onClick={() => onSetStatus('Maintenance')}>
                  Set Maintenance
                </button>
                <button className="btn secondary" onClick={() => onSetStatus('Offline')}>
                  Set Offline
                </button>
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">Create incident / dispatch / broadcast notice placeholders</div>
            </div>
          </div>
        ) : tab === 'assets' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Assets (placeholder)</div>
              <div className="panel">Chargers, connectors, meters, swap lockers, batteries.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Telemetry (placeholder)</div>
              <div className="panel">Heartbeat, errors, temperature, voltage/current, OCPP events.</div>
            </div>
          </div>
        ) : tab === 'incidents' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Open incidents (placeholder)</div>
              <div className="panel">Incident list filtered by station with SLA timers and escalation.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">History (placeholder)</div>
              <div className="panel">Past incidents, repeat faults, maintenance log.</div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Station configuration (placeholder)</div>
              <div className="panel">Business hours, access rules, pricing linkage, contacts, emergency procedures.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Permissions & scope (placeholder)</div>
              <div className="panel">Which org staff can manage this station. Manager/attendant assignments.</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Info({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div style={{ gridColumn: span2 ? '1 / -1' : undefined }}>
      <div className="small">{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  )
}
