import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────────────────────────
   Onboarding — Role selection, plan selection, and onboarding flows
   Public route (no auth required for initial steps)
───────────────────────────────────────────────────────────────────────────── */

type OnboardingRole = 'owner' | 'operator' | 'technician' | 'site-owner'
type OnboardingStep = 'role' | 'plan' | 'info' | 'pending'

const ROLES = [
  { code: 'owner', label: 'Station Owner', desc: 'Manage chargers, pricing, tariffs and energy.', icon: 'user' },
  { code: 'operator', label: 'Operator', desc: 'Run day‑to‑day station operations and teams.', icon: 'shield' },
  { code: 'technician', label: 'Technician', desc: 'Install, commission, and maintain equipment.', icon: 'wrench' },
  { code: 'site-owner', label: 'Site Owner', desc: 'List parking sites to host EV chargers.', icon: 'building' },
] as const

const PLANS: Record<OnboardingRole, { code: string; name: string; price: string; features: string[] }[]> = {
  owner: [
    { code: 'owner-starter', name: 'Starter', price: 'Free', features: ['Up to 5 chargers', 'Basic reporting', 'Email support'] },
    { code: 'owner-growth', name: 'Growth', price: '$49/mo', features: ['Up to 25 chargers', 'Smart charging', 'Priority support'] },
    { code: 'owner-enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited chargers', 'SLA guarantees', 'Dedicated account manager'] },
  ],
  operator: [
    { code: 'op-basic', name: 'Basic', price: 'Free', features: ['Up to 3 stations', 'Basic dashboard'] },
    { code: 'op-plus', name: 'Plus', price: '$29/mo', features: ['Unlimited stations', 'Team management', 'Advanced analytics'] },
  ],
  technician: [
    { code: 'tech-free', name: 'Freelance', price: 'Free', features: ['Public marketplace', 'Job notifications'] },
    { code: 'tech-pro', name: 'Pro', price: '$19/mo', features: ['Priority job matching', 'Certification showcase'] },
  ],
  'site-owner': [
    { code: 'so-basic', name: 'Basic', price: 'Free', features: ['List up to 3 sites', 'Standard listing'] },
    { code: 'so-pro', name: 'Pro', price: '$39/mo', features: ['Unlimited sites', 'Featured listings', 'Revenue analytics'] },
  ],
}

