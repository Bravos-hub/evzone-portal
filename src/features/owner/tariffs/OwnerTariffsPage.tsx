import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

interface TariffComponents {
  kwh: number
  minute: number
  session: number
}

interface TariffRow {
  id: string
  name: string
  components: TariffComponents
  currency: string
  status: 'Active' | 'Draft' | 'Archived'
  linkedPlans: number
  updated: string
}

export function OwnerTariffsPage() {
  const [q, setQ] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('All')

  const tariffs: TariffRow[] = [
    {
      id: 'tf-301',
      name: 'Standard',
      components: { kwh: 0.3, minute: 0.0, session: 0.5 },
      currency: 'USD',
      status: 'Active',
      linkedPlans: 2,
      updated: '2025-10-20 08:40',
    },
    {
      id: 'tf-302',
      name: 'Night Saver',
      components: { kwh: 0.18, minute: 0.0, session: 0.0 },
      currency: 'USD',
      status: 'Active',
      linkedPlans: 1,
      updated: '2025-10-18 12:05',
    },
    {
      id: 'tf-303',
      name: 'Park & Charge',
      components: { kwh: 0.24, minute: 0.02, session: 0.0 },
      currency: 'USD',
      status: 'Draft',
      linkedPlans: 0,
      updated: '2025-10-12 09:15',
    },
  ]

  const rows = tariffs
    .filter((r) => (q ? r.name.toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (status === 'All' ? true : r.status === status))
    .filter((r) => r.currency === currency)

  const formatComponents = (c: TariffComponents) => {
    const parts: string[] = []
    if (c.kwh > 0) parts.push(`$${c.kwh.toFixed(2)}/kWh`)
    if (c.minute > 0) parts.push(`$${c.minute.toFixed(2)}/min`)
    if (c.session > 0) parts.push(`$${c.session.toFixed(2)}/session`)
    return parts.length ? parts.join(' + ') : '$0.00'
  }

  return (
    <DashboardLayout pageTitle="Tariffs">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tariffs"
            className="input col-span-2"
          />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="UGX">UGX</option>
            <option value="KES">KES</option>
            <option value="CNY">CNY</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <div className="mt-3">
          <a href="/owner/charge/tariffs/new" className="btn">
            + New tariff
          </a>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Tariffs Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tariff</th>
              <th>Components</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Linked plans</th>
              <th>Updated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.name}</td>
                <td>{formatComponents(r.components)}</td>
                <td>{r.currency}</td>
                <td>
                  <span className={`pill ${r.status === 'Active' ? 'approved' : r.status === 'Draft' ? 'pending' : 'rejected'}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.linkedPlans}</td>
                <td>{r.updated}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <a href={`/owner/charge/tariffs/${r.id}`} className="btn secondary">
                      View
                    </a>
                    <a href={`/owner/charge/tariffs/${r.id}/edit`} className="btn secondary">
                      Edit
                    </a>
                    <button className="btn secondary">Duplicate</button>
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

