import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'

interface JobRow {
  id: string
  title: string
  station: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'Open' | 'Assigned' | 'In-Progress' | 'Completed'
  due: string
  sla: string
  assigned: string
}

export function TechnicianJobsPage() {
  const [q, setQ] = useState('')
  const [priority, setPriority] = useState('All')
  const [status, setStatus] = useState('All')

  const kpis = [
    { title: 'Open jobs', value: '6' },
    { title: 'Due today', value: '2' },
    { title: 'SLA at risk', value: '1' },
    { title: 'In progress', value: '1' },
  ]

  const jobs: JobRow[] = [
    {
      id: 'JOB-4312',
      title: 'Connector 2 fault',
      station: 'CP-A1',
      priority: 'P1',
      status: 'In-Progress',
      due: '2025-10-29 14:00',
      sla: '2h remaining',
      assigned: 'Aisha N',
    },
    {
      id: 'JOB-4321',
      title: 'Station offline',
      station: 'CP-C2',
      priority: 'P0',
      status: 'Assigned',
      due: '2025-10-29 12:00',
      sla: '30m remaining',
      assigned: 'Grace K',
    },
    {
      id: 'JOB-4305',
      title: 'Preventive maintenance',
      station: 'CP-B4',
      priority: 'P3',
      status: 'Open',
      due: '2025-10-30 10:00',
      sla: '1d remaining',
      assigned: 'Unassigned',
    },
  ]

  const filtered = jobs
    .filter((j) => (q ? (j.id + ' ' + j.title + ' ' + j.station).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((j) => (priority === 'All' ? true : j.priority === priority))
    .filter((j) => (status === 'All' ? true : j.status === status))

  return (
    <DashboardLayout pageTitle="My Jobs">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2">
        {kpis.map((k) => (
          <KpiCard key={k.title} title={k.title} value={k.value} />
        ))}
      </div>

      <div style={{ height: 16 }} />

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search job / station"
            className="input col-span-2"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="select">
            <option value="All">All Priorities</option>
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Medium)</option>
            <option value="P3">P3 (Low)</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In-Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Jobs Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Title</th>
              <th>Station</th>
              <th>Priority</th>
              <th>Due</th>
              <th>SLA</th>
              <th>Assigned</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id}>
                <td className="font-semibold">
                  <a href={`/technician/org/jobs/${j.id}`} className="text-accent hover:underline">
                    {j.id}
                  </a>
                </td>
                <td>{j.title}</td>
                <td>{j.station}</td>
                <td>
                  <span
                    className={`pill ${
                      j.priority === 'P0' ? 'rejected' : j.priority === 'P1' ? 'pending' : 'sendback'
                    }`}
                  >
                    {j.priority}
                  </span>
                </td>
                <td>{j.due}</td>
                <td className="text-sm">{j.sla}</td>
                <td>{j.assigned}</td>
                <td>
                  <span
                    className={`pill ${
                      j.status === 'Completed'
                        ? 'approved'
                        : j.status === 'In-Progress'
                          ? 'pending'
                          : 'sendback'
                    }`}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    {j.status === 'Open' && (
                      <button className="btn secondary">Accept</button>
                    )}
                    {j.status === 'Assigned' && (
                      <button className="btn">Start</button>
                    )}
                    {j.status === 'In-Progress' && (
                      <button className="btn">Complete</button>
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

