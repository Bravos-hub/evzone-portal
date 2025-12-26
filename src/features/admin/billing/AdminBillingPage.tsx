import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card } from '@/ui/components/Card'

type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'ALL'
type Tab = 'ledger' | 'payouts' | 'reconciliation' | 'refunds' | 'failures'
type PaymentMethod = 'CARD' | 'MOBILE_MONEY' | 'WALLET' | 'BANK'
type TxType = 'CHARGE_SESSION' | 'SWAP_SESSION' | 'TOPUP' | 'SUBSCRIPTION' | 'FEE' | 'ADJUSTMENT' | 'PAYOUT' | 'REFUND'
type TxStatus = 'PENDING' | 'SETTLED' | 'FAILED' | 'REFUNDED' | 'DISPUTED'
type PayoutStatus = 'QUEUED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'ON_HOLD'
type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'WON' | 'LOST' | 'REFUNDED'

type Money = { currency: string; amount: number } // amount in minor units (e.g., cents)
type LedgerTx = {
  id: string
  at: string
  region: Region
  org: string
  station?: string
  user?: string
  type: TxType
  method: PaymentMethod
  status: TxStatus
  gross: Money
  fees: Money
  net: Money
  providerRef?: string
  sessionId?: string
  note?: string
}

type Payout = {
  id: string
  at: string
  region: Region
  ownerOrg: string
  payoutMethod: 'BANK' | 'MOBILE_MONEY'
  status: PayoutStatus
  amount: Money
  fee: Money
  reference?: string
  batchId?: string
  notes?: string
}

type RecoItem = {
  id: string
  at: string
  region: Region
  provider: string
  kind: 'PROVIDER_EVENT' | 'LEDGER_TX'
  ref: string
  amount: Money
  matched: boolean
  matchTo?: string
  issue?: 'MISSING_LEDGER' | 'MISSING_PROVIDER' | 'AMOUNT_MISMATCH' | 'DUPLICATE'
}

type Refund = {
  id: string
  at: string
  region: Region
  originalTxId: string
  status: DisputeStatus
  amount: Money
  reason: string
  evidence?: string
  resolution?: string
}

