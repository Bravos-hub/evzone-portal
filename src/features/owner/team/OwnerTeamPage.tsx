import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

interface TeamMember {
  id: string
  name: string
  role: 'Manager' | 'Attendant' | 'Technician'
  assignedStations: string[]
  status: 'Active' | 'On Shift' | 'Off Duty'
  email: string
}

export function OwnerTeamPage() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('All')
  const [status, setStatus] = useState('All')

  const members: TeamMember[] = [
    {
      id: 'tm-001',
      name: 'Charles M',
      role: 'Manager',
      assignedStations: ['Central Hub'],
      status: 'Active',
      email: 'charles@evowner.com',
    },
    {
      id: 'tm-002',
      name: 'Esther K',
      role: 'Attendant',
      assignedStations: ['Central Hub'],
      status: 'On Shift',
      email: 'esther@evowner.com',
    },
    {
      id: 'tm-003',
      name: 'Kevin O',
      role: 'Technician',
      assignedStations: ['Bay Area Charging'],
      status: 'Active',
      email: 'kevin@evowner.com',
    },
  ]

  const filtered = members
    .filter((r) => (q ? (r.name + r.role + r.email).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (role === 'All' ? true : r.role === role))
    .filter((r) => (status === 'All' ? true : r.status === status))

  return (
    <DashboardLayout pageTitle="My Team">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search team members"
            className="input col-span-2"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="select">
            <option value="All">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Attendant">Attendant</option>
            <option value="Technician">Technician</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="On Shift">On Shift</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
        <div className="mt-3">
          <button className="btn">+ Invite Member</button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Team Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Assigned Stations</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted">{m.email}</div>
                </td>
                <td>{m.role}</td>
                <td>
                  {m.assignedStations.map((s) => (
                    <span key={s} className="chip mr-1">
                      {s}
                    </span>
                  ))}
                </td>
                <td>
                  <span className={`pill ${m.status === 'On Shift' ? 'approved' : 'sendback'}`}>{m.status}</span>
                </td>
                <td className="text-right">
                  <button className="btn secondary">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

