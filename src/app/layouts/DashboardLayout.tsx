import type { PropsWithChildren } from 'react'
import { Sidebar } from '@/ui/components/Sidebar'
import { Header } from '@/ui/components/Header'
import { useAuthStore } from '@/core/auth/authStore'

/**
 * DashboardLayout - Unified layout for all dashboard pages
 * 
 * The Sidebar now automatically shows menu items based on the user's role.
 * No need to pass role-specific items - it's handled internally.
 */
export function DashboardLayout({ children, pageTitle }: PropsWithChildren<{ pageTitle: string }>) {
  const { user } = useAuthStore()
  const showHelpFab = user
    ? [
      'EVZONE_ADMIN',
      'EVZONE_OPERATOR',
      'SITE_OWNER',
      'OWNER',
      'MANAGER',
      'TECHNICIAN_ORG',
      'TECHNICIAN_PUBLIC',
      'STATION_ADMIN',
      'ATTENDANT',
    ].includes(user.role)
    : false

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-bg">
        <Header title={pageTitle} />
        <main className="flex-1 p-7 overflow-y-auto bg-bg">{children}</main>
      </div>
      {showHelpFab && (
        <a
          href="/help"
          className="fixed bottom-6 right-6 z-[120] inline-flex items-center gap-2 px-5 py-3 rounded-full shadow-lg bg-accent text-white hover:bg-accent-hover hover:-translate-y-[1px] transition-all duration-200 font-bold text-[13px] tracking-wide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          Help
        </a>
      )}
    </div>
  )
}

