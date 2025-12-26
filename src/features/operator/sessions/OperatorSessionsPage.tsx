import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { mockChargingSessions } from '@/data/mockDb'
import type { SessionStatus, PaymentMethod } from '@/core/types/domain'

export function OperatorSessionsPage() {
  const [site, setSite] = useState('All Sites')
  const [status, setStatus] = useState<SessionStatus | 'All'>('All')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'All'>('All')
  const [from, setFrom] = useState('2025-10-01')
  const [to, setTo] = useState('2025-10-29')
  const [q, setQ] = useState('')

  const rows = mockChargingSessions
    .filter((r) => (site === 'All Sites' ? true : r.site === site))
    .filter((r) => (status === 'All' ? true : r.status === status))
    .filter((r) => (paymentMethod === 'All' ? true : r.paymentMethod === paymentMethod))
    .filter((r) => {
      const date = r.start
      return date >= new Date(from) && date <= new Date(to)
    })
    .filter((r) =>
      q
        ? (r.id + ' ' + r.chargePointId + ' ' + r.site).toLowerCase().includes(q.toLowerCase())
        : true
    )

  const duration = (start: Date, end?: Date) => {
    if (!end) return '—'
    const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
    return `${minutes} min`
  }

  return (
    <DashboardLayout pageTitle="Sessions">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-6 gap-3 max-[900px]:grid-cols-3">
          <select value={site} onChange={(e) => setSite(e.target.value)} className="select col-span-2">
            <option>All Sites</option>
            <option>Central Hub</option>
            <option>Airport East</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="select">
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="select">
            <option value="All">All Payment</option>
            <option value="Card">Card</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Roaming">Roaming</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Session ID or Charger"
            className="input col-span-2"
          />
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Sessions Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Site</th>
              <th>Charger/Conn</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th className="text-right">kWh</th>
              <th>Tariff</th>
              <th className="text-right">Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">
                  <a href={`/operator/sessions/${r.id}`} className="text-accent hover:underline">
                    {r.id}
                  </a>
                </td>
                <td>{r.site}</td>
                <td>
                  {r.chargePointId}/{r.connectorId}
                </td>
                <td>{r.start.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  {r.end
                    ? r.end.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </td>
                <td>{duration(r.start, r.end)}</td>
                <td className="text-right">{r.energyKwh?.toFixed(1) || '—'}</td>
                <td>{r.tariffName}</td>
                <td className="text-right">${r.amount.toFixed(2)}</td>
                <td>{r.paymentMethod}</td>
                <td>
                  <span
                    className={`pill ${
                      r.status === 'Completed'
                        ? 'approved'
                        : r.status === 'Failed'
                          ? 'rejected'
                          : r.status === 'Pending'
                            ? 'pending'
                            : 'sendback'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <a href={`/operator/sessions/${r.id}`} className="btn secondary">
                      View
                    </a>
                    <button className="btn secondary">Refund</button>
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

