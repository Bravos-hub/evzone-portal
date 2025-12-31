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

// ... types and mock data omitted for brevity ...
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
}

const mockStations: Station[] = [
  {
    id: 'ST-001',
    name: 'Downtown Hub A',
    region: 'AFRICA',
    country: 'Uganda',
    org: 'EVzone',
    type: 'Both',
    status: 'Online',
    healthScore: 98,
    utilization: 85,
    connectors: 12,
    swapBays: 10,
    openIncidents: 0,
    lastHeartbeat: '2m ago',
    address: 'Commercial St 12, Kampala',
    gps: '0.3476, 32.5825',
  },
  {
    id: 'ST-002',
    name: 'Westside Supercharge',
    region: 'AFRICA',
    country: 'Kenya',
    org: 'Volt Mobility',
    type: 'Charge',
    status: 'Degraded',
    healthScore: 72,
    utilization: 40,
    connectors: 8,
    swapBays: 0,
    openIncidents: 1,
    lastHeartbeat: '5m ago',
    address: 'Highway Exit 4, Nairobi',
    gps: '-1.286389, 36.817223',
  },
  {
    id: 'ST-003',
    name: 'Berlin Mitte',
    region: 'EUROPE',
    country: 'Germany',
    org: 'EVzone EU',
    type: 'Charge',
    status: 'Online',
    healthScore: 99,
    utilization: 62,
    connectors: 16,
    swapBays: 0,
    openIncidents: 0,
    lastHeartbeat: '1m ago',
    address: 'Alexanderplatz, Berlin',
    gps: '52.5219, 13.4132',
  },
  {
    id: 'ST-004',
    name: 'Dubai Mall East',
    region: 'MIDDLE_EAST',
    country: 'UAE',
    org: 'Desert Power',
    type: 'Both',
    status: 'Offline',
    healthScore: 0,
    utilization: 0,
    connectors: 24,
    swapBays: 12,
    openIncidents: 3,
    lastHeartbeat: '2h ago',
    address: 'Downtown Dubai',
    gps: '25.2048, 55.2708',
  },
  {
    id: 'ST-005',
    name: 'Singapore Hub',
    region: 'ASIA',
    country: 'Singapore',
    org: 'Asia EV',
    type: 'Swap',
    status: 'Online',
    healthScore: 96,
    utilization: 75,
    connectors: 0,
    swapBays: 20,
    openIncidents: 0,
    lastHeartbeat: '4m ago',
    address: 'Orchard Rd',
    gps: '1.3521, 103.8198',
  },
]

const regions: Array<{ id: Region | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

export function Stations() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const perms = getPermissionsForFeature(user?.role, 'stations')

  const activeTab = useMemo<StationsTab>(() => {
    const path = location.pathname
    if (path.includes('/charge-points')) return 'charge-points'
    if (path.includes('/swap-stations')) return 'swap-stations'
    if (path.includes('/smart-charging')) return 'smart-charging'
    if (path.includes('/bookings')) return 'bookings'
    return 'overview'
  }, [location.pathname])

  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region | 'ALL'>('ALL')
  const [status, setStatus] = useState<StationStatus | 'All'>('All')

  const rows = useMemo(() => {
    return mockStations
      .filter(s => (region === 'ALL' ? true : s.region === region))
      .filter(s => (status === 'All' ? true : s.status === status))
      .filter(s => (q ? (s.name + ' ' + s.id + ' ' + s.country).toLowerCase().includes(q.toLowerCase()) : true))
  }, [q, region, status])

  // Available tabs based on permissions
  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: StationsTab; label: string }> = [{ id: 'overview', label: 'Overview' }]
    if (hasPermission(user?.role, 'chargePoints', 'access')) tabs.push({ id: 'charge-points', label: 'Charge Points' })
    if (hasPermission(user?.role, 'swapStations', 'access')) tabs.push({ id: 'swap-stations', label: 'Swap Stations' })
    return tabs
  }, [user?.role])

  const mapPoints = useMemo(() => {
    return rows.map(r => stationPointFromSeed({
      ...r,
      status: r.status as any
    })).filter(Boolean) as any[]
  }, [rows])

  return (
    <DashboardLayout pageTitle="Stations">
      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-2 border-b border-border-light mb-4 pb-2 overflow-x-auto scrollbar-hide">
        {availableTabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.id ? 'bg-accent text-white' : 'text-muted hover:text-text'
              }`}
            onClick={() => navigate(t.id === 'overview' ? '/stations' : `/stations/${t.id}`)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Filters - Stacked on mobile */}
          <div className="card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="input sm:col-span-2 lg:col-span-1"
              />
              <select className="select" value={region} onChange={e => setRegion(e.target.value as any)}>
                <option value="ALL">All Regions</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <select className="select" value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="All">All Status</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Degraded">Degraded</option>
              </select>
              <select className="select">
                <option>All Orgs</option>
              </select>
              <select className="select">
                <option>All Stations</option>
              </select>
              <select className="select">
                <option>Last 7d</option>
              </select>
            </div>
          </div>

          {/* Map Section */}
          <div className="card p-0 overflow-hidden">
            <div className="border-b border-border-light p-4">
              <h3 className="font-semibold">Station Map</h3>
            </div>
            <div className="p-4">
              <StationsHeatMap title="Stations Map" subtitle={`${rows.length} stations`} points={mapPoints} />
            </div>
          </div>

          {/* Table Container - Horizontal scroll */}
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-panel">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted uppercase text-[11px] font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-4"><input type="checkbox" className="rounded border-white/10 bg-white/5" /></th>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Org</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Health</th>
                  <th className="px-6 py-4">Utilization</th>
                  <th className="px-6 py-4 text-center">Incidents</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-white/10 bg-white/5" /></td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-text">{r.id}</div>
                      <div className="text-xs text-muted leading-tight">{r.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-muted font-medium">{r.region}</div>
                      <div className="text-[10px] text-muted-more uppercase">{r.country}</div>
                    </td>
                    <td className="px-6 py-4 text-muted">{r.org}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">{r.type}</span>
                    </td>
                    <td className="px-6 py-4"><StationStatusPill status={r.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className={`h-full rounded-full transition-all ${r.healthScore > 80 ? 'bg-ok' : r.healthScore > 50 ? 'bg-warn' : 'bg-danger'
                              }`}
                            style={{ width: `${r.healthScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{r.healthScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-muted font-mono">{r.utilization}%</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.openIncidents > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-danger/20 text-danger text-xs font-bold border border-danger/20">
                          {r.openIncidents}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="btn secondary sm:px-4 sm:py-2 px-3 py-1.5 text-xs sm:text-sm">Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'charge-points' && <ChargePoints />}
      {activeTab === 'swap-stations' && <SwapStations />}
    </DashboardLayout>
  )
}
