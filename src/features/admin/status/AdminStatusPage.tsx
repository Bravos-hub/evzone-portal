import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { StatusPill } from '@/ui/components/StatusPill'
import { genId, loadCommsStore, simulateSend, upsertMessage, type CommsMessage } from '@/features/admin/comms/mockComms'

type ComponentStatus = 'Operational' | 'Degraded' | 'Outage'
type StatusComponent = {
  id: string
  name: string
  status: ComponentStatus
  p95: number
  errors: number
  updatedAt: string
}

type StatusIncident = {
  id: string
  title: string
  severity: 'SEV1' | 'SEV2' | 'SEV3'
  status: 'Investigating' | 'Identified' | 'Mitigating' | 'Monitoring'
  updatedAt: string
  nextUpdateAt: string
  region: string
}

function pillForComponent(s: ComponentStatus) {
  const cls = s === 'Operational' ? 'approved' : s === 'Degraded' ? 'sendback' : 'rejected'
  return <span className={`pill ${cls}`}>{s}</span>
}

export function AdminStatusPage() {
  const [toast, setToast] = useState('')
  const [{ messages }, setStore] = useState(() => loadCommsStore())
  const statusMsgs = useMemo(() => messages.filter((m) => m.channel === 'Status page'), [messages])

  const [components, setComponents] = useState<StatusComponent[]>([
    { id: 'CMP-API', name: 'core-api', status: 'Degraded', p95: 820, errors: 1.8, updatedAt: 'Today 09:42' },
    { id: 'CMP-PAY', name: 'payments-webhooks', status: 'Outage', p95: 5400, errors: 6.1, updatedAt: 'Today 09:40' },
    { id: 'CMP-OCPP', name: 'ocpp-gateway', status: 'Operational', p95: 210, errors: 0.2, updatedAt: 'Today 09:41' },
    { id: 'CMP-MQTT', name: 'mqtt-ingest', status: 'Operational', p95: 180, errors: 0.1, updatedAt: 'Today 09:39' },
  ])

  const [incidents, setIncidents] = useState<StatusIncident[]>([
    { id: 'INC-2401', title: 'Mobile money confirmations delayed', severity: 'SEV1', status: 'Investigating', updatedAt: 'Today 09:42', nextUpdateAt: 'Today 10:10', region: 'AFRICA' },
    { id: 'INC-2392', title: 'Charging sessions stuck at starting', severity: 'SEV2', status: 'Mitigating', updatedAt: 'Today 08:59', nextUpdateAt: 'Today 11:00', region: 'AFRICA' },
  ])

  const [compose, setCompose] = useState({
    title: 'Incident update — payments delays',
    audience: 'All users',
    body:
      'We are investigating reports of delayed payment confirmations.\n\nImpact: Some wallets may not reflect top-ups immediately.\nMitigation: Webhook replay + queue backpressure controls are in progress.\nNext update: within 30–60 minutes.\n\n— EVzone Operations',
  })

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
    const live = incidents.length
    const degraded = components.filter((c) => c.status !== 'Operational').length
    const pending = statusMsgs.filter((m) => m.status === 'Scheduled' || m.status === 'Draft').length
    const sent = statusMsgs.filter((m) => m.status === 'Sent').length
    return { live, degraded, pending, sent }
  }, [incidents, components, statusMsgs])

  function publishUpdate() {
    const msg: CommsMessage = {
      id: genId('MSG'),
      title: compose.title,
      channel: 'Status page',
      status: 'Draft',
      audienceId: 'AUD-ALL',
      audienceLabel: compose.audience,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      owner: 'Delta (Admin)',
      body: compose.body,
      metrics: { attempted: 1, delivered: 0, failed: 0 },
    }
    const sent = simulateSend(msg)
    upsertMessage(sent)
    setToast('Published to status page (mock).')
    setIncidents((list) =>
      list.map((x) => (x.severity === 'SEV1' ? { ...x, updatedAt: 'now', nextUpdateAt: 'Today 11:10' } : x)),
    )
  }

  function toggleComponent(id: string) {
    setComponents((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === 'Operational' ? 'Degraded' : c.status === 'Degraded' ? 'Outage' : 'Operational',
              updatedAt: 'now',
              errors: c.status === 'Operational' ? 1.2 : c.status === 'Degraded' ? 4.8 : 0.1,
              p95: c.status === 'Operational' ? 900 : c.status === 'Degraded' ? 5200 : 220,
            }
          : c,
      ),
    )
    setToast('Component status updated (mock).')
  }

  return (
    <DashboardLayout pageTitle="Status Page / External Incident Comms">
      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Live incidents" value={String(kpis.live)} />
        <KpiCard title="Degraded components" value={String(kpis.degraded)} />
        <KpiCard title="Queued updates" value={String(kpis.pending)} />
        <KpiCard title="Published updates" value={String(kpis.sent)} />
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="card-title mb-1">System components</div>
            <div className="text-xs text-muted">Public-facing status components (mock)</div>
          </div>
          <div className="p-5 grid gap-3">
            {components.map((c) => (
              <div key={c.id} className="panel flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-text">{c.name}</span>
                  <span className="text-xs text-muted">
                    p95 {c.p95}ms • errors {c.errors.toFixed(1)}% • updated {c.updatedAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {pillForComponent(c.status)}
                  <button className="btn secondary" onClick={() => toggleComponent(c.id)} style={{ padding: '6px 10px' }}>
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5 border-b border-border-light">
            <div className="card-title mb-1">Live incidents</div>
            <div className="text-xs text-muted">What customers currently see (mock)</div>
          </div>
          <div className="p-5 grid gap-3">
            {incidents.map((i) => (
              <div key={i.id} className="panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-text">
                      {i.title} <span className="text-xs text-muted font-semibold">• {i.id}</span>
                    </div>
                    <div className="text-xs text-muted">
                      {i.region} • {i.severity} • {i.status} • updated {i.updatedAt} • next {i.nextUpdateAt}
                    </div>
                  </div>
                  <StatusPill status={i.severity === 'SEV1' ? 'Rejected' : i.severity === 'SEV2' ? 'SendBack' : 'Pending'} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="h-4" />

      <Card>
        <div className="card-title">Publish update</div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <label>
            <div className="small">Title</div>
            <input className="input" value={compose.title} onChange={(e) => setCompose((p) => ({ ...p, title: e.target.value }))} />
          </label>
          <label>
            <div className="small">Audience</div>
            <input className="input" value={compose.audience} onChange={(e) => setCompose((p) => ({ ...p, audience: e.target.value }))} />
          </label>
        </div>
        <div className="h-3" />
        <label>
          <div className="small">Message</div>
          <textarea className="input" style={{ minHeight: 160, whiteSpace: 'pre-wrap' }} value={compose.body} onChange={(e) => setCompose((p) => ({ ...p, body: e.target.value }))} />
        </label>
        <div className="h-3" />
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button className="btn secondary" onClick={() => setToast('Saved draft update (mock).')}>
            Save draft
          </button>
          <button className="btn" onClick={publishUpdate}>
            Publish now
          </button>
        </div>
      </Card>

      <div className="h-4" />

      <Card className="p-0">
        <div className="p-5 border-b border-border-light">
          <div className="card-title mb-1">Update feed</div>
          <div className="text-xs text-muted">Most recent status page messages (mock)</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>When</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {statusMsgs.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 900 }}>{m.id}</td>
                  <td>
                    <div style={{ fontWeight: 800 }}>{m.title}</div>
                    <div className="small">{m.audienceLabel}</div>
                  </td>
                  <td>
                    <span className={`pill ${m.status === 'Sent' ? 'approved' : m.status === 'Scheduled' ? 'sendback' : 'pending'}`}>{m.status}</span>
                  </td>
                  <td className="small">{m.status === 'Sent' ? m.sentAt : m.scheduledFor ?? '—'}</td>
                  <td className="small">{m.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] w-[min(420px,92vw)]">
          <div className="card" style={{ borderColor: 'rgba(122,162,255,.35)' }}>
            <div className="text-sm font-extrabold text-text">Action</div>
            <div className="small">{toast}</div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}


