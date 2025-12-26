import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type Format = 'CSV' | 'XLSX' | 'JSON'
type ExportKind = 'STATIONS' | 'SESSIONS' | 'TRANSACTIONS' | 'USERS' | 'INCIDENTS' | 'DISPATCHES' | 'AUDIT_LOGS'
type ExportStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
type ScheduleFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY'
type Delivery = 'EMAIL' | 'S3' | 'WEBHOOK'

type ExportJob = {
  id: string
  requestedAt: string
  requestedBy: string
  role: string
  region: Region
  org?: string
  station?: string
  kind: ExportKind
  format: Format
  range: string
  status: ExportStatus
  sensitive: boolean
  reason?: string
  fileSizeMb?: number
  expiresAt?: string
}

type ReportTemplate = {
  id: string
  name: string
  description: string
  kind: ExportKind
  defaultFormat: Format
  defaultRange: string
  containsPII: boolean
}

type ScheduledReport = {
  id: string
  name: string
  templateId: string
  region: Region
  org?: string
  station?: string
  frequency: ScheduleFreq
  delivery: Delivery
  destination: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const seedTemplates: ReportTemplate[] = [
  { id: 'TPL-REV', name: 'Revenue Summary', description: 'Transactions grouped by org/station, fees, net.', kind: 'TRANSACTIONS', defaultFormat: 'CSV', defaultRange: 'Last 30 days', containsPII: false },
  { id: 'TPL-SESS', name: 'Sessions Detail', description: 'Charge/Swap sessions with station telemetry refs.', kind: 'SESSIONS', defaultFormat: 'XLSX', defaultRange: 'Last 7 days', containsPII: true },
  { id: 'TPL-AUD', name: 'Audit Export', description: 'Immutable audit events for compliance.', kind: 'AUDIT_LOGS', defaultFormat: 'JSON', defaultRange: 'Last 30 days', containsPII: true },
  { id: 'TPL-OPS', name: 'Operational Incidents', description: 'Incidents & dispatches overview.', kind: 'INCIDENTS', defaultFormat: 'CSV', defaultRange: 'Last 30 days', containsPII: false },
]

const seedExports: ExportJob[] = [
  { id: 'EXP-22019', requestedAt: '2025-12-24 10:30', requestedBy: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN', region: 'AFRICA', org: 'VOLT_MOBILITY', kind: 'TRANSACTIONS', format: 'CSV', range: '2025-11-24 → 2025-12-24', status: 'COMPLETED', sensitive: false, fileSizeMb: 2.1, expiresAt: '2025-12-31 23:59' },
  { id: 'EXP-22012', requestedAt: '2025-12-24 09:55', requestedBy: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN', region: 'EUROPE', kind: 'AUDIT_LOGS', format: 'JSON', range: '2025-12-01 → 2025-12-24', status: 'RUNNING', sensitive: true, reason: 'Compliance quarterly review', expiresAt: '2025-12-26 23:59' },
  { id: 'EXP-21988', requestedAt: '2025-12-23 18:10', requestedBy: 'Operator EU', role: 'EVZONE_OPERATOR', region: 'EUROPE', org: 'MALL_HOLDINGS', station: 'ST-1011', kind: 'SESSIONS', format: 'XLSX', range: '2025-12-16 → 2025-12-23', status: 'FAILED', sensitive: true, reason: 'Owner request: sessions discrepancy', expiresAt: '2025-12-25 23:59' },
  { id: 'EXP-21970', requestedAt: '2025-12-22 12:01', requestedBy: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN', region: 'AFRICA', kind: 'USERS', format: 'CSV', range: 'All time', status: 'EXPIRED', sensitive: true, reason: 'Investigate onboarding duplicates', fileSizeMb: 0.9, expiresAt: '2025-12-23 12:01' },
]

const seedSchedules: ScheduledReport[] = [
  { id: 'SCH-110', name: 'Daily Revenue – Africa', templateId: 'TPL-REV', region: 'AFRICA', frequency: 'DAILY', delivery: 'EMAIL', destination: 'finance-africa@evzone.app', enabled: true, lastRun: '2025-12-24 07:00', nextRun: '2025-12-25 07:00' },
  { id: 'SCH-105', name: 'Weekly Audit Snapshot – EU', templateId: 'TPL-AUD', region: 'EUROPE', frequency: 'WEEKLY', delivery: 'S3', destination: 's3://evzone-compliance/eu/audit/', enabled: true, lastRun: '2025-12-22 06:00', nextRun: '2025-12-29 06:00' },
]

async function apiLoad() {
  await new Promise((r) => setTimeout(r, 120))
  return { templates: seedTemplates, exports: seedExports, schedules: seedSchedules }
}

type Tab = 'overview' | 'exports' | 'templates' | 'scheduled'
type CreateExportModel = {
  open: boolean
  templateId: string
  region: Region
  org: string
  station: string
  format: Format
  range: string
  includePII: boolean
  reason: string
}
type CreateScheduleModel = {
  open: boolean
  name: string
  templateId: string
  region: Region
  org: string
  station: string
  frequency: ScheduleFreq
  delivery: Delivery
  destination: string
  enabled: boolean
}

export function AdminReportsExportsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [region, setRegion] = useState<Region>('ALL')
  const [q, setQ] = useState('')
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [exports, setExports] = useState<ExportJob[]>([])
  const [schedules, setSchedules] = useState<ScheduledReport[]>([])
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState<CreateExportModel>({
    open: false,
    templateId: 'TPL-REV',
    region: 'AFRICA',
    org: '',
    station: '',
    format: 'CSV',
    range: 'Last 30 days',
    includePII: false,
    reason: '',
  })
  const [schModal, setSchModal] = useState<CreateScheduleModel>({
    open: false,
    name: '',
    templateId: 'TPL-REV',
    region: 'AFRICA',
    org: '',
    station: '',
    frequency: 'DAILY',
    delivery: 'EMAIL',
    destination: 'reports@evzone.app',
    enabled: true,
  })

  useEffect(() => {
    void (async () => {
      const x = await apiLoad()
      setTemplates(x.templates)
      setExports(x.exports)
      setSchedules(x.schedules)
    })()
  }, [])

  const filteredExports = useMemo(() => {
    return exports.filter((e) => {
      const okR = region === 'ALL' || e.region === region || e.region === 'ALL'
      const hay = (e.id + ' ' + e.requestedBy + ' ' + e.role + ' ' + e.kind + ' ' + (e.org ?? '') + ' ' + (e.station ?? '') + ' ' + e.status).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okQ
    })
  }, [exports, region, q])

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const okR = region === 'ALL' || s.region === region || s.region === 'ALL'
      const hay = (s.id + ' ' + s.name + ' ' + s.frequency + ' ' + s.delivery + ' ' + s.destination + ' ' + (s.org ?? '') + ' ' + (s.station ?? '')).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okQ
    })
  }, [schedules, region, q])

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const okQ = !q || (t.id + ' ' + t.name + ' ' + t.kind + ' ' + t.description).toLowerCase().includes(q.toLowerCase())
      return okQ
    })
  }, [templates, q])

  const kpi = useMemo(() => {
    const totalExports = filteredExports.length
    const completed = filteredExports.filter((e) => e.status === 'COMPLETED').length
    const running = filteredExports.filter((e) => e.status === 'RUNNING' || e.status === 'QUEUED').length
    const failed = filteredExports.filter((e) => e.status === 'FAILED').length
    const sensitive = filteredExports.filter((e) => e.sensitive).length
    const schedEnabled = filteredSchedules.filter((s) => s.enabled).length
    return { totalExports, completed, running, failed, sensitive, schedEnabled }
  }, [filteredExports, filteredSchedules])

  function toastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 1500)
  }

  function createExport() {
    const tpl = templates.find((t) => t.id === modal.templateId)
    const id = 'EXP-' + Math.floor(20000 + Math.random() * 999)
    const job: ExportJob = {
      id,
      requestedAt: nowStamp(),
      requestedBy: 'Admin (Helpdesk)',
      role: 'EVZONE_ADMIN',
      region: modal.region,
      org: modal.org || undefined,
      station: modal.station || undefined,
      kind: (tpl?.kind ?? 'OTHER') as ExportKind,
      format: modal.format,
      range: modal.range,
      status: 'QUEUED',
      sensitive: (tpl?.containsPII ?? false) || modal.includePII,
      reason: modal.reason || undefined,
      expiresAt: plusDays(2),
    }
    setExports((list) => [job, ...list])
    setModal((m) => ({ ...m, open: false, org: '', station: '', reason: '' }))
    toastMsg('Export queued (demo).')
  }

  function createSchedule() {
    const id = 'SCH-' + Math.floor(100 + Math.random() * 900)
    const s: ScheduledReport = {
      id,
      name: schModal.name || 'Scheduled report',
      templateId: schModal.templateId,
      region: schModal.region,
      org: schModal.org || undefined,
      station: schModal.station || undefined,
      frequency: schModal.frequency,
      delivery: schModal.delivery,
      destination: schModal.destination,
      enabled: schModal.enabled,
      nextRun: 'Next run: backend-calculated',
    }
    setSchedules((list) => [s, ...list])
    setSchModal((m) => ({ ...m, open: false, name: '', org: '', station: '' }))
    toastMsg('Schedule created (demo).')
  }

  return (
    <DashboardLayout pageTitle="Data Exports & Reporting">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search exports / schedules / templates" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={() => setSchModal((m) => ({ ...m, open: true }))}>Schedule report</button>
          <button className="btn" onClick={() => setModal((m) => ({ ...m, open: true }))}>Create export</button>
        </div>

        <div style={{ height: 12 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab ${tab === 'exports' ? 'active' : ''}`} onClick={() => setTab('exports')}>Exports</button>
          <button className={`tab ${tab === 'scheduled' ? 'active' : ''}`} onClick={() => setTab('scheduled')}>Scheduled</button>
          <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>Templates</button>
        </div>

        <div style={{ height: 12 }} />

        <div className="kpi-grid">
          <Kpi label="Exports" value={String(kpi.totalExports)} hint="Filtered by region/search" />
          <Kpi label="Completed" value={String(kpi.completed)} hint="Ready to download" />
          <Kpi label="Running/Queued" value={String(kpi.running)} hint="In progress" tone={kpi.running ? 'warn' : 'ok'} />
          <Kpi label="Failed" value={String(kpi.failed)} hint="Needs action" tone={kpi.failed ? 'danger' : 'ok'} />
          <Kpi label="Sensitive exports" value={String(kpi.sensitive)} hint="PII / audit / overrides" />
          <Kpi label="Enabled schedules" value={String(kpi.schedEnabled)} hint="Automated reporting" />
        </div>
      </div>

      <div style={{ height: 12 }} />

      {tab === 'overview' ? (
        <div className="row2">
          <div className="card">
            <div className="card-title">Quick reports (placeholders)</div>
            <div className="grid">
              <div className="panel">Daily revenue by region (connect to Billing ledger).</div>
              <div className="panel">Session utilization (charger uptime, swap bay cycles).</div>
              <div className="panel">Incidents & MTTR (connect to Incidents).</div>
              <div className="panel">Onboarding funnel (connect to Users & Roles).</div>
            </div>
            <div style={{ height: 10 }} />
            <div className="panel">Backend: these can become downloadable PDFs or dashboard charts.</div>
          </div>
          <div className="card">
            <div className="card-title">Compliance guardrails</div>
            <div className="grid">
              <div className="panel"><strong>Export RBAC</strong>: restrict by role/region/org; require elevated permission for PII.</div>
              <div className="panel"><strong>Reason required</strong>: for sensitive exports; attach ticket id.</div>
              <div className="panel"><strong>Watermark</strong>: include exporter + timestamp in file header/footer.</div>
              <div className="panel"><strong>Short expiry</strong>: auto-expire links; re-download requires re-auth.</div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'exports' ? (
        <ExportsTable rows={filteredExports} onToast={toastMsg} onSetExports={setExports} />
      ) : null}

      {tab === 'scheduled' ? (
        <SchedulesTable rows={filteredSchedules} templates={templates} onSetSchedules={setSchedules} />
      ) : null}

      {tab === 'templates' ? (
        <TemplatesTable rows={filteredTemplates} />
      ) : null}

      {toast ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="small">{toast}</div>
        </div>
      ) : null}

      {modal.open ? (
        <CreateExportModal model={modal} setModel={setModal} templates={templates} onSubmit={createExport} />
      ) : null}
      {schModal.open ? (
        <CreateScheduleModal model={schModal} setModel={setSchModal} templates={templates} onSubmit={createSchedule} />
      ) : null}
    </DashboardLayout>
  )
}

function ExportsTable({
  rows,
  onToast,
  onSetExports,
}: {
  rows: ExportJob[]
  onToast: (m: string) => void
  onSetExports: (fn: (prev: ExportJob[]) => ExportJob[]) => void
}) {
  return (
    <div className="card">
      <div className="card-title">Export jobs</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Requested</th>
              <th>By</th>
              <th>Kind</th>
              <th>Scope</th>
              <th>Format</th>
              <th>Status</th>
              <th>Sensitive</th>
              <th>Expires</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 900 }}>{e.id}</td>
                <td className="small">{e.requestedAt}</td>
                <td className="small">
                  <div style={{ fontWeight: 800 }}>{e.requestedBy}</div>
                  <div className="small">{e.role}</div>
                </td>
                <td className="small">{e.kind}</td>
                <td className="small">
                  <div>{e.region}</div>
                  <div>{e.org ?? '—'} • {e.station ?? '—'}</div>
                </td>
                <td className="small">{e.format}</td>
                <td><StatusPill status={e.status} /></td>
                <td>{e.sensitive ? <span className="pill sendback">Yes</span> : <span className="pill approved">No</span>}</td>
                <td className="small">{e.expiresAt ?? '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        if (e.status !== 'COMPLETED') return onToast('Not ready yet (demo).')
                        onToast('Download started (demo).')
                      }}
                      disabled={e.status !== 'COMPLETED'}
                    >
                      Download
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        onSetExports((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: 'QUEUED' } : x)))
                        onToast('Re-run queued (demo).')
                      }}
                      disabled={e.status === 'RUNNING'}
                    >
                      Re-run
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        onSetExports((prev) => prev.filter((x) => x.id !== e.id))
                        onToast('Removed (demo).')
                      }}
                    >
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
      <div className="panel">Backend: async job queue, signed URLs, streaming exports, and audit log entries for each export.</div>
    </div>
  )
}

function SchedulesTable({
  rows,
  templates,
  onSetSchedules,
}: {
  rows: ScheduledReport[]
  templates: ReportTemplate[]
  onSetSchedules: (fn: (prev: ScheduledReport[]) => ScheduledReport[]) => void
}) {
  const nameByTpl = useMemo(() => Object.fromEntries(templates.map((t) => [t.id, t.name])), [templates])
  return (
    <div className="card">
      <div className="card-title">Scheduled reports</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Template</th>
              <th>Scope</th>
              <th>Frequency</th>
              <th>Delivery</th>
              <th>Destination</th>
              <th>Enabled</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 900 }}>{s.id}</td>
                <td>
                  <div style={{ fontWeight: 800 }}>{s.name}</div>
                  <div className="small">last: {s.lastRun ?? '—'} • next: {s.nextRun ?? '—'}</div>
                </td>
                <td className="small">{nameByTpl[s.templateId] ?? s.templateId}</td>
                <td className="small">
                  <div>{s.region}</div>
                  <div>{s.org ?? '—'} • {s.station ?? '—'}</div>
                </td>
                <td className="small">{s.frequency}</td>
                <td className="small">{s.delivery}</td>
                <td className="small">{s.destination}</td>
                <td>{s.enabled ? <span className="pill approved">Yes</span> : <span className="pill pending">No</span>}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      className="btn secondary"
                      onClick={() => onSetSchedules((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))}
                    >
                      {s.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn secondary" onClick={() => alert('Placeholder: edit schedule')}>
                      Edit
                    </button>
                    <button className="btn secondary" onClick={() => onSetSchedules((prev) => prev.filter((x) => x.id !== s.id))}>
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
      <div className="panel">Backend: cron/scheduler, delivery retries, and per-recipient access controls.</div>
    </div>
  )
}

function TemplatesTable({ rows }: { rows: ReportTemplate[] }) {
  return (
    <div className="card">
      <div className="card-title">Report templates</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Kind</th>
              <th>Default</th>
              <th>PII</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 900 }}>{t.id}</td>
                <td>
                  <div style={{ fontWeight: 800 }}>{t.name}</div>
                  <div className="small">{t.defaultRange} • {t.defaultFormat}</div>
                </td>
                <td className="small">{t.kind}</td>
                <td className="small">{t.defaultRange}</td>
                <td>{t.containsPII ? <span className="pill sendback">Yes</span> : <span className="pill approved">No</span>}</td>
                <td className="small">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 10 }} />
      <div className="panel">Backend: templates map to query presets + columns + masking rules per role.</div>
    </div>
  )
}

function StatusPill({ status }: { status: ExportStatus }) {
  const cls = status === 'COMPLETED' ? 'approved' : status === 'FAILED' ? 'rejected' : status === 'EXPIRED' ? 'sendback' : 'pending'
  return <span className={`pill ${cls}`}>{status}</span>
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'danger' | 'ok' | 'warn' }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn, #f6c343)' : undefined
  return (
    <div className="kpi">
      <div className="small" style={{ opacity: 0.85 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 22 }}>{value}</div>
      <div className="small" style={{ color }}>{hint}</div>
    </div>
  )
}

function CreateExportModal({
  model,
  setModel,
  templates,
  onSubmit,
}: {
  model: CreateExportModel
  setModel: (m: CreateExportModel) => void
  templates: ReportTemplate[]
  onSubmit: () => void
}) {
  const tpl = templates.find((t) => t.id === model.templateId)
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Create export</div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>Close</button>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            <div className="small">Template</div>
            <select className="select" value={model.templateId} onChange={(e) => {
              const id = e.target.value
              const t = templates.find((x) => x.id === id)
              setModel({ ...model, templateId: id, format: t?.defaultFormat ?? model.format, range: t?.defaultRange ?? model.range, includePII: t?.containsPII ?? model.includePII })
            }}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="small" style={{ opacity: .8 }}>{tpl?.description}</div>
          </label>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Region</div>
              <select className="select" value={model.region} onChange={(e) => setModel({ ...model, region: e.target.value as any })}>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Format</div>
              <select className="select" value={model.format} onChange={(e) => setModel({ ...model, format: e.target.value as any })}>
                <option value="CSV">CSV</option>
                <option value="XLSX">XLSX</option>
                <option value="JSON">JSON</option>
              </select>
            </label>
          </div>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Org (optional)</div>
              <input className="input" value={model.org} onChange={(e) => setModel({ ...model, org: e.target.value })} placeholder="e.g., VOLT_MOBILITY" />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Station (optional)</div>
              <input className="input" value={model.station} onChange={(e) => setModel({ ...model, station: e.target.value })} placeholder="e.g., ST-0017" />
            </label>
          </div>

          <label>
            <div className="small">Date range</div>
            <input className="input" value={model.range} onChange={(e) => setModel({ ...model, range: e.target.value })} placeholder="e.g., 2025-12-01 → 2025-12-24" />
          </label>

          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={model.includePII} onChange={(e) => setModel({ ...model, includePII: e.target.checked })} />
            <span className="small">
              <strong>Include PII</strong> (requires elevated permission + will be audited)
            </span>
          </label>

          <label>
            <div className="small">Reason (required for sensitive exports)</div>
            <textarea className="textarea" value={model.reason} onChange={(e) => setModel({ ...model, reason: e.target.value })} placeholder="Ticket id + justification" />
          </label>

          <div className="panel">
            <div style={{ fontWeight: 900 }}>Notes</div>
            <div className="small">
              - Exports should create an <strong>audit log</strong> entry (who/what/why).<br />
              - Files should be <strong>signed URLs</strong> with short expiry.<br />
              - Sensitive exports should be <strong>watermarked</strong> + <strong>masked</strong> by default.
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>Cancel</button>
          <button
            className="btn"
            onClick={() => {
              const isSensitive = (tpl?.containsPII ?? false) || model.includePII
              if (isSensitive && !model.reason.trim()) {
                alert('Reason is required for sensitive exports (demo).')
                return
              }
              onSubmit()
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateScheduleModal({
  model,
  setModel,
  templates,
  onSubmit,
}: {
  model: CreateScheduleModel
  setModel: (m: CreateScheduleModel) => void
  templates: ReportTemplate[]
  onSubmit: () => void
}) {
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Schedule report</div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>Close</button>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            <div className="small">Name</div>
            <input className="input" value={model.name} onChange={(e) => setModel({ ...model, name: e.target.value })} placeholder="e.g., Daily Revenue – Africa" />
          </label>
          <label>
            <div className="small">Template</div>
            <select className="select" value={model.templateId} onChange={(e) => setModel({ ...model, templateId: e.target.value })}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Region</div>
              <select className="select" value={model.region} onChange={(e) => setModel({ ...model, region: e.target.value as any })}>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Frequency</div>
              <select className="select" value={model.frequency} onChange={(e) => setModel({ ...model, frequency: e.target.value as any })}>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </label>
          </div>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Org (optional)</div>
              <input className="input" value={model.org} onChange={(e) => setModel({ ...model, org: e.target.value })} placeholder="e.g., VOLT_MOBILITY" />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Station (optional)</div>
              <input className="input" value={model.station} onChange={(e) => setModel({ ...model, station: e.target.value })} placeholder="e.g., ST-0017" />
            </label>
          </div>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Delivery</div>
              <select className="select" value={model.delivery} onChange={(e) => setModel({ ...model, delivery: e.target.value as any })}>
                <option value="EMAIL">EMAIL</option>
                <option value="S3">S3</option>
                <option value="WEBHOOK">WEBHOOK</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Destination</div>
              <input className="input" value={model.destination} onChange={(e) => setModel({ ...model, destination: e.target.value })} placeholder="email or URL or bucket path" />
            </label>
          </div>

          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={model.enabled} onChange={(e) => setModel({ ...model, enabled: e.target.checked })} />
            <span className="small"><strong>Enabled</strong></span>
          </label>

          <div className="panel">
            <div style={{ fontWeight: 900 }}>Delivery notes</div>
            <div className="small">Backend should ensure recipients only receive data they’re allowed to see (RBAC + scope).</div>
          </div>
        </div>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>Cancel</button>
          <button className="btn" onClick={onSubmit}>Create</button>
        </div>
      </div>
    </div>
  )
}

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
function plusDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
