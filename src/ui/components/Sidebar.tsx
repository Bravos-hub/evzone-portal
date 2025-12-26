import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import type { MenuItem } from '@/core/config/menus'

export function Sidebar({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: MenuItem[]
}) {
  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen border-r border-border-light p-0 bg-bg-secondary shadow-[2px_0_8px_rgba(0,0,0,.2)] flex flex-col overflow-hidden z-[100]">
      <div className="flex items-center justify-center gap-3 px-5 py-5 pb-[18px] border-b border-border-light bg-panel flex-shrink-0">
        <img src="/assets/cpms.png" alt="EVzone Logo" className="w-[200px] h-auto object-contain flex-shrink-0" />
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide">
        {items.map((it) => (
          <NavLink
            key={it.path}
            to={it.path}
            className={({ isActive }) =>
              clsx(
                'py-[11px] px-[14px] rounded-lg text-text-secondary border border-transparent text-[13px] font-medium transition-all duration-200 relative',
                isActive
                  ? 'text-text bg-accent-light border-[rgba(59,130,246,.2)] font-semibold before:content-[""] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[60%] before:bg-accent before:rounded-[0_2px_2px_0]'
                  : 'hover:text-text hover:bg-[rgba(255,255,255,.04)]'
              )
            }
            end
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

