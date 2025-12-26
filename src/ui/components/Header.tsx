import { useMemo } from 'react'
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
  const { user, logout } = useAuthStore()
  const { scope, setScope } = useScopeStore()

  const showOrg = useMemo(() => user?.role === 'EVZONE_ADMIN' || user?.role === 'EVZONE_OPERATOR' || user?.role === 'OWNER', [user?.role])
  const showStation = useMemo(() => user?.role !== 'SITE_OWNER', [user?.role])
  const showSite = useMemo(() => user?.role === 'SITE_OWNER', [user?.role])

  const quickActions = useMemo(() => {
    switch (user?.role) {
      case 'EVZONE_ADMIN':
        return ['Create broadcast', 'Open incident', 'Export', 'Impersonate']
      case 'EVZONE_OPERATOR':
        return ['Create station', 'Approve user', 'Dispatch job', 'Send notice']
      case 'SITE_OWNER':
        return ['New site draft', 'Export', 'Message tenant']
      case 'OWNER':
        return ['Add station', 'Add asset', 'Create tariff', 'Open incident']
      case 'STATION_ADMIN':
        return ['Open incident', 'Start shift', 'Create request']
      case 'MANAGER':
        return ['Assign attendant', 'Open incident', 'Request technician']
      case 'ATTENDANT':
        return ['New session', 'Report incident', 'Call technician']
      case 'TECHNICIAN_ORG':
        return ['Start job', 'Upload photos', 'Close job']
      case 'TECHNICIAN_PUBLIC':
        return ['Accept job', 'Navigate', 'Escalate']
      default:
        return []
    }
  }, [user?.role])

  const profileInitial = user?.name?.[0]?.toUpperCase?.() ?? 'U'

  return (
    <header className="sticky top-0 z-[90] flex items-center gap-3 px-6 border-b border-border-light bg-bg-secondary shadow-[0_1px_3px_rgba(0,0,0,.2)] min-h-[72px] flex-nowrap overflow-x-auto">
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

      <div className="inline-flex gap-2 items-center flex-shrink-0">
        {quickActions.map((action) => (
          <button
            key={action}
            className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
            type="button"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="inline-flex items-center gap-2 flex-shrink-0">
        <button
          className="bg-panel border border-border-light text-text py-2 px-[10px] rounded-lg cursor-pointer text-xs font-semibold whitespace-nowrap hover:border-accent hover:text-text"
          type="button"
        >
          Notifications
        </button>
        <button
          className="bg-panel border border-border-light text-text py-2 px-[10px] rounded-lg cursor-pointer text-xs font-semibold whitespace-nowrap hover:border-accent hover:text-text"
          type="button"
        >
          Help
        </button>
        <div className="w-[34px] h-[34px] rounded-full bg-accent text-white grid place-items-center font-bold tracking-[0.3px] flex-shrink-0">
          {profileInitial}
        </div>
        <button
          className="bg-accent border border-accent text-white py-[10px] px-[18px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,.2)] whitespace-nowrap hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_8px_rgba(59,130,246,.3)] hover:-translate-y-[1px] active:translate-y-0"
          onClick={() => {
            logout()
            nav('/auth/login')
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

