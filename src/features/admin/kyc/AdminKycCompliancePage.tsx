import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'
import { KpiCard } from '@/ui/components/KpiCard'
import { useAuthStore } from '@/core/auth/authStore'
import { loadKyc, setCaseStatus, updateCase, type KycCase, type KycStatus, type PartyType, type Region, type RiskLevel, type ScreeningFlag } from './mockKyc'

function pillStatus(s: KycStatus) {
  const cls = s === 'Approved' ? 'approved' : s === 'Rejected' ? 'rejected' : s === 'Escalated' ? 'rejected' : s === 'NeedInfo' ? 'sendback' : 'pending'
  return <span className={`pill ${cls}`}>{s}</span>
}

function pillRisk(r: RiskLevel) {
  const cls = r === 'High' ? 'rejected' : r === 'Medium' ? 'sendback' : 'approved'
  return <span className={`pill ${cls}`}>{r}</span>
}

export function AdminKycCompliancePage() {
  const { user } = useAuthStore()
  const actor = user?.name ?? user?.id ?? 'Delta (Admin)'

  const [store, setStore] = useState(() => loadKyc())
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<KycStatus | 'All'>('All')
  const [party, setParty] = useState<PartyType | 'All'>('All')
  const [region, setRegion] = useState<Region | 'ALL'>('ALL')
  const [risk, setRisk] = useState<RiskLevel | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const on = () => setStore(loadKyc())
    window.addEventListener('evzone:mockKyc', on as EventListener)
    return () => window.removeEventListener('evzone:mockKyc', on as EventListener)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const rows = store.cases
  const filtered = useMemo(() => {
    return rows.filter((c) => {
      const okQ = !q || `${c.id} ${c.orgName ?? ''} ${c.orgId ?? ''} ${c.applicantName} ${c.applicantEmail} ${c.status} ${c.partyType} ${c.risk} ${c.flags.join(' ')}`.toLowerCase().includes(q.toLowerCase())
      const okS = status === 'All' || c.status === status
      const okP = party === 'All' || c.partyType === party
      const okR = region === 'ALL' || c.region === region
      const okRisk = risk === 'All' || c.risk === risk
      return okQ && okS && okP && okR && okRisk
    })
  }, [rows, q, status, party, region, risk])

  const kpis = useMemo(() => {
    const pending = rows.filter((c) => c.status === 'Pending').length
    const needInfo = rows.filter((c) => c.status === 'NeedInfo').length
    const escalated = rows.filter((c) => c.status === 'Escalated').length
    const highRisk = rows.filter((c) => c.risk === 'High' && c.status !== 'Approved').length
    return { pending, needInfo, escalated, highRisk }
  }, [rows])

  const openRow = rows.find((x) => x.id === openId) ?? null

  function markDoc(caseId: string, docId: string, patch: Partial<{ received: boolean; verified: boolean }>) {
    updateCase(caseId, (c) => ({
      ...c,
      docs: c.docs.map((d) => (d.id === docId ? { ...d, ...patch } : d)),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }))
    setToast('Document updated (mock).')
  }

  return (
    <DashboardLayout pageTitle="KYC / Partner Compliance">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search id/org/applicant/flags" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="All">All status</option>
            <option value="Pending">Pending</option>
            <option value="NeedInfo">NeedInfo</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Escalated">Escalated</option>
          </select>
          <select className="select" value={party} onChange={(e) => setParty(e.target.value as any)}>
            <option value="All">All party</option>
            <option value="Organization">Organization</option>
            <option value="Individual">Individual</option>
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
        <KpiCard title="Pending" value={String(kpis.pending)} />
        <KpiCard title="Need info" value={String(kpis.needInfo)} />
        <KpiCard title="Escalated" value={String(kpis.escalated)} />
        <KpiCard title="High risk" value={String(kpis.highRisk)} />
      </div>

      <div className="h-4" />

      <Card className="p-0">
        <div className="p-5 border-b border-border-light flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="card-title mb-1">KYC cases</div>
            <div className="text-xs text-muted">{filtered.length} items</div>
          </div>
          <div className="text-xs text-muted">Click a case id to review documents and take actions.</div>
        </div>
        <div className="table-wrap rounded-none border-0 shadow-none">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Party</th>
                <th>Org</th>
                <th>Applicant</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Flags</th>
                <th>Region</th>
                <th>Assigned</th>
                <th>Submitted</th>
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
                  <td className="small">{c.partyType}</td>
                  <td className="small">
                    <div style={{ fontWeight: 800 }}>{c.orgName ?? '—'}</div>
                    <div className="small">{c.orgId ?? '—'}</div>
                  </td>
                  <td className="small">
                    <div style={{ fontWeight: 800 }}>{c.applicantName}</div>
                    <div className="small">{c.applicantEmail}</div>
                  </td>
                  <td>{pillStatus(c.status)}</td>
                  <td>{pillRisk(c.risk)}</td>
                  <td className="small">{c.flags.join(', ')}</td>
                  <td className="small">{c.region}</td>
                  <td className="small">{c.assignedTo}</td>
                  <td className="small">{c.submittedAt}</td>
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

      {openRow ? <KycDrawer row={openRow} onClose={() => setOpenId(null)} actor={actor} onMarkDoc={markDoc} /> : null}
    </DashboardLayout>
  )
}

