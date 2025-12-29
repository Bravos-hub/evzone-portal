import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { getPermissionsForFeature } from '@/constants/permissions'

/**
 * Sites Page - Site Owner feature
 */
export function Sites() {
  const { user } = useAuthStore()
  const perms = getPermissionsForFeature(user?.role, 'sites')

  const mockSites = [
    { id: 'SITE-001', name: 'City Mall Rooftop', address: 'Kampala Road, Kampala', stations: 3, revenue: 4520, status: 'Active' },
    { id: 'SITE-002', name: 'Tech Park Lot', address: 'Innovation Dr, Kampala', stations: 2, revenue: 2890, status: 'Active' },
    { id: 'SITE-003', name: 'Airport Terminal', address: 'Entebbe Airport', stations: 5, revenue: 8450, status: 'Pending' },
  ]

  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return mockSites.filter((s) => (q ? (s.name + ' ' + s.address).toLowerCase().includes(q.toLowerCase()) : true))
  }, [q])

  return (
    <DashboardLayout pageTitle="My Sites">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card">
          <div className="text-xs text-muted">Total Sites</div>
          <div className="text-xl font-bold text-text">{mockSites.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted">Stations Hosted</div>
          <div className="text-xl font-bold text-accent">{mockSites.reduce((a, s) => a + s.stations, 0)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted">This Month Revenue</div>
          <div className="text-xl font-bold text-ok">${mockSites.reduce((a, s) => a + s.revenue, 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sites" className="input flex-1" />
          {perms.create && (
            <button className="btn secondary" onClick={() => alert('Add site (demo)')}>+ Add Site</button>
          )}
        </div>
      </div>

      {/* Sites Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Address</th>
              <th>Stations</th>
              <th>Monthly Revenue</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="font-semibold text-text">{s.name}</td>
                <td className="text-muted">{s.address}</td>
                <td>{s.stations}</td>
                <td className="font-semibold">${s.revenue.toLocaleString()}</td>
                <td><span className={`pill ${s.status === 'Active' ? 'approved' : 'pending'}`}>{s.status}</span></td>
                <td className="text-right">
                  <button className="btn secondary" onClick={() => alert(`View ${s.id} (demo)`)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

