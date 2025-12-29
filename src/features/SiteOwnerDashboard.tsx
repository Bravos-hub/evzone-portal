import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuthStore } from '@/core/auth/authStore'
import { hasPermission } from '@/constants/permissions'

/* ─────────────────────────────────────────────────────────────────────────────
   Site Owner Dashboard — Overview with sites, applications, earnings
   RBAC: Site Owners only
───────────────────────────────────────────────────────────────────────────── */

interface Site {
  id: string
  name: string
  city: string
  status: 'Active' | 'Approved' | 'Pending' | 'Inactive'
  bays: number
  power: number
  updated: string
}

interface Application {
  id: string
  site: string
  model: 'Revenue share' | 'Fixed rent' | 'Hybrid'
  terms: string
  status: 'Under Review' | 'Applied' | 'Approved' | 'Rejected'
  date: string
}

const MOCK_SITES: Site[] = [
  { id: 'st-401', name: 'Business Park A', city: 'Wuxi', status: 'Active', bays: 14, power: 150, updated: '2025-10-20 11:45' },
  { id: 'st-402', name: 'City Mall Roof', city: 'Kampala', status: 'Approved', bays: 25, power: 250, updated: '2025-10-19 16:10' },
  { id: 'st-403', name: 'Airport Long-Stay', city: 'Nairobi', status: 'Pending', bays: 30, power: 300, updated: '2025-10-18 09:30' },
]

const MOCK_APPS: Application[] = [
  { id: 'APP-2201', site: 'Airport Long‑Stay', model: 'Revenue share', terms: '12%', status: 'Under Review', date: '2025-10-18' },
  { id: 'APP-2200', site: 'Warehouse West', model: 'Fixed rent', terms: '$500/mo', status: 'Applied', date: '2025-10-12' },
  { id: 'APP-2199', site: 'Tech Campus', model: 'Hybrid', terms: '8% + $200/mo', status: 'Approved', date: '2025-10-05' },
]

const KPIS = [
  { label: 'Active sites', value: '12' },
  { label: 'Applications pending', value: '3' },
  { label: 'Active leases', value: '7' },
  { label: 'Earnings (MTD)', value: '$12,480' },
  { label: 'Occupancy (24h)', value: '71%' },
]

export function SiteOwnerDashboard() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'SITE_OWNER'
  const canView = hasPermission(role, 'sites', 'view')

  const [ack, setAck] = useState('')

  const toast = (m: string) => { setAck(m); setTimeout(() => setAck(''), 2000) }

  if (!canView) {
    return <div className="p-8 text-center text-subtle">No permission to view Site Owner Dashboard.</div>
  }

  return (
    <DashboardLayout pageTitle="Site Owner — Overview">
      <div className="space-y-6">
        {ack && <div className="rounded-lg bg-accent/10 text-accent px-4 py-2 text-sm">{ack}</div>}

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {KPIS.map(k => (
            <div key={k.label} className="rounded-xl bg-surface border border-border p-5 shadow-sm">
              <div className="text-sm text-subtle">{k.label}</div>
              <div className="mt-2 text-2xl font-bold">{k.value}</div>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/sites" className="flex items-center gap-2 p-4 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            List a Site
          </a>
          <a href="/parking" className="flex items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h6a3 3 0 010 6h-6" /></svg>
            Manage Parking
          </a>
          <a href="/tenants" className="flex items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Tenants
          </a>
          <a href="/earnings" className="flex items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22" /><path d="M17 5a4 4 0 00-4-2H9a3 3 0 000 6h6a3 3 0 010 6H9a4 4 0 01-4-2" /></svg>
            Earnings
          </a>
        </section>

        {/* My Sites */}
        <section className="rounded-xl bg-surface border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My Sites</h2>
            <a href="/sites" className="text-sm text-accent hover:underline">View all</a>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-subtle">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Site</th>
                  <th className="px-4 py-2 text-left font-medium">City</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Bays</th>
                  <th className="px-4 py-2 text-left font-medium">Capacity</th>
                <th className="px-4 py-2 text-left font-medium">Updated</th>
                <th className="px-4 py-2 !text-right font-medium">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_SITES.map(r => (
                  <tr key={r.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-medium">{r.name}</td>
                    <td className="px-4 py-2">{r.city}</td>
                    <td className="px-4 py-2"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-2">{r.bays}</td>
                    <td className="px-4 py-2">{r.power} kW</td>
                    <td className="px-4 py-2 text-subtle">{r.updated}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => toast(`Open ${r.name}`)} className="px-2 py-1 rounded border border-border hover:bg-muted text-xs">Open</button>
                        <button onClick={() => toast(`Edit ${r.name}`)} className="px-2 py-1 rounded border border-border hover:bg-muted text-xs">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Applications */}
        <section className="rounded-xl bg-surface border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Applications</h2>
            <a href="/explore" className="text-sm text-accent hover:underline">Browse sites</a>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-subtle">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">App</th>
                  <th className="px-4 py-2 text-left font-medium">Site</th>
                  <th className="px-4 py-2 text-left font-medium">Model</th>
                  <th className="px-4 py-2 text-left font-medium">Terms</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_APPS.map(a => (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-medium">{a.id}</td>
                    <td className="px-4 py-2">{a.site}</td>
                    <td className="px-4 py-2">{a.model}</td>
                    <td className="px-4 py-2 text-subtle">{a.terms}</td>
                    <td className="px-4 py-2"><AppStatusPill status={a.status} /></td>
                    <td className="px-4 py-2 text-subtle">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function StatusPill({ status }: { status: Site['status'] }) {
  const colors: Record<Site['status'], string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Approved: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Inactive: 'bg-gray-100 text-gray-600',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${colors[status]}`}>{status}</span>
}

function AppStatusPill({ status }: { status: Application['status'] }) {
  const colors: Record<Application['status'], string> = {
    'Under Review': 'bg-amber-100 text-amber-700',
    Applied: 'bg-blue-100 text-blue-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${colors[status]}`}>{status}</span>
}

export default SiteOwnerDashboard

