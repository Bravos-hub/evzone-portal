import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

interface TeamMemberRow {
  id: string
  name: string
  role: 'Technician' | 'Dispatcher' | 'Supervisor' | 'Manager'
  skills: string[]
  status: 'On Shift' | 'Off Duty' | 'On Job' | 'Available'
  phone: string
  email: string
  currentJob: string
}

export function OperatorTeamPage() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('All')
  const [status, setStatus] = useState('All')

  const members: TeamMemberRow[] = [
    {
      id: 'op-201',
      name: 'Aisha Nakyewa',
      role: 'Technician',
      skills: ['DC Fast', 'Type 2'],
      status: 'On Shift',
      phone: '+256 772 123456',
      email: 'aisha@evzone.com',
      currentJob: 'JOB-4312',
    },
    {
      id: 'op-202',
      name: 'Daniel Okello',
      role: 'Dispatcher',
      skills: ['Scheduling', 'CS'],
      status: 'Off Duty',
      phone: '+256 770 998877',
      email: 'daniel@evzone.com',
      currentJob: '—',
    },
    {
      id: 'op-203',
      name: 'Grace Kato',
      role: 'Technician',
      skills: ['AC L2', 'EVSE'],
      status: 'On Job',
      phone: '+256 771 889900',
      email: 'grace@evzone.com',
      currentJob: 'JOB-4321',
    },
    {
      id: 'op-204',
      name: 'Moses Ssenka',
      role: 'Supervisor',
      skills: ['QA', 'Safety'],
      status: 'On Shift',
      phone: '+256 779 223344',
      email: 'moses@evzone.com',
      currentJob: '—',
    },
  ]

  const filtered = members
    .filter((r) => (q ? (r.name + r.role + r.email + r.phone).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (role === 'All' ? true : r.role === role))
    .filter((r) => (status === 'All' ? true : r.status === status))

  return (
    <DashboardLayout pageTitle="Team & Roles">
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
            <option value="Technician">Technician</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Manager">Manager</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="All">All Status</option>
            <option value="On Shift">On Shift</option>
            <option value="Off Duty">Off Duty</option>
            <option value="On Job">On Job</option>
            <option value="Available">Available</option>
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
              <th>Skills</th>
              <th>Current</th>
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
                  <div className="text-xs text-muted">{m.phone}</div>
                </td>
                <td>{m.role}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {m.skills.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{m.currentJob}</td>
                <td>
                  <span
                    className={`pill ${
                      m.status === 'On Shift' || m.status === 'On Job'
                        ? 'approved'
                        : m.status === 'Available'
                          ? 'pending'
                          : 'sendback'
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <a href={`/operator/team/${m.id}`} className="btn secondary">
                      View
                    </a>
                    <button className="btn secondary">Assign</button>
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

