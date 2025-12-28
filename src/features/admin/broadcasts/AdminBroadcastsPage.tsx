import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import {
  genId,
  loadCommsStore,
  simulateSend,
  upsertMessage,
  upsertTemplate,
  type AudienceSegment,
  type CommsChannel,
  type CommsMessage,
  type CommsStatus,
  type CommsTemplate,
} from '@/features/admin/comms/mockComms'

function pct(v?: number) {
  if (typeof v !== 'number') return '—'
  return `${Math.round(v * 100)}%`
}

function int(v?: number) {
  if (typeof v !== 'number') return '—'
  return v.toLocaleString()
}

function pillForStatus(s: CommsStatus) {
  const cls = s === 'Sent' ? 'approved' : s === 'Scheduled' ? 'sendback' : s === 'Failed' ? 'rejected' : 'pending'
  return <span className={`pill ${cls}`}>{s}</span>
}

function pillForChannel(c: CommsChannel) {
  const cls = c === 'Status page' ? 'sendback' : c === 'Ops' ? 'pending' : c === 'In-app' ? 'approved' : c === 'Email' ? 'pending' : 'pending'
  return <span className={`pill ${cls}`}>{c}</span>
}

export function AdminBroadcastsPage() {
  const [tab, setTab] = useState<'outbox' | 'templates' | 'audiences'>('outbox')
  const [{ messages, templates, audiences }, setStore] = useState(() => loadCommsStore())
  const [toast, setToast] = useState('')

  const [compose, setCompose] = useState<{
    open: boolean
    mode: 'new' | 'edit'
    msg: CommsMessage
  } | null>(null)

  const [preview, setPreview] = useState<CommsMessage | null>(null)
  const [tplEdit, setTplEdit] = useState<CommsTemplate | null>(null)

  useEffect(() => {
    const on = () => setStore(loadCommsStore())
    window.addEventListener('evzone:mockComms', on as EventListener)
    return () => window.removeEventListener('evzone:mockComms', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const kpis = useMemo(() => {
    const drafts = messages.filter((m) => m.status === 'Draft').length
    const scheduled = messages.filter((m) => m.status === 'Scheduled').length
    const sent = messages.filter((m) => m.status === 'Sent').length
    const delivered = messages.reduce((acc, m) => acc + (m.metrics?.delivered ?? 0), 0)
    const attempted = messages.reduce((acc, m) => acc + (m.metrics?.attempted ?? 0), 0)
    const deliveryRate = attempted ? delivered / attempted : 0
    return { drafts, scheduled, sent, deliveryRate }
  }, [messages])

  function openNew() {
    const aud = audiences[0]
    const msg: CommsMessage = {
      id: genId('MSG'),
      title: 'New broadcast',
      channel: 'In-app',
      status: 'Draft',
      audienceId: aud?.id ?? 'AUD-ALL',
      audienceLabel: aud?.label ?? 'All users',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      owner: 'Delta (Admin)',
      subject: '',
      body: '',
    }
    setCompose({ open: true, mode: 'new', msg })
  }

  function saveDraft(msg: CommsMessage) {
    upsertMessage(msg)
    setToast('Draft saved.')
  }

  function schedule(msg: CommsMessage, when: string) {
    upsertMessage({ ...msg, status: 'Scheduled', scheduledFor: when })
    setToast('Scheduled (mock).')
  }

  function sendNow(msg: CommsMessage) {
    const estimate =
      msg.channel === 'Ops' ? 1 : audiences.find((a) => a.id === msg.audienceId)?.estimate ?? msg.metrics?.attempted ?? 100
    const next = simulateSend({ ...msg, status: 'Sending', metrics: { attempted: estimate, delivered: 0, failed: 0 } })
    upsertMessage(next)
    setToast('Sent (mock).')
  }

  function duplicate(msg: CommsMessage) {
    const next: CommsMessage = {
      ...msg,
      id: genId('MSG'),
      status: 'Draft',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      scheduledFor: undefined,
      sentAt: undefined,
      metrics: undefined,
      title: `${msg.title} (copy)`,
    }
    upsertMessage(next)
    setToast('Duplicated to draft.')
  }

  function newTemplate() {
    setTplEdit({
      id: genId('TPL'),
      name: 'New template',
      channel: 'In-app',
      subject: '',
      body: '',
      tags: ['draft'],
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      owner: 'Delta (Admin)',
    })
  }

  function saveTemplate(t: CommsTemplate) {
    const next: CommsTemplate = {
      ...t,
      subject: t.channel === 'Email' ? (t.subject ?? '') : undefined,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      owner: 'Delta (Admin)',
    }
    upsertTemplate(next)
    setToast('Template saved.')
  }

  return (
    <DashboardLayout pageTitle="Broadcast / Comms Center">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-black">Broadcast / Comms Center</div>
            <div className="text-xs text-muted">Draft → Preview → Schedule/Send → Delivery metrics (mock)</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn secondary" onClick={() => setTab('templates')}>
              Templates
            </button>
            <button className="btn secondary" onClick={() => setTab('audiences')}>
              Audiences
            </button>
            <button className="btn" onClick={openNew}>
              New broadcast
            </button>
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Drafts" value={String(kpis.drafts)} />
        <KpiCard title="Scheduled" value={String(kpis.scheduled)} />
        <KpiCard title="Sent" value={String(kpis.sent)} />
        <KpiCard title="Delivery rate" value={pct(kpis.deliveryRate)} />
      </div>

      <div className="h-4" />

      <div className="tabs">
        <button className={`tab ${tab === 'outbox' ? 'active' : ''}`} onClick={() => setTab('outbox')}>
          Outbox
        </button>
        <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
          Templates
        </button>
        <button className={`tab ${tab === 'audiences' ? 'active' : ''}`} onClick={() => setTab('audiences')}>
          Audiences
        </button>
      </div>

      <div className="h-3" />

      {tab === 'outbox' ? (
        <Card className="p-0">
          <div className="p-5 border-b border-border-light flex items-center justify-between gap-3">
            <div>
              <div className="card-title mb-1">Messages</div>
              <div className="text-xs text-muted">{messages.length} items</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn secondary" onClick={() => setToast('Exported outbox CSV (mock).')}>
                Export
              </button>
            </div>
          </div>

          <div className="table-wrap rounded-none border-0 shadow-none">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Channel</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Schedule / Sent</th>
                  <th>Metrics</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 900 }}>{m.id}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{m.title}</div>
                      <div className="small">
                        Owner: {m.owner} • Created: {m.createdAt}
                      </div>
                    </td>
                    <td>{pillForChannel(m.channel)}</td>
                    <td className="small">{m.audienceLabel}</td>
                    <td>{pillForStatus(m.status)}</td>
                    <td className="small">{m.status === 'Scheduled' ? m.scheduledFor : m.status === 'Sent' ? m.sentAt : '—'}</td>
                    <td className="small">
                      {m.metrics ? (
                        <>
                          {int(m.metrics.delivered)}/{int(m.metrics.attempted)} delivered • open {pct(m.metrics.openRate)} • click {pct(m.metrics.clickRate)}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn secondary" onClick={() => setPreview(m)}>
                          Preview
                        </button>
                        <button className="btn secondary" onClick={() => setCompose({ open: true, mode: 'edit', msg: m })}>
                          Open
                        </button>
                        <button className="btn" disabled={m.status === 'Sent'} onClick={() => sendNow(m)}>
                          Send now
                        </button>
                        <button className="btn secondary" onClick={() => duplicate(m)}>
                          Duplicate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : tab === 'templates' ? (
        <TemplatesPanel
          templates={templates}
          onNew={newTemplate}
          onEdit={(t) => setTplEdit(t)}
        />
      ) : (
        <AudiencesPanel audiences={audiences} />
      )}

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}

      {compose?.open ? (
        <ComposeModal
          msg={compose.msg}
          templates={templates}
          audiences={audiences}
          onClose={() => setCompose(null)}
          onSave={(m) => {
            saveDraft(m)
            setCompose(null)
          }}
          onSchedule={(m, when) => {
            schedule(m, when)
            setCompose(null)
          }}
          onSend={(m) => {
            sendNow(m)
            setCompose(null)
          }}
        />
      ) : null}

      {preview ? <PreviewModal msg={preview} onClose={() => setPreview(null)} /> : null}

      {tplEdit ? (
        <TemplateEditModal
          tpl={tplEdit}
          onClose={() => setTplEdit(null)}
          onSave={(t) => {
            saveTemplate(t)
            setTplEdit(null)
          }}
        />
      ) : null}
    </DashboardLayout>
  )
}

function TemplatesPanel({
  templates,
  onNew,
  onEdit,
}: {
  templates: CommsTemplate[]
  onNew: () => void
  onEdit: (t: CommsTemplate) => void
}) {
  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Templates</div>
            <div className="text-xs text-muted">Editable message templates used by “Compose” (mock)</div>
          </div>
          <button className="btn" onClick={onNew}>
            New template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
        {templates.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-text">
                  {t.name} <span className="text-xs text-muted font-semibold">• {t.id}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  {pillForChannel(t.channel)}
                  <span className="pill pending">Owner: {t.owner}</span>
                  <span className="pill pending">Updated: {t.updatedAt}</span>
                </div>
                {t.channel === 'Email' && t.subject ? <div className="mt-2 text-xs text-muted">Subject: {t.subject}</div> : null}
              </div>
              <div className="flex items-center gap-2">
                <button className="btn secondary" onClick={() => onEdit(t)}>
                  Edit
                </button>
              </div>
            </div>
            <div className="h-3" />
            <div className="panel" style={{ whiteSpace: 'pre-wrap' }}>
              {t.body || '—'}
            </div>
            <div className="h-3" />
            <div className="flex flex-wrap gap-2">
              {t.tags.map((x) => (
                <span key={x} className="pill pending">
                  {x}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AudiencesPanel({ audiences }: { audiences: AudienceSegment[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
      {audiences.map((a) => (
        <div key={a.id} className="card">
          <div className="text-sm font-extrabold text-text">
            {a.label} <span className="text-xs text-muted font-semibold">• {a.id}</span>
          </div>
          <div className="text-xs text-muted">{a.description}</div>
          <div className="h-3" />
          <div className="split">
            <span className="chip">
              Estimate: <strong>{a.estimate.toLocaleString()}</strong>
            </span>
            <span className="chip">
              Filters: <strong>{Object.keys(a.filters).length}</strong>
            </span>
          </div>
          <div className="h-3" />
          <div className="panel">
            <div className="text-xs text-muted">Filter map</div>
            <div className="h-2" />
            <div className="grid gap-1 text-sm">
              {Object.entries(a.filters).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted">{k}</span>
                  <span className="text-text font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ComposeModal({
  msg,
  templates,
  audiences,
  onClose,
  onSave,
  onSchedule,
  onSend,
}: {
  msg: CommsMessage
  templates: CommsTemplate[]
  audiences: AudienceSegment[]
  onClose: () => void
  onSave: (m: CommsMessage) => void
  onSchedule: (m: CommsMessage, when: string) => void
  onSend: (m: CommsMessage) => void
}) {
  const [m, setM] = useState<CommsMessage>(msg)
  const [when, setWhen] = useState('Today 15:00')
  const canSend = m.title.trim() && m.body.trim()

  function applyAudience(id: string) {
    const aud = audiences.find((a) => a.id === id)
    setM((prev) => ({ ...prev, audienceId: id, audienceLabel: aud?.label ?? prev.audienceLabel }))
  }

  function applyTemplate(id: string) {
    const t = templates.find((x) => x.id === id)
    if (!t) return
    setM((prev) => ({
      ...prev,
      channel: t.channel,
      subject: t.subject ?? prev.subject,
      body: t.body,
      title: prev.title === 'New broadcast' ? t.name : prev.title,
    }))
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(980px,94vw)] max-h-[88vh] overflow-auto rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Compose broadcast</div>
            <div className="text-xs text-muted">{m.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn secondary" onClick={() => onSave(m)}>
              Save draft
            </button>
            <button className="btn" disabled={!canSend} onClick={() => onSend(m)}>
              Send now
            </button>
          </div>
        </div>

        <div className="h-4" />

        <div className="grid grid-cols-3 gap-4 xl:grid-cols-1">
          <div className="card">
            <div className="card-title">Settings</div>
            <div className="grid gap-3">
              <label>
                <div className="small">Title</div>
                <input className="input" value={m.title} onChange={(e) => setM((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label>
                <div className="small">Channel</div>
                <select className="select" value={m.channel} onChange={(e) => setM((p) => ({ ...p, channel: e.target.value as any }))}>
                  {(['Status page', 'Ops', 'In-app', 'Email', 'SMS'] as CommsChannel[]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <div className="small">Audience</div>
                <select className="select" value={m.audienceId} onChange={(e) => applyAudience(e.target.value)}>
                  {audiences.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} ({a.estimate.toLocaleString()})
                    </option>
                  ))}
                </select>
              </label>
              {m.channel === 'Email' ? (
                <label>
                  <div className="small">Subject</div>
                  <input className="input" value={m.subject ?? ''} onChange={(e) => setM((p) => ({ ...p, subject: e.target.value }))} />
                </label>
              ) : null}
              <div className="panel">
                <div className="text-xs text-muted">Template</div>
                <div className="h-2" />
                <select className="select" defaultValue="" onChange={(e) => applyTemplate(e.target.value)}>
                  <option value="" disabled>
                    Choose template…
                  </option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} • {t.channel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card col-span-2 xl:col-span-1">
            <div className="card-title">Message</div>
            <textarea className="input" style={{ minHeight: 220, whiteSpace: 'pre-wrap' }} value={m.body} onChange={(e) => setM((p) => ({ ...p, body: e.target.value }))} />
            <div className="h-3" />
            <div className="panel">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs text-muted">Schedule send</div>
                  <div className="text-sm font-semibold text-text">Queue for later (mock)</div>
                </div>
                <div className="flex items-center gap-2">
                  <input className="input" style={{ width: 180 }} value={when} onChange={(e) => setWhen(e.target.value)} />
                  <button className="btn secondary" disabled={!canSend} onClick={() => onSchedule(m, when)}>
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewModal({ msg, onClose }: { msg: CommsMessage; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(860px,94vw)] max-h-[88vh] overflow-auto rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Preview</div>
            <div className="text-xs text-muted">
              {msg.id} • {msg.channel} • {msg.status}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="h-3" />
        <div className="panel">
          <div className="flex flex-wrap gap-2 items-center">
            {pillForChannel(msg.channel)}
            {pillForStatus(msg.status)}
            <span className="pill pending">Audience: {msg.audienceLabel}</span>
          </div>
          <div className="h-3" />
          <div className="text-sm font-extrabold text-text">{msg.title}</div>
          {msg.subject ? <div className="text-xs text-muted">Subject: {msg.subject}</div> : null}
          <div className="h-3" />
          <div className="panel" style={{ whiteSpace: 'pre-wrap' }}>
            {msg.body || '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateEditModal({
  tpl,
  onClose,
  onSave,
}: {
  tpl: CommsTemplate
  onClose: () => void
  onSave: (t: CommsTemplate) => void
}) {
  const [t, setT] = useState<CommsTemplate>(tpl)
  const [tags, setTags] = useState((tpl.tags ?? []).join(', '))
  const canSave = t.name.trim() && t.body.trim()

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(860px,94vw)] max-h-[88vh] overflow-auto rounded-2xl border border-border-light bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-extrabold text-text">Edit template</div>
            <div className="text-xs text-muted">{t.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn"
              disabled={!canSave}
              onClick={() =>
                onSave({
                  ...t,
                  tags: tags
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            >
              Save
            </button>
          </div>
        </div>

        <div className="h-4" />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <label>
            <div className="small">Name</div>
            <input className="input" value={t.name} onChange={(e) => setT((p) => ({ ...p, name: e.target.value }))} />
          </label>

          <label>
            <div className="small">Channel</div>
            <select className="select" value={t.channel} onChange={(e) => setT((p) => ({ ...p, channel: e.target.value as any }))}>
              {(['Status page', 'Ops', 'In-app', 'Email', 'SMS'] as CommsChannel[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {t.channel === 'Email' ? (
            <label className="col-span-2 xl:col-span-1">
              <div className="small">Subject</div>
              <input className="input" value={t.subject ?? ''} onChange={(e) => setT((p) => ({ ...p, subject: e.target.value }))} />
            </label>
          ) : null}

          <label className="col-span-2 xl:col-span-1">
            <div className="small">Body</div>
            <textarea className="input" style={{ minHeight: 220, whiteSpace: 'pre-wrap' }} value={t.body} onChange={(e) => setT((p) => ({ ...p, body: e.target.value }))} />
          </label>

          <label className="col-span-2 xl:col-span-1">
            <div className="small">Tags (comma separated)</div>
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. incident, public, status" />
          </label>
        </div>
      </div>
    </div>
  )
}


