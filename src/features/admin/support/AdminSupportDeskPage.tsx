import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type TicketStatus = 'New' | 'Open' | 'WaitingOnCustomer' | 'WaitingOnVendor' | 'Resolved' | 'Closed'
type Priority = 'P1' | 'P2' | 'P3' | 'P4'
type Category = 'Payments' | 'Charging' | 'Swapping' | 'Hardware' | 'Account' | 'Access' | 'Other'

type Ticket = {
  id: string
  subject: string
  status: TicketStatus
  priority: Priority
  category: Category
  region: Region
  org: string | '—'
  stationId: string | '—'
  requesterName: string
  requesterEmail: string
  assignedTo: string | 'Unassigned'
  createdAt: string
  updatedAt: string
  lastReply: string
  description: string
  tags: string[]
  slaMinutesRemaining: number
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const statuses: Array<TicketStatus | 'All'> = ['All', 'New', 'Open', 'WaitingOnCustomer', 'WaitingOnVendor', 'Resolved', 'Closed']
const priorities: Array<Priority | 'All'> = ['All', 'P1', 'P2', 'P3', 'P4']
const categories: Array<Category | 'All'> = ['All', 'Payments', 'Charging', 'Swapping', 'Hardware', 'Account', 'Access', 'Other']

const agents = ['Unassigned', 'Delta (Admin)', 'Support L1', 'Support L2', 'Operator EA']

const seed: Ticket[] = [
  {
    id: 'TCK-10021',
    subject: 'Charging session stuck at “starting”',
    status: 'Open',
    priority: 'P2',
    category: 'Charging',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    stationId: 'ST-0001',
    requesterName: 'Asha Attendant',
    requesterEmail: 'asha@volt.co',
    assignedTo: 'Support L1',
    createdAt: '2025-12-20 10:14',
    updatedAt: '2025-12-24 08:55',
    lastReply: 'Customer',
    description: 'Session remains in starting state for > 5 mins. Charger shows no fault. OCPP logs needed.',
    tags: ['ocpp', 'session', 'charger'],
    slaMinutesRemaining: 180,
  },
  {
    id: 'TCK-10034',
    subject: 'Wallet top-up not reflecting',
    status: 'New',
    priority: 'P1',
    category: 'Payments',
    region: 'AFRICA',
    org: '—',
    stationId: '—',
    requesterName: 'Public User',
    requesterEmail: 'user@gmail.com',
    assignedTo: 'Unassigned',
    createdAt: '2025-12-24 09:12',
    updatedAt: '2025-12-24 09:12',
    lastReply: '—',
    description: 'Paid via mobile money but balance did not update. Transaction id provided in attachments.',
    tags: ['payment', 'mobile-money', 'wallet'],
    slaMinutesRemaining: 45,
  },
  {
    id: 'TCK-10010',
    subject: 'Swap bay door not unlocking',
    status: 'WaitingOnVendor',
    priority: 'P1',
    category: 'Hardware',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    stationId: 'ST-0017',
    requesterName: 'Mary Manager',
    requesterEmail: 'mary@volt.co',
    assignedTo: 'Support L2',
    createdAt: '2025-12-18 16:02',
    updatedAt: '2025-12-23 19:40',
    lastReply: 'Agent',
    description: 'Bay #12 intermittently fails to unlock. Vendor firmware patch requested; awaiting response.',
    tags: ['swap', 'locker', 'hardware'],
    slaMinutesRemaining: 10,
  },
  {
    id: 'TCK-09991',
    subject: 'Cannot invite station attendant',
    status: 'Resolved',
    priority: 'P3',
    category: 'Access',
    region: 'EUROPE',
    org: 'MALL_HOLDINGS',
    stationId: 'ST-1011',
    requesterName: 'Grace SiteOwner',
    requesterEmail: 'grace@mall.com',
    assignedTo: 'Delta (Admin)',
    createdAt: '2025-12-10 12:06',
    updatedAt: '2025-12-11 09:20',
    lastReply: 'Agent',
    description: 'Owner tries to invite attendant but role dropdown missing. Provided workaround; fixed in next release.',
    tags: ['rbac', 'invite'],
    slaMinutesRemaining: 0,
  },
]

async function apiList(): Promise<Ticket[]> {
  await new Promise((r) => setTimeout(r, 160))
  return seed
}

async function apiUpdate(_id: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 220))
  return { ok: true }
}

