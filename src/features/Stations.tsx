import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { hasPermission, getPermissionsForFeature } from '@/constants/permissions'
import { StationStatusPill, type StationStatus } from '@/ui/components/StationStatusPill'
import { StationsHeatMap, stationPointFromSeed } from '@/ui/components/StationsHeatMap'
import { ChargePoints } from './ChargePoints'
import { SwapStations } from './SwapStations'
import { SmartCharging } from './SmartCharging'
import { Bookings } from './Bookings'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type StationType = 'Charge' | 'Swap' | 'Both'
type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST'
type StationsTab = 'overview' | 'charge-points' | 'swap-stations' | 'smart-charging' | 'bookings'

type Station = {
  id: string
  name: string
  region: Region
  country: string
  org: string
  type: StationType
  status: StationStatus
  healthScore: number
  utilization: number
  connectors: number
  swapBays: number
  openIncidents: number
  lastHeartbeat: string
  address: string
  gps: string
  make?: string
  model?: string
  maxKw?: number
}

type DrawerTab = 'overview' | 'assets' | 'incidents' | 'config'

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

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

const mockStations: Station[] = [
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
    make: 'ABB',
    model: 'Terra 54',
    maxKw: 60,
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
    make: 'Delta',
    model: 'DC Wall 25',
    maxKw: 50,
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
    make: 'Huawei',
    model: 'FusionCharge',
    maxKw: 120,
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
    make: 'Siemens',
    model: 'VersiCharge',
    maxKw: 150,
  },
]

