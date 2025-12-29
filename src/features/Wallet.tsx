import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { ROLE_GROUPS } from '@/constants/roles'

/* ─────────────────────────────────────────────────────────────────────────────
   Wallet — Balance, transactions, payouts
   RBAC: All authenticated users (owners, operators, technicians, site owners)
───────────────────────────────────────────────────────────────────────────── */

type TransactionType = 'credit' | 'debit' | 'payout' | 'refund'
type TransactionStatus = 'completed' | 'pending' | 'failed'

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  description: string
  date: string
  status: TransactionStatus
  reference?: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', type: 'credit', amount: 245.00, currency: 'USD', description: 'Session revenue (Oct 28)', date: '2025-10-28 18:30', status: 'completed', reference: 'EVZ-21853' },
  { id: 'TXN-002', type: 'credit', amount: 189.50, currency: 'USD', description: 'Session revenue (Oct 27)', date: '2025-10-27 23:59', status: 'completed' },
  { id: 'TXN-003', type: 'payout', amount: -500.00, currency: 'USD', description: 'Payout to bank ****1234', date: '2025-10-25 10:00', status: 'completed' },
  { id: 'TXN-004', type: 'debit', amount: -15.00, currency: 'USD', description: 'Platform fee (Oct)', date: '2025-10-01 00:00', status: 'completed' },
  { id: 'TXN-005', type: 'refund', amount: -12.50, currency: 'USD', description: 'Refund for session EVZ-21800', date: '2025-10-20 14:22', status: 'completed', reference: 'EVZ-21800' },
  { id: 'TXN-006', type: 'payout', amount: -300.00, currency: 'USD', description: 'Payout to mobile money', date: '2025-10-15 09:00', status: 'pending' },
]

const WALLET_KPIS = [
  { label: 'Available Balance', value: '$1,842.50', highlight: true },
  { label: 'Pending', value: '$300.00' },
  { label: 'Total Earned (30d)', value: '$2,156.00' },
  { label: 'Total Paid Out (30d)', value: '$800.00' },
]

export function Wallet() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'OWNER'

  // Anyone authenticated can view wallet
  const canView = ROLE_GROUPS.ALL_AUTHENTICATED.includes(role as any)

  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [q, setQ] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('bank')
  const [ack, setAck] = useState('')

  const toast = (m: string) => { setAck(m); setTimeout(() => setAck(''), 2000) }

  const filtered = useMemo(() =>
    MOCK_TRANSACTIONS
      .filter(t => !q || (t.id + ' ' + t.description).toLowerCase().includes(q.toLowerCase()))
      .filter(t => type === 'All' || t.type === type)
      .filter(t => status === 'All' || t.status === status)
  , [q, type, status])

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (!amt || amt <= 0) {
      toast('Please enter a valid amount')
      return
    }
    if (amt > 1842.50) {
      toast('Insufficient balance')
      return
    }
    toast(`Withdrawal of $${amt.toFixed(2)} initiated via ${withdrawMethod}`)
    setShowWithdraw(false)
    setWithdrawAmount('')
  }

  if (!canView) {
    return <div className="p-8 text-center text-subtle">No permission to view Wallet.</div>
  }

  return (
    <DashboardLayout pageTitle="Wallet">
      <div className="space-y-6">
        {ack && <div className="rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm">{ack}</div>}

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WALLET_KPIS.map(k => (
            <div key={k.label} className={`rounded-xl border p-5 shadow-sm ${k.highlight ? 'bg-accent text-white border-accent' : 'bg-surface border-border'}`}>
              <div className={`text-sm ${k.highlight ? 'text-white/80' : 'text-subtle'}`}>{k.label}</div>
              <div className="mt-2 text-2xl font-bold">{k.value}</div>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="flex gap-3">
          <button onClick={() => setShowWithdraw(true)} className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover">
            Withdraw Funds
          </button>
          <button onClick={() => toast('Export CSV (demo)')} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">
            Export History
          </button>
          <button onClick={() => toast('View statements (demo)')} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">
            Statements
          </button>
        </section>

        {/* Filters */}
        <section className="bg-surface rounded-xl border border-border p-4 grid md:grid-cols-4 gap-3">
          <label className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.6-3.6" /></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search transactions" className="w-full rounded-lg border border-border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
          </label>
          <select value={type} onChange={e => setType(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2">
            <option value="All">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="payout">Payout</option>
            <option value="refund">Refund</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2">
            <option value="All">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <div className="text-sm text-subtle self-center text-right">{filtered.length} transactions</div>
        </section>

        {/* Transactions table */}
        <section className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-subtle">
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
              <th className="px-4 py-3 !text-right font-medium">Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th className="px-4 py-3 !text-right font-medium">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{t.id}</td>
                  <td className="px-4 py-3">
                    <TypePill type={t.type} />
                  </td>
                  <td className="px-4 py-3">{t.description}</td>
                  <td className={`px-4 py-3 text-right font-medium ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.currency} {t.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-subtle">{t.date}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toast(`View details for ${t.id}`)} className="text-accent hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-subtle">No transactions found.</div>}
        </section>

        {/* Withdraw modal */}
        {showWithdraw && (
          <div className="fixed inset-0 z-50 grid place-items-center">
            <div className="absolute inset-0 bg-black/20" onClick={() => setShowWithdraw(false)} />
            <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Amount (USD)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="1842.50"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                    placeholder="0.00"
                  />
                  <span className="text-xs text-subtle">Available: $1,842.50</span>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Withdrawal Method</span>
                  <select value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value)} className="rounded-lg border border-border px-3 py-2">
                    <option value="bank">Bank Transfer (****1234)</option>
                    <option value="mobile">Mobile Money (MTN)</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </label>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowWithdraw(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover">Withdraw</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function TypePill({ type }: { type: TransactionType }) {
  const colors: Record<TransactionType, string> = {
    credit: 'bg-emerald-100 text-emerald-700',
    debit: 'bg-gray-100 text-gray-700',
    payout: 'bg-blue-100 text-blue-700',
    refund: 'bg-amber-100 text-amber-700',
  }
  const labels: Record<TransactionType, string> = {
    credit: 'Credit',
    debit: 'Debit',
    payout: 'Payout',
    refund: 'Refund',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[type]}`}>{labels[type]}</span>
}

function StatusPill({ status }: { status: TransactionStatus }) {
  const colors: Record<TransactionStatus, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-rose-100 text-rose-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${colors[status]}`}>{status}</span>
}

export default Wallet

