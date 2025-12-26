import type { PropsWithChildren } from 'react'
import { menuFor } from '@/core/config/menus'
import { useAuthStore } from '@/core/auth/authStore'
import { Sidebar } from '@/ui/components/Sidebar'
import { Header } from '@/ui/components/Header'

function titles(role: string, cap?: string) {
  switch (role) {
    case 'EVZONE_ADMIN': return { title: 'EVzone Admin', subtitle: 'Global Support & Oversight' }
    case 'EVZONE_OPERATOR': return { title: 'EVzone Operator', subtitle: 'Regional Operations' }
    case 'SITE_OWNER': return { title: 'Site Owner', subtitle: 'Locations • Parking • Leases' }
    case 'OWNER':
      return cap === 'SWAP'
        ? { title: 'Station Owner — Swap', subtitle: 'Swap Ops • Inventory • Battery Health' }
        : cap === 'BOTH'
          ? { title: 'Station Owner — Both', subtitle: 'Unified Charge + Swap Operations' }
          : { title: 'Station Owner — Charge', subtitle: 'Charging Operations & Revenue' }
    case 'STATION_ADMIN': return { title: 'Station Admin', subtitle: 'Org Staff • Station Ops Admin' }
    case 'MANAGER': return { title: 'Station Manager', subtitle: 'Assigned Stations Oversight' }
    case 'ATTENDANT': return { title: 'Station Attendant', subtitle: 'Live Operations • Single Station' }
    case 'TECHNICIAN_ORG': return { title: 'Technician — Org', subtitle: 'Owner-Org Technician • Assigned Stations' }
    case 'TECHNICIAN_PUBLIC': return { title: 'Technician — Public', subtitle: 'Marketplace / Assigned Contractor' }
    default: return { title: 'EVzone', subtitle: 'Portal' }
  }
}

export function DashboardLayout({ children, pageTitle }: PropsWithChildren<{ pageTitle: string }>) {
  const { user } = useAuthStore()
  const role = user?.role ?? 'EVZONE_OPERATOR'
  const cap = user?.ownerCapability
  const { title, subtitle } = titles(role, cap)
  const items = menuFor(role as any, cap as any)

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar title={title} subtitle={subtitle} items={items} />
      <div className="grid grid-rows-[72px_1fr] bg-bg ml-[260px]">
        <Header title={pageTitle} />
        <main className="p-7 overflow-y-auto bg-bg">{children}</main>
      </div>
    </div>
  )
}

