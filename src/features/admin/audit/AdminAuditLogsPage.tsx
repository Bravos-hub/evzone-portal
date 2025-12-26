import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type Outcome = 'SUCCESS' | 'FAIL' | 'DENIED'
type Entity = 'USER' | 'ORG' | 'STATION' | 'ROLE' | 'TARIFF' | 'PAYMENT' | 'DISPATCH' | 'INCIDENT' | 'SYSTEM' | 'OTHER'
type Action =
  | 'LOGIN'
  | 'LOGOUT'
  | 'ROLE_ASSIGN'
  | 'ROLE_REVOKE'
  | 'CREATE_STATION'
  | 'UPDATE_STATION'
  | 'DELETE_STATION'
  | 'APPROVE_USER'
  | 'REJECT_USER'
  | 'CREATE_DISPATCH'
  | 'UPDATE_DISPATCH'
  | 'ACK_ALERT'
  | 'DECLARE_INCIDENT'
  | 'UPDATE_INCIDENT'
  | 'PUBLISH_MAINTENANCE'
  | 'IMPERSONATE'
  | 'OVERRIDE'
  | 'EXPORT'
  | 'CONFIG_UPDATE'
  | 'OTHER'

type ActorRole =
  | 'EVZONE_ADMIN'
  | 'EVZONE_OPERATOR'
  | 'STATION_OWNER'
  | 'STATION_ADMIN'
  | 'STATION_MANAGER'
  | 'ATTENDANT'
  | 'TECHNICIAN_PUBLIC'
  | 'TECHNICIAN_ORG'
  | 'SYSTEM'

type Change = { field: string; from: string; to: string }

type AuditEvent = {
  id: string
  at: string
  region: Region
  actor: { id: string; name: string; role: ActorRole }
  action: Action
  entity: { type: Entity; id: string; label: string }
  scope: { org?: string; station?: string }
  outcome: Outcome
  ip: string
  device: string
  sensitive: boolean
  reason?: string
  changes?: Change[]
  meta?: Record<string, unknown>
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const outcomes: Array<Outcome | 'ALL'> = ['ALL', 'SUCCESS', 'FAIL', 'DENIED']
const entities: Array<Entity | 'ALL'> = ['ALL', 'USER', 'ORG', 'STATION', 'ROLE', 'TARIFF', 'PAYMENT', 'DISPATCH', 'INCIDENT', 'SYSTEM', 'OTHER']
const actions: Array<Action | 'ALL'> = [
  'ALL',
  'LOGIN',
  'LOGOUT',
  'ROLE_ASSIGN',
  'ROLE_REVOKE',
  'CREATE_STATION',
  'UPDATE_STATION',
  'DELETE_STATION',
  'APPROVE_USER',
  'REJECT_USER',
  'CREATE_DISPATCH',
  'UPDATE_DISPATCH',
  'ACK_ALERT',
  'DECLARE_INCIDENT',
  'UPDATE_INCIDENT',
  'PUBLISH_MAINTENANCE',
  'IMPERSONATE',
  'OVERRIDE',
  'EXPORT',
  'CONFIG_UPDATE',
  'OTHER',
]

const ranges = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
] as const
type RangeId = (typeof ranges)[number]['id']

