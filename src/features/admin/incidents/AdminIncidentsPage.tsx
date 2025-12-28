import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'
type IncidentStatus = 'Investigating' | 'Identified' | 'Mitigating' | 'Monitoring' | 'Resolved'
type Impact = 'Charging' | 'Swapping' | 'Payments' | 'Auth' | 'Fleet' | 'Other'

type Incident = {
  id: string
  title: string
  status: IncidentStatus
  severity: Severity
  impact: Impact
  region: Region
  org: string | '—'
  stationIds: string[]
  ticketIds: string[]
  commander: string
  createdAt: string
  updatedAt: string
  summary: string
  nextUpdateAt: string
  affectedStationsCount: number
  eta: string
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const severities: Array<Severity | 'All'> = ['All', 'SEV1', 'SEV2', 'SEV3', 'SEV4']
const statuses: Array<IncidentStatus | 'All'> = ['All', 'Investigating', 'Identified', 'Mitigating', 'Monitoring', 'Resolved']
const impacts: Array<Impact | 'All'> = ['All', 'Charging', 'Swapping', 'Payments', 'Auth', 'Fleet', 'Other']

const commanders = ['Unassigned', 'Delta (Admin)', 'Operator EA', 'Support L2', 'SRE Oncall']

const seed: Incident[] = [
  {
    id: 'INC-2401',
    title: 'Mobile money confirmations delayed (wallet not updating)',
    status: 'Investigating',
    severity: 'SEV1',
    impact: 'Payments',
    region: 'AFRICA',
    org: '—',
    stationIds: [],
    ticketIds: ['TCK-10034'],
    commander: 'SRE Oncall',
    createdAt: '2025-12-24 09:25',
    updatedAt: '2025-12-24 09:42',
    summary: 'Spike in top-ups not reflecting. Suspected payment webhook delays.',
    nextUpdateAt: '2025-12-24 10:10',
    affectedStationsCount: 0,
    eta: 'Unknown',
  },
  {
    id: 'INC-2392',
    title: 'Charging sessions stuck at starting (EA region)',
    status: 'Mitigating',
    severity: 'SEV2',
    impact: 'Charging',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    stationIds: ['ST-0001', 'ST-0002', 'ST-0092'],
    ticketIds: ['TCK-10021'],
    commander: 'Operator EA',
    createdAt: '2025-12-20 10:30',
    updatedAt: '2025-12-24 08:59',
    summary: 'Partial outage affecting session state transitions. Rolling out config fix + charger reboot macro.',
    nextUpdateAt: '2025-12-24 11:00',
    affectedStationsCount: 3,
    eta: '2h',
  },
  {
    id: 'INC-2384',
    title: 'Swap bay door unlock failures (locker firmware)',
    status: 'Monitoring',
    severity: 'SEV2',
    impact: 'Swapping',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    stationIds: ['ST-0017'],
    ticketIds: ['TCK-10010'],
    commander: 'Support L2',
    createdAt: '2025-12-18 16:10',
    updatedAt: '2025-12-23 20:05',
    summary: 'Vendor patch applied to subset. Monitoring recurrence on bay #12.',
    nextUpdateAt: '2025-12-24 12:00',
    affectedStationsCount: 1,
    eta: '4h',
  },
]

async function apiList(): Promise<Incident[]> {
  await new Promise((r) => setTimeout(r, 150))
  return seed
}

async function apiUpdate(_id: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 220))
  return { ok: true }
}

function fmtPct(v: number) {
  return `${Math.round(v * 100)}%`
}

function fmtInt(v: number | undefined) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—'
  return v.toLocaleString()
}

function pillForCommsStatus(s: CommsStatus) {
  const cls = s === 'Sent' ? 'approved' : s === 'Scheduled' ? 'sendback' : 'pending'
  return <span className={`pill ${cls}`}>{s}</span>
}

function pillForMode(m: PlaybookMode) {
  const cls = m === 'Automated' ? 'approved' : 'pending'
  return <span className={`pill ${cls}`}>{m}</span>
}

type DrawerTab = 'timeline' | 'scope' | 'actions' | 'comms'
type CreateModal = {
  open: boolean
  title: string
  severity: Severity
  impact: Impact
  region: Region
  org: string
  stationIds: string
  ticketIds: string
  commander: string
  summary: string
}

