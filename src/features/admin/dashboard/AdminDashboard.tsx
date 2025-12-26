import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'
import { WorldChoroplethMap, type ChoroplethDatum } from '@/ui/components/WorldChoroplethMap'

type RegionStat = {
  region: string
  uptime: number
  incidents: number
  stations: number
  capacityMw: number
  revenueUsd: number
  sessions: number
  sla: number
}

type IncidentItem = { id: string; title: string; sev: 'SEV1' | 'SEV2' | 'SEV3'; owner: string; eta: string; sla: string }
type DispatchItem = { id: string; job: string; region: string; tech: string; eta: string; priority: 'P1' | 'P2' | 'P3' }
type ComplianceItem = { id: string; type: string; owner: string; age: string; status: 'Pending' | 'Review' | 'Blocked' }

type PaymentIssue = { id: string; provider: string; type: string; amount: number; status: 'Open' | 'Retrying' | 'Resolved' }
type AuditEvent = { id: string; actor: string; action: string; scope: string; when: string }
type HealthItem = { service: string; status: 'Operational' | 'Degraded' | 'Outage' | 'PartialOutage'; p95: number; errors: number; backlog: number }

const kpis = [
  { title: 'Stations online', value: '1,284' },
  { title: 'Stations offline', value: '32' },
  { title: 'Incidents open', value: '47' },
  { title: 'Dispatch backlog', value: '18' },
  { title: 'Approvals pending', value: '112' },
  { title: 'Payment exceptions', value: '23' },
  { title: 'Dispute volume', value: '61' },
  { title: 'SLA compliance', value: '99.2%' },
]

const regions: RegionStat[] = [
  { region: 'North America', uptime: 99.4, incidents: 12, stations: 540, capacityMw: 210, revenueUsd: 1_240_000, sessions: 182_000, sla: 98.9 },
  { region: 'Europe', uptime: 99.1, incidents: 9, stations: 430, capacityMw: 175, revenueUsd: 1_050_000, sessions: 154_000, sla: 98.1 },
  { region: 'Africa', uptime: 98.6, incidents: 14, stations: 210, capacityMw: 88, revenueUsd: 460_000, sessions: 72_000, sla: 97.5 },
  { region: 'Asia', uptime: 99.2, incidents: 8, stations: 380, capacityMw: 165, revenueUsd: 980_000, sessions: 141_000, sla: 98.6 },
  { region: 'Middle East', uptime: 98.9, incidents: 6, stations: 190, capacityMw: 92, revenueUsd: 410_000, sessions: 61_000, sla: 97.9 },
]

const incidents: IncidentItem[] = [
  { id: 'INC-2401', title: 'Grid instability - Lagos', sev: 'SEV1', owner: 'Ops West', eta: '45m', sla: '01:12' },
  { id: 'INC-2389', title: 'OCPP drop - Berlin hub', sev: 'SEV2', owner: 'Ops EU', eta: '1h20', sla: '02:05' },
  { id: 'INC-2377', title: 'Battery recall flag', sev: 'SEV3', owner: 'Safety', eta: '—', sla: '06:30' },
]

const dispatches: DispatchItem[] = [
  { id: 'DSP-8832', job: 'Swap stack recal', region: 'NA', tech: 'Crew A', eta: '32m', priority: 'P1' },
  { id: 'DSP-8821', job: 'Charger RCD check', region: 'EU', tech: 'Crew D', eta: '1h05', priority: 'P2' },
  { id: 'DSP-8810', job: 'Locker door fault', region: 'AF', tech: 'Partner-X', eta: '1h30', priority: 'P3' },
]

const compliance: ComplianceItem[] = [
  { id: 'KYC-204', type: 'Owner KYC', owner: 'Volt Mobility', age: '2d', status: 'Review' },
  { id: 'ACR-118', type: 'Access review', owner: 'Ops EU', age: '1d', status: 'Pending' },
  { id: 'KYC-199', type: 'Technician vetting', owner: 'Contractor-Z', age: '4d', status: 'Blocked' },
]

const paymentIssues: PaymentIssue[] = [
  { id: 'PAY-771', provider: 'Stripe', type: 'Card auth fail spike', amount: 18240, status: 'Retrying' },
  { id: 'PAY-766', provider: 'Flutterwave', type: 'Reconciliation gap', amount: 9210, status: 'Open' },
  { id: 'PAY-752', provider: 'MPesa', type: 'Timeouts', amount: 4110, status: 'Resolved' },
]

