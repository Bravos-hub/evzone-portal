import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type Segment = 'FLEET' | 'INDIVIDUAL' | 'CORPORATE' | 'GOV' | 'STARTUP' | 'OTHER'
type PartnerType = 'STATION_OWNER_ORG' | 'SITE_OWNER' | 'TECH_PROVIDER' | 'PAYMENT_PROVIDER' | 'MUNICIPALITY' | 'OTHER'
type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED'
type Priority = 'P1' | 'P2' | 'P3' | 'P4'
type Health = 'GOOD' | 'WATCH' | 'AT_RISK'

type Customer = {
  id: string
  name: string
  region: Region
  segment: Segment
  org?: string
  contact: { name: string; email: string; phone?: string }
  stations: number
  lastSeen: string
  health: Health
  status: Status
  notes?: string
}

type Partner = {
  id: string
  name: string
  region: Region
  type: PartnerType
  contact: { name: string; email: string }
  status: Status
  contract: { tier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'; renewal: string }
  sla: { response: string; resolution: string }
  kyc: 'OK' | 'MISSING' | 'REVIEW'
}

type Ticket = {
  id: string
  at: string
  region: Region
  org?: string
  station?: string
  subject: string
  requester: string
  priority: Priority
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED'
  tags: string[]
}

type Integration = {
  id: string
  partnerId: string
  name: string
  region: Region
  status: 'CONNECTED' | 'DEGRADED' | 'DOWN'
  lastEvent: string
  owner: string
  notes?: string
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const seedCustomers: Customer[] = [
  {
    id: 'CUST-1001',
    name: 'Volt Mobility',
    region: 'AFRICA',
    segment: 'CORPORATE',
    org: 'VOLT_MOBILITY',
    contact: { name: 'Sarah K.', email: 'ops@volt.io', phone: '+256 7xx xxx xxx' },
    stations: 18,
    lastSeen: '2025-12-24 10:20',
    health: 'WATCH',
    status: 'ACTIVE',
    notes: 'Needs support on tariff updates and payout schedule.',
  },
  {
    id: 'CUST-1022',
    name: 'Kampala Charge Co',
    region: 'AFRICA',
    segment: 'STARTUP',
    org: 'KAMPALA_CHARGE_CO',
    contact: { name: 'Brian M.', email: 'admin@kcc.ug' },
    stations: 5,
    lastSeen: '2025-12-24 07:02',
    health: 'AT_RISK',
    status: 'PENDING',
    notes: 'KYC incomplete; payout on hold.',
  },
  {
    id: 'CUST-2003',
    name: 'Mall Holdings',
    region: 'EUROPE',
    segment: 'CORPORATE',
    org: 'MALL_HOLDINGS',
    contact: { name: 'Elena R.', email: 'energy@mall.eu' },
    stations: 7,
    lastSeen: '2025-12-23 15:12',
    health: 'GOOD',
    status: 'ACTIVE',
  },
]

const seedPartners: Partner[] = [
  {
    id: 'PT-01',
    name: 'MobileMoney Provider UG',
    region: 'AFRICA',
    type: 'PAYMENT_PROVIDER',
    contact: { name: 'Support Desk', email: 'support@mm.example' },
    status: 'ACTIVE',
    contract: { tier: 'ENTERPRISE', renewal: '2026-03-01' },
    sla: { response: '30m', resolution: '4h' },
    kyc: 'OK',
  },
  {
    id: 'PT-10',
    name: 'SwapCabinet OEM',
    region: 'AFRICA',
    type: 'TECH_PROVIDER',
    contact: { name: 'Account Manager', email: 'am@oem.example' },
    status: 'ACTIVE',
    contract: { tier: 'PREMIUM', renewal: '2026-01-15' },
    sla: { response: '2h', resolution: '24h' },
    kyc: 'REVIEW',
  },
  {
    id: 'PT-22',
    name: 'City Municipality',
    region: 'EUROPE',
    type: 'MUNICIPALITY',
    contact: { name: 'Permits Office', email: 'permits@city.gov' },
    status: 'PENDING',
    contract: { tier: 'STANDARD', renewal: '2026-12-01' },
    sla: { response: '1d', resolution: '7d' },
    kyc: 'MISSING',
  },
]

const seedTickets: Ticket[] = [
  {
    id: 'TCK-10021',
    at: '2025-12-24 09:59',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    station: 'ST-0017',
    subject: 'Owner cannot see station revenue in dashboard',
    requester: 'ops@volt.io',
    priority: 'P2',
    status: 'IN_PROGRESS',
    tags: ['billing', 'permissions'],
  },
  {
    id: 'TCK-10018',
    at: '2025-12-24 09:12',
    region: 'AFRICA',
    subject: 'Payment provider spike in failures',
    requester: 'monitoring@evzone',
    priority: 'P1',
    status: 'OPEN',
    tags: ['payments', 'incident'],
  },
  {
    id: 'TCK-09991',
    at: '2025-12-23 14:02',
    region: 'EUROPE',
    org: 'MALL_HOLDINGS',
    subject: 'Chargeback dispute evidence request',
    requester: 'energy@mall.eu',
    priority: 'P3',
    status: 'WAITING_CUSTOMER',
    tags: ['dispute', 'support'],
  },
]

const seedIntegrations: Integration[] = [
  { id: 'INT-01', partnerId: 'PT-01', name: 'MobileMoney Webhooks', region: 'AFRICA', status: 'DEGRADED', lastEvent: '2025-12-24 10:24', owner: 'Payments Team', notes: 'Retrying failed webhook deliveries' },
  { id: 'INT-02', partnerId: 'PT-10', name: 'SwapCabinet Telemetry', region: 'AFRICA', status: 'CONNECTED', lastEvent: '2025-12-24 10:20', owner: 'IoT Team' },
  { id: 'INT-03', partnerId: 'PT-22', name: 'Permits/City API', region: 'EUROPE', status: 'DOWN', lastEvent: '2025-12-21 08:00', owner: 'Partnerships', notes: 'Awaiting keys / legal review' },
]

async function apiLoad() {
  await new Promise((r) => setTimeout(r, 120))
  return { customers: seedCustomers, partners: seedPartners, tickets: seedTickets, integrations: seedIntegrations }
}

type Tab = 'customers' | 'partners' | 'tickets' | 'integrations' | 'notes'
type DrawerType = { kind: 'customer'; id: string } | { kind: 'partner'; id: string } | { kind: 'ticket'; id: string } | { kind: 'integration'; id: string } | null

export function AdminCrmPage() {
  const [tab, setTab] = useState<Tab>('customers')
  const [region, setRegion] = useState<Region>('ALL')
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')

  const [customers, setCustomers] = useState<Customer[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])

  const [drawer, setDrawer] = useState<DrawerType>(null)

  useEffect(() => {
    void (async () => {
      const x = await apiLoad()
      setCustomers(x.customers)
      setPartners(x.partners)
      setTickets(x.tickets)
      setIntegrations(x.integrations)
    })()
  }, [])

  const customersF = useMemo(() => {
    return customers.filter((c) => {
      const okR = region === 'ALL' || c.region === region
      const hay = (c.id + ' ' + c.name + ' ' + (c.org ?? '') + ' ' + c.contact.email + ' ' + c.segment + ' ' + c.status).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okQ
    })
  }, [customers, region, q])

  const partnersF = useMemo(() => {
    return partners.filter((p) => {
      const okR = region === 'ALL' || p.region === region
      const hay = (p.id + ' ' + p.name + ' ' + p.type + ' ' + p.contact.email + ' ' + p.status + ' ' + p.kyc).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okQ
    })
  }, [partners, region, q])

  const ticketsF = useMemo(() => {
    return tickets.filter((t) => {
      const okR = region === 'ALL' || t.region === region
      const hay = (t.id + ' ' + t.subject + ' ' + (t.org ?? '') + ' ' + (t.station ?? '') + ' ' + t.requester + ' ' + t.priority + ' ' + t.status + ' ' + t.tags.join(' ')).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okQ
    })
  }, [tickets, region, q])

  const integrationsF = useMemo(() => {
    return integrations.filter((i) => {
      const okR = region === 'ALL' || i.region === region
      const hay = (i.id + ' ' + i.name + ' ' + i.status + ' ' + i.owner + ' ' + (i.notes ?? '')).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okQ
    })
  }, [integrations, region, q])

  const kpi = useMemo(() => {
    const activeCustomers = customersF.filter((c) => c.status === 'ACTIVE').length
    const atRisk = customersF.filter((c) => c.health === 'AT_RISK').length
    const pendingKyc = partnersF.filter((p) => p.kyc !== 'OK').length
    const openTickets = ticketsF.filter((t) => t.status !== 'RESOLVED').length
    const degraded = integrationsF.filter((i) => i.status !== 'CONNECTED').length
    return { activeCustomers, atRisk, pendingKyc, openTickets, degraded }
  }, [customersF, partnersF, ticketsF, integrationsF])

  function toastMsg(m: string) {
    setToast(m)
    setTimeout(() => setToast(''), 1500)
  }

  return (
    <DashboardLayout pageTitle="Customer & Partner CRM Tools">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search customers/partners/tickets/integrations" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={() => alert('Placeholder: create partner/customer meeting note')}>
            Add note
          </button>
          <button className="btn secondary" onClick={() => alert('Placeholder: open support desk')}>
            Go to Support Desk
          </button>
          <button className="btn" onClick={() => alert('Placeholder: create CRM record')}>
            New record
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>Customers</button>
          <button className={`tab ${tab === 'partners' ? 'active' : ''}`} onClick={() => setTab('partners')}>Partners</button>
          <button className={`tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => setTab('tickets')}>Support tickets</button>
          <button className={`tab ${tab === 'integrations' ? 'active' : ''}`} onClick={() => setTab('integrations')}>Integrations</button>
          <button className={`tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes</button>
        </div>

        <div style={{ height: 12 }} />

        <div className="kpi-grid">
          <Kpi label="Active customers" value={String(kpi.activeCustomers)} hint="In filtered view" />
          <Kpi label="At-risk customers" value={String(kpi.atRisk)} hint="Health = AT_RISK" tone={kpi.atRisk ? 'danger' : 'ok'} />
          <Kpi label="Partner KYC pending" value={String(kpi.pendingKyc)} hint="Needs follow-up" tone={kpi.pendingKyc ? 'warn' : 'ok'} />
          <Kpi label="Open tickets" value={String(kpi.openTickets)} hint="Not resolved" tone={kpi.openTickets ? 'warn' : 'ok'} />
          <Kpi label="Degraded integrations" value={String(kpi.degraded)} hint="DEGRADED/DOWN" tone={kpi.degraded ? 'danger' : 'ok'} />
          <Kpi label="Region" value={region === 'ALL' ? 'All' : region} hint="Current scope" />
        </div>
      </div>

      <div style={{ height: 12 }} />

      {tab === 'customers' ? <CustomersTable rows={customersF} onOpen={(id) => setDrawer({ kind: 'customer', id })} /> : null}
      {tab === 'partners' ? <PartnersTable rows={partnersF} onOpen={(id) => setDrawer({ kind: 'partner', id })} /> : null}
      {tab === 'tickets' ? <TicketsTable rows={ticketsF} onOpen={(id) => setDrawer({ kind: 'ticket', id })} /> : null}
      {tab === 'integrations' ? <IntegrationsTable rows={integrationsF} onOpen={(id) => setDrawer({ kind: 'integration', id })} /> : null}
      {tab === 'notes' ? <NotesPanel onToast={toastMsg} /> : null}

      {toast ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="small">{toast}</div>
        </div>
      ) : null}

      {drawer ? (
        <CrmDrawer
          drawer={drawer}
          customers={customers}
          partners={partners}
          tickets={tickets}
          integrations={integrations}
          onClose={() => setDrawer(null)}
          onToast={toastMsg}
          onSetCustomers={setCustomers}
          onSetPartners={setPartners}
          onSetTickets={setTickets}
          onSetIntegrations={setIntegrations}
        />
      ) : null}
    </DashboardLayout>
  )
}

function CustomersTable({ rows, onOpen }: { rows: Customer[]; onOpen: (id: string) => void }) {
  return (
    <div className="card">
      <div className="card-title">Customers</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>Segment</th>
              <th>Org</th>
              <th>Stations</th>
              <th>Health</th>
              <th>Status</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 900 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(c.id)}>
                    {c.id}
                  </button>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div className="small">{c.contact.email}</div>
                </td>
                <td className="small">{c.region}</td>
                <td className="small">{c.segment}</td>
                <td className="small">{c.org ?? '—'}</td>
                <td className="small">{c.stations}</td>
                <td><HealthPill health={c.health} /></td>
                <td><StatusPill status={c.status} /></td>
                <td className="small">{c.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 10 }} />
      <div className="panel">Backend: link customers to orgs, stations, billing accounts, and escalation policies.</div>
    </div>
  )
}

