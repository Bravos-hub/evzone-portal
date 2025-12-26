import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'

interface Statement {
  id: string
  period: string
  gross: number
  fees: number
  net: number
  status: 'Paid' | 'Pending' | 'Processing'
  timestamp: string
}

interface Payout {
  id: string
  timestamp: string
  amount: number
  method: string
  status: 'Sent' | 'Pending' | 'Failed'
}

export function OwnerEarningsPage() {
  const [currency, setCurrency] = useState('USD')
  const [site, setSite] = useState('All Sites')
  const [from, setFrom] = useState('2025-10-01')
  const [to, setTo] = useState('2025-10-28')

  const kpis = [
    { title: 'Gross', value: `$9,120` },
    { title: 'Fees & Taxes', value: `$1,200` },
    { title: 'Net', value: `$7,920` },
  ]

  const statements: Statement[] = [
    {
      id: 'st-9001',
      period: '2025-10-01 → 2025-10-07',
      gross: 2250,
      fees: 300,
      net: 1950,
      status: 'Paid',
      timestamp: '2025-10-08',
    },
    {
      id: 'st-9000',
      period: '2025-09-24 → 2025-09-30',
      gross: 1980,
      fees: 260,
      net: 1720,
      status: 'Paid',
      timestamp: '2025-10-01',
    },
  ]

  const payouts: Payout[] = [
    { id: 'po-510', timestamp: '2025-10-08 09:10', amount: 1950, method: 'Bank • ****1234', status: 'Sent' },
    { id: 'po-509', timestamp: '2025-10-01 09:12', amount: 1720, method: 'Bank • ****1234', status: 'Sent' },
  ]

  const fmt = (n: number) => `${currency} ${n.toLocaleString()}`

  return (
    <DashboardLayout pageTitle="Earnings & Payouts">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-5 gap-3 max-[900px]:grid-cols-2">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="UGX">UGX</option>
            <option value="CNY">CNY</option>
            <option value="KES">KES</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          <select value={site} onChange={(e) => setSite(e.target.value)} className="select">
            <option>All Sites</option>
            <option>Central Hub</option>
            <option>East Parkade</option>
          </select>
          <button className="btn secondary">Export CSV</button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
        {kpis.map((k) => (
          <KpiCard key={k.title} title={k.title} value={k.value} />
        ))}
      </div>

      <div style={{ height: 16 }} />

      {/* Statements & Payouts */}
      <div className="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
        <div className="card">
          <div className="card-title">Statements</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th className="text-right">Gross</th>
                  <th className="text-right">Fees</th>
                  <th className="text-right">Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((s) => (
                  <tr key={s.id}>
                    <td>{s.period}</td>
                    <td className="text-right">{fmt(s.gross)}</td>
                    <td className="text-right">{fmt(s.fees)}</td>
                    <td className="text-right font-semibold">{fmt(s.net)}</td>
                    <td>
                      <span className={`pill ${s.status === 'Paid' ? 'approved' : 'pending'}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Payouts Timeline</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th className="text-right">Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.timestamp}</td>
                    <td className="text-right">{fmt(p.amount)}</td>
                    <td>{p.method}</td>
                    <td>
                      <span className={`pill ${p.status === 'Sent' ? 'approved' : p.status === 'Pending' ? 'pending' : 'rejected'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