const regions: Array<{ id: Region; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const seedLedger: LedgerTx[] = [
  {
    id: 'TX-99121',
    at: '2025-12-24 09:40',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    station: 'ST-0017',
    user: 'Rider U-201',
    type: 'CHARGE_SESSION',
    method: 'MOBILE_MONEY',
    status: 'SETTLED',
    gross: { currency: 'UGX', amount: 220000 },
    fees: { currency: 'UGX', amount: 6000 },
    net: { currency: 'UGX', amount: 214000 },
    providerRef: 'MM-8822011',
    sessionId: 'SES-70012',
    note: 'Charge session completed',
  },
  {
    id: 'TX-99103',
    at: '2025-12-24 09:25',
    region: 'AFRICA',
    org: 'VOLT_MOBILITY',
    station: 'ST-0001',
    user: 'Rider U-199',
    type: 'SWAP_SESSION',
    method: 'WALLET',
    status: 'PENDING',
    gross: { currency: 'UGX', amount: 180000 },
    fees: { currency: 'UGX', amount: 4000 },
    net: { currency: 'UGX', amount: 176000 },
    providerRef: 'WL-100992',
    sessionId: 'SWP-88310',
    note: 'Swap started; awaiting station confirmation',
  },
  {
    id: 'TX-99010',
    at: '2025-12-24 08:50',
    region: 'AFRICA',
    org: '—',
    type: 'TOPUP',
    method: 'CARD',
    status: 'FAILED',
    gross: { currency: 'UGX', amount: 500000 },
    fees: { currency: 'UGX', amount: 0 },
    net: { currency: 'UGX', amount: 0 },
    providerRef: 'CD-ERR-109',
    note: 'Provider timeout',
  },
  {
    id: 'TX-98881',
    at: '2025-12-23 13:12',
    region: 'EUROPE',
    org: 'MALL_HOLDINGS',
    station: 'ST-1011',
    user: 'Rider U-44',
    type: 'CHARGE_SESSION',
    method: 'CARD',
    status: 'DISPUTED',
    gross: { currency: 'EUR', amount: 1200 },
    fees: { currency: 'EUR', amount: 40 },
    net: { currency: 'EUR', amount: 1160 },
    providerRef: 'STRP-22019',
    sessionId: 'SES-55001',
    note: 'Cardholder raised chargeback',
  },
]

const seedPayouts: Payout[] = [
  {
    id: 'PO-12011',
    at: '2025-12-24 08:00',
    region: 'AFRICA',
    ownerOrg: 'VOLT_MOBILITY',
    payoutMethod: 'MOBILE_MONEY',
    status: 'PROCESSING',
    amount: { currency: 'UGX', amount: 12400000 },
    fee: { currency: 'UGX', amount: 35000 },
    batchId: 'BATCH-DEC-24-AM',
    notes: 'Daily settlement batch',
  },
  {
    id: 'PO-11990',
    at: '2025-12-23 18:30',
    region: 'EUROPE',
    ownerOrg: 'MALL_HOLDINGS',
    payoutMethod: 'BANK',
    status: 'PAID',
    amount: { currency: 'EUR', amount: 480000 },
    fee: { currency: 'EUR', amount: 1200 },
    reference: 'SEPA-8830101',
    batchId: 'BATCH-DEC-23-EU',
  },
  {
    id: 'PO-11910',
    at: '2025-12-22 16:10',
    region: 'AFRICA',
    ownerOrg: 'KAMPALA_CHARGE_CO',
    payoutMethod: 'BANK',
    status: 'ON_HOLD',
    amount: { currency: 'UGX', amount: 8900000 },
    fee: { currency: 'UGX', amount: 0 },
    notes: 'KYC missing: add bank proof & TIN',
  },
]

const seedReco: RecoItem[] = [
  { id: 'RC-1001', at: '2025-12-24 09:41', region: 'AFRICA', provider: 'MobileMoney', kind: 'PROVIDER_EVENT', ref: 'MM-8822011', amount: { currency: 'UGX', amount: 220000 }, matched: true, matchTo: 'TX-99121' },
  { id: 'RC-1002', at: '2025-12-24 09:27', region: 'AFRICA', provider: 'Wallet', kind: 'LEDGER_TX', ref: 'TX-99103', amount: { currency: 'UGX', amount: 180000 }, matched: false, issue: 'MISSING_PROVIDER' },
  { id: 'RC-1003', at: '2025-12-24 08:52', region: 'AFRICA', provider: 'CardProcessor', kind: 'PROVIDER_EVENT', ref: 'CD-ERR-109', amount: { currency: 'UGX', amount: 500000 }, matched: false, issue: 'MISSING_LEDGER' },
  { id: 'RC-1004', at: '2025-12-23 13:13', region: 'EUROPE', provider: 'Stripe', kind: 'PROVIDER_EVENT', ref: 'STRP-22019', amount: { currency: 'EUR', amount: 1200 }, matched: false, issue: 'AMOUNT_MISMATCH' },
]

const seedRefunds: Refund[] = [
  { id: 'RF-2201', at: '2025-12-24 10:12', region: 'EUROPE', originalTxId: 'TX-98881', status: 'UNDER_REVIEW', amount: { currency: 'EUR', amount: 1200 }, reason: 'Chargeback: service not delivered', evidence: 'Session logs + charger status attached' },
  { id: 'RF-2190', at: '2025-12-22 09:05', region: 'AFRICA', originalTxId: 'TX-99010', status: 'REFUNDED', amount: { currency: 'UGX', amount: 500000 }, reason: 'Provider timeout; user charged twice', resolution: 'Manual refund via MM; ledger adjusted' },
]

async function apiLoadAll() {
  await new Promise((r) => setTimeout(r, 140))
  return { ledger: seedLedger, payouts: seedPayouts, reco: seedReco, refunds: seedRefunds }
}

export function AdminBillingPage() {
  const [tab, setTab] = useState<Tab>('ledger')
  const [region, setRegion] = useState<Region>('ALL')
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<LedgerTx[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [reco, setReco] = useState<RecoItem[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [openTx, setOpenTx] = useState<LedgerTx | null>(null)
  const [openPayout, setOpenPayout] = useState<Payout | null>(null)
  const [toast, setToast] = useState('')
  const [status, setStatus] = useState<TxStatus | 'ALL'>('ALL')
  const [method, setMethod] = useState<PaymentMethod | 'ALL'>('ALL')
  const [type, setType] = useState<TxType | 'ALL'>('ALL')

  useEffect(() => {
    void (async () => {
      const x = await apiLoadAll()
      setRows(x.ledger)
      setPayouts(x.payouts)
      setReco(x.reco)
      setRefunds(x.refunds)
    })()
  }, [])

  const ledger = useMemo(() => {
    return rows.filter((t) => {
      const okR = region === 'ALL' || t.region === region
      const okQ =
        !q ||
        (t.id +
          ' ' +
          t.org +
          ' ' +
          (t.station ?? '') +
          ' ' +
          (t.user ?? '') +
          ' ' +
          (t.providerRef ?? '') +
          ' ' +
          (t.sessionId ?? '')).toLowerCase().includes(q.toLowerCase())
      const okS = status === 'ALL' || t.status === status
      const okM = method === 'ALL' || t.method === method
      const okT = type === 'ALL' || t.type === type
      return okR && okQ && okS && okM && okT
    })
  }, [rows, region, q, status, method, type])

  const failures = useMemo(() => ledger.filter((t) => t.status === 'FAILED'), [ledger])

  const kpi = useMemo(() => {
    const total = ledger.length
    const gross = sum(ledger.map((t) => t.gross))
    const fees = sum(ledger.map((t) => t.fees))
    const net = sum(ledger.map((t) => t.net))
    const pending = ledger.filter((t) => t.status === 'PENDING').length
    const failed = ledger.filter((t) => t.status === 'FAILED').length
    const disputed = ledger.filter((t) => t.status === 'DISPUTED').length
    return { total, gross, fees, net, pending, failed, disputed }
  }, [ledger])

  function exportLedgerCsv() {
    const headers = ['id', 'at', 'region', 'org', 'station', 'user', 'type', 'method', 'status', 'currency', 'gross', 'fees', 'net', 'providerRef', 'sessionId']
    const lines = [
      headers.join(','),
      ...ledger.map((t) =>
        [
          t.id,
          t.at,
          t.region,
          csv(t.org),
          csv(t.station ?? ''),
          csv(t.user ?? ''),
          t.type,
          t.method,
          t.status,
          t.gross.currency,
          String(t.gross.amount),
          String(t.fees.amount),
          String(t.net.amount),
          csv(t.providerRef ?? ''),
          csv(t.sessionId ?? ''),
        ].join(','),
      ),
    ]
    downloadCsv(lines.join('\n'), `evzone-ledger-${nowDate()}.csv`)
    toastMsg('Ledger export started (demo).')
  }

  function toastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 1600)
  }

  return (
    <DashboardLayout pageTitle="Billing • Payments • Reconciliation">
      <div className="card">
        <div className="split">
          <input className="input" placeholder="Search tx / provider ref / session / org / station" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value as any)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {tab === 'ledger' || tab === 'failures' ? (
            <>
              <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="ALL">All Types</option>
                {(['CHARGE_SESSION','SWAP_SESSION','TOPUP','SUBSCRIPTION','FEE','ADJUSTMENT','PAYOUT','REFUND'] as TxType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select className="select" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                <option value="ALL">All Methods</option>
                {(['CARD','MOBILE_MONEY','WALLET','BANK'] as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="ALL">All Status</option>
                {(['PENDING','SETTLED','FAILED','REFUNDED','DISPUTED'] as TxStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          ) : null}

          <div style={{ flex: 1 }} />

          {tab === 'ledger' ? (
            <button className="btn secondary" onClick={exportLedgerCsv}>
              Export ledger
            </button>
          ) : null}

          <button className="btn" onClick={() => alert('Placeholder: configure providers, settlement rules, fee tables')}>
            Configure billing
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="tabs">
          <button className={`tab ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>Ledger</button>
          <button className={`tab ${tab === 'payouts' ? 'active' : ''}`} onClick={() => setTab('payouts')}>Payouts</button>
          <button className={`tab ${tab === 'reconciliation' ? 'active' : ''}`} onClick={() => setTab('reconciliation')}>Reconciliation</button>
          <button className={`tab ${tab === 'refunds' ? 'active' : ''}`} onClick={() => setTab('refunds')}>Refunds & Disputes</button>
          <button className={`tab ${tab === 'failures' ? 'active' : ''}`} onClick={() => setTab('failures')}>Failures</button>
        </div>

        <div style={{ height: 12 }} />

        <div className="kpi-grid">
          <KpiCardMetric label="Tx count" value={String(kpi.total)} hint="Filtered ledger" />
          <KpiCardMetric label="Gross" value={fmt(kpi.gross)} hint="Total collected" />
          <KpiCardMetric label="Fees" value={fmt(kpi.fees)} hint="Provider + platform" />
          <KpiCardMetric label="Net" value={fmt(kpi.net)} hint="After fees" />
          <KpiCardMetric label="Pending" value={String(kpi.pending)} hint="Not settled yet" tone={kpi.pending ? 'warn' : 'ok'} />
          <KpiCardMetric label="Failed/Disputed" value={`${kpi.failed}/${kpi.disputed}`} hint="Needs action" tone={kpi.failed || kpi.disputed ? 'danger' : 'ok'} />
        </div>
      </div>

      <div style={{ height: 12 }} />

      {tab === 'ledger' ? (
        <LedgerTable rows={ledger} onOpen={(t) => setOpenTx(t)} />
      ) : tab === 'failures' ? (
        <FailuresPanel rows={failures} onOpen={(t) => setOpenTx(t)} />
      ) : tab === 'payouts' ? (
        <PayoutsPanel region={region} q={q} rows={payouts} onOpen={(p) => setOpenPayout(p)} />
      ) : tab === 'reconciliation' ? (
        <ReconciliationPanel region={region} q={q} rows={reco} />
      ) : (
        <RefundsPanel region={region} q={q} rows={refunds} />
      )}

      {toast ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="small">{toast}</div>
        </div>
      ) : null}

      {openTx ? <TxDrawer tx={openTx} onClose={() => setOpenTx(null)} onToast={toastMsg} /> : null}
      {openPayout ? <PayoutDrawer payout={openPayout} onClose={() => setOpenPayout(null)} onToast={toastMsg} /> : null}
    </DashboardLayout>
  )
}

function KpiCardMetric({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'danger' | 'ok' | 'warn' }) {
  const toneClass = tone === 'danger' ? 'text-rose-200' : tone === 'warn' ? 'text-amber-200' : tone === 'ok' ? 'text-emerald-200' : 'text-muted'
  return (
    <Card className="flex flex-col gap-1.5">
      <p className="card-title mb-1.5">{label}</p>
      <p className="kpi-value">{value}</p>
      <p className={`text-xs m-0 ${toneClass}`}>{hint}</p>
    </Card>
  )
}

function LedgerTable({ rows, onOpen }: { rows: LedgerTx[]; onOpen: (t: LedgerTx) => void }) {
  return (
    <div className="card">
      <div className="card-title">Ledger transactions</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Org / Station</th>
              <th>Type</th>
              <th>Method</th>
              <th>Status</th>
              <th>Gross</th>
              <th>Fees</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 900 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(t)}>
                    {t.id}
                  </button>
                </td>
                <td className="small">{t.at}</td>
                <td className="small">
                  <div style={{ fontWeight: 800 }}>{t.org}</div>
                  <div className="small">{t.station ?? '—'}</div>
                </td>
                <td className="small">{t.type}</td>
                <td className="small">{t.method}</td>
                <td><Status status={t.status} /></td>
                <td className="small">{fmt(t.gross)}</td>
                <td className="small">{fmt(t.fees)}</td>
                <td className="small">{fmt(t.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 10 }} />
      <div className="panel">Backend: pagination, provider webhooks, settlement batches, and per-region currencies.</div>
    </div>
  )
}

function FailuresPanel({ rows, onOpen }: { rows: LedgerTx[]; onOpen: (t: LedgerTx) => void }) {
  return (
    <div className="row2">
      <div className="card">
        <div className="card-title">Failed payments</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Provider ref</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 900 }}>
                    <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(t)}>
                      {t.id}
                    </button>
                  </td>
                  <td className="small">{t.at}</td>
                  <td className="small">{t.type}</td>
                  <td className="small">{t.method}</td>
                  <td className="small">{fmt(t.gross)}</td>
                  <td className="small">{t.providerRef ?? '—'}</td>
                  <td className="small">{t.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ height: 10 }} />
        <div className="panel">Actions typically include retry, cancel, manual reconcile, or open incident if systemic.</div>
      </div>
      <div className="card">
        <div className="card-title">Retry policy (placeholder)</div>
        <div className="grid">
          <div className="panel"><strong>Auto retry</strong>: 3 attempts (2m, 10m, 30m)</div>
          <div className="panel"><strong>Fallback</strong>: offer wallet top-up or alternate provider</div>
          <div className="panel"><strong>Alert</strong>: spike in failures triggers SEV2/SEV1</div>
          <div className="panel"><strong>Link</strong>: create incident + dispatch if station-side issue</div>
        </div>
      </div>
    </div>
  )
}

function PayoutsPanel({ region, q, rows, onOpen }: { region: Region; q: string; rows: Payout[]; onOpen: (p: Payout) => void }) {
  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const okR = region === 'ALL' || p.region === region
      const okQ = !q || (p.id + ' ' + p.ownerOrg + ' ' + (p.batchId ?? '') + ' ' + (p.reference ?? '')).toLowerCase().includes(q.toLowerCase())
      return okR && okQ
    })
  }, [rows, region, q])

  const totals = useMemo(() => {
    const count = filtered.length
    const amount = sum(filtered.map((p) => p.amount))
    const fees = sum(filtered.map((p) => p.fee))
    const onHold = filtered.filter((p) => p.status === 'ON_HOLD').length
    return { count, amount, fees, onHold }
  }, [filtered])

  return (
    <div className="row2">
      <div className="card">
        <div className="card-title">Payouts</div>
        <div className="grid">
          <div className="panel">Count: <strong>{totals.count}</strong></div>
          <div className="panel">Amount: <strong>{fmt(totals.amount)}</strong></div>
          <div className="panel">Fees: <strong>{fmt(totals.fees)}</strong></div>
          <div className="panel">On-hold: <strong>{totals.onHold}</strong></div>
        </div>

        <div style={{ height: 10 }} />

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Owner</th>
                <th>Method</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Batch</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 900 }}>
                    <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onOpen(p)}>
                      {p.id}
                    </button>
                  </td>
                  <td className="small">{p.at}</td>
                  <td className="small">{p.ownerOrg}</td>
                  <td className="small">{p.payoutMethod}</td>
                  <td><PayoutStatusPill status={p.status} /></td>
                  <td className="small">{fmt(p.amount)}</td>
                  <td className="small">{fmt(p.fee)}</td>
                  <td className="small">{p.batchId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ height: 10 }} />
        <div className="panel">Backend: calculate settlement per owner per station, handle KYC holds, and provider callbacks.</div>
      </div>

      <div className="card">
        <div className="card-title">Settlement rules (placeholder)</div>
        <div className="grid">
          <div className="panel">Cutoff time per region (e.g., 23:59 local).</div>
          <div className="panel">Fees: provider fees + platform fees + taxes.</div>
          <div className="panel">Adjustments: refunds/disputes/downtime credits.</div>
          <div className="panel">On-hold: KYC, fraud flags, policy violations.</div>
        </div>
      </div>
    </div>
  )
}

function ReconciliationPanel({ region, q, rows }: { region: Region; q: string; rows: RecoItem[] }) {
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okR = region === 'ALL' || r.region === region
      const okQ = !q || (r.id + ' ' + r.provider + ' ' + r.ref + ' ' + (r.matchTo ?? '')).toLowerCase().includes(q.toLowerCase())
      return okR && okQ
    })
  }, [rows, region, q])

  const k = useMemo(() => {
    const total = filtered.length
    const matched = filtered.filter((x) => x.matched).length
    const issues = filtered.filter((x) => !x.matched).length
    return { total, matched, issues }
  }, [filtered])

  return (
    <div className="row2">
      <div className="card">
        <div className="card-title">Reconciliation</div>
        <div className="grid">
          <div className="panel">Items: <strong>{k.total}</strong></div>
          <div className="panel">Matched: <strong>{k.matched}</strong></div>
          <div className="panel">Issues: <strong>{k.issues}</strong></div>
          <button className="btn secondary" onClick={() => alert('Placeholder: run reconciliation job')}>Run reconciliation</button>
        </div>

        <div style={{ height: 10 }} />

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Provider</th>
                <th>Kind</th>
                <th>Ref</th>
                <th>Amount</th>
                <th>Matched</th>
                <th>Issue</th>
                <th>Match to</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900 }}>{r.id}</td>
                  <td className="small">{r.at}</td>
                  <td className="small">{r.provider}</td>
                  <td className="small">{r.kind}</td>
                  <td className="small">{r.ref}</td>
                  <td className="small">{fmt(r.amount)}</td>
                  <td>{r.matched ? <span className="pill approved">Yes</span> : <span className="pill pending">No</span>}</td>
                  <td className="small">{r.issue ?? '—'}</td>
                  <td className="small">{r.matchTo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ height: 10 }} />
        <div className="panel">Backend: ingest provider statements/events, auto-match, flag mismatches, and create audit events.</div>
      </div>

      <div className="card">
        <div className="card-title">Common mismatch types</div>
        <div className="grid">
          <div className="panel"><strong>Missing ledger</strong>: provider captured but no internal tx.</div>
          <div className="panel"><strong>Missing provider</strong>: internal tx but provider never captured.</div>
          <div className="panel"><strong>Amount mismatch</strong>: fees/currency rounding or double-charge.</div>
          <div className="panel"><strong>Duplicate</strong>: retries created extra records.</div>
        </div>
      </div>
    </div>
  )
}

function RefundsPanel({ region, q, rows }: { region: Region; q: string; rows: Refund[] }) {
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okR = region === 'ALL' || r.region === region
      const okQ = !q || (r.id + ' ' + r.originalTxId + ' ' + r.reason).toLowerCase().includes(q.toLowerCase())
      return okR && okQ
    })
  }, [rows, region, q])

  return (
    <div className="row2">
      <div className="card">
        <div className="card-title">Refunds & disputes</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Original Tx</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900 }}>{r.id}</td>
                  <td className="small">{r.at}</td>
                  <td className="small">{r.originalTxId}</td>
                  <td><DisputePill status={r.status} /></td>
                  <td className="small">{fmt(r.amount)}</td>
                  <td className="small">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ height: 10 }} />
        <div className="panel">Backend: attach evidence, track deadlines, respond to chargebacks, and post ledger adjustments.</div>
      </div>

      <div className="card">
        <div className="card-title">Dispute workflow (placeholder)</div>
        <div className="grid">
          <div className="panel">Open → Under Review → Won/Lost/Refunded</div>
          <div className="panel">Evidence: session logs, station telemetry, user receipts, photos.</div>
          <div className="panel">Notify: owner + operator + helpdesk; open incident if systemic.</div>
          <div className="panel">Adjustments: reverse payout, apply credits, update fees/taxes.</div>
        </div>
      </div>
    </div>
  )
}

function TxDrawer({ tx, onClose, onToast }: { tx: LedgerTx; onClose: () => void; onToast: (m: string) => void }) {
  const [status, setStatus] = useState<TxStatus>(tx.status)
  const [note, setNote] = useState(tx.note ?? '')

  function save() {
    onToast('Saved (demo). Backend will persist and audit.')
    onClose()
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{tx.id} • {tx.type}</div>
            <div className="small">{tx.at} • {tx.region} • {tx.method}</div>
          </div>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ height: 10 }} />
        <div className="grid">
          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Amounts</div>
            <div className="grid">
              <div className="panel">Gross: <strong>{fmt(tx.gross)}</strong></div>
              <div className="panel">Fees: <strong>{fmt(tx.fees)}</strong></div>
              <div className="panel">Net: <strong>{fmt(tx.net)}</strong></div>
            </div>
            <div style={{ height: 10 }} />
            <div className="panel">Provider ref: {tx.providerRef ?? '—'}</div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Context</div>
            <div className="panel">Org: <strong>{tx.org}</strong></div>
            <div style={{ height: 8 }} />
            <div className="panel">Station: <strong>{tx.station ?? '—'}</strong></div>
            <div style={{ height: 8 }} />
            <div className="panel">User: <strong>{tx.user ?? '—'}</strong></div>
            <div style={{ height: 8 }} />
            <div className="panel">Session: <strong>{tx.sessionId ?? '—'}</strong></div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div className="card-title">Actions</div>
          <div className="split">
            <label>
              <div className="small">Status</div>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="PENDING">PENDING</option>
                <option value="SETTLED">SETTLED</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="DISPUTED">DISPUTED</option>
              </select>
            </label>
            <div style={{ flex: 1 }} />
            <button className="btn secondary" onClick={() => alert('Placeholder: open provider event timeline')}>Provider timeline</button>
            <button className="btn secondary" onClick={() => alert('Placeholder: create incident from tx')}>Create incident</button>
          </div>

          <div style={{ height: 10 }} />

          <label>
            <div className="small">Internal note</div>
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          <div style={{ height: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn secondary" onClick={() => { onToast('Retry started (demo).'); }}>
              Retry
            </button>
            <button className="btn secondary" onClick={() => { onToast('Refund initiated (demo).'); }}>
              Refund
            </button>
            <button className="btn" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function PayoutDrawer({ payout, onClose, onToast }: { payout: Payout; onClose: () => void; onToast: (m: string) => void }) {
  const [status, setStatus] = useState<PayoutStatus>(payout.status)
  const [notes, setNotes] = useState(payout.notes ?? '')

  function save() {
    onToast('Payout updated (demo). Backend should audit this.')
    onClose()
  }

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 49 }} />
      <div className="drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900 }}>{payout.id} • {payout.ownerOrg}</div>
            <div className="small">{payout.at} • {payout.region} • {payout.payoutMethod}</div>
          </div>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ height: 10 }} />

        <div className="grid">
          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Amounts</div>
            <div className="grid">
              <div className="panel">Amount: <strong>{fmt(payout.amount)}</strong></div>
              <div className="panel">Fee: <strong>{fmt(payout.fee)}</strong></div>
            </div>
            <div style={{ height: 10 }} />
            <div className="panel">Batch: {payout.batchId ?? '—'}</div>
            <div style={{ height: 8 }} />
            <div className="panel">Reference: {payout.reference ?? '—'}</div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="card-title">Actions</div>
            <label>
              <div className="small">Status</div>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="QUEUED">QUEUED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="ON_HOLD">ON_HOLD</option>
              </select>
            </label>
            <div style={{ height: 10 }} />
            <label>
              <div className="small">Notes</div>
              <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn secondary" onClick={() => onToast('Re-run payout (demo).')}>Re-run</button>
              <button className="btn secondary" onClick={() => onToast('Placed on hold (demo).')}>Hold</button>
              <button className="btn" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Status({ status }: { status: TxStatus }) {
  const cls = status === 'SETTLED' ? 'approved' : status === 'PENDING' ? 'pending' : status === 'FAILED' ? 'rejected' : status === 'DISPUTED' ? 'sendback' : 'approved'
  return <span className={`pill ${cls}`}>{status}</span>
}
function PayoutStatusPill({ status }: { status: PayoutStatus }) {
  const cls = status === 'PAID' ? 'approved' : status === 'PROCESSING' ? 'pending' : status === 'FAILED' ? 'rejected' : status === 'ON_HOLD' ? 'sendback' : 'pending'
  return <span className={`pill ${cls}`}>{status}</span>
}
function DisputePill({ status }: { status: DisputeStatus }) {
  const cls = status === 'WON' ? 'approved' : status === 'LOST' ? 'rejected' : status === 'REFUNDED' ? 'approved' : status === 'OPEN' ? 'pending' : 'sendback'
  return <span className={`pill ${cls}`}>{status}</span>
}

function fmt(m: Money) {
  // keep it simple: show major units if UGX, else use decimals for EUR/USD-ish minor units
  if (m.currency === 'UGX') return `UGX ${m.amount.toLocaleString()}`
  const major = (m.amount / 100).toFixed(2)
  return `${m.currency} ${major}`
}
function sum(list: Money[]) {
  if (!list.length) return { currency: 'UGX', amount: 0 }
  const currency = list[0].currency
  return { currency, amount: list.reduce((acc, m) => acc + m.amount, 0) }
}
function csv(v: string) {
  const s = v ?? ''
  if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"'
  return s
}
function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
function nowDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
