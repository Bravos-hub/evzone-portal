import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { StatusPill, type ApprovalStatus } from '@/ui/components/StatusPill'

type AppRole = 'owner' | 'operator' | 'siteOwner' | 'technician'
type DocType = 'pdf' | 'image' | 'other'

type Doc = { id: string; name: string; type: DocType; url: string }
type Application = {
  id: string
  role: AppRole
  org: string
  contact: string
  email: string
  country: string
  site: string
  plan: string
  submittedAt: string
  status: ApprovalStatus
  notes: string
  docs: Doc[]
}

const ROLES: Array<{ code: AppRole; label: string }> = [
  { code: 'owner', label: 'Station Owner' },
  { code: 'operator', label: 'Operator' },
  { code: 'siteOwner', label: 'Site Owner' },
  { code: 'technician', label: 'Technician' },
]

const STATI: Array<ApprovalStatus | 'All'> = ['Pending', 'Approved', 'Rejected', 'SendBack', 'All']

const seed: Application[] = [
  {
    id: 'APP-00121',
    role: 'owner',
    org: 'Volt Mobility Ltd',
    contact: 'Sarah',
    email: 'sarah@volt.co',
    country: 'UGA',
    site: 'Central Hub',
    plan: 'owner-growth',
    submittedAt: '2025-11-01 10:22',
    status: 'Pending',
    notes: '',
    docs: [
      { id: 'D-101', name: 'Company Certificate.pdf', type: 'pdf', url: '#' },
      { id: 'D-102', name: 'TIN.jpg', type: 'image', url: '#' },
    ],
  },
  {
    id: 'APP-00128',
    role: 'operator',
    org: 'SunRun Ops',
    contact: 'Jon',
    email: 'jon@sunrun.com',
    country: 'UGA',
    site: 'City Lot A',
    plan: 'op-plus',
    submittedAt: '2025-11-03 14:05',
    status: 'SendBack',
    notes: 'Upload TIN',
    docs: [{ id: 'D-103', name: 'ID Card.png', type: 'image', url: '#' }],
  },
  {
    id: 'APP-00135',
    role: 'siteOwner',
    org: 'Mall Holdings',
    contact: 'Grace',
    email: 'grace@mall.com',
    country: 'UGA',
    site: 'City Mall Roof',
    plan: 'so-pro',
    submittedAt: '2025-11-04 09:16',
    status: 'Pending',
    notes: '',
    docs: [{ id: 'D-104', name: 'Lease Draft.pdf', type: 'pdf', url: '#' }],
  },
  {
    id: 'APP-00142',
    role: 'technician',
    org: '—',
    contact: 'Allan',
    email: 'allan@tech.me',
    country: 'UGA',
    site: '—',
    plan: 'tech-free',
    submittedAt: '2025-11-04 18:49',
    status: 'Pending',
    notes: '',
    docs: [],
  },
  {
    id: 'APP-00105',
    role: 'owner',
    org: 'GridCity Ltd',
    contact: 'Ali',
    email: 'ali@grid.city',
    country: 'UGA',
    site: 'Warehouse Lot',
    plan: 'owner-enterprise',
    submittedAt: '2025-10-28 11:40',
    status: 'Rejected',
    notes: 'Incomplete documents',
    docs: [{ id: 'D-105', name: 'Bank Letter.pdf', type: 'pdf', url: '#' }],
  },
]

async function apiList(): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 150))
  return seed
}
async function apiAction(_id: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 220))
  return { ok: true }
}

type ModalState =
  | { kind: 'approve' | 'reject' | 'send'; id: string; note: string }
  | null