async function apiList(): Promise<Station[]> {
  await new Promise((r) => setTimeout(r, 160))
  return mockStations
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Stations Page - Unified for all roles with tabs
 * 
 * Tabs:
 * - Overview: Station list and map
 * - Charge Points: Charge point management
 * - Swap Stations: Swap station management
 * - Smart Charging: Load management
 * - Bookings: Booking management
 */
export function Stations() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const perms = getPermissionsForFeature(user?.role, 'stations')
  
  // Determine active tab from URL
  const activeTab = useMemo<StationsTab>(() => {
    const path = location.pathname
    if (path.includes('/charge-points')) return 'charge-points'
    if (path.includes('/swap-stations')) return 'swap-stations'
    if (path.includes('/smart-charging')) return 'smart-charging'
    if (path.includes('/bookings')) return 'bookings'
    return 'overview'
  }, [location.pathname])

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
      // Filter by ownership if user can't view all
      if (!perms.viewAll && user?.id) {
        // In real app, filter by user's organization
        setRows(data)
      } else {
        setRows(data)
      }
    })()
  }, [perms.viewAll, user?.id])

  const orgs = useMemo(() => {
    const set = new Set(rows.map((r) => r.org))
    return ['ALL', ...Array.from(set)]
  }, [rows])

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => (q ? (r.id + ' ' + r.name + ' ' + r.org + ' ' + r.address).toLowerCase().includes(q.toLowerCase()) : true))
        .filter((r) => (region === 'ALL' ? true : r.region === region))
        .filter((r) => (type === 'All' ? true : r.type === type))
        .filter((r) => (status === 'All' ? true : r.status === status))
        .filter((r) => (org === 'ALL' ? true : r.org === org)),
    [rows, q, region, type, status, org]
  )

  const summary = useMemo(() => {
    const total = filtered.length
    const online = filtered.filter((r) => r.status === 'Online').length
    const degraded = filtered.filter((r) => r.status === 'Degraded').length
    const offline = filtered.filter((r) => r.status === 'Offline').length
    const maint = filtered.filter((r) => r.status === 'Maintenance').length
    return { total, online, degraded, offline, maint }
  }, [filtered])

  const mapPoints = useMemo(
    () =>
      filtered
        .map((s) =>
          stationPointFromSeed({
            id: s.id,
            name: s.name,
            region: s.region,
            org: s.org,
            status: s.status,
            healthScore: s.healthScore,
            openIncidents: s.openIncidents,
            lastHeartbeat: s.lastHeartbeat,
            gps: s.gps,
          })
        )
        .filter((p): p is NonNullable<typeof p> => p !== null),
    [filtered]
  )

  const allSel = filtered.length > 0 && filtered.every((r) => sel[r.id])
  const someSel = filtered.some((r) => sel[r.id])

  const openRow = rows.find((r) => r.id === openId) || null

  function toggleAll() {
    const next: Record<string, boolean> = {}
    const val = !allSel
    filtered.forEach((r) => (next[r.id] = val))
    setSel(next)
  }

  function toggle(id: string) {
    setSel((s) => ({ ...s, [id]: !s[id] }))
  }

  async function bulkAction(action: string) {
    setBusy(true)
    const ids = filtered.filter((r) => sel[r.id]).map((r) => r.id)
    await new Promise((r) => setTimeout(r, 400))
    alert(`${action}: ${ids.join(', ')} (demo)`)
    setBusy(false)
  }

  function handleTabChange(tab: StationsTab) {
    if (tab === 'overview') {
      navigate('/stations')
    } else {
      navigate(`/stations/${tab}`)
    }
  }

  // Available tabs based on permissions
  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: StationsTab; label: string }> = [
      { id: 'overview', label: 'Overview' },
    ]
    
    if (hasPermission(user?.role, 'chargePoints', 'access')) {
      tabs.push({ id: 'charge-points', label: 'Charge Points' })
    }
    if (hasPermission(user?.role, 'swapStations', 'access')) {
      tabs.push({ id: 'swap-stations', label: 'Swap Stations' })
    }
    if (hasPermission(user?.role, 'smartCharging', 'access')) {
      tabs.push({ id: 'smart-charging', label: 'Smart Charging' })
    }
    if (hasPermission(user?.role, 'bookings', 'access')) {
      tabs.push({ id: 'bookings', label: 'Bookings' })
    }
    
    return tabs
  }, [user?.role])

  return (
    <DashboardLayout pageTitle="Stations">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-light mb-4 pb-2">
        {availableTabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-accent text-white'
                : 'text-muted hover:text-text hover:bg-white/5'
            }`}
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="grid grid-cols-6 gap-3 xl:grid-cols-3 lg:grid-cols-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, name, org, address"
                className="input col-span-2 xl:col-span-1"
              />
              {perms.viewAll && (
                <select value={region} onChange={(e) => setRegion(e.target.value as Region | 'ALL')} className="select">
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              )}
              <select value={type} onChange={(e) => setType(e.target.value as StationType | 'All')} className="select">
                {types.map((t) => (
                  <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                ))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value as StationStatus | 'All')} className="select">
                {stati.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
                ))}
              </select>
              {perms.viewAll && (
                <select value={org} onChange={(e) => setOrg(e.target.value)} className="select">
                  {orgs.map((o) => (
                    <option key={o} value={o}>{o === 'ALL' ? 'All Orgs' : o}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="h-4" />

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="chip">Total: {summary.total}</span>
            <span className="chip bg-ok/20 text-ok">Online: {summary.online}</span>
            <span className="chip bg-warn/20 text-warn">Degraded: {summary.degraded}</span>
            <span className="chip bg-danger/20 text-danger">Offline: {summary.offline}</span>
            <span className="chip bg-muted/20 text-muted">Maintenance: {summary.maint}</span>
          </div>

          {/* Action buttons (role-controlled) */}
          {(perms.create || perms.remoteCommands) && (
            <div className="flex items-center gap-2 mb-4">
              {perms.create && (
                <button className="btn secondary" onClick={() => navigate('/add-charger')}>
                  + Add Station
                </button>
              )}
              {someSel && perms.remoteCommands && (
                <>
                  <button className="btn secondary" onClick={() => bulkAction('Reboot')} disabled={busy}>
                    Reboot Selected
                  </button>
                  <button className="btn secondary" onClick={() => bulkAction('Ping')} disabled={busy}>
                    Ping Selected
                  </button>
                </>
              )}
              {someSel && perms.delete && (
                <button className="btn danger" onClick={() => bulkAction('Delete')} disabled={busy}>
                  Delete Selected
                </button>
              )}
            </div>
          )}

          {/* Map (only for users who can view all) */}
          {perms.viewAll && (
            <>
              <div className="card mb-4">
                <div className="text-sm font-semibold text-text mb-2">Station Map</div>
                <StationsHeatMap title="Stations Map" subtitle={`${mapPoints.length} stations`} points={mapPoints} />
              </div>
            </>
          )}

          {/* Stations Table */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {(perms.edit || perms.delete) && (
                    <th className="w-8">
                      <input type="checkbox" className="h-4 w-4" checked={allSel} onChange={toggleAll} />
                    </th>
                  )}
                  <th>Station</th>
                  {perms.viewAll && <th>Region</th>}
                  <th>Org</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Utilization</th>
                  <th>Incidents</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    {(perms.edit || perms.delete) && (
                      <td>
                        <input type="checkbox" className="h-4 w-4" checked={!!sel[r.id]} onChange={() => toggle(r.id)} />
                      </td>
                    )}
                    <td>
                      <button className="font-semibold text-text hover:underline" onClick={() => setOpenId(r.id)}>
                        {r.id}
                      </button>
                      <div className="text-xs text-muted">{r.name}</div>
                    </td>
                    {perms.viewAll && (
                      <td>
                        {r.region} <span className="text-muted">• {r.country}</span>
                      </td>
                    )}
                    <td>{r.org}</td>
                    <td>{r.type}</td>
                    <td>
                      <StationStatusPill status={r.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.healthScore}%`,
                              background: r.healthScore > 80 ? '#03cd8c' : r.healthScore > 50 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-xs">{r.healthScore}%</span>
                      </div>
                    </td>
                    <td>{r.utilization}%</td>
                    <td>
                      {r.openIncidents > 0 ? (
                        <span className="pill rejected">{r.openIncidents}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn secondary" onClick={() => setOpenId(r.id)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Station Detail Drawer */}
          {openRow && (
            <StationDrawer
              station={openRow}
              tab={tab}
              setTab={setTab}
              onClose={() => setOpenId(null)}
              perms={perms}
            />
          )}
        </>
      )}

      {activeTab === 'charge-points' && <ChargePointsContent />}
      {activeTab === 'swap-stations' && <SwapStationsContent />}
      {activeTab === 'smart-charging' && <SmartChargingContent />}
      {activeTab === 'bookings' && <BookingsContent />}
    </DashboardLayout>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENTS (without DashboardLayout wrapper)
// ═══════════════════════════════════════════════════════════════════════════

function ChargePointsContent() {
  return <ChargePoints />
}

function SwapStationsContent() {
  return <SwapStations />
}

function SmartChargingContent() {
  return <SmartCharging />
}

function BookingsContent() {
  return <Bookings />
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAWER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function StationDrawer({
  station,
  tab,
  setTab,
  onClose,
  perms,
}: {
  station: Station
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  onClose: () => void
  perms: Record<string, boolean>
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-xl bg-panel border-l border-border-light shadow-xl p-5 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text">{station.name}</h3>
            <div className="text-sm text-muted">{station.id} • {station.org}</div>
          </div>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border-light pb-2">
          {(['overview', 'assets', 'incidents', 'config'] as DrawerTab[]).map((t) => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === t ? 'bg-accent text-white' : 'text-muted hover:text-text'}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="panel">
                <div className="text-xs text-muted">Status</div>
                <StationStatusPill status={station.status} />
              </div>
              <div className="panel">
                <div className="text-xs text-muted">Type</div>
                <div className="font-semibold">{station.type}</div>
              </div>
              <div className="panel">
                <div className="text-xs text-muted">Health Score</div>
                <div className="font-semibold">{station.healthScore}%</div>
              </div>
              <div className="panel">
                <div className="text-xs text-muted">Utilization</div>
                <div className="font-semibold">{station.utilization}%</div>
              </div>
            </div>
            <div className="panel">
              <div className="text-xs text-muted mb-1">Address</div>
              <div className="text-sm">{station.address}</div>
              <div className="text-xs text-muted mt-1">GPS: {station.gps}</div>
            </div>
            <div className="panel">
              <div className="text-xs text-muted mb-1">Last Heartbeat</div>
              <div className="text-sm">{station.lastHeartbeat}</div>
            </div>
            {station.make && (
              <div className="panel">
                <div className="text-xs text-muted mb-1">Hardware</div>
                <div className="text-sm">{station.make} {station.model} • {station.maxKw ?? 0} kW</div>
              </div>
            )}
          </div>
        )}

        {tab === 'assets' && (
          <div className="grid gap-4">
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Connectors</div>
              <div className="text-2xl font-bold text-text">{station.connectors}</div>
            </div>
            {station.swapBays > 0 && (
              <div className="panel">
                <div className="text-sm font-semibold text-text mb-2">Swap Bays</div>
                <div className="text-2xl font-bold text-text">{station.swapBays}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'incidents' && (
          <div className="panel">
            <div className="text-sm font-semibold text-text mb-2">Open Incidents</div>
            <div className="text-2xl font-bold text-danger">{station.openIncidents}</div>
            <div className="text-xs text-muted mt-2">Click to view incident details</div>
          </div>
        )}

        {tab === 'config' && perms.edit && (
          <div className="grid gap-4">
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Remote Commands</div>
              <div className="flex gap-2">
                <button className="btn secondary">Reboot</button>
                <button className="btn secondary">Ping</button>
                <button className="btn secondary">Reset</button>
              </div>
            </div>
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Configuration</div>
              <button className="btn secondary">Edit Settings</button>
            </div>
          </div>
        )}

        {tab === 'config' && !perms.edit && (
          <div className="panel text-muted text-sm">
            You don't have permission to configure this station.
          </div>
        )}
      </div>
    </div>
  )
}
