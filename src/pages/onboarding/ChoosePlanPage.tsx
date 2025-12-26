import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type RoleCode = 'owner' | 'operator' | 'siteOwner' | 'technician'
type BillingCycle = 'monthly' | 'yearly'

type Plan = {
  id: string
  name: string
  code: string
  currency: string
  monthly: number | null
  yearly: number | null
  discountPct: number
  badge: string
  popular: boolean
  desc: string
  features: string[]
}

type ErrorBoundaryProps = {
  children: React.ReactNode
}

function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [err, setErr] = useState<unknown>(null)
  return err ? (
    <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
      <div className="font-semibold">Render error</div>
      <pre className="whitespace-pre-wrap text-xs mt-1">{String(err)}</pre>
    </div>
  ) : (
    <Catcher onError={setErr}>{children}</Catcher>
  )
}

class Catcher extends React.Component<{ children: React.ReactNode; onError: (err: unknown) => void }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; onError: (err: unknown) => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(err: unknown) {
    this.props.onError(err)
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}

const ROLES: Array<{ code: RoleCode; label: string }> = [
  { code: 'owner', label: 'Station Owner' },
  { code: 'operator', label: 'Operator' },
  { code: 'siteOwner', label: 'Site Owner' },
  { code: 'technician', label: 'Technician' },
]

const ROLE_ALIASES: Record<string, RoleCode> = {
  owner: 'owner',
  operator: 'operator',
  technician: 'technician',
  siteOwner: 'siteOwner',
  'site-owner': 'siteOwner',
}

const VALID_CYCLES = new Set<BillingCycle>(['monthly', 'yearly'])
const VAT_PCT = 18

const seedPlansByRole: Record<RoleCode, Plan[]> = {
  owner: [
    {
      id: 'OWN-START',
      name: 'Starter',
      code: 'owner-starter',
      currency: 'UGX',
      monthly: 0,
      yearly: 0,
      discountPct: 0,
      badge: 'Free',
      popular: false,
      desc: 'Kick off with a single site.',
      features: ['Billing (Time)', 'Basic reports', 'Email support'],
    },
    {
      id: 'OWN-GROW',
      name: 'Growth',
      code: 'owner-growth',
      currency: 'UGX',
      monthly: 120000,
      yearly: 1200000,
      discountPct: 15,
      badge: 'Most popular',
      popular: true,
      desc: 'Scale with smart billing.',
      features: ['Billing (Time and kWh)', 'TOU bands', 'Other taxes and fees', 'Priority email support'],
    },
    {
      id: 'OWN-PRO',
      name: 'Pro',
      code: 'owner-pro',
      currency: 'UGX',
      monthly: 265000,
      yearly: 2880000,
      discountPct: 10,
      badge: 'Pro',
      popular: false,
      desc: 'Roaming and advanced analytics.',
      features: ['OCPI roaming', 'Four-way settlement', 'Advanced analytics', 'Phone support'],
    },
    {
      id: 'OWN-ENT',
      name: 'Enterprise',
      code: 'owner-enterprise',
      currency: 'UGX',
      monthly: null,
      yearly: null,
      discountPct: 0,
      badge: 'Custom',
      popular: false,
      desc: 'Custom SLA and dedicated success.',
      features: ['Custom SLA', 'Dedicated success', 'Private APIs'],
    },
  ],
  operator: [
    {
      id: 'OP-BASIC',
      name: 'Basic',
      code: 'op-basic',
      currency: 'UGX',
      monthly: 0,
      yearly: 0,
      discountPct: 0,
      badge: 'Free',
      popular: false,
      desc: 'Operate a single site.',
      features: ['Session console', 'Basic logs', 'Email support'],
    },
    {
      id: 'OP-PLUS',
      name: 'Plus',
      code: 'op-plus',
      currency: 'UGX',
      monthly: 85000,
      yearly: 900000,
      discountPct: 12,
      badge: 'Popular',
      popular: true,
      desc: 'Rosters, jobs, and inventory.',
      features: ['Rosters', 'Job tickets', 'Inventory (lite)'],
    },
    {
      id: 'OP-PRO',
      name: 'Pro',
      code: 'op-pro',
      currency: 'UGX',
      monthly: 175000,
      yearly: 1860000,
      discountPct: 10,
      badge: 'Pro',
      popular: false,
      desc: 'Integrations and SLA alerts.',
      features: ['Webhook or API', 'Advanced logs', 'SLA alerts'],
    },
  ],
  siteOwner: [
    {
      id: 'SO-ESS',
      name: 'Essential',
      code: 'so-essential',
      currency: 'UGX',
      monthly: 0,
      yearly: 0,
      discountPct: 0,
      badge: 'Free',
      popular: false,
      desc: 'Visibility for property owners.',
      features: ['Site dashboard', 'Monthly statements'],
    },
    {
      id: 'SO-PRO',
      name: 'Pro',
      code: 'so-pro',
      currency: 'UGX',
      monthly: 65000,
      yearly: 690000,
      discountPct: 8,
      badge: 'Popular',
      popular: true,
      desc: 'Revenue share and payouts.',
      features: ['Revenue share reports', 'Payout center', 'Year-end PDF'],
    },
  ],
  technician: [
    {
      id: 'TECH-FREE',
      name: 'Technician',
      code: 'tech-free',
      currency: 'UGX',
      monthly: 0,
      yearly: 0,
      discountPct: 0,
      badge: 'Free',
      popular: false,
      desc: 'Field tech app access.',
      features: ['Work orders', 'QR scan jobs', 'Basic support'],
    },
    {
      id: 'TECH-PRO',
      name: 'Tech Pro',
      code: 'tech-pro',
      currency: 'UGX',
      monthly: 30000,
      yearly: 324000,
      discountPct: 10,
      badge: 'Pro',
      popular: false,
      desc: 'Pro tools and priority support.',
      features: ['Parts catalog', 'SLA escalations', 'Priority support'],
    },
  ],
}

