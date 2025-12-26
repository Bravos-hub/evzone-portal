import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)
const Siren = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="6" y="10" width="12" height="8" rx="2" />
    <path d="M12 10V6" />
    <path d="M7 6l2-2M17 6l-2-2M4 10h16" />
  </svg>
)
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M9 3l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" />
    <path d="M9 3v14M15 5v14" />
  </svg>
)
const Report = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 12h8M8 8h8M8 16h5" />
  </svg>
)
const Headset = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M4 14v-2a8 8 0 1116 0v2" />
    <path d="M4 14a4 4 0 004 4h1v-6H8a4 4 0 00-4 4zm16 0a4 4 0 00-4 4h-1v-6h1a4 4 0 014 4z" />
  </svg>
)

export function OnboardingOperatorTourPage() {
  const navigate = useNavigate()
  const [ack, setAck] = useState('')

  const start = () => {
    setAck('Tour started (demo). Redirecting to your workspace...')
    window.setTimeout(() => {
      navigate('/operator')
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
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Operator tour</h1>
          </div>
          <div className="text-xs text-[var(--app-fg-subtle)]">Step 4 of 4</div>
        </div>
      </header>

      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--app-fg-muted)]">
          Take a quick tour of key operator tools. You can skip this now and revisit the tour in Help.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <TourCard title="Dispatch" desc="Assign jobs, manage routes, and track SLAs." icon={<Headset />} />
          <TourCard title="Live stations" desc="Monitor status, start or stop, and run diagnostics." icon={<MapIcon />} />
          <TourCard title="Alerts" desc="NOC alerts, incidents, and escalations." icon={<Siren />} />
          <TourCard title="Reports" desc="Operational metrics and performance trends." icon={<Report />} />
        </section>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/onboarding/operator/team" className="btn secondary">
              Back
            </Link>
            <div role="status" aria-live="polite" className="text-sm text-[#03cd8c] min-h-[1.25rem]">
              {ack}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/operator" className="btn secondary">
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
