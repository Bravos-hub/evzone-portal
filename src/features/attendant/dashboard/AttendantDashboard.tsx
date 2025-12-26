import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function AttendantDashboard() {
  const kpis = [
    { title: 'Active sessions', value: '8' },
    { title: 'Swaps today', value: '12' },
    { title: 'Queue length', value: '3' },
    { title: 'Incidents open', value: '2' },
    { title: 'Avg wait time', value: '6m' },
    { title: 'Shift progress', value: '3h 20m' },
  ]

  return (
    <DashboardLayout pageTitle="Attendant Live Console">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Live Operations Console</div>
          <div className="grid gap-4">
            <Panel title="Active sessions" subtitle="Start/stop, energy, payment" />
            <Panel title="Bays/connectors status" subtitle="Available / busy / fault" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Quick Actions</div>
          <div className="grid gap-4">
            <Panel title="Start session" subtitle="QR / RFID / manual" />
            <Panel title="Report incident" subtitle="Fault, customer issue" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Station Checklist & Shift Notes</div>
          <div className="grid gap-4">
            <Panel title="Daily checklist" subtitle="Safety, cleanliness, equipment" />
            <Panel title="Shift handover notes" subtitle="Write + review" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Support & Messages</div>
          <div className="grid gap-4">
            <Panel title="Customer help" subtitle="Lookup, receipts, refund request" />
            <Panel title="Messages" subtitle="Manager/admin/operator notices" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Queue & reconciliation</div>
        <div className="grid gap-4">
          <Panel title="Queue / walk-ins" subtitle="Priorities, timers" />
          <Panel title="Cash / POS totals" subtitle="Shift reconciliation" />
          <Panel title="Handover quality" subtitle="Notes, issues, next shift" />
        </div>
      </div>
    </DashboardLayout>
  )
}
