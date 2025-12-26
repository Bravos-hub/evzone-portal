import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'
import { Card } from '@/ui/components/Card'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type TimeRange = '1h' | '24h' | '7d'
type ServiceStatus = 'Operational' | 'Degraded' | 'PartialOutage' | 'MajorOutage' | 'Maintenance'
type AlertSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'

type Service = {
  id: string
  name: string
  region: Region
  status: ServiceStatus
  p95Ms: number
  errRate: number // %
  queueBacklog: number
  lastDeploy: string
  owner: string
  runbook: string
}

type Alert = {
  id: string
  createdAt: string
  severity: AlertSeverity
  region: Region
  source: string
  message: string
  acknowledged: boolean
}

type Maintenance = {
  id: string
  region: Region
  services: string[]
  startAt: string
  endAt: string
  title: string
  notes: string
  published: boolean
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const ranges: Array<{ id: TimeRange; label: string }> = [
  { id: '1h', label: 'Last 1 hour' },
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
]

const seedServices: Service[] = [
  {
    id: 'svc-api',
    name: 'Core API',
    region: 'AFRICA',
    status: 'Degraded',
    p95Ms: 980,
    errRate: 1.7,
    queueBacklog: 1200,
    lastDeploy: '2025-12-23 21:10',
    owner: 'Platform',
    runbook: 'Check gateway, DB pool, and queue lag. Scale workers.',
  },
  {
    id: 'svc-ocpp',
    name: 'OCPP Gateway',
    region: 'AFRICA',
    status: 'Operational',
    p95Ms: 220,
    errRate: 0.2,
    queueBacklog: 110,
    lastDeploy: '2025-12-22 13:42',
    owner: 'Charging',
    runbook: 'Verify charger connectivity, handshake errors, heartbeat rates.',
  },
  {
    id: 'svc-pay',
    name: 'Payments Webhooks',
    region: 'AFRICA',
    status: 'PartialOutage',
    p95Ms: 1400,
    errRate: 3.4,
    queueBacklog: 5600,
    lastDeploy: '2025-12-20 09:05',
    owner: 'Payments',
    runbook: 'Inspect provider callbacks, retry queues, reconciliation jobs.',
  },
  {
    id: 'svc-swap',
    name: 'Swap Orchestrator',
    region: 'EUROPE',
    status: 'Operational',
    p95Ms: 310,
    errRate: 0.1,
    queueBacklog: 45,
    lastDeploy: '2025-12-18 18:20',
    owner: 'Swapping',
    runbook: 'Check locker events, bay locks, firmware compatibility.',
  },
  {
    id: 'svc-notif',
    name: 'Notifications',
    region: 'ALL',
    status: 'Maintenance',
    p95Ms: 410,
    errRate: 0.6,
    queueBacklog: 900,
    lastDeploy: '2025-12-24 06:55',
    owner: 'Platform',
    runbook: 'Check push provider, SMS gateway, delivery logs.',
  },
]

const seedAlerts: Alert[] = [
  {
    id: 'ALT-9011',
    createdAt: '2025-12-24 09:31',
    severity: 'SEV1',
    region: 'AFRICA',
    source: 'Payments Webhooks',
    message: 'Webhook ack latency > 10s for 5m; retries piling up.',
    acknowledged: false,
  },
  {
    id: 'ALT-8992',
    createdAt: '2025-12-24 08:42',
    severity: 'SEV2',
    region: 'AFRICA',
    source: 'Core API',
    message: 'Error rate 5xx > 1% for 10m; DB connections near limit.',
    acknowledged: true,
  },
  {
    id: 'ALT-8774',
    createdAt: '2025-12-23 17:15',
    severity: 'SEV3',
    region: 'EUROPE',
    source: 'Swap Orchestrator',
    message: 'Locker event ingestion spike; investigate noisy station ST-1011.',
    acknowledged: false,
  },
]

const seedMaint: Maintenance[] = [
  {
    id: 'MW-310',
    region: 'ALL',
    services: ['Notifications'],
    startAt: '2025-12-24 05:30',
    endAt: '2025-12-24 07:00',
    title: 'Notification provider rotation',
    notes: 'Rotating provider keys; monitoring delivery failures.',
    published: true,
  },
]

async function apiListServices(): Promise<Service[]> {
  await new Promise((r) => setTimeout(r, 120))
  return seedServices
}
async function apiListAlerts(): Promise<Alert[]> {
  await new Promise((r) => setTimeout(r, 120))
  return seedAlerts
}
async function apiListMaint(): Promise<Maintenance[]> {
  await new Promise((r) => setTimeout(r, 120))
  return seedMaint
}
async function apiUpdate(_id: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 180))
  return { ok: true }
}

