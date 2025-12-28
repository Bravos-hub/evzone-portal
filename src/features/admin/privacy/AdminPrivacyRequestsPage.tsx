import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { useAuthStore } from '@/core/auth/authStore'
import { addEvent, attachEvidence, loadPrivacy, setStatus, verifyIdentity, type PrivacyRequest, type PrivacyRequestType, type PrivacyStatus, type RiskLevel, type Region } from './mockPrivacy'

function pillStatus(s: PrivacyStatus) {
  const cls = s === 'Fulfilled' || s === 'Closed' ? 'approved' : s === 'Rejected' ? 'rejected' : s === 'NeedInfo' ? 'sendback' : 'pending'
  return <span className={`pill ${cls}`}>{s}</span>
}

function pillRisk(r: RiskLevel) {
  const cls = r === 'High' ? 'rejected' : r === 'Medium' ? 'sendback' : 'approved'
  return <span className={`pill ${cls}`}>{r}</span>
}

export function AdminPrivacyRequestsPage() {
  const { user } = useAuthStore()
  const actor = user?.name ?? user?.id ?? 'Delta (Admin)'

  const [store, setStore] = useState(() => loadPrivacy())
  const [q, setQ] = useState('')
  const [type, setType] = useState<PrivacyRequestType | 'All'>('All')
  const [status, setStatusFilter] = useState<PrivacyStatus | 'All'>('All')
  const [region, setRegion] = useState<Region | 'ALL'>('ALL')
  const [risk, setRisk] = useState<RiskLevel | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const on = () => setStore(loadPrivacy())
    window.addEventListener('evzone:mockPrivacy', on as EventListener)
    return () => window.removeEventListener('evzone:mockPrivacy', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const rows = store.requests
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okQ =
        !q ||
        `${r.id} ${r.type} ${r.status} ${r.requester.name} ${r.requester.email} ${r.requester.phone} ${r.jurisdiction} ${r.scope.dataCategories.join(' ')}`.toLowerCase().includes(q.toLowerCase())
      const okT = type === 'All' || r.type === type
      const okS = status === 'All' || r.status === status
      const okR = region === 'ALL' || r.region === region
      const okRisk = risk === 'All' || r.risk === risk
      return okQ && okT && okS && okR && okRisk
    })
  }, [rows, q, type, status, region, risk])

  const kpis = useMemo(() => {
    const open = rows.filter((r) => r.status === 'Open' || r.status === 'NeedInfo' || r.status === 'InProgress').length
    const overdue = rows.filter((r) => r.status !== 'Fulfilled' && r.status !== 'Closed' && r.status !== 'Rejected' && r.dueAt < '2025-12-28 00:00').length
    const highRisk = rows.filter((r) => r.risk === 'High' && r.status !== 'Fulfilled').length
    const unverified = rows.filter((r) => !r.verified && (r.status === 'Open' || r.status === 'NeedInfo')).length
    return { open, overdue, highRisk, unverified }
  }, [rows])

  const openRow = rows.find((x) => x.id === openId) ?? null

  return (
    <DashboardLayout pageTitle="Data Governance / Privacy Requests">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search id/requester/type/jurisdiction" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="All">All types</option>
            <option value="Access">Access</option>
            <option value="Deletion">Deletion</option>
            <option value="Correction">Correction</option>
            <option value="Consent">Consent</option>
            <option value="Restriction">Restriction</option>
            <option value="Portability">Portability</option>
          </select>
          <select className="select" value={status} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="All">All status</option>
            <option value="Open">Open</option>
            <option value="NeedInfo">NeedInfo</option>
            <option value="Approved">Approved</option>
            <option value="InProgress">InProgress</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed">Closed</option>
          </select>
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            <option value="ALL">All regions</option>
            <option value="AFRICA">Africa</option>
            <option value="EUROPE">Europe</option>
            <option value="AMERICAS">Americas</option>
            <option value="ASIA">Asia</option>
            <option value="MIDDLE_EAST">Middle East</option>
          </select>
          <select className="select" value={risk} onChange={(e) => setRisk(e.target.value as any)}>
            <option value="All">All risk</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-2">
        <KpiCard title="Open" value={String(kpis.open)} />
        <KpiCard title="Overdue" value={String(kpis.overdue)} />
        <KpiCard title="High risk" value={String(kpis.highRisk)} />
        <KpiCard title="Unverified identity" value={String(kpis.unverified)} />
      </div>

      <div className="h-4" />

      <Card className="p-0">
        <div className="p-5 border-b border-border-light flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="card-title mb-1">Requests</div>
            <div className="text-xs text-muted">{filtered.length} items</div>
          </div>
          <div className="text-xs text-muted">Click a request id to review and take action.</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Jurisdiction</th>
                <th>Region</th>
                <th>Requester</th>
                <th>Identity</th>
                <th>Submitted</th>
                <th>Due</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900 }}>
                    <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => setOpenId(r.id)}>
                      {r.id}
                    </button>
                  </td>
                  <td className="small">{r.type}</td>
                  <td>{pillStatus(r.status)}</td>
                  <td>{pillRisk(r.risk)}</td>
                  <td className="small">{r.jurisdiction}</td>
                  <td className="small">{r.region}</td>
                  <td className="small">
                    <div style={{ fontWeight: 800 }}>{r.requester.name}</div>
                    <div className="small">{r.requester.email}</div>
                  </td>
                  <td className="small">{r.verified ? 'Verified' : 'Unverified'} • {r.identityMethod}</td>
                  <td className="small">{r.submittedAt}</td>
                  <td className="small">{r.dueAt}</td>
                  <td className="text-right">
                    <button className="btn secondary" onClick={() => setOpenId(r.id)}>
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

      {openRow ? <PrivacyDrawer row={openRow} actor={actor} onClose={() => setOpenId(null)} onToast={setToast} /> : null}
    </DashboardLayout>
  )
}

