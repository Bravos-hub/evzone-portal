import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { KpiCard } from '@/ui/components/KpiCard'

interface SiteRow {
  id: string
  name: string
  city: string
  status: 'Active' | 'Approved' | 'Pending' | 'Draft'
  bays: number
  powerKw: number
  updated: string
}

interface Application {
  id: string
  site: string
  model: string
  terms: string
  status: 'Under Review' | 'Applied' | 'Approved' | 'Rejected'
  date: string
}

export function SiteOwnerSitesPage() {
  const kpis = [
    { title: 'Active sites', value: '12' },
    { title: 'Applications pending', value: '3' },
    { title: 'Active leases', value: '7' },
    { title: 'Earnings (MTD)', value: '$12,480' },
    { title: 'Occupancy (24h)', value: '71%' },
  ]

  const sites: SiteRow[] = [
    {
      id: 'st-401',
      name: 'Business Park A',
      city: 'Wuxi',
      status: 'Active',
      bays: 14,
      powerKw: 150,
      updated: '2025-10-20 11:45',
    },
    {
      id: 'st-402',
      name: 'City Mall Roof',
      city: 'Kampala',
      status: 'Approved',
      bays: 25,
      powerKw: 250,
      updated: '2025-10-19 16:10',
    },
  ]

  const applications: Application[] = [
    {
      id: 'APP-2201',
      site: 'Airport Long-Stay',
      model: 'Revenue share',
      terms: '12%',
      status: 'Under Review',
      date: '2025-10-18',
    },
    {
      id: 'APP-2200',
      site: 'Warehouse West',
      model: 'Fixed rent',
      terms: '$500/mo',
      status: 'Applied',
      date: '2025-10-12',
    },
  ]

  return (
    <DashboardLayout pageTitle="My Sites & Availability">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 max-[1100px]:grid-cols-3 max-[720px]:grid-cols-2">
        {kpis.map((k) => (
          <KpiCard key={k.title} title={k.title} value={k.value} />
        ))}
      </div>

      <div style={{ height: 16 }} />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
        <a href="/site-owner/sites/browse" className="btn">
          + List a Site
        </a>
        <a href="/site-owner/parking/new" className="btn secondary">
          Create Parking
        </a>
        <a href="/site-owner/plans" className="btn secondary">
          Plans
        </a>
        <a href="/site-owner/earnings" className="btn secondary">
          Earnings
        </a>
      </div>

      <div style={{ height: 16 }} />

      {/* My Sites */}
      <div className="card">
        <div className="card-title">My Sites</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Site</th>
                <th>City</th>
                <th>Status</th>
                <th>Bays</th>
                <th>Capacity</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.name}</td>
                  <td>{r.city}</td>
                  <td>
                    <span className={`pill ${r.status === 'Active' ? 'approved' : r.status === 'Approved' ? 'pending' : 'sendback'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.bays}</td>
                  <td>{r.powerKw} kW</td>
                  <td>{r.updated}</td>
                  <td className="text-right">
                    <a href={`/site-owner/sites/${r.id}`} className="btn secondary">
                      Manage
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Applications */}
      <div className="card">
        <div className="card-title">Applications Pipeline</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Site</th>
                <th>Model</th>
                <th>Terms</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="font-semibold">{a.id}</td>
                  <td>{a.site}</td>
                  <td>{a.model}</td>
                  <td>{a.terms}</td>
                  <td>
                    <span
                      className={`pill ${
                        a.status === 'Approved' ? 'approved' : a.status === 'Under Review' ? 'pending' : a.status === 'Rejected' ? 'rejected' : 'sendback'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>{a.date}</td>
                  <td className="text-right">
                    <a href={`/site-owner/applications/${a.id}`} className="btn secondary">
                      Review
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

