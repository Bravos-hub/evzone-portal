import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { useAuthStore } from '@/core/auth/authStore'
import {
  appendAudit,
  createApiKey,
  createSecret,
  loadIntegrations,
  retireSecret,
  revokeApiKey,
  rotateSecret,
  rotateWebhookSecret,
  toggleWebhook,
  type ApiKey,
  type IntegrationsAudit,
  type KeyScope,
  type Secret,
  type WebhookEndpoint,
} from './mockIntegrations'

function pct(v: number) {
  return `${Math.round(v * 100)}%`
}

function pill(cls: string, text: string) {
  return <span className={`pill ${cls}`}>{text}</span>
}

export function AdminIntegrationsPage() {
  const nav = useNavigate()
  const { user } = useAuthStore()
  const actor = user?.name ?? user?.id ?? 'Delta (Admin)'

  const [tab, setTab] = useState<'keys' | 'webhooks' | 'secrets' | 'audit'>('keys')
  const [store, setStore] = useState(() => loadIntegrations())
  const [toast, setToast] = useState('')

  const [openKey, setOpenKey] = useState<ApiKey | null>(null)
  const [openWebhook, setOpenWebhook] = useState<WebhookEndpoint | null>(null)
  const [openSecret, setOpenSecret] = useState<Secret | null>(null)

  const [createKeyModal, setCreateKeyModal] = useState<{ open: boolean; name: string; owner: string; org: string; scopes: KeyScope[] }>({
    open: false,
    name: '',
    owner: 'Delta (Admin)',
    org: 'GLOBAL',
    scopes: ['read'],
  })
  const [createSecretModal, setCreateSecretModal] = useState<{ open: boolean; name: string; kind: Secret['kind']; owner: string; notes: string }>({
    open: false,
    name: '',
    kind: 'Provider token',
    owner: 'Billing Ops',
    notes: '',
  })
  const [reasonModal, setReasonModal] = useState<{ open: boolean; kind: 'revokeKey'; id: string; reason: string } | null>(null)

  useEffect(() => {
    const on = () => setStore(loadIntegrations())
    window.addEventListener('evzone:mockIntegrations', on as EventListener)
    return () => window.removeEventListener('evzone:mockIntegrations', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const kpis = useMemo(() => {
    const activeKeys = store.keys.filter((k) => k.status === 'Active').length
    const failingWebhooks = store.webhooks.filter((w) => w.status === 'Failing').length
    const activeSecrets = store.secrets.filter((s) => s.status !== 'Retired').length
    const lastAudit = store.audit[0]?.when ?? '—'
    return { activeKeys, failingWebhooks, activeSecrets, lastAudit }
  }, [store])

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setToast('Copied to clipboard.')
    } catch {
      setToast('Copy failed.')
    }
  }

  return (
    <DashboardLayout pageTitle="Integration Keys / Webhooks / Secrets">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-black">Integrations</div>
            <div className="text-xs text-muted">Keys, webhooks, and secrets management (mock)</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn secondary" onClick={() => nav('/admin/webhooks')}>
              View webhook logs
            </button>
            <button className="btn secondary" onClick={() => setCreateSecretModal((m) => ({ ...m, open: true }))}>
              New secret
            </button>
            <button className="btn" onClick={() => setCreateKeyModal((m) => ({ ...m, open: true }))}>
              New API key
            </button>
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Active API keys" value={String(kpis.activeKeys)} />
        <KpiCard title="Failing webhooks" value={String(kpis.failingWebhooks)} />
        <KpiCard title="Active secrets" value={String(kpis.activeSecrets)} />
        <KpiCard title="Last audit" value={String(kpis.lastAudit)} />
      </div>

      <div className="h-4" />

      <div className="tabs">
        <button className={`tab ${tab === 'keys' ? 'active' : ''}`} onClick={() => setTab('keys')}>
          API keys
        </button>
        <button className={`tab ${tab === 'webhooks' ? 'active' : ''}`} onClick={() => setTab('webhooks')}>
          Webhooks
        </button>
        <button className={`tab ${tab === 'secrets' ? 'active' : ''}`} onClick={() => setTab('secrets')}>
          Secrets
        </button>
        <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>
          Audit
        </button>
      </div>

      <div className="h-3" />

      {tab === 'keys' ? (
        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="card-title mb-1">API keys</div>
            <div className="text-xs text-muted">Create, revoke, and scope partner access (mock).</div>
          </div>
          <div className="table-wrap rounded-none border-0 shadow-none">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Org</th>
                  <th>Owner</th>
                  <th>Scopes</th>
                  <th>Status</th>
                  <th>Last used</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.keys.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 900 }}>{k.id}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{k.name}</div>
                      <div className="small">{k.maskedKey}</div>
                    </td>
                    <td className="small">{k.org}</td>
                    <td className="small">{k.owner}</td>
                    <td className="small">{k.scopes.join(', ')}</td>
                    <td>{pill(k.status === 'Active' ? 'approved' : k.status === 'Revoked' ? 'rejected' : 'sendback', k.status)}</td>
                    <td className="small">{k.lastUsedAt}</td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn secondary" onClick={() => setOpenKey(k)}>
                          Open
                        </button>
                        <button className="btn secondary" onClick={() => copy(k.maskedKey)}>
                          Copy
                        </button>
                        <button
                          className="btn secondary"
                          disabled={k.status !== 'Active'}
                          onClick={() => setReasonModal({ open: true, kind: 'revokeKey', id: k.id, reason: '' })}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'webhooks' ? (
        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="card-title mb-1">Webhook endpoints</div>
            <div className="text-xs text-muted">Delivery health and signing secrets (mock).</div>
          </div>
          <div className="table-wrap rounded-none border-0 shadow-none">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Org</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Success</th>
                  <th>p95</th>
                  <th>Retries (24h)</th>
                  <th>Events</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.webhooks.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 900 }}>{w.id}</td>
                    <td className="small">{w.org}</td>
                    <td className="small">{w.url}</td>
                    <td>{pill(w.status === 'Active' ? 'approved' : w.status === 'Paused' ? 'pending' : 'rejected', w.status)}</td>
                    <td className="small">{pct(w.successRate)}</td>
                    <td className="small">{w.p95ms}ms</td>
                    <td className="small">{w.retries24h}</td>
                    <td className="small">{w.events.length}</td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn secondary" onClick={() => setOpenWebhook(w)}>
                          Open
                        </button>
                        <button className="btn secondary" onClick={() => toggleWebhook(w.id, actor)}>
                          {w.status === 'Paused' ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            const secret = rotateWebhookSecret(w.id, actor)
                            setToast('Webhook secret rotated.')
                            if (secret) copy(secret)
                          }}
                        >
                          Rotate secret
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'secrets' ? (
        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="card-title mb-1">Secrets</div>
            <div className="text-xs text-muted">Provider tokens, OAuth secrets, signing keys (mock).</div>
          </div>
          <div className="table-wrap rounded-none border-0 shadow-none">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Kind</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Updated</th>
                  <th>Last rotated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.secrets.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 900 }}>{s.id}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{s.name}</div>
                      <div className="small">{s.masked}</div>
                    </td>
                    <td className="small">{s.kind}</td>
                    <td>{pill(s.status === 'Active' ? 'approved' : s.status === 'Rotated' ? 'sendback' : 'rejected', s.status)}</td>
                    <td className="small">{s.owner}</td>
                    <td className="small">{s.updatedAt}</td>
                    <td className="small">{s.lastRotatedAt}</td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn secondary" onClick={() => setOpenSecret(s)}>
                          Open
                        </button>
                        <button
                          className="btn"
                          disabled={s.status === 'Retired'}
                          onClick={() => {
                            const plain = rotateSecret(s.id, actor)
                            setToast('Secret rotated.')
                            if (plain) copy(plain)
                          }}
                        >
                          Rotate
                        </button>
                        <button className="btn secondary" disabled={s.status === 'Retired'} onClick={() => retireSecret(s.id, actor)}>
                          Retire
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'audit' ? (
        <AuditTable rows={store.audit} />
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}

      {openKey ? <KeyDrawer row={openKey} onClose={() => setOpenKey(null)} onCopy={copy} /> : null}
      {openWebhook ? <WebhookDrawer row={openWebhook} onClose={() => setOpenWebhook(null)} /> : null}
      {openSecret ? <SecretDrawer row={openSecret} onClose={() => setOpenSecret(null)} onCopy={copy} /> : null}

      {createKeyModal.open ? (
        <CreateKeyModal
          model={createKeyModal}
          setModel={setCreateKeyModal}
          onCreate={() => {
            const row = createApiKey(
              { name: createKeyModal.name || 'New API key', owner: createKeyModal.owner, org: createKeyModal.org as any, scopes: createKeyModal.scopes },
              actor,
            )
            setCreateKeyModal({ open: false, name: '', owner: 'Delta (Admin)', org: 'GLOBAL', scopes: ['read'] })
            setToast('API key created. Copy it now.')
            if (row.plainKey) copy(row.plainKey)
          }}
        />
      ) : null}

      {createSecretModal.open ? (
        <CreateSecretModal
          model={createSecretModal}
          setModel={setCreateSecretModal}
          onCreate={() => {
            const row = createSecret(
              { name: createSecretModal.name || 'New secret', kind: createSecretModal.kind, owner: createSecretModal.owner, notes: createSecretModal.notes },
              actor,
            )
            setCreateSecretModal({ open: false, name: '', kind: 'Provider token', owner: 'Billing Ops', notes: '' })
            setToast('Secret created. Copy it now.')
            if (row.plain) copy(row.plain)
          }}
        />
      ) : null}

      {reasonModal?.open ? (
        <ReasonModal
          model={reasonModal}
          setModel={setReasonModal}
          onConfirm={() => {
            if (!reasonModal.reason.trim()) return setToast('Reason required.')
            revokeApiKey(reasonModal.id, actor, reasonModal.reason)
            setReasonModal(null)
            setToast('API key revoked.')
          }}
        />
      ) : null}
    </DashboardLayout>
  )
}

