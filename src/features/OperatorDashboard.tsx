import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { hasPermission } from '@/constants/permissions'

/* ─────────────────────────────────────────────────────────────────────────────
   Operator Dashboard — Overview, Incidents, Queue, Shifts
   RBAC: Operators only
───────────────────────────────────────────────────────────────────────────── */

type Tab = 'Overview' | 'Incidents' | 'Queue' | 'Shifts'

interface Incident {
  id: string
  site: string
  device: string
  sev: 'High' | 'Medium' | 'Info'
  when: string
  msg: string
}

interface QueueJob {
  id: string
  site: string
  type: string
  prio: 'High' | 'Medium' | 'Low'
  eta: string
  assignee: string
}

const MOCK_INCIDENTS: Incident[] = [
  { id: 'IN-921', site: 'Airport East', device: 'CP-B4', sev: 'High', when: '11:34', msg: 'OCPP heartbeat timeout' },
  { id: 'IN-920', site: 'Central Hub', device: 'CP-A1', sev: 'Info', when: '10:58', msg: 'Firmware update completed' },
  { id: 'IN-919', site: 'Tech Park', device: 'SS-701', sev: 'High', when: '10:12', msg: 'Swap bay safety lock engaged' },
]

const MOCK_QUEUE: QueueJob[] = [
  { id: 'JOB-441', site: 'Central Hub', type: 'Replace fan', prio: 'High', eta: '2h', assignee: '—' },
  { id: 'JOB-440', site: 'Airport East', type: 'Comm check', prio: 'Medium', eta: '4h', assignee: '—' },
  { id: 'JOB-439', site: 'Tech Park', type: 'Routine inspection', prio: 'Low', eta: '1d', assignee: 'Aisha N.' },
]

const KPIS = [
  { label: 'Stations online', value: '24' },
  { label: 'Chargers online', value: '128' },
  { label: 'Open tickets', value: '14' },
  { label: 'SLA met (24h)', value: '98.7%' },
  { label: 'Swaps (24h)', value: '192' },
]

export function OperatorDashboard() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'EVZONE_OPERATOR'
  const canView = hasPermission(role, 'incidents', 'view')

  const [tab, setTab] = useState<Tab>('Overview')
  const [ack, setAck] = useState('')
  const [shiftNotes, setShiftNotes] = useState('')

  const toast = (m: string) => { setAck(m); setTimeout(() => setAck(''), 2000) }

  if (!canView) {
    return <div className="p-8 text-center text-subtle">No permission to view Operator Dashboard.</div>
  }

  return (
    <DashboardLayout pageTitle="Operator — Overview">
      <div className="space-y-6">
        {ack && <div className="rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm">{ack}</div>}

        {/* Tab Navigation */}
        <nav className="flex gap-2">
          {(['Overview', 'Incidents', 'Queue', 'Shifts'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === t
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border hover:bg-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {tab === 'Overview' && (
          <>
            {/* KPIs */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {KPIS.map(k => (
                <div key={k.label} className="rounded-xl bg-surface border border-border p-5 shadow-sm">
                  <div className="text-sm text-subtle">{k.label}</div>
                  <div className="mt-2 text-2xl font-bold">{k.value}</div>
                </div>
              ))}
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a href="/stations" className="flex items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 3l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" /><path d="M9 3v14M15 5v14" /></svg>
                Open Map
              </a>
              <button onClick={() => toast('Dispatch modal would open')} className="flex items-center gap-2 p-4 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7" /></svg>
                Dispatch Job
              </button>
              <a href="/alerts" className="flex items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>
                View Alerts
              </a>
              <a href="/reports" className="flex items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                Reports
              </a>
            </section>
          </>
        )}

        {/* Incidents Tab */}
        {tab === 'Incidents' && (
          <section className="rounded-xl bg-surface border border-border p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Recent Incidents</h2>
            <ul className="divide-y divide-border">
              {MOCK_INCIDENTS.map(i => (
                <li key={i.id} className="py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium">{i.site} — {i.device}</div>
                    <div className="text-sm text-subtle">{i.msg}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      i.sev === 'High' ? 'bg-rose-100 text-rose-700' :
                      i.sev === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{i.sev}</span>
                    <span className="text-sm text-subtle w-16 text-right">{i.when}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Queue Tab */}
        {tab === 'Queue' && (
          <section className="rounded-xl bg-surface border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Live Jobs Queue</h2>
              <a href="/jobs" className="text-sm text-accent hover:underline">Open all jobs</a>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-subtle">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Job</th>
                    <th className="px-4 py-2 text-left font-medium">Site</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-left font-medium">Priority</th>
                    <th className="px-4 py-2 text-left font-medium">ETA</th>
                    <th className="px-4 py-2 text-left font-medium">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_QUEUE.map(r => (
                    <tr key={r.id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 font-medium">{r.id}</td>
                      <td className="px-4 py-2">{r.site}</td>
                      <td className="px-4 py-2">{r.type}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.prio === 'High' ? 'bg-rose-100 text-rose-700' :
                          r.prio === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{r.prio}</span>
                      </td>
                      <td className="px-4 py-2">{r.eta}</td>
                      <td className="px-4 py-2">{r.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Shifts Tab */}
        {tab === 'Shifts' && (
          <section className="rounded-xl bg-surface border border-border p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Shift Handoff</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border p-4 bg-muted">
                <h3 className="font-medium mb-3">Current Shift</h3>
                <ul className="text-sm space-y-2 text-subtle">
                  <li>• 08:00–16:00 • Central Hub region</li>
                  <li>• Open critical: IN-921 (OCPP timeout)</li>
                  <li>• Escalation: CP-B4 comms pending</li>
                  <li>• Swap station SS-701 under observation</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium mb-3">Notes to Next Shift</h3>
                <textarea
                  rows={5}
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  placeholder="Add handoff notes for the next shift..."
                  className="w-full rounded-lg border border-border px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
                />
                <button
                  onClick={() => toast('Shift notes saved')}
                  className="mt-3 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

export default OperatorDashboard

