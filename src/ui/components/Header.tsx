import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/core/auth/authStore'
import { useScopeStore } from '@/core/scope/scopeStore'
import type { RegionId } from '@/core/auth/types'

const regions: Array<{ id: RegionId | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const dateRanges = [
  { id: 'TODAY', label: 'Today' },
  { id: '7D', label: 'Last 7d' },
  { id: '30D', label: 'Last 30d' },
  { id: 'CUSTOM', label: 'Custom' },
]

const orgs = ['ALL', 'ORG_DEMO', 'ORG_ALPHA', 'ORG_BETA']
const stations = ['ALL', 'STATION_001', 'STATION_002', 'STATION_003']
const sites = ['ALL', 'SITE_001', 'SITE_002', 'SITE_003']

export function Header({ title }: { title?: string }) {
  const nav = useNavigate()
  const { user, actingAs, actAsReturnTo, logout, stopActAs } = useAuthStore()
  const { scope, setScope } = useScopeStore()
  const [createOpen, setCreateOpen] = useState(false)
  const createRef = useRef<HTMLDivElement | null>(null)
  const createBtnRef = useRef<HTMLButtonElement | null>(null)
  const createMenuRef = useRef<HTMLDivElement | null>(null)

  const showOrg = useMemo(() => user?.role === 'EVZONE_ADMIN' || user?.role === 'EVZONE_OPERATOR' || user?.role === 'OWNER', [user?.role])
  const showStation = useMemo(() => user?.role !== 'SITE_OWNER', [user?.role])
  const showSite = useMemo(() => user?.role === 'SITE_OWNER', [user?.role])

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
    const fallback = '/admin/stations'
    const addChargePoint = user?.role === 'OWNER' ? '/owner/charge/connectors' : fallback
    const addSwapStation = user?.role === 'OWNER' ? '/owner/swap/stations' : fallback
    const inviteOperator = '/admin/users'
    const requestTechnician =
      user?.role === 'EVZONE_ADMIN'
        ? '/admin/dispatches'
        : user?.role === 'EVZONE_OPERATOR'
          ? '/operator/stations'
          : '/admin/dispatches'
    const listParkingSite = user?.role === 'SITE_OWNER' ? '/site-owner/sites' : fallback

    return [
      { label: 'Add Charge Point', to: addChargePoint },
      { label: 'Add Swap Station', to: addSwapStation },
      { label: 'Invite Operator', to: inviteOperator },
      { label: 'Request Technician', to: requestTechnician },
      { label: 'List Parking Site', to: listParkingSite },
    ]
  }, [user?.role])

  const profileInitial = user?.name?.[0]?.toUpperCase?.() ?? 'U'

  return (
    <header className="sticky top-0 z-[90] flex items-center gap-3 px-6 border-b border-border-light bg-bg-secondary shadow-[0_1px_3px_rgba(0,0,0,.2)] min-h-[72px] flex-nowrap">
      <div className="flex items-center gap-3 flex-nowrap min-w-0 flex-1 overflow-x-auto scrollbar-hide">
        <input
          className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-[320px] max-w-[60vw] min-w-[200px] flex-shrink"
          placeholder="Search (station/user/ticket/job)…"
        />

        <select
          className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
          value={scope.region}
          onChange={(e) => setScope({ region: e.target.value as any })}
        >
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>

        {showOrg ? (
          <select
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
            value={scope.orgId}
            onChange={(e) => setScope({ orgId: e.target.value })}
          >
            {orgs.map((o) => (
              <option key={o} value={o}>{o === 'ALL' ? 'All Orgs' : o}</option>
            ))}
          </select>
        ) : null}

        {showSite ? (
          <select
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
            value={scope.siteId}
            onChange={(e) => setScope({ siteId: e.target.value })}
          >
            {sites.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Sites' : s}</option>
            ))}
          </select>
        ) : null}

        {showStation ? (
          <select
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
            value={scope.stationId}
            onChange={(e) => setScope({ stationId: e.target.value })}
          >
            {stations.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Stations' : s}</option>
            ))}
          </select>
        ) : null}

        <select
          className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
          value={scope.dateRange}
          onChange={(e) => setScope({ dateRange: e.target.value as any })}
        >
          {dateRanges.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="inline-flex items-center gap-2 flex-shrink-0">
        {actingAs ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-[rgba(59,130,246,.25)] bg-[rgba(59,130,246,.12)] px-3 py-2">
            <span className="text-xs font-semibold text-[#93c5fd]">Acting as</span>
            <span className="text-xs text-text">{actingAs.name}</span>
            <button
              className="bg-panel border border-border-light text-text h-8 w-8 rounded-lg cursor-pointer inline-flex items-center justify-center hover:border-accent hover:text-text transition-colors"
              type="button"
              aria-label="Stop acting as"
              title="Stop acting as"
              onClick={() => {
                const back = actAsReturnTo || '/admin/users'
                stopActAs()
                nav(back)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="relative flex-shrink-0" ref={createRef}>
          <button
            ref={createBtnRef}
            className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)] inline-flex items-center gap-2"
            type="button"
            aria-haspopup="menu"
            aria-expanded={createOpen}
            onClick={() => setCreateOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setCreateOpen(false)
              if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setCreateOpen(true)
              }
            }}
          >
            <span>Create</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={createOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {createOpen ? (
            <div
              ref={createMenuRef}
              className="absolute right-0 mt-2 w-[240px] rounded-xl border border-border-light bg-bg-secondary shadow-[0_16px_50px_rgba(0,0,0,.55)] p-2 z-[120]"
              role="menu"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setCreateOpen(false)
                  requestAnimationFrame(() => createBtnRef.current?.focus())
                }
              }}
            >
              {createItems.map((it) => (
                <button
                  key={it.label}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-text"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setCreateOpen(false)
                    nav(it.to)
                  }}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="truncate">{it.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          className="bg-panel border border-border-light text-text h-10 w-10 rounded-lg cursor-pointer inline-flex items-center justify-center hover:border-accent hover:text-text transition-colors"
          type="button"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 01-3.46 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="bg-panel border border-border-light text-text h-10 w-10 rounded-lg cursor-pointer inline-flex items-center justify-center hover:border-accent hover:text-text transition-colors"
          type="button"
          aria-label="Help"
          title="Help"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 18h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.09 9a3 3 0 115.82 1c0 2-3 2-3 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="h-10 w-10 rounded-full bg-accent text-white inline-flex items-center justify-center font-bold tracking-[0.3px] flex-shrink-0 shadow-[0_2px_6px_rgba(59,130,246,.35)] hover:bg-accent-hover transition-colors"
          type="button"
          aria-label="Profile"
          title={user?.name ? `Profile: ${user.name}` : 'Profile'}
        >
          <span className="text-sm leading-none">{profileInitial}</span>
        </button>
        <button
          className="bg-accent border border-accent text-white h-10 w-10 rounded-lg cursor-pointer inline-flex items-center justify-center transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,.2)] hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_8px_rgba(59,130,246,.3)] hover:-translate-y-[1px] active:translate-y-0"
          onClick={() => {
            logout()
            nav('/auth/login')
          }}
          aria-label="Logout"
          title="Logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17l5-5-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}