const seed: AuditEvent[] = [
  {
    id: 'AUD-90112',
    at: '2025-12-24 10:05',
    region: 'AFRICA',
    actor: { id: 'U-1', name: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN' },
    action: 'ACK_ALERT',
    entity: { type: 'SYSTEM', id: 'ALT-9011', label: 'Alert ALT-9011' },
    scope: { org: '—', station: '—' },
    outcome: 'SUCCESS',
    ip: '197.243.12.10',
    device: 'Web (Chrome)',
    sensitive: false,
    changes: [{ field: 'acknowledged', from: 'false', to: 'true' }],
    meta: { source: 'Payments Webhooks', severity: 'SEV1' },
  },
  {
    id: 'AUD-90105',
    at: '2025-12-24 09:58',
    region: 'AFRICA',
    actor: { id: 'U-1', name: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN' },
    action: 'IMPERSONATE',
    entity: { type: 'USER', id: 'U-44', label: 'Owner: Volt Mobility' },
    scope: { org: 'VOLT_MOBILITY' },
    outcome: 'SUCCESS',
    ip: '197.243.12.10',
    device: 'Web (Chrome)',
    sensitive: true,
    reason: 'Support case: owner cannot see station revenue',
    meta: { ticketId: 'TCK-10021' },
  },
  {
    id: 'AUD-90011',
    at: '2025-12-23 21:10',
    region: 'AFRICA',
    actor: { id: 'SYS', name: 'Deploy Bot', role: 'SYSTEM' },
    action: 'OTHER',
    entity: { type: 'SYSTEM', id: 'svc-api', label: 'Core API' },
    scope: {},
    outcome: 'SUCCESS',
    ip: '—',
    device: 'CI',
    sensitive: false,
    meta: { deploy: '2025.12.23-2110', commit: 'a1b2c3d' },
  },
  {
    id: 'AUD-88912',
    at: '2025-12-21 11:47',
    region: 'EUROPE',
    actor: { id: 'U-7', name: 'Operator EU', role: 'EVZONE_OPERATOR' },
    action: 'CREATE_DISPATCH',
    entity: { type: 'DISPATCH', id: 'DSP-6991', label: 'Dispatch DSP-6991' },
    scope: { org: 'MALL_HOLDINGS', station: 'ST-1011' },
    outcome: 'SUCCESS',
    ip: '83.122.10.7',
    device: 'Web (Edge)',
    sensitive: false,
    meta: { technicianType: 'Org', priority: 'P3' },
  },
  {
    id: 'AUD-87771',
    at: '2025-12-15 16:20',
    region: 'AFRICA',
    actor: { id: 'U-1', name: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN' },
    action: 'ROLE_ASSIGN',
    entity: { type: 'ROLE', id: 'ROLE-ATTENDANT', label: 'ATTENDANT' },
    scope: { org: 'VOLT_MOBILITY', station: 'ST-0017' },
    outcome: 'SUCCESS',
    ip: '197.243.12.10',
    device: 'Web (Chrome)',
    sensitive: false,
    changes: [{ field: 'userRole', from: 'PENDING', to: 'ATTENDANT' }],
    meta: { userId: 'U-88', userEmail: 'attendant@volt.io' },
  },
  {
    id: 'AUD-87110',
    at: '2025-12-12 08:09',
    region: 'AFRICA',
    actor: { id: 'U-22', name: 'Station Admin ST-0001', role: 'STATION_ADMIN' },
    action: 'OVERRIDE',
    entity: { type: 'STATION', id: 'ST-0001', label: 'Station ST-0001' },
    scope: { org: 'VOLT_MOBILITY', station: 'ST-0001' },
    outcome: 'SUCCESS',
    ip: '102.89.1.9',
    device: 'Android (App)',
    sensitive: true,
    reason: 'Emergency override to unlock swap bay #4',
    meta: { bay: 4 },
  },
  {
    id: 'AUD-87002',
    at: '2025-12-11 14:15',
    region: 'AMERICAS',
    actor: { id: 'U-10', name: 'Admin (Helpdesk)', role: 'EVZONE_ADMIN' },
    action: 'EXPORT',
    entity: { type: 'PAYMENT', id: 'LEDGER-DEC', label: 'Payments ledger' },
    scope: { org: '—' },
    outcome: 'DENIED',
    ip: '34.21.9.2',
    device: 'Web (Chrome)',
    sensitive: true,
    reason: 'Attempted export without elevated permission',
    meta: { request: 'ledger export', range: '30d' },
  },
]

async function apiListAudit(): Promise<AuditEvent[]> {
  await new Promise((r) => setTimeout(r, 120))
  return seed
}

export function AdminAuditLogsPage() {
  const [rows, setRows] = useState<AuditEvent[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region>('ALL')
  const [range, setRange] = useState<RangeId>('7d')
  const [action, setAction] = useState<Action | 'ALL'>('ALL')
  const [entity, setEntity] = useState<Entity | 'ALL'>('ALL')
  const [outcome, setOutcome] = useState<Outcome | 'ALL'>('ALL')
  const [sensitiveOnly, setSensitiveOnly] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    void (async () => setRows(await apiListAudit()))()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((e) => {
      const okR = region === 'ALL' || e.region === region || e.region === 'ALL'
      const okA = action === 'ALL' || e.action === action
      const okE = entity === 'ALL' || e.entity.type === entity
      const okO = outcome === 'ALL' || e.outcome === outcome
      const okS = !sensitiveOnly || e.sensitive
      const hay = (e.id +
        ' ' +
        e.at +
        ' ' +
        e.actor.name +
        ' ' +
        e.actor.role +
        ' ' +
        e.action +
        ' ' +
        e.entity.type +
        ' ' +
        e.entity.id +
        ' ' +
        e.entity.label +
        ' ' +
        (e.scope.org ?? '') +
        ' ' +
        (e.scope.station ?? '')).toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      // Range is demo-only: real backend would filter by timestamps
      return okR && okA && okE && okO && okS && okQ
    })
  }, [rows, q, region, range, action, entity, outcome, sensitiveOnly])

  const kpi = useMemo(() => {
    const total = filtered.length
    const sensitive = filtered.filter((x) => x.sensitive).length
    const denied = filtered.filter((x) => x.outcome === 'DENIED').length
    const failed = filtered.filter((x) => x.outcome === 'FAIL').length
    const overrides = filtered.filter((x) => x.action === 'OVERRIDE').length
    const impersonations = filtered.filter((x) => x.action === 'IMPERSONATE').length
    return { total, sensitive, denied, failed, overrides, impersonations }
  }, [filtered])

  const open = filtered.find((x) => x.id === openId) ?? rows.find((x) => x.id === openId) ?? null

  function reset() {
    setQ('')
    setRegion('ALL')
    setRange('7d')
    setAction('ALL')
    setEntity('ALL')
    setOutcome('ALL')
    setSensitiveOnly(false)
  }

  function exportCsv() {
    const headers = [
      'id',
      'at',
      'region',
      'actor_name',
      'actor_role',
      'action',
      'entity_type',
      'entity_id',
      'org',
      'station',
      'outcome',
      'ip',
      'device',
      'sensitive',
      'reason',
    ]
    const lines = [
      headers.join(','),
      ...filtered.map((e) =>
        [
          e.id,
          e.at,
          e.region,
          csv(e.actor.name),
          e.actor.role,
          e.action,
          e.entity.type,
          e.entity.id,
          csv(e.scope.org ?? ''),
          csv(e.scope.station ?? ''),
          e.outcome,
          e.ip,
          csv(e.device),
          String(e.sensitive),
          csv(e.reason ?? ''),
        ].join(','),
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evzone-audit-${nowDate()}-${range}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setToast('Export started (demo).')
    setTimeout(() => setToast(''), 1500)
  }

  return (
    <DashboardLayout pageTitle="Audit Logs & Compliance">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search id/actor/action/entity/org/station" value={q} onChange={(e) => setQ(e.target.value)} />
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
          <select className="select" value={action} onChange={(e) => setAction(e.target.value as any)}>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a === 'ALL' ? 'All Actions' : a}
              </option>
            ))}
          </select>
          <select className="select" value={entity} onChange={(e) => setEntity(e.target.value as any)}>
            {entities.map((x) => (
              <option key={x} value={x}>
                {x === 'ALL' ? 'All Entities' : x}
              </option>
            ))}
          </select>
          <select className="select" value={outcome} onChange={(e) => setOutcome(e.target.value as any)}>
            {outcomes.map((x) => (
              <option key={x} value={x}>
                {x === 'ALL' ? 'All Outcomes' : x}
              </option>
            ))}
          </select>

          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={sensitiveOnly} onChange={(e) => setSensitiveOnly(e.target.checked)} />
            <span className="small">
              <strong>Sensitive</strong> only
            </span>
          </label>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={reset}>
            Reset
          </button>
          <button className="btn secondary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="kpi-grid">
          <Kpi label="Events" value={String(kpi.total)} hint={`Range: ${range}`} />
          <Kpi label="Sensitive" value={String(kpi.sensitive)} hint="Impersonation/override/exports" />
          <Kpi label="Denied" value={String(kpi.denied)} hint="Blocked actions" tone={kpi.denied ? 'danger' : 'ok'} />
          <Kpi label="Failed" value={String(kpi.failed)} hint="Errors" tone={kpi.failed ? 'danger' : 'ok'} />
          <Kpi label="Overrides" value={String(kpi.overrides)} hint="Break-glass events" />
          <Kpi label="Impersonations" value={String(kpi.impersonations)} hint="Support actions" />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Events</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Scope</th>
                  <th>Region</th>
                  <th>Outcome</th>
                  <th>Sensitive</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 900 }}>
                      <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => setOpenId(e.id)}>
                        {e.id}
                      </button>
                    </td>
                    <td className="small">{e.at}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{e.actor.name}</div>
                      <div className="small">{e.actor.role}</div>
                    </td>
                    <td className="small">{e.action}</td>
                    <td className="small">
                      <div style={{ fontWeight: 800 }}>{e.entity.type}</div>
                      <div className="small">{e.entity.id}</div>
                    </td>
                    <td className="small">
                      <div>{e.scope.org ?? '—'}</div>
                      <div>{e.scope.station ?? '—'}</div>
                    </td>
                    <td className="small">{e.region}</td>
                    <td>
                      <OutcomePill outcome={e.outcome} />
                    </td>
                    <td>{e.sensitive ? <span className="pill sendback">Yes</span> : <span className="pill approved">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ height: 10 }} />
          <div className="panel">Backend should enforce immutable storage, pagination, and RBAC (who can export/see sensitive events).</div>
        </div>

        <div className="card">
          <div className="card-title">Compliance controls (placeholders)</div>
          <div className="grid">
            <div className="panel">
              <div style={{ fontWeight: 900 }}>Retention</div>
              <div className="small">Keep audit logs for 1–7 years (policy per region).</div>
            </div>
            <div className="panel">
              <div style={{ fontWeight: 900 }}>Break-glass</div>
              <div className="small">Require reason + ticket id; alert on usage; auto-expire access.</div>
            </div>
            <div className="panel">
              <div style={{ fontWeight: 900 }}>PII access</div>
              <div className="small">Mask sensitive fields unless elevated permission.</div>
            </div>
            <div className="panel">
              <div style={{ fontWeight: 900 }}>Exports</div>
              <div className="small">Watermark exports; record export events; restrict by org/region.</div>
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="small">{toast}</div>
        </div>
      ) : null}

      {open ? <AuditDrawer event={open} onClose={() => setOpenId(null)} /> : null}
    </DashboardLayout>
  )
}

