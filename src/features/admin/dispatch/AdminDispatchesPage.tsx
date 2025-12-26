import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type DispatchStatus = 'Draft' | 'Queued' | 'Assigned' | 'EnRoute' | 'OnSite' | 'Completed' | 'Cancelled'
type Priority = 'P1' | 'P2' | 'P3' | 'P4'
type JobType = 'Diagnostics' | 'Repair' | 'Install' | 'Reboot' | 'BatterySwap' | 'Other'

type Dispatch = {
  id: string
  status: DispatchStatus
  priority: Priority
  jobType: JobType
  region: Region
  org: string | '—'
  stationId: string
  address: string
  requestedBy: string
  createdAt: string
  updatedAt: string
  eta: string
  technicianType: 'Public' | 'Org'
  technician: string | 'Unassigned'
  ticketId: string | '—'
  incidentId: string | '—'
  notes: string
  checklist: { label: string; done: boolean }[]
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const statuses: Array<DispatchStatus | 'All'> = ['All', 'Draft', 'Queued', 'Assigned', 'EnRoute', 'OnSite', 'Completed', 'Cancelled']
const priorities: Array<Priority | 'All'> = ['All', 'P1', 'P2', 'P3', 'P4']
const jobTypes: Array<JobType | 'All'> = ['All', 'Diagnostics', 'Repair', 'Install', 'Reboot', 'BatterySwap', 'Other']
const techTypes: Array<'All' | 'Public' | 'Org'> = ['All', 'Public', 'Org']

const technicians = ['Unassigned', 'Allan Tech (Public)', 'Rita Tech (Org)', 'Ssebadduka (Public)', 'VOLT Field Team']

const seed: Dispatch[] = [
  {
    id: 'DSP-7012',
    status: 'Assigned',
    priority: 'P1',
    jobType: 'Reboot',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    stationId: 'ST-0001',
    address: 'Kampala, Lugogo — Plot 12',
    requestedBy: 'Support Desk',
    createdAt: '2025-12-24 08:15',
    updatedAt: '2025-12-24 09:05',
    eta: '45m',
    technicianType: 'Org',
    technician: 'Rita Tech (Org)',
    ticketId: 'TCK-10021',
    incidentId: 'INC-2392',
    notes: 'Run safe reboot, collect OCPP logs, verify session transitions.',
    checklist: [
      { label: 'Confirm station access', done: true },
      { label: 'Pull diagnostics logs', done: false },
      { label: 'Reboot charger(s)', done: false },
      { label: 'Validate with test session', done: false },
    ],
  },
  {
    id: 'DSP-7009',
    status: 'Queued',
    priority: 'P2',
    jobType: 'Diagnostics',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    stationId: 'ST-0017',
    address: 'Kampala, Ntinda — Mall parking',
    requestedBy: 'Incidents',
    createdAt: '2025-12-23 18:40',
    updatedAt: '2025-12-24 08:00',
    eta: '2h',
    technicianType: 'Public',
    technician: 'Unassigned',
    ticketId: 'TCK-10010',
    incidentId: 'INC-2384',
    notes: 'Inspect bay #12 lock mechanism, confirm firmware version, report findings.',
    checklist: [
      { label: 'Assign technician', done: false },
      { label: 'Share access instructions', done: false },
      { label: 'Collect photos/video evidence', done: false },
      { label: 'Vendor escalation prepared', done: false },
    ],
  },
  {
    id: 'DSP-6991',
    status: 'Completed',
    priority: 'P3',
    jobType: 'Repair',
    region: 'EUROPE',
    org: 'MALL_HOLDINGS',
    stationId: 'ST-1011',
    address: 'Berlin — Center Plaza',
    requestedBy: 'Operator',
    createdAt: '2025-12-11 09:30',
    updatedAt: '2025-12-11 14:20',
    eta: '—',
    technicianType: 'Org',
    technician: 'VOLT Field Team',
    ticketId: '—',
    incidentId: '—',
    notes: 'Replaced connector, verified charging.',
    checklist: [
      { label: 'Part replaced', done: true },
      { label: 'Test session completed', done: true },
      { label: 'Close ticket/incident', done: true },
      { label: 'Customer informed', done: true },
    ],
  },
]

async function apiList(): Promise<Dispatch[]> {
  await new Promise((r) => setTimeout(r, 150))
  return seed
}

async function apiUpdate(_id: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 220))
  return { ok: true }
}

type DrawerTab = 'overview' | 'assignment' | 'checklist' | 'activity'
type CreateModal = {
  open: boolean
  stationId: string
  region: Region
  org: string
  address: string
  priority: Priority
  jobType: JobType
  technicianType: 'Public' | 'Org'
  ticketId: string
  incidentId: string
  notes: string
}

