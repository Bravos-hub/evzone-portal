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
          <div className="card-title">Playbooks (placeholder)</div>
          <div className="grid">
            <div className="panel">Payments: webhook delays, retry queues, reconciliation.</div>
            <div className="panel">Charging: OCPP logs, remote reset, config rollout.</div>
            <div className="panel">Swapping: locker firmware, bay disable, manual override.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Comms (placeholder)</div>
          <div className="grid">
            <div className="panel">Status page updates (public).</div>
            <div className="panel">Internal ops channel notifications.</div>
            <div className="panel">Customer-facing email templates.</div>
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

      {openRow ? <IncidentDrawer row={openRow} tab={tab} setTab={setTab} busy={busy} onClose={() => setOpenId(null)} onSave={saveIncident} /> : null}

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
}: {
  row: Incident
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  busy: boolean
  onClose: () => void
  onSave: (patch: Partial<Incident>) => void
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
