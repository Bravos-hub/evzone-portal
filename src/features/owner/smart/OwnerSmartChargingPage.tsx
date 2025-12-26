import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'
import { Panel } from '@/ui/components/Panel'

type Preset = 'Cost' | 'Carbon' | 'Balanced' | 'Fleet'

export function OwnerSmartChargingPage() {
  const [site, setSite] = useState('Central Hub')
  const [preset, setPreset] = useState<Preset>('Balanced')
  const [priceMult, setPriceMult] = useState(1.0)
  const [renewPct, setRenewPct] = useState(55)
  const [ack, setAck] = useState('')

  const kpis = [
    { title: 'Expected cost (today)', value: `$${(7920 * 0.002 * priceMult).toFixed(2)}` },
    { title: 'Expected CO₂ (today)', value: `${Math.max(0, 420 * (100 - renewPct) / 100).toFixed(0)} kg` },
    { title: 'Headroom saved', value: '62 kW' },
    { title: 'Success rate', value: '98.6%' },
  ]

  const events = [
    { time: '13:00–15:30', kind: 'PV surplus', note: '+12% renewables (suggest: relax 10%)' },
    { time: '18:00–20:00', kind: 'Peak price', note: '$0.42/kWh (suggest: shed 15%)' },
    { time: 'Thu 09:30', kind: 'DR event', note: 'DSO request 20% cap (1h)' },
  ]

  const applyStrategy = () => {
    setAck(`Applied ${preset} strategy on ${site} (demo).`)
    setTimeout(() => setAck(''), 2000)
  }

  return (
    <DashboardLayout pageTitle="Smart Charging">
      {ack && <div className="text-sm text-accent mb-4">{ack}</div>}

      {/* Presets & Filters */}
      <div className="card">
        <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
          <div>
            <label className="grid gap-2 text-sm">
              <span className="text-muted">Site</span>
              <select value={site} onChange={(e) => setSite(e.target.value)} className="select">
                <option>Central Hub</option>
                <option>Airport East</option>
                <option>Tech Park A</option>
              </select>
            </label>
          </div>
          <div>
            <label className="grid gap-2 text-sm">
              <span className="text-muted">Strategy preset</span>
              <select value={preset} onChange={(e) => setPreset(e.target.value as Preset)} className="select">
                <option value="Cost">Cost (min $)</option>
                <option value="Carbon">Carbon (min CO₂)</option>
                <option value="Balanced">Balanced</option>
                <option value="Fleet">Fleet Priority</option>
              </select>
            </label>
          </div>
          <div className="self-end">
            <button onClick={applyStrategy} className="btn w-full">
              Apply Strategy
            </button>
          </div>
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

      {/* What-If & Events */}
      <div className="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
        <div className="card">
          <div className="card-title">What-If Simulation</div>
          <label className="grid gap-2 text-sm mb-3">
            <span className="text-muted">Price multiplier: {priceMult.toFixed(1)}x</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={priceMult}
              onChange={(e) => setPriceMult(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Renewable share: {renewPct}%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={renewPct}
              onChange={(e) => setRenewPct(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>

        <div className="card">
          <div className="card-title">Upcoming Events</div>
          <div className="grid gap-2">
            {events.map((e, i) => (
              <div key={i} className="panel">
                <div className="font-semibold text-sm">{e.time} • {e.kind}</div>
                <div className="text-xs text-muted mt-1">{e.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Chart placeholder */}
      <div className="card">
        <div className="card-title">Price & Carbon Forecast</div>
        <Panel title="Forecast visualization" subtitle="Price and carbon intensity next 24h" />
      </div>
    </DashboardLayout>
  )
}

