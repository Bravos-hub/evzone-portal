import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import type { Role } from '@/core/auth/types'
import { RolePill } from '@/ui/components/RolePill'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'
import { OnboardingApprovalsPanel } from '@/features/admin/approvals/OnboardingApprovalsPanel'
import { ALL_ROLES as ROLES, apiListUsers as apiList, apiUpdateUser as apiUpdate, regions, type UserRow, type UserStatus } from './mockUsers'

type DrawerTab = 'profile' | 'access' | 'assignments' | 'activity'
type InviteModal = { open: boolean; name: string; email: string; role: Role; region: UserRow['region']; orgId: string }

export function AdminUsersRolesPage() {
  const nav = useNavigate()
  const [view, setView] = useState<'users' | 'approvals'>('users')
  const [rows, setRows] = useState<UserRow[]>([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState<Role | 'All'>('All')
  const [status, setStatus] = useState<UserStatus | 'All'>('All')
  const [region, setRegion] = useState<UserRow['region']>('ALL')
  const [org, setOrg] = useState<string>('ALL')
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<DrawerTab>('profile')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string>('')
  const [invite, setInvite] = useState<InviteModal>({
    open: false,
    name: '',
    email: '',
    role: 'EVZONE_OPERATOR',
    region: 'AFRICA',
    orgId: 'ORG_DEMO',
  })

  useEffect(() => {
    void (async () => setRows(await apiList()))()
  }, [])

  const orgs = useMemo(() => {
    const s = new Set(rows.map((r) => r.orgId).filter((x) => x !== '—'))
    return ['ALL', ...Array.from(s)]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okQ = !q || (r.id + ' ' + r.name + ' ' + r.email + ' ' + r.orgId).toLowerCase().includes(q.toLowerCase())
      const okRole = role === 'All' || r.role === role
      const okStatus = status === 'All' || r.status === status
      const okRegion = region === 'ALL' || r.region === region
      const okOrg = org === 'ALL' || r.orgId === org
      return okQ && okRole && okStatus && okRegion && okOrg
    })
  }, [rows, q, role, status, region, org])

  const kpi = useMemo(() => {
    const total = filtered.length
    const active = filtered.filter((r) => r.status === 'Active').length
    const pending = filtered.filter((r) => r.status === 'Pending').length
    const suspended = filtered.filter((r) => r.status === 'Suspended').length
    return { total, active, pending, suspended }
  }, [filtered])

  const openRow = rows.find((r) => r.id === openId) ?? null

  async function saveUser(patch: Partial<UserRow>) {
    if (!openRow) return
    setBusy(true)
    setNotice('')
    try {
      await apiUpdate(openRow.id, patch)
      setRows((list) => list.map((u) => (u.id === openRow.id ? { ...u, ...patch } : u)))
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function resetFilters() {
    setQ('')
    setRole('All')
    setStatus('All')
    setRegion('ALL')
    setOrg('ALL')
  }

  const risk = useMemo(() => {
    const privileged = [
      { when: '06m ago', actor: 'd.admin', action: 'Role change', target: 'U-0112 → MANAGER', sev: 'High' as const },
      { when: '19m ago', actor: 'c.sre', action: 'API key rotated', target: 'Platform', sev: 'Med' as const },
      { when: '42m ago', actor: 'b.billing', action: 'Ledger export', target: 'Region=EU', sev: 'Low' as const },
    ]

    const scopeChecks = [
      { label: 'Org mismatch', value: 2, hint: 'Users with role requiring org but orgId is missing/invalid' },
      { label: 'Station assignment drift', value: 3, hint: 'Assigned stations outside org scope (mock validation)' },
      { label: 'Privileged approvals pending', value: 5, hint: 'EVZONE_ADMIN/OPERATOR role change requests awaiting approval' },
    ]

    const sessionControls = [
      { when: 'Today 08:12', action: 'Suspended user', target: 'U-0261 (ATTENDANT)', result: 'Tokens revoked' },
      { when: 'Today 07:44', action: 'Force logout', target: 'U-0042 (EVZONE_OPERATOR)', result: 'All sessions invalidated' },
      { when: 'Yesterday 21:06', action: 'Unlock login', target: 'U-0180 (SITE_OWNER)', result: 'MFA reset requested' },
    ]

    return { privileged, scopeChecks, sessionControls }
  }, [])

  return (
    <DashboardLayout pageTitle="Users & Roles">
      <div className="tabs">
        <button className={`tab ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}>
          Users & roles
        </button>
        <button className={`tab ${view === 'approvals' ? 'active' : ''}`} onClick={() => setView('approvals')}>
          Onboarding approvals
        </button>
      </div>

      <div style={{ height: 12 }} />

      {view === 'approvals' ? (
        <OnboardingApprovalsPanel />
      ) : (
      <>
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search id/name/email/org" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <select className="select" value={org} onChange={(e) => setOrg(e.target.value)}>
            {orgs.map((o) => (
              <option key={o} value={o}>
                {o === 'ALL' ? 'All Orgs' : o}
              </option>
            ))}
          </select>
          <select className="select" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="All">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>

          <div style={{ flex: 1 }} />

          <button className="btn secondary" onClick={resetFilters}>
            Reset filters
          </button>
          <button className="btn" onClick={() => setInvite((m) => ({ ...m, open: true }))}>
            Invite user
          </button>
        </div>

        <div style={{ height: 16 }} />

        <div className="split">
          <span className="chip">
            <strong>{kpi.total}</strong> users
          </span>
          <span className="chip">
            <strong>{kpi.active}</strong> active
          </span>
          <span className="chip">
            <strong>{kpi.pending}</strong> pending
          </span>
          <span className="chip">
            <strong>{kpi.suspended}</strong> suspended
          </span>
          <div style={{ flex: 1 }} />
          <span className="small" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Click a user ID to edit access & assignments.</span>
        </div>
      </div>

      <div style={{ height: 20 }} />

      <div className="row2">
        <div className="card">
          <div className="card-title">Risk controls</div>
          <div className="grid">
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 900, color: 'var(--text)' }}>Privileged actions (last hour)</div>
                <span className="pill pending">{risk.privileged.length} events</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {risk.privileged.map((e) => (
                  <div key={e.when + e.actor + e.action} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {e.action}: {e.target}
                      </div>
                      <div className="small">{e.actor} • {e.when}</div>
                    </div>
                    <span className={`pill ${e.sev === 'High' ? 'rejected' : e.sev === 'Med' ? 'sendback' : 'approved'}`}>{e.sev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 900, color: 'var(--text)' }}>RBAC scope checks</div>
                <span className="pill sendback">Auto-check</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {risk.scopeChecks.map((c) => (
                  <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text)' }}>{c.label}</div>
                      <div className="small">{c.hint}</div>
                    </div>
                    <span className={`pill ${c.value === 0 ? 'approved' : c.value <= 2 ? 'sendback' : 'rejected'}`}>{c.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 10 }} />
              <div className="small" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                Note: backend enforcement is required; this UI simulates monitoring + drift detection with mocked signals.
              </div>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 900, color: 'var(--text)' }}>Session controls</div>
                <span className="pill approved">Enforced</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {risk.sessionControls.map((x) => (
                  <div key={x.when + x.action} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text)' }}>{x.action}</div>
                      <div className="small">{x.target} • {x.when}</div>
                    </div>
                    <span className="pill pending">{x.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Role</th>
              <th>Region</th>
              <th>Org</th>
              <th>Stations</th>
              <th>Status</th>
              <th>Last active</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 900 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => nav(`/admin/users/${r.id}`)}>
                    {r.id}
                  </button>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{r.name}</div>
                  <div className="small">{r.email}</div>
                </td>
                <td>
                  <RolePill role={r.role} />
                </td>
                <td>{r.region}</td>
                <td>{r.orgId}</td>
                <td>{r.stations.length ? r.stations.length : '—'}</td>
                <td>{r.status === 'Pending' && r.approvalStatus ? <StatusPill status={r.approvalStatus} /> : <span className="pill pending">{r.status}</span>}</td>
                <td className="small">{r.lastActive}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn secondary" onClick={() => nav(`/admin/users/${r.id}`)}>
                      View
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() =>
                        setRows((list) =>
                          list.map((u) => (u.id === r.id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u)),
                        )
                      }
                    >
                      {r.status === 'Suspended' ? 'Activate' : 'Suspend'}
                    </button>
                    <button className="btn secondary" onClick={() => setOpenId(r.id)}>
                      Edit
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

      {openRow ? (
        <UserDrawer row={openRow} tab={tab} setTab={setTab} busy={busy} onClose={() => setOpenId(null)} onSave={saveUser} />
      ) : null}

      {invite.open ? (
        <InviteUserModal
          model={invite}
          setModel={setInvite}
          onSubmit={() => {
            const newUser: UserRow = {
              id: 'U-' + Math.floor(1000 + Math.random() * 9000),
              name: invite.name || 'Invited User',
              email: invite.email || 'user@example.com',
              phone: '—',
              role: invite.role,
              status: 'Pending',
              region: invite.region,
              orgId: invite.role === 'EVZONE_ADMIN' ? '—' : invite.orgId || 'ORG_DEMO',
              stations: [],
              lastActive: '—',
              createdAt: new Date().toISOString().slice(0, 10),
              approvalStatus: 'Pending',
            }
            setRows((list) => [newUser, ...list])
            setInvite((m) => ({ ...m, open: false, name: '', email: '' }))
          }}
        />
      ) : null}
      </>
      )}
    </DashboardLayout>
  )
}

function UserDrawer({
  row,
  tab,
  setTab,
  busy,
  onClose,
  onSave,
}: {
  row: UserRow
  tab: DrawerTab
  setTab: (t: DrawerTab) => void
  busy: boolean
  onClose: () => void
  onSave: (patch: Partial<UserRow>) => void
}) {
  const [name, setName] = useState(row.name)
  const [phone, setPhone] = useState(row.phone)
  const [role, setRole] = useState<Role>(row.role)
  const [region, setRegion] = useState<UserRow['region']>(row.region)
  const [orgId, setOrgId] = useState(row.orgId)
  const [stations, setStations] = useState(row.stations.join(', '))

  useEffect(() => {
    setName(row.name)
    setPhone(row.phone)
    setRole(row.role)
    setRegion(row.region)
    setOrgId(row.orgId)
    setStations(row.stations.join(', '))
  }, [row])

  function save() {
    onSave({
      name,
      phone,
      role,
      region,
      orgId: role === 'EVZONE_ADMIN' ? '—' : orgId,
      stations: stations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.name}</div>
            <div className="small">
              {row.id} • {row.email}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            Profile
          </button>
          <button className={`tab ${tab === 'access' ? 'active' : ''}`} onClick={() => setTab('access')}>
            Access
          </button>
          <button className={`tab ${tab === 'assignments' ? 'active' : ''}`} onClick={() => setTab('assignments')}>
            Assignments
          </button>
          <button className={`tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            Activity
          </button>
        </div>

        <div style={{ height: 12 }} />

        {tab === 'profile' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">User profile</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label>
                  <div className="small">Name</div>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                  <div className="small">Phone</div>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <div className="kv">
                  <div className="k">Email</div>
                  <div className="v">{row.email}</div>
                  <div className="k">Created</div>
                  <div className="v">{row.createdAt}</div>
                  <div className="k">Last active</div>
                  <div className="v">{row.lastActive}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Account controls</div>
              <div className="grid">
                <button className="btn secondary" onClick={() => onSave({ status: row.status === 'Suspended' ? 'Active' : 'Suspended' })}>
                  {row.status === 'Suspended' ? 'Activate user' : 'Suspend user'}
                </button>
                <button className="btn secondary" onClick={() => alert('Placeholder: reset password flow')}>
                  Reset password
                </button>
                <button className="btn secondary" onClick={() => alert('Placeholder: force logout/tokens revoke')}>
                  Force logout
                </button>
              </div>
            </div>
          </div>
        ) : tab === 'access' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Role & scope</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label>
                  <div className="small">Role</div>
                  <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Region scope</div>
                  <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div className="small">Organization (if applicable)</div>
                  <input className="input" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
                </label>
                <div className="panel">Backend enforcement note: role grants permissions, scope limits records.</div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Privileges (placeholder)</div>
              <div className="grid">
                <div className="panel">Feature flags, impersonation, overrides, approval requirements.</div>
                <div className="panel">Audit logging required for any privileged changes.</div>
              </div>
            </div>
          </div>
        ) : tab === 'assignments' ? (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Station assignments</div>
              <div className="small" style={{ marginBottom: 8 }}>
                Comma-separated station IDs for the demo. In production this is a picker scoped by org/region.
              </div>
              <input className="input" value={stations} onChange={(e) => setStations(e.target.value)} />
              <div style={{ height: 10 }} />
              <div className="panel">Rules: Managers see only assigned stations; attendants typically one station per shift.</div>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Org assignments (placeholder)</div>
              <div className="grid">
                <div className="panel">Org membership, station-admin coverage, owner org admins.</div>
                <div className="panel">Technician org vs public marketplace.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Activity feed (placeholder)</div>
              <div className="panel">Login events, role changes, approvals, station actions.</div>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
              <div className="card-title">Audit log link (placeholder)</div>
              <div className="panel">Deep link to /admin/audit with filters set to user id.</div>
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

function InviteUserModal({ model, setModel, onSubmit }: { model: InviteModal; setModel: (m: InviteModal) => void; onSubmit: () => void }) {
  return (
    <div className="modal">
      <div className="overlay" onClick={() => setModel({ ...model, open: false })} />
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Invite user</div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Close
          </button>
        </div>
        <div style={{ height: 10 }} />
        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            <div className="small">Name</div>
            <input className="input" value={model.name} onChange={(e) => setModel({ ...model, name: e.target.value })} />
          </label>
          <label>
            <div className="small">Email</div>
            <input className="input" value={model.email} onChange={(e) => setModel({ ...model, email: e.target.value })} />
          </label>
          <label>
            <div className="small">Role</div>
            <select className="select" value={model.role} onChange={(e) => setModel({ ...model, role: e.target.value as Role })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
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
          <label>
            <div className="small">Org (optional)</div>
            <input className="input" value={model.orgId} onChange={(e) => setModel({ ...model, orgId: e.target.value })} />
          </label>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Cancel
          </button>
          <button className="btn" onClick={onSubmit}>
            Send invite
          </button>
        </div>
      </div>
    </div>
  )
}
