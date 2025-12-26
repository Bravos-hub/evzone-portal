import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type CertificationForm = {
  certs: Set<string>
  license: string
  expiry: string
  agree: boolean
  uploads: {
    id: string
    cert: string
  }
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)

const CERTS = ['OCPP', 'ISO 15118', 'Electrical License', 'OEM-A', 'OEM-B']

export function OnboardingTechnicianCertificationsPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CertificationForm>({
    certs: new Set(['OCPP']),
    license: '',
    expiry: '',
    agree: true,
    uploads: { id: '', cert: '' },
  })
  const [error, setError] = useState('')

  const toggleCert = (value: string) => {
    setForm((prev) => {
      const next = new Set(prev.certs)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, certs: next }
    })
    setError('')
  }

  const update = <K extends keyof CertificationForm>(key: K, value: CertificationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const updateUpload = (key: 'id' | 'cert', value: string) => {
    setForm((prev) => ({ ...prev, uploads: { ...prev.uploads, [key]: value } }))
    setError('')
  }

  const validate = () => {
    if (form.certs.size === 0) return 'Select at least one certification.'
    if (!form.agree) return 'You must agree to the terms to continue.'
    return ''
  }

  const next = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    navigate('/onboarding/technician/availability')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Technician certifications</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 2 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm" onSubmit={next} noValidate>
          <div role="alert" aria-live="polite" className="text-sm min-h-[1.25rem] text-danger">
            {error}
          </div>

          <fieldset>
            <legend className="text-sm font-medium mb-2">Select certifications</legend>
            <div className="flex flex-wrap gap-2">
              {CERTS.map((c) => (
                <label
                  key={c}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    form.certs.has(c)
                      ? 'bg-[#f77f00]/10 border-[#f77f00] text-[#f77f00]'
                      : 'bg-[var(--app-surface)] border-[color:var(--app-border-strong)] text-[var(--app-fg-muted)]'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.certs.has(c)} onChange={() => toggleCert(c)} />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">License no. (if applicable)</span>
              <input value={form.license} onChange={(e) => update('license', e.target.value)} className="input" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Expiry</span>
              <input type="date" value={form.expiry} onChange={(e) => update('expiry', e.target.value)} className="input" />
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium mb-2">Upload documents (mock)</legend>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <label className="grid gap-1">
                <span className="text-[var(--app-fg-muted)]">ID or passport</span>
                <input
                  type="file"
                  onChange={(e) => updateUpload('id', e.target.files?.[0]?.name ?? '')}
                  className="input file:mr-3 file:px-3 file:py-2 file:rounded-md file:border file:border-[color:var(--app-border-strong)]"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[var(--app-fg-muted)]">Certification proof</span>
                <input
                  type="file"
                  onChange={(e) => updateUpload('cert', e.target.files?.[0]?.name ?? '')}
                  className="input file:mr-3 file:px-3 file:py-2 file:rounded-md file:border file:border-[color:var(--app-border-strong)]"
                />
              </label>
            </div>
          </fieldset>

          <label className="mt-4 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} className="checkbox" />
            <span>
              I confirm these details are accurate and agree to the{' '}
              <Link className="underline" to="/legal/terms">
                Terms
              </Link>
              .
            </span>
          </label>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Link to="/onboarding/technician" className="btn secondary">
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
