import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type OperatorForm = {
  company: string
  regions: Set<string>
  sla: string
  response: string
  noc: string
  price: string
  services: Set<string>
  certs: Set<string>
  email: string
  phone: string
  about: string
}

const REGIONS = ['Africa', 'Europe', 'Asia', 'Americas']
const SLAS = ['Bronze', 'Silver', 'Gold', 'Platinum']
const RESP = ['2h', '4h', '8h', 'Next-day']
const NOC = ['24/7', 'Business hours']
const PRICES = ['<$200/site/mo', '$200-$500', '>$500']
const SERVICES = ['24/7 NOC', 'Maintenance', 'Firmware', 'DLM', 'Smart Charging', 'Roaming', 'Dispatch']
const CERTS = ['OCPP', 'ISO 27001', 'SOC 2']

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)

export function OnboardingOperatorPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<OperatorForm>({
    company: '',
    regions: new Set(['Africa']),
    sla: 'Gold',
    response: '4h',
    noc: '24/7',
    price: '$200-$500',
    services: new Set(['24/7 NOC', 'Maintenance']),
    certs: new Set(['OCPP']),
    email: '',
    phone: '',
    about: '',
  })
  const [error, setError] = useState('')
  const [ack, setAck] = useState('')

  const update = <K extends keyof OperatorForm>(key: K, value: OperatorForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setAck('')
  }

  const toggleRegion = (value: string) => {
    setForm((prev) => {
      const next = new Set(prev.regions)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, regions: next }
    })
    setAck('')
  }

  const toggleService = (value: string) => {
    setForm((prev) => {
      const next = new Set(prev.services)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, services: next }
    })
    setAck('')
  }

  const toggleCert = (value: string) => {
    setForm((prev) => {
      const next = new Set(prev.certs)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, certs: next }
    })
    setAck('')
  }

  const validate = () => {
    if (form.company.trim().length < 3) return 'Please enter the company name (3+ chars).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.'
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
    navigate('/onboarding/operator/payment')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Operator onboarding</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 1 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={submit} noValidate>
          <div role="alert" aria-live="polite" className={`text-sm min-h-[1.25rem] ${error ? 'text-danger' : 'text-[#03cd8c]'}`}>
            {error || ack}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Company</span>
              <input
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                className="input"
                placeholder="VoltOps Ltd"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">SLA tier</span>
              <select value={form.sla} onChange={(e) => update('sla', e.target.value)} className="select">
                {SLAS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-medium">About</span>
              <textarea
                rows={4}
                value={form.about}
                onChange={(e) => update('about', e.target.value)}
                className="input"
                placeholder="Describe operations, tooling, regions, and focus."
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Price band</span>
              <select value={form.price} onChange={(e) => update('price', e.target.value)} className="select">
                {PRICES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Contact email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="input"
                placeholder="ops@company.com"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Contact phone</span>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input"
                placeholder="+256 700 000 000"
              />
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Regions</legend>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <label
                  key={r}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    form.regions.has(r)
                      ? 'bg-[#03cd8c]/10 border-[#03cd8c] text-[#03cd8c]'
                      : 'bg-[var(--app-surface)] border-[color:var(--app-border-strong)] text-[var(--app-fg-muted)]'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.regions.has(r)} onChange={() => toggleRegion(r)} />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4 grid sm:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-[var(--app-fg-muted)]">Response time</span>
              <select value={form.response} onChange={(e) => update('response', e.target.value)} className="select">
                {RESP.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-[var(--app-fg-muted)]">NOC hours</span>
              <select value={form.noc} onChange={(e) => update('noc', e.target.value)} className="select">
                {NOC.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Services</legend>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <label
                  key={s}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    form.services.has(s)
                      ? 'bg-[#03cd8c]/10 border-[#03cd8c] text-[#03cd8c]'
                      : 'bg-[var(--app-surface)] border-[color:var(--app-border-strong)] text-[var(--app-fg-muted)]'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.services.has(s)} onChange={() => toggleService(s)} />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Certifications</legend>
            <div className="flex flex-wrap gap-2">
              {CERTS.map((s) => (
                <label
                  key={s}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    form.certs.has(s)
                      ? 'bg-[#f77f00]/10 border-[#f77f00] text-[#f77f00]'
                      : 'bg-[var(--app-surface)] border-[color:var(--app-border-strong)] text-[var(--app-fg-muted)]'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.certs.has(s)} onChange={() => toggleCert(s)} />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Link to="/onboarding" className="btn secondary">
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
