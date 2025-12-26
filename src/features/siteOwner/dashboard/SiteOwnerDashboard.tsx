import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function SiteOwnerDashboard() {
  const kpis = [
    { title: 'Listed sites', value: '12' },
    { title: 'Leased sites', value: '7' },
    { title: 'New applications', value: '9' },
    { title: 'Expiring leases', value: '3' },
    { title: 'Expected payout', value: '$6,240' },
    { title: 'Ledger exceptions', value: '4' },
    { title: 'New messages', value: '3' },
  ]

  return (
    <DashboardLayout pageTitle="Site Owner Overview">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">My Sites & Availability</div>
          <div className="grid gap-4">
            <Panel title="Map + site cards" subtitle="Availability, utilities, access" />
            <Panel title="Site status table" subtitle="Draft / listed / leased" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Applications Pipeline</div>
          <div className="grid gap-4">
            <Panel title="New applications" subtitle="Leads by region/site" />
            <Panel title="Decision queue" subtitle="Approve / reject / renegotiate" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Leases & Tenants</div>
          <div className="grid gap-4">
            <Panel title="Active leases" subtitle="Rent, term, contacts" />
            <Panel title="Lease events" subtitle="Renewals, expiries, violations" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Earnings & Ledger</div>
          <div className="grid gap-4">
            <Panel title="Earnings trend" subtitle="Payout schedule" />
            <Panel title="Ledger exceptions" subtitle="Disputes and adjustments" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Operational controls</div>
        <div className="grid gap-4">
          <Panel title="Verification & compliance" subtitle="Docs, inspections, permits" />
          <Panel title="Negotiation threads" subtitle="Offers, counter-offers, audit trail" />
          <Panel title="Site incidents" subtitle="Security/access violations" />
        </div>
      </div>
    </DashboardLayout>
  )
}