function OutcomePill({ outcome }: { outcome: Outcome }) {
  const cls = outcome === 'SUCCESS' ? 'approved' : outcome === 'DENIED' ? 'sendback' : 'rejected'
  return <span className={`pill ${cls}`}>{outcome}</span>
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'danger' | 'ok' }) {
  return (
    <div className="kpi">
      <div className="small" style={{ opacity: 0.85 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 22 }}>{value}</div>
      <div className="small" style={{ color: tone === 'danger' ? 'var(--danger)' : undefined }}>{hint}</div>
    </div>
  )
}

function AuditDrawer({ event, onClose }: { event: AuditEvent; onClose: () => void }) {
  const [tab, setTab] = useState<'details' | 'changes' | 'meta'>('details')

  async function copyJson() {
    try {
      const txt = JSON.stringify(event, null, 2)
      await navigator.clipboard.writeText(txt)
      alert('Copied JSON (demo).')
    } catch {
      alert('Copy not available.')
    }
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{event.id} • {event.action}</div>
            <div className="small">{event.at} • {event.region} • {event.outcome}</div>
          </div>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ height: 10 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>Details</button>
          <button className={`tab ${tab === 'changes' ? 'active' : ''}`} onClick={() => setTab('changes')}>Changes</button>
          <button className={`tab ${tab === 'meta' ? 'active' : ''}`} onClick={() => setTab('meta')}>Meta</button>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'details' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Actor</div>
              <div className="panel">
                <div style={{ fontWeight: 900 }}>{event.actor.name}</div>
                <div className="small">{event.actor.role} • {event.actor.id}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">IP: {event.ip} • Device: {event.device}</div>
              <div style={{ height: 10 }} />
              <div className="panel">Sensitive: {event.sensitive ? 'Yes' : 'No'}</div>
              {event.reason ? (
                <>
                  <div style={{ height: 10 }} />
                  <div className="panel">
                    <div style={{ fontWeight: 900 }}>Reason</div>
                    <div className="small">{event.reason}</div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Entity & scope</div>
              <div className="panel">
                <div style={{ fontWeight: 900 }}>{event.entity.type}</div>
                <div className="small">{event.entity.id} • {event.entity.label}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className="panel">Org: {event.scope.org ?? '—'}</div>
              <div style={{ height: 10 }} />
              <div className="panel">Station: {event.scope.station ?? '—'}</div>
              <div style={{ height: 10 }} />
              <div className="panel">Outcome: <strong>{event.outcome}</strong></div>
            </div>
          </div>
        ) : tab === 'changes' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Diff</div>
              {event.changes?.length ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {event.changes.map((c, idx) => (
                    <div key={idx} className="panel">
                      <div style={{ fontWeight: 900 }}>{c.field}</div>
                      <div className="small">from: {c.from}</div>
                      <div className="small">to: {c.to}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="panel">No field-level changes recorded for this event.</div>
              )}
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Controls (placeholders)</div>
              <div className="grid">
                <div className="panel">Require approval for high-risk changes (tariffs, payouts, role escalation).</div>
                <div className="panel">Auto-open incident on repeated DENIED/FAIL patterns.</div>
                <div className="panel">Link changes to tickets and change requests.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Metadata</div>
              <div className="panel" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(event.meta ?? {}, null, 2)}
              </div>
              <div style={{ height: 10 }} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn secondary" onClick={copyJson}>Copy JSON</button>
                <button className="btn secondary" onClick={() => alert('Placeholder: create ticket from audit event')}>Create ticket</button>
                <button className="btn secondary" onClick={() => alert('Placeholder: flag for compliance review')}>Flag</button>
              </div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Policy (placeholder)</div>
              <div className="panel">Sensitive events should trigger notifications and require a reason + ticket reference.</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function csv(v: string) {
  const s = v ?? ''
  if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"'
  return s
}
function nowDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
