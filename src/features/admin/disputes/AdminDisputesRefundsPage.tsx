import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { useAuthStore } from '@/core/auth/authStore'
import { addTimeline, loadDisputes, now, setCaseStatus, type CaseStatus, type CaseType, type DisputeCase, type Region, type Severity } from './mockDisputes'

function fmtMoney(v: number, currency: DisputeCase['currency']) {
  const symbol = currency === 'EUR' ? '€' : currency === 'UGX' ? 'UGX ' : '$'
  return `${symbol}${v.toLocaleString()}`
}

function pillStatus(s: CaseStatus) {
  const cls = s === 'Refunded' || s === 'Won' || s === 'Closed' ? 'approved' : s === 'NeedInfo' ? 'sendback' : s === 'Lost' ? 'rejected' : 'pending'
  return <span className={`pill ${cls}`}>{s}</span>
}

function pillSev(s: Severity) {
  const cls = s === 'High' ? 'rejected' : s === 'Medium' ? 'sendback' : 'approved'
  return <span className={`pill ${cls}`}>{s}</span>
}

export function AdminDisputesRefundsPage() {
  const { user } = useAuthStore()
  const actor = user?.name ?? user?.id ?? 'Delta (Admin)'

  const [store, setStore] = useState(() => loadDisputes())
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<Region | 'ALL'>('ALL')
  const [type, setType] = useState<CaseType | 'All'>('All')
  const [status, setStatus] = useState<CaseStatus | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const on = () => setStore(loadDisputes())
    window.addEventListener('evzone:mockDisputes', on as EventListener)
    return () => window.removeEventListener('evzone:mockDisputes', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const rows = store.cases
  const filtered = useMemo(() => {
    return rows.filter((c) => {
      const okR = region === 'ALL' || c.region === region
      const okT = type === 'All' || c.type === type
      const okS = status === 'All' || c.status === status
      const hay = `${c.id} ${c.type} ${c.status} ${c.org} ${c.station ?? ''} ${c.provider} ${c.originalTxId} ${c.reason} ${c.customer.name} ${c.customer.email}`.toLowerCase()
      const okQ = !q || hay.includes(q.toLowerCase())
      return okR && okT && okS && okQ
    })
  }, [rows, region, type, status, q])

  const kpis = useMemo(() => {
    const open = rows.filter((c) => c.status === 'Open' || c.status === 'UnderReview' || c.status === 'NeedInfo').length
    const needInfo = rows.filter((c) => c.status === 'NeedInfo').length
    const chargebacks = rows.filter((c) => c.type === 'Chargeback' && c.status !== 'Closed').length
    const exposureUsd = rows
      .filter((c) => c.status === 'Open' || c.status === 'UnderReview' || c.status === 'NeedInfo')
      .reduce((acc, c) => acc + (c.currency === 'USD' ? c.amount : c.currency === 'EUR' ? c.amount * 1.08 : c.amount / 3800), 0)
    return { open, needInfo, chargebacks, exposureUsd }
  }, [rows])

  const openRow = rows.find((x) => x.id === openId) ?? null

  function act(id: string, action: string, details: string, nextStatus?: CaseStatus) {
    addTimeline(
      id,
      { at: now(), actor, action, details },
      { title: `Dispute update: ${id}`, body: `${action} — ${details}`, link: '/admin/disputes' },
    )
    if (nextStatus) {
      setCaseStatus(id, nextStatus, actor, details || action)
    }
    setToast('Action recorded (mock).')
  }

  return (
    <DashboardLayout pageTitle="Refunds & Disputes">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search id/tx/customer/org/provider" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            <option value="ALL">All Regions</option>
            <option value="AFRICA">Africa</option>
            <option value="EUROPE">Europe</option>
            <option value="AMERICAS">Americas</option>
            <option value="ASIA">Asia</option>
            <option value="MIDDLE_EAST">Middle East</option>
          </select>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="All">All types</option>
            <option value="Refund">Refund</option>
            <option value="Chargeback">Chargeback</option>
            <option value="Reversal">Reversal</option>
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="All">All status</option>
            <option value="Open">Open</option>
            <option value="UnderReview">UnderReview</option>
            <option value="NeedInfo">NeedInfo</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Refunded">Refunded</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Open cases" value={String(kpis.open)} />
        <KpiCard title="Need info" value={String(kpis.needInfo)} />
        <KpiCard title="Active chargebacks" value={String(kpis.chargebacks)} />
        <KpiCard title="Exposure (USD est.)" value={`$${kpis.exposureUsd.toFixed(0)}`} />
      </div>

      <div className="h-4" />

      <Card className="p-0">
        <div className="p-5 border-b border-border-light flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="card-title mb-1">Cases</div>
            <div className="text-xs text-muted">{filtered.length} items</div>
          </div>
          <div className="text-xs text-muted">Click a case id to review and take action.</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Region</th>
                <th>Org / Station</th>
                <th>Provider</th>
                <th>Original Tx</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Deadline</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 900 }}>
                    <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => setOpenId(c.id)}>
                      {c.id}
                    </button>
                  </td>
                  <td className="small">{c.type}</td>
                  <td>{pillStatus(c.status)}</td>
                  <td>{pillSev(c.severity)}</td>
                  <td className="small">{c.region}</td>
                  <td className="small">
                    <div style={{ fontWeight: 800 }}>{c.org}</div>
                    <div className="small">{c.station ?? '—'}</div>
                  </td>
                  <td className="small">{c.provider}</td>
                  <td className="small">{c.originalTxId}</td>
                  <td className="small">
                    <div style={{ fontWeight: 800 }}>{c.customer.name}</div>
                    <div className="small">{c.customer.email}</div>
                  </td>
                  <td className="small">{fmtMoney(c.amount, c.currency)}</td>
                  <td className="small">{c.deadlineAt ?? '—'}</td>
                  <td className="text-right">
                    <button className="btn secondary" onClick={() => setOpenId(c.id)}>
                      Review
                    </button>
                  </td>
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

      {openRow ? <DisputeDrawer row={openRow} onClose={() => setOpenId(null)} onAct={act} /> : null}
    </DashboardLayout>
  )
}

