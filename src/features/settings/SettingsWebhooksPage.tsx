import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'Active' | 'Paused'
  lastDelivery: string
}

interface WebhookDelivery {
  time: string
  endpointId: string
  event: string
  statusCode: string
  durationMs: number
}

export function SettingsWebhooksPage() {
  const [ack, setAck] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [event, setEvent] = useState('All')
  const [from, setFrom] = useState('2025-10-01')
  const [to, setTo] = useState('2025-10-29')
  const [signing, setSigning] = useState({
    enabled: true,
    version: 'v1',
    secret: 'whsec_********9f3a',
  })

  const toast = (m: string) => {
    setAck(m)
    setTimeout(() => setAck(''), 1400)
  }

  const endpoints: WebhookEndpoint[] = [
    {
      id: 'wh-1001',
      url: 'https://hooks.company.com/evzone',
      events: ['evz.session.completed', 'evz.payment.failed'],
      status: 'Active',
      lastDelivery: '2025-10-29 11:42',
    },
    {
      id: 'wh-0999',
      url: 'https://hooks.ops.example/webhook',
      events: ['evz.swap.completed'],
      status: 'Paused',
      lastDelivery: '2025-10-28 08:15',
    },
  ]

  const filteredEndpoints = endpoints
    .filter((e) => (q ? (e.url + ' ' + e.id).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((e) => (status === 'All' ? true : e.status === status))
    .filter((e) => (event === 'All' ? true : e.events.includes(event)))

  const deliveries: WebhookDelivery[] = [
    { time: '11:42', endpointId: 'wh-1001', event: 'evz.session.completed', statusCode: '200', durationMs: 221 },
    { time: '11:41', endpointId: 'wh-1001', event: 'evz.payment.failed', statusCode: '500', durationMs: 412 },
    { time: '10:58', endpointId: 'wh-0999', event: 'evz.swap.completed', statusCode: '200', durationMs: 180 },
  ]

  return (
    <DashboardLayout pageTitle="Settings — Webhooks">
      {ack && <div className="text-sm text-accent mb-4">{ack}</div>}

      {/* Signing & Security */}
      <div className="card">
        <div className="card-title">Signing & Security</div>
        <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={signing.enabled}
              onChange={(e) => setSigning((s) => ({ ...s, enabled: e.target.checked }))}
              className="checkbox"
            />
            Require signature
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Version</span>
            <select
              value={signing.version}
              onChange={(e) => setSigning((s) => ({ ...s, version: e.target.value }))}
              className="select"
            >
              <option value="v1">v1</option>
              <option value="v2">v2</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Secret (masked)</span>
            <input
              value={signing.secret}
              onChange={(e) => setSigning((s) => ({ ...s, secret: e.target.value }))}
              className="input"
            />
          </label>
        </div>
        <div className="mt-3 text-right">
          <button onClick={() => toast('Signing secret rotated (demo)')} className="btn secondary">
            Rotate secret
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Endpoints */}
      <div className="card">
        <div className="card-title">Endpoints</div>
        <div className="mb-3 flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search URL or ID" className="input" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
          </select>
          <select value={event} onChange={(e) => setEvent(e.target.value)} className="select">
            <option value="All">All Events</option>
            <option value="evz.session.completed">evz.session.completed</option>
            <option value="evz.swap.completed">evz.swap.completed</option>
            <option value="evz.payment.failed">evz.payment.failed</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Events</th>
                <th>Status</th>
                <th>Last Delivery</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEndpoints.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="font-semibold text-sm">{e.id}</div>
                    <div className="text-xs text-muted truncate max-w-xs">{e.url}</div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {e.events.map((ev) => (
                        <span key={ev} className="chip text-xs">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${e.status === 'Active' ? 'approved' : 'pending'}`}>{e.status}</span>
                  </td>
                  <td>{e.lastDelivery}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => toast(`Test sent to ${e.id} (demo)`)} className="btn secondary">
                        Test
                      </button>
                      {e.status === 'Active' ? (
                        <button onClick={() => toast(`Paused ${e.id} (demo)`)} className="btn secondary">
                          Pause
                        </button>
                      ) : (
                        <button onClick={() => toast(`Resumed ${e.id} (demo)`)} className="btn secondary">
                          Resume
                        </button>
                      )}
                      <button onClick={() => toast(`Deleted ${e.id} (demo)`)} className="btn secondary">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <button onClick={() => toast('Add endpoint form (demo)')} className="btn">
            + Add Endpoint
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Delivery Log */}
      <div className="card">
        <div className="card-title">Recent Deliveries</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Endpoint</th>
                <th>Event</th>
                <th>Status</th>
                <th className="text-right">ms</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d, i) => (
                <tr key={i}>
                  <td>{d.time}</td>
                  <td>{d.endpointId}</td>
                  <td>{d.event}</td>
                  <td>
                    <span className={`font-semibold ${d.statusCode === '200' ? 'text-ok' : 'text-danger'}`}>
                      {d.statusCode}
                    </span>
                  </td>
                  <td className="text-right">{d.durationMs}</td>
                  <td className="text-right">
                    <button onClick={() => toast('Retry (demo)')} className="btn secondary">
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