function KycDrawer({
  row,
  onClose,
  actor,
  onMarkDoc,
}: {
  row: KycCase
  onClose: () => void
  actor: string
  onMarkDoc: (caseId: string, docId: string, patch: Partial<{ received: boolean; verified: boolean }>) => void
}) {
  const [note, setNote] = useState('')
  const allRequiredReceived = row.docs.filter((d) => d.required).every((d) => d.received)
  const allRequiredVerified = row.docs.filter((d) => d.required).every((d) => d.verified)
  const canApprove = allRequiredReceived && allRequiredVerified && row.flags.every((f) => f === 'None' || f === 'AdverseMedia') // demo

  function act(status: KycStatus, reason: string) {
    setCaseStatus(row.id, status, actor, reason)
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>
              {row.id} • {row.partyType} • {row.orgName ?? row.applicantName}
            </div>
            <div className="small">
              {row.region} • risk {row.risk} • status {row.status} • assigned {row.assignedTo}
            </div>
          </div>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="grid">
          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Screening</div>
            <div className="grid gap-2 text-sm">
              <div className="panel">
                Flags: <strong>{row.flags.join(', ')}</strong>
              </div>
              <div className="panel">
                Risk: <strong>{row.risk}</strong> • Notes: <strong>{row.notes}</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Documents</div>
            <div className="grid">
              {row.docs.map((d) => (
                <div key={d.id} className="panel">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {d.name} {d.required ? <span className="pill pending">Required</span> : <span className="pill approved">Optional</span>}
                      </div>
                      <div className="small">
                        Received: <strong>{d.received ? 'Yes' : 'No'}</strong> • Verified: <strong>{d.verified ? 'Yes' : 'No'}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn secondary" onClick={() => onMarkDoc(row.id, d.id, { received: !d.received })}>
                        {d.received ? 'Unreceive' : 'Mark received'}
                      </button>
                      <button className="btn secondary" disabled={!d.received} onClick={() => onMarkDoc(row.id, d.id, { verified: !d.verified })}>
                        {d.verified ? 'Unverify' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 10 }} />
            <div className="panel">
              Required received: <strong>{allRequiredReceived ? 'Yes' : 'No'}</strong> • Required verified: <strong>{allRequiredVerified ? 'Yes' : 'No'}</strong>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Decision</div>
            <label>
              <div className="small">Internal note</div>
              <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ticket id + findings + what to request/approve" />
            </label>
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn secondary" onClick={() => act('NeedInfo', note || 'Requested additional documents')}>
                Request info
              </button>
              <button className="btn secondary" onClick={() => act('Escalated', note || 'Escalated to EDD')}>
                Escalate
              </button>
              <button className="btn secondary" onClick={() => act('Rejected', note || 'Rejected due to compliance')}>
                Reject
              </button>
              <button className="btn" disabled={!canApprove} onClick={() => act('Approved', note || 'Approved')}>
                Approve
              </button>
            </div>
            {!canApprove ? (
              <div style={{ height: 10 }} />
            ) : null}
            {!canApprove ? <div className="panel">Approve is enabled only after required docs are received + verified (mock) and flags are acceptable.</div> : null}
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


