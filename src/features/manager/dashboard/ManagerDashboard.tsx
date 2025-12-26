import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function ManagerDashboard() {
  const kpis = [
    { title: 'Assigned stations', value: '3' },
    { title: 'Stations online', value: '3 / 3' },
    { title: 'Staff on shift', value: '7' },
    { title: 'Incidents open', value: '3' },
    { title: 'SLA breaches', value: '1' },
    { title: 'CSAT (7d)', value: '4.6 / 5' },
  ]

  return (
    <DashboardLayout pageTitle="Manager Overview">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Stations Overview & Live Status</div>
          <div className="grid gap-4">
            <Panel title="My stations status" subtitle="Table/map + alerts" />
            <Panel title="Live ops snapshot" subtitle="Sessions, queues, downtime" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Attendants & Shifts</div>
          <div className="grid gap-4">
            <Panel title="Shift board" subtitle="Who is on duty where" />
            <Panel title="Attendant performance" subtitle="Check-ins, notes, errors" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Incidents & Maintenance</div>
          <div className="grid gap-4">
            <Panel title="Incidents queue" subtitle="Station-scoped SLA timers" />
            <Panel title="Maintenance requests" subtitle="Create/track/escalate" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Service Quality & Communications</div>
          <div className="grid gap-4">
            <Panel title="CX signals" subtitle="Complaints, refunds, repeat issues" />
            <Panel title="Messages" subtitle="To attendants/admin/operator" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Staffing & escalation</div>
        <div className="grid gap-4">
          <Panel title="Technician assignments" subtitle="For assigned stations" />
          <Panel title="Shift coverage heatmap" subtitle="Gaps & overlaps" />
          <Panel title="Escalation board" subtitle="Incidents at risk" />
        </div>
      </div>
    </DashboardLayout>
  )
}
