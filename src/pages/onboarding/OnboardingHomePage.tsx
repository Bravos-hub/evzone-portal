import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
)
const User = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
    <path d="M3 22v-1a7 7 0 017-7h4a7 7 0 017 7v1" />
  </svg>
)
const Wrench = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M21 7a7 7 0 01-9.9 6.3L5 20l-2-2 5.7-6.1A7 7 0 1121 7z" />
  </svg>
)
const Site = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M3 11h18" />
    <path d="M5 5h14v14H5z" />
  </svg>
)
const Shield = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 3l7 4v6a7 7 0 11-14 0V7l7-4z" />
  </svg>
)
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
)

type RoleCardProps = {
  title: string
  desc: string
  href: string
  icon: ReactNode
}

export function OnboardingHomePage() {
  return (
    <div className="min-h-screen bg-[var(--app-muted)] text-[var(--app-fg)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only fixed top-3 left-3 z-50 bg-[var(--app-surface)] px-3 py-2 rounded-md shadow"
      >
        Skip to content
      </a>

      <header className="sticky top-[var(--page-header-offset)] z-20 backdrop-blur bg-[var(--app-surface)] border-b border-[color:var(--app-border)]">
        <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#03cd8c]">
              <Bolt />
            </span>
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--app-fg)]">Get started</h1>
          </div>
          <Link
            to="/auth/login"
            className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-[color:var(--app-border-strong)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-alt)]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main id="main" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[var(--app-fg-muted)]">
          Choose how you want to use EVzone. You can add more roles later in Settings.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RoleCard
            title="Station Owner"
            desc="Manage chargers, pricing, tariffs, and energy."
            href="/onboarding/choose-plan?role=owner"
            icon={<User />}
          />
          <RoleCard
            title="Operator"
            desc="Run day-to-day station operations and teams."
            href="/onboarding/choose-plan?role=operator"
            icon={<Shield />}
          />
          <RoleCard
            title="Technician"
            desc="Install, commission, and maintain equipment."
            href="/onboarding/choose-plan?role=technician"
            icon={<Wrench />}
          />
          <RoleCard
            title="Site Owner"
            desc="List parking sites to host EV chargers."
            href="/onboarding/choose-plan?role=site-owner"
            icon={<Site />}
          />
        </section>

        <section className="mt-8 rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-5 shadow-sm">
          <h2 className="font-semibold mb-2">What you will need</h2>
          <ul className="list-disc list-inside text-sm text-[var(--app-fg-muted)] space-y-1">
            <li>Basic company or personal info</li>
            <li>Contact details and operating region</li>
            <li>Optional registration numbers and tax IDs</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-[color:var(--app-border)] py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-[var(--app-fg-subtle)] flex items-center justify-between">
          <div>Copyright {new Date().getFullYear()} EVzone. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-[var(--app-fg)]">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-[var(--app-fg)]">
              Terms
            </Link>
            <Link to="/onboarding/admin/approvals" className="hover:text-[var(--app-fg)]">
              Admin approvals
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function RoleCard({ title, desc, href, icon }: RoleCardProps) {
  return (
    <Link
      to={href}
      className="rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)] p-5 hover:shadow-sm transition-shadow block"
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-[var(--app-fg)]">{title}</div>
        <span className="inline-flex items-center gap-1 text-[#03cd8c]">
          <ArrowRight />
        </span>
      </div>
      <div className="mt-2 text-sm text-[var(--app-fg-muted)] flex items-center gap-2">
        {icon} {desc}
      </div>
    </Link>
  )
}
