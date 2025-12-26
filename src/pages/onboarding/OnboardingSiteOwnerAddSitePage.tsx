import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type SiteForm = {
  name: string
  address: string
  city: string
  power: string
  bays: string
  lease: string
  footfall: string
  amenities: Set<string>
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)

const AMENITIES = ['Security', 'Lighting', 'Coffee', 'Restrooms', 'Shelter']

export function OnboardingSiteOwnerAddSitePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<SiteForm>({
    name: '',
    address: '',
    city: 'Kampala',
    power: '150',
    bays: '10',
    lease: 'Revenue share',
    footfall: 'Medium',
    amenities: new Set(['Security', 'Lighting']),
  })
  const [error, setError] = useState('')
  const [ack, setAck] = useState('')

  const update = <K extends keyof SiteForm>(key: K, value: SiteForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setAck('')
  }

  const toggleAmenity = (value: string) => {
    setForm((prev) => {
      const next = new Set(prev.amenities)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, amenities: next }
    })
    setError('')
    setAck('')
  }

  const validate = () => {
    if (form.name.trim().length < 3) return 'Please enter a site name (3+ chars).'
    if (form.address.trim().length < 5) return 'Please enter a valid address.'
    if (Number.isNaN(Number(form.power)) || Number(form.power) <= 0) return 'Power capacity must be a positive number.'
    if (Number.isNaN(Number(form.bays)) || Number(form.bays) <= 0) return 'Parking bays must be a positive number.'
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
    navigate('/onboarding/site-owner/tour')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Add your first site</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 2 of 3</div>
        </div>
      </header>

      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={submit} noValidate>
          <div role="alert" aria-live="polite" className={`text-sm min-h-[1.25rem] ${error ? 'text-danger' : 'text-[#03cd8c]'}`}>
            {error || ack}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Site name</span>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="Business Park A" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">City</span>
              <input value={form.city} onChange={(e) => update('city', e.target.value)} className="input" placeholder="Kampala" />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-medium">Address</span>
              <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input" placeholder="265, No. 3 Gaolang East Road, Xinwu District, Wuxi City" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Power capacity (kW)</span>
              <input value={form.power} onChange={(e) => update('power', e.target.value)} className="input" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Parking bays</span>
              <input value={form.bays} onChange={(e) => update('bays', e.target.value)} className="input" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Lease type</span>
              <select value={form.lease} onChange={(e) => update('lease', e.target.value)} className="select">
                {['Revenue share', 'Fixed rent'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Footfall</span>
              <select value={form.footfall} onChange={(e) => update('footfall', e.target.value)} className="select">
                {['Low', 'Medium', 'High', 'Very high'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Amenities</legend>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <label
                  key={a}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    form.amenities.has(a)
                      ? 'bg-[#03cd8c]/10 border-[#03cd8c] text-[#03cd8c]'
                      : 'bg-[var(--app-surface)] border-[color:var(--app-border-strong)] text-[var(--app-fg-muted)]'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.amenities.has(a)} onChange={() => toggleAmenity(a)} />
                  {a}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex items-center justify-between">
            <Link to="/onboarding/site-owner" className="btn secondary">
              Back
            </Link>
            <button type="submit" className="btn">
              Continue
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
