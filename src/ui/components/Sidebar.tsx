import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '@/core/auth/authStore'
import { getMenuItemsForRole, type MenuItem } from '@/constants/menuItems'
import { ROLE_LABELS } from '@/constants/roles'
import { PATHS } from '@/app/router/paths'

type SidebarProps = {
  /** Optional: Override menu items (for backward compatibility) */
  items?: MenuItem[]
}

/**
 * Dynamic Sidebar Component
 * 
 * Automatically shows menu items based on the current user's role.
 * Uses the centralized menu configuration from constants/menuItems.ts
 */
export function Sidebar({ items: overrideItems }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const nav = useNavigate()

  // Use override items if provided, otherwise filter by role
  const menuItems = overrideItems ?? getMenuItemsForRole(user?.role)

  return (
    <aside className="w-[280px] flex-shrink-0 border-r border-white/5 p-0 bg-bg-secondary flex flex-col overflow-hidden z-[100] shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--app-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EV<span className="text-accent">zone</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 p-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'py-3 px-4 text-[14px] font-semibold transition-all duration-200 flex items-center gap-3.5',
                isActive
                  ? 'text-white bg-accent shadow-[0_4px_12px_rgba(247,127,0,0.25)]'
                  : 'text-text-secondary hover:text-text hover:bg-white/5 dark:hover:bg-white/5 rounded-xl'
              )
            }
            end={item.path === '/dashboard'}
          >
            {({ isActive }) => (
              <>
                <span className={clsx("w-1.5 h-1.5 rounded-full", isActive ? "bg-white" : "bg-muted/40")} />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] rounded-full bg-accent text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-white/5 bg-bg-secondary">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-panel/50 border border-white/5 flex items-center justify-center text-accent font-bold">
            {user?.name?.[0].toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{user?.name ?? 'Guest'}</div>
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider">
              {user?.role ? ROLE_LABELS[user.role] : 'GUEST'}
            </div>
          </div>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-accent/40 text-accent font-bold text-sm hover:bg-accent hover:text-white transition-all duration-200"
          onClick={() => {
            logout()
            nav(PATHS.AUTH.LOGIN)
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

