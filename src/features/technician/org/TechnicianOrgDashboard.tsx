import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function TechnicianOrgDashboard() {
  const kpis = [
    { title: 'Jobs open', value: '6' },
    { title: 'Due today', value: '2' },
    { title: 'SLA at risk', value: '1' },
    { title: 'In progress', value: '1' },
    { title: 'Parts pending', value: '3' },
    { title: 'First-time fix', value: '86%' },
  ]

  return (
    <DashboardLayout pageTitle="Technician — Org">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Job Queue & Priorities</div>
          <div className="grid gap-4">
            <Panel title="My jobs list" subtitle="Priority, SLA, station, status" />
            <Panel title="Job timeline" subtitle="New → in progress → done" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Job Actions</div>
          <div className="grid gap-4">
            <Panel title="Start / pause / complete" subtitle="Job state controls" />
            <Panel title="Upload evidence + notes" subtitle="Photos, logs" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Diagnostics & Station History</div>
          <div className="grid gap-4">
            <Panel title="Asset diagnostics" subtitle="Charger/battery/locker health" />
            <Panel title="Fault history" subtitle="Recurring issues" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Reports & Comms</div>
          <div className="grid gap-4">
            <Panel title="Service report drafts" subtitle="Templates/checklists" />
            <Panel title="Messages" subtitle="Manager/admin/operator" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Parts & performance</div>
        <div className="grid gap-4">
          <Panel title="Parts / inventory" subtitle="Requests, availability" />
          <Panel title="Time & notes" subtitle="Clock-in, time on task" />
          <Panel title="Recent closures" subtitle="First-time fix, repeats" />
        </div>
      </div>
    </DashboardLayout>
  )
}
