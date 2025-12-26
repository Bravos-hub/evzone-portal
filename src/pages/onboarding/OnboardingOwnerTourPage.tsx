import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)
const Chart = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M3 3v18h18" />
    <rect x="7" y="8" width="3" height="8" />
    <rect x="12" y="5" width="3" height="11" />
    <rect x="17" y="11" width="3" height="5" />
  </svg>
)
const Credit = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9h18" />
  </svg>
)
const Plug = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M7 7v6m10-6v6M7 10h10" />
    <path d="M6 13h12v2a6 6 0 11-12 0v-2z" />
  </svg>
)
const Home = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M3 12l9-9 9 9" />
    <path d="M9 21V9h6v12" />
  </svg>
)

export function OnboardingOwnerTourPage() {
  const navigate = useNavigate()
  const [ack, setAck] = useState('')

  const startTour = () => {
    setAck('Tour started (demo). Redirecting to your dashboard...')
    window.setTimeout(() => {
      navigate('/owner')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Owner tour</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 4 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--app-fg-muted)]">
          Here is a quick tour of the most important areas. You can skip this anytime; you will find the tour in Help later.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <TourCard title="Dashboard" desc="High-level KPIs and quick actions." icon={<Home />} />
          <TourCard title="CPMS" desc="Manage charge points, firmware, sessions, and pricing." icon={<Plug />} />
          <TourCard title="Analytics" desc="Energy, revenue, utilization, and CO2 impact." icon={<Chart />} />
          <TourCard title="Billing" desc="Tariffs, discounts, invoices, and settlements." icon={<Credit />} />
        </section>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/onboarding/owner/add-station" className="btn secondary">
              Back
            </Link>
            <div role="status" aria-live="polite" className="text-sm text-[#03cd8c] min-h-[1.25rem]">
              {ack}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/owner" className="btn secondary">
              Skip tour
            </Link>
            <button onClick={startTour} className="btn">
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
