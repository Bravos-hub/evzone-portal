import React from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

export function OwnerChargeDashboard() {
  const kpis = [
    { title: 'Chargers online', value: '88 / 92' },
    { title: 'Utilization', value: '61%' },
    { title: 'Sessions today', value: '1,420' },
    { title: 'Revenue today', value: '$12.9k' },
    { title: 'Failed sessions', value: '14' },
    { title: 'SLA breaches', value: '4' },
  ]

  return (
    <DashboardLayout pageTitle="Owner — Charge">
      <div className="grid grid-cols-6 gap-4 2xl:grid-cols-6 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Stations & asset health</div>
          <div className="grid gap-4">
            <Panel title="Station map" subtitle="Online / offline, alerts" />
            <Panel title="Degraded chargers" subtitle="Diagnostics + remote commands" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Pricing & Demand</div>
          <div className="grid gap-4">
            <Panel title="Tariff snapshot" subtitle="Peak / off-peak, promos" />
            <Panel title="Smart charging alerts" subtitle="Limits, curtailment" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Sessions & CX</div>
          <div className="grid gap-4">
            <Panel title="Session trend + utilization" subtitle="By station" />
            <Panel title="CX exceptions" subtitle="Refund requests, disputes" />
          </div>
        </div>
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Team & Maintenance</div>
          <div className="grid gap-4">
            <Panel title="Shift coverage" subtitle="Managers/attendants on duty" />
            <Panel title="Maintenance queue" subtitle="Internal + public tech requests" />
          </div>
        </div>
      </div>

      <div className="h-4" />

      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Incidents & integrations</div>
        <div className="grid gap-4">
          <Panel title="Incidents & work orders" subtitle="Linked to assets and SLAs" />
          <Panel title="Integrations / roaming" subtitle="OCPI, CDRs, settlements" />
          <Panel title="Firmware rollouts" subtitle="Cohorts, retries, compliance" />
        </div>
      </div>
    </DashboardLayout>
  )
}
