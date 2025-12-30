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

  const [rows, setRows] = useState<Station[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region | 'ALL'>('ALL')
  const [type, setType] = useState<StationType | 'All'>('All')
  const [status, setStatus] = useState<StationStatus | 'All'>('All')
  const [org, setOrg] = useState<string>('ALL')

  // Available tabs based on permissions
  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: StationsTab; label: string }> = [{ id: 'overview', label: 'Overview' }]
    if (hasPermission(user?.role, 'chargePoints', 'access')) tabs.push({ id: 'charge-points', label: 'Charge Points' })
    if (hasPermission(user?.role, 'swapStations', 'access')) tabs.push({ id: 'swap-stations', label: 'Swap Stations' })
    return tabs
  }, [user?.role])

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
              </select>
            </div>
          </div>

          {/* Table Container - Horizontal scroll */}
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-panel">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted uppercase text-[11px] font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4 hidden md:table-cell">Region</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text">{r.id}</div>
                      <div className="text-xs text-muted">{r.name}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted">{r.region}</td>
                    <td className="px-6 py-4"><StationStatusPill status={r.status} /></td>
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
