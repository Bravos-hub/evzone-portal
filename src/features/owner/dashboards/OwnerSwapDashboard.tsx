import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function OwnerSwapDashboard() {
  const kpis = [
    { title: 'Stations online', value: '24 / 25' },
    { title: 'Available batteries', value: '312' },
    { title: 'Out-of-service', value: '12' },
    { title: 'Swaps today', value: '860' },
    { title: 'Queue time', value: '3.2 min' },
    { title: 'Revenue today', value: '$9.4k' },
    { title: 'Incidents open', value: '5' },
  ]

  return (
    <DashboardLayout pageTitle="Owner — Swap">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Stations & performance</div>
          <div className="grid gap-4">
            <Panel title="Map / station cluster" subtitle="Throughput, alerts" />
            <Panel title="Top bottlenecks" subtitle="Queues, downtime" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Inventory & health</div>
          <div className="grid gap-4">
            <Panel title="Inventory state" subtitle="Full/empty/charging per station" />
            <Panel title="Battery health trends" subtitle="SOH, cycles, failures" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Sessions & service</div>
          <div className="grid gap-4">
            <Panel title="Swaps trend + service time" subtitle="Operational throughput" />
            <Panel title="Exceptions" subtitle="Failed swaps, refunds" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Team & Maintenance</div>
          <div className="grid gap-4">
            <Panel title="Coverage + training flags" subtitle="Attendants readiness" />
            <Panel title="Maintenance queue" subtitle="Battery/locker faults" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Operations controls</div>
        <div className="grid gap-4">
          <Panel title="Logistics" subtitle="Battery movement, rebalancing" />
          <Panel title="Maintenance & work orders" subtitle="Dispatch + SLA timers" />
          <Panel title="Integrations / roaming" subtitle="Inventory visibility, settlement" />
        </div>
      </div>
    </DashboardLayout>
  )
}
