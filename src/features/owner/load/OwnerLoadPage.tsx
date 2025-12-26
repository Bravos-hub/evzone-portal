import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'

interface LoadAllocation {
  chargePointId: string
  requested: number
  allocated: number
  status: 'Charging' | 'Idle' | 'Waiting'
}

export function OwnerLoadPage() {
  const [site, setSite] = useState('Central Hub')
  const [mode, setMode] = useState<'Automatic' | 'Manual'>('Automatic')
  const [importLimit, setImportLimit] = useState(500)
  const [currentDraw, setCurrentDraw] = useState(322)
  const [throttle, setThrottle] = useState(0)

  const headroom = Math.max(0, importLimit - currentDraw)

  const allocations: LoadAllocation[] = [
    { chargePointId: 'CP-A1', requested: 28, allocated: 22, status: 'Charging' },
    { chargePointId: 'CP-A2', requested: 24, allocated: 18, status: 'Idle' },
    { chargePointId: 'CP-B4', requested: 30, allocated: 25, status: 'Charging' },
    { chargePointId: 'CP-C2', requested: 18, allocated: 15, status: 'Idle' },
  ]

  const emergencyShed = (pct: number) => {
    alert(`Emergency shed ${pct}% (demo)`)
  }

  return (
    <DashboardLayout pageTitle="Load Management Console">
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
          <select value={site} onChange={(e) => setSite(e.target.value)} className="select">
            <option>Central Hub</option>
            <option>Airport East</option>
            <option>Tech Park A</option>
          </select>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="select">
            <option>Automatic</option>
            <option>Manual</option>
          </select>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Import limit (kW)</span>
            <input
              type="number"
              value={importLimit}
              onChange={(e) => setImportLimit(Number(e.target.value) || 0)}
              className="input"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Current draw (kW)</span>
            <input
              type="number"
              value={currentDraw}
              onChange={(e) => setCurrentDraw(Number(e.target.value) || 0)}
              className="input"
              disabled
            />
          </label>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2">
        <KpiCard title="Import limit" value={`${importLimit} kW`} />
        <KpiCard title="Current draw" value={`${currentDraw} kW`} />
        <KpiCard title="Headroom" value={`${headroom} kW`} />
        <KpiCard title="Utilization" value={`${((currentDraw / importLimit) * 100).toFixed(1)}%`} />
      </div>

      <div style={{ height: 16 }} />

      {/* Allocations & Controls */}
      <div className="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
        <div className="card">
          <div className="card-title">Charge Point Allocations</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Charge Point</th>
                  <th className="text-right">Requested (kW)</th>
                  <th className="text-right">Allocated (kW)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.chargePointId}>
                    <td className="font-semibold">{a.chargePointId}</td>
                    <td className="text-right">{a.requested}</td>
                    <td className="text-right font-semibold">{a.allocated}</td>
                    <td>
                      <span className={`pill ${a.status === 'Charging' ? 'approved' : 'sendback'}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Manual Controls</div>
          <label className="grid gap-2 text-sm mb-4">
            <span className="text-muted">Manual throttle: {throttle}%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={throttle}
              onChange={(e) => setThrottle(Number(e.target.value))}
              className="w-full"
              disabled={mode === 'Automatic'}
            />
          </label>
          <div className="grid gap-2">
            <button onClick={() => emergencyShed(25)} className="btn secondary">
              Emergency shed 25%
            </button>
            <button onClick={() => emergencyShed(50)} className="btn secondary">
              Emergency shed 50%
            </button>
            <button onClick={() => emergencyShed(100)} className="btn secondary">
              Emergency shed 100% (pause all)
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

