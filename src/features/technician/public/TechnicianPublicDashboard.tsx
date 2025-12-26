import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function TechnicianPublicDashboard() {
  const kpis = [
    { title: 'Jobs offered', value: '18' },
    { title: 'My jobs', value: '4' },
    { title: 'Due today', value: '1' },
    { title: 'Earnings (30d)', value: '$1,120' },
    { title: 'Payout pending', value: '$240' },
    { title: 'Ratings', value: '4.8 / 5' },
  ]

  return (
    <DashboardLayout pageTitle="Technician — Public">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Marketplace / Job Feed</div>
          <div className="grid gap-4">
            <Panel title="Jobs feed" subtitle="Region, skill, distance, pay" />
            <Panel title="Job detail preview" subtitle="SLA, scope, station, contact" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Claim & Execute</div>
          <div className="grid gap-4">
            <Panel title="Accept job" subtitle="Marketplace vs assigned" />
            <Panel title="Route to site" subtitle="ETA + directions" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Work Proof & Compliance</div>
          <div className="grid gap-4">
            <Panel title="Upload evidence" subtitle="Photos/signatures + checklist" />
            <Panel title="Compliance docs" subtitle="ID/certs/safety" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Payments & Performance</div>
          <div className="grid gap-4">
            <Panel title="Payments timeline" subtitle="Payout schedule" />
            <Panel title="Ratings & disputes" subtitle="SLA stats, cases" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Availability & compliance</div>
        <div className="grid gap-4">
          <Panel title="Availability toggle" subtitle="Online/offline for offers" />
          <Panel title="Skills / regions" subtitle="Eligible zones" />
          <Panel title="Performance snapshot" subtitle="Acceptance, SLA met, disputes" />
        </div>
      </div>
    </DashboardLayout>
  )
}