function DisputeDrawer({ row, onClose, onAct }: { row: DisputeCase; onClose: () => void; onAct: (id: string, action: string, details: string, next?: CaseStatus) => void }) {
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')

  const canApprove = row.type === 'Refund' && (row.status === 'Open' || row.status === 'UnderReview' || row.status === 'NeedInfo')
  const canRespond = row.type === 'Chargeback' && (row.status === 'UnderReview' || row.status === 'Open')

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>
              {row.id} • {row.type} • {row.provider}
            </div>
            <div className="small">
              {row.region} • {row.org} {row.station ? `• ${row.station}` : ''} • tx {row.originalTxId}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="grid">
          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Summary</div>
            <div className="grid gap-2 text-sm">
              <div className="panel">
                Status: <strong>{row.status}</strong> • Severity: <strong>{row.severity}</strong> • Deadline: <strong>{row.deadlineAt ?? '—'}</strong>
              </div>
              <div className="panel">
                Customer: <strong>{row.customer.name}</strong> • {row.customer.email} • {row.customer.phone}
              </div>
              <div className="panel">
                Amount: <strong>{fmtMoney(row.amount, row.currency)}</strong> • Reason: <strong>{row.reason}</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Evidence</div>
            {row.evidence.length === 0 ? (
              <div className="panel">No evidence attached yet.</div>
            ) : (
              <div className="grid">
                {row.evidence.map((e) => (
                  <div key={e.id} className="panel">
                    <div style={{ fontWeight: 800 }}>
                      {e.type}: {e.name}
                    </div>
                    <div className="small">
                      Added {e.addedAt} by {e.addedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ height: 10 }} />
            <div className="panel">
              Backend: upload evidence (receipts, telemetry, logs), generate provider response packs, and audit each attachment.
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Actions</div>
            <label>
              <div className="small">Internal note (optional)</div>
              <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you check? What evidence is attached?" />
            </label>
            <div style={{ height: 10 }} />
            <label>
              <div className="small">Decision reason (recommended)</div>
              <textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ticket id + short justification (e.g., TCK-10021 — duplicate charge confirmed)" />
            </label>
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className="btn secondary"
                onClick={() => onAct(row.id, 'Requested info', `${reason || 'Requested additional evidence'}${note ? ` • note: ${note}` : ''}`, 'NeedInfo')}
              >
                Request info
              </button>
              <button
                className="btn secondary"
                onClick={() => onAct(row.id, 'Escalated', `Escalated to incident review${reason ? ` • ${reason}` : ''}`, 'UnderReview')}
              >
                Escalate
              </button>
              <button
                className="btn"
                disabled={!canApprove}
                onClick={() => onAct(row.id, 'Refund approved', `${reason || 'Refund approved'}${note ? ` • note: ${note}` : ''}`, 'Refunded')}
              >
                Approve refund
              </button>
              <button
                className="btn secondary"
                disabled={!canRespond}
                onClick={() => onAct(row.id, 'Chargeback response submitted', `${reason || 'Response submitted'}${note ? ` • note: ${note}` : ''}`, 'UnderReview')}
              >
                Submit response
              </button>
              <button
                className="btn secondary"
                onClick={() => onAct(row.id, 'Closed case', `${reason || 'Closed'}${note ? ` • note: ${note}` : ''}`, 'Closed')}
              >
                Close
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Timeline</div>
            <div className="grid">
              {row.timeline.map((t, idx) => (
                <div key={t.at + t.action + idx} className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontWeight: 800 }}>{t.action}</div>
                    <div className="small">{t.at}</div>
                  </div>
                  <div className="small">
                    {t.actor} • {t.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