type DrawerTab = 'overview' | 'metrics' | 'logs' | 'runbook'
type CreateMaintModal = {
  open: boolean
  title: string
  region: Region
  services: string
  startAt: string
  endAt: string
  notes: string
  publish: boolean
}

export function AdminSystemHealthPage() {
  const [region, setRegion] = useState<Region>('ALL')
  const [range, setRange] = useState<TimeRange>('24h')
  const [services, setServices] = useState<Service[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [maint, setMaint] = useState<Maintenance[]>([])
  const [q, setQ] = useState('')
  const [openServiceId, setOpenServiceId] = useState<string | null>(null)
  const [tab, setTab] = useState<DrawerTab>('overview')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState<CreateMaintModal>({
    open: false,
    title: '',
    region: 'ALL',
    services: 'Core API, Notifications',
    startAt: nowStampMinus(10),
    endAt: nowStampPlus(50),
    notes: '',
    publish: true,
  })

  async function refresh() {
    const [s, a, m] = await Promise.all([apiListServices(), apiListAlerts(), apiListMaint()])
    setServices(s)
    setAlerts(a)
    setMaint(m)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const okR = region === 'ALL' || s.region === region || s.region === 'ALL'
      const okQ = !q || (s.name + ' ' + s.owner + ' ' + s.status).toLowerCase().includes(q.toLowerCase())
      return okR && okQ
    })
  }, [services, region, q])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => (region === 'ALL' ? true : a.region === region)).slice(0, 12)
  }, [alerts, region])

  const kpi = useMemo(() => {
    const operational = filteredServices.filter((s) => s.status === 'Operational').length
    const degraded = filteredServices.filter((s) => s.status === 'Degraded' || s.status === 'PartialOutage' || s.status === 'MajorOutage').length
    const maintCount = filteredServices.filter((s) => s.status === 'Maintenance').length
    const sev1 = filteredAlerts.filter((a) => a.severity === 'SEV1' && !a.acknowledged).length
    const queue = filteredServices.reduce((acc, s) => acc + s.queueBacklog, 0)
    const avgP95 = filteredServices.length ? Math.round(filteredServices.reduce((acc, s) => acc + s.p95Ms, 0) / filteredServices.length) : 0
    return { operational, degraded, maintCount, sev1, queue, avgP95 }
  }, [filteredServices, filteredAlerts])

  const openSvc = filteredServices.find((s) => s.id === openServiceId) ?? null

  async function updateAlertAck(id: string, acknowledged: boolean) {
    setBusy(true)
    setNotice('')
    try {
      await apiUpdate(id)
      setAlerts((list) => list.map((a) => (a.id === id ? { ...a, acknowledged } : a)))
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function saveService(patch: Partial<Service>) {
    if (!openSvc) return
    setBusy(true)
    setNotice('')
    try {
      await apiUpdate(openSvc.id)
      setServices((list) => list.map((s) => (s.id === openSvc.id ? { ...s, ...patch } : s)))
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout pageTitle="System Health & Monitoring">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search service/owner/status" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <select className="select" value={range} onChange={(e) => setRange(e.target.value as any)}>
            {ranges.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={() => void refresh()} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="btn" onClick={() => setModal((m) => ({ ...m, open: true }))}>
            Schedule maintenance
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="kpi-grid">
          <KpiCard label="Operational services" value={String(kpi.operational)} hint="Services currently green" />
          <KpiCard label="Degraded / outage" value={String(kpi.degraded)} hint="Yellow/Red services" />
          <KpiCard label="In maintenance" value={String(kpi.maintCount)} hint="Planned downtime" />
          <KpiCard label="Unacked SEV1 alerts" value={String(kpi.sev1)} hint="Needs attention" tone={kpi.sev1 ? 'danger' : 'ok'} />
          <KpiCard label="Total queue backlog" value={String(kpi.queue)} hint="Jobs/webhooks pending" />
          <KpiCard label="Avg p95 latency" value={`${kpi.avgP95}ms`} hint={`Range: ${range}`} />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Services</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>p95</th>
                  <th>Error rate</th>
                  <th>Queue</th>
                  <th>Owner</th>
                  <th>Last deploy</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 900 }}>
                      <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => { setOpenServiceId(s.id); setTab('overview') }}>
                        {s.name}
                      </button>
                    </td>
                    <td>
                      <StatusPill status={mapServiceStatus(s.status)} />
                    </td>
                    <td>{s.region}</td>
                    <td className="small">{s.p95Ms}ms</td>
                    <td className="small">{s.errRate.toFixed(1)}%</td>
                    <td className="small">{s.queueBacklog}</td>
                    <td className="small">{s.owner}</td>
                    <td className="small">{s.lastDeploy}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn secondary" onClick={() => setServices((list) => list.map((x) => x.id === s.id ? { ...x, status: 'Operational' } : x))}>Mark green</button>
                        <button className="btn secondary" onClick={() => setServices((list) => list.map((x) => x.id === s.id ? { ...x, status: 'Degraded' } : x))}>Degrade</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ height: 10 }} />
          <div className="panel">Backend wiring later: metrics links, deploy metadata, per-region shards, and alert routing.</div>
        </div>

        <div className="card">
          <div className="card-title">Alerts</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {filteredAlerts.map((a) => (
              <div key={a.id} className="panel" style={{ display: 'grid', gap: 8 }}>
                <div className="split">
                  <div style={{ fontWeight: 900 }}>{a.id} • {a.source}</div>
                  <span className={`pill ${a.severity === 'SEV1' ? 'rejected' : a.severity === 'SEV2' ? 'sendback' : a.severity === 'SEV3' ? 'pending' : 'approved'}`}>
                    {a.severity}
                  </span>
                </div>
                <div className="small">{a.createdAt} • {a.region} • {a.acknowledged ? 'Acked' : 'Unacked'}</div>
                <div>{a.message}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button className="btn secondary" disabled={busy} onClick={() => void updateAlertAck(a.id, !a.acknowledged)}>
                    {a.acknowledged ? 'Unack' : 'Acknowledge'}
                  </button>
                  <button className="btn secondary" onClick={() => alert('Placeholder: open logs for alert source')}>Open logs</button>
                </div>
              </div>
            ))}
            {!filteredAlerts.length ? <div className="panel">No alerts for this region.</div> : null}
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Maintenance windows</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Region</th>
                  <th>Services</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Published</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maint.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 900 }}>{m.id}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{m.title}</div>
                      <div className="small">{m.notes}</div>
                    </td>
                    <td>{m.region}</td>
                    <td className="small">{m.services.join(', ')}</td>
                    <td className="small">{m.startAt}</td>
                    <td className="small">{m.endAt}</td>
                    <td>{m.published ? <span className="pill approved">Yes</span> : <span className="pill pending">No</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn secondary" onClick={() => setMaint((list) => list.map((x) => x.id === m.id ? { ...x, published: !x.published } : x))}>
                          {m.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="btn secondary" onClick={() => setMaint((list) => list.filter((x) => x.id !== m.id))}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ height: 10 }} />
          <div className="panel">Use this to post planned downtime to a status page + in-app banners (backend).</div>
        </div>

        <div className="card">
          <div className="card-title">Escalation & Runbooks (placeholder)</div>
          <div className="grid">
            <div className="panel">SEV1: notify on-call + operators + publish status update every 30 mins.</div>
            <div className="panel">Auto-create incident from correlated alerts (payments, OCPP, core API).</div>
            <div className="panel">Regional freeze switches: pause onboarding, disable swaps, restrict top-ups.</div>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="card" style={{ marginTop: 12, borderColor: 'rgba(255,107,107,.25)' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 900 }}>Error</div>
          <div className="small">{notice}</div>
        </div>
      ) : null}

      {openSvc ? <ServiceDrawer row={openSvc} tab={tab} setTab={setTab} busy={busy} onClose={() => setOpenServiceId(null)} onSave={saveService} /> : null}

      {modal.open ? (
        <CreateMaintenanceModal
          model={modal}
          setModel={setModal}
          onSubmit={() => {
            const n: Maintenance = {
              id: 'MW-' + Math.floor(100 + Math.random() * 900),
              region: modal.region,
              services: splitCsv(modal.services),
              startAt: modal.startAt,
              endAt: modal.endAt,
              title: modal.title || 'Maintenance',
              notes: modal.notes || '—',
              published: modal.publish,
            }
            setMaint((list) => [n, ...list])
            setModal((m) => ({ ...m, open: false, title: '', notes: '' }))
          }}
        />
      ) : null}
    </DashboardLayout>
  )
}

