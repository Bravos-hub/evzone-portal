import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

interface WebhookLogEntry {
  time: string
  org: string
  endpointId: string
  url: string
  event: string
  statusCode: number
  durationMs: number
  retries: number
}

export function AdminWebhooksLogPage() {
  const [q, setQ] = useState('')
  const [endpoint, setEndpoint] = useState('All')
  const [event, setEvent] = useState('All')
  const [status, setStatus] = useState('All')
  const [org, setOrg] = useState('All')
  const [from, setFrom] = useState('2025-10-01')
  const [to, setTo] = useState('2025-10-29')

  const logs: WebhookLogEntry[] = [
    {
      time: '2025-10-29 11:42',
      org: 'VoltOps Ltd',
      endpointId: 'wh-1001',
      url: 'https://hooks.company.com/evzone',
      event: 'evz.session.completed',
      statusCode: 200,
      durationMs: 221,
      retries: 1,
    },
    {
      time: '2025-10-29 11:41',
      org: 'VoltOps Ltd',
      endpointId: 'wh-1001',
      url: 'https://hooks.company.com/evzone',
      event: 'evz.payment.failed',
      statusCode: 500,
      durationMs: 412,
      retries: 2,
    },
    {
      time: '2025-10-29 10:58',
      org: 'GridManaged',
      endpointId: 'wh-0999',
      url: 'https://hooks.ops.example/webhook',
      event: 'evz.swap.completed',
      statusCode: 200,
      durationMs: 180,
      retries: 1,
    },
  ]

  const rows = logs
    .filter((r) => (q ? (r.url + ' ' + r.endpointId + ' ' + r.event).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (endpoint === 'All' ? true : r.endpointId === endpoint))
    .filter((r) => (event === 'All' ? true : r.event === event))
    .filter((r) => {
      if (status === 'All') return true
      if (status === '2xx') return r.statusCode >= 200 && r.statusCode < 300
      if (status === '4xx') return r.statusCode >= 400 && r.statusCode < 500
      return r.statusCode >= 500
    })
    .filter((r) => (org === 'All' ? true : r.org === org))
    .filter((r) => {
      const date = new Date(r.time)
      return date >= new Date(from) && date <= new Date(to)
    })

  const retry = (r: WebhookLogEntry) => {
    console.log('Retry:', r.endpointId)
  }

  return (
    <DashboardLayout pageTitle="Webhooks Logs">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-7 gap-3 max-[900px]:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search endpoint / ID / event"
            className="input col-span-2"
          />
          <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="select">
            <option value="All">All Endpoints</option>
            <option value="wh-1001">wh-1001</option>
            <option value="wh-0999">wh-0999</option>
          </select>
          <select value={event} onChange={(e) => setEvent(e.target.value)} className="select">
            <option value="All">All Events</option>
            <option value="evz.session.completed">evz.session.completed</option>
            <option value="evz.swap.completed">evz.swap.completed</option>
            <option value="evz.payment.failed">evz.payment.failed</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="All">All Status</option>
            <option value="2xx">2xx</option>
            <option value="4xx">4xx</option>
            <option value="5xx">5xx</option>
          </select>
          <select value={org} onChange={(e) => setOrg(e.target.value)} className="select">
            <option value="All">All Orgs</option>
            <option value="VoltOps Ltd">VoltOps Ltd</option>
            <option value="GridManaged">GridManaged</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Logs Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Org</th>
              <th>Endpoint</th>
              <th>Event</th>
              <th>Status</th>
              <th className="text-right">ms</th>
              <th className="text-right">Retries</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.time + r.endpointId + i}>
                <td>{r.time}</td>
                <td>{r.org}</td>
                <td className="truncate max-w-[280px]" title={r.url}>
                  {r.endpointId} — {r.url}
                </td>
                <td>{r.event}</td>
                <td>
                  <span
                    className={`font-semibold ${
                      r.statusCode >= 500 ? 'text-danger' : r.statusCode >= 400 ? 'text-warn' : 'text-ok'
                    }`}
                  >
                    {r.statusCode}
                  </span>
                </td>
                <td className="text-right">{r.durationMs}</td>
                <td className="text-right">{r.retries}</td>
                <td className="text-right">
                  <button onClick={() => retry(r)} className="btn secondary">
                    Retry
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