function PartnersTable({ rows, onOpen }: { rows: Partner[]; onOpen: (id: string) => void }) {
  return (
    <div className="card">
      <div className="card-title">Partners</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>Type</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Contract</th>
              <th>SLA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 900 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(p.id)}>
                    {p.id}
                  </button>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                  <div className="small">{p.contact.email}</div>
                </td>
                <td className="small">{p.region}</td>
                <td className="small">{p.type}</td>
                <td><StatusPill status={p.status} /></td>
                <td>{p.kyc === 'OK' ? <span className="pill approved">OK</span> : p.kyc === 'MISSING' ? <span className="pill rejected">Missing</span> : <span className="pill pending">Review</span>}</td>
                <td className="small">
                  <div>{p.contract.tier}</div>
                  <div className="small">renew: {p.contract.renewal}</div>
                </td>
                <td className="small">
                  <div>resp: {p.sla.response}</div>
                  <div className="small">res: {p.sla.resolution}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 10 }} />
      <div className="panel">Backend: store contracts, SLAs, escalation contacts, and compliance docs.</div>
    </div>
  )
}

function TicketsTable({ rows, onOpen }: { rows: Ticket[]; onOpen: (id: string) => void }) {
  return (
    <div className="card">
      <div className="card-title">Support tickets (CRM view)</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Scope</th>
              <th>Requester</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 900 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(t.id)}>
                    {t.id}
                  </button>
                </td>
                <td className="small">{t.at}</td>
                <td style={{ minWidth: 260 }}>
                  <div style={{ fontWeight: 800 }}>{t.subject}</div>
                  <div className="small">{t.region}</div>
                </td>
                <td className="small">
                  <div>{t.org ?? '—'}</div>
                  <div>{t.station ?? '—'}</div>
                </td>
                <td className="small">{t.requester}</td>
                <td>{PriorityPill(t.priority)}</td>
                <td>{TicketStatusPill(t.status)}</td>
                <td className="small">{t.tags.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 10 }} />
      <div className="panel">This is a CRM view. The full workflow lives in Support Desk (assign, SLAs, canned replies, attachments).</div>
    </div>
  )
}