function PrivacyDrawer({ row, actor, onClose, onToast }: { row: PrivacyRequest; actor: string; onClose: () => void; onToast: (m: string) => void }) {
  const [note, setNote] = useState('')
  const canFulfill = row.verified && (row.status === 'Approved' || row.status === 'InProgress' || row.status === 'Open')

  function act(status: PrivacyStatus, reason: string) {
    setStatus(row.id, status, actor, reason)
    onToast('Updated (mock).')
  }

  function verify() {
    verifyIdentity(row.id, actor)
    addEvent(row.id, { at: 'now', actor, action: 'Verification note', details: note || 'Verified via challenge' })
    onToast('Identity verified (mock).')
  }

  function attach() {
    attachEvidence(
      row.id,
      { id: `EV-${Math.floor(100 + Math.random() * 900)}`, name: 'Export_bundle.zip', type: 'Other', url: '#', addedAt: 'now', addedBy: actor },
      actor,
    )
    onToast('Evidence attached (mock).')
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>
              {row.id} • {row.type} • {row.jurisdiction}
            </div>
            <div className="small">
              {row.region} • risk {row.risk} • status {row.status} • due {row.dueAt}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="grid">
          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Requester</div>
            <div className="grid gap-2 text-sm">
              <div className="panel">
                {row.requester.name} • {row.requester.email} • {row.requester.phone} {row.requester.userId ? `• ${row.requester.userId}` : ''}
              </div>
              <div className="panel">
                Identity: <strong>{row.verified ? 'Verified' : 'Unverified'}</strong> • Method: <strong>{row.identityMethod}</strong>
              </div>
              <div className="panel">
                Scope: <strong>{row.scope.dataCategories.join(', ')}</strong> {row.scope.orgId ? `• org ${row.scope.orgId}` : ''}{' '}
                {row.scope.stations?.length ? `• stations ${row.scope.stations.join(', ')}` : ''}
              </div>
              <div className="panel">Reason: <strong>{row.reason}</strong></div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Evidence</div>
            {row.evidence.length === 0 ? (
              <div className="panel">No attachments yet. Attach export bundles, verification proof, or ticket docs.</div>
            ) : (
              <div className="grid">
                {row.evidence.map((e) => (
                  <div key={e.id} className="panel">
                    <div style={{ fontWeight: 800 }}>{e.name}</div>
                    <div className="small">
                      {e.type} • {e.addedAt} • {e.addedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ height: 10 }} />
            <button className="btn secondary" onClick={attach}>
              Attach export bundle
            </button>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Actions</div>
            <label>
              <div className="small">Internal note</div>
              <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ticket id + what was checked + what will be exported/deleted." />
            </label>
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {!row.verified ? (
                <button className="btn secondary" onClick={verify}>
                  Verify identity
                </button>
              ) : null}
              <button className="btn secondary" onClick={() => act('NeedInfo', note || 'Requested additional identity proof')}>
                Request info
              </button>
              <button className="btn secondary" onClick={() => act('Approved', note || 'Approved request')}>
                Approve
              </button>
              <button className="btn" disabled={!canFulfill} onClick={() => act('Fulfilled', note || 'Fulfilled with export bundle / changes applied')}>
                Fulfill
              </button>
              <button className="btn secondary" onClick={() => act('Rejected', note || 'Rejected due to retention/legal basis')}>
                Reject
              </button>
              <button className="btn secondary" onClick={() => act('Closed', note || 'Closed')}>
                Close
              </button>
            </div>
            {!row.verified ? <div style={{ height: 10 }} /> : null}
            {!row.verified ? <div className="panel">Identity verification is required before fulfilling access/portability requests (mock).</div> : null}
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Timeline</div>
            <div className="grid">
              {row.timeline.map((t, idx) => (
                <div key={t.at + t.action + idx} className="panel">
                  <div className="flex items-start justify-between gap-3">
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


