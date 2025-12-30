import { useState, useMemo } from 'react'
import { useAuthStore } from '@/core/auth/authStore'
import { hasPermission } from '@/constants/permissions'

/* ─────────────────────────────────────────────────────────────────────────────
   Station Map — Owner/Operator station map view
   RBAC: Owners, Operators, Site Owners
───────────────────────────────────────────────────────────────────────────── */

type StationStatus = 'Active' | 'Paused' | 'Offline' | 'Maintenance'

interface Station {
  id: string
  name: string
  city: string
  status: StationStatus
  kW: number
  connector: string
  address: string
  lat?: number
  lng?: number
}

const MOCK_STATIONS: Station[] = [
  { id: 'st-101', name: 'City Mall Roof', city: 'Kampala', status: 'Active', kW: 250, connector: 'CCS2', address: 'Plot 7 Jinja Rd' },
  { id: 'st-102', name: 'Tech Park A', city: 'Entebbe', status: 'Paused', kW: 150, connector: 'Type 2', address: 'Block 4' },
  { id: 'st-103', name: 'Airport East', city: 'Kampala', status: 'Active', kW: 300, connector: 'CCS2', address: 'Terminal C' },
  { id: 'st-104', name: 'Central Hub', city: 'Kampala', status: 'Active', kW: 200, connector: 'CHAdeMO', address: 'Industrial Area' },
  { id: 'st-105', name: 'Business Park', city: 'Wuxi', status: 'Maintenance', kW: 180, connector: 'CCS2', address: 'Building 5' },
]

export function StationMap() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'OWNER'
  const canView = hasPermission(role, 'stations', 'view')

  const [q, setQ] = useState('')
  const [city, setCity] = useState('All')
  const [status, setStatus] = useState('All')
  const [connector, setConnector] = useState('All')
  const [selectedStation, setSelectedStation] = useState<string | null>(null)

  const filtered = useMemo(() =>
    MOCK_STATIONS
      .filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.address.toLowerCase().includes(q.toLowerCase()))
      .filter(s => city === 'All' || s.city === city)
      .filter(s => status === 'All' || s.status === status)
      .filter(s => connector === 'All' || s.connector === connector)
  , [q, city, status, connector])

  if (!canView) {
    return <div className="p-8 text-center text-subtle">No permission to view Station Map.</div>
  }

  return (
    <div className="space-y-4">
      {/* Map Layout */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        {/* Sidebar Filters & Results */}
        <aside className="bg-surface rounded-xl border border-border p-4 h-fit lg:sticky lg:top-6 space-y-4">
          <h2 className="font-semibold text-lg">Stations</h2>

          {/* Search */}
          <label className="relative block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.6-3.6" /></svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search sites or address"
              className="input pl-9"
            />
          </label>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <select value={city} onChange={e => setCity(e.target.value)} className="select text-sm">
              {['All', 'Kampala', 'Entebbe', 'Wuxi'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="select text-sm">
              {['All', 'Active', 'Paused', 'Offline', 'Maintenance'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={connector} onChange={e => setConnector(e.target.value)} className="col-span-2 select text-sm">
              {['All', 'CCS2', 'Type 2', 'CHAdeMO'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-subtle">
            {filtered.length} station{filtered.length !== 1 ? 's' : ''} found
          </div>

          {/* Station List */}
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.map(s => (
              <li
                key={s.id}
                onClick={() => setSelectedStation(s.id)}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedStation === s.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{s.name}</div>
                  <StatusPill status={s.status} />
                </div>
                <div className="text-xs text-subtle flex items-center gap-1 mb-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z" /><circle cx="12" cy="10" r="3" /></svg>
                  {s.address} — {s.city}
                </div>
                <div className="text-xs text-subtle">
                  {s.kW} kW • {s.connector}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to station detail
                    }}
                    className="text-xs text-accent hover:underline"
                  >
                    Open
                  </button>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-subtle hover:text-accent"
                  >
                    Navigate
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Map Panel */}
        <section className="bg-surface rounded-xl border border-border p-3 min-h-[60vh] relative">
          <div className="h-full w-full rounded-lg bg-muted border border-border grid place-items-center text-subtle">
            <div className="text-center space-y-2">
              <svg className="w-16 h-16 mx-auto text-subtle" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 3l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" /><path d="M9 3v14M15 5v14" /></svg>
              <div className="text-sm font-medium">Station Map</div>
              <div className="text-xs">Map integration placeholder</div>
              <div className="text-xs text-subtle mt-4">
                {filtered.length} station{filtered.length !== 1 ? 's' : ''} shown
              </div>
            </div>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-muted text-sm">
              QR Poster
            </button>
            <a href="/dashboard" className="px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover text-sm">
              Open Dashboard
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: StationStatus }) {
  const colors: Record<StationStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Paused: 'bg-amber-100 text-amber-700',
    Offline: 'bg-gray-100 text-gray-600',
    Maintenance: 'bg-blue-100 text-blue-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status]}`}>{status}</span>
}

export default StationMap