function IntegrationsTable({ rows, onOpen }: { rows: Integration[]; onOpen: (id: string) => void }) {
  return (
    <div className="card">
      <div className="card-title">Partner integrations</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Last event</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 900 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(i.id)}>
                    {i.id}
                  </button>
                </td>
                <td style={{ fontWeight: 800 }}>{i.name}</td>
                <td className="small">{i.region}</td>
                <td>{IntegrationPill(i.status)}</td>
                <td className="small">{i.owner}</td>
                <td className="small">{i.lastEvent}</td>
                <td className="small">{i.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 10 }} />
      <div className="panel">Backend: link integration health to System Health; auto-open incidents on repeated DOWN/DEGRADED.</div>
    </div>
  )
}

function NotesPanel({ onToast }: { onToast: (m: string) => void }) {
  const [text, setText] = useState('')
  return (
    <div className="row2">
      <div className="card">
        <div className="card-title">Quick notes (demo)</div>
        <label>
          <div className="small">Internal note (supports ticket ids, orgs, stations)</div>
          <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Followed up with PT-01 about webhook retries. Ticket: TCK-10018" />
        </label>
        <div style={{ height: 10 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setText('')}>Clear</button>
          <button className="btn" onClick={() => { onToast('Saved note (demo).'); setText('') }}>Save</button>
        </div>
      </div>
      <div className="card">
        <div className="card-title">CRM playbooks (placeholders)</div>
        <div className="grid">
          <div className="panel"><strong>Onboarding</strong>: region → KYC → stations → staff → go-live checklist.</div>
          <div className="panel"><strong>Escalation</strong>: P1 to operator + admin on-call; notify partner if payments/telemetry.</div>
          <div className="panel"><strong>Renewals</strong>: 90/60/30 day reminders; contract + SLA review.</div>
          <div className="panel"><strong>Churn risk</strong>: low usage + repeated incidents → success outreach.</div>
        </div>
      </div>
    </div>
  )
}

function CrmDrawer(props: {
  drawer: DrawerType
  customers: Customer[]
  partners: Partner[]
  tickets: Ticket[]
  integrations: Integration[]
  onClose: () => void
  onToast: (m: string) => void
  onSetCustomers: (fn: (prev: Customer[]) => Customer[]) => void
  onSetPartners: (fn: (prev: Partner[]) => Partner[]) => void
  onSetTickets: (fn: (prev: Ticket[]) => Ticket[]) => void
  onSetIntegrations: (fn: (prev: Integration[]) => Integration[]) => void
}) {
  const { drawer, customers, partners, tickets, integrations, onClose, onToast, onSetCustomers, onSetPartners, onSetTickets, onSetIntegrations } = props

  const record =
    drawer?.kind === 'customer'
      ? customers.find((x) => x.id === drawer.id)
      : drawer?.kind === 'partner'
        ? partners.find((x) => x.id === drawer.id)
        : drawer?.kind === 'ticket'
          ? tickets.find((x) => x.id === drawer.id)
          : drawer?.kind === 'integration'
            ? integrations.find((x) => x.id === drawer.id)
            : null

  if (!drawer || !record) return null

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>
              {drawer.kind.toUpperCase()} • {(record as any).id}
            </div>
            <div className="small">CRM quick actions (demo)</div>
          </div>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ height: 12 }} />

        {drawer.kind === 'customer' ? (
          <CustomerDrawerBody c={record as Customer} onToast={onToast} onSetCustomers={onSetCustomers} />
        ) : drawer.kind === 'partner' ? (
          <PartnerDrawerBody p={record as Partner} onToast={onToast} onSetPartners={onSetPartners} />
        ) : drawer.kind === 'ticket' ? (
          <TicketDrawerBody t={record as Ticket} onToast={onToast} onSetTickets={onSetTickets} />
        ) : (
          <IntegrationDrawerBody i={record as Integration} onToast={onToast} onSetIntegrations={onSetIntegrations} />
        )}
      </div>
    </>
  )
}