type DrawerTab = 'timeline' | 'details' | 'links' | 'sla'
type ComposeModal = {
  open: boolean
  subject: string
  category: Category
  priority: Priority
  region: Region
  org: string
  stationId: string
  message: string
}

export function AdminSupportDeskPage() {
  const [rows, setRows] = useState<Ticket[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region>('ALL')
  const [status, setStatus] = useState<TicketStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [assignee, setAssignee] = useState<string>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<DrawerTab>('timeline')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [compose, setCompose] = useState<ComposeModal>({
    open: false,
    subject: '',
    category: 'Other',
    priority: 'P3',
    region: 'AFRICA',
    org: '',
    stationId: '',
    message: '',
  })

  useEffect(() => {
    void (async () => setRows(await apiList()))()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const hay = (t.id + ' ' + t.subject + ' ' + t.requesterEmail + ' ' + t.org + ' ' + t.stationId).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      const okR = region === 'ALL' || t.region === region
      const okS = status === 'All' || t.status === status
      const okP = priority === 'All' || t.priority === priority
      const okC = category === 'All' || t.category === category
      const okA = assignee === 'All' || t.assignedTo === assignee
      return okQ && okR && okS && okP && okC && okA
    })
  }, [rows, q, region, status, priority, category, assignee])

  const kpi = useMemo(() => {
    const total = filtered.length
    const newT = filtered.filter((t) => t.status === 'New').length
    const open = filtered.filter((t) => t.status === 'Open').length
    const waiting = filtered.filter((t) => t.status === 'WaitingOnCustomer' || t.status === 'WaitingOnVendor').length
    const breached = filtered.filter((t) => t.slaMinutesRemaining <= 0 && (t.status === 'Open' || t.status === 'New')).length
    const p1 = filtered.filter((t) => t.priority === 'P1' && (t.status === 'Open' || t.status === 'New')).length
    return { total, newT, open, waiting, breached, p1 }
  }, [filtered])

  const openRow = rows.find((t) => t.id === openId) ?? null

  async function saveTicket(patch: Partial<Ticket>) {
    if (!openRow) return
    setBusy(true)
    setNotice('')
    try {
      await apiUpdate(openRow.id)
      setRows((list) => list.map((t) => (t.id === openRow.id ? { ...t, ...patch, updatedAt: nowStamp() } : t)))
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
    setCategory('All')
    setAssignee('All')
  }

  return (
    <DashboardLayout pageTitle="Support Desk">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search ticket/subject/email/org/station" value={q} onChange={(e) => setQ(e.target.value)} />

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

          <select className="select" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select className="select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="All">All Assignees</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={resetFilters}>
            Reset filters
          </button>
          <button className="btn" onClick={() => setCompose((m) => ({ ...m, open: true }))}>
            New ticket
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="split">
          <span className="chip">
            <strong>{kpi.total}</strong> tickets
          </span>
          <span className="chip">
            <strong>{kpi.newT}</strong> new
          </span>
          <span className="chip">
            <strong>{kpi.open}</strong> open
          </span>
          <span className="chip">
            <strong>{kpi.waiting}</strong> waiting
          </span>
          <span className="chip">
            <strong>{kpi.p1}</strong> P1 active
          </span>
          <span className="chip">
            <strong>{kpi.breached}</strong> SLA breached
          </span>
          <div style={{ flex: 1 }} />
          <span className="small">Click a ticket id to open the triage drawer.</span>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Queues (placeholder)</div>
          <div className="grid">
            <div className="panel">Unassigned + P1/P2</div>
            <div className="panel">Waiting on customer</div>
            <div className="panel">Waiting on vendor</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Macros (placeholder)</div>
          <div className="grid">
            <div className="panel">Request logs / Request payment reference / Escalate to operator</div>
            <div className="panel">Station reboot request / Charger diagnostics</div>
            <div className="panel">Swap locker firmware escalation</div>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Region</th>
              <th>Org</th>
              <th>Station</th>
              <th>Assignee</th>
              <th>SLA</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 900 }}>
                  <button
                    className="btn secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => {
                      setOpenId(t.id)
                      setTab('timeline')
                    }}
                  >
                    {t.id}
                  </button>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{t.subject}</div>
                  <div className="small">
                    {t.requesterName} • {t.requesterEmail} • last reply: {t.lastReply}
                  </div>
                </td>
                <td>
                  <StatusPill status={mapTicketStatus(t.status)} />
                </td>
                <td>
                  <PriorityPill p={t.priority} />
                </td>
                <td>{t.category}</td>
                <td>{t.region}</td>
                <td>{t.org}</td>
                <td>{t.stationId}</td>
                <td className="small">{t.assignedTo}</td>
                <td className="small">
                  {t.slaMinutesRemaining <= 0 ? <span className="pill rejected">Breached</span> : <span className="pill pending">{t.slaMinutesRemaining}m</span>}
                </td>
                <td className="small">{t.updatedAt}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn secondary" onClick={() => setRows((list) => list.map((x) => (x.id === t.id ? { ...x, assignedTo: 'Support L1' } : x)))}>
                      Assign L1
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => setRows((list) => list.map((x) => (x.id === t.id ? { ...x, status: x.status === 'Resolved' ? 'Closed' : 'Resolved' } : x)))}
                    >
                      Resolve
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

      {openRow ? <TicketDrawer row={openRow} tab={tab} setTab={setTab} busy={busy} onClose={() => setOpenId(null)} onSave={saveTicket} /> : null}

      {compose.open ? (
        <NewTicketModal
          model={compose}
          setModel={setCompose}
          onSubmit={() => {
            const n: Ticket = {
              id: 'TCK-' + Math.floor(10000 + Math.random() * 90000),
              subject: compose.subject || 'New support request',
              status: 'New',
              priority: compose.priority,
              category: compose.category,
              region: compose.region,
              org: compose.org ? compose.org : '—',
              stationId: compose.stationId ? compose.stationId : '—',
              requesterName: 'Admin Created',
              requesterEmail: 'support@evzone.app',
              assignedTo: 'Unassigned',
              createdAt: nowStamp(),
              updatedAt: nowStamp(),
              lastReply: '—',
              description: compose.message || '—',
              tags: ['manual'],
              slaMinutesRemaining: compose.priority === 'P1' ? 60 : compose.priority === 'P2' ? 240 : compose.priority === 'P3' ? 720 : 1440,
            }
            setRows((list) => [n, ...list])
            setCompose((m) => ({ ...m, open: false, subject: '', message: '' }))
          }}
        />
      ) : null}
    </DashboardLayout>
  )
}

