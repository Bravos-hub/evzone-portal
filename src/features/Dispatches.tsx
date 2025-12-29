import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { getPermissionsForFeature } from '@/constants/permissions'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type DispatchStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled'
type Priority = 'Critical' | 'High' | 'Normal' | 'Low'

type Dispatch = {
  id: string
  title: string
  status: DispatchStatus
  priority: Priority
  stationId: string
  stationName: string
  assignee: string
  createdAt: string
  dueAt: string
  incidentId?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockDispatches: Dispatch[] = [
  {
    id: 'DSP-001',
    title: 'Connector replacement - Bay 3',
    status: 'Assigned',
    priority: 'High',
    stationId: 'ST-0001',
    stationName: 'Kampala CBD Hub',
    assignee: 'Allan Tech',
    createdAt: '2024-12-24 08:00',
    dueAt: '2024-12-24 14:00',
    incidentId: 'INC-2392',
  },
  {
    id: 'DSP-002',
    title: 'Firmware update - All chargers',
    status: 'Pending',
    priority: 'Normal',
    stationId: 'ST-0002',
    stationName: 'Entebbe Airport Lot',
    assignee: 'Unassigned',
    createdAt: '2024-12-23 16:00',
    dueAt: '2024-12-26 18:00',
  },
  {
    id: 'DSP-003',
    title: 'Swap bay door repair',
    status: 'In Progress',
    priority: 'Critical',
    stationId: 'ST-0017',
    stationName: 'Gulu Main Street',
    assignee: 'Tech Team B',
    createdAt: '2024-12-22 10:00',
    dueAt: '2024-12-24 12:00',
    incidentId: 'INC-2384',
  },
  {
    id: 'DSP-004',
    title: 'Preventive maintenance check',
    status: 'Completed',
    priority: 'Low',
    stationId: 'ST-1011',
    stationName: 'Berlin Mitte Garage',
    assignee: 'Local Contractor',
    createdAt: '2024-12-20 09:00',
    dueAt: '2024-12-20 17:00',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dispatches Page - Unified for all roles
 * 
 * RBAC Controls:
 * - viewAll: ADMIN, OPERATOR see all dispatches
 * - create: ADMIN, OPERATOR can create
 * - assign: ADMIN, OPERATOR can assign
 * - accept/complete: TECHNICIANS can accept and complete
 */
export function Dispatches() {
  const { user } = useAuthStore()
  const perms = getPermissionsForFeature(user?.role, 'dispatches')

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<DispatchStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')

  const filtered = useMemo(() => {
    return mockDispatches
      .filter((r) => (q ? (r.id + ' ' + r.title + ' ' + r.stationName).toLowerCase().includes(q.toLowerCase()) : true))
      .filter((r) => (status === 'All' ? true : r.status === status))
      .filter((r) => (priority === 'All' ? true : r.priority === priority))
  }, [q, status, priority])

  const stats = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter((r) => r.status === 'Pending').length,
    inProgress: filtered.filter((r) => r.status === 'In Progress').length,
    completed: filtered.filter((r) => r.status === 'Completed').length,
  }), [filtered])

  function statusColor(s: DispatchStatus) {
    switch (s) {
      case 'Pending': return 'pending'
      case 'Assigned': return 'sendback'
      case 'In Progress': return 'bg-accent/20 text-accent'
      case 'Completed': return 'approved'
      case 'Cancelled': return 'rejected'
    }
  }

  function priorityColor(p: Priority) {
    switch (p) {
      case 'Critical': return 'bg-danger text-white'
      case 'High': return 'bg-warn text-white'
      case 'Normal': return 'bg-muted/30 text-muted'
      case 'Low': return 'bg-muted/20 text-muted'
    }
  }

  return (
    <DashboardLayout pageTitle="Dispatches">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 xl:grid-cols-2">
        <div className="card">
          <div className="text-xs text-muted">Total</div>
          <div className="text-xl font-bold text-text">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted">Pending</div>
          <div className="text-xl font-bold text-warn">{stats.pending}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted">In Progress</div>
          <div className="text-xl font-bold text-accent">{stats.inProgress}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted">Completed</div>
          <div className="text-xl font-bold text-ok">{stats.completed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="grid grid-cols-4 gap-3 xl:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dispatches"
            className="input col-span-2 xl:col-span-1"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as DispatchStatus | 'All')} className="select">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | 'All')} className="select">
            <option value="All">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      {perms.create && (
        <div className="flex items-center gap-2 mb-4">
          <button className="btn secondary" onClick={() => alert('Create dispatch (demo)')}>
            + New Dispatch
          </button>
        </div>
      )}

      {/* Dispatches Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Dispatch</th>
              <th>Priority</th>
              <th>Station</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Due</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="font-semibold text-text">{r.id}</div>
                  <div className="text-xs text-muted">{r.title}</div>
                </td>
                <td>
                  <span className={`pill ${priorityColor(r.priority)}`}>{r.priority}</span>
                </td>
                <td>
                  <div>{r.stationName}</div>
                  <div className="text-xs text-muted">{r.stationId}</div>
                </td>
                <td>{r.assignee}</td>
                <td>
                  <span className={`pill ${statusColor(r.status)}`}>{r.status}</span>
                </td>
                <td className="text-sm">{r.dueAt}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="btn secondary" onClick={() => alert(`View ${r.id} (demo)`)}>
                      View
                    </button>
                    {perms.assign && r.status === 'Pending' && (
                      <button className="btn secondary" onClick={() => alert(`Assign ${r.id} (demo)`)}>
                        Assign
                      </button>
                    )}
                    {perms.accept && r.status === 'Assigned' && (
                      <button className="btn secondary" onClick={() => alert(`Accept ${r.id} (demo)`)}>
                        Accept
                      </button>
                    )}
                    {perms.complete && r.status === 'In Progress' && (
                      <button className="btn" style={{ background: '#03cd8c', color: 'white' }} onClick={() => alert(`Complete ${r.id} (demo)`)}>
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

