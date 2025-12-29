import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { getPermissionsForFeature } from '@/constants/permissions'
import { regionInScope } from '@/core/scope/utils'
import { useScopeStore } from '@/core/scope/scopeStore'

type OpIncident = {
  id: string
  sev: 'SEV1' | 'SEV2' | 'SEV3'
  region: string
  stationIds: string[]
  title: string
  status: 'Investigating' | 'Mitigating' | 'Resolved'
  updatedAt: string
}

const mockIncidents: OpIncident[] = [
  { id: 'INC-2392', sev: 'SEV2', region: 'AFRICA', stationIds: ['ST-0001', 'ST-0002'], title: 'Sessions stuck at starting', status: 'Mitigating', updatedAt: '08:59' },
  { id: 'INC-2401', sev: 'SEV1', region: 'AFRICA', stationIds: [], title: 'Mobile money confirmations delayed', status: 'Investigating', updatedAt: '09:42' },
  { id: 'INC-2350', sev: 'SEV3', region: 'EUROPE', stationIds: ['ST-1011'], title: 'OCPP heartbeat timeouts', status: 'Resolved', updatedAt: 'Yesterday' },
]

export function OperatorOps() {
  const { user } = useAuthStore()
  const perms = getPermissionsForFeature(user?.role, 'incidents')
  const { scope } = useScopeStore()

  const [sev, setSev] = useState<'All' | OpIncident['sev']>('All')
  const [status, setStatus] = useState<'All' | OpIncident['status']>('All')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return mockIncidents
      .filter((i) => regionInScope(scope, i.region))
      .filter((i) => (sev === 'All' ? true : i.sev === sev))
      .filter((i) => (status === 'All' ? true : i.status === status))
      .filter((i) => (q ? (i.id + ' ' + i.title).toLowerCase().includes(q.toLowerCase()) : true))
  }, [sev, status, q, scope])

  return (
    <DashboardLayout pageTitle="Operator — Incidents">
      <div className="space-y-4">
        <div className="card grid md:grid-cols-4 gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search incident" className="input md:col-span-2" />
          <select value={sev} onChange={(e) => setSev(e.target.value as any)} className="select">
            {['All', 'SEV1', 'SEV2', 'SEV3'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="select">
            {['All', 'Investigating', 'Mitigating', 'Resolved'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Region</th>
                <th>Stations</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td className="font-semibold">{i.id}</td>
                  <td>
                    <span className={`pill ${i.sev === 'SEV1' ? 'bg-danger text-white' : i.sev === 'SEV2' ? 'bg-warn text-white' : 'bg-muted/30 text-muted'}`}>
                      {i.sev}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        i.status === 'Resolved' ? 'approved' : i.status === 'Mitigating' ? 'pending' : 'bg-danger/20 text-danger'
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td>{i.region}</td>
                  <td>{i.stationIds.length || '—'}</td>
                  <td>{i.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