function AuditTable({ rows }: { rows: IntegrationsAudit[] }) {
  return (
    <Card className="p-0">
      <div className="p-5 border-b border-border-light">
        <div className="card-title mb-1">Audit</div>
        <div className="text-xs text-muted">Most recent key/secret/webhook changes (mock).</div>
      </div>
      <div className="table-wrap rounded-none border-0 shadow-none">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="small">{a.when}</td>
                <td className="small">{a.actor}</td>
                <td style={{ fontWeight: 800 }}>{a.action}</td>
                <td className="small">{a.target}</td>
                <td className="small">{a.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function KeyDrawer({ row, onClose, onCopy }: { row: ApiKey; onClose: () => void; onCopy: (t: string) => void }) {
  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.name}</div>
            <div className="small">
              {row.id} • {row.org} • {row.status}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ height: 12 }} />
        <div className="grid">
          <div className="panel">Scopes: {row.scopes.join(', ')}</div>
          <div className="panel">Created: {row.createdAt} • Last used: {row.lastUsedAt}</div>
          <div className="panel">
            Key: <strong className="text-text">{row.maskedKey}</strong>
            <div style={{ height: 8 }} />
            <button className="btn secondary" onClick={() => onCopy(row.maskedKey)}>
              Copy masked
            </button>
            {row.plainKey ? (
              <>
                <span style={{ margin: '0 8px' }} />
                <button className="btn" onClick={() => onCopy(row.plainKey!)}>
                  Copy full key
                </button>
              </>
            ) : (
              <div className="small" style={{ marginTop: 8 }}>
                Full key is only shown once at creation time (demo behavior).
              </div>
            )}
          </div>
          <div className="panel">Backend: store hash only, enforce scopes, rotate keys, and log usage.</div>
        </div>
      </div>
    </>
  )
}

