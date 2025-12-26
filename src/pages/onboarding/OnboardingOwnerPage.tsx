import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type OwnerForm = {
  name: string
  email: string
  phone: string
  country: string
  city: string
  ocpp: boolean
  ocpi: boolean
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
)

export function OnboardingOwnerPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<OwnerForm>({
    name: '',
    email: '',
    phone: '',
    country: 'Uganda',
    city: 'Kampala',
    ocpp: true,
    ocpi: true,
  })
  const [error, setError] = useState('')

  const update = <K extends keyof OwnerForm>(key: K, value: OwnerForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const validate = () => {
    if (form.name.trim().length < 3) return 'Please enter your full name (3+ chars).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.'
    if (form.phone.trim().length < 7) return 'Please enter a valid phone number.'
    return ''
  }

  const next = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    navigate('/onboarding/owner/org')
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
        <div className="max-w-3xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#03cd8c]">
              <Bolt />
            </span>
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Owner onboarding</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 1 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={next} noValidate>
          <div role="alert" aria-live="polite" className="text-sm min-h-[1.25rem] text-danger">
            {error}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Full name</span>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="Jane Doe" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Email</span>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" placeholder="owner@example.com" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Phone</span>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" placeholder="+256 700 000 000" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Country</span>
              <select value={form.country} onChange={(e) => update('country', e.target.value)} className="select">
                {['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'China'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">City</span>
              <input value={form.city} onChange={(e) => update('city', e.target.value)} className="input" placeholder="Kampala" />
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Preferred protocols</legend>
            <label className="inline-flex items-center gap-2 text-sm mr-4">
              <input type="checkbox" checked={form.ocpp} onChange={(e) => update('ocpp', e.target.checked)} className="checkbox" />
              OCPP 1.6J / 2.0.1
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.ocpi} onChange={(e) => update('ocpi', e.target.checked)} className="checkbox" />
              OCPI 2.2.x
            </label>
          </fieldset>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Link to="/onboarding" className="btn secondary">
              Back
            </Link>
            <button type="submit" className="btn">
              Continue <span className="inline-flex ml-1 align-middle"><ArrowRight /></span>
            </button>
          </div>
        </form>
      </main>

      <footer className="border-t border-[color:var(--app-border)] py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-[var(--app-fg-subtle)] flex items-center justify-between">
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
