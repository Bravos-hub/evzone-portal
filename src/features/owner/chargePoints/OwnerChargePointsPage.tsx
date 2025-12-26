import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StationStatusPill } from '@/ui/components/StationStatusPill'
import type { StationStatus } from '@/ui/components/StationStatusPill'

interface ChargePointRow {
  id: string
  name: string
  site: string
  city: string
  make: string
  model: string
  connectors: Array<{ type: string; kw: number }>
  maxKw: number
  lastSeen: string
  status: StationStatus
}

export function OwnerChargePointsPage() {
  const [q, setQ] = useState('')
  const [site, setSite] = useState('All Sites')
  const [make, setMake] = useState('All')
  const [minKw, setMinKw] = useState('')
  const [status, setStatus] = useState<StationStatus | 'All'>('All')

  const chargePoints: ChargePointRow[] = [
    {
      id: 'CP-1001',
      name: 'CP-A-01',
      site: 'City Mall Roof',
      city: 'Kampala',
      make: 'ABB',
      model: 'Terra 54',
      connectors: [
        { type: 'CCS2', kw: 60 },
        { type: 'Type 2', kw: 22 },
      ],
      maxKw: 60,
      lastSeen: '2025-10-29 10:40',
      status: 'Online',
    },
    {
      id: 'CP-1002',
      name: 'CP-A-02',
      site: 'City Mall Roof',
      city: 'Kampala',
      make: 'ABB',
      model: 'Terra 54',
      connectors: [{ type: 'CHAdeMO', kw: 50 }],
      maxKw: 50,
      lastSeen: '2025-10-28 08:10',
      status: 'Offline',
    },
    {
      id: 'CP-2011',
      name: 'BPA-E-11',
      site: 'Business Park A',
      city: 'Wuxi',
      make: 'Delta',
      model: 'DC Wall 25',
      connectors: [{ type: 'CCS2', kw: 25 }],
      maxKw: 25,
      lastSeen: '2025-10-28 09:12',
      status: 'Online',
    },
  ]

  const rows = chargePoints
    .filter((r) =>
      q
        ? (r.name + ' ' + r.site + ' ' + r.city + ' ' + r.make + ' ' + r.model).toLowerCase().includes(q.toLowerCase())
        : true
    )
    .filter((r) => (site === 'All Sites' ? true : r.site === site))
    .filter((r) => (make === 'All' ? true : r.make === make))
    .filter((r) => {
      if (!minKw || isNaN(Number(minKw))) return true
      return r.maxKw >= Number(minKw)
    })
    .filter((r) => (status === 'All' ? true : r.status === status))

  return (
    <DashboardLayout pageTitle="Charge Points / Connectors">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-6 gap-3 max-[900px]:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, site, city, model"
            className="input col-span-2"
          />
          <select value={site} onChange={(e) => setSite(e.target.value)} className="select">
            <option>All Sites</option>
            <option>City Mall Roof</option>
            <option>Business Park A</option>
          </select>
          <select value={make} onChange={(e) => setMake(e.target.value)} className="select">
            <option value="All">All Makes</option>
            <option value="ABB">ABB</option>
            <option value="Delta">Delta</option>
            <option value="Huawei">Huawei</option>
          </select>
          <input
            type="number"
            min="0"
            placeholder="Min kW"
            value={minKw}
            onChange={(e) => setMinKw(e.target.value)}
            className="input"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="select">
            <option value="All">All Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Degraded">Degraded</option>
          </select>
        </div>
        <div className="mt-3">
          <a href="/owner/charge/connectors/new" className="btn">
            + New charge point
          </a>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Charge Points Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Site / City</th>
              <th>Make</th>
              <th>Model</th>
              <th>Max kW</th>
              <th>Connectors</th>
              <th>Last Seen</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.name}</td>
                <td>
                  {r.site} • {r.city}
                </td>
                <td>{r.make}</td>
                <td>{r.model}</td>
                <td>{r.maxKw} kW</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {r.connectors.map((c, i) => (
                      <span key={i} className="chip">
                        {c.type} {c.kw}kW
                      </span>
                    ))}
                  </div>
                </td>
                <td>{r.lastSeen}</td>
                <td>
                  <StationStatusPill status={r.status} />
                </td>
                <td className="text-right">
                  <a href={`/owner/charge/connectors/${r.id}`} className="btn secondary">
                    Manage
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