export function AdminApprovalsPage() {
  const [rows, setRows] = useState<Application[]>([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState<AppRole | 'All'>('All')
  const [status, setStatus] = useState<ApprovalStatus | 'All'>('Pending')
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string>('')

  useEffect(() => {
    void (async () => {
      const data = await apiList()
      setRows(data)
    })()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okQ = !q || (r.id + ' ' + r.org + ' ' + r.contact + ' ' + r.email).toLowerCase().includes(q.toLowerCase())
      const okR = role === 'All' || r.role === role
      const okS = status === 'All' || r.status === status
      return okQ && okR && okS
    })
  }, [rows, q, role, status])

  const allChecked = filtered.length > 0 && filtered.every((r) => sel[r.id])
  const someChecked = filtered.some((r) => sel[r.id])

  function toggleAll() {
    const next: Record<string, boolean> = {}
    const val = !allChecked
    filtered.forEach((r) => (next[r.id] = val))
    setSel(next)
  }
  function toggle(id: string) {
    setSel((s) => ({ ...s, [id]: !s[id] }))
  }

  function openAction(kind: NonNullable<ModalState>['kind'], id: string) {
    setModal({ kind, id, note: '' })
    setNotice('')
  }

  async function runAction() {
    if (!modal) return
    setBusy(true)
    setNotice('')
    try {
      await apiAction(modal.id)
      setRows((list) =>
        list.map((r) =>
          r.id === modal.id
            ? {
                ...r,
                status: modal.kind === 'approve' ? 'Approved' : modal.kind === 'reject' ? 'Rejected' : 'SendBack',
                notes: modal.note || r.notes,
              }
            : r,
        ),
      )
      setModal(null)
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  async function bulkApprove() {
    const ids = filtered.filter((r) => sel[r.id]).map((r) => r.id)
    if (ids.length === 0) return
    setBusy(true)
    try {
      await Promise.all(ids.map((id) => apiAction(id)))
      setRows((list) => list.map((r) => (ids.includes(r.id) ? { ...r, status: 'Approved' } : r)))
      setSel({})
    } finally {
      setBusy(false)
    }
  }

  const openRow = rows.find((r) => r.id === openId) ?? null

  return (
    <DashboardLayout pageTitle="Approvals">
      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="flex gap-[10px] flex-wrap items-center">
          <input
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-[320px] max-w-[60vw] min-w-[200px] flex-shrink"
            placeholder="Search id/org/contact/email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="All">All Roles</option>
            {ROLES.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            {STATI.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Status' : s}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <button
            className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
            onClick={() => setStatus('Pending')}
          >
            Pending only
          </button>
          <button
            className="bg-accent border border-accent text-white py-[10px] px-[18px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,.2)] whitespace-nowrap hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_8px_rgba(59,130,246,.3)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={bulkApprove}
            disabled={!someChecked || busy}
          >
            {busy ? 'Working…' : 'Approve selected'}
          </button>
        </div>
      </div>

      <div className="h-3" />

      <div className="overflow-x-auto rounded-xl border border-border-light bg-panel shadow-[0_2px_8px_rgba(0,0,0,.2)]">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="w-[42px] py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">
                <input
                  className="w-[18px] h-[18px] accent-accent cursor-pointer"
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">ID</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Role</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Org / Contact</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Site</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Plan</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Submitted</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Status</th>
              <th className="py-3.5 px-4 text-right border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-[rgba(255,255,255,.05)] last:td:border-b-0">
                <td className="py-3.5 px-4 text-left border-t border-border-light">
                  <input
                    className="w-[18px] h-[18px] accent-accent cursor-pointer"
                    type="checkbox"
                    checked={!!sel[r.id]}
                    onChange={() => toggle(r.id)}
                  />
                </td>
                <td className="py-3.5 px-4 text-left border-t border-border-light font-extrabold">
                  <button
                    className="bg-panel border border-border text-text py-1.5 px-2.5 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                    onClick={() => setOpenId(r.id)}
                  >
                    {r.id}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{ROLES.find((x) => x.code === r.role)?.label ?? r.role}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">
                  {r.org} <span className="text-xs text-muted leading-normal">•</span> {r.contact}
                </td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{r.site}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{r.plan}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light text-xs text-muted leading-normal">{r.submittedAt}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">
                  <StatusPill status={r.status} />
                </td>
                <td className="py-3.5 px-4 text-right border-t border-border-light">
                  <div className="inline-flex gap-2 flex-wrap justify-end">
                    <button
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                      onClick={() => openAction('approve', r.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                      onClick={() => openAction('send', r.id)}
                    >
                      Send back
                    </button>
                    <button
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                      onClick={() => openAction('reject', r.id)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notice ? (
        <div className="bg-panel border border-[rgba(255,107,107,.25)] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)] mt-3">
          <div className="text-danger font-extrabold">Action failed</div>
          <div className="text-xs text-muted leading-normal">{notice}</div>
        </div>
      ) : null}

      {openRow ? (
        <ReviewDrawer
          row={openRow}
          onClose={() => setOpenId(null)}
          onApprove={() => openAction('approve', openRow.id)}
          onSend={() => openAction('send', openRow.id)}
          onReject={() => openAction('reject', openRow.id)}
        />
      ) : null}

      {modal ? (
        <div className="fixed inset-0 grid place-items-center z-[60]">
          <div className="fixed inset-0 bg-[rgba(0,0,0,.6)] backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="w-[min(560px,92vw)] bg-panel border border-border-light rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] relative z-10">
            <div className="flex justify-between items-center gap-[10px]">
              <div className="font-black">
                {modal.kind === 'approve' ? 'Approve application' : modal.kind === 'reject' ? 'Reject application' : 'Send back for changes'}
              </div>
              <button
                className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                onClick={() => setModal(null)}
              >
                Close
              </button>
            </div>
            <div className="h-2.5" />
            <div className="text-xs text-muted leading-normal">Admin note (optional)</div>
            <textarea
              className="w-full min-h-[120px] resize-y bg-panel border border-border-light text-text rounded-lg p-3 text-[13px] font-inherit transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted"
              value={modal.note}
              onChange={(e) => setModal({ ...modal, note: e.target.value })}
            />
            <div className="h-2.5" />
            <div className="flex justify-end gap-[10px]">
              <button
                className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className="bg-accent border border-accent text-white py-[10px] px-[18px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,.2)] whitespace-nowrap hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_8px_rgba(59,130,246,.3)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={runAction}
                disabled={busy}
              >
                {busy ? 'Working…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function ReviewDrawer({
  row,
  onClose,
  onApprove,
  onSend,
  onReject,
}: {
  row: Application
  onClose: () => void
  onApprove: () => void
  onSend: () => void
  onReject: () => void
}) {
  const [tab, setTab] = useState<'info' | 'docs'>('info')
  const [idx, setIdx] = useState(0)
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({})

  const docs = row.docs ?? []
  const cur = docs[idx] ?? null
  const allReviewed = docs.length === 0 || docs.every((d) => reviewed[d.id])

  function markReviewed(v: boolean) {
    if (!cur) return
    setReviewed((s) => ({ ...s, [cur.id]: v }))
  }

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,.6)] backdrop-blur-sm z-[49]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-[min(560px,92vw)] bg-bg-secondary border-l border-border-light p-6 overflow-auto z-50 shadow-[-4px_0_20px_rgba(0,0,0,.3)]">
        <div className="flex items-center justify-between gap-[10px]">
          <div>
            <div className="font-black">Application {row.id}</div>
            <div className="text-xs text-muted leading-normal">Submitted {row.submittedAt}</div>
          </div>
          <button
            className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="h-2.5" />

        <div className="inline-flex gap-1 p-1 border border-border-light rounded-[10px] bg-panel-2">
          <button
            className={clsx(
              'py-2 px-4 rounded-lg cursor-pointer text-text-secondary border border-transparent text-[13px] font-medium transition-all duration-200',
              tab === 'info'
                ? 'text-text bg-accent-light border-[rgba(59,130,246,.3)] font-semibold'
                : 'hover:text-text hover:bg-[rgba(255,255,255,.04)]'
            )}
            onClick={() => setTab('info')}
          >
            Information
          </button>
          <button
            className={clsx(
              'py-2 px-4 rounded-lg cursor-pointer text-text-secondary border border-transparent text-[13px] font-medium transition-all duration-200',
              tab === 'docs'
                ? 'text-text bg-accent-light border-[rgba(59,130,246,.3)] font-semibold'
                : 'hover:text-text hover:bg-[rgba(255,255,255,.04)]'
            )}
            onClick={() => setTab('docs')}
          >
            Documents ({docs.length})
          </button>
        </div>

        <div className="h-3" />

        {tab === 'info' ? (
          <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)] bg-[rgba(255,255,255,.04)]">
            <div className="grid grid-cols-2 gap-[10px]">
              <Info label="Role" value={ROLES.find((x) => x.code === row.role)?.label ?? row.role} />
              <Info label="Plan" value={row.plan} />
              <Info label="Org" value={row.org} />
              <Info label="Contact" value={row.contact} />
              <Info label="Email" value={row.email} />
              <Info label="Site" value={row.site} />
              <Info label="Country" value={row.country} />
              <Info label="Notes" value={row.notes || '—'} span2 />
            </div>
          </div>
        ) : (
          <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)] bg-[rgba(255,255,255,.04)]">
            {docs.length === 0 ? (
              <div className="text-xs text-muted leading-normal">No documents attached.</div>
            ) : (
              <div className="grid gap-[10px]">
                <div className="flex justify-between gap-[10px]">
                  <div>
                    <div className="text-xs text-muted leading-normal">Document</div>
                    <div className="font-extrabold">{cur?.name ?? '—'}</div>
                  </div>
                  <div className="text-xs text-muted leading-normal">
                    {idx + 1} / {docs.length}
                  </div>
                </div>

                <div className="rounded-[10px] border border-border-light p-4 bg-panel-2 text-text-secondary min-h-[220px] transition-all duration-200 hover:border-border hover:bg-[rgba(37,43,61,.6)]">
                  {cur?.type === 'image' ? (
                    <div className="text-xs text-muted leading-normal">Image preview placeholder (hook to real URL later)</div>
                  ) : cur?.type === 'pdf' ? (
                    <div className="text-xs text-muted leading-normal">PDF preview placeholder (hook to real URL later)</div>
                  ) : (
                    <div className="text-xs text-muted leading-normal">Unsupported preview. Use "Open" to view.</div>
                  )}
                </div>

                <div className="flex justify-between gap-[10px] flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setIdx((i) => Math.max(0, i - 1))}
                      disabled={idx === 0}
                    >
                      Prev
                    </button>
                    <button
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setIdx((i) => Math.min(docs.length - 1, i + 1))}
                      disabled={idx === docs.length - 1}
                    >
                      Next
                    </button>
                    <a
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                      href={cur?.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  </div>

                  <label className="inline-flex gap-2 items-center text-xs text-muted leading-normal">
                    <input
                      className="w-[18px] h-[18px] accent-accent cursor-pointer"
                      type="checkbox"
                      checked={!!reviewed[cur?.id ?? '']}
                      onChange={(e) => markReviewed(e.target.checked)}
                    />
                    Mark this document as reviewed
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-3" />

        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)] bg-[rgba(255,255,255,.04)]">
          <div className="text-xs text-muted leading-normal mb-2">You must review all attached documents before taking action.</div>
          <div className="flex gap-2 justify-end flex-wrap">
            <button
              className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onApprove}
              disabled={!allReviewed}
            >
              Approve
            </button>
            <button
              className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onSend}
              disabled={!allReviewed}
            >
              Send back
            </button>
            <button
              className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onReject}
              disabled={!allReviewed}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Info({ label, value, span2 }: { label: string; value: string; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : undefined}>
      <div className="text-xs text-muted leading-normal">{label}</div>
      <div className="font-extrabold">{value}</div>
    </div>
  )
}
