import { useState, useMemo } from 'react'
import { useAuthStore } from '@/core/auth/authStore'
import { hasPermission } from '@/constants/permissions'

/* ─────────────────────────────────────────────────────────────────────────────
   Parking — Site Owner parking bay management
   RBAC: Site Owners, Platform admins
───────────────────────────────────────────────────────────────────────────── */

type ParkingStatus = 'Active' | 'Maintenance' | 'Reserved' | 'Inactive'

interface ParkingBay {
  id: string
  site: string
  bay: string
  type: 'EV Charging' | 'Regular' | 'Handicap' | 'VIP'
  status: ParkingStatus
  charger?: string
  rate: number
  occupancy: number
  lastUsed: string
}

const MOCK_BAYS: ParkingBay[] = [
  { id: 'PK-001', site: 'City Mall Roof', bay: 'A-01', type: 'EV Charging', status: 'Active', charger: 'CP-A1', rate: 2.50, occupancy: 78, lastUsed: '2025-10-29 10:15' },
  { id: 'PK-002', site: 'City Mall Roof', bay: 'A-02', type: 'EV Charging', status: 'Active', charger: 'CP-A2', rate: 2.50, occupancy: 65, lastUsed: '2025-10-29 09:42' },
  { id: 'PK-003', site: 'City Mall Roof', bay: 'B-01', type: 'Regular', status: 'Active', rate: 1.00, occupancy: 82, lastUsed: '2025-10-29 11:05' },
  { id: 'PK-004', site: 'Business Park A', bay: 'C-01', type: 'EV Charging', status: 'Maintenance', charger: 'CP-C1', rate: 3.00, occupancy: 0, lastUsed: '2025-10-28 18:30' },
  { id: 'PK-005', site: 'Business Park A', bay: 'C-02', type: 'Handicap', status: 'Reserved', rate: 0.00, occupancy: 45, lastUsed: '2025-10-29 08:15' },
  { id: 'PK-006', site: 'Airport Long-Stay', bay: 'D-01', type: 'VIP', status: 'Active', rate: 5.00, occupancy: 55, lastUsed: '2025-10-29 07:00' },
]

export function Parking() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'SITE_OWNER'
  const canView = hasPermission(role, 'sites', 'view')
  const canEdit = hasPermission(role, 'sites', 'edit')

  const [site, setSite] = useState('All')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [q, setQ] = useState('')
  const [ack, setAck] = useState('')

  const toast = (m: string) => { setAck(m); setTimeout(() => setAck(''), 2000) }

  const filtered = useMemo(() =>
    MOCK_BAYS
      .filter(r => site === 'All' || r.site === site)
      .filter(r => type === 'All' || r.type === type)
      .filter(r => status === 'All' || r.status === status)
      .filter(r => !q || (r.id + ' ' + r.bay + ' ' + r.site).toLowerCase().includes(q.toLowerCase()))
  , [site, type, status, q])

  const kpis = useMemo(() => ({
    total: filtered.length,
    active: filtered.filter(b => b.status === 'Active').length,
    evBays: filtered.filter(b => b.type === 'EV Charging').length,
    avgOccupancy: Math.round(filtered.reduce((sum, b) => sum + b.occupancy, 0) / (filtered.length || 1)),
  }), [filtered])

  if (!canView) {
    return <div className="p-8 text-center text-subtle">No permission to view Parking.</div>
  }

  return (
    <div className="space-y-6">
      {ack && <div className="rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm">{ack}</div>}

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
          <div className="text-sm text-subtle">Total Bays</div>
          <div className="mt-2 text-2xl font-bold">{kpis.total}</div>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
          <div className="text-sm text-subtle">Active</div>
          <div className="mt-2 text-2xl font-bold">{kpis.active}</div>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
          <div className="text-sm text-subtle">EV Charging Bays</div>
          <div className="mt-2 text-2xl font-bold">{kpis.evBays}</div>
        </div>
        <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
          <div className="text-sm text-subtle">Avg Occupancy</div>
          <div className="mt-2 text-2xl font-bold">{kpis.avgOccupancy}%</div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-surface rounded-xl border border-border p-4 grid md:grid-cols-5 gap-3">
        <label className="relative md:col-span-2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.6-3.6" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search bay / site" className="w-full rounded-lg border border-border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
        </label>
        <select value={site} onChange={e => setSite(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2">
          {['All', 'City Mall Roof', 'Business Park A', 'Airport Long-Stay'].map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2">
          {['All', 'EV Charging', 'Regular', 'Handicap', 'VIP'].map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2">
          {['All', 'Active', 'Maintenance', 'Reserved', 'Inactive'].map(o => <option key={o}>{o}</option>)}
        </select>
      </section>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-3">
          <button onClick={() => toast('Create Parking Bay modal would open')} className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover">
            + Add Bay
          </button>
        </div>
      )}

      {/* Table */}
      <section className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-subtle">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Site</th>
              <th className="px-4 py-3 text-left font-medium">Bay</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Charger</th>
              <th className="px-4 py-3 text-right font-medium">Rate/hr</th>
              <th className="px-4 py-3 text-right font-medium">Occupancy</th>
              <th className="px-4 py-3 text-left font-medium">Last Used</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              {canEdit && <th className="px-4 py-3 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{r.id}</td>
                <td className="px-4 py-3">{r.site}</td>
                <td className="px-4 py-3">{r.bay}</td>
                <td className="px-4 py-3"><TypePill type={r.type} /></td>
                <td className="px-4 py-3 text-subtle">{r.charger || '—'}</td>
                <td className="px-4 py-3 text-right">${r.rate.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{r.occupancy}%</td>
                <td className="px-4 py-3 text-subtle">{r.lastUsed}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => toast(`Editing ${r.id}`)} className="px-2 py-1 rounded border border-border hover:bg-muted text-xs">Edit</button>
                      {r.status === 'Active' && (
                        <button onClick={() => toast(`Set ${r.id} to maintenance`)} className="px-2 py-1 rounded border border-border hover:bg-muted text-xs">Maintenance</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-subtle">No parking bays match your filters.</div>}
      </section>
    </div>
  )
}

function TypePill({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'EV Charging': 'bg-emerald-100 text-emerald-700',
    'Regular': 'bg-gray-100 text-gray-600',
    'Handicap': 'bg-blue-100 text-blue-700',
    'VIP': 'bg-amber-100 text-amber-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>
}

function StatusPill({ status }: { status: ParkingStatus }) {
  const colors: Record<ParkingStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Maintenance: 'bg-amber-100 text-amber-700',
    Reserved: 'bg-blue-100 text-blue-700',
    Inactive: 'bg-gray-100 text-gray-600',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${colors[status]}`}>{status}</span>
}

export default Parking