function mapServiceStatus(s: ServiceStatus): ApprovalStatus {
  return s === 'Operational' ? 'Approved' : s === 'Maintenance' ? 'Pending' : s === 'MajorOutage' ? 'Rejected' : 'SendBack'
}

function splitCsv(x: string) {
  return x
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function ServiceDrawer({
  row,
  tab,
  setTab,
  busy,
  onClose,
  onSave,
}: {
  row: Service
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  busy: boolean
  onClose: () => void
  onSave: (patch: Partial<Service>) => void
}) {
  const [status, setStatus] = useState<ServiceStatus>(row.status)
  const [owner, setOwner] = useState(row.owner)
  const [runbook, setRunbook] = useState(row.runbook)

  useEffect(() => {
    setStatus(row.status)
    setOwner(row.owner)
    setRunbook(row.runbook)
  }, [row])

  function save() {
    onSave({ status, owner, runbook })
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.name}</div>
            <div className="small">{row.id} • {row.region} • owner: {row.owner}</div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            Overview
          </button>
          <button className={`tab ${tab === 'metrics' ? 'active' : ''}`} onClick={() => setTab('metrics')}>
            Metrics
          </button>
          <button className={`tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
            Logs
          </button>
          <button className={`tab ${tab === 'runbook' ? 'active' : ''}`} onClick={() => setTab('runbook')}>
            Runbook
          </button>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'overview' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Service state</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label>
                  <div className="small">Status</div>
                  <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="Operational">Operational</option>
                    <option value="Degraded">Degraded</option>
                    <option value="PartialOutage">PartialOutage</option>
                    <option value="MajorOutage">MajorOutage</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>
                <label>
                  <div className="small">Owner</div>
                  <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
                </label>
                <div className="panel">Backend: write status updates to public status page + internal notifications.</div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Current signals</div>
              <div className="grid">
                <div className="panel">p95: {row.p95Ms}ms</div>
                <div className="panel">error rate: {row.errRate.toFixed(1)}%</div>
                <div className="panel">queue backlog: {row.queueBacklog}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">Last deploy: {row.lastDeploy}</div>
            </div>
          </div>
        ) : tab === 'metrics' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Metrics (placeholder)</div>
              <div className="panel">Embed charts: latency, error rate, throughput, queue depth. Link to Grafana/Datadog.</div>
              <div style={{ height: 10 }} />
              <Sparkline label="Latency (p95)" points={[12, 14, 18, 28, 26, 22, 21, 24, 20, 19]} />
              <div style={{ height: 10 }} />
              <Sparkline label="Error rate" points={[1, 1, 2, 4, 3, 2, 1, 1, 2, 2]} />
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">SLO (placeholder)</div>
              <div className="panel">Define SLO per region and calculate error budget burn.</div>
            </div>
          </div>
        ) : tab === 'logs' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Recent logs (placeholder)</div>
              <div className="panel">Connect to log store. Provide filters: request id, station id, user id, charger serial.</div>
              <div style={{ height: 10 }} />
              <div className="panel" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                {`2025-12-24T09:30:11Z WARN queueLag=5600 service=payments-webhooks region=AFRICA\n`}
                {`2025-12-24T09:31:52Z ERROR webhookTimeout provider=MM service=payments-webhooks\n`}
                {`2025-12-24T09:33:03Z INFO retryScheduled count=2400\n`}
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Quick actions (placeholder)</div>
              <div className="grid">
                <button className="btn secondary" onClick={() => alert('Placeholder: drain queue')}>Drain queue</button>
                <button className="btn secondary" onClick={() => alert('Placeholder: scale workers')}>Scale workers</button>
                <button className="btn secondary" onClick={() => alert('Placeholder: pause webhooks')}>Pause intake</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Runbook</div>
              <label>
                <div className="small">Steps</div>
                <textarea className="textarea" value={runbook} onChange={(e) => setRunbook(e.target.value)} />
              </label>
              <div style={{ height: 10 }} />
              <div className="panel">Backend: link to docs, escalation contacts, and incident templates.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Escalation (placeholder)</div>
              <div className="panel">Oncall: +256… • Channel: #ops-oncall • Operator EA: operator@evzone.app</div>
            </div>
          </div>
        )}

        <div style={{ height: 12 }} />
        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Sparkline({ label, points }: { label: string; points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const w = 320
  const h = 70
  const pad = 6
  const d = points
    .map((p, i) => {
      const x = pad + (i * (w - pad * 2)) / (points.length - 1)
      const y = pad + (1 - (p - min) / (max - min || 1)) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <div className="panel">
      <div className="small" style={{ marginBottom: 6 }}>{label}</div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      </svg>
      <div className="small" style={{ opacity: 0.8 }}>min {min} • max {max}</div>
    </div>
  )
}

function KpiCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'danger' | 'ok' }) {
  const toneClass = tone === 'danger' ? 'text-rose-200' : tone === 'ok' ? 'text-emerald-200' : 'text-muted'
  return (
    <Card className="flex flex-col gap-1.5">
      <p className="card-title mb-1.5">{label}</p>
      <p className="kpi-value">{value}</p>
      <p className={`text-xs m-0 ${toneClass}`}>{hint}</p>
    </Card>
  )
}

function CreateMaintenanceModal({ model, setModel, onSubmit }: { model: CreateMaintModal; setModel: (m: CreateMaintModal) => void; onSubmit: () => void }) {
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Schedule maintenance</div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            <div className="small">Title</div>
            <input className="input" value={model.title} onChange={(e) => setModel({ ...model, title: e.target.value })} />
          </label>
          <label>
            <div className="small">Region</div>
            <select className="select" value={model.region} onChange={(e) => setModel({ ...model, region: e.target.value as any })}>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div className="small">Services (comma-separated)</div>
            <input className="input" value={model.services} onChange={(e) => setModel({ ...model, services: e.target.value })} />
          </label>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Start (text)</div>
              <input className="input" value={model.startAt} onChange={(e) => setModel({ ...model, startAt: e.target.value })} />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">End (text)</div>
              <input className="input" value={model.endAt} onChange={(e) => setModel({ ...model, endAt: e.target.value })} />
            </label>
          </div>

          <label>
            <div className="small">Notes</div>
            <textarea className="textarea" value={model.notes} onChange={(e) => setModel({ ...model, notes: e.target.value })} />
          </label>

          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={model.publish} onChange={(e) => setModel({ ...model, publish: e.target.checked })} />
            <span><strong>Publish</strong> to status page / in-app banner (demo)</span>
          </label>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Cancel
          </button>
          <button className="btn" onClick={onSubmit}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

function nowStampMinus(mins: number) {
  const d = new Date()
  d.setMinutes(d.getMinutes() - mins)
  return stamp(d)
}
function nowStampPlus(mins: number) {
  const d = new Date()
  d.setMinutes(d.getMinutes() + mins)
  return stamp(d)
}
function stamp(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