function CustomerDrawerBody({ c, onToast, onSetCustomers }: { c: Customer; onToast: (m: string) => void; onSetCustomers: (fn: (prev: Customer[]) => Customer[]) => void }) {
  const [status, setStatus] = useState<Status>(c.status)
  const [health, setHealth] = useState<Health>(c.health)
  const [notes, setNotes] = useState(c.notes ?? '')

  return (
    <div className="grid">
      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Profile</div>
        <div className="panel"><strong>{c.name}</strong></div>
        <div style={{ height: 8 }} />
        <div className="panel">Org: {c.org ?? '—'}</div>
        <div style={{ height: 8 }} />
        <div className="panel">Contact: {c.contact.name} • {c.contact.email}</div>
        <div style={{ height: 8 }} />
        <div className="panel">Stations: {c.stations} • Last seen: {c.lastSeen}</div>
      </div>

      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Health & status</div>
        <div className="split">
          <label style={{ flex: 1 }}>
            <div className="small">Status</div>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <div className="small">Health</div>
            <select className="select" value={health} onChange={(e) => setHealth(e.target.value as any)}>
              <option value="GOOD">GOOD</option>
              <option value="WATCH">WATCH</option>
              <option value="AT_RISK">AT_RISK</option>
            </select>
          </label>
        </div>

        <div style={{ height: 10 }} />
        <label>
          <div className="small">Notes</div>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => onToast('Created success task (demo).')}>Create success task</button>
          <button className="btn secondary" onClick={() => onToast('Opened billing view (demo).')}>Open billing</button>
          <button
            className="btn"
            onClick={() => {
              onSetCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, status, health, notes } : x)))
              onToast('Saved customer (demo).')
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function PartnerDrawerBody({ p, onToast, onSetPartners }: { p: Partner; onToast: (m: string) => void; onSetPartners: (fn: (prev: Partner[]) => Partner[]) => void }) {
  const [status, setStatus] = useState<Status>(p.status)
  const [kyc, setKyc] = useState(p.kyc)
  const [renewal, setRenewal] = useState(p.contract.renewal)

  return (
    <div className="grid">
      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Partner</div>
        <div className="panel"><strong>{p.name}</strong></div>
        <div style={{ height: 8 }} />
        <div className="panel">Type: {p.type}</div>
        <div style={{ height: 8 }} />
        <div className="panel">Contact: {p.contact.name} • {p.contact.email}</div>
        <div style={{ height: 8 }} />
        <div className="panel">SLA: resp {p.sla.response} • res {p.sla.resolution}</div>
      </div>

      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Contract & compliance</div>
        <div className="split">
          <label style={{ flex: 1 }}>
            <div className="small">Status</div>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <div className="small">KYC</div>
            <select className="select" value={kyc} onChange={(e) => setKyc(e.target.value as any)}>
              <option value="OK">OK</option>
              <option value="MISSING">MISSING</option>
              <option value="REVIEW">REVIEW</option>
            </select>
          </label>
        </div>
        <div style={{ height: 10 }} />
        <label>
          <div className="small">Renewal date</div>
          <input className="input" value={renewal} onChange={(e) => setRenewal(e.target.value)} />
        </label>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => onToast('Opened integration health (demo).')}>View integrations</button>
          <button className="btn secondary" onClick={() => onToast('Created renewal reminder (demo).')}>Create renewal reminder</button>
          <button
            className="btn"
            onClick={() => {
              onSetPartners((prev) =>
                prev.map((x) => (x.id === p.id ? { ...x, status, kyc: kyc as any, contract: { ...x.contract, renewal } } : x)),
              )
              onToast('Saved partner (demo).')
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function TicketDrawerBody({ t, onToast, onSetTickets }: { t: Ticket; onToast: (m: string) => void; onSetTickets: (fn: (prev: Ticket[]) => Ticket[]) => void }) {
  const [status, setStatus] = useState<Ticket['status']>(t.status)
  const [priority, setPriority] = useState<Priority>(t.priority)

  return (
    <div className="grid">
      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Ticket</div>
        <div className="panel"><strong>{t.subject}</strong></div>
        <div style={{ height: 8 }} />
        <div className="panel">Scope: {t.org ?? '—'} • {t.station ?? '—'} • {t.region}</div>
        <div style={{ height: 8 }} />
        <div className="panel">Requester: {t.requester} • Tags: {t.tags.join(', ')}</div>
      </div>
      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Workflow</div>
        <div className="split">
          <label style={{ flex: 1 }}>
            <div className="small">Priority</div>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <div className="small">Status</div>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_CUSTOMER">WAITING_CUSTOMER</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </label>
        </div>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => onToast('Sent canned reply (demo).')}>Canned reply</button>
          <button className="btn secondary" onClick={() => onToast('Escalated to operator on-call (demo).')}>Escalate</button>
          <button
            className="btn"
            onClick={() => {
              onSetTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, priority, status } : x)))
              onToast('Updated ticket (demo).')
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function IntegrationDrawerBody({
  i,
  onToast,
  onSetIntegrations,
}: {
  i: Integration
  onToast: (m: string) => void
  onSetIntegrations: (fn: (prev: Integration[]) => Integration[]) => void
}) {
  const [status, setStatus] = useState<Integration['status']>(i.status)
  const [notes, setNotes] = useState(i.notes ?? '')

  return (
    <div className="grid">
      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Integration</div>
        <div className="panel"><strong>{i.name}</strong></div>
        <div style={{ height: 8 }} />
        <div className="panel">Region: {i.region}</div>
        <div style={{ height: 8 }} />
        <div className="panel">Owner: {i.owner}</div>
        <div style={{ height: 8 }} />
        <div className="panel">Last event: {i.lastEvent}</div>
      </div>

      <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
        <div className="card-title">Status</div>
        <label>
          <div className="small">State</div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="CONNECTED">CONNECTED</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="DOWN">DOWN</option>
          </select>
        </label>
        <div style={{ height: 10 }} />
        <label>
          <div className="small">Notes</div>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => onToast('Opened system health view (demo).')}>System Health</button>
          <button className="btn secondary" onClick={() => onToast('Incident created (demo).')}>Create incident</button>
          <button
            className="btn"
            onClick={() => {
              onSetIntegrations((prev) => prev.map((x) => (x.id === i.id ? { ...x, status, notes } : x)))
              onToast('Saved integration (demo).')
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Status }) {
  const cls = status === 'ACTIVE' ? 'approved' : status === 'PENDING' ? 'pending' : 'rejected'
  return <span className={`pill ${cls}`}>{status}</span>
}

function HealthPill({ health }: { health: Health }) {
  const cls = health === 'GOOD' ? 'approved' : health === 'WATCH' ? 'pending' : 'rejected'
  return <span className={`pill ${cls}`}>{health}</span>
}

function PriorityPill(p: Priority) {
  const cls = p === 'P1' ? 'rejected' : p === 'P2' ? 'sendback' : p === 'P3' ? 'pending' : 'approved'
  return <span className={`pill ${cls}`}>{p}</span>
}

function TicketStatusPill(s: Ticket['status']) {
  const cls = s === 'RESOLVED' ? 'approved' : s === 'IN_PROGRESS' ? 'pending' : s === 'WAITING_CUSTOMER' ? 'sendback' : 'rejected'
  return <span className={`pill ${cls}`}>{s}</span>
}

function IntegrationPill(s: Integration['status']) {
  const cls = s === 'CONNECTED' ? 'approved' : s === 'DEGRADED' ? 'pending' : 'rejected'
  return <span className={`pill ${cls}`}>{s}</span>
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
