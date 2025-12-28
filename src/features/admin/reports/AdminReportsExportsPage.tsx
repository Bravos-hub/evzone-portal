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

type QuickReport = {
  id: string
  title: string
  subtitle: string
  templateId: string
  hint: string
  kpi: { label: string; value: string; delta?: string }
  series: number[]
  tags: string[]
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
  const [guard, setGuard] = useState({
    watermark: true,
    expiryHours: 24,
    requireTicketForSensitive: true,
    requireReauth: true,
  })
  const [policy, setPolicy] = useState({
    role: 'EVZONE_ADMIN' as 'EVZONE_ADMIN' | 'EVZONE_OPERATOR',
    templateId: 'TPL-AUD',
    includePII: true,
    region: 'EUROPE' as Region,
    org: 'VOLT_MOBILITY',
  })
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

  function openQuick(templateId: string) {
    const t = templates.find((x) => x.id === templateId)
    setModal((m) => ({
      ...m,
      open: true,
      templateId,
      format: t?.defaultFormat ?? m.format,
      range: t?.defaultRange ?? m.range,
      includePII: t?.containsPII ?? false,
      reason: '',
      region,
      org: '',
      station: '',
    }))
  }

  function hasTicketId(reason: string) {
    return /TCK-\d{4,}/i.test(reason)
  }

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
    const isSensitive = (tpl?.containsPII ?? false) || modal.includePII
    if (isSensitive && guard.requireTicketForSensitive && !hasTicketId(modal.reason)) {
      toastMsg('Ticket id required for sensitive export (e.g., TCK-10021).')
      return
    }
    const id = 'EXP-' + Math.floor(20000 + Math.random() * 999)
    const job: ExportJob = {
      id,
      requestedAt: nowStamp(),
      requestedBy: policy.role === 'EVZONE_OPERATOR' ? 'Operator EU' : 'Admin (Helpdesk)',
      role: policy.role,
      region: modal.region,
      org: modal.org || undefined,
      station: modal.station || undefined,
      kind: (tpl?.kind ?? 'OTHER') as ExportKind,
      format: modal.format,
      range: modal.range,
      status: 'QUEUED',
      sensitive: isSensitive,
      reason: modal.reason || undefined,
      expiresAt: guard.expiryHours <= 24 ? plusDays(1) : plusDays(2),
    }
    setExports((list) => [job, ...list])
    setModal((m) => ({ ...m, open: false, org: '', station: '', reason: '' }))
    toastMsg(`Export queued (demo). ${isSensitive && guard.watermark ? 'Watermark enabled.' : ''} ${guard.requireReauth ? 'Re-auth required.' : ''}`)
    setTab('exports')
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
            <div className="card-title">Quick reports</div>
            <QuickReports region={region} templates={templates} exportsCount={exports.length} onGenerate={openQuick} />
          </div>
          <div className="card">
            <div className="card-title">Compliance guardrails</div>
            <Guardrails guard={guard} setGuard={setGuard} policy={policy} setPolicy={setPolicy} templates={templates} regions={regions} />
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

function Sparkline({ values }: { values: number[] }) {
  const w = 120
  const h = 28
  const pad = 2
  const min = Math.min(...values)
  const max = Math.max(...values)
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min))
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1)
    const y = pad + (1 - norm(v)) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={pts.join(' ')} fill="none" stroke="rgba(122,162,255,.9)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function QuickReports({
  region,
  templates,
  exportsCount,
  onGenerate,
}: {
  region: Region
  templates: ReportTemplate[]
  exportsCount: number
  onGenerate: (templateId: string) => void
}) {
  const byId = useMemo(() => Object.fromEntries(templates.map((t) => [t.id, t])), [templates])
  const reports: QuickReport[] = useMemo(() => {
    const revenue = {
      id: 'QR-REV',
      title: 'Daily revenue by region',
      subtitle: region === 'ALL' ? 'Global ledger rollup (mock)' : `${region} ledger rollup (mock)`,
      templateId: 'TPL-REV',
      hint: 'Transactions grouped by org/station, fees, net',
      kpi: { label: 'Net revenue', value: region === 'EUROPE' ? '$128,440' : '$92,180', delta: '+6.2% WoW' },
      series: [42, 44, 41, 48, 55, 53, 57],
      tags: ['billing', 'ledger', 'finance'],
    }

    const utilization = {
      id: 'QR-UTIL',
      title: 'Session utilization',
      subtitle: 'Uptime + cycles (mock telemetry)',
      templateId: 'TPL-SESS',
      hint: 'Charger uptime, swap bay cycles, peak utilization',
      kpi: { label: 'Utilization', value: '71%', delta: '+3% vs last week' },
      series: [63, 64, 66, 68, 71, 70, 71],
      tags: ['sessions', 'uptime', 'capacity'],
    }

    const incidents = {
      id: 'QR-OPS',
      title: 'Incidents & MTTR',
      subtitle: 'Reliability summary (mock)',
      templateId: 'TPL-OPS',
      hint: 'Active incidents, MTTR by severity, dispatch correlation',
      kpi: { label: 'MTTR', value: '1h 42m', delta: '-11m (30d)' },
      series: [128, 120, 118, 110, 108, 104, 102],
      tags: ['incidents', 'mttr', 'reliability'],
    }

    const onboarding = {
      id: 'QR-AUD',
      title: 'Onboarding funnel',
      subtitle: 'Approvals + drop-off (mock)',
      templateId: 'TPL-AUD',
      hint: 'Pending → approved → activated; audit for escalations',
      kpi: { label: 'Pending', value: '23', delta: '-4 today' },
      series: [31, 30, 28, 27, 25, 24, 23],
      tags: ['users', 'approvals', 'audit'],
    }

    return [revenue, utilization, incidents, onboarding]
  }, [region])

  return (
    <div className="grid gap-3">
      {reports.map((r) => (
        <div key={r.id} className="panel">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-extrabold text-text">
                {r.title}{' '}
                <span className="text-xs text-muted font-semibold">
                  • template {byId[r.templateId]?.name ?? r.templateId}
                </span>
              </div>
              <div className="text-xs text-muted">{r.subtitle}</div>
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="pill pending">
                  {r.kpi.label}: {r.kpi.value}
                </span>
                {r.kpi.delta ? <span className="pill approved">{r.kpi.delta}</span> : null}
                <span className="pill pending">Exports generated: {exportsCount}</span>
              </div>
              <div className="mt-2 text-xs text-muted">{r.hint}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.tags.map((t) => (
                  <span key={t} className="pill pending">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkline values={r.series} />
              <button className="btn" onClick={() => onGenerate(r.templateId)}>
                Generate export
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="panel">Backend: these can become downloadable PDFs or dashboard charts; exports stay auditable with signed URLs.</div>
    </div>
  )
}

function Guardrails({
  guard,
  setGuard,
  policy,
  setPolicy,
  templates,
  regions,
}: {
  guard: { watermark: boolean; expiryHours: number; requireTicketForSensitive: boolean; requireReauth: boolean }
  setGuard: (v: { watermark: boolean; expiryHours: number; requireTicketForSensitive: boolean; requireReauth: boolean }) => void
  policy: { role: 'EVZONE_ADMIN' | 'EVZONE_OPERATOR'; templateId: string; includePII: boolean; region: Region; org: string }
  setPolicy: (v: { role: 'EVZONE_ADMIN' | 'EVZONE_OPERATOR'; templateId: string; includePII: boolean; region: Region; org: string }) => void
  templates: ReportTemplate[]
  regions: Array<{ id: Region; label: string }>
}) {
  const tpl = templates.find((t) => t.id === policy.templateId)
  const sensitive = (tpl?.containsPII ?? false) || policy.includePII
  const roleOkForPII = policy.role === 'EVZONE_ADMIN'
  const allowed = !sensitive || roleOkForPII
  const expiryLabel = guard.expiryHours <= 24 ? '24h' : '48h'

  return (
    <div className="grid gap-3">
      <div className="panel">
        <div className="text-sm font-extrabold text-text">Policy simulator</div>
        <div className="text-xs text-muted">This is mocked but mirrors real RBAC + scope + compliance checks.</div>
        <div style={{ height: 10 }} />
        <div className="split">
          <label style={{ flex: 1 }}>
            <div className="small">Role</div>
            <select className="select" value={policy.role} onChange={(e) => setPolicy({ ...policy, role: e.target.value as any })}>
              <option value="EVZONE_ADMIN">EVZONE_ADMIN</option>
              <option value="EVZONE_OPERATOR">EVZONE_OPERATOR</option>
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <div className="small">Template</div>
            <select className="select" value={policy.templateId} onChange={(e) => setPolicy({ ...policy, templateId: e.target.value })}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ height: 10 }} />
        <div className="split">
          <label style={{ flex: 1 }}>
            <div className="small">Region</div>
            <select className="select" value={policy.region} onChange={(e) => setPolicy({ ...policy, region: e.target.value as any })}>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <div className="small">Org (optional)</div>
            <input className="input" value={policy.org} onChange={(e) => setPolicy({ ...policy, org: e.target.value })} placeholder="e.g., VOLT_MOBILITY" />
          </label>
        </div>
        <div style={{ height: 10 }} />
        <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
          <input type="checkbox" checked={policy.includePII} onChange={(e) => setPolicy({ ...policy, includePII: e.target.checked })} />
          <span className="small">
            <strong>Include PII</strong> (sensitive export)
          </span>
        </label>
        <div style={{ height: 10 }} />
        <div className="panel">
          <div className="text-xs text-muted">Evaluation</div>
          <div style={{ height: 6 }} />
          <div className="flex items-center justify-between">
            <span className="small">Allowed</span>
            <span className={`pill ${allowed ? 'approved' : 'rejected'}`}>{allowed ? 'ALLOW' : 'BLOCK'}</span>
          </div>
          <div style={{ height: 6 }} />
          <div className="small">
            - RBAC: {sensitive ? (roleOkForPII ? 'PII allowed for admin' : 'PII blocked for operator') : 'Non-sensitive export'}<br />
            - Reason: {sensitive && guard.requireTicketForSensitive ? 'Ticket id required' : 'Not required'}<br />
            - Watermark: {guard.watermark && sensitive ? 'Enabled' : 'Off'}<br />
            - Expiry: {expiryLabel} • {guard.requireReauth ? 'Re-auth on download' : 'No re-auth'}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="text-sm font-extrabold text-text">Guardrails</div>
        <div className="grid gap-2">
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={guard.watermark} onChange={(e) => setGuard({ ...guard, watermark: e.target.checked })} />
            <span className="small">
              <strong>Watermark</strong>: include exporter + timestamp in header/footer
            </span>
          </label>
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={guard.requireTicketForSensitive} onChange={(e) => setGuard({ ...guard, requireTicketForSensitive: e.target.checked })} />
            <span className="small">
              <strong>Reason required</strong>: attach ticket id for sensitive exports
            </span>
          </label>
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={guard.requireReauth} onChange={(e) => setGuard({ ...guard, requireReauth: e.target.checked })} />
            <span className="small">
              <strong>Re-auth</strong>: re-download requires re-auth
            </span>
          </label>
          <div className="panel">
            <div className="small" style={{ fontWeight: 900 }}>Short expiry</div>
            <div className="small">Signed URLs expire automatically. Shorter expiry for sensitive exports.</div>
            <div style={{ height: 8 }} />
            <div className="split">
              <button className={`btn secondary ${guard.expiryHours === 24 ? 'ring-2 ring-accent/30' : ''}`} onClick={() => setGuard({ ...guard, expiryHours: 24 })}>
                24h
              </button>
              <button className={`btn secondary ${guard.expiryHours === 48 ? 'ring-2 ring-accent/30' : ''}`} onClick={() => setGuard({ ...guard, expiryHours: 48 })}>
                48h
              </button>
            </div>
          </div>
        </div>
      </div>
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
              if (isSensitive && !/TCK-\d{4,}/i.test(model.reason)) {
                alert('Include a ticket id for sensitive exports (e.g., TCK-10021).')
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
