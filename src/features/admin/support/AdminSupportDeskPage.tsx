import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'
import { useNavigate } from 'react-router-dom'
import { upsertNotification } from '@/features/admin/notifications/mockNotifications'

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

type TicketAttachment = {
  id: string
  name: string
  type: 'Receipt' | 'Image' | 'Log' | 'CSV' | 'Other'
  url: string
  addedAt: string
  addedBy: string
}

type TicketEvent = {
  at: string
  actor: string
  action: string
  details: string
}

type Macro = {
  id: string
  title: string
  category: Category | 'Any'
  appliesTo: Array<Category | 'Any'>
  note: string
  patch?: Partial<Pick<Ticket, 'status' | 'priority' | 'assignedTo'>>
  tags?: string[]
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

const TICKETS_KEY = 'mock.support.tickets.v1'
const ATTACH_KEY_PREFIX = 'mock.support.attach.'
const EVENTS_KEY_PREFIX = 'mock.support.events.'

function loadTickets(): Ticket[] | null {
  try {
    const raw = localStorage.getItem(TICKETS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Ticket[]
    return Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

function saveTickets(rows: Ticket[]) {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(rows))
  } catch {}
}

function attachKey(id: string) {
  return `${ATTACH_KEY_PREFIX}${id}`
}

function loadAttachments(id: string): TicketAttachment[] {
  try {
    const raw = localStorage.getItem(attachKey(id))
    if (raw) return JSON.parse(raw) as TicketAttachment[]
  } catch {}
  // sensible per-category defaults
  if (id === 'TCK-10034') {
    return [
      { id: 'A-101', name: 'momo_tx_99123.jpg', type: 'Image', url: '#', addedAt: '2025-12-24 09:12', addedBy: 'Customer' },
      { id: 'A-102', name: 'payment_ref.txt', type: 'Other', url: '#', addedAt: '2025-12-24 09:13', addedBy: 'Customer' },
    ]
  }
  if (id === 'TCK-10021') {
    return [{ id: 'A-201', name: 'ocpp_snapshot_ST-0001.csv', type: 'CSV', url: '#', addedAt: '2025-12-24 08:55', addedBy: 'Operator EA' }]
  }
  return []
}

function saveAttachments(id: string, items: TicketAttachment[]) {
  try {
    localStorage.setItem(attachKey(id), JSON.stringify(items))
  } catch {}
}

function eventsKey(id: string) {
  return `${EVENTS_KEY_PREFIX}${id}`
}

function loadEvents(id: string): TicketEvent[] {
  try {
    const raw = localStorage.getItem(eventsKey(id))
    if (raw) return JSON.parse(raw) as TicketEvent[]
  } catch {}
  return []
}

function appendEvent(id: string, ev: TicketEvent) {
  const list = loadEvents(id)
  const next = [ev, ...list].slice(0, 40)
  try {
    localStorage.setItem(eventsKey(id), JSON.stringify(next))
  } catch {}
  window.dispatchEvent(new CustomEvent('evzone:mockSupport'))
  return next
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
  const nav = useNavigate()
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
  const [toast, setToast] = useState('')
  const [supportTick, setSupportTick] = useState(0)
  const [macroRun, setMacroRun] = useState<{ open: boolean; macroId: string; ticketId: string }>({ open: false, macroId: '', ticketId: '' })
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
    const cached = typeof window !== 'undefined' ? loadTickets() : null
    if (cached && cached.length) {
      setRows(cached)
      return
    }
    void (async () => {
      const data = await apiList()
      setRows(data)
      if (typeof window !== 'undefined') saveTickets(data)
    })()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const on = () => setSupportTick((t) => t + 1)
    window.addEventListener('evzone:mockSupport', on as EventListener)
    return () => window.removeEventListener('evzone:mockSupport', on as EventListener)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!rows.length) return
    saveTickets(rows)
  }, [rows])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

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

  const macros: Macro[] = useMemo(
    () => [
      {
        id: 'MAC-LOGS',
        title: 'Request logs + diagnostics',
        category: 'Any',
        appliesTo: ['Charging', 'Swapping', 'Hardware', 'Any'],
        note:
          'Hi — please share the following:\n- Station ID + timestamp\n- Device model/app version\n- Screenshot/video of error\nWe will also pull OCPP/locker diagnostics on our side.\n\nThanks,\nEVzone Support',
        patch: { status: 'WaitingOnCustomer' },
        tags: ['request-info'],
      },
      {
        id: 'MAC-PAYREF',
        title: 'Request payment reference',
        category: 'Payments',
        appliesTo: ['Payments'],
        note:
          'Please share your payment reference (provider txn id), amount, and time of payment.\nIf possible, attach a screenshot of the provider confirmation message.\n\nThanks,\nEVzone Support',
        patch: { status: 'WaitingOnCustomer' },
        tags: ['payment', 'reference'],
      },
      {
        id: 'MAC-ESC-OPS',
        title: 'Escalate to operator (handoff)',
        category: 'Any',
        appliesTo: ['Any'],
        note:
          'Escalation requested: please investigate and share findings.\nInclude station/region context and any recent config changes.\n\n— Support Desk',
        patch: { assignedTo: 'Operator EA', status: 'Open' },
        tags: ['escalation'],
      },
      {
        id: 'MAC-REBOOT',
        title: 'Remote reboot request',
        category: 'Charging',
        appliesTo: ['Charging'],
        note: 'We are initiating a remote reboot + config refresh. Expect brief downtime (~2–3 mins). We will update you shortly.',
        patch: { status: 'Open' },
        tags: ['reboot', 'ocpp'],
      },
    ],
    [],
  )

  const queues = useMemo(() => {
    const unassigned = rows.filter((t) => t.assignedTo === 'Unassigned' && (t.priority === 'P1' || t.priority === 'P2') && t.status !== 'Closed')
    const waitingCustomer = rows.filter((t) => t.status === 'WaitingOnCustomer')
    const waitingVendor = rows.filter((t) => t.status === 'WaitingOnVendor')
    const breached = rows.filter((t) => t.slaMinutesRemaining <= 0 && (t.status === 'Open' || t.status === 'New'))
    return { unassigned, waitingCustomer, waitingVendor, breached }
  }, [rows])

  async function saveTicket(patch: Partial<Ticket>) {
    if (!openRow) return
    setBusy(true)
    setNotice('')
    try {
      await apiUpdate(openRow.id)
      setRows((list) => list.map((t) => (t.id === openRow.id ? { ...t, ...patch, updatedAt: nowStamp() } : t)))
      appendEvent(openRow.id, { at: 'now', actor: 'Support Desk', action: 'Updated ticket', details: Object.keys(patch).join(', ') })
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function applyMacro(m: Macro, ticketId: string) {
    const t = rows.find((x) => x.id === ticketId)
    if (!t) return
    const patch: Partial<Ticket> = {
      ...m.patch,
      tags: Array.from(new Set([...(t.tags ?? []), ...(m.tags ?? [])])),
      lastReply: 'Agent',
      description: `${t.description}\n\n---\nMacro (${m.id}):\n${m.note}`,
    }
    setRows((list) => list.map((x) => (x.id === ticketId ? { ...x, ...patch, updatedAt: nowStamp() } : x)))
    appendEvent(ticketId, { at: 'now', actor: 'Support Desk', action: 'Macro applied', details: `${m.id} • ${m.title}` })
    setToast(`Applied macro: ${m.title}`)
  }

  function escalate(kind: 'incident' | 'dispatch' | 'notify', t: Ticket) {
    const msg =
      kind === 'incident'
        ? `Escalated to incident management for ${t.category} (${t.priority}).`
        : kind === 'dispatch'
          ? `Dispatch requested for station ${t.stationId} (${t.category}).`
          : `Operator notified for ${t.org} / ${t.stationId}.`
    appendEvent(t.id, { at: 'now', actor: 'Support Desk', action: 'Escalation', details: msg })
    upsertNotification({
      id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
      when: 'now',
      kind: kind === 'incident' ? 'Incident' : 'Ops',
      severity: t.priority === 'P1' ? 'High' : 'Medium',
      title: kind === 'incident' ? `Escalation: ${t.id} → Incident` : `Escalation: ${t.id}`,
      body: `${t.subject} • ${msg}`,
      status: 'Unread',
      source: 'support-desk',
      region: 'GLOBAL',
      tags: ['support', 'escalation'],
      link: kind === 'incident' ? '/admin/incidents' : kind === 'dispatch' ? '/admin/dispatches' : '/admin/health',
    })
    setToast(msg)
    if (kind === 'incident') nav('/admin/incidents')
    if (kind === 'dispatch') nav('/admin/dispatches')
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
          <div className="card-title">Queues</div>
          <div className="grid">
            <div className="panel flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-text">Unassigned (P1/P2)</div>
                <div className="text-xs text-muted">{queues.unassigned.length} tickets • prioritize by SLA</div>
              </div>
              <button
                className="btn secondary"
                disabled={queues.unassigned.length === 0}
                onClick={() => {
                  const next = queues.unassigned[0]
                  if (!next) return
                  setOpenId(next.id)
                  setTab('timeline')
                }}
              >
                Open next
              </button>
            </div>
            <div className="panel flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-text">Waiting on customer</div>
                <div className="text-xs text-muted">{queues.waitingCustomer.length} tickets • pending info</div>
              </div>
              <span className={`pill ${queues.waitingCustomer.length ? 'pending' : 'approved'}`}>{queues.waitingCustomer.length ? 'Active' : 'Clear'}</span>
            </div>
            <div className="panel flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-text">Waiting on vendor</div>
                <div className="text-xs text-muted">{queues.waitingVendor.length} tickets • firmware/provider</div>
              </div>
              <span className={`pill ${queues.waitingVendor.length ? 'sendback' : 'approved'}`}>{queues.waitingVendor.length ? 'Active' : 'Clear'}</span>
            </div>
            <div className="panel flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-text">SLA breached</div>
                <div className="text-xs text-muted">{queues.breached.length} tickets • needs escalation</div>
              </div>
              <span className={`pill ${queues.breached.length ? 'rejected' : 'approved'}`}>{queues.breached.length ? 'Urgent' : 'OK'}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Macros</div>
          <div className="grid">
            {macros.map((m) => (
              <div key={m.id} className="panel flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-text">
                    {m.title} <span className="text-xs text-muted font-semibold">• {m.id}</span>
                  </div>
                  <div className="text-xs text-muted">Applies to: {m.appliesTo.join(', ')}</div>
                </div>
                <button
                  className="btn secondary"
                  onClick={() => setMacroRun({ open: true, macroId: m.id, ticketId: openRow?.id ?? '' })}
                >
                  Apply
                </button>
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

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}

      {macroRun.open ? (
        <div className="fixed inset-0 z-[90] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMacroRun({ open: false, macroId: '', ticketId: '' })} />
          <div className="relative w-[min(860px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-extrabold text-text">Apply macro</div>
                <div className="text-xs text-muted">Choose a ticket to apply the macro to.</div>
              </div>
              <button className="btn secondary" onClick={() => setMacroRun({ open: false, macroId: '', ticketId: '' })}>
                Close
              </button>
            </div>
            <div className="h-3" />
            <div className="grid gap-3">
              <label>
                <div className="small">Ticket</div>
                <select className="select" value={macroRun.ticketId} onChange={(e) => setMacroRun((m) => ({ ...m, ticketId: e.target.value }))}>
                  <option value="">Select ticket…</option>
                  {filtered.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} • {t.subject}
                    </option>
                  ))}
                </select>
              </label>
              <div className="panel">
                <div className="small">
                  Macro: <strong>{macroRun.macroId}</strong>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button className="btn secondary" onClick={() => setMacroRun({ open: false, macroId: '', ticketId: '' })}>
                  Cancel
                </button>
                <button
                  className="btn"
                  disabled={!macroRun.ticketId}
                  onClick={() => {
                    const macro = macros.find((x) => x.id === macroRun.macroId)
                    if (!macro) return
                    applyMacro(macro, macroRun.ticketId)
                    setMacroRun({ open: false, macroId: '', ticketId: '' })
                  }}
                >
                  Apply macro
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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

  const attachments = useMemo(() => loadAttachments(row.id), [row.id])
  const events = useMemo(() => loadEvents(row.id), [row.id, row.updatedAt])
  const slaTarget = priority === 'P1' ? 60 : priority === 'P2' ? 240 : priority === 'P3' ? 720 : 1440
  const slaState = row.slaMinutesRemaining <= 0 ? 'Breached' : row.slaMinutesRemaining <= 30 ? 'At risk' : 'On track'

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
                <div className="panel">
                  <div className="text-sm font-extrabold text-text mb-2">Escalations</div>
                  <div className="grid gap-2">
                    <button
                      className="btn secondary"
                      onClick={() => {
                        appendEvent(row.id, { at: 'now', actor: assignedTo === 'Unassigned' ? 'Support Desk' : assignedTo, action: 'Escalation', details: 'Created incident (mock)' })
                        upsertNotification({
                          id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
                          when: 'now',
                          kind: 'Incident',
                          severity: priority === 'P1' ? 'High' : 'Medium',
                          title: `Support escalation: ${row.id} → Incident`,
                          body: `${row.subject} • ${row.category} • ${row.stationId}`,
                          status: 'Unread',
                          source: 'support-desk',
                          region: 'GLOBAL',
                          tags: ['support', 'incident'],
                          link: '/admin/incidents',
                        })
                      }}
                    >
                      Create incident
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        appendEvent(row.id, { at: 'now', actor: assignedTo === 'Unassigned' ? 'Support Desk' : assignedTo, action: 'Escalation', details: 'Dispatch requested (mock)' })
                        upsertNotification({
                          id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
                          when: 'now',
                          kind: 'Ops',
                          severity: priority === 'P1' ? 'High' : 'Medium',
                          title: `Dispatch requested: ${row.id}`,
                          body: `${row.subject} • Station ${row.stationId}`,
                          status: 'Unread',
                          source: 'support-desk',
                          region: 'GLOBAL',
                          tags: ['support', 'dispatch'],
                          link: '/admin/dispatches',
                        })
                      }}
                    >
                      Dispatch technician
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        appendEvent(row.id, { at: 'now', actor: assignedTo === 'Unassigned' ? 'Support Desk' : assignedTo, action: 'Escalation', details: 'Operator notified (mock)' })
                        upsertNotification({
                          id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
                          when: 'now',
                          kind: 'Ops',
                          severity: 'Medium',
                          title: `Operator notified: ${row.id}`,
                          body: `${row.org} • ${row.stationId} • ${row.category}`,
                          status: 'Unread',
                          source: 'support-desk',
                          region: 'GLOBAL',
                          tags: ['support', 'ops'],
                          link: '/admin/notifications',
                        })
                      }}
                    >
                      Notify operator
                    </button>
                  </div>
                </div>
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
              <div className="card-title">Related entities</div>
              <div className="grid">
                <div className="panel flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">Station</div>
                    <div className="text-xs text-muted">{row.stationId}</div>
                  </div>
                  <a className="btn secondary" href="/admin/stations">
                    Open stations
                  </a>
                </div>
                <div className="panel flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">User / requester</div>
                    <div className="text-xs text-muted">{row.requesterEmail}</div>
                  </div>
                  <a className="btn secondary" href="/admin/users">
                    Open users
                  </a>
                </div>
                <div className="panel flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">Billing / transactions</div>
                    <div className="text-xs text-muted">Search by email/org/tx reference</div>
                  </div>
                  <a className="btn secondary" href="/admin/billing">
                    Open billing
                  </a>
                </div>
                <div className="panel flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">Refunds & disputes</div>
                    <div className="text-xs text-muted">Customer exceptions & chargebacks</div>
                  </div>
                  <a className="btn secondary" href="/admin/disputes">
                    Open disputes
                  </a>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Attachments</div>
              {attachments.length === 0 ? (
                <div className="panel">No attachments yet. Use macros to request receipts/logs or attach exports.</div>
              ) : (
                <div className="grid">
                  {attachments.map((a) => (
                    <div key={a.id} className="panel">
                      <div style={{ fontWeight: 800 }}>{a.name}</div>
                      <div className="small">
                        {a.type} • {a.addedAt} • {a.addedBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ height: 10 }} />
              <button
                className="btn secondary"
                onClick={() => {
                  const next: TicketAttachment = {
                    id: `A-${Math.floor(100 + Math.random() * 900)}`,
                    name: `export_${row.id}.csv`,
                    type: 'CSV',
                    url: '#',
                    addedAt: 'now',
                    addedBy: 'Support Desk',
                  }
                  const list = loadAttachments(row.id)
                  const merged = [next, ...list].slice(0, 12)
                  saveAttachments(row.id, merged)
                  appendEvent(row.id, { at: 'now', actor: 'Support Desk', action: 'Attachment added', details: next.name })
                }}
              >
                Attach export (mock)
              </button>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">SLA & policy</div>
              <div className="grid">
                <div className="panel">
                  Target (by priority): <strong>{slaTarget}m</strong> • Remaining: <strong>{row.slaMinutesRemaining}m</strong> • State:{' '}
                  <strong>{slaState}</strong>
                </div>
                <div className="panel">
                  Policy: P1 requires response within 15m and continuous updates; P2 within 60m; P3 within 4h; P4 next business day (mock).
                </div>
                <div className="panel">
                  Suggested: {priority === 'P1' ? 'Escalate + create incident if systemic.' : priority === 'P2' ? 'Assign owner + request logs.' : 'Collect details + route to correct queue.'}
                </div>
                <div className="split">
                  <button
                    className="btn secondary"
                    onClick={() =>
                      onSave({
                        status: 'WaitingOnCustomer',
                        slaMinutesRemaining: Math.max(0, row.slaMinutesRemaining),
                        lastReply: 'Agent',
                        description: `${row.description}\n\n---\nSLA action: requested info; paused customer clock (mock).`,
                      })
                    }
                  >
                    Request info (SLA pause)
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() =>
                      onSave({
                        slaMinutesRemaining: row.slaMinutesRemaining + 30,
                        description: `${row.description}\n\n---\nSLA action: extended +30m (mock).`,
                      })
                    }
                  >
                    Extend +30m
                  </button>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Countdown</div>
              <div className="panel">
                {row.slaMinutesRemaining <= 0 ? <span className="pill rejected">Breached</span> : <span className="pill pending">{row.slaMinutesRemaining} minutes remaining</span>}
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">
                <div className="text-sm font-extrabold text-text mb-2">Recent activity</div>
                {events.length === 0 ? (
                  <div className="text-xs text-muted">No activity recorded yet.</div>
                ) : (
                  <div className="grid gap-1 text-xs text-muted">
                    {events.slice(0, 6).map((e, idx) => (
                      <div key={e.at + e.action + idx} className="flex items-center justify-between">
                        <span>
                          {e.action} — {e.details}
                        </span>
                        <span className="text-text-secondary">{e.at}</span>
                      </div>
                    ))}
                  </div>
                )}
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
