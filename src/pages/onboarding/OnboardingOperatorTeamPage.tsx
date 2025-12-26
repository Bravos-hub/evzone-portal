import { useState } from 'react'
import { Link } from 'react-router-dom'

type Invite = {
  email: string
  role: string
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)
const Trash = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
  </svg>
)

export function OnboardingOperatorTeamPage() {
  const [invite, setInvite] = useState<Invite>({ email: '', role: 'Dispatcher' })
  const [invites, setInvites] = useState<Invite[]>([{ email: 'noc@example.com', role: 'NOC' }])
  const [members, setMembers] = useState<Invite[]>([{ email: 'owner@company.com', role: 'Admin' }])
  const [ack, setAck] = useState('')
  const [error, setError] = useState('')

  const sendInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAck('')
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) {
      setError('Enter a valid email.')
      return
    }
    setInvites((list) => [{ email: invite.email, role: invite.role }, ...list])
    setInvite({ email: '', role: invite.role })
    setAck('Invite sent.')
  }

  const revoke = (index: number) => setInvites((list) => list.filter((_, idx) => idx !== index))
  const removeMember = (index: number) => setMembers((list) => list.filter((_, idx) => idx !== index))

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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Operator team</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 3 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Invite team member</h2>
          <form className="grid sm:grid-cols-3 gap-3" onSubmit={sendInvite} noValidate>
            <input
              type="email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
              placeholder="teammate@company.com"
              className="input sm:col-span-2"
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite({ ...invite, role: e.target.value })}
              className="select"
            >
              {['Admin', 'Dispatcher', 'NOC', 'Field Tech', 'Analyst'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <div role="alert" aria-live="polite" className={`text-sm min-h-[1.25rem] ${error ? 'text-danger' : 'text-[#03cd8c]'}`}>
              {error || ack}
            </div>
            <div className="sm:col-span-3 flex items-center justify-end">
              <button type="submit" className="btn">
                Send invite
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Pending invites</h2>
          {invites.length === 0 ? (
            <div className="text-sm text-[var(--app-fg-muted)]">No pending invites.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((row, idx) => (
                    <tr key={`${row.email}-${idx}`}>
                      <td>{row.email}</td>
                      <td>{row.role}</td>
                      <td className="text-right">
                        <button onClick={() => revoke(idx)} className="btn secondary">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Members</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((row, idx) => (
                  <tr key={`${row.email}-${idx}`}>
                    <td>{row.email}</td>
                    <td>{row.role}</td>
                    <td className="text-right">
                      <button onClick={() => removeMember(idx)} className="btn secondary">
                        <Trash /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Link to="/onboarding/operator/payment" className="btn secondary">
            Back
          </Link>
          <Link to="/onboarding/operator/tour" className="btn">
            Continue
          </Link>
        </div>
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