export function Onboarding() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [step, setStep] = useState<OnboardingStep>('role')
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: 'Uganda',
    site: '',
  })
  const [ack, setAck] = useState('')

  // Initialize from query params
  useEffect(() => {
    const roleParam = searchParams.get('role') as OnboardingRole | null
    if (roleParam && ROLES.some(r => r.code === roleParam)) {
      setSelectedRole(roleParam)
      setStep('plan')
    }
    const stepParam = searchParams.get('step') as OnboardingStep | null
    if (stepParam) setStep(stepParam)
  }, [searchParams])

  const toast = (m: string) => { setAck(m); setTimeout(() => setAck(''), 3000) }

  const handleRoleSelect = (role: OnboardingRole) => {
    setSelectedRole(role)
    setStep('plan')
  }

  const handlePlanSelect = (planCode: string) => {
    setSelectedPlan(planCode)
    setStep('info')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast('Please fill in required fields.')
      return
    }
    // Mock submit
    localStorage.setItem('onb.role', selectedRole || '')
    localStorage.setItem('onb.plan', selectedPlan || '')
    localStorage.setItem('onb.status', 'Pending')
    setStep('pending')
  }

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-surface/80 border-b border-border">
        <div className="max-w-5xl mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            </span>
            <h1 className="text-lg font-bold">Get Started with EVzone</h1>
          </div>
          <a href="/login" className="px-3 py-2 rounded-lg border border-border hover:bg-muted">Sign in</a>
        </div>
      </header>

      {/* Toast */}
      {ack && (
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm">{ack}</div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Step: Role Selection */}
        {step === 'role' && (
          <>
            <p className="text-subtle mb-6">Choose how you want to use EVzone. You can add more roles later in Settings.</p>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ROLES.map(role => (
                <button
                  key={role.code}
                  onClick={() => handleRoleSelect(role.code as OnboardingRole)}
                  className="rounded-xl bg-surface border border-border p-5 text-left hover:shadow-md hover:border-accent transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">{role.label}</span>
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                  <p className="text-sm text-subtle">{role.desc}</p>
                </button>
              ))}
            </section>

            <section className="mt-8 rounded-xl bg-surface border border-border p-5 shadow-sm">
              <h2 className="font-semibold mb-2">What you'll need</h2>
              <ul className="list-disc list-inside text-sm text-subtle space-y-1">
                <li>Basic company or personal info</li>
                <li>Contact details and operating region</li>
                <li>(Optional) Registration numbers and tax IDs</li>
              </ul>
            </section>
          </>
        )}

        {/* Step: Plan Selection */}
        {step === 'plan' && selectedRole && (
          <>
            <button onClick={() => setStep('role')} className="text-sm text-accent hover:underline mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to role selection
            </button>
            <h2 className="text-xl font-semibold mb-2">Choose your plan</h2>
            <p className="text-subtle mb-6">
              You selected: <strong>{ROLES.find(r => r.code === selectedRole)?.label}</strong>
            </p>
            <section className="grid gap-4 md:grid-cols-3">
              {PLANS[selectedRole].map(plan => (
                <div
                  key={plan.code}
                  className="rounded-xl bg-surface border border-border p-5 flex flex-col"
                >
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="text-2xl font-bold text-accent my-2">{plan.price}</div>
                  <ul className="text-sm text-subtle flex-1 space-y-1 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelect(plan.code)}
                    className="w-full px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover"
                  >
                    Select {plan.name}
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {/* Step: Information Form */}
        {step === 'info' && selectedRole && selectedPlan && (
          <>
            <button onClick={() => setStep('plan')} className="text-sm text-accent hover:underline mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to plan selection
            </button>
            <h2 className="text-xl font-semibold mb-2">Complete your profile</h2>
            <p className="text-subtle mb-6">
              Role: <strong>{ROLES.find(r => r.code === selectedRole)?.label}</strong> •
              Plan: <strong>{selectedPlan}</strong>
            </p>
            <form onSubmit={handleSubmit} className="rounded-xl bg-surface border border-border p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Full Name *</span>
                  <input
                    value={form.name}
                    onChange={e => updateForm('name', e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Email *</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateForm('email', e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Phone</span>
                  <input
                    value={form.phone}
                    onChange={e => updateForm('phone', e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Company / Organization</span>
                  <input
                    value={form.company}
                    onChange={e => updateForm('company', e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Country</span>
                  <select
                    value={form.country}
                    onChange={e => updateForm('country', e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                  >
                    {['Uganda', 'Kenya', 'Rwanda', 'Tanzania', 'China', 'United States', 'United Kingdom'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                {selectedRole === 'site-owner' && (
                  <label className="grid gap-1">
                    <span className="text-sm font-medium">Site Name</span>
                    <input
                      value={form.site}
                      onChange={e => updateForm('site', e.target.value)}
                      className="rounded-lg border border-border px-3 py-2"
                      placeholder="e.g., City Mall Parking"
                    />
                  </label>
                )}
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover">
                  Submit Application
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step: Pending Approval */}
        {step === 'pending' && (
          <div className="rounded-xl bg-surface border border-border p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Application Submitted!</h2>
            <p className="text-subtle mb-4">
              Thank you for applying. Our team will review your application and get back to you within 24-48 hours.
            </p>
            <p className="text-sm text-subtle mb-6">
              You'll receive an email notification once your account is approved.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="/" className="px-4 py-2 rounded-lg border border-border hover:bg-muted">Back to Home</a>
              <a href="/login" className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover">Sign In</a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-sm text-subtle flex items-center justify-between">
          <div>© {new Date().getFullYear()} EVzone. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="/legal-privacy" className="hover:text-fg">Privacy</a>
            <a href="/legal-terms" className="hover:text-fg">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Onboarding

