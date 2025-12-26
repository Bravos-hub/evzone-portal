import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type OrgForm = {
  org: string
  reg: string
  address: string
  country: string
  vat: string
  website: string
  ocpp: string
  ocpi: string
  terms: boolean
}

type DocState = {
  cert: string
  id: string
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)

export function OnboardingOwnerOrgPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<OrgForm>({
    org: '',
    reg: '',
    address: '',
    country: 'Uganda',
    vat: '',
    website: '',
    ocpp: '1.6J',
    ocpi: '2.2.1',
    terms: false,
  })
  const [docs, setDocs] = useState<DocState>({ cert: '', id: '' })
  const [error, setError] = useState('')
  const [ack, setAck] = useState('')

  const update = <K extends keyof OrgForm>(key: K, value: OrgForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setAck('')
  }

  const setDoc = (key: keyof DocState, value: string) => {
    setDocs((prev) => ({ ...prev, [key]: value }))
    setAck('')
  }

  const validate = () => {
    if (form.org.trim().length < 3) return 'Please enter the organization name (3+ chars).'
    if (form.address.trim().length < 5) return 'Please enter a valid address.'
    if (!form.terms) return 'You must agree to the terms to continue.'
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
    navigate('/onboarding/owner/add-station')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Organization details</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 2 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={submit} noValidate>
          <div role="alert" aria-live="polite" className={`text-sm min-h-[1.25rem] ${error ? 'text-danger' : 'text-[#03cd8c]'}`}>
            {error || ack}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Organization name</span>
              <input
                value={form.org}
                onChange={(e) => update('org', e.target.value)}
                className="input"
                placeholder="EVZONE (Wuxi) Business Technology Co., Ltd."
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Registration no.</span>
              <input
                value={form.reg}
                onChange={(e) => update('reg', e.target.value)}
                className="input"
                placeholder="123456-A"
              />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-medium">Address</span>
              <input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="input"
                placeholder="265, No. 3 Gaolang East Road, Xinwu District, Wuxi City"
              />
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
              <span className="text-sm font-medium">VAT or tax ID</span>
              <input value={form.vat} onChange={(e) => update('vat', e.target.value)} className="input" placeholder="VAT-123456" />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-sm font-medium">Website (optional)</span>
              <input value={form.website} onChange={(e) => update('website', e.target.value)} className="input" placeholder="https://example.com" />
            </label>
          </div>

          <fieldset className="mt-4 grid sm:grid-cols-2 gap-4">
            <legend className="text-sm font-medium mb-2">Protocols</legend>
            <label className="grid gap-1">
              <span className="text-sm text-[var(--app-fg-muted)]">OCPP</span>
              <select value={form.ocpp} onChange={(e) => update('ocpp', e.target.value)} className="select">
                {['1.6J', '2.0.1'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-[var(--app-fg-muted)]">OCPI</span>
              <select value={form.ocpi} onChange={(e) => update('ocpi', e.target.value)} className="select">
                {['2.2.1', '2.2.0', '2.1.1'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">KYC documents (mock inputs)</legend>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <label className="grid gap-1">
                <span className="text-[var(--app-fg-muted)]">Certificate of incorporation</span>
                <input
                  type="file"
                  onChange={(e) => setDoc('cert', e.target.files?.[0]?.name ?? '')}
                  className="input file:mr-3 file:px-3 file:py-2 file:rounded-md file:border file:border-[color:var(--app-border-strong)]"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[var(--app-fg-muted)]">Director ID or passport</span>
                <input
                  type="file"
                  onChange={(e) => setDoc('id', e.target.files?.[0]?.name ?? '')}
                  className="input file:mr-3 file:px-3 file:py-2 file:rounded-md file:border file:border-[color:var(--app-border-strong)]"
                />
              </label>
            </div>
          </fieldset>

          <label className="mt-4 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="checkbox" />
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

          <div className="mt-6 flex items-center justify-end gap-2">
            <Link to="/onboarding/owner" className="btn secondary">
              Back
            </Link>
            <button type="submit" className="btn">
              Continue
            </button>
          </div>
        </form>
        {docs.cert || docs.id ? (
          <div className="mt-4 text-xs text-[var(--app-fg-muted)]">
            Selected files: {docs.cert || 'No certificate'} {docs.id ? `, ${docs.id}` : ''}
          </div>
        ) : null}
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
