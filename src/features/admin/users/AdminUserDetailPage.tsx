import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { RolePill } from '@/ui/components/RolePill'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { apiGetUser, apiUpdateUser, ALL_ROLES, type UserRow, type UserStatus } from './mockUsers'

type SessionRow = {
  id: string
  device: string
  ip: string
  location: string
  lastActive: string
}

type AuditRow = { when: string; event: string; details: string }

function icon(name: 'bolt' | 'mail' | 'pause' | 'key' | 'x' | 'user' | 'clock' | 'shield') {
  switch (name) {
    case 'bolt':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      )
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      )
    case 'pause':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
        </svg>
      )
    case 'key':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="M12 12l6-6 3 3-6 6" />
          <path d="M11 13l-1-1" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )
    case 'user':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
          <path d="M3 22v-1a8 8 0 018-8h2a8 8 0 018 8v1" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2l7 3v6c0 5-3 9-7 11-4-2-7-6-7-11V5z" />
        </svg>
      )
  }
}

function sessionKey(id: string) {
  return `mock.sessions.${id}`
}
function auditKey(id: string) {
  return `mock.audit.${id}`
}

function loadSessions(id: string): SessionRow[] {
  try {
    const raw = localStorage.getItem(sessionKey(id))
    if (raw) return JSON.parse(raw) as SessionRow[]
  } catch {}
  return [
    { id: 'S-1', device: 'Chrome / Win', ip: '41.75.12.33', location: 'Kampala, UG', lastActive: '10:41' },
    { id: 'S-2', device: 'iOS App', ip: '41.75.12.44', location: 'Kampala, UG', lastActive: '09:12' },
  ]
}
function saveSessions(id: string, rows: SessionRow[]) {
  localStorage.setItem(sessionKey(id), JSON.stringify(rows))
}
function loadAudit(id: string): AuditRow[] {
  try {
    const raw = localStorage.getItem(auditKey(id))
    if (raw) return JSON.parse(raw) as AuditRow[]
  } catch {}
  return [
    { when: '11:40', event: 'Viewed user', details: 'Opened detail page' },
    { when: '10:12', event: 'Viewed report', details: '/operator/reports' },
    { when: 'Yesterday', event: 'Logged in', details: 'IP 41.75.12.33' },
  ]
}
function appendAudit(id: string, row: AuditRow) {
  const list = loadAudit(id)
  const next = [row, ...list].slice(0, 25)
  localStorage.setItem(auditKey(id), JSON.stringify(next))
  return next
}

function statusPill(status: UserStatus) {
  if (status === 'Active') return <span className="pill approved">Active</span>
  if (status === 'Suspended') return <span className="pill rejected">Suspended</span>
  return <span className="pill pending">Pending</span>
}

