import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)
const Pin = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const Users = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)
const Contract = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
)
const Dollar = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 1v22" />
    <path d="M17 5a4 4 0 00-4-2H9a3 3 0 000 6h6a3 3 0 010 6H9a4 4 0 01-4-2" />
  </svg>
)

export function OnboardingSiteOwnerTourPage() {
  const navigate = useNavigate()
  const [ack, setAck] = useState('')

  const start = () => {
    setAck('Tour started (demo). Redirecting to your workspace...')
    window.setTimeout(() => {
      navigate('/site-owner')
    }, 700)
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Site owner tour</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 3 of 3</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--app-fg-muted)]">
          Here is a quick tour of the Site Owner workspace. You can skip this now and revisit the tour later from Help.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <TourCard title="List a site" desc="Add location, capacity, amenities, and lease terms." icon={<Pin />} />
          <TourCard title="Applications" desc="Review operator or tenant applications and approve or decline." icon={<Users />} />
          <TourCard title="Contracts and ledgers" desc="Manage agreements, rent ledgers, invoices, and receipts." icon={<Contract />} />
          <TourCard title="Earnings and payouts" desc="Track balances, statements, and scheduled payouts." icon={<Dollar />} />
        </section>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/onboarding/site-owner/add-site" className="btn secondary">
              Back
            </Link>
            <div role="status" aria-live="polite" className="text-sm text-[#03cd8c] min-h-[1.25rem]">
              {ack}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/site-owner" className="btn secondary">
              Skip tour
            </Link>
            <button onClick={start} className="btn">
              Start tour
            </button>
          </div>
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

function TourCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-5 shadow-sm">
      <div className="text-lg font-semibold text-[var(--app-fg)] flex items-center gap-2">
        {icon} {title}
      </div>
      <p className="mt-1 text-sm text-[var(--app-fg-muted)]">{desc}</p>
    </div>
  )
}