type PlaybookMode = 'Automated' | 'Checklist'
type Playbook = {
  id: string
  domain: Impact
  title: string
  summary: string
  mode: PlaybookMode
  owner: string
  slaMins: number
  lastRunAt: string
  avgMins: number
  successRate: number // 0..1
  tags: string[]
}

type CommsStatus = 'Draft' | 'Scheduled' | 'Sent'
type CommsChannel = 'Status page' | 'Email' | 'SMS' | 'Ops'
type CommsItem = {
  id: string
  title: string
  channel: CommsChannel
  audience: string
  status: CommsStatus
  scheduledFor?: string
  lastSentAt?: string
  recipients?: number
  openRate?: number // 0..1
  owner: string
}

export function AdminIncidentsPage() {
  const [rows, setRows] = useState<Incident[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region>('ALL')
  const [status, setStatus] = useState<IncidentStatus | 'All'>('All')
  const [severity, setSeverity] = useState<Severity | 'All'>('All')
  const [impact, setImpact] = useState<Impact | 'All'>('All')
  const [commander, setCommander] = useState<string>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<DrawerTab>('timeline')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [toast, setToast] = useState<string>('')
  const [playbookOpen, setPlaybookOpen] = useState<Playbook | null>(null)
  const [commsPreview, setCommsPreview] = useState<CommsItem | null>(null)
  const [incidentComms, setIncidentComms] = useState<Record<string, string[]>>({})
  const [create, setCreate] = useState<CreateModal>({
    open: false,
    title: '',
    severity: 'SEV3',
    impact: 'Other',
    region: 'AFRICA',
    org: '',
    stationIds: '',
    ticketIds: '',
    commander: 'Unassigned',
    summary: '',
  })

  useEffect(() => {
    void (async () => setRows(await apiList()))()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const playbooks: Playbook[] = useMemo(
    () => [
      {
        id: 'PB-PAY-001',
        domain: 'Payments',
        title: 'Webhook delay triage + replay',
        summary: 'Detect queue backlog, replay failed webhooks, reconcile ledger deltas.',
        mode: 'Automated',
        owner: 'SRE Oncall',
        slaMins: 15,
        lastRunAt: 'Today 09:44',
        avgMins: 7,
        successRate: 0.92,
        tags: ['replay', 'reconciliation', 'rate-limit'],
      },
      {
        id: 'PB-CHG-014',
        domain: 'Charging',
        title: 'OCPP session “Starting” stuck fix',
        summary: 'Pull charger logs, remote reset, rollout config override to fleet subset.',
        mode: 'Checklist',
        owner: 'Operator EA',
        slaMins: 30,
        lastRunAt: 'Yesterday 21:06',
        avgMins: 18,
        successRate: 0.84,
        tags: ['ocpp', 'remote-reset', 'config'],
      },
      {
        id: 'PB-SWP-007',
        domain: 'Swapping',
        title: 'Locker bay override + firmware rollback',
        summary: 'Disable affected bay, apply rollback, manual override checklist for field tech.',
        mode: 'Checklist',
        owner: 'Support L2',
        slaMins: 45,
        lastRunAt: 'Today 07:12',
        avgMins: 22,
        successRate: 0.78,
        tags: ['firmware', 'bay-disable', 'override'],
      },
      {
        id: 'PB-AUTH-003',
        domain: 'Auth',
        title: 'Login spike investigation',
        summary: 'Check IdP latency, throttle abusive IPs, validate OTP provider health.',
        mode: 'Automated',
        owner: 'SRE Oncall',
        slaMins: 20,
        lastRunAt: '2025-12-22 18:40',
        avgMins: 9,
        successRate: 0.89,
        tags: ['idp', 'otp', 'rate-limit'],
      },
    ],
    [],
  )

  const [comms, setComms] = useState<CommsItem[]>([
    {
      id: 'COM-001',
      title: 'Public incident update — payments delays',
      channel: 'Status page',
      audience: 'All users',
      status: 'Scheduled',
      scheduledFor: 'Today 10:10',
      owner: 'Delta (Admin)',
    },
    {
      id: 'COM-002',
      title: 'Ops channel notify — charging mitigation steps',
      channel: 'Ops',
      audience: '#ops-oncall',
      status: 'Sent',
      lastSentAt: 'Today 09:03',
      owner: 'Operator EA',
    },
    {
      id: 'COM-003',
      title: 'Customer email — service advisory (EA)',
      channel: 'Email',
      audience: 'Region: AFRICA • Operators',
      status: 'Draft',
      recipients: 184,
      openRate: 0.61,
      owner: 'Support L2',
    },
    {
      id: 'COM-004',
      title: 'SMS advisory — swap bay interruptions',
      channel: 'SMS',
      audience: 'Station admins (AFRICA)',
      status: 'Sent',
      lastSentAt: 'Yesterday 20:14',
      recipients: 96,
      openRate: 0.88,
      owner: 'Support L2',
    },
  ])

  const filtered = useMemo(() => {
    return rows.filter((i) => {
      const hay = (i.id + ' ' + i.title + ' ' + i.summary + ' ' + i.org + ' ' + i.stationIds.join(' ') + ' ' + i.ticketIds.join(' ')).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      const okR = region === 'ALL' || i.region === region
      const okS = status === 'All' || i.status === status
      const okSev = severity === 'All' || i.severity === severity
      const okImp = impact === 'All' || i.impact === impact
      const okC = commander === 'All' || i.commander === commander
      return okQ && okR && okS && okSev && okImp && okC
    })
  }, [rows, q, region, status, severity, impact, commander])

  const kpi = useMemo(() => {
    const total = filtered.length
    const active = filtered.filter((x) => x.status !== 'Resolved').length
    const sev1 = filtered.filter((x) => x.severity === 'SEV1' && x.status !== 'Resolved').length
    const sev2 = filtered.filter((x) => x.severity === 'SEV2' && x.status !== 'Resolved').length
    const charging = filtered.filter((x) => x.impact === 'Charging' && x.status !== 'Resolved').length
    const swapping = filtered.filter((x) => x.impact === 'Swapping' && x.status !== 'Resolved').length
    return { total, active, sev1, sev2, charging, swapping }
  }, [filtered])

  const openRow = rows.find((r) => r.id === openId) ?? null

  async function saveIncident(patch: Partial<Incident>) {
    if (!openRow) return
    setBusy(true)
    setNotice('')
    try {
      await apiUpdate(openRow.id)
      setRows((list) => list.map((x) => (x.id === openRow.id ? { ...x, ...patch, updatedAt: nowStamp() } : x)))
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function resetFilters() {
    setQ('')
    setRegion('ALL')
    setStatus('All')
    setSeverity('All')
    setImpact('All')
    setCommander('All')
  }

  function runPlaybook(pb: Playbook) {
    const active = rows.find((x) => x.status !== 'Resolved') ?? null
    if (active) {
      const stamp = nowStamp()
      setRows((list) =>
        list.map((x) =>
          x.id === active.id
            ? {
                ...x,
                updatedAt: stamp,
                nextUpdateAt: nextUpdateStamp(),
                summary: `${x.summary}\n\n[${stamp}] Runbook queued: ${pb.title} (${pb.id}) • owner=${pb.owner}`,
              }
            : x,
        ),
      )
      setOpenId(active.id)
      setTab('actions')
    }
    setToast(`Queued: ${pb.title}${active ? ` • linked to ${active.id}` : ''}`)
  }

  function sendComms(id: string) {
    const active = rows.find((x) => x.status !== 'Resolved') ?? null
    setComms((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Sent',
              lastSentAt: 'now',
              scheduledFor: undefined,
            }
          : c,
      ),
    )
    if (active) {
      const stamp = nowStamp()
      setRows((list) =>
        list.map((x) =>
          x.id === active.id
            ? {
                ...x,
                updatedAt: stamp,
                nextUpdateAt: nextUpdateStamp(),
                summary: `${x.summary}\n\n[${stamp}] Comms sent: ${id} • channel update queued`,
              }
            : x,
        ),
      )
      setIncidentComms((m) => ({ ...m, [active.id]: Array.from(new Set([...(m[active.id] ?? []), id])) }))
      setOpenId(active.id)
      setTab('comms')
    }
    setToast('Comms sent (mock).')
  }

  return (
    <DashboardLayout pageTitle="Incidents">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search incident/title/org/station/ticket" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Status' : s}
              </option>
            ))}
          </select>
          <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as any)}>
            {severities.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Severity' : s}
              </option>
            ))}
          </select>
          <select className="select" value={impact} onChange={(e) => setImpact(e.target.value as any)}>
            {impacts.map((x) => (
              <option key={x} value={x}>
                {x === 'All' ? 'All Impact' : x}
              </option>
            ))}
          </select>
          <select className="select" value={commander} onChange={(e) => setCommander(e.target.value)}>
            <option value="All">All Commanders</option>
            {commanders.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={resetFilters}>
            Reset filters
          </button>
          <button className="btn" onClick={() => setCreate((m) => ({ ...m, open: true }))}>
            Declare incident
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="split">
          <span className="chip">
            <strong>{kpi.total}</strong> incidents
          </span>
          <span className="chip">
            <strong>{kpi.active}</strong> active
          </span>
          <span className="chip">
            <strong>{kpi.sev1}</strong> SEV1
          </span>
          <span className="chip">
            <strong>{kpi.sev2}</strong> SEV2
          </span>
          <span className="chip">
            <strong>{kpi.charging}</strong> charging impact
          </span>
          <span className="chip">
            <strong>{kpi.swapping}</strong> swapping impact
          </span>
          <div style={{ flex: 1 }} />
          <span className="small">Click an incident id for timeline + actions.</span>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Playbooks</div>
          <div className="grid">
            {playbooks.map((p) => (
              <div key={p.id} className="panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">
                      {p.title}{' '}
                      <span className="text-xs text-muted font-semibold">
                        • {p.domain} • {p.id}
                      </span>
                    </div>
                    <div className="text-xs text-muted">{p.summary}</div>
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      {pillForMode(p.mode)}
                      <span className="pill pending">SLA {p.slaMins}m</span>
                      <span className="pill approved">Success {fmtPct(p.successRate)}</span>
                      <span className="pill pending">Avg {p.avgMins}m</span>
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      Owner: <span className="text-text font-semibold">{p.owner}</span> • Last run:{' '}
                      <span className="text-text font-semibold">{p.lastRunAt}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="pill pending">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button className="btn secondary" onClick={() => setPlaybookOpen(p)}>
                      Open
                    </button>
                    <button className="btn" onClick={() => runPlaybook(p)}>
                      Run
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Comms</div>
          <div className="grid">
            {comms.map((c) => (
              <div key={c.id} className="panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">
                      {c.title}{' '}
                      <span className="text-xs text-muted font-semibold">
                        • {c.channel} • {c.id}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      {pillForCommsStatus(c.status)}
                      <span className="pill pending">Audience: {c.audience}</span>
                      {typeof c.recipients === 'number' ? <span className="pill pending">Recipients: {fmtInt(c.recipients)}</span> : null}
                      {typeof c.openRate === 'number' ? <span className="pill approved">Open: {fmtPct(c.openRate)}</span> : null}
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      Owner: <span className="text-text font-semibold">{c.owner}</span>
                      {c.status === 'Scheduled' && c.scheduledFor ? (
                        <>
                          {' '}
                          • Scheduled: <span className="text-text font-semibold">{c.scheduledFor}</span>
                        </>
                      ) : null}
                      {c.status === 'Sent' && c.lastSentAt ? (
                        <>
                          {' '}
                          • Sent: <span className="text-text font-semibold">{c.lastSentAt}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button className="btn secondary" onClick={() => setCommsPreview(c)}>
                      Preview
                    </button>
                    <button className="btn" disabled={c.status === 'Sent'} onClick={() => sendComms(c.id)}>
                      {c.status === 'Sent' ? 'Sent' : c.status === 'Scheduled' ? 'Send now' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Impact</th>
              <th>Region</th>
              <th>Org</th>
              <th>Stations</th>
              <th>Tickets</th>
              <th>Commander</th>
              <th>Next update</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 900 }}>
                  <button
                    className="btn secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => {
                      setOpenId(i.id)
                      setTab('timeline')
                    }}
                  >
                    {i.id}
                  </button>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{i.title}</div>
                  <div className="small">{i.summary}</div>
                </td>
                <td>
                  <StatusPill status={mapIncidentStatus(i.status)} />
                </td>
                <td>
                  <SeverityPill s={i.severity} />
                </td>
                <td>{i.impact}</td>
                <td>{i.region}</td>
                <td>{i.org}</td>
                <td className="small">{i.stationIds.length ? i.stationIds.length : '—'}</td>
                <td className="small">{i.ticketIds.length ? i.ticketIds.length : '—'}</td>
                <td className="small">{i.commander}</td>
                <td className="small">{i.nextUpdateAt}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn secondary" onClick={() => setRows((list) => list.map((x) => (x.id === i.id ? { ...x, status: 'Resolved' } : x)))}>
                      Resolve
                    </button>
                    <button className="btn secondary" onClick={() => setRows((list) => list.map((x) => (x.id === i.id ? { ...x, commander: 'Delta (Admin)' } : x)))}>
                      Take lead
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notice ? (
        <div className="card" style={{ marginTop: 12, borderColor: 'rgba(255,107,107,.25)' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 900 }}>Error</div>
          <div className="small">{notice}</div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action queued</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}

      {openRow ? (
        <IncidentDrawer
          row={openRow}
          tab={tab}
          setTab={setTab}
          busy={busy}
          onClose={() => setOpenId(null)}
          onSave={saveIncident}
          comms={comms}
          linkedCommsIds={incidentComms[openRow.id] ?? []}
          onPreviewComms={(id) => {
            const found = comms.find((x) => x.id === id) ?? null
            if (found) setCommsPreview(found)
          }}
          onSendComms={(id) => sendComms(id)}
        />
      ) : null}

      {playbookOpen ? (
        <PlaybookDrawer
          pb={playbookOpen}
          onClose={() => setPlaybookOpen(null)}
          onRun={() => {
            runPlaybook(playbookOpen)
            setPlaybookOpen(null)
          }}
          onCopy={async (text) => {
            try {
              await navigator.clipboard.writeText(text)
              setToast('Copied to clipboard.')
            } catch {
              setToast('Copy failed.')
            }
          }}
        />
      ) : null}

      {commsPreview ? (
        <CommsPreviewModal
          item={commsPreview}
          onClose={() => setCommsPreview(null)}
          onSendNow={() => {
            sendComms(commsPreview.id)
            setCommsPreview(null)
          }}
          onCopy={async (text) => {
            try {
              await navigator.clipboard.writeText(text)
              setToast('Copied to clipboard.')
            } catch {
              setToast('Copy failed.')
            }
          }}
        />
      ) : null}

      {create.open ? (
        <CreateIncidentModal
          model={create}
          setModel={setCreate}
          onSubmit={() => {
            const n: Incident = {
              id: 'INC-' + Math.floor(2000 + Math.random() * 9000),
              title: create.title || 'New incident',
              status: 'Investigating',
              severity: create.severity,
              impact: create.impact,
              region: create.region,
              org: create.org ? create.org : '—',
              stationIds: splitCsv(create.stationIds),
              ticketIds: splitCsv(create.ticketIds),
              commander: create.commander,
              createdAt: nowStamp(),
              updatedAt: nowStamp(),
              summary: create.summary || '—',
              nextUpdateAt: nextUpdateStamp(),
              affectedStationsCount: splitCsv(create.stationIds).length,
              eta: create.severity === 'SEV1' ? 'Unknown' : '2h',
            }
            setRows((list) => [n, ...list])
            setCreate((m) => ({ ...m, open: false, title: '', summary: '', stationIds: '', ticketIds: '' }))
          }}
        />
      ) : null}
    </DashboardLayout>
  )
}

function PlaybookDrawer({
  pb,
  onClose,
  onRun,
  onCopy,
}: {
  pb: Playbook
  onClose: () => void
  onRun: () => void
  onCopy: (text: string) => void | Promise<void>
}) {
  const steps = useMemo(() => {
    const common = ['Confirm impact scope', 'Assign owner + start timer', 'Collect logs + metrics', 'Apply mitigation', 'Verify recovery', 'Post update']
    if (pb.domain === 'Payments') return ['Check webhook backlog (queue depth)', 'Replay failed deliveries (bounded)', 'Reconcile ledger deltas', ...common]
    if (pb.domain === 'Charging') return ['Pull OCPP errors (last 30m)', 'Remote reset affected chargers', 'Rollout config to subset', ...common]
    if (pb.domain === 'Swapping') return ['Identify failing bays', 'Disable bay + manual override', 'Rollback firmware if needed', ...common]
    if (pb.domain === 'Auth') return ['Check IdP latency', 'Validate OTP provider health', 'Rate-limit abusive IPs', ...common]
    return common
  }, [pb])

  const checklist = `Playbook ${pb.id}: ${pb.title}\nOwner: ${pb.owner}\nSLA: ${pb.slaMins}m\n\nSteps:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 79 }} />
      <div className="drawer" style={{ zIndex: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{pb.title}</div>
            <div className="small">
              {pb.id} • {pb.domain} • owner: {pb.owner}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div className="card-title">Overview</div>
          <div className="panel">{pb.summary}</div>
          <div style={{ height: 10 }} />
          <div className="split">
            <span className="chip">
              Mode: <strong>{pb.mode}</strong>
            </span>
            <span className="chip">
              SLA: <strong>{pb.slaMins}m</strong>
            </span>
            <span className="chip">
              Avg: <strong>{pb.avgMins}m</strong>
            </span>
            <span className="chip">
              Success: <strong>{fmtPct(pb.successRate)}</strong>
            </span>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div className="card-title">Checklist</div>
          <div className="panel">
            <ol className="grid" style={{ paddingLeft: 18 }}>
              {steps.map((s, idx) => (
                <li key={s} className="small">
                  <span style={{ fontWeight: 800 }}>{idx + 1}.</span> {s}
                </li>
              ))}
            </ol>
          </div>
          <div style={{ height: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn secondary" onClick={() => onCopy(checklist)}>
              Copy checklist
            </button>
            <button className="btn" onClick={onRun}>
              Run now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function CommsPreviewModal({
  item,
  onClose,
  onSendNow,
  onCopy,
}: {
  item: CommsItem
  onClose: () => void
  onSendNow: () => void
  onCopy: (text: string) => void | Promise<void>
}) {
  const subject = `${item.channel}: ${item.title}`
  const body = useMemo(() => {
    const lines = [
      `Audience: ${item.audience}`,
      '',
      'Summary: We are investigating an ongoing issue and applying mitigations.',
      'Impact: Intermittent delays / degraded service for a subset of users.',
      'Mitigation: Replay retries, staged rollouts, and targeted resets are in progress.',
      'Next update: within 30–60 minutes.',
      '',
      '— EVzone Operations',
    ]
    return lines.join('\n')
  }, [item.audience])

  return (
    <div className="modal" style={{ zIndex: 85 }}>
      <div className="overlay" onClick={onClose} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>Preview comms</div>
            <div className="small">
              {item.id} • {item.channel} • {item.status}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className="grid">
          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Metadata</div>
            <div className="panel">
              <div className="small">
                Audience: <strong>{item.audience}</strong>
              </div>
              <div className="small">
                Owner: <strong>{item.owner}</strong>
              </div>
              <div className="small">
                Status: <strong>{item.status}</strong>
                {item.status === 'Scheduled' && item.scheduledFor ? <span className="text-muted"> • {item.scheduledFor}</span> : null}
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Message</div>
            <div className="panel" style={{ whiteSpace: 'pre-wrap' }}>
              <div className="small" style={{ fontWeight: 900 }}>
                {subject}
              </div>
              <div style={{ height: 8 }} />
              <div className="small">{body}</div>
            </div>
            <div style={{ height: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn secondary" onClick={() => onCopy(`${subject}\n\n${body}`)}>
                Copy message
              </button>
              <button className="btn" disabled={item.status === 'Sent'} onClick={onSendNow}>
                {item.status === 'Sent' ? 'Sent' : 'Send now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function splitCsv(x: string) {
  return x
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function mapIncidentStatus(s: IncidentStatus): ApprovalStatus {
  return s === 'Resolved' ? 'Approved' : s === 'Investigating' ? 'Pending' : s === 'Identified' ? 'SendBack' : 'Pending'
}

function SeverityPill({ s }: { s: Severity }) {
  const cls = s === 'SEV1' ? 'rejected' : s === 'SEV2' ? 'sendback' : s === 'SEV3' ? 'pending' : 'approved'
  return <span className={`pill ${cls}`}>{s}</span>
}

function IncidentDrawer({
  row,
  tab,
  setTab,
  busy,
  onClose,
  onSave,
  comms,
  linkedCommsIds,
  onPreviewComms,
  onSendComms,
}: {
  row: Incident
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  busy: boolean
  onClose: () => void
  onSave: (patch: Partial<Incident>) => void
  comms: CommsItem[]
  linkedCommsIds: string[]
  onPreviewComms: (id: string) => void
  onSendComms: (id: string) => void
}) {
  const [status, setStatus] = useState<IncidentStatus>(row.status)
  const [severity, setSeverity] = useState<Severity>(row.severity)
  const [impact, setImpact] = useState<Impact>(row.impact)
  const [commander, setCommander] = useState<string>(row.commander)
  const [eta, setEta] = useState(row.eta)
  const [update, setUpdate] = useState('')

  useEffect(() => {
    setStatus(row.status)
    setSeverity(row.severity)
    setImpact(row.impact)
    setCommander(row.commander)
    setEta(row.eta)
    setUpdate('')
  }, [row])

  function save() {
    onSave({
      status,
      severity,
      impact,
      commander,
      eta,
      summary: update ? row.summary + '\n\nUpdate: ' + update : row.summary,
      nextUpdateAt: nextUpdateStamp(),
    })
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.title}</div>
            <div className="small">
              {row.id} • {row.region} • commander: {row.commander}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}>
            Timeline
          </button>
          <button className={`tab ${tab === 'scope' ? 'active' : ''}`} onClick={() => setTab('scope')}>
            Scope
          </button>
          <button className={`tab ${tab === 'actions' ? 'active' : ''}`} onClick={() => setTab('actions')}>
            Actions
          </button>
          <button className={`tab ${tab === 'comms' ? 'active' : ''}`} onClick={() => setTab('comms')}>
            Comms
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div className="split">
            <span className="chip">
              Status: <strong>{status}</strong>
            </span>
            <span className="chip">
              Severity: <strong>{severity}</strong>
            </span>
            <span className="chip">
              Impact: <strong>{impact}</strong>
            </span>
            <span className="chip">
              ETA: <strong>{eta}</strong>
            </span>
            <div style={{ flex: 1 }} />
            <span className="chip">
              Next update: <strong>{row.nextUpdateAt}</strong>
            </span>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'timeline' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Summary + updates</div>
              <div className="panel" style={{ whiteSpace: 'pre-wrap' }}>
                {row.summary}
              </div>
              <div style={{ height: 10 }} />
              <label>
                <div className="small">Post update (demo)</div>
                <textarea className="textarea" value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="Add update for timeline / status page..." />
              </label>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">State</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label>
                  <div className="small">Status</div>
                  <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    {statuses.filter((x) => x !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Severity</div>
                  <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as any)}>
                    {severities.filter((x) => x !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Impact</div>
                  <select className="select" value={impact} onChange={(e) => setImpact(e.target.value as any)}>
                    {impacts.filter((x) => x !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Commander</div>
                  <select className="select" value={commander} onChange={(e) => setCommander(e.target.value)}>
                    {commanders.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">ETA</div>
                  <input className="input" value={eta} onChange={(e) => setEta(e.target.value)} />
                </label>
                <div className="panel">On save: updates nextUpdateAt + writes audit log (backend).</div>
              </div>
            </div>
          </div>
        ) : tab === 'scope' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Affected entities</div>
              <div className="panel">Org: {row.org} • Region: {row.region}</div>
              <div style={{ height: 10 }} />
              <div className="panel">
                Stations: {row.stationIds.length ? row.stationIds.join(', ') : '—'}
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">
                Tickets: {row.ticketIds.length ? row.ticketIds.join(', ') : '—'}
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Scope control (placeholder)</div>
              <div className="panel">Add/remove stations; compute affected users; push notifications to attendants/managers.</div>
            </div>
          </div>
        ) : tab === 'actions' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Operational actions (placeholders)</div>
              <div className="grid">
                <button className="btn secondary" onClick={() => alert('Placeholder: create dispatch job')}>
                  Dispatch technician
                </button>
                <button className="btn secondary" onClick={() => alert('Placeholder: run charger reboot macro')}>
                  Run reboot macro
                </button>
                <button className="btn secondary" onClick={() => alert('Placeholder: disable affected bays/chargers')}>
                  Degrade service
                </button>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Ownership</div>
              <div className="panel">Commander coordinates operators/support; station owners informed where relevant.</div>
            </div>
          </div>
        ) : tab === 'comms' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Linked comms</div>
              {linkedCommsIds.length === 0 ? (
                <div className="panel">No comms linked yet. Use “Send now” from the Comms panel to attach updates to this incident.</div>
              ) : (
                <div className="table-wrap rounded-none border-0 shadow-none">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Channel</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedCommsIds
                        .map((id) => comms.find((c) => c.id === id) ?? null)
                        .filter(Boolean)
                        .map((c) => (
                          <tr key={(c as CommsItem).id}>
                            <td style={{ fontWeight: 900 }}>{(c as CommsItem).id}</td>
                            <td className="small">{(c as CommsItem).channel}</td>
                            <td>
                              <div style={{ fontWeight: 800 }}>{(c as CommsItem).title}</div>
                              <div className="small">{(c as CommsItem).audience}</div>
                            </td>
                            <td>{pillForCommsStatus((c as CommsItem).status)}</td>
                            <td className="text-right">
                              <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button className="btn secondary" onClick={() => onPreviewComms((c as CommsItem).id)}>
                                  Preview
                                </button>
                                <button className="btn" disabled={(c as CommsItem).status === 'Sent'} onClick={() => onSendComms((c as CommsItem).id)}>
                                  {(c as CommsItem).status === 'Sent' ? 'Sent' : 'Send now'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Quick status update</div>
              <div className="panel">Use the Timeline “Post update” box for the incident narrative; use Comms for outbound messages.</div>
              <div style={{ height: 10 }} />
              <div className="grid">
                <button className="btn secondary" onClick={() => setTab('timeline')}>
                  Go to timeline update
                </button>
                <div className="panel">On send: we would publish to Status Page + Ops channel + email templates (mocked in this UI).</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Status page update (placeholder)</div>
              <div className="panel">Publish summary, affected regions, next update time.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Internal broadcast (placeholder)</div>
              <div className="panel">Notify Slack/Teams + email distribution list + in-app banner.</div>
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

function CreateIncidentModal({ model, setModel, onSubmit }: { model: CreateModal; setModel: (m: CreateModal) => void; onSubmit: () => void }) {
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Declare incident</div>
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

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Severity</div>
              <select className="select" value={model.severity} onChange={(e) => setModel({ ...model, severity: e.target.value as any })}>
                {severities.filter((x) => x !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Impact</div>
              <select className="select" value={model.impact} onChange={(e) => setModel({ ...model, impact: e.target.value as any })}>
                {impacts.filter((x) => x !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

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

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Org (optional)</div>
              <input className="input" value={model.org} onChange={(e) => setModel({ ...model, org: e.target.value })} />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Commander</div>
              <select className="select" value={model.commander} onChange={(e) => setModel({ ...model, commander: e.target.value })}>
                {commanders.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <div className="small">Stations (comma-separated)</div>
            <input className="input" value={model.stationIds} onChange={(e) => setModel({ ...model, stationIds: e.target.value })} placeholder="ST-0001, ST-0002" />
          </label>

          <label>
            <div className="small">Tickets (comma-separated)</div>
            <input className="input" value={model.ticketIds} onChange={(e) => setModel({ ...model, ticketIds: e.target.value })} placeholder="TCK-10021" />
          </label>

          <label>
            <div className="small">Summary</div>
            <textarea className="textarea" value={model.summary} onChange={(e) => setModel({ ...model, summary: e.target.value })} />
          </label>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Cancel
          </button>
          <button className="btn" onClick={onSubmit}>
            Create incident
          </button>
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

function nextUpdateStamp() {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 30)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
