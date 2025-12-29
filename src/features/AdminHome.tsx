import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useMemo } from 'react'

const BRAND_GREEN = '#03CD8C'

export function AdminHome() {
  const kpis = useMemo(
    () => [
      { label: 'Organizations', value: '184' },
      { label: 'Users', value: '9,420' },
      { label: 'Active stations', value: '1,206' },
      { label: 'Incidents (24h)', value: '12' },
      { label: 'Billing (MRR)', value: '$72,400' },
    ],
    []
  )

  const health = useMemo(
    () => [
      { k: 'API latency (p95)', v: '182 ms' },
      { k: 'OCPP uptime', v: '99.92%' },
      { k: 'OCPI uptime', v: '99.88%' },
    ],
    []
  )

  const incidents = useMemo(
    () => [
      { id: 'IN-940', sev: 'High', area: 'OCPP', msg: 'Handshake failures (cluster eu‑1)', ts: '11:34' },
      { id: 'IN-939', sev: 'Info', area: 'Billing', msg: 'Invoice batch completed', ts: '10:58' },
    ],
    []
  )

  const approvals = useMemo(
    () => [
      { id: 'APP-OR-221', type: 'Org signup', who: 'VoltOps Ltd', ts: '09:20' },
      { id: 'APP-AD-018', type: 'Admin invite', who: 'joan@acmefleet.com', ts: 'Yesterday' },
    ],
    []
  )

  return (
    <DashboardLayout pageTitle="Admin — Overview">
      <div className="space-y-6">
        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-panel border border-border p-5 shadow-sm">
              <div className="text-sm text-muted">{k.label}</div>
              <div className="mt-2 text-2xl font-extrabold text-text">{k.value}</div>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/organizations" className="flex items-center gap-2 p-3 rounded-xl bg-panel border border-border hover:bg-bg-secondary">
            Manage orgs
          </a>
          <button onClick={() => alert('Create org (mock)')} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: BRAND_GREEN, color: 'white' }}>
            Create org
          </button>
          <a href="/billing" className="flex items-center gap-2 p-3 rounded-xl bg-panel border border-border hover:bg-bg-secondary">
            Billing
          </a>
          <a href="/audit-logs" className="flex items-center gap-2 p-3 rounded-xl bg-panel border border-border hover:bg-bg-secondary">
            Policies
          </a>
        </section>

        {/* System health */}
        <section className="rounded-2xl bg-panel border border-border p-5 shadow-sm grid md:grid-cols-3 gap-3">
          {health.map((h) => (
            <div key={h.k} className="rounded-xl border border-border p-4 bg-bg-secondary">
              <div className="text-muted text-sm">{h.k}</div>
              <div className="text-text font-semibold">{h.v}</div>
            </div>
          ))}
        </section>

        {/* Incidents & Approvals */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-panel border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Incidents</h2>
              <a href="/incidents" className="text-sm text-accent hover:underline">
                Open all
              </a>
            </div>
            <ul className="text-sm divide-y divide-border">
              {incidents.map((i) => (
                <li key={i.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text">
                      {i.area} — {i.id}
                    </div>
                    <div className="text-muted">{i.msg}</div>
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${i.sev === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-bg-secondary text-muted'}`}>{i.sev}</div>
                  <div className="text-muted text-sm w-16 text-right">{i.ts}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-panel border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Approvals</h2>
              <a href="/approvals" className="text-sm text-accent hover:underline">
                Review
              </a>
            </div>
            <ul className="text-sm divide-y divide-border">
              {approvals.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text">{a.type}</div>
                    <div className="text-muted">{a.who}</div>
                  </div>
                  <div className="text-muted">{a.ts}</div>
                  <button onClick={() => alert('Approved (mock)')} className="btn secondary">
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

