import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { useAuthStore } from '@/core/auth/authStore'
import {
  appendConfigAudit,
  defaultGlobalConfig,
  loadConfigAudit,
  loadGlobalConfig,
  saveGlobalConfig,
  type ConfigAudit,
  type FeatureFlag,
  type GlobalConfig,
  type MaintenanceWindow,
} from './mockGlobalConfig'

function deepEqual(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

function pill(kind: 'ok' | 'warn' | 'danger', text: string) {
  const cls = kind === 'ok' ? 'approved' : kind === 'warn' ? 'sendback' : 'rejected'
  return <span className={`pill ${cls}`}>{text}</span>
}

export function AdminGlobalConfigPage() {
  const { user } = useAuthStore()
  const actor = user?.name ?? user?.id ?? 'Delta (Admin)'

  const [tab, setTab] = useState<'overview' | 'flags' | 'security' | 'billing' | 'limits' | 'maintenance' | 'audit'>('overview')
  const [base, setBase] = useState<GlobalConfig>(() => loadGlobalConfig())
  const [draft, setDraft] = useState<GlobalConfig>(() => loadGlobalConfig())
  const [audit, setAudit] = useState<ConfigAudit[]>(() => loadConfigAudit())

  const [publish, setPublish] = useState<{ open: boolean; reason: string } | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const on = () => {
      setBase(loadGlobalConfig())
      setDraft(loadGlobalConfig())
      setAudit(loadConfigAudit())
    }
    window.addEventListener('evzone:mockGlobalConfig', on as EventListener)
    return () => window.removeEventListener('evzone:mockGlobalConfig', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const dirty = useMemo(() => !deepEqual(base, draft), [base, draft])
  const sensitiveChange = useMemo(() => {
    return (
      base.security.sessionTtlHours !== draft.security.sessionTtlHours ||
      base.security.mfaRequiredForAdmins !== draft.security.mfaRequiredForAdmins ||
      base.security.ipAllowlistEnabled !== draft.security.ipAllowlistEnabled ||
      base.limits.exportExpiryHours !== draft.limits.exportExpiryHours
    )
  }, [base, draft])

  const kpis = useMemo(() => {
    const enabledFlags = draft.flags.filter((f) => f.enabled).length
    const windows = draft.maintenance.length
    const ipEnabled = draft.security.ipAllowlistEnabled
    return { enabledFlags, windows, ipEnabled }
  }, [draft])

  function resetToSaved() {
    setDraft(loadGlobalConfig())
    setToast('Reverted to saved config.')
  }

  function resetToDefault() {
    const def = defaultGlobalConfig()
    setDraft(def)
    setToast('Loaded default config into draft (not published).')
  }

  function doPublish(reason: string) {
    saveGlobalConfig(draft)
    appendConfigAudit({
      actor,
      scope: sensitiveChange ? 'security/limits' : 'general',
      summary: `Published config v${draft.version} (${dirty ? 'updated' : 'no changes'})`,
      reason,
    })
    setBase(draft)
    setAudit(loadConfigAudit())
    setPublish(null)
    setToast('Published (mock).')
  }

  return (
    <DashboardLayout pageTitle="Global Configuration">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-black">Global Configuration</div>
            <div className="text-xs text-muted">Environment-wide settings for feature flags, security, billing, limits, and maintenance (mock)</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {dirty ? pill('warn', 'Unsaved draft') : pill('ok', 'In sync')}
            {sensitiveChange ? pill('danger', 'Sensitive changes') : pill('ok', 'Non-sensitive')}
            <button className="btn secondary" onClick={resetToSaved} disabled={!dirty}>
              Discard
            </button>
            <button className="btn secondary" onClick={resetToDefault}>
              Load defaults
            </button>
            <button className="btn" onClick={() => setPublish({ open: true, reason: '' })} disabled={!dirty}>
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Config version" value={`v${draft.version}`} />
        <KpiCard title="Enabled flags" value={String(kpis.enabledFlags)} />
        <KpiCard title="Maintenance windows" value={String(kpis.windows)} />
        <KpiCard title="IP allowlist" value={kpis.ipEnabled ? 'Enabled' : 'Off'} />
      </div>

      <div className="h-4" />

      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={`tab ${tab === 'flags' ? 'active' : ''}`} onClick={() => setTab('flags')}>
          Feature flags
        </button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>
          Security
        </button>
        <button className={`tab ${tab === 'billing' ? 'active' : ''}`} onClick={() => setTab('billing')}>
          Billing
        </button>
        <button className={`tab ${tab === 'limits' ? 'active' : ''}`} onClick={() => setTab('limits')}>
          Limits
        </button>
        <button className={`tab ${tab === 'maintenance' ? 'active' : ''}`} onClick={() => setTab('maintenance')}>
          Maintenance
        </button>
        <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>
          Audit
        </button>
      </div>

      <div className="h-3" />

      {tab === 'overview' ? (
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
          <Card>
            <div className="card-title">Environment</div>
            <div className="grid gap-3">
              <label>
                <div className="small">Environment</div>
                <select className="select" value={draft.env} onChange={(e) => setDraft((p) => ({ ...p, env: e.target.value as any }))}>
                  <option value="demo">demo</option>
                  <option value="staging">staging</option>
                  <option value="prod">prod</option>
                </select>
              </label>
              <label>
                <div className="small">Default region</div>
                <select
                  className="select"
                  value={draft.defaultRegion}
                  onChange={(e) => setDraft((p) => ({ ...p, defaultRegion: e.target.value as any }))}
                >
                  <option value="AFRICA">AFRICA</option>
                  <option value="EUROPE">EUROPE</option>
                  <option value="AMERICAS">AMERICAS</option>
                  <option value="ASIA">ASIA</option>
                  <option value="MIDDLE_EAST">MIDDLE_EAST</option>
                </select>
              </label>
              <div className="panel">
                <div className="text-xs text-muted">Notes</div>
                <div className="small">
                  - In a real backend, publishing would create an audit log entry and propagate via config service.<br />
                  - Some changes would require approvals (security/billing).
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="card-title">At-a-glance</div>
            <div className="grid gap-3">
              <div className="panel">
                <div className="text-sm font-extrabold text-text">Security posture</div>
                <div className="small">
                  MFA for admins: <strong>{draft.security.mfaRequiredForAdmins ? 'On' : 'Off'}</strong> • Session TTL:{' '}
                  <strong>{draft.security.sessionTtlHours}h</strong> • Ticket required: <strong>{draft.security.requireTicketForSensitiveActions ? 'Yes' : 'No'}</strong>
                </div>
              </div>
              <div className="panel">
                <div className="text-sm font-extrabold text-text">Export controls</div>
                <div className="small">
                  Expiry: <strong>{draft.limits.exportExpiryHours}h</strong> • Max rows: <strong>{draft.limits.maxExportRows.toLocaleString()}</strong> • Concurrency:{' '}
                  <strong>{draft.limits.maxConcurrentExports}</strong>
                </div>
              </div>
              <div className="panel">
                <div className="text-sm font-extrabold text-text">Maintenance</div>
                <div className="small">{draft.maintenance.length} windows configured • Next window: {draft.maintenance[0]?.startUtc ?? '—'}</div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'flags' ? <FlagsPanel flags={draft.flags} onSet={(next) => setDraft((p) => ({ ...p, flags: next }))} /> : null}
      {tab === 'security' ? <SecurityPanel cfg={draft} onSet={setDraft} /> : null}
      {tab === 'billing' ? <BillingPanel cfg={draft} onSet={setDraft} /> : null}
      {tab === 'limits' ? <LimitsPanel cfg={draft} onSet={setDraft} /> : null}
      {tab === 'maintenance' ? <MaintenancePanel windows={draft.maintenance} onSet={(next) => setDraft((p) => ({ ...p, maintenance: next }))} /> : null}
      {tab === 'audit' ? <AuditPanel rows={audit} /> : null}

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}

      {publish?.open ? (
        <div className="fixed inset-0 z-[90] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPublish(null)} />
          <div className="relative w-[min(720px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-extrabold text-text">Publish configuration</div>
                <div className="text-xs text-muted">Write changes to the config store (mock) + audit</div>
              </div>
              <button className="btn secondary" onClick={() => setPublish(null)}>
                Close
              </button>
            </div>
            <div className="h-3" />
            <div className="panel">
              <div className="small">
                Publishing will apply changes immediately in this demo. Sensitive changes require a reason.
              </div>
            </div>
            <div className="h-3" />
            <label>
              <div className="small">Reason (required)</div>
              <textarea
                className="textarea"
                value={publish.reason}
                onChange={(e) => setPublish((p) => (p ? { ...p, reason: e.target.value } : p))}
                placeholder="Ticket id + justification (e.g., TCK-10021 — reduce export expiry for compliance)"
              />
            </label>
            <div className="h-3" />
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <button className="btn secondary" onClick={() => setPublish(null)}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => {
                  const reason = publish.reason.trim()
                  if (!reason) return setToast('Reason required to publish.')
                  if (sensitiveChange && !/TCK-\d{4,}/i.test(reason)) return setToast('Ticket id required for sensitive publish (e.g., TCK-10021).')
                  doPublish(reason)
                }}
              >
                Publish now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function FlagsPanel({ flags, onSet }: { flags: FeatureFlag[]; onSet: (next: FeatureFlag[]) => void }) {
  return (
    <div className="grid gap-4">
      {flags.map((f) => (
        <div key={f.key} className="card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-extrabold text-text">
                {f.label} <span className="text-xs text-muted font-semibold">• {f.key}</span>
              </div>
              <div className="text-xs text-muted">{f.description}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="pill pending">Owner: {f.owner}</span>
                <span className="pill pending">Rollout: {f.rolloutPct}%</span>
                {f.enabled ? <span className="pill approved">Enabled</span> : <span className="pill rejected">Disabled</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="btn secondary"
                onClick={() => onSet(flags.map((x) => (x.key === f.key ? { ...x, enabled: !x.enabled } : x)))}
              >
                {f.enabled ? 'Disable' : 'Enable'}
              </button>
              <label className="panel" style={{ padding: '8px 10px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="small">Rollout</span>
                <input
                  className="input"
                  style={{ width: 90, padding: '6px 10px' }}
                  value={String(f.rolloutPct)}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, Number(e.target.value || 0)))
                    onSet(flags.map((x) => (x.key === f.key ? { ...x, rolloutPct: Number.isFinite(v) ? v : x.rolloutPct } : x)))
                  }}
                />
                <span className="small">%</span>
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SecurityPanel({ cfg, onSet }: { cfg: GlobalConfig; onSet: (next: GlobalConfig) => void }) {
  const s = cfg.security
  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
      <Card>
        <div className="card-title">Authentication & sessions</div>
        <div className="grid gap-3">
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={s.mfaRequiredForAdmins} onChange={(e) => onSet({ ...cfg, security: { ...s, mfaRequiredForAdmins: e.target.checked } })} />
            <span className="small">
              <strong>Require MFA for admins</strong>
            </span>
          </label>
          <label>
            <div className="small">Session TTL (hours)</div>
            <input
              className="input"
              value={String(s.sessionTtlHours)}
              onChange={(e) => onSet({ ...cfg, security: { ...s, sessionTtlHours: Math.max(1, Number(e.target.value || 1)) } })}
            />
          </label>
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input
              type="checkbox"
              checked={s.requireTicketForSensitiveActions}
              onChange={(e) => onSet({ ...cfg, security: { ...s, requireTicketForSensitiveActions: e.target.checked } })}
            />
            <span className="small">
              <strong>Require ticket for sensitive actions</strong> (exports, impersonation, token rotation)
            </span>
          </label>
        </div>
      </Card>

      <Card>
        <div className="card-title">IP allowlist</div>
        <div className="grid gap-3">
          <label className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px' }}>
            <input type="checkbox" checked={s.ipAllowlistEnabled} onChange={(e) => onSet({ ...cfg, security: { ...s, ipAllowlistEnabled: e.target.checked } })} />
            <span className="small">
              <strong>Enable IP allowlist</strong>
            </span>
          </label>
          <label>
            <div className="small">Allowlist entries (comma separated)</div>
            <textarea
              className="textarea"
              value={s.ipAllowlist.join(', ')}
              onChange={(e) =>
                onSet({
                  ...cfg,
                  security: { ...s, ipAllowlist: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) },
                })
              }
              placeholder="e.g., 10.0.0.0/8, 41.75.12.14/32"
            />
          </label>
          <div className="panel">
            <div className="small">
              Backend would enforce allowlist on auth gateway and admin routes. This is UI-only in the demo.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function BillingPanel({ cfg, onSet }: { cfg: GlobalConfig; onSet: (next: GlobalConfig) => void }) {
  const b = cfg.billing
  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
      <Card>
        <div className="card-title">Currency & tax</div>
        <div className="grid gap-3">
          <label>
            <div className="small">Default currency</div>
            <select className="select" value={b.currency} onChange={(e) => onSet({ ...cfg, billing: { ...b, currency: e.target.value as any } })}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UGX">UGX</option>
            </select>
          </label>
          <label>
            <div className="small">VAT (%)</div>
            <input className="input" value={String(b.vatPct)} onChange={(e) => onSet({ ...cfg, billing: { ...b, vatPct: Math.max(0, Number(e.target.value || 0)) } })} />
          </label>
        </div>
      </Card>
      <Card>
        <div className="card-title">Settlement & disputes</div>
        <div className="grid gap-3">
          <label>
            <div className="small">Settlement delay (days)</div>
            <input
              className="input"
              value={String(b.settlementDelayDays)}
              onChange={(e) => onSet({ ...cfg, billing: { ...b, settlementDelayDays: Math.max(0, Number(e.target.value || 0)) } })}
            />
          </label>
          <label>
            <div className="small">Auto-close disputes (days)</div>
            <input
              className="input"
              value={String(b.disputeAutoCloseDays)}
              onChange={(e) => onSet({ ...cfg, billing: { ...b, disputeAutoCloseDays: Math.max(1, Number(e.target.value || 1)) } })}
            />
          </label>
        </div>
      </Card>
    </div>
  )
}

function LimitsPanel({ cfg, onSet }: { cfg: GlobalConfig; onSet: (next: GlobalConfig) => void }) {
  const l = cfg.limits
  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
      <Card>
        <div className="card-title">Exports</div>
        <div className="grid gap-3">
          <label>
            <div className="small">Export expiry (hours)</div>
            <input className="input" value={String(l.exportExpiryHours)} onChange={(e) => onSet({ ...cfg, limits: { ...l, exportExpiryHours: Math.max(1, Number(e.target.value || 1)) } })} />
          </label>
          <label>
            <div className="small">Max export rows</div>
            <input className="input" value={String(l.maxExportRows)} onChange={(e) => onSet({ ...cfg, limits: { ...l, maxExportRows: Math.max(1000, Number(e.target.value || 1000)) } })} />
          </label>
          <label>
            <div className="small">Max concurrent exports</div>
            <input
              className="input"
              value={String(l.maxConcurrentExports)}
              onChange={(e) => onSet({ ...cfg, limits: { ...l, maxConcurrentExports: Math.max(1, Number(e.target.value || 1)) } })}
            />
          </label>
        </div>
      </Card>
      <Card>
        <div className="card-title">Incident operations</div>
        <div className="grid gap-3">
          <label>
            <div className="small">Update cadence (mins)</div>
            <input
              className="input"
              value={String(l.incidentUpdateCadenceMins)}
              onChange={(e) => onSet({ ...cfg, limits: { ...l, incidentUpdateCadenceMins: Math.max(15, Number(e.target.value || 15)) } })}
            />
          </label>
          <div className="panel">
            <div className="small">Used by incident tooling to suggest next update times and notify comms owners.</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function MaintenancePanel({ windows, onSet }: { windows: MaintenanceWindow[]; onSet: (next: MaintenanceWindow[]) => void }) {
  const [newWin, setNewWin] = useState<MaintenanceWindow>({
    id: `MW-${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    startUtc: '',
    endUtc: '',
    scope: 'Service',
    target: '',
    notify: true,
  })

  function add() {
    if (!newWin.title.trim()) return
    onSet([{ ...newWin, id: `MW-${Math.floor(100 + Math.random() * 900)}` }, ...windows])
    setNewWin({ ...newWin, title: '', startUtc: '', endUtc: '', target: '' })
  }

  return (
    <div className="grid gap-4">
      <Card>
        <div className="card-title">Create window</div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <label>
            <div className="small">Title</div>
            <input className="input" value={newWin.title} onChange={(e) => setNewWin((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Core API rolling restart" />
          </label>
          <label>
            <div className="small">Scope</div>
            <select className="select" value={newWin.scope} onChange={(e) => setNewWin((p) => ({ ...p, scope: e.target.value as any }))}>
              <option value="Global">Global</option>
              <option value="Region">Region</option>
              <option value="Service">Service</option>
            </select>
          </label>
          <label>
            <div className="small">Target</div>
            <input className="input" value={newWin.target} onChange={(e) => setNewWin((p) => ({ ...p, target: e.target.value }))} placeholder="e.g., core-api / AFRICA" />
          </label>
          <label>
            <div className="small">Notify</div>
            <select className="select" value={newWin.notify ? 'yes' : 'no'} onChange={(e) => setNewWin((p) => ({ ...p, notify: e.target.value === 'yes' }))}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <div className="small">Start (UTC)</div>
            <input className="input" value={newWin.startUtc} onChange={(e) => setNewWin((p) => ({ ...p, startUtc: e.target.value }))} placeholder="YYYY-MM-DD HH:mm" />
          </label>
          <label>
            <div className="small">End (UTC)</div>
            <input className="input" value={newWin.endUtc} onChange={(e) => setNewWin((p) => ({ ...p, endUtc: e.target.value }))} placeholder="YYYY-MM-DD HH:mm" />
          </label>
        </div>
        <div className="h-3" />
        <div className="flex items-center justify-end">
          <button className="btn" onClick={add}>
            Add window
          </button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="p-5 border-b border-border-light">
          <div className="card-title mb-1">Scheduled windows</div>
          <div className="text-xs text-muted">{windows.length} windows</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Scope</th>
                <th>Target</th>
                <th>Start</th>
                <th>End</th>
                <th>Notify</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 900 }}>{w.id}</td>
                  <td style={{ fontWeight: 800 }}>{w.title}</td>
                  <td className="small">{w.scope}</td>
                  <td className="small">{w.target}</td>
                  <td className="small">{w.startUtc}</td>
                  <td className="small">{w.endUtc}</td>
                  <td>{w.notify ? <span className="pill approved">Yes</span> : <span className="pill pending">No</span>}</td>
                  <td className="text-right">
                    <button className="btn secondary" onClick={() => onSet(windows.filter((x) => x.id !== w.id))}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function AuditPanel({ rows }: { rows: ConfigAudit[] }) {
  return (
    <Card className="p-0">
      <div className="p-5 border-b border-border-light">
        <div className="card-title mb-1">Change audit</div>
        <div className="text-xs text-muted">Most recent config publishes (mock)</div>
      </div>
      <div className="table-wrap rounded-none border-0 shadow-none">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Scope</th>
              <th>Summary</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="small">{r.when}</td>
                <td className="small">{r.actor}</td>
                <td className="small">{r.scope}</td>
                <td style={{ fontWeight: 800 }}>{r.summary}</td>
                <td className="small">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}