function mapTicketStatus(s: TicketStatus): ApprovalStatus {
  return s === 'Closed' || s === 'Resolved'
    ? 'Approved'
    : s === 'New'
      ? 'Pending'
      : s === 'WaitingOnCustomer' || s === 'WaitingOnVendor'
        ? 'SendBack'
        : 'Pending'
}

function PriorityPill({ p }: { p: Priority }) {
  const cls = p === 'P1' ? 'rejected' : p === 'P2' ? 'sendback' : p === 'P3' ? 'pending' : 'approved'
  return <span className={`pill ${cls}`}>{p}</span>
}

function TicketDrawer({
  row,
  tab,
  setTab,
  busy,
  onClose,
  onSave,
}: {
  row: Ticket
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  busy: boolean
  onClose: () => void
  onSave: (patch: Partial<Ticket>) => void
}) {
  const [status, setStatus] = useState<TicketStatus>(row.status)
  const [priority, setPriority] = useState<Priority>(row.priority)
  const [category, setCategory] = useState<Category>(row.category)
  const [assignedTo, setAssignedTo] = useState<string>(row.assignedTo)
  const [note, setNote] = useState('')

  useEffect(() => {
    setStatus(row.status)
    setPriority(row.priority)
    setCategory(row.category)
    setAssignedTo(row.assignedTo)
    setNote('')
  }, [row])

  function save() {
    onSave({
      status,
      priority,
      category,
      assignedTo,
      lastReply: note ? 'Agent' : row.lastReply,
      description: note ? row.description + '\n\n---\nAgent note: ' + note : row.description,
    })
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.subject}</div>
            <div className="small">
              {row.id} • {row.requesterName} • {row.requesterEmail}
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
          <button className={`tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>
            Details
          </button>
          <button className={`tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>
            Links
          </button>
          <button className={`tab ${tab === 'sla' ? 'active' : ''}`} onClick={() => setTab('sla')}>
            SLA
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
              Assignee: <strong>{assignedTo}</strong>
            </span>
            <span className="chip">
              Region: <strong>{row.region}</strong>
            </span>
            <span className="chip">
              Station: <strong>{row.stationId}</strong>
            </span>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'timeline' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Conversation</div>
              <div className="panel" style={{ whiteSpace: 'pre-wrap' }}>
                {row.description}
              </div>
              <div style={{ height: 10 }} />
              <label>
                <div className="small">Reply / internal note (demo)</div>
                <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a reply or internal note..." />
              </label>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Triage</div>
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
                  <div className="small">Category</div>
                  <select className="select" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                    {categories.filter((x) => x !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Assignee</div>
                  <select className="select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                    {agents.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="panel">Escalation buttons: create incident, dispatch technician, notify operator (placeholders).</div>
              </div>
            </div>
          </div>
        ) : tab === 'details' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Requester</div>
              <div className="panel">
                <div style={{ fontWeight: 900 }}>{row.requesterName}</div>
                <div className="small">{row.requesterEmail}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">
                Org: {row.org} • Station: {row.stationId} • Region: {row.region}
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Tags</div>
              <div className="split">
                {row.tags.map((t) => (
                  <span key={t} className="pill pending">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : tab === 'links' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Related entities (placeholders)</div>
              <div className="grid">
                <div className="panel">Station detail deep link</div>
                <div className="panel">User profile deep link</div>
                <div className="panel">Payment transaction deep link</div>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Attachments (placeholder)</div>
              <div className="panel">Uploads: images, receipts, logs, CSV exports.</div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">SLA & policy (placeholder)</div>
              <div className="panel">Define response/resolve targets per priority, business hours, regional holidays.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Countdown</div>
              <div className="panel">
                {row.slaMinutesRemaining <= 0 ? <span className="pill rejected">Breached</span> : <span className="pill pending">{row.slaMinutesRemaining} minutes remaining</span>}
              </div>
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

function NewTicketModal({ model, setModel, onSubmit }: { model: ComposeModal; setModel: (m: ComposeModal) => void; onSubmit: () => void }) {
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>New ticket</div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Close
          </button>
        </div>
        <div style={{ height: 10 }} />
        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            <div className="small">Subject</div>
            <input className="input" value={model.subject} onChange={(e) => setModel({ ...model, subject: e.target.value })} />
          </label>
          <label>
            <div className="small">Category</div>
            <select className="select" value={model.category} onChange={(e) => setModel({ ...model, category: e.target.value as any })}>
              {categories.filter((x) => x !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div className="small">Priority</div>
            <select className="select" value={model.priority} onChange={(e) => setModel({ ...model, priority: e.target.value as any })}>
              {priorities.filter((x) => x !== 'All').map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
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
          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Org (optional)</div>
              <input className="input" value={model.org} onChange={(e) => setModel({ ...model, org: e.target.value })} />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Station (optional)</div>
              <input className="input" value={model.stationId} onChange={(e) => setModel({ ...model, stationId: e.target.value })} />
            </label>
          </div>
          <label>
            <div className="small">Message</div>
            <textarea className="textarea" value={model.message} onChange={(e) => setModel({ ...model, message: e.target.value })} />
          </label>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Cancel
          </button>
          <button className="btn" onClick={onSubmit}>
            Create ticket
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
