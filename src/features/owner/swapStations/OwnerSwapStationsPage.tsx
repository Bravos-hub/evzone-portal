import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StationStatusPill } from '@/ui/components/StationStatusPill'
import type { StationStatus } from '@/ui/components/StationStatusPill'

interface SwapStationRow {
  id: string
  site: string
  city: string
  status: StationStatus
  protocol: 'BSS' | 'OCPP' | 'Proprietary'
  bays: string
  batteryType: 'LFP' | 'NMC' | 'NCA'
  batteriesIn: number
  batteriesOut: number
  swaps24h: number
  lastSeen: string
}

export function OwnerSwapStationsPage() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('All')
  const [status, setStatus] = useState<StationStatus | 'All'>('All')
  const [proto, setProto] = useState('All')
  const [batteryType, setBatteryType] = useState('All')

  const stations: SwapStationRow[] = [
    {
      id: 'SS-701',
      site: 'Central Hub',
      city: 'Kampala',
      status: 'Online',
      protocol: 'BSS',
      bays: '10/12',
      batteryType: 'LFP',
      batteriesIn: 46,
      batteriesOut: 44,
      swaps24h: 128,
      lastSeen: '11:42',
    },
    {
      id: 'SS-702',
      site: 'Airport East',
      city: 'Kampala',
      status: 'Degraded',
      protocol: 'Proprietary',
      bays: '6/8',
      batteryType: 'NMC',
      batteriesIn: 20,
      batteriesOut: 16,
      swaps24h: 64,
      lastSeen: '11:34',
    },
    {
      id: 'SS-703',
      site: 'Tech Park A',
      city: 'Entebbe',
      status: 'Offline',
      protocol: 'OCPP',
      bays: '0/10',
      batteryType: 'LFP',
      batteriesIn: 0,
      batteriesOut: 0,
      swaps24h: 0,
      lastSeen: '10:51',
    },
  ]

  const rows = stations
    .filter((r) => (q ? (r.id + ' ' + r.site).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (city === 'All' ? true : r.city === city))
    .filter((r) => (status === 'All' ? true : r.status === status))
    .filter((r) => (proto === 'All' ? true : r.protocol === proto))
    .filter((r) => (batteryType === 'All' ? true : r.batteryType === batteryType))

  return (
    <DashboardLayout pageTitle="Swap Stations">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-5 gap-3 max-[900px]:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID or site"
            className="input col-span-2"
          />
          <select value={city} onChange={(e) => setCity(e.target.value)} className="select">
            <option value="All">All Cities</option>
            <option value="Kampala">Kampala</option>
            <option value="Entebbe">Entebbe</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="select">
            <option value="All">All Status</option>
            <option value="Online">Online</option>
            <option value="Degraded">Degraded</option>
            <option value="Offline">Offline</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select value={proto} onChange={(e) => setProto(e.target.value)} className="select">
              <option value="All">All Protocols</option>
              <option value="BSS">BSS</option>
              <option value="OCPP">OCPP</option>
              <option value="Proprietary">Proprietary</option>
            </select>
            <select value={batteryType} onChange={(e) => setBatteryType(e.target.value)} className="select">
              <option value="All">All Battery</option>
              <option value="LFP">LFP</option>
              <option value="NMC">NMC</option>
              <option value="NCA">NCA</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <a href="/owner/swap/stations/new" className="btn">
            + New swap station
          </a>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Swap Stations Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Site</th>
              <th>Status</th>
              <th>Bays</th>
              <th>Protocol</th>
              <th>Battery Type</th>
              <th>In/Out</th>
              <th>Swaps 24h</th>
              <th>Last Seen</th>
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
                <td>
                  <StationStatusPill status={r.status} />
                </td>
                <td>{r.bays}</td>
                <td>{r.protocol}</td>
                <td>{r.batteryType}</td>
                <td>
                  {r.batteriesIn}/{r.batteriesOut}
                </td>
                <td>{r.swaps24h}</td>
                <td>{r.lastSeen}</td>
                <td className="text-right">
                  <a href={`/owner/swap/stations/${r.id}`} className="btn secondary">
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