export function AdminDispatchesPage() {
  const [rows, setRows] = useState<Dispatch[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region>('ALL')
  const [status, setStatus] = useState<DispatchStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [jobType, setJobType] = useState<JobType | 'All'>('All')
  const [techType, setTechType] = useState<'All' | 'Public' | 'Org'>('All')
  const [assignee, setAssignee] = useState<string>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<DrawerTab>('overview')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [create, setCreate] = useState<CreateModal>({
    open: false,
    stationId: '',
    region: 'AFRICA',
    org: '',
    address: '',
    priority: 'P2',
    jobType: 'Diagnostics',
    technicianType: 'Public',
    ticketId: '',
    incidentId: '',
    notes: '',
  })

  useEffect(() => {
    void (async () => setRows(await apiList()))()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((d) => {
      const hay = (d.id + ' ' + d.stationId + ' ' + d.address + ' ' + d.org + ' ' + d.ticketId + ' ' + d.incidentId).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      const okR = region === 'ALL' || d.region === region
      const okS = status === 'All' || d.status === status
      const okP = priority === 'All' || d.priority === priority
      const okJ = jobType === 'All' || d.jobType === jobType
      const okT = techType === 'All' || d.technicianType === techType
      const okA = assignee === 'All' || d.technician === assignee
      return okQ && okR && okS && okP && okJ && okT && okA
    })
  }, [rows, q, region, status, priority, jobType, techType, assignee])

  const kpi = useMemo(() => {
    const total = filtered.length
    const active = filtered.filter((x) => !['Completed', 'Cancelled'].includes(x.status)).length
    const p1 = filtered.filter((x) => x.priority === 'P1' && !['Completed', 'Cancelled'].includes(x.status)).length
    const unassigned = filtered.filter((x) => x.technician === 'Unassigned' && !['Completed', 'Cancelled'].includes(x.status)).length
    const enroute = filtered.filter((x) => x.status === 'EnRoute' || x.status === 'OnSite').length
    const completed = filtered.filter((x) => x.status === 'Completed').length
    return { total, active, p1, unassigned, enroute, completed }
  }, [filtered])

  const openRow = rows.find((r) => r.id === openId) ?? null

  async function saveDispatch(patch: Partial<Dispatch>) {
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
    setPriority('All')
    setJobType('All')
    setTechType('All')
    setAssignee('All')
  }

  return (
    <DashboardLayout pageTitle="Dispatches">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search dispatch/station/address/org/ticket/incident" value={q} onChange={(e) => setQ(e.target.value)} />
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
          <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Priority' : p}
              </option>
            ))}
          </select>
          <select className="select" value={jobType} onChange={(e) => setJobType(e.target.value as any)}>
            {jobTypes.map((j) => (
              <option key={j} value={j}>
                {j === 'All' ? 'All Job Types' : j}
              </option>
            ))}
          </select>
          <select className="select" value={techType} onChange={(e) => setTechType(e.target.value as any)}>
            {techTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Technician Types' : t}
              </option>
            ))}
          </select>
          <select className="select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="All">All Technicians</option>
            {technicians.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={resetFilters}>
            Reset filters
          </button>
          <button className="btn" onClick={() => setCreate((m) => ({ ...m, open: true }))}>
            Create dispatch
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="split">
          <span className="chip">
            <strong>{kpi.total}</strong> dispatches
          </span>
          <span className="chip">
            <strong>{kpi.active}</strong> active
          </span>
          <span className="chip">
            <strong>{kpi.p1}</strong> P1 active
          </span>
          <span className="chip">
            <strong>{kpi.unassigned}</strong> unassigned
          </span>
          <span className="chip">
            <strong>{kpi.enroute}</strong> enroute / onsite
          </span>
          <span className="chip">
            <strong>{kpi.completed}</strong> completed
          </span>
          <div style={{ flex: 1 }} />
          <span className="small">Click a dispatch id to manage assignment + checklist.</span>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Dispatch policies (placeholder)</div>
          <div className="grid">
            <div className="panel">Assign public technicians when org technicians unavailable.</div>
            <div className="panel">P1: notify operator + owner; require resolution notes.</div>
            <div className="panel">Auto-escalate if no assignee in 30 mins.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Integrations (placeholder)</div>
          <div className="grid">
            <div className="panel">Maps + routing ETA</div>
            <div className="panel">In-app technician notifications</div>
            <div className="panel">Attachment uploads (photos, logs)</div>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Job</th>
              <th>Region</th>
              <th>Org</th>
              <th>Station</th>
              <th>Technician</th>
              <th>ETA</th>
              <th>Ticket</th>
              <th>Incident</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 900 }}>
                  <button
                    className="btn secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => {
                      setOpenId(d.id)
                      setTab('overview')
                    }}
                  >
                    {d.id}
                  </button>
                </td>
                <td>
                  <StatusPill status={mapDispatchStatus(d.status)} />
                </td>
                <td>
                  <PriorityPill p={d.priority} />
                </td>
                <td>{d.jobType}</td>
                <td>{d.region}</td>
                <td>{d.org}</td>
                <td>
                  <div style={{ fontWeight: 800 }}>{d.stationId}</div>
                  <div className="small">{d.address}</div>
                </td>
                <td className="small">
                  {d.technicianType} • {d.technician}
                </td>
                <td className="small">{d.eta}</td>
                <td className="small">{d.ticketId}</td>
                <td className="small">{d.incidentId}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn secondary" onClick={() => setRows((list) => list.map((x) => (x.id === d.id ? { ...x, status: 'EnRoute' } : x)))}>
                      Enroute
                    </button>
                    <button className="btn secondary" onClick={() => setRows((list) => list.map((x) => (x.id === d.id ? { ...x, status: 'Completed' } : x)))}>
                      Complete
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

      {openRow ? <DispatchDrawer row={openRow} tab={tab} setTab={setTab} busy={busy} onClose={() => setOpenId(null)} onSave={saveDispatch} /> : null}

      {create.open ? (
        <CreateDispatchModal
          model={create}
          setModel={setCreate}
          onSubmit={() => {
            const n: Dispatch = {
              id: 'DSP-' + Math.floor(6500 + Math.random() * 8000),
              status: 'Queued',
              priority: create.priority,
              jobType: create.jobType,
              region: create.region,
              org: create.org ? create.org : '—',
              stationId: create.stationId || 'ST-0000',
              address: create.address || '—',
              requestedBy: 'Admin',
              createdAt: nowStamp(),
              updatedAt: nowStamp(),
              eta: create.priority === 'P1' ? '1h' : '2h',
              technicianType: create.technicianType,
              technician: 'Unassigned',
              ticketId: create.ticketId ? create.ticketId : '—',
              incidentId: create.incidentId ? create.incidentId : '—',
              notes: create.notes || '—',
              checklist: [
                { label: 'Assign technician', done: false },
                { label: 'Share access instructions', done: false },
                { label: 'Collect evidence', done: false },
                { label: 'Resolution notes captured', done: false },
              ] as any,
            }
            // fix bool capitalization for TS (we'll correct below by string replace in file if needed)
            setRows((list) => [n, ...list])
            setCreate((m) => ({ ...m, open: false, stationId: '', address: '', notes: '', ticketId: '', incidentId: '' }))
          }}
        />
      ) : null}
    </DashboardLayout>
  )
}

