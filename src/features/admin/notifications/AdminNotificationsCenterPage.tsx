import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import {
  deleteNotifications,
  genId,
  loadNotifications,
  setNotificationStatus,
  sevRank,
  upsertNotification,
  updatePrefs,
  upsertRule,
  type NotificationKind,
  type NotificationRow,
  type NotificationSeverity,
  type NotificationStatus,
  type NotificationRule,
} from './mockNotifications'

function pillForSeverity(s: NotificationSeverity) {
  const cls = s === 'Critical' ? 'rejected' : s === 'High' ? 'sendback' : s === 'Medium' ? 'pending' : 'approved'
  return <span className={`pill ${cls}`}>{s}</span>
}

function pillForStatus(s: NotificationStatus) {
  const cls = s === 'Unread' ? 'sendback' : s === 'Muted' ? 'pending' : 'approved'
  return <span className={`pill ${cls}`}>{s}</span>
}

export function AdminNotificationsCenterPage() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'inbox' | 'rules' | 'settings'>('inbox')
  const [store, setStore] = useState(() => loadNotifications())
  const [toast, setToast] = useState('')

  const [q, setQ] = useState('')
  const [kind, setKind] = useState<NotificationKind | 'All'>('All')
  const [minSev, setMinSev] = useState<NotificationSeverity | 'All'>('All')
  const [status, setStatus] = useState<NotificationStatus | 'All'>('All')
  const [sel, setSel] = useState<Record<string, boolean>>({})

  const [compose, setCompose] = useState<{
    open: boolean
    kind: NotificationKind
    severity: NotificationSeverity
    title: string
    body: string
    link: string
  }>({
    open: false,
    kind: 'System',
    severity: 'Info',
    title: '',
    body: '',
    link: '',
  })

  useEffect(() => {
    const on = () => setStore(loadNotifications())
    window.addEventListener('evzone:mockNotifications', on as EventListener)
    return () => window.removeEventListener('evzone:mockNotifications', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const rows = store.rows

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        const okQ = !q || `${r.id} ${r.title} ${r.body} ${r.kind} ${r.severity} ${r.source}`.toLowerCase().includes(q.toLowerCase())
        const okK = kind === 'All' || r.kind === kind
        const okS = status === 'All' || r.status === status
        const okMin = minSev === 'All' || sevRank(r.severity) >= sevRank(minSev)
        return okQ && okK && okS && okMin
      })
      .sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
  }, [rows, q, kind, status, minSev])

  const counts = useMemo(() => {
    const unread = rows.filter((r) => r.status === 'Unread').length
    const high = rows.filter((r) => sevRank(r.severity) >= sevRank('High') && r.status !== 'Read').length
    const incidents = rows.filter((r) => r.kind === 'Incident' && r.status !== 'Read').length
    const compliance = rows.filter((r) => r.kind === 'Compliance' && r.status !== 'Read').length
    return { unread, high, incidents, compliance }
  }, [rows])

  const selectedIds = useMemo(() => Object.entries(sel).filter(([, v]) => v).map(([k]) => k), [sel])
  const allChecked = filtered.length > 0 && filtered.every((r) => sel[r.id])

  function toggleAll() {
    const v = !allChecked
    const next: Record<string, boolean> = {}
    filtered.forEach((r) => (next[r.id] = v))
    setSel(next)
  }

  function toggle(id: string) {
    setSel((s) => ({ ...s, [id]: !s[id] }))
  }

  function bulk(status: NotificationStatus) {
    if (selectedIds.length === 0) return setToast('Select at least one item.')
    setNotificationStatus(selectedIds, status)
    setSel({})
    setToast(`Updated ${selectedIds.length} item(s).`)
  }

  function bulkDelete() {
    if (selectedIds.length === 0) return setToast('Select at least one item.')
    deleteNotifications(selectedIds)
    setSel({})
    setToast(`Deleted ${selectedIds.length} item(s).`)
  }

  function sendTest() {
    const id = genId('NTF')
    upsertNotification({
      id,
      when: 'now',
      kind: compose.kind,
      severity: compose.severity,
      title: compose.title || 'Test notification',
      body: compose.body || 'This is a test delivery from Notification Center (mock).',
      status: 'Unread',
      source: 'notification-center',
      region: 'GLOBAL',
      tags: ['test'],
      link: compose.link || undefined,
    })
    setCompose({ open: false, kind: 'System', severity: 'Info', title: '', body: '', link: '' })
    setToast('Test notification created (mock).')
    setTab('inbox')
  }

  return (
    <DashboardLayout pageTitle="Notifications Center">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-black">Notifications Center</div>
            <div className="text-xs text-muted">Operational inbox + routing rules + delivery settings (mock)</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn secondary" onClick={() => setCompose((m) => ({ ...m, open: true }))}>
              Send test
            </button>
            <button className="btn secondary" onClick={() => setTab('rules')}>
              Rules
            </button>
            <button className="btn secondary" onClick={() => setTab('settings')}>
              Settings
            </button>
            <button className="btn" onClick={() => setTab('inbox')}>
              Inbox
            </button>
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Unread" value={String(counts.unread)} />
        <KpiCard title="High/Critical" value={String(counts.high)} />
        <KpiCard title="Incident alerts" value={String(counts.incidents)} />
        <KpiCard title="Compliance" value={String(counts.compliance)} />
      </div>

      <div className="h-4" />

      <div className="tabs">
        <button className={`tab ${tab === 'inbox' ? 'active' : ''}`} onClick={() => setTab('inbox')}>
          Inbox
        </button>
        <button className={`tab ${tab === 'rules' ? 'active' : ''}`} onClick={() => setTab('rules')}>
          Routing rules
        </button>
        <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          Delivery settings
        </button>
      </div>

      <div className="h-3" />

      {tab === 'inbox' ? (
        <>
          <div className="card">
            <div className="split">
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id/title/body/source" />
              <select className="select" value={kind} onChange={(e) => setKind(e.target.value as any)}>
                <option value="All">All kinds</option>
                {(['Incident', 'Security', 'Billing', 'System', 'Ops', 'Compliance'] as NotificationKind[]).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <select className="select" value={minSev} onChange={(e) => setMinSev(e.target.value as any)}>
                <option value="All">All severity</option>
                {(['Info', 'Low', 'Medium', 'High', 'Critical'] as NotificationSeverity[]).map((s) => (
                  <option key={s} value={s}>
                    ≥ {s}
                  </option>
                ))}
              </select>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="All">All status</option>
                {(['Unread', 'Read', 'Muted'] as NotificationStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div style={{ flex: 1 }} />

              <button className="btn secondary" onClick={() => bulk('Read')} disabled={selectedIds.length === 0}>
                Mark read
              </button>
              <button className="btn secondary" onClick={() => bulk('Unread')} disabled={selectedIds.length === 0}>
                Mark unread
              </button>
              <button className="btn secondary" onClick={() => bulk('Muted')} disabled={selectedIds.length === 0}>
                Mute
              </button>
              <button className="btn secondary" onClick={bulkDelete} disabled={selectedIds.length === 0}>
                Delete
              </button>
            </div>
          </div>

          <div className="h-3" />

          <Card className="p-0">
            <div className="p-5 border-b border-border-light flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="card-title mb-1">Inbox</div>
                <div className="text-xs text-muted">{filtered.length} items</div>
              </div>
              <div className="text-xs text-muted">Select rows for bulk actions.</div>
            </div>
            <div className="table-wrap rounded-none border-0 shadow-none">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>
                      <input type="checkbox" className="checkbox" checked={allChecked} onChange={toggleAll} />
                    </th>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Kind</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>When</th>
                    <th>Source</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input type="checkbox" className="checkbox" checked={!!sel[r.id]} onChange={() => toggle(r.id)} />
                      </td>
                      <td style={{ fontWeight: 900 }}>{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 800 }}>{r.title}</div>
                        <div className="small">{r.body}</div>
                        <div className="small">{r.tags.map((t) => `#${t}`).join(' ')}</div>
                      </td>
                      <td className="small">{r.kind}</td>
                      <td>{pillForSeverity(r.severity)}</td>
                      <td>{pillForStatus(r.status)}</td>
                      <td className="small">{r.when}</td>
                      <td className="small">{r.source}</td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {r.link ? (
                            <button
                              className="btn secondary"
                              onClick={() => {
                                setNotificationStatus([r.id], 'Read')
                                nav(r.link!)
                              }}
                            >
                              Open
                            </button>
                          ) : (
                            <button className="btn secondary" onClick={() => setNotificationStatus([r.id], 'Read')}>
                              Acknowledge
                            </button>
                          )}
                          <button className="btn secondary" onClick={() => setNotificationStatus([r.id], r.status === 'Muted' ? 'Unread' : 'Muted')}>
                            {r.status === 'Muted' ? 'Unmute' : 'Mute'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      {tab === 'rules' ? (
        <RulesPanel
          rules={store.rules}
          onSave={(rule) => {
            upsertRule(rule)
            setToast('Rule saved.')
          }}
        />
      ) : null}

      {tab === 'settings' ? (
        <SettingsPanel
          prefs={store.prefs}
          onSave={(patch) => {
            updatePrefs(patch)
            setToast('Settings saved.')
          }}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}

      {compose.open ? (
        <div className="fixed inset-0 z-[90] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCompose((m) => ({ ...m, open: false }))} />
          <div className="relative w-[min(860px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-extrabold text-text">Send test notification</div>
                <div className="text-xs text-muted">Creates an inbox item + triggers mock routing.</div>
              </div>
              <button className="btn secondary" onClick={() => setCompose((m) => ({ ...m, open: false }))}>
                Close
              </button>
            </div>
            <div className="h-3" />
            <div className="grid gap-3">
              <div className="split">
                <label style={{ flex: 1 }}>
                  <div className="small">Kind</div>
                  <select className="select" value={compose.kind} onChange={(e) => setCompose((m) => ({ ...m, kind: e.target.value as any }))}>
                    {(['Incident', 'Security', 'Billing', 'System', 'Ops', 'Compliance'] as NotificationKind[]).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <div className="small">Severity</div>
                  <select className="select" value={compose.severity} onChange={(e) => setCompose((m) => ({ ...m, severity: e.target.value as any }))}>
                    {(['Info', 'Low', 'Medium', 'High', 'Critical'] as NotificationSeverity[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <div className="small">Title</div>
                <input className="input" value={compose.title} onChange={(e) => setCompose((m) => ({ ...m, title: e.target.value }))} placeholder="e.g., SEV2: OCPP errors increasing" />
              </label>
              <label>
                <div className="small">Body</div>
                <textarea className="textarea" value={compose.body} onChange={(e) => setCompose((m) => ({ ...m, body: e.target.value }))} placeholder="Add a short description and recommended action/runbook." />
              </label>
              <label>
                <div className="small">Link (optional)</div>
                <input className="input" value={compose.link} onChange={(e) => setCompose((m) => ({ ...m, link: e.target.value }))} placeholder="/admin/incidents" />
              </label>
              <div className="panel">
                <div className="small">
                  Routing is mocked. In production: rules evaluate kind/severity/region and deliver to Email/SMS/Ops/In‑app with quiet-hours suppression.
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button className="btn secondary" onClick={() => setCompose((m) => ({ ...m, open: false }))}>
                  Cancel
                </button>
                <button className="btn" onClick={sendTest}>
                  Send test
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function RulesPanel({ rules, onSave }: { rules: NotificationRule[]; onSave: (r: NotificationRule) => void }) {
  const [editing, setEditing] = useState<NotificationRule | null>(null)

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Routing rules</div>
            <div className="text-xs text-muted">Match kind/severity/region and route to channels (mock).</div>
          </div>
          <button
            className="btn"
            onClick={() =>
              setEditing({
                id: genId('RULE'),
                name: 'New rule',
                enabled: true,
                match: { kinds: ['System'], minSeverity: 'Medium', region: 'ANY' },
                route: { to: ['inApp'] },
              })
            }
          >
            New rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
        {rules.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-text">
                  {r.name} <span className="text-xs text-muted font-semibold">• {r.id}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`pill ${r.enabled ? 'approved' : 'rejected'}`}>{r.enabled ? 'Enabled' : 'Disabled'}</span>
                  <span className="pill pending">Kinds: {r.match.kinds.join(', ')}</span>
                  <span className="pill pending">≥ {r.match.minSeverity}</span>
                  <span className="pill pending">Region: {r.match.region}</span>
                  <span className="pill pending">To: {r.route.to.join(', ')}</span>
                </div>
              </div>
              <button className="btn secondary" onClick={() => setEditing(r)}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing ? (
        <RuleModal
          rule={editing}
          onClose={() => setEditing(null)}
          onSave={(r) => {
            onSave(r)
            setEditing(null)
          }}
        />
      ) : null}
    </div>
  )
}

function RuleModal({ rule, onClose, onSave }: { rule: NotificationRule; onClose: () => void; onSave: (r: NotificationRule) => void }) {
  const [r, setR] = useState<NotificationRule>(rule)
  const kinds = ['Incident', 'Security', 'Billing', 'System', 'Ops', 'Compliance'] as NotificationKind[]
  const sev = ['Info', 'Low', 'Medium', 'High', 'Critical'] as NotificationSeverity[]
  const regions = ['ANY', 'AFRICA', 'EUROPE', 'AMERICAS', 'ASIA', 'MIDDLE_EAST', 'GLOBAL'] as Array<'ANY' | NotificationRow['region']>

  function toggleKind(k: NotificationKind) {
    setR((prev) => ({
      ...prev,
      match: { ...prev.match, kinds: prev.match.kinds.includes(k) ? prev.match.kinds.filter((x) => x !== k) : [...prev.match.kinds, k] },
    }))
  }

  function toggleRoute(ch: 'inApp' | 'email' | 'sms' | 'ops') {
    setR((prev) => ({
      ...prev,
      route: { ...prev.route, to: prev.route.to.includes(ch) ? prev.route.to.filter((x) => x !== ch) : [...prev.route.to, ch] },
    }))
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(860px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Edit rule</div>
            <div className="text-xs text-muted">{r.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn" onClick={() => onSave(r)}>
              Save
            </button>
          </div>
        </div>

        <div className="h-3" />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <label>
            <div className="small">Name</div>
            <input className="input" value={r.name} onChange={(e) => setR((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={r.enabled} onChange={(e) => setR((p) => ({ ...p, enabled: e.target.checked }))} />
            <span className="small">
              <strong>Enabled</strong>
            </span>
          </label>

          <div className="card col-span-2 xl:col-span-1">
            <div className="card-title">Match</div>
            <div className="grid gap-3">
              <div className="panel">
                <div className="small" style={{ fontWeight: 900 }}>
                  Kinds
                </div>
                <div className="h-2" />
                <div className="flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <button key={k} className={r.match.kinds.includes(k) ? 'pill approved' : 'pill pending'} onClick={() => toggleKind(k)}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="split">
                <label style={{ flex: 1 }}>
                  <div className="small">Min severity</div>
                  <select className="select" value={r.match.minSeverity} onChange={(e) => setR((p) => ({ ...p, match: { ...p.match, minSeverity: e.target.value as any } }))}>
                    {sev.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <div className="small">Region</div>
                  <select className="select" value={r.match.region} onChange={(e) => setR((p) => ({ ...p, match: { ...p.match, region: e.target.value as any } }))}>
                    {regions.map((x) => (
                      <option key={String(x)} value={String(x)}>
                        {String(x)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="card col-span-2 xl:col-span-1">
            <div className="card-title">Route</div>
            <div className="panel">
              <div className="flex flex-wrap gap-2">
                {(['inApp', 'email', 'sms', 'ops'] as const).map((ch) => (
                  <button key={ch} className={r.route.to.includes(ch) ? 'pill approved' : 'pill pending'} onClick={() => toggleRoute(ch)}>
                    {ch}
                  </button>
                ))}
              </div>
              {r.route.to.includes('ops') ? (
                <>
                  <div className="h-2" />
                  <label>
                    <div className="small">Ops channel</div>
                    <input className="input" value={r.route.opsChannel ?? ''} onChange={(e) => setR((p) => ({ ...p, route: { ...p.route, opsChannel: e.target.value } }))} placeholder="#ops-oncall" />
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPanel({
  prefs,
  onSave,
}: {
  prefs: {
    inApp: boolean
    email: boolean
    sms: boolean
    ops: boolean
    emailAddress: string
    phone: string
    quietHoursEnabled: boolean
    quietStart: string
    quietEnd: string
  }
  onSave: (patch: Partial<typeof prefs>) => void
}) {
  const [p, setP] = useState(prefs)
  useEffect(() => setP(prefs), [prefs])

  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
      <Card>
        <div className="card-title">Channels</div>
        <div className="grid gap-2">
          {(['inApp', 'email', 'sms', 'ops'] as const).map((k) => (
            <label key={k} className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
              <input type="checkbox" checked={p[k]} onChange={(e) => setP((x) => ({ ...x, [k]: e.target.checked }))} />
              <span className="small">
                <strong>{k}</strong> enabled
              </span>
            </label>
          ))}
        </div>
        <div className="h-3" />
        <div className="grid gap-3">
          <label>
            <div className="small">Email destination</div>
            <input className="input" value={p.emailAddress} onChange={(e) => setP((x) => ({ ...x, emailAddress: e.target.value }))} />
          </label>
          <label>
            <div className="small">Phone (SMS)</div>
            <input className="input" value={p.phone} onChange={(e) => setP((x) => ({ ...x, phone: e.target.value }))} />
          </label>
        </div>
        <div className="h-3" />
        <div className="flex items-center justify-end gap-2">
          <button className="btn secondary" onClick={() => setP(prefs)}>
            Reset
          </button>
          <button className="btn" onClick={() => onSave(p)}>
            Save settings
          </button>
        </div>
      </Card>

      <Card>
        <div className="card-title">Quiet hours</div>
        <div className="grid gap-3">
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={p.quietHoursEnabled} onChange={(e) => setP((x) => ({ ...x, quietHoursEnabled: e.target.checked }))} />
            <span className="small">
              <strong>Enable quiet hours</strong> (non-critical notifications delayed)
            </span>
          </label>
          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Start</div>
              <input className="input" value={p.quietStart} onChange={(e) => setP((x) => ({ ...x, quietStart: e.target.value }))} />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">End</div>
              <input className="input" value={p.quietEnd} onChange={(e) => setP((x) => ({ ...x, quietEnd: e.target.value }))} />
            </label>
          </div>
          <div className="panel">
            <div className="small">
              In production, critical incidents (SEV1) bypass quiet hours; others queue until the next window. This demo only stores preferences.
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="btn secondary" onClick={() => setP(prefs)}>
              Reset
            </button>
            <button className="btn" onClick={() => onSave(p)}>
              Save quiet hours
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}


