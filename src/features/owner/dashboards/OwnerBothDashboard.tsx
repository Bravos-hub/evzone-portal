import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function OwnerBothDashboard() {
  const kpis = [
    { title: 'Stations online', value: '112 / 117' },
    { title: 'Charge sessions', value: '1,420' },
    { title: 'Swap sessions', value: '860' },
    { title: 'Combined revenue', value: '$22.3k' },
    { title: 'Incidents open', value: '14' },
    { title: 'Maintenance backlog', value: '11' },
    { title: 'SLA compliance', value: '98.8%' },
  ]

  return (
    <DashboardLayout pageTitle="Owner — Both">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Stations (charge + swap)</div>
          <div className="grid gap-4">
            <Panel title="Map / cluster view" subtitle="Charge + swap alerts" />
            <Panel title="Watchlist" subtitle="Degraded stations" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Operations controls</div>
          <div className="grid gap-4">
            <Panel title="Mode toggle" subtitle="All / charge / swap" />
            <Panel title="Pricing snapshot" subtitle="Tariffs + swap fees" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Sessions, throughput & utilization</div>
          <div className="grid gap-4">
            <Panel title="Unified trend" subtitle="Charge sessions + swaps" />
            <Panel title="CX & exceptions" subtitle="Refunds, disputes, failures" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Team, compliance & money</div>
          <div className="grid gap-4">
            <Panel title="Team coverage + roles" subtitle="Per station assignments" />
            <Panel title="Settlements" subtitle="Payout exceptions" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Incidents & maintenance</div>
        <div className="grid gap-4">
          <Panel title="Incident queue" subtitle="Charge vs swap categorization" />
          <Panel title="Work orders" subtitle="Parts, technicians, SLAs" />
          <Panel title="Firmware rollouts" subtitle="Charge + swap cohorts" />
        </div>
      </div>
    </DashboardLayout>
  )
}
