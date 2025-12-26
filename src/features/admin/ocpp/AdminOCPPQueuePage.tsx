import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

interface ChargePoint {
  id: string
  site: string
  make: string
  model: string
  version: string
  vendor: string
  firmware: string
  status: 'Online' | 'Warning' | 'Offline'
  lastBoot: string
  lastHeartbeat: string
  chargeBoxId: string
  password: string
  connectors: Array<{
    id: number
    type: string
    kw: number
    status: 'Available' | 'Charging' | 'Faulted'
  }>
}

export function AdminOCPPQueuePage() {
  const [q, setQ] = useState('')
  const [make, setMake] = useState('All')
  const [version, setVersion] = useState('All')
  const [minKw, setMinKw] = useState('')
  const [selected, setSelected] = useState<ChargePoint | null>(null)
  const [ack, setAck] = useState('')

  const chargePoints: ChargePoint[] = [
    {
      id: 'CP-A1',
      site: 'Central Hub',
      make: 'ABB',
      model: 'Terra 54',
      version: '1.6J',
      vendor: 'ABB',
      firmware: 'v2.1.0',
      status: 'Online',
      lastBoot: '10:11',
      lastHeartbeat: '11:42',
      chargeBoxId: 'CP-A1',
      password: 'demo_pw_A',
      connectors: [
        { id: 1, type: 'CCS2', kw: 60, status: 'Available' },
        { id: 2, type: 'Type 2', kw: 22, status: 'Available' },
      ],
    },
    {
      id: 'CP-B4',
      site: 'Airport East',
      make: 'Delta',
      model: 'DC Wall 25',
      version: '1.6J',
      vendor: 'Delta',
      firmware: 'v1.9.3',
      status: 'Warning',
      lastBoot: '10:09',
      lastHeartbeat: '11:34',
      chargeBoxId: 'CP-B4',
      password: 'demo_pw_B',
      connectors: [{ id: 1, type: 'CHAdeMO', kw: 50, status: 'Charging' }],
    },
    {
      id: 'CP-C2',
      site: 'Tech Park',
      make: 'Huawei',
      model: 'FusionCharge',
      version: '2.0.1',
      vendor: 'Huawei',
      firmware: 'v3.0.0',
      status: 'Offline',
      lastBoot: '09:40',
      lastHeartbeat: '10:01',
      chargeBoxId: 'CP-C2',
      password: 'demo_pw_C',
      connectors: [{ id: 1, type: 'CCS2', kw: 120, status: 'Available' }],
    },
  ]

  const rows = chargePoints
    .filter((r) =>
      q ? (r.id + ' ' + r.site + ' ' + r.make + ' ' + r.model).toLowerCase().includes(q.toLowerCase()) : true
    )
    .filter((r) => (version === 'All' ? true : r.version === version))
    .filter((r) => (make === 'All' ? true : r.make === make))
    .filter((r) => {
      if (!minKw || isNaN(Number(minKw))) return true
      const maxKw = Math.max(...r.connectors.map((c) => c.kw), 0)
      return maxKw >= Number(minKw)
    })

  const toast = (m: string) => {
    setAck(m)
    setTimeout(() => setAck(''), 1500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast('Copied to clipboard'),
      () => toast('Failed to copy')
    )
  }

  const csmsUrl = (ver: string) => `wss://csms.evzone.example/ocpp/${ver === '1.6J' ? '1.6' : '2.0.1'}`

  return (
    <DashboardLayout pageTitle="OCPP Queue Management">
      {ack && <div className="text-sm text-accent mb-4">{ack}</div>}

      {/* Provisioning Bundle */}
      <div className="card">
        <div className="card-title">Provisioning bundle</div>
        <div className="text-sm text-muted mb-3">Select a charger below to populate</div>
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
          <input
            className="input"
            placeholder="CSMS WebSocket URL"
            readOnly
            value={selected ? csmsUrl(selected.version) : ''}
          />
          <input className="input" placeholder="ChargeBoxId" readOnly value={selected?.chargeBoxId || ''} />
          <input className="input" placeholder="Password" readOnly value={selected?.password || ''} />
          <input
            className="input"
            placeholder="Make / Model"
            readOnly
            value={selected ? `${selected.make} / ${selected.model}` : ''}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            disabled={!selected}
            onClick={() => selected && copyToClipboard(csmsUrl(selected.version))}
            className="btn secondary"
          >
            Copy URL
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && copyToClipboard(selected.chargeBoxId)}
            className="btn secondary"
          >
            Copy ID
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && copyToClipboard(selected.password)}
            className="btn secondary"
          >
            Copy Password
          </button>
          <button
            disabled={!selected}
            onClick={() =>
              selected &&
              copyToClipboard(
                JSON.stringify(
                  {
                    CSMS: csmsUrl(selected.version),
                    ChargeBoxId: selected.chargeBoxId,
                    Password: selected.password,
                    OcppVersion: selected.version,
                    hardware: { make: selected.make, model: selected.model },
                    maxKw: Math.max(...selected.connectors.map((c) => c.kw), 0),
                  },
                  null,
                  2
                )
              )
            }
            className="btn secondary"
          >
            Copy all as JSON
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-6 gap-3 max-[900px]:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search charger / site / make / model"
            className="input col-span-2"
          />
          <select value={version} onChange={(e) => setVersion(e.target.value)} className="select">
            <option value="All">All Versions</option>
            <option value="1.6J">1.6J</option>
            <option value="2.0.1">2.0.1</option>
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
            value={minKw}
            onChange={(e) => setMinKw(e.target.value)}
            placeholder="Min kW"
            className="input"
          />
          <div className="text-sm text-muted self-center">{rows.length} result(s)</div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Connections Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Charger</th>
              <th>Site</th>
              <th>Make</th>
              <th>Model</th>
              <th>OCPP</th>
              <th>Max kW</th>
              <th>Vendor/FW</th>
              <th>Status</th>
              <th>Last Boot</th>
              <th>Heartbeat</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const maxKw = Math.max(...r.connectors.map((c) => c.kw), 0)
              return (
                <tr key={r.id}>
                  <td>
                    <button onClick={() => setSelected(r)} className="font-semibold text-accent hover:underline">
                      {r.id}
                    </button>
                  </td>
                  <td>{r.site}</td>
                  <td>{r.make}</td>
                  <td>{r.model}</td>
                  <td>{r.version}</td>
                  <td>{maxKw} kW</td>
                  <td>
                    {r.vendor} • {r.firmware}
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        r.status === 'Online' ? 'approved' : r.status === 'Warning' ? 'pending' : 'rejected'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.lastBoot}</td>
                  <td>{r.lastHeartbeat}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(
                              {
                                CSMS: csmsUrl(r.version),
                                ChargeBoxId: r.chargeBoxId,
                                Password: r.password,
                                OcppVersion: r.version,
                                hardware: { make: r.make, model: r.model },
                                maxKw,
                              },
                              null,
                              2
                            )
                          )
                        }
                        className="btn secondary"
                      >
                        Bundle
                      </button>
                      <button onClick={() => toast(`Ping ${r.id} (demo)`)} className="btn secondary">
                        Test ping
                      </button>
                      <button onClick={() => toast('ChangeAvailability (demo)')} className="btn secondary">
                        ChangeAvailability
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

