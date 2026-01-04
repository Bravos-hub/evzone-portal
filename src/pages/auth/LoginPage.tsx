import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLogin } from '@/core/api/hooks/useAuth'
import { getErrorMessage } from '@/core/api/errors'

export function LoginPage() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const loginMutation = useLogin()
  
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [usePhone, setUsePhone] = useState(false)
  const [error, setError] = useState('')

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
    <div className="max-w-[760px] mx-auto my-[50px] p-[18px]">
      <h1 className="m-0 text-[22px]">EVzone Portal — Login</h1>
      <p className="text-muted mt-1.5">
        Sign in to your account to access the EVzone platform.
      </p>

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)] mt-4">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setUsePhone(false)}
              className={`px-3 py-1 rounded text-xs ${!usePhone ? 'bg-accent text-white' : 'bg-panel border border-border'}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setUsePhone(true)}
              className={`px-3 py-1 rounded text-xs ${usePhone ? 'bg-accent text-white' : 'bg-panel border border-border'}`}
            >
              Phone
            </button>
          </div>

          {!usePhone ? (
            <label>
              <div className="text-muted text-xs mb-1.5">Email</div>
              <input
                type="email"
                className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required={!usePhone}
                disabled={loginMutation.isPending}
              />
            </label>
          ) : (
            <label>
              <div className="text-muted text-xs mb-1.5">Phone Number</div>
              <input
                type="tel"
                className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-full"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required={usePhone}
                disabled={loginMutation.isPending}
              />
            </label>
          )}

          <label>
            <div className="text-muted text-xs mb-1.5">Password</div>
            <input
              type="password"
              className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loginMutation.isPending}
            />
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-[10px] flex-wrap">
            <button
              type="submit"
              className="bg-accent border border-accent text-white py-[10px] px-[18px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,.2)] whitespace-nowrap hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_8px_rgba(59,130,246,.3)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
              onClick={() => nav('/', { replace: true })}
              disabled={loginMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-3.5 text-muted text-xs">
        Don't have an account? Contact your administrator.
      </div>
    </div>
  )
}