const fmt = (n: number | null, currency = 'UGX') => (n == null ? 'Contact us' : `${currency} ${Number(n).toLocaleString()}`)
const cx = (...xs: Array<string | false | undefined>) => xs.filter(Boolean).join(' ')

function normalizeRole(value: string | null) {
  if (!value) return null
  const key = value.trim()
  return ROLE_ALIASES[key] || null
}

export function ChoosePlanPage() {
  const navigate = useNavigate()
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return { role: 'owner' as RoleCode, cycle: 'monthly' as BillingCycle, plan: null as string | null }
    try {
      const params = new URLSearchParams(window.location.search || '')
      const qpRole = normalizeRole(params.get('role'))
      const qpCycle = params.get('cycle') as BillingCycle | null
      const qpPlan = params.get('plan')
      const storedRole = normalizeRole(localStorage.getItem('signup.role'))
      const storedCycle = localStorage.getItem('signup.cycle') as BillingCycle | null
      const storedPlan = localStorage.getItem('signup.plan') || localStorage.getItem('signup.planCode')
      return {
        role: qpRole || storedRole || 'owner',
        cycle: VALID_CYCLES.has(qpCycle as BillingCycle) ? (qpCycle as BillingCycle) : storedCycle || 'monthly',
        plan: qpPlan || storedPlan || null,
      }
    } catch {
      return { role: 'owner' as RoleCode, cycle: 'monthly' as BillingCycle, plan: null as string | null }
    }
  }, [])

  const [role, setRole] = useState<RoleCode>(initial.role)
  const [cycle, setCycle] = useState<BillingCycle>(initial.cycle)
  const [selected, setSelected] = useState<string | null>(initial.plan)
  const [coupon, setCoupon] = useState('')
  const [notice, setNotice] = useState('')
  const [pricesIncludeVat, setPricesIncludeVat] = useState(false)

  const plans = seedPlansByRole[role] || []
  const chosen = plans.find((p) => p.id === selected || p.code === selected) || null

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('signup.role', role)
      localStorage.setItem('signup.cycle', cycle)
      if (selected) localStorage.setItem('signup.plan', selected)
      if (chosen?.code) localStorage.setItem('signup.planCode', chosen.code)
    } catch {
      return
    }
  }, [role, cycle, selected, chosen?.code])

  useEffect(() => {
    setCoupon('')
    setNotice('')
    if (!selected) return
    const valid = plans.some((p) => p.id === selected || p.code === selected)
    if (!valid) setSelected(null)
  }, [role, selected, plans])

  const basePrice = useMemo(() => {
    if (!chosen) return 0
    if (chosen.monthly == null && chosen.yearly == null) return 0
    return cycle === 'monthly' ? chosen.monthly || 0 : chosen.yearly || 0
  }, [chosen, cycle])

  const couponPct = useMemo(() => {
    if (!coupon.trim()) return 0
    const map: Record<string, RoleCode> = { OWNER10: 'owner', OPER10: 'operator', SITE10: 'siteOwner', TECH10: 'technician' }
    const key = coupon.trim().toUpperCase()
    return map[key] === role ? 10 : 0
  }, [coupon, role])

  const discountAmt = useMemo(() => Math.round(basePrice * couponPct / 100), [basePrice, couponPct])
  const subtotal = useMemo(() => Math.max(0, basePrice - discountAmt), [basePrice, discountAmt])
  const vatAmt = useMemo(() => {
    if (pricesIncludeVat) {
      const preTax = Math.round(subtotal / (1 + VAT_PCT / 100))
      return subtotal - preTax
    }
    return Math.round(subtotal * VAT_PCT / 100)
  }, [subtotal, pricesIncludeVat])
  const totalDue = useMemo(() => (pricesIncludeVat ? subtotal : subtotal + vatAmt), [subtotal, vatAmt, pricesIncludeVat])

  function onContinue() {
    if (!chosen) {
      setNotice('Select a plan first.')
      return
    }
    const roleParam = role === 'siteOwner' ? 'site-owner' : role
    const params = new URLSearchParams({
      role: roleParam,
      plan: chosen.code,
      cycle,
    })
    navigate(`/onboarding/payment?${params.toString()}`)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--app-muted)] text-[var(--app-fg)]">
        <header className="border-b border-[color:var(--app-border)] bg-[var(--app-surface)]/80 backdrop-blur">
          <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#03cd8c]" />
              <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Choose your plan</h1>
            </div>
            <Link to="/" className="text-sm text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]">
              Back to landing
            </Link>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-4 pt-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--app-border)] bg-[var(--app-surface)] p-1 text-sm">
              {ROLES.map((r) => (
                <button
                  key={r.code}
                  onClick={() => setRole(r.code)}
                  className={cx(
                    'px-3 py-1.5 rounded-lg',
                    role === r.code
                      ? 'bg-[#03cd8c]/10 text-[#03cd8c] border border-[#03cd8c]/40'
                      : 'text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-alt)]'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--app-border)] bg-[var(--app-surface)] p-1 text-sm">
              <button
                onClick={() => setCycle('monthly')}
                className={cx(
                  'px-3 py-1.5 rounded-lg',
                  cycle === 'monthly'
                    ? 'bg-[#03cd8c]/10 text-[#03cd8c] border border-[#03cd8c]/40'
                    : 'text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-alt)]'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle('yearly')}
                className={cx(
                  'px-3 py-1.5 rounded-lg',
                  cycle === 'yearly'
                    ? 'bg-[#03cd8c]/10 text-[#03cd8c] border border-[#03cd8c]/40'
                    : 'text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-alt)]'
                )}
              >
                Yearly
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--app-fg-muted)] mt-2">
            Plans are set per role by Admin. Choose your role, select a plan, then continue.
          </p>
        </section>

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                cycle={cycle}
                selected={selected === p.id || selected === p.code}
                onSelect={() => setSelected(p.id)}
              />
            ))}
          </div>

          <aside className="mt-8 rounded-2xl border border-[color:var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
            <h3 className="font-semibold text-[var(--app-fg)] mb-3">Order summary</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-sm text-[var(--app-fg-muted)]">Role</div>
                <div className="text-lg font-bold text-[var(--app-fg)]">{ROLES.find((r) => r.code === role)?.label}</div>
              </div>
              <div className="md:text-right">
                <div className="text-sm text-[var(--app-fg-muted)]">Selected plan</div>
                <div className="text-lg font-bold text-[var(--app-fg)]">{chosen ? chosen.name : 'Not selected'}</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[color:var(--app-border)] bg-[var(--app-surface-alt)] p-4">
              <div className="flex items-center justify-between text-sm">
                <span>Base price ({cycle})</span>
                <span>{chosen ? fmt(basePrice, chosen.currency) : 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Coupon</span>
                <span className="text-[#03cd8c]">- {chosen ? fmt(discountAmt, chosen.currency) : 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{chosen ? fmt(subtotal, chosen.currency) : 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>VAT ({VAT_PCT}%) {pricesIncludeVat ? '(included)' : ''}</span>
                <span>{chosen ? fmt(vatAmt, chosen.currency) : 'Not selected'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-semibold">
                <span>Total due now</span>
                <span>{chosen ? fmt(totalDue, chosen.currency) : 'Not selected'}</span>
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--app-fg-muted)]">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={pricesIncludeVat}
                  onChange={(e) => setPricesIncludeVat(e.target.checked)}
                />
                Prices shown are VAT-inclusive
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-alt)] p-4 text-sm text-[var(--app-fg-muted)]">
              Next: add billing details and complete payment for the selected plan.
            </div>

            <label className="mt-4 grid gap-1 text-sm">
              <span className="text-[var(--app-fg-muted)]">Coupon code</span>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="OWNER10"
                className="input"
              />
            </label>

            {notice && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                {notice}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[var(--app-fg-muted)]">
                Enterprise or special quote? <Link to="/help/contact" className="text-[#03cd8c] hover:underline">Contact sales</Link>.
              </div>
              <button onClick={onContinue} className="btn">
                Continue to payment
              </button>
            </div>
          </aside>

          <p className="text-xs text-[var(--app-fg-muted)] mt-3">
            Replace seeded data via API, for example GET /api/plans?role=owner.
          </p>
        </main>

        <footer className="border-t border-[color:var(--app-border)] py-6">
          <div className="max-w-6xl mx-auto px-4 text-sm text-[var(--app-fg-muted)] flex items-center justify-between">
            <div>Copyright {new Date().getFullYear()} EVzone. All rights reserved.</div>
            <Link to="/auth/login" className="hover:text-[var(--app-fg)]">
              Back to login
            </Link>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

function PlanCard({
  plan,
  cycle,
  selected,
  onSelect,
}: {
  plan: Plan
  cycle: BillingCycle
  selected: boolean
  onSelect: () => void
}) {
  const price = cycle === 'monthly' ? plan.monthly : plan.yearly
  const isContact = price == null
  return (
    <div
      className={cx(
        'rounded-2xl border bg-[var(--app-surface)] p-5 shadow-sm transition',
        selected ? 'border-[#03cd8c]/60 shadow' : 'border-[color:var(--app-border)]'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs px-2 py-0.5 rounded-full bg-[#03cd8c]/10 text-[#03cd8c] inline-block border border-[#03cd8c]/40">
            {plan.badge}
          </div>
          <h3 className="mt-2 text-xl font-extrabold text-[var(--app-fg)]">{plan.name}</h3>
          <p className="text-sm text-[var(--app-fg-muted)]">{plan.desc}</p>
        </div>
        {plan.popular && (
          <div className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-300/40">
            Popular
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-extrabold text-[var(--app-fg)]">{fmt(price, plan.currency)}</div>
        <div className="text-sm text-[var(--app-fg-muted)]">/ {cycle}</div>
      </div>
      {cycle === 'yearly' && plan.discountPct > 0 && (
        <div className="mt-1 text-xs text-[#03cd8c]">Includes about {plan.discountPct}% yearly discount</div>
      )}
      <ul className="mt-4 text-sm list-disc pl-5 text-[var(--app-fg-muted)] space-y-1">
        {plan.features.slice(0, 6).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="mt-5">
        {isContact ? (
          <Link
            to="/help/contact"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--app-border)] hover:bg-[var(--app-surface-alt)]"
          >
            Contact sales
          </Link>
        ) : (
          <button
            onClick={onSelect}
            className={cx(
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl',
              selected
                ? 'bg-[#03cd8c] text-white hover:opacity-95'
                : 'bg-[var(--app-surface)] border border-[color:var(--app-border)] hover:bg-[var(--app-surface-alt)]'
            )}
          >
            {selected ? 'Selected' : 'Select plan'}
          </button>
        )}
      </div>
    </div>
  )
}
