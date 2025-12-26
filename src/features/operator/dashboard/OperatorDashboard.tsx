import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function OperatorDashboard() {
  const kpis = [
    { title: 'Regional uptime', value: '99.1%' },
    { title: 'Stations offline', value: '16' },
    { title: 'Approvals pending', value: '36' },
    { title: 'Jobs open', value: '22' },
    { title: 'Sessions today', value: '4,208' },
    { title: 'Escalations', value: '5' },
    { title: 'Settlement variance', value: '$3.4k' },
  ]

  return (
    <DashboardLayout pageTitle="Operator Overview">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Stations & incidents</div>
          <div className="grid gap-4">
            <Panel title="Map / cluster" subtitle="Online/offline, alerts" />
            <Panel title="Top degraded stations" subtitle="Notify / dispatch" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Approvals & dispatch</div>
          <div className="grid gap-4">
            <Panel title="Approvals queue" subtitle="Users, stations, roles" />
            <Panel title="Dispatch board" subtitle="Assign technicians, SLAs" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Sessions & revenue</div>
          <div className="grid gap-4">
            <Panel title="Utilization trend" subtitle="Sessions, throughput" />
            <Panel title="Settlement exceptions" subtitle="Regional payout anomalies" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Operator feed</div>
          <div className="grid gap-4">
            <Panel title="Recent actions" subtitle="Approvals, dispatch, overrides" />
            <Panel title="Regional notices" subtitle="Broadcast to stations/owners" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