function DispatchDrawer({
  row,
  tab,
  setTab,
  busy,
  onClose,
  onSave,
}: {
  row: Dispatch
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  busy: boolean
  onClose: () => void
  onSave: (patch: Partial<Dispatch>) => void
}) {
  const [status, setStatus] = useState<DispatchStatus>(row.status)
  const [priority, setPriority] = useState<Priority>(row.priority)
  const [jobType, setJobType] = useState<JobType>(row.jobType)
  const [technicianType, setTechnicianType] = useState<'Public' | 'Org'>(row.technicianType)
  const [technician, setTechnician] = useState<string>(row.technician)
  const [eta, setEta] = useState(row.eta)
  const [notes, setNotes] = useState(row.notes)
  const [checklist, setChecklist] = useState(row.checklist)

  useEffect(() => {
    setStatus(row.status)
    setPriority(row.priority)
    setJobType(row.jobType)
    setTechnicianType(row.technicianType)
    setTechnician(row.technician)
    setEta(row.eta)
    setNotes(row.notes)
    setChecklist(row.checklist)
  }, [row])

  function save() {
    onSave({ status, priority, jobType, technicianType, technician, eta, notes, checklist })
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>
              {row.id} • {row.stationId}
            </div>
            <div className="small">
              {row.address} • ticket: {row.ticketId} • incident: {row.incidentId}
            </div>
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
          <button className={`tab ${tab === 'assignment' ? 'active' : ''}`} onClick={() => setTab('assignment')}>
            Assignment
          </button>
          <button className={`tab ${tab === 'checklist' ? 'active' : ''}`} onClick={() => setTab('checklist')}>
            Checklist
          </button>
          <button className={`tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            Activity
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div className="split">
            <span className="chip">
              Status: <strong>{status}</strong>
            </span>
            <span className="chip">
              Priority: <strong>{priority}</strong>
            </span>
            <span className="chip">
              Tech: <strong>{technician}</strong>
            </span>
            <span className="chip">
              ETA: <strong>{eta}</strong>
            </span>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'overview' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Job</div>
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
                  <div className="small">Priority</div>
                  <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                    {priorities.filter((x) => x !== 'All').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Job type</div>
                  <select className="select" value={jobType} onChange={(e) => setJobType(e.target.value as any)}>
                    {jobTypes.filter((x) => x !== 'All').map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">ETA</div>
                  <input className="input" value={eta} onChange={(e) => setEta(e.target.value)} />
                </label>
                <label>
                  <div className="small">Notes</div>
                  <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </label>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Station</div>
              <div className="panel">
                <div style={{ fontWeight: 900 }}>{row.stationId}</div>
                <div className="small">{row.address}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">Region: {row.region} • Org: {row.org}</div>
              <div style={{ height: 10 }} />
              <div className="panel">Requested by: {row.requestedBy} • Created: {row.createdAt}</div>
            </div>
          </div>
        ) : tab === 'assignment' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Technician assignment</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label>
                  <div className="small">Technician type</div>
                  <select className="select" value={technicianType} onChange={(e) => setTechnicianType(e.target.value as any)}>
                    <option value="Public">Public</option>
                    <option value="Org">Org</option>
                  </select>
                </label>
                <label>
                  <div className="small">Technician</div>
                  <select className="select" value={technician} onChange={(e) => setTechnician(e.target.value)}>
                    {technicians.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="panel">Backend enforcement: only approved technicians eligible; region constraints apply.</div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Notifications (placeholder)</div>
              <div className="grid">
                <div className="panel">Push to technician + SMS fallback.</div>
                <div className="panel">Notify station owner/manager when technician is enroute.</div>
                <div className="panel">Share access instructions securely.</div>
              </div>
            </div>
          </div>
        ) : tab === 'checklist' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Checklist</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {checklist.map((c, idx) => (
                  <label key={idx} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={(e) =>
                        setChecklist((list) => list.map((x, i) => (i === idx ? { ...x, done: e.target.checked } : x)))
                      }
                    />
                    <span style={{ fontWeight: 800 }}>{c.label}</span>
                  </label>
                ))}
                <div className="panel">Add checklist templates per job type (backend/config).</div>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Completion rules (placeholder)</div>
              <div className="panel">Require evidence attachments for P1/P2. Auto-close linked ticket when complete.</div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Activity (placeholder)</div>
              <div className="panel">Status transitions, assignment changes, technician GPS pings.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Audit log link (placeholder)</div>
              <div className="panel">Deep link to /admin/audit filtered by dispatch id.</div>
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

function mapDispatchStatus(s: DispatchStatus): ApprovalStatus {
  return s === 'Completed' ? 'Approved' : s === 'Cancelled' ? 'Rejected' : s === 'Assigned' ? 'SendBack' : 'Pending'
}

function PriorityPill({ p }: { p: Priority }) {
  const cls = p === 'P1' ? 'rejected' : p === 'P2' ? 'sendback' : p === 'P3' ? 'pending' : 'approved'
  return <span className={`pill ${cls}`}>{p}</span>
}

function CreateDispatchModal({ model, setModel, onSubmit }: { model: CreateModal; setModel: (m: CreateModal) => void; onSubmit: () => void }) {
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Create dispatch</div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Station ID</div>
              <input className="input" value={model.stationId} onChange={(e) => setModel({ ...model, stationId: e.target.value })} placeholder="ST-0001" />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Region</div>
              <select className="select" value={model.region} onChange={(e) => setModel({ ...model, region: e.target.value as any })}>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <div className="small">Address</div>
            <input className="input" value={model.address} onChange={(e) => setModel({ ...model, address: e.target.value })} placeholder="City — landmark" />
          </label>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Org (optional)</div>
              <input className="input" value={model.org} onChange={(e) => setModel({ ...model, org: e.target.value })} />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Technician type</div>
              <select className="select" value={model.technicianType} onChange={(e) => setModel({ ...model, technicianType: e.target.value as any })}>
                <option value="Public">Public</option>
                <option value="Org">Org</option>
              </select>
            </label>
          </div>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Priority</div>
              <select className="select" value={model.priority} onChange={(e) => setModel({ ...model, priority: e.target.value as any })}>
                {priorities.filter((x) => x !== 'All').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Job type</div>
              <select className="select" value={model.jobType} onChange={(e) => setModel({ ...model, jobType: e.target.value as any })}>
                {jobTypes.filter((x) => x !== 'All').map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Ticket ID (optional)</div>
              <input className="input" value={model.ticketId} onChange={(e) => setModel({ ...model, ticketId: e.target.value })} placeholder="TCK-10021" />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Incident ID (optional)</div>
              <input className="input" value={model.incidentId} onChange={(e) => setModel({ ...model, incidentId: e.target.value })} placeholder="INC-2392" />
            </label>
          </div>

          <label>
            <div className="small">Notes</div>
            <textarea className="textarea" value={model.notes} onChange={(e) => setModel({ ...model, notes: e.target.value })} />
          </label>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Cancel
          </button>
          <button className="btn" onClick={onSubmit}>
            Create dispatch
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