function WebhookDrawer({ row, onClose }: { row: WebhookEndpoint; onClose: () => void }) {
  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.id} • {row.org}</div>
            <div className="small">{row.url}</div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ height: 12 }} />
        <div className="grid">
          <div className="panel">
            Status: <strong>{row.status}</strong> • Success {pct(row.successRate)} • p95 {row.p95ms}ms • retries {row.retries24h} (24h)
          </div>
          <div className="panel">
            Signing secret: <strong>{row.secretMasked}</strong>
            <div className="small" style={{ marginTop: 8 }}>
              Rotate secret if partner endpoint is compromised or secret leaked.
            </div>
          </div>
          <div className="panel">
            Events ({row.events.length}):
            <div className="h-2" />
            <div className="grid gap-1 text-sm">
              {row.events.map((e) => (
                <div key={e} className="small">
                  {e}
                </div>
              ))}
            </div>
          </div>
          <div className="panel">Use Webhooks Log for delivery-level retries and payload inspection (mock route exists).</div>
        </div>
      </div>
    </>
  )
}

function SecretDrawer({ row, onClose, onCopy }: { row: Secret; onClose: () => void; onCopy: (t: string) => void }) {
  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{row.name}</div>
            <div className="small">
              {row.id} • {row.kind} • {row.status}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ height: 12 }} />
        <div className="grid">
          <div className="panel">Owner: {row.owner}</div>
          <div className="panel">Updated: {row.updatedAt} • Last rotated: {row.lastRotatedAt}</div>
          <div className="panel">
            Secret: <strong className="text-text">{row.masked}</strong>
            <div style={{ height: 8 }} />
            <button className="btn secondary" onClick={() => onCopy(row.masked)}>
              Copy masked
            </button>
            {row.plain ? (
              <>
                <span style={{ margin: '0 8px' }} />
                <button className="btn" onClick={() => onCopy(row.plain!)}>
                  Copy full secret
                </button>
              </>
            ) : (
              <div className="small" style={{ marginTop: 8 }}>
                Full secret is only shown immediately after create/rotate (demo behavior).
              </div>
            )}
          </div>
          <div className="panel">{row.notes}</div>
        </div>
      </div>
    </>
  )
}

