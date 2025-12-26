import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/core/auth/authStore'
import type { OwnerCapability, Role } from '@/core/auth/types'

const roles: Array<{ role: Role; label: string }> = [
  { role: 'EVZONE_ADMIN', label: 'EVzone Admin' },
  { role: 'EVZONE_OPERATOR', label: 'EVzone Operator' },
  { role: 'SITE_OWNER', label: 'Site Owner' },
  { role: 'OWNER', label: 'Station Owner' },
  { role: 'STATION_ADMIN', label: 'Station Admin' },
  { role: 'MANAGER', label: 'Station Manager' },
  { role: 'ATTENDANT', label: 'Station Attendant' },
  { role: 'TECHNICIAN_ORG', label: 'Technician (Org)' },
  { role: 'TECHNICIAN_PUBLIC', label: 'Technician (Public)' },
]

export function LoginPage() {
  const nav = useNavigate()
  const { login, user } = useAuthStore()
  const [role, setRole] = useState<Role>(user?.role ?? 'EVZONE_OPERATOR')
  const [cap, setCap] = useState<OwnerCapability>('CHARGE')
  const [name, setName] = useState(user?.name ?? 'Demo User')

  const showCap = useMemo(() => role === 'OWNER', [role])

  return (
    <div className="max-w-[760px] mx-auto my-[50px] p-[18px]">
      <h1 className="m-0 text-[22px]">EVzone Portal — Demo Login</h1>
      <p className="text-muted mt-1.5">
        This frontend is backend-agnostic. Choose a role to view the corresponding dashboard + sidebar.
      </p>

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)] mt-4">
        <div className="grid gap-3">
          <label>
            <div className="text-muted text-xs mb-1.5">Display name</div>
            <input
              className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            <div className="text-muted text-xs mb-1.5">Role</div>
            <select
              className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap w-full"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {roles.map((r) => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>
          </label>

          {showCap ? (
            <label>
              <div className="text-muted text-xs mb-1.5">Station Owner capability</div>
              <select
                className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap w-full"
                value={cap}
                onChange={(e) => setCap(e.target.value as OwnerCapability)}
              >
                <option value="CHARGE">Charge</option>
                <option value="SWAP">Swap</option>
                <option value="BOTH">Both</option>
              </select>
            </label>
          ) : null}

          <div className="flex gap-[10px] flex-wrap">
            <button
              className="bg-accent border border-accent text-white py-[10px] px-[18px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 shadow-[0_2px_4px_rgba(59,130,246,.2)] whitespace-nowrap hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_8px_rgba(59,130,246,.3)] hover:-translate-y-[1px] active:translate-y-0"
              onClick={() => {
                login({ role, name, ownerCapability: showCap ? cap : undefined })
                nav('/', { replace: true })
              }}
            >
              Continue
            </button>
            <button
              className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
              onClick={() => nav('/', { replace: true })}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3.5 text-muted text-xs">
        Tip: once inside a dashboard, use "Switch Role" in the header.
      </div>
    </div>
  )
}