const auditEvents: AuditEvent[] = [
  { id: 'AUD-9921', actor: 'd.admin', action: 'Impersonated owner', scope: 'OWNER-442', when: '06m ago' },
  { id: 'AUD-9917', actor: 'c.sre', action: 'API key rotated', scope: 'Platform', when: '19m ago' },
  { id: 'AUD-9909', actor: 'b.billing', action: 'Exported ledger', scope: 'Region=EU', when: '42m ago' },
]

const health: HealthItem[] = [
  { service: 'Core API', status: 'Operational', p95: 182, errors: 0.08, backlog: 3 },
  { service: 'OCPP Broker', status: 'Degraded', p95: 420, errors: 0.42, backlog: 28 },
  { service: 'Webhooks', status: 'Operational', p95: 210, errors: 0.11, backlog: 7 },
  { service: 'OCPI Sync', status: 'Operational', p95: 260, errors: 0.05, backlog: 2 },
  { service: 'MQTT Ingest', status: 'PartialOutage', p95: 980, errors: 1.4, backlog: 61 },
]

export function AdminDashboard() {
  const byRegion = (name: string) => regions.find((r) => r.region === name)!
  const choropleth: ChoroplethDatum[] = [
    {
      id: 'N_AMERICA',
      label: 'North America',
      metrics: {
        stations: byRegion('North America').stations,
        sessions: byRegion('North America').sessions,
        uptime: byRegion('North America').uptime,
        revenueUsd: byRegion('North America').revenueUsd,
      },
    },
    {
      id: 'EUROPE',
      label: 'Europe',
      metrics: {
        stations: byRegion('Europe').stations,
        sessions: byRegion('Europe').sessions,
        uptime: byRegion('Europe').uptime,
        revenueUsd: byRegion('Europe').revenueUsd,
      },
    },
    {
      id: 'AFRICA',
      label: 'Africa',
      metrics: {
        stations: byRegion('Africa').stations,
        sessions: byRegion('Africa').sessions,
        uptime: byRegion('Africa').uptime,
        revenueUsd: byRegion('Africa').revenueUsd,
      },
    },
    {
      id: 'ASIA',
      label: 'Asia',
      metrics: {
        stations: byRegion('Asia').stations,
        sessions: byRegion('Asia').sessions,
        uptime: byRegion('Asia').uptime,
        revenueUsd: byRegion('Asia').revenueUsd,
      },
    },
    {
      id: 'MIDDLE_EAST',
      label: 'Middle East',
      metrics: {
        stations: byRegion('Middle East').stations,
        sessions: byRegion('Middle East').sessions,
        uptime: byRegion('Middle East').uptime,
        revenueUsd: byRegion('Middle East').revenueUsd,
      },
    },
  ]

  return (
    <DashboardLayout pageTitle="Admin Overview">
      {/* KPI row (match reference: compact, 4-up primary KPIs) */}
      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Total stations" value="1,316" />
        <KpiCard title="Incidents (24h)" value="47" />
        <KpiCard title="Revenue (30d)" value="$4.14M" />
        <KpiCard title="SLA compliance" value="99.2%" />
      </div>

      <div className="h-4" />

      {/* Reference-style main row: Map left, analytics right */}
      <div className="grid grid-cols-[1.6fr_0.9fr] gap-5 xl:grid-cols-1">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="card-title mb-1">World-wide metrics</div>
              <div className="text-xs text-muted">Incidents by macro-region (shaded) + region drill-down</div>
            </div>
            <button className="btn secondary">Export snapshot</button>
          </div>

          <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 xl:grid-cols-1">
            <div className="panel">
              <WorldChoroplethMap
                title="Map coverage"
                subtitle="Shaded by composite (stations + sessions + uptime + revenue). Use toggle to switch."
                data={choropleth}
                lowColor="#132036"
                highColor="#3b82f6"
              />
            </div>
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Region distribution</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Uptime</th>
                      <th>Inc</th>
                      <th>Rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r) => (
                      <tr key={r.region}>
                        <td className="font-semibold">{r.region}</td>
                        <td>{r.uptime.toFixed(1)}%</td>
                        <td><span className={`pill ${r.incidents > 10 ? 'rejected' : 'pending'}`}>{r.incidents}</span></td>
                        <td>${(r.revenueUsd / 1_000_000).toFixed(2)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-3" />
              <Panel
                title="Capacity"
                subtitle={`${regions.reduce((a, b) => a + b.capacityMw, 0)} MW total • ${regions.reduce((a, b) => a + b.sessions, 0).toLocaleString()} sessions`}
                right="Updated 2m ago"
              />
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-0">
            <div className="p-5 border-b border-border-light">
              <div className="card-title mb-1">Worldwide alerts</div>
              <div className="text-xs text-muted">Critical incidents, dispatch backlog, compliance</div>
            </div>
            <div className="p-5 grid gap-3">
              <SectionList
                title="Incident war room"
                items={incidents.map((i) => ({
                  id: i.id,
                  title: i.title,
                  meta: `${i.owner} • ETA ${i.eta}`,
                  pill: i.sev === 'SEV1' ? 'rejected' : i.sev === 'SEV2' ? 'sendback' : 'pending',
                  pillText: i.sev,
                  aux: `SLA ${i.sla}`,
                }))}
              />
              <SectionList
                title="Dispatch queue"
                items={dispatches.map((d) => ({
                  id: d.id,
                  title: d.job,
                  meta: `${d.region} • ${d.tech}`,
                  pill: d.priority === 'P1' ? 'rejected' : d.priority === 'P2' ? 'sendback' : 'pending',
                  pillText: d.priority,
                  aux: `ETA ${d.eta}`,
                }))}
              />
              <SectionList
                title="Compliance queue"
                items={compliance.map((c) => ({
                  id: c.id,
                  title: c.type,
                  meta: c.owner,
                  pill: c.status === 'Blocked' ? 'rejected' : c.status === 'Review' ? 'sendback' : 'pending',
                  pillText: c.status,
                  aux: c.age,
                }))}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="text-xs text-muted m-0 mb-1 font-semibold uppercase tracking-[0.5px]">Financial & settlement</div>
            <div className="text-sm text-text-secondary">Payment exceptions, disputes, exports</div>
          </div>
          <div className="p-5 grid gap-4">
            <div className="grid gap-2">
              {paymentIssues.map((p) => (
                <div key={p.id} className="panel flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-text">{p.type}</div>
                    <div className="text-xs text-muted">{p.provider} • ${p.amount.toLocaleString()}</div>
                  </div>
                  <span className={`pill ${p.status === 'Open' ? 'rejected' : p.status === 'Retrying' ? 'sendback' : 'approved'}`}>{p.status}</span>
                </div>
              ))}
            </div>
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Exports & reporting</div>
              <div className="grid gap-1 text-xs text-muted">
                <div>Ledger export (EU) — queued • 3m ago</div>
                <div>Disputes aging — running • 11m ago</div>
                <div>Refund audit — completed • 48m ago</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="text-xs text-muted m-0 mb-1 font-semibold uppercase tracking-[0.5px]">Governance & reliability</div>
            <div className="text-sm text-text-secondary">Audit, system health, comms</div>
          </div>
          <div className="p-5 grid gap-3">
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Audit events</div>
              <div className="grid gap-1 text-xs text-muted">
                {auditEvents.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span>{a.action} — {a.scope}</span>
                    <span className="text-text-secondary">{a.when}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">System health</div>
              <div className="grid gap-2">
                {health.map((h) => (
                  <div key={h.service} className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text">{h.service}</span>
                      <span className="text-xs text-muted">p95 {h.p95}ms • errors {h.errors.toFixed(2)}% • backlog {h.backlog}</span>
                    </div>
                    <span className={`pill ${h.status === 'Operational' ? 'approved' : h.status === 'Degraded' ? 'sendback' : 'rejected'}`}>{h.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="text-sm font-semibold text-text mb-2">Broadcast / comms</div>
              <div className="grid gap-1 text-xs text-muted">
                <div>Status page: EU partial outage — live</div>
                <div>Maintenance window: MQTT ingest — tomorrow 02:00 UTC</div>
                <div>Release train: core-api v2.8 — in progress</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function SectionList({
  title,
  items,
}: {
  title: string
  items: Array<{ id: string; title: string; meta: string; pill: string; pillText: string; aux: string }>
}) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-text">{title}</div>
        <span className="text-xs text-muted">{items.length} items</span>
      </div>
      <div className="grid gap-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-text">{it.title}</span>
              <span className="text-xs text-muted">{it.meta}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`pill ${it.pill}`}>{it.pillText}</span>
              <span className="text-xs text-muted">{it.aux}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
