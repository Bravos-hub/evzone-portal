import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { getPermissionsForFeature } from '@/constants/permissions'
import { stationInScope, regionInScope } from '@/core/scope/utils'
import { useScopeStore } from '@/core/scope/scopeStore'

type OwnerSession = {
  id: string
  site: string
  city: string
  status: 'Completed' | 'Failed' | 'Pending' | 'Cancelled'
  energy: number
  amount: number
  start: string
  end?: string
  region: string
}

const mockSessions: OwnerSession[] = [
  { id: 'SES-001', site: 'Central Hub', city: 'Kampala', status: 'Completed', energy: 24.5, amount: 18.2, start: '2025-12-28 09:40', end: '2025-12-28 10:05', region: 'AFRICA' },
  { id: 'SES-002', site: 'Tech Park', city: 'Nairobi', status: 'Failed', energy: 0, amount: 0, start: '2025-12-28 09:10', region: 'AFRICA' },
  { id: 'SES-003', site: 'Berlin Mitte', city: 'Berlin', status: 'Completed', energy: 32.1, amount: 24.5, start: '2025-12-28 08:05', end: '2025-12-28 08:50', region: 'EUROPE' },
]

export function OwnerOps() {
  const { user } = useAuthStore()
  const perms = getPermissionsForFeature(user?.role, 'sessions')
  const { scope } = useScopeStore()

  const [status, setStatus] = useState<'All' | OwnerSession['status']>('All')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return mockSessions
      .filter((r) => regionInScope(scope, r.region))
      .filter((r) => (status === 'All' ? true : r.status === status))
      .filter((r) => (q ? (r.id + ' ' + r.site + ' ' + r.city).toLowerCase().includes(q.toLowerCase()) : true))
  }, [status, q, scope])

  const stats = useMemo(() => {
    const total = rows.length
    const completed = rows.filter((r) => r.status === 'Completed').length
    const failed = rows.filter((r) => r.status === 'Failed').length
    return { total, completed, failed, energy: rows.reduce((a, r) => a + r.energy, 0), revenue: rows.reduce((a, r) => a + r.amount, 0) }
  }, [rows])

  return (
    <DashboardLayout pageTitle="Owner — Sessions">
      <div className="space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card">
            <div className="text-xs text-muted">Sessions</div>
            <div className="text-xl font-bold text-text">{stats.total}</div>
          </div>
          <div className="card">
            <div className="text-xs text-muted">Completed</div>
            <div className="text-xl font-bold text-ok">{stats.completed}</div>
          </div>
          <div className="card">
            <div className="text-xs text-muted">Failed</div>
            <div className="text-xl font-bold text-danger">{stats.failed}</div>
          </div>
          <div className="card">
            <div className="text-xs text-muted">Revenue</div>
            <div className="text-xl font-bold text-text">${stats.revenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card grid md:grid-cols-4 gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search session/site" className="input md:col-span-2" />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="select">
            {['All', 'Completed', 'Failed', 'Pending', 'Cancelled'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Site</th>
                <th>Status</th>
                <th className="text-right">kWh</th>
                <th className="text-right">Amount</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.id}</td>
                  <td>
                    {r.site} • {r.city}
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        r.status === 'Completed'
                          ? 'approved'
                          : r.status === 'Failed'
                          ? 'rejected'
                          : r.status === 'Pending'
                          ? 'pending'
                          : 'bg-muted/30 text-muted'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="text-right">{r.energy.toFixed(1)}</td>
                  <td className="text-right">${r.amount.toFixed(2)}</td>
                  <td>{r.start}</td>
                  <td>{r.end || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

