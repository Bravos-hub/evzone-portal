import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type TechnicianForm = {
  name: string
  email: string
  phone: string
  city: string
  rate: string
  about: string
  skills: Set<string>
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)

const CITIES = ['Kampala', 'Nairobi', 'Wuxi', 'Lagos']
const RATES = ['<$50/hr', '$50-$100/hr', '>$100/hr']
const SKILLS = ['OCPP', 'DC Fast', 'ISO 15118', 'AC Type 2', 'Diagnostics', 'Firmware']

export function OnboardingTechnicianPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<TechnicianForm>({
    name: '',
    email: '',
    phone: '',
    city: 'Kampala',
    rate: '$50-$100/hr',
    about: '',
    skills: new Set(['OCPP', 'AC Type 2']),
  })
  const [error, setError] = useState('')

  const update = <K extends keyof TechnicianForm>(key: K, value: TechnicianForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const toggleSkill = (value: string) => {
    setForm((prev) => {
      const next = new Set(prev.skills)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, skills: next }
    })
    setError('')
  }

  const validate = () => {
    if (form.name.trim().length < 3) return 'Please enter your name or company (3+ chars).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.'
    if (form.skills.size === 0) return 'Select at least one skill.'
    return ''
  }

  const next = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    navigate('/onboarding/technician/certifications')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Technician onboarding</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 1 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={next} noValidate>
          <div role="alert" aria-live="polite" className="text-sm min-h-[1.25rem] text-danger">
            {error}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Name or company</span>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="RapidCharge Techs" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Email</span>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" placeholder="techs@company.com" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Phone</span>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" placeholder="+256 700 000 000" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">City or region</span>
              <select value={form.city} onChange={(e) => update('city', e.target.value)} className="select">
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Price band</span>
              <select value={form.rate} onChange={(e) => update('rate', e.target.value)} className="select">
                {RATES.map((c) => (
                  <option key={c}>{c}</option>
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
                placeholder="Briefly describe your expertise (installs, commissioning, diagnostics, OEM experience)."
              />
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Skills</legend>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((a) => (
                <label
                  key={a}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    form.skills.has(a)
                      ? 'bg-[#03cd8c]/10 border-[#03cd8c] text-[#03cd8c]'
                      : 'bg-[var(--app-surface)] border-[color:var(--app-border-strong)] text-[var(--app-fg-muted)]'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.skills.has(a)} onChange={() => toggleSkill(a)} />
                  {a}
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