function CreateKeyModal({
  model,
  setModel,
  onCreate,
}: {
  model: { open: boolean; name: string; owner: string; org: string; scopes: KeyScope[] }
  setModel: (m: { open: boolean; name: string; owner: string; org: string; scopes: KeyScope[] }) => void
  onCreate: () => void
}) {
  function toggleScope(s: KeyScope) {
    setModel({ ...model, scopes: model.scopes.includes(s) ? model.scopes.filter((x) => x !== s) : [...model.scopes, s] })
  }
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setModel({ ...model, open: false })} />
      <div className="relative w-[min(860px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Create API key</div>
            <div className="text-xs text-muted">Key is shown once. Store safely.</div>
          </div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Close
          </button>
        </div>
        <div className="h-3" />
        <div className="grid gap-3">
          <label>
            <div className="small">Name</div>
            <input className="input" value={model.name} onChange={(e) => setModel({ ...model, name: e.target.value })} placeholder="e.g., Partner API — Volt" />
          </label>
          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Owner</div>
              <input className="input" value={model.owner} onChange={(e) => setModel({ ...model, owner: e.target.value })} />
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Org</div>
              <input className="input" value={model.org} onChange={(e) => setModel({ ...model, org: e.target.value })} placeholder="GLOBAL or ORG_ID" />
            </label>
          </div>
          <div className="panel">
            <div className="small" style={{ fontWeight: 900 }}>
              Scopes
            </div>
            <div className="h-2" />
            <div className="flex flex-wrap gap-2">
              {(['read', 'write', 'admin'] as KeyScope[]).map((s) => (
                <button key={s} className={model.scopes.includes(s) ? 'pill approved' : 'pill pending'} onClick={() => toggleScope(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="panel">Backend: store hash only, enforce scopes, rate limits, and per-org boundaries.</div>
          <div className="flex items-center justify-end gap-2">
            <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
              Cancel
            </button>
            <button className="btn" onClick={onCreate} disabled={model.scopes.length === 0}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateSecretModal({
  model,
  setModel,
  onCreate,
}: {
  model: { open: boolean; name: string; kind: Secret['kind']; owner: string; notes: string }
  setModel: (m: { open: boolean; name: string; kind: Secret['kind']; owner: string; notes: string }) => void
  onCreate: () => void
}) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setModel({ ...model, open: false })} />
      <div className="relative w-[min(860px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Create secret</div>
            <div className="text-xs text-muted">Secret is shown once. Store safely.</div>
          </div>
          <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
            Close
          </button>
        </div>
        <div className="h-3" />
        <div className="grid gap-3">
          <label>
            <div className="small">Name</div>
            <input className="input" value={model.name} onChange={(e) => setModel({ ...model, name: e.target.value })} placeholder="e.g., Stripe secret" />
          </label>
          <div className="split">
            <label style={{ flex: 1 }}>
              <div className="small">Kind</div>
              <select className="select" value={model.kind} onChange={(e) => setModel({ ...model, kind: e.target.value as any })}>
                <option value="Provider token">Provider token</option>
                <option value="OAuth client secret">OAuth client secret</option>
                <option value="Signing key">Signing key</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>
              <div className="small">Owner</div>
              <input className="input" value={model.owner} onChange={(e) => setModel({ ...model, owner: e.target.value })} />
            </label>
          </div>
          <label>
            <div className="small">Notes</div>
            <textarea className="textarea" value={model.notes} onChange={(e) => setModel({ ...model, notes: e.target.value })} placeholder="Where is this used? Rotation policy?" />
          </label>
          <div className="flex items-center justify-end gap-2">
            <button className="btn secondary" onClick={() => setModel({ ...model, open: false })}>
              Cancel
            </button>
            <button className="btn" onClick={onCreate}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReasonModal({
  model,
  setModel,
  onConfirm,
}: {
  model: { open: boolean; kind: 'revokeKey'; id: string; reason: string }
  setModel: (m: { open: boolean; kind: 'revokeKey'; id: string; reason: string } | null) => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setModel(null)} />
      <div className="relative w-[min(720px,94vw)] rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Confirm revoke</div>
            <div className="text-xs text-muted">{model.id}</div>
          </div>
          <button className="btn secondary" onClick={() => setModel(null)}>
            Close
          </button>
        </div>
        <div className="h-3" />
        <label>
          <div className="small">Reason (required)</div>
          <textarea className="textarea" value={model.reason} onChange={(e) => setModel({ ...model, reason: e.target.value })} placeholder="Ticket id + justification" />
        </label>
        <div className="h-3" />
        <div className="flex items-center justify-end gap-2">
          <button className="btn secondary" onClick={() => setModel(null)}>
            Cancel
          </button>
          <button className="btn" onClick={onConfirm}>
            Revoke key
          </button>
        </div>
      </div>
    </div>
  )
}


