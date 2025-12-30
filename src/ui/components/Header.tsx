import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/core/auth/authStore'
import { InviteUserModal } from '@/modals/InviteUserModal'
import { ROLE_LABELS } from '@/constants/roles'
import { PATHS } from '@/app/router/paths'
import { useTheme } from '@/ui/theme'

export function Header({ title }: { title?: string }) {
  const nav = useNavigate()
  const { user, impersonator, impersonationReturnTo, logout, stopImpersonation } = useAuthStore()
  const { mode, setMode, effectiveTheme } = useTheme()
  const [createOpen, setCreateOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const createRef = useRef<HTMLDivElement | null>(null)
  const createBtnRef = useRef<HTMLButtonElement | null>(null)
  const createMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!createOpen) return
      const el = createRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setCreateOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [createOpen])

  useEffect(() => {
    if (!createOpen) return
    requestAnimationFrame(() => {
      const first = createMenuRef.current?.querySelector<HTMLButtonElement>('button[role="menuitem"]')
      first?.focus()
    })
  }, [createOpen])

  const createItems = useMemo(() => {
    const fallback = '/stations'
    const addStation = '/add-charger'
    const addChargePoint = '/add-charger'
    const addSwapStation = '/add-charger'
    const requestTechnician =
      user?.role === 'EVZONE_ADMIN'
        ? '/dispatches'
        : user?.role === 'EVZONE_OPERATOR'
          ? '/operator-jobs'
          : '/dispatches'
    const listParkingSite = user?.role === 'SITE_OWNER' ? '/sites' : fallback

    return [
      { label: 'Add Station', to: addStation, action: 'navigate' },
      { label: 'Add Charge Point', to: addChargePoint, action: 'navigate' },
      { label: 'Add Swap Station', to: addSwapStation, action: 'navigate' },
      { label: 'Invite User', to: '', action: 'modal' },
      { label: 'Request Technician', to: requestTechnician, action: 'navigate' },
      { label: 'List Parking Site', to: listParkingSite, action: 'navigate' },
    ]
  }, [user?.role])

  const profileInitial = user?.name?.[0]?.toUpperCase?.() ?? 'U'

  return (
    <header className="sticky top-0 z-[90] flex items-center justify-between gap-6 px-8 border-b border-white/5 bg-bg-secondary min-h-[72px] flex-nowrap shadow-soft">
      {/* Left side: Search */}
      <div className="flex items-center gap-3 flex-nowrap min-w-0 flex-1">
        <div className="relative w-[400px] max-w-[60vw]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            className="w-full bg-panel/30 border border-border-light text-text rounded-xl py-2.5 pl-11 pr-14 text-[14px] transition-all duration-200 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light placeholder:text-muted"
            placeholder="Search (station/user/ticket/job)…"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded border border-white/10 bg-bg-secondary/80 text-[10px] font-bold text-muted/80 tracking-tighter">
            <span className="text-[12px]">⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="inline-flex items-center gap-3 flex-shrink-0">
        {impersonator ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent/80">Impersonating</span>
            <span className="text-xs font-semibold text-white">{user?.name}</span>
            <button
              className="ml-1 p-1 hover:bg-white/10 rounded transition-colors"
              type="button"
              onClick={() => {
                const back = impersonationReturnTo || PATHS.ADMIN.USERS
                stopImpersonation()
                nav(back)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="relative flex-shrink-0" ref={createRef}>
          <button
            ref={createBtnRef}
            className="bg-accent border border-accent text-white py-2 px-4 rounded-xl cursor-pointer text-[13px] font-bold transition-all duration-200 whitespace-nowrap hover:bg-accent-hover hover:border-accent-hover hover:shadow-lg inline-flex items-center gap-2"
            type="button"
            aria-haspopup="menu"
            aria-expanded={createOpen}
            onClick={() => setCreateOpen((v) => !v)}
          >
            <span>Create</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={createOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {createOpen ? (
            <div
              ref={createMenuRef}
              className="absolute right-0 mt-2 w-[240px] rounded-2xl border border-white/5 bg-bg-secondary shadow-lg p-2 z-[120]"
              role="menu"
            >
              {createItems.map((it) => (
                <button
                  key={it.label}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-text-secondary hover:text-text font-medium"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setCreateOpen(false)
                    if (it.action === 'modal') {
                      setInviteModalOpen(true)
                    } else {
                      nav(it.to)
                    }
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="truncate">{it.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          className="text-muted h-10 w-10 rounded-xl cursor-pointer inline-flex items-center justify-center hover:bg-white/5 hover:text-accent transition-all duration-200"
          type="button"
          onClick={() => {
            const next = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark'
            setMode(next)
          }}
          title={`Theme: ${mode} (Effective: ${effectiveTheme})`}
        >
          {effectiveTheme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          className="text-muted h-10 w-10 rounded-xl cursor-pointer inline-flex items-center justify-center hover:bg-white/5 hover:text-accent transition-all duration-200"
          type="button"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => nav(PATHS.NOTIFICATIONS)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" /><path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>

        <button
          className="text-muted h-10 w-10 rounded-xl cursor-pointer inline-flex items-center justify-center hover:bg-white/5 hover:text-accent transition-all duration-200"
          type="button"
          aria-label="Help"
          title="Help"
          onClick={() => nav(PATHS.HELP)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button
          className="h-10 w-10 rounded-full bg-accent text-white inline-flex items-center justify-center font-bold tracking-[0.3px] flex-shrink-0 shadow-lg hover:bg-accent-hover transition-all duration-200 overflow-hidden"
          type="button"
          aria-label="Profile"
          title={user?.name ? `Profile: ${user.name}` : 'Profile'}
        >
          <span className="text-sm font-bold">{profileInitial}</span>
        </button>

        <button
          className="bg-panel border border-border text-text h-10 w-10 rounded-xl cursor-pointer inline-flex items-center justify-center transition-all duration-200 hover:bg-panel-2 hover:border-accent hover:text-accent"
          onClick={() => {
            logout()
            nav(PATHS.AUTH.LOGIN)
          }}
          aria-label="Logout"
          title="Logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={(email, role) => {
          console.log('Inviting user:', { email, role })
          alert(`Invitation sent to ${email} with role ${ROLE_LABELS[role]} (demo)`)
        }}
      />
    </header >
  )
}
