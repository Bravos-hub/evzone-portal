import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { mockSwapSessions } from '@/data/mockDb'
import type { BookingStatus } from '@/core/types/domain'

export function OwnerSwapBookingsPage() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'Upcoming' | 'Past'>('Upcoming')
  const [autoApprove, setAutoApprove] = useState(false)

  const now = new Date()
  const rows = mockSwapSessions
    .filter((r) => (tab === 'Upcoming' ? r.start > now : r.start <= now))
    .filter((r) =>
      q ? (r.id + ' ' + r.stationId + ' ' + r.riderId).toLowerCase().includes(q.toLowerCase()) : true
    )

  const approve = (id: string) => {
    // In real app: update via API
    console.log('Approve:', id)
  }

  const cancel = (id: string) => {
    console.log('Cancel:', id)
  }

  const noShow = (id: string) => {
    console.log('Mark no-show:', id)
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <DashboardLayout pageTitle="Swap Bookings">
      {/* Filters & Controls */}
      <div className="card">
        <div className="grid grid-cols-6 gap-3 max-[900px]:grid-cols-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search id/station/rider"
            className="input col-span-3"
          />
          <div className="inline-flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded-lg border transition ${
                tab === 'Upcoming' ? 'border-accent bg-accent-light text-accent' : 'border-border'
              }`}
              onClick={() => setTab('Upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-3 py-2 rounded-lg border transition ${
                tab === 'Past' ? 'border-accent bg-accent-light text-accent' : 'border-border'
              }`}
              onClick={() => setTab('Past')}
            >
              Past
            </button>
          </div>
          <label className="inline-flex items-center gap-2 text-sm col-span-2">
            <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} className="checkbox" />
            Auto-approve new bookings
          </label>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Bookings Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Swap ID</th>
              <th>When</th>
              <th>Station</th>
              <th>Locker</th>
              <th>Rider</th>
              <th>Duration</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">
                  <a href={`/owner/bookings/${r.id}`} className="text-accent hover:underline">
                    {r.id}
                  </a>
                </td>
                <td>
                  {formatDate(r.start)} • {formatTime(r.start)} • {r.duration}m
                </td>
                <td>{r.stationId}</td>
                <td>{r.lockerId}</td>
                <td>{r.riderId}</td>
                <td>{r.duration} min</td>
                <td>
                  <span
                    className={`pill ${
                      r.status === 'Pending'
                        ? 'pending'
                        : r.status === 'Completed'
                          ? 'approved'
                          : 'rejected'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    {r.status === 'Pending' && (
                      <button onClick={() => approve(r.id)} className="btn secondary">
                        Approve
                      </button>
                    )}
                    <button className="btn secondary">Edit time</button>
                    {r.status !== 'Cancelled' && (
                      <button onClick={() => cancel(r.id)} className="btn secondary">
                        Cancel
                      </button>
                    )}
                    <button onClick={() => noShow(r.id)} className="btn secondary">
                      No-show
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ height: 16 }} />

      {/* Refund Rules Info */}
      <div className="panel">
        <div className="text-sm text-muted">
          <strong>Refund rules:</strong> Full refund if cancelled ≥30m before scheduled time; otherwise fees may apply.
        </div>
      </div>
    </DashboardLayout>
  )
}

