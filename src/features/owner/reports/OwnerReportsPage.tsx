import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

type ReportType = 'Energy' | 'Sessions' | 'Revenue' | 'CO2'
type Granularity = '15m' | '1h' | '1d' | '1w'

export function OwnerReportsPage() {
  const [type, setType] = useState<ReportType>('Energy')
  const [granularity, setGranularity] = useState<Granularity>('1d')
  const [site, setSite] = useState('All Sites')
  const [from, setFrom] = useState('2025-10-01')
  const [to, setTo] = useState('2025-10-28')

  const kpisMap: Record<ReportType, Array<{ title: string; value: string }>> = {
    Energy: [
      { title: 'Energy (kWh)', value: '12,480' },
      { title: 'Sessions', value: '420' },
      { title: 'Avg session (min)', value: '36' },
      { title: 'Revenue', value: '$7,920' },
    ],
    Sessions: [
      { title: 'Sessions', value: '420' },
      { title: 'Avg kWh / session', value: '29.7' },
      { title: 'Avg duration', value: '36 min' },
      { title: 'Success rate', value: '98.7%' },
    ],
    Revenue: [
      { title: 'Gross', value: '$9,120' },
      { title: 'Fees & Taxes', value: '$1,200' },
      { title: 'Net', value: '$7,920' },
      { title: 'ARPU', value: '$18.9' },
    ],
    CO2: [
      { title: 'CO₂ avoided', value: '12.4 tCO₂e' },
      { title: 'Energy (kWh)', value: '12,480' },
      { title: 'Avg carbon intensity', value: '0.40 kg/kWh' },
      { title: 'Sites reporting', value: '24' },
    ],
  }

  const kpis = kpisMap[type]

  return (
    <DashboardLayout pageTitle="Reports & Analytics">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-5 gap-3 max-[900px]:grid-cols-2">
          <select value={type} onChange={(e) => setType(e.target.value as ReportType)} className="select">
            <option value="Energy">Energy</option>
            <option value="Sessions">Sessions</option>
            <option value="Revenue">Revenue</option>
            <option value="CO2">CO₂</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          <select value={site} onChange={(e) => setSite(e.target.value)} className="select">
            <option>All Sites</option>
            <option>Central Hub</option>
            <option>East Parkade</option>
          </select>
          <select value={granularity} onChange={(e) => setGranularity(e.target.value as Granularity)} className="select">
            <option value="15m">15 min</option>
            <option value="1h">Hourly</option>
            <option value="1d">Daily</option>
            <option value="1w">Weekly</option>
          </select>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2">
        {kpis.map((k) => (
          <KpiCard key={k.title} title={k.title} value={k.value} />
        ))}
      </div>

      <div style={{ height: 16 }} />

      {/* Chart & Export */}
      <div className="card">
        <div className="card-title">{type} Report • {granularity} granularity</div>
        <Panel title="Chart visualization" subtitle="Time-series chart placeholder" />
        <div style={{ height: 12 }} />
        <div className="flex items-center gap-2">
          <button className="btn secondary">Export CSV</button>
          <button className="btn secondary">Export PDF</button>
          <button className="btn secondary">Schedule Report</button>
        </div>
      </div>
    </DashboardLayout>
  )
}

