import { useState } from 'react'
import clsx from 'clsx'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { mockOCPIPartners } from '@/data/mockDb'
import { StatusPill } from '@/ui/components/StatusPill'
import type { OCPIRole, OCPIStatus } from '@/core/types/domain'

export function AdminOCPIPage() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState<OCPIRole | 'All'>('All')
  const [status, setStatus] = useState<OCPIStatus | 'All'>('All')
  const [country, setCountry] = useState('All')
  const [ack, setAck] = useState('')

  const kpis = [
    { label: 'Partners', value: '22' },
    { label: 'Active tokens', value: '64' },
    { label: 'Roaming kWh (30d)', value: '12,840' },
    { label: 'Sync errors (24h)', value: '3' },
    { label: 'Endpoints', value: '44' },
  ]

  const rows = mockOCPIPartners
    .filter((r) => (q ? (r.name + ' ' + r.id).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (role === 'All' ? true : r.role === role))
    .filter((r) => (status === 'All' ? true : r.status === status))
    .filter((r) => (country === 'All' ? true : r.country === country))

  const toast = (m: string) => {
    setAck(m)
    setTimeout(() => setAck(''), 1500)
  }

  const syncNow = (id: string) => toast(`Sync ${id} (demo)`)
  const toggleStatus = (id: string) => toast(`Toggled status for ${id} (demo)`)

  return (
    <DashboardLayout pageTitle="OCPI Roaming">
      {ack && <div className="text-sm text-accent mb-4">{ack}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 xl:grid-cols-3 md:grid-cols-2">
        {kpis.map((k) => (
          <div key={k.label} className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
            <div className="text-xs text-muted mb-2">{k.label}</div>
            <div className="text-2xl font-bold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="h-4" />

      {/* Filters */}
      <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
        <div className="grid grid-cols-6 gap-3 lg:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search partner / ID"
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] px-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] placeholder:text-muted w-full col-span-2 flex-shrink"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
          >
            <option value="All">All Roles</option>
            <option value="CPO">CPO</option>
            <option value="MSP">MSP</option>
            <option value="EMSP">EMSP</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0"
          >
            <option value="All">All Countries</option>
            <option value="UG">Uganda</option>
            <option value="KE">Kenya</option>
            <option value="CN">China</option>
          </select>
          <select className="bg-panel border border-border-light text-text rounded-lg py-[9px] pr-8 pl-[14px] text-[13px] transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,.15)] cursor-pointer select-arrow whitespace-nowrap flex-shrink-0">
            <option>Version 2.2.1</option>
          </select>
        </div>
      </div>

      <div className="h-4" />

      {/* Partners Table */}
      <div className="overflow-x-auto rounded-xl border border-border-light bg-panel shadow-[0_2px_8px_rgba(0,0,0,.2)]">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Partner</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Role</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Country</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Version</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Last sync</th>
              <th className="py-3.5 px-4 text-left border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Status</th>
              <th className="py-3.5 px-4 text-right border-t-0 text-muted text-[11px] font-semibold uppercase tracking-[0.5px] bg-bg-secondary sticky top-0 z-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors duration-150 hover:bg-[rgba(255,255,255,.05)] last:td:border-b-0">
                <td className="py-3.5 px-4 text-left border-t border-border-light font-semibold">
                  {r.name} <span className="text-muted text-xs">({r.id})</span>
                </td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{r.role}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{r.country}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{r.version}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">{r.lastSync?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-3.5 px-4 text-left border-t border-border-light">
                  {r.status === 'Active' ? (
                    <StatusPill status="Approved" />
                  ) : r.status === 'Pending' ? (
                    <StatusPill status="Pending" />
                  ) : (
                    <StatusPill status="Rejected" />
                  )}
                </td>
                <td className="py-3.5 px-4 text-right border-t border-border-light">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => syncNow(r.id)}
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                    >
                      Sync now
                    </button>
                    <button
                      onClick={() => toggleStatus(r.id)}
                      className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                    >
                      {r.status === 'Active' ? 'Suspend' : 'Resume'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="h-4" />

      {/* Tokens & Sync log */}
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-1">
        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Tokens (sample)</div>
          <div className="grid gap-3">
            {['OCPI_live_****9af2', 'OCPI_test_****17c0'].map((t) => (
              <div key={t} className="rounded-[10px] border border-border-light p-4 bg-panel-2 text-text-secondary min-h-[100px] transition-all duration-200 hover:border-border hover:bg-[rgba(37,43,61,.6)] flex items-center justify-between">
                <span className="font-mono text-sm">{t}</span>
                <button
                  onClick={() => toast('Rotated token (demo)')}
                  className="bg-panel border border-border text-text py-2 px-3 rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-200 whitespace-nowrap hover:bg-panel-2 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                >
                  Rotate
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-border-light rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.3)]">
          <div className="text-xs text-muted m-0 mb-4 font-semibold uppercase tracking-[0.5px]">Sync log</div>
          <div className="grid gap-2">
            {[
              { t: '11:42', e: 'Locations pulled', s: 'OK' },
              { t: '11:40', e: 'Tariffs pushed', s: 'OK' },
              { t: '10:58', e: 'Sessions push', s: 'Fail' },
            ].map((x, i) => (
              <div key={i} className="rounded-[10px] border border-border-light p-4 bg-panel-2 text-text-secondary min-h-[100px] transition-all duration-200 hover:border-border hover:bg-[rgba(37,43,61,.6)] flex items-center justify-between">
                <span className="text-sm">
                  {x.t} — {x.e}
                </span>
                {x.s === 'OK' ? <StatusPill status="Approved" /> : <StatusPill status="Rejected" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

