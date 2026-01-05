import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLogin } from '@/core/api/hooks/useAuth'
import { getErrorMessage } from '@/core/api/errors'
import { EVChargingAnimation } from '@/ui/components/EVChargingAnimation'
import { DEMO_MODE } from '@/core/api/config'
import { DEMO_AUTH_PASSWORD, DEMO_AUTH_USERS } from '@/data/mockDb/demoAuth'
import { ROLE_LABELS } from '@/constants/roles'

export function LoginPage() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const loginMutation = useLogin()

  const demoAccount = DEMO_MODE ? DEMO_AUTH_USERS[0] : undefined
  
  const [email, setEmail] = useState(demoAccount?.email ?? '')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_AUTH_PASSWORD : '')
  const [usePhone, setUsePhone] = useState(false)
  const [error, setError] = useState('')
  const [selectedDemoId, setSelectedDemoId] = useState(demoAccount?.id ?? '')

  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Password is required')
      return
    }

    if (!usePhone && !email) {
      setError('Email is required')
      return
    }

    if (usePhone && !phone) {
      setError('Phone number is required')
      return
    }

    try {
      await loginMutation.mutateAsync({
        email: usePhone ? undefined : email,
        phone: usePhone ? phone : undefined,
        password,
      })
      nav(returnTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Animation */}
          <div className="order-2 md:order-1">
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-text mb-2">Electric Vehicle</h2>
              <p className="text-muted text-xs md:text-sm">
                Powering the future of sustainable transportation
              </p>
            </div>
            <div className="scale-75 md:scale-100 origin-center">
              <EVChargingAnimation />
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full max-w-md mx-auto order-1 md:order-2">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
                EVzone Portal
              </h1>
              <p className="text-muted text-sm">
                Sign in to your account to access the EVzone platform
              </p>
            </div>

            {/* Login Form Card */}
            <div className="bg-panel border border-border-light rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl border border-border-light">
              <button
                type="button"
                onClick={() => {
                  setUsePhone(false)
                  setError('')
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !usePhone
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsePhone(true)
                  setError('')
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  usePhone
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Input Fields */}
            <div className="space-y-5">
              {!usePhone ? (
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full bg-bg-secondary border border-border-light text-text rounded-xl py-3 px-4 text-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required={!usePhone}
                    disabled={loginMutation.isPending}
                    autoComplete="email"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-text-secondary mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full bg-bg-secondary border border-border-light text-text rounded-xl py-3 px-4 text-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    required={usePhone}
                    disabled={loginMutation.isPending}
                    autoComplete="tel"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full bg-bg-secondary border border-border-light text-text rounded-xl py-3 px-4 text-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loginMutation.isPending}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {DEMO_MODE && (
              <div className="rounded-xl border border-border-light bg-bg-secondary/60 px-4 py-3 text-xs text-muted space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-text">Demo mode enabled</div>
                  <div>Password: "{DEMO_AUTH_PASSWORD}"</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_AUTH_USERS.map((account) => {
                    const isActive = selectedDemoId === account.id
                    return (
                      <button
                        key={account.id}
                        type="button"
                        aria-pressed={isActive}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-accent text-white border-accent'
                            : 'bg-panel text-text-secondary border-border-light hover:text-text hover:border-border'
                        }`}
                        onClick={() => {
                          setSelectedDemoId(account.id)
                          setEmail(account.email ?? '')
                          setPhone(account.phone ?? '')
                          setUsePhone(!account.email && !!account.phone)
                          setPassword(DEMO_AUTH_PASSWORD)
                          setError('')
                        }}
                      >
                        {ROLE_LABELS[account.role] ?? account.role}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-accent border border-accent text-white py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:bg-accent-hover hover:border-accent-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-panel-2 border border-border text-text rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-panel hover:border-border-light hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => nav('/', { replace: true })}
                disabled={loginMutation.isPending}
              >
                Cancel
              </button>
            </div>
          </form>
            </div>

            {/* Footer Text */}
            <div className="mt-6 text-center">
              <p className="text-muted text-xs">
                Don't have an account?{' '}
                <span className="text-text-secondary">Contact your administrator</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
