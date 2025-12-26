import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function StationAdminDashboard() {
  const kpis = [
    { title: 'Assigned stations', value: '6' },
    { title: 'Staff on duty', value: '18' },
    { title: 'Stations degraded', value: '1' },
    { title: 'Incidents open', value: '7' },
    { title: 'Maintenance requests', value: '5' },
    { title: 'Shifts starting soon', value: '4' },
  ]

  return (
    <DashboardLayout pageTitle="Station Admin Overview">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Stations & Coverage</div>
          <div className="grid gap-4">
            <Panel title="Assigned stations status" subtitle="Table + quick actions" />
            <Panel title="Coverage heatmap" subtitle="By station/hour" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Staff & Role Management</div>
          <div className="grid gap-4">
            <Panel title="Staff directory" subtitle="Assign station roles" />
            <Panel title="Role requests / invites" subtitle="Pending acceptance" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Incidents & Requests</div>
          <div className="grid gap-4">
            <Panel title="Incidents queue" subtitle="Station-scoped SLA timers" />
            <Panel title="Requests board" subtitle="Parts/tech/permissions + escalation" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Messages & Audit</div>
          <div className="grid gap-4">
            <Panel title="Broadcast notices" subtitle="To assigned stations" />
            <Panel title="Recent actions" subtitle="Limited-scope audit trail" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Daily operations</div>
        <div className="grid gap-4">
          <Panel title="Shifts / attendance" subtitle="Start/end, handovers" />
          <Panel title="Cash / POS" subtitle="Receipts, reconciliation" />
          <Panel title="Maintenance & incidents" subtitle="Local initiation + tracking" />
        </div>
      </div>
    </DashboardLayout>
  )
}