export function AdminUserDetailPage() {
  const nav = useNavigate()
  const params = useParams()
  const id = params.id ?? 'U-0001'
  const { impersonator, impersonationReturnTo, startImpersonation, stopImpersonation, user: sessionUser, logout } = useAuthStore()

  const [u, setU] = useState<UserRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string>('')
  const [pwModal, setPwModal] = useState<{ open: boolean; temp: string; when: string } | null>(null)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [audit, setAudit] = useState<AuditRow[]>([])

  useEffect(() => {
    void (async () => {
      const user = await apiGetUser(id)
      setU(user)
      if (typeof window !== 'undefined') {
        setSessions(loadSessions(id))
        setAudit(loadAudit(id))
        setAudit(appendAudit(id, { when: 'now', event: 'Viewed user', details: `Opened /admin/users/${id}` }))
      }
    })()
  }, [id])

  const pageTitle = useMemo(() => (u ? `User: ${u.name}` : 'User'), [u])

  async function patch(p: Partial<UserRow>, auditEvent: AuditRow) {
    if (!u) return
    setBusy(true)
    setNotice('')
    try {
      await apiUpdateUser(u.id, p)
      setU((prev) => (prev ? { ...prev, ...p } : prev))
      if (typeof window !== 'undefined') setAudit(appendAudit(u.id, auditEvent))
      if (p.status === 'Suspended' && sessionUser?.id?.toLowerCase() === u.id.toLowerCase()) {
        // if we suspended the currently logged-in user (including impersonated user), end the session appropriately
        if (impersonator) {
          const back = impersonationReturnTo || `/admin/users/${u.id}`
          stopImpersonation()
          nav(back)
          setNotice('Stopped impersonation because this user was suspended.')
        } else {
          logout()
          nav('/auth/login')
        }
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  if (!u) {
    return (
      <DashboardLayout pageTitle={pageTitle}>
        <Card>
          <div className="card-title">Loading</div>
          <div className="text-sm text-muted">Fetching user details…</div>
        </Card>
      </DashboardLayout>
    )
  }

  const isPending = u.status === 'Pending'
  const canImpersonate = u.role !== 'EVZONE_ADMIN'
  const mfaLabel = u.mfaEnabled ? 'Enabled' : 'Disabled'
  const isImpersonatingThisUser = impersonator ? sessionUser?.id?.toLowerCase() === u.id.toLowerCase() : false

  function roleHome(r: UserRow['role']) {
    switch (r) {
      case 'EVZONE_ADMIN':
        return '/admin'
      case 'EVZONE_OPERATOR':
        return '/operator'
      case 'SITE_OWNER':
        return '/site-owner'
      case 'OWNER':
        return '/owner/charge'
      case 'STATION_ADMIN':
        return '/station-admin'
      case 'MANAGER':
        return '/manager'
      case 'ATTENDANT':
        return '/attendant'
      case 'TECHNICIAN_ORG':
        return '/technician/org'
      case 'TECHNICIAN_PUBLIC':
        return '/technician/public'
    }
  }

  function genTempPassword() {
    // readable, demo-safe (mock)
    const part = () => Math.random().toString(16).slice(2, 6).toUpperCase()
    return `EVZ-${part()}-${part()}`
  }

  return (
    <DashboardLayout pageTitle={pageTitle}>
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent text-white grid place-items-center">{icon('bolt')}</div>
            <div>
              <div className="text-lg font-black">
                {u.name} <span className="text-xs text-muted font-semibold">({u.id})</span>
              </div>
              <div className="text-xs text-muted">{u.email} • {u.region} • {u.orgId}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusPill(u.status)}
            <RolePill role={u.role} />
          </div>
        </div>
      </div>

      <div className="h-3" />

      <div className="card">
        <div className="flex items-center gap-2 flex-wrap">
          {isPending ? (
            <button
              className="btn"
              onClick={() => patch({ status: 'Pending' }, { when: 'now', event: 'Invite sent', details: 'Resent onboarding invite (mock)' })}
              disabled={busy}
            >
              <span className="inline-flex items-center gap-2">{icon('mail')} Send invite</span>
            </button>
          ) : (
            <>
              <button
                className="btn"
                onClick={() =>
                  patch(
                    { status: u.status === 'Active' ? 'Suspended' : 'Active' },
                    { when: 'now', event: u.status === 'Active' ? 'Suspended user' : 'Activated user', details: `${u.id} (${u.role})` },
                  )
                }
                disabled={busy}
              >
                <span className="inline-flex items-center gap-2">
                  {icon('pause')} {u.status === 'Active' ? 'Suspend' : 'Activate'}
                </span>
              </button>
              <button
                className="btn secondary"
                onClick={async () => {
                  const temp = genTempPassword()
                  const when = new Date().toISOString()
                  await patch(
                    { passwordResetAt: when, tempPassword: temp },
                    { when: 'now', event: 'Reset password', details: 'Temporary password generated (mock)' },
                  )
                  setPwModal({ open: true, temp, when })
                }}
                disabled={busy}
              >
                <span className="inline-flex items-center gap-2">{icon('key')} Reset password</span>
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  const next: SessionRow[] = []
                  setSessions(next)
                  saveSessions(u.id, next)
                  void patch({ tokensRevokedAt: new Date().toISOString() }, { when: 'now', event: 'Force logout', details: 'All sessions revoked (mock)' })
                }}
                disabled={busy}
              >
                <span className="inline-flex items-center gap-2">{icon('x')} Force logout</span>
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  if (isImpersonatingThisUser) {
                    const back = impersonationReturnTo || `/admin/users/${u.id}`
                    stopImpersonation()
                    setAudit(appendAudit(u.id, { when: 'now', event: 'Stop impersonation', details: 'Stopped impersonation' }))
                    nav(back)
                    setNotice('Stopped impersonation.')
                    return
                  }
                  // Impersonate by swapping the session, but remember where to return for auditing.
                  startImpersonation(
                    { id: u.id, name: u.name, role: u.role, ownerCapability: u.role === 'OWNER' ? 'CHARGE' : undefined },
                    window.location.pathname + window.location.search,
                  )
                  setAudit(appendAudit(u.id, { when: 'now', event: 'Impersonate', details: 'Started impersonation' }))
                  nav(roleHome(u.role))
                }}
                disabled={!canImpersonate || busy}
                title={!canImpersonate ? 'Cannot impersonate an admin in this demo.' : undefined}
              >
                {isImpersonatingThisUser ? 'Stop impersonation' : 'Impersonate'}
              </button>
            </>
          )}

          <div style={{ flex: 1 }} />
          <button className="btn secondary" onClick={() => nav('/admin/users')}>Back to Users</button>
        </div>
        {notice ? (
          <>
            <div className="h-3" />
            <div className="panel">{notice}</div>
          </>
        ) : null}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-5 gap-4 xl:grid-cols-2">
        <KpiCard title="Organization" value={u.orgId === '—' ? '—' : u.orgId} />
        <KpiCard title="Role" value={u.role} />
        <KpiCard title="MFA" value={mfaLabel} />
        <KpiCard title="Created" value={u.createdAt} />
        <KpiCard title="Last seen" value={u.lastActive} />
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
        <Card>
          <div className="card-title">Profile</div>
          <div className="grid gap-2 text-sm">
            <Row k="Name" v={u.name} />
            <Row k="Email" v={u.email} />
            <Row k="Phone" v={u.phone} />
            <Row k="Region" v={u.region} />
            <Row k="Org" v={u.orgId} />
            <Row k="Stations" v={u.stations.length ? u.stations.join(', ') : '—'} />
          </div>
        </Card>

        <Card>
          <div className="card-title">Security</div>
          <div className="grid gap-2 text-sm">
            <div className="panel flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                {icon('shield')} MFA
              </div>
              <button
                className="btn secondary"
                onClick={() =>
                  patch(
                    { mfaEnabled: !u.mfaEnabled },
                    { when: 'now', event: 'MFA toggled', details: `MFA ${u.mfaEnabled ? 'disabled' : 'enabled'} (mock)` },
                  )
                }
                disabled={busy}
              >
                {u.mfaEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div className="panel flex items-center justify-between">
              <div className="inline-flex items-center gap-2">{icon('clock')} Tokens</div>
              <button
                className="btn secondary"
                onClick={() => setAudit(appendAudit(u.id, { when: 'now', event: 'Rotate tokens', details: 'Issued new refresh tokens (mock)' }))}
                disabled={busy}
              >
                Rotate tokens
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="h-4" />

      <Card>
        <div className="card-title">Roles & permissions</div>
        <div className="panel mb-3">
          Privileged role changes should require approval + audit logging. This demo updates immediately, but still records an audit entry.
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_ROLES.map((r) => (
            <button
              key={r}
              className={r === u.role ? 'pill approved' : 'pill pending'}
              onClick={() => patch({ role: r }, { when: 'now', event: 'Role changed', details: `→ ${r}` })}
              disabled={busy}
            >
              {r}
            </button>
          ))}
        </div>
      </Card>

      <div className="h-4" />

      <Card className="p-0">
        <div className="p-5 border-b border-border-light">
          <div className="card-title mb-1">Active sessions</div>
          <div className="text-xs text-muted">{sessions.length} sessions</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>Device</th>
                <th>IP</th>
                <th>Location</th>
                <th>Last active</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted text-sm">No active sessions.</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.device}</td>
                    <td>{s.ip}</td>
                    <td>{s.location}</td>
                    <td className="text-xs text-muted">{s.lastActive}</td>
                    <td className="text-right">
                      <button
                        className="btn secondary"
                        onClick={() => {
                          const next = sessions.filter((x) => x.id !== s.id)
                          setSessions(next)
                          saveSessions(u.id, next)
                          setAudit(appendAudit(u.id, { when: 'now', event: 'Revoke session', details: `${s.device} (${s.ip})` }))
                        }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="h-4" />

      <Card className="p-0">
        <div className="p-5 border-b border-border-light">
          <div className="card-title mb-1">Audit log</div>
          <div className="text-xs text-muted">Most recent actions (mock)</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a, idx) => (
                <tr key={a.when + a.event + idx}>
                  <td className="text-xs text-muted">{a.when}</td>
                  <td className="font-semibold">{a.event}</td>
                  <td className="text-xs text-muted">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pwModal?.open ? (
        <div className="fixed inset-0 grid place-items-center z-[80]">
          <div className="fixed inset-0 bg-[rgba(0,0,0,.6)] backdrop-blur-sm" onClick={() => setPwModal(null)} />
          <div className="w-[min(560px,92vw)] bg-panel border border-border-light rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="font-black">Temporary password</div>
              <button className="btn secondary" onClick={() => setPwModal(null)}>Close</button>
            </div>
            <div className="h-2" />
            <div className="text-xs text-muted">Share this once. It is stored only in this demo (mock).</div>
            <div className="h-3" />
            <div className="panel flex items-center justify-between gap-3">
              <div className="font-mono text-sm text-text">{pwModal.temp}</div>
              <button
                className="btn secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pwModal.temp)
                    setNotice('Temporary password copied.')
                  } catch {
                    setNotice('Copy failed.')
                  }
                }}
              >
                Copy
              </button>
            </div>
            <div className="h-3" />
            <div className="text-xs text-muted">Reset at: {pwModal.when}</div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-muted">{k}</div>
      <div className="text-sm font-semibold text-text text-right">{v}</div>
    </div>
  )
}


