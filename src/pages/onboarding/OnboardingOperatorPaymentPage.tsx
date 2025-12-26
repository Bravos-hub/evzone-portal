import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type BillingForm = {
  entity: string
  country: string
  city: string
  address: string
  currency: string
  payout: string
  bankHolder: string
  bankName: string
  account: string
  swift: string
  iban: string
  invoiceEmail: string
  taxId: string
  agree: boolean
}

type RoleKey = 'owner' | 'operator' | 'technician' | 'siteOwner'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Station Owner',
  operator: 'Operator',
  technician: 'Technician',
  siteOwner: 'Site Owner',
  'site-owner': 'Site Owner',
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)

function normalizeRole(value: string | null): RoleKey | null {
  if (!value) return null
  const key = value.trim()
  if (key === 'site-owner' || key === 'siteOwner') return 'siteOwner'
  if (key === 'owner' || key === 'operator' || key === 'technician') return key
  return null
}

export function OnboardingOperatorPaymentPage() {
  const navigate = useNavigate()
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return { role: 'owner', plan: '--', cycle: 'monthly' }
    try {
      const params = new URLSearchParams(window.location.search || '')
      const qpRole = normalizeRole(params.get('role'))
      const qpPlan = params.get('plan')
      const qpCycle = params.get('cycle')
      const storedRole = normalizeRole(localStorage.getItem('signup.role'))
      const storedPlan = localStorage.getItem('signup.planCode') || localStorage.getItem('signup.plan')
      const storedCycle = localStorage.getItem('signup.cycle')
      return {
        role: qpRole || storedRole || 'owner',
        plan: qpPlan || storedPlan || '--',
        cycle: qpCycle || storedCycle || 'monthly',
      }
    } catch {
      return { role: 'owner', plan: '--', cycle: 'monthly' }
    }
  }, [])

  const role = initial.role as RoleKey
  const plan = initial.plan
  const cycle = initial.cycle
  const roleParam = role === 'siteOwner' ? 'site-owner' : role
  const roleLabel = ROLE_LABELS[role] || 'User'

  const [form, setForm] = useState<BillingForm>({
    entity: '',
    country: 'Uganda',
    city: 'Kampala',
    address: '',
    currency: 'USD',
    payout: 'Monthly',
    bankHolder: '',
    bankName: '',
    account: '',
    swift: '',
    iban: '',
    invoiceEmail: '',
    taxId: '',
    agree: true,
  })
  const [error, setError] = useState('')
  const [ack, setAck] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('signup.role', role)
      if (plan && plan !== '--') localStorage.setItem('signup.planCode', plan)
      if (cycle) localStorage.setItem('signup.cycle', cycle)
    } catch {
      return
    }
  }, [role, plan, cycle])

  const update = <K extends keyof BillingForm>(key: K, value: BillingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setAck('')
  }

  const validate = () => {
    if (form.entity.trim().length < 3) return 'Please enter your billing entity (3+ chars).'
    if (form.address.trim().length < 5) return 'Please enter a valid address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.invoiceEmail)) return 'Please enter a valid invoicing email.'
    if (form.account.trim().length < 5 && form.iban.trim().length < 8) return 'Provide either an account number or IBAN.'
    if (!form.agree) return 'You must agree to the billing terms.'
    return ''
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setAck('Saved. Continuing...')
    const params = new URLSearchParams({
      role: roleParam,
      plan: plan || '--',
      cycle,
    })
    navigate(`/onboarding/awaiting-approval?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[var(--app-muted)] text-[var(--app-fg)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only fixed top-3 left-3 z-50 bg-[var(--app-surface)] px-3 py-2 rounded-md shadow"
      >
        Skip to content
      </a>

      <header className="sticky top-[var(--page-header-offset)] z-20 backdrop-blur bg-[var(--app-surface)] border-b border-[color:var(--app-border)]">
        <div className="max-w-4xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#03cd8c]">
              <Bolt />
            </span>
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Payment and billing - {roleLabel}</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 2 of 3</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={submit} noValidate>
          <div role="alert" aria-live="polite" className={`text-sm min-h-[1.25rem] ${error ? 'text-danger' : 'text-[#03cd8c]'}`}>
            {error || ack}
          </div>

          <div className="mt-3 rounded-xl border border-[color:var(--app-border)] bg-[var(--app-surface-alt)] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[var(--app-fg-muted)]">Role</div>
                <div className="font-semibold text-[var(--app-fg)]">{roleLabel}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-[var(--app-fg-muted)]">Plan</div>
                <div className="font-semibold text-[var(--app-fg)]">{plan || '--'}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-[var(--app-fg-muted)]">Billing cycle</div>
                <div className="font-semibold text-[var(--app-fg)] capitalize">{cycle}</div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Billing entity (company or legal name)</span>
              <input
                value={form.entity}
                onChange={(e) => update('entity', e.target.value)}
                className="input"
                placeholder="EVZONE (Wuxi) Business Technology Co., Ltd."
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Country</span>
              <select value={form.country} onChange={(e) => update('country', e.target.value)} className="select">
                {['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'China', 'USA', 'Germany'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">City</span>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="input"
                placeholder="Kampala"
              />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-medium">Billing address</span>
              <input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="input"
                placeholder="265, No. 3 Gaolang East Road, Xinwu District, Wuxi City"
              />
            </label>
          </div>

          <fieldset className="mt-4 grid sm:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Payout currency</span>
              <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="select">
                {['USD', 'EUR', 'UGX', 'CNY', 'KES'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Payout frequency</span>
              <select value={form.payout} onChange={(e) => update('payout', e.target.value)} className="select">
                {['Weekly', 'Bi-weekly', 'Monthly'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Invoicing email</span>
              <input
                type="email"
                value={form.invoiceEmail}
                onChange={(e) => update('invoiceEmail', e.target.value)}
                className="input"
                placeholder="billing@company.com"
              />
            </label>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Bank details</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-sm text-[var(--app-fg-muted)]">Account holder</span>
                <input value={form.bankHolder} onChange={(e) => update('bankHolder', e.target.value)} className="input" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-[var(--app-fg-muted)]">Bank name</span>
                <input value={form.bankName} onChange={(e) => update('bankName', e.target.value)} className="input" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-[var(--app-fg-muted)]">Account number</span>
                <input value={form.account} onChange={(e) => update('account', e.target.value)} className="input" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-[var(--app-fg-muted)]">SWIFT or BIC</span>
                <input value={form.swift} onChange={(e) => update('swift', e.target.value)} className="input" />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-sm text-[var(--app-fg-muted)]">IBAN (if applicable)</span>
                <input value={form.iban} onChange={(e) => update('iban', e.target.value)} className="input" />
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-4 grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-[var(--app-fg-muted)]">Tax ID or VAT</span>
              <input value={form.taxId} onChange={(e) => update('taxId', e.target.value)} className="input" placeholder="VAT-123456" />
            </label>
            <label className="inline-flex items-center gap-2 text-sm self-end">
              <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} className="checkbox" />
              <span>
                I agree to the{' '}
                <Link className="underline" to="/legal/terms">
                  Terms
                </Link>{' '}
                and{' '}
                <Link className="underline" to="/legal/privacy">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </fieldset>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Link
              to={`/onboarding/choose-plan?role=${encodeURIComponent(roleParam)}&plan=${encodeURIComponent(plan || '')}&cycle=${encodeURIComponent(cycle)}`}
              className="btn secondary"
            >
              Back
            </Link>
            <button type="submit" className="btn">
              Continue
            </button>
          </div>
        </form>
      </main>

      <footer className="border-t border-[color:var(--app-border)] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-[var(--app-fg-subtle)] flex items-center justify-between">
          <div>Copyright {new Date().getFullYear()} EVzone. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-[var(--app-fg)]">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-[var(--app-fg)]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
