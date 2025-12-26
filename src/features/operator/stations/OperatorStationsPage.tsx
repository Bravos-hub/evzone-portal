import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StationStatusPill } from '@/ui/components/StationStatusPill'
import type { StationStatus } from '@/ui/components/StationStatusPill'

interface StationRow {
  id: string
  site: string
  city: string
  make: string
  model: string
  status: StationStatus
  connectors: Array<{ type: string; kw: number }>
  maxKw: number
}

export function OperatorStationsPage() {
  const [q, setQ] = useState('')
  const [site, setSite] = useState('All Sites')
  const [make, setMake] = useState('All')
  const [minKw, setMinKw] = useState('')
  const [status, setStatus] = useState<StationStatus | 'All'>('All')

  const stations: StationRow[] = [
    {
      id: 'CP-A1',
      site: 'Central Hub',
      city: 'Kampala',
      make: 'ABB',
      model: 'Terra 54',
      status: 'Online',
      connectors: [
        { type: 'CCS2', kw: 60 },
        { type: 'Type 2', kw: 22 },
      ],
      maxKw: 60,
    },
    {
      id: 'CP-B4',
      site: 'Airport East',
      city: 'Kampala',
      make: 'Delta',
      model: 'DC Wall 25',
      status: 'Degraded',
      connectors: [{ type: 'CHAdeMO', kw: 50 }],
      maxKw: 50,
    },
    {
      id: 'CP-C2',
      site: 'Tech Park',
      city: 'Wuxi',
      make: 'Huawei',
      model: 'FusionCharge',
      status: 'Offline',
      connectors: [{ type: 'CCS2', kw: 120 }],
      maxKw: 120,
    },
  ]

  const rows = stations
    .filter((r) =>
      q ? (r.id + ' ' + r.site + ' ' + r.city + ' ' + r.make + ' ' + r.model).toLowerCase().includes(q.toLowerCase()) : true
    )
    .filter((r) => (site === 'All Sites' ? true : r.site === site))
    .filter((r) => (make === 'All' ? true : r.make === make))
    .filter((r) => {
      if (!minKw || isNaN(Number(minKw))) return true
      return r.maxKw >= Number(minKw)
    })
    .filter((r) => (status === 'All' ? true : r.status === status))

  return (
    <DashboardLayout pageTitle="Stations">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-6 gap-3 max-[900px]:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID, site, city, make, model"
            className="input col-span-2"
          />
          <select value={site} onChange={(e) => setSite(e.target.value)} className="select">
            <option>All Sites</option>
            <option>Central Hub</option>
            <option>Airport East</option>
            <option>Tech Park</option>
          </select>
          <select value={make} onChange={(e) => setMake(e.target.value)} className="select">
            <option value="All">All Makes</option>
            <option value="ABB">ABB</option>
            <option value="Delta">Delta</option>
            <option value="Huawei">Huawei</option>
            <option value="Siemens">Siemens</option>
            <option value="StarCharge">StarCharge</option>
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
      </div>

      <div style={{ height: 16 }} />

      {/* Stations Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Site / City</th>
              <th>Make</th>
              <th>Model</th>
              <th>Max kW</th>
              <th>Connectors</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.id}</td>
                <td>
                  {r.site} • {r.city}
                </td>
                <td>{r.make}</td>
                <td>{r.model}</td>
                <td>{r.maxKw} kW</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {r.connectors.map((c, i) => (
                      <span key={i} className="chip" title={`${c.type} ${c.kw}kW`}>
                        {c.type} {c.kw}kW
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <StationStatusPill status={r.status} />
                </td>
                <td className="text-right">
                  <a href={`/operator/stations/${r.id}`} className="btn secondary">
                    Open
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

