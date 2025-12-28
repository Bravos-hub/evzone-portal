import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from './guards'
import { LoginPage } from '@/pages/auth/LoginPage'
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage'
import { HomeRouter } from '@/pages/landing/HomeRouter'

import { AdminDashboard } from '@/features/admin/dashboard/AdminDashboard'
import { AdminApprovalsPage } from '@/features/admin/approvals/AdminApprovalsPage'
import { AdminStationsPage } from '@/features/admin/stations/AdminStationsPage'
import { AdminUsersRolesPage } from '@/features/admin/users/AdminUsersRolesPage'
import { AdminUserDetailPage } from '@/features/admin/users/AdminUserDetailPage'
import { AdminSupportDeskPage } from '@/features/admin/support/AdminSupportDeskPage'
import { AdminIncidentsPage } from '@/features/admin/incidents/AdminIncidentsPage'
import { AdminDispatchesPage } from '@/features/admin/dispatch/AdminDispatchesPage'
import { AdminSystemHealthPage } from '@/features/admin/health/AdminSystemHealthPage'
import { AdminAuditLogsPage } from '@/features/admin/audit/AdminAuditLogsPage'
import { AdminBillingPage } from '@/features/admin/billing/AdminBillingPage'
import { AdminReportsExportsPage } from '@/features/admin/reports/AdminReportsExportsPage'
import { AdminCrmPage } from '@/features/admin/crm/AdminCrmPage'
import { AdminOCPIPage } from '@/features/admin/ocpi/AdminOCPIPage'
import { AdminOCPPQueuePage } from '@/features/admin/ocpp/AdminOCPPQueuePage'
import { AdminWebhooksLogPage } from '@/features/admin/webhooks/AdminWebhooksLogPage'
import { AdminMQTTPage } from '@/features/admin/mqtt/AdminMQTTPage'
import { AdminBroadcastsPage } from '@/features/admin/broadcasts/AdminBroadcastsPage'
import { AdminStatusPage } from '@/features/admin/status/AdminStatusPage'
import { AdminGlobalConfigPage } from '@/features/admin/settings/AdminGlobalConfigPage'
import { AdminNotificationsCenterPage } from '@/features/admin/notifications/AdminNotificationsCenterPage'
import { AdminDisputesRefundsPage } from '@/features/admin/disputes/AdminDisputesRefundsPage'
import { AdminKycCompliancePage } from '@/features/admin/kyc/AdminKycCompliancePage'
import { OperatorDashboard } from '@/features/operator/dashboard/OperatorDashboard'
import { OperatorSessionsPage } from '@/features/operator/sessions/OperatorSessionsPage'
import { OperatorStationsPage } from '@/features/operator/stations/OperatorStationsPage'
import { OperatorTeamPage } from '@/features/operator/team/OperatorTeamPage'
import { SiteOwnerDashboard } from '@/features/siteOwner/dashboard/SiteOwnerDashboard'
import { SiteOwnerSitesPage } from '@/features/siteOwner/sites/SiteOwnerSitesPage'
import { SettingsWebhooksPage } from '@/features/settings/SettingsWebhooksPage'
import { TechnicianJobsPage } from '@/features/technician/jobs/TechnicianJobsPage'
import { OwnerChargeDashboard } from '@/features/owner/dashboards/OwnerChargeDashboard'
import { OwnerSwapDashboard } from '@/features/owner/dashboards/OwnerSwapDashboard'
import { OwnerBothDashboard } from '@/features/owner/dashboards/OwnerBothDashboard'
import { OwnerSessionsPage } from '@/features/owner/sessions/OwnerSessionsPage'
import { OwnerSwapBookingsPage } from '@/features/owner/bookings/OwnerSwapBookingsPage'
import { OwnerTariffsPage } from '@/features/owner/tariffs/OwnerTariffsPage'
import { OwnerTeamPage } from '@/features/owner/team/OwnerTeamPage'
import { OwnerChargePointsPage } from '@/features/owner/chargePoints/OwnerChargePointsPage'
import { OwnerSwapStationsPage } from '@/features/owner/swapStations/OwnerSwapStationsPage'
import { OwnerEarningsPage } from '@/features/owner/earnings/OwnerEarningsPage'
import { OwnerReportsPage } from '@/features/owner/reports/OwnerReportsPage'
import { OwnerSmartChargingPage } from '@/features/owner/smart/OwnerSmartChargingPage'
import { OwnerLoadPage } from '@/features/owner/load/OwnerLoadPage'
import { StationAdminDashboard } from '@/features/stationAdmin/dashboard/StationAdminDashboard'
import { ManagerDashboard } from '@/features/manager/dashboard/ManagerDashboard'
import { AttendantDashboard } from '@/features/attendant/dashboard/AttendantDashboard'
import { TechnicianOrgDashboard } from '@/features/technician/org/TechnicianOrgDashboard'
import { TechnicianPublicDashboard } from '@/features/technician/public/TechnicianPublicDashboard'

import { PlaceholderPage } from '@/pages/errors/PlaceholderPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRouter />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireRole roles={['EVZONE_ADMIN']}>
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route path="/admin/approvals" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminApprovalsPage /></RequireRole>} />
      <Route path="/admin/stations" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminStationsPage /></RequireRole>} />
      <Route path="/admin/users" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminUsersRolesPage /></RequireRole>} />
      <Route path="/admin/users/:id" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminUserDetailPage /></RequireRole>} />
      <Route path="/admin/support" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminSupportDeskPage /></RequireRole>} />
      <Route path="/admin/health" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminSystemHealthPage /></RequireRole>} />
      <Route path="/admin/audit" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminAuditLogsPage /></RequireRole>} />
      <Route path="/admin/billing" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminBillingPage /></RequireRole>} />
      <Route path="/admin/reports" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminReportsExportsPage /></RequireRole>} />
      <Route path="/admin/crm" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminCrmPage /></RequireRole>} />
      <Route path="/admin/incidents" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminIncidentsPage /></RequireRole>} />
      <Route path="/admin/dispatches" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminDispatchesPage /></RequireRole>} />
      <Route path="/admin/ocpi" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminOCPIPage /></RequireRole>} />
      <Route path="/admin/ocpp" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminOCPPQueuePage /></RequireRole>} />
      <Route path="/admin/webhooks" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminWebhooksLogPage /></RequireRole>} />
      <Route path="/admin/mqtt" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminMQTTPage /></RequireRole>} />
      <Route path="/admin/broadcasts" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminBroadcastsPage /></RequireRole>} />
      <Route path="/admin/status" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminStatusPage /></RequireRole>} />
      <Route path="/admin/settings" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminGlobalConfigPage /></RequireRole>} />
      <Route path="/admin/notifications" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminNotificationsCenterPage /></RequireRole>} />
      <Route path="/admin/disputes" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminDisputesRefundsPage /></RequireRole>} />
      <Route path="/admin/kyc" element={<RequireRole roles={['EVZONE_ADMIN']}><AdminKycCompliancePage /></RequireRole>} />
      <Route path="/admin/:section" element={<RequireRole roles={['EVZONE_ADMIN']}><PlaceholderPage /></RequireRole>} />

      {/* Operator */}
      <Route
        path="/operator"
        element={
          <RequireRole roles={['EVZONE_OPERATOR']}>
            <OperatorDashboard />
          </RequireRole>
        }
      />
      <Route path="/operator/sessions" element={<RequireRole roles={['EVZONE_OPERATOR']}><OperatorSessionsPage /></RequireRole>} />
      <Route path="/operator/stations" element={<RequireRole roles={['EVZONE_OPERATOR']}><OperatorStationsPage /></RequireRole>} />
      <Route path="/operator/team" element={<RequireRole roles={['EVZONE_OPERATOR']}><OperatorTeamPage /></RequireRole>} />
      <Route path="/operator/:section" element={<RequireRole roles={['EVZONE_OPERATOR']}><PlaceholderPage /></RequireRole>} />

      {/* Site owner */}
      <Route path="/site-owner" element={<RequireRole roles={['SITE_OWNER']}><SiteOwnerDashboard /></RequireRole>} />
      <Route path="/site-owner/sites" element={<RequireRole roles={['SITE_OWNER']}><SiteOwnerSitesPage /></RequireRole>} />
      <Route path="/site-owner/:section" element={<RequireRole roles={['SITE_OWNER']}><PlaceholderPage /></RequireRole>} />

      {/* Settings (all roles) */}
      <Route path="/settings/webhooks" element={<RequireAuth><SettingsWebhooksPage /></RequireAuth>} />

      {/* Station owner variants */}
      <Route path="/owner/charge" element={<RequireRole roles={['OWNER']}><OwnerChargeDashboard /></RequireRole>} />
      <Route path="/owner/charge/sessions" element={<RequireRole roles={['OWNER']}><OwnerSessionsPage /></RequireRole>} />
      <Route path="/owner/charge/connectors" element={<RequireRole roles={['OWNER']}><OwnerChargePointsPage /></RequireRole>} />
      <Route path="/owner/charge/pricing" element={<RequireRole roles={['OWNER']}><OwnerTariffsPage /></RequireRole>} />
      <Route path="/owner/charge/smart" element={<RequireRole roles={['OWNER']}><OwnerSmartChargingPage /></RequireRole>} />
      <Route path="/owner/charge/team" element={<RequireRole roles={['OWNER']}><OwnerTeamPage /></RequireRole>} />
      <Route path="/owner/charge/billing" element={<RequireRole roles={['OWNER']}><OwnerEarningsPage /></RequireRole>} />
      <Route path="/owner/charge/reports" element={<RequireRole roles={['OWNER']}><OwnerReportsPage /></RequireRole>} />
      <Route path="/owner/charge/:section" element={<RequireRole roles={['OWNER']}><PlaceholderPage /></RequireRole>} />
      <Route path="/owner/swap" element={<RequireRole roles={['OWNER']}><OwnerSwapDashboard /></RequireRole>} />
      <Route path="/owner/swap/stations" element={<RequireRole roles={['OWNER']}><OwnerSwapStationsPage /></RequireRole>} />
      <Route path="/owner/swap/bookings" element={<RequireRole roles={['OWNER']}><OwnerSwapBookingsPage /></RequireRole>} />
      <Route path="/owner/swap/pricing" element={<RequireRole roles={['OWNER']}><OwnerTariffsPage /></RequireRole>} />
      <Route path="/owner/swap/team" element={<RequireRole roles={['OWNER']}><OwnerTeamPage /></RequireRole>} />
      <Route path="/owner/swap/billing" element={<RequireRole roles={['OWNER']}><OwnerEarningsPage /></RequireRole>} />
      <Route path="/owner/swap/reports" element={<RequireRole roles={['OWNER']}><OwnerReportsPage /></RequireRole>} />
      <Route path="/owner/swap/:section" element={<RequireRole roles={['OWNER']}><PlaceholderPage /></RequireRole>} />
      <Route path="/owner/both" element={<RequireRole roles={['OWNER']}><OwnerBothDashboard /></RequireRole>} />
      <Route path="/owner/both/sessions" element={<RequireRole roles={['OWNER']}><OwnerSessionsPage /></RequireRole>} />
      <Route path="/owner/both/stations" element={<RequireRole roles={['OWNER']}><OwnerSwapStationsPage /></RequireRole>} />
      <Route path="/owner/both/connectors" element={<RequireRole roles={['OWNER']}><OwnerChargePointsPage /></RequireRole>} />
      <Route path="/owner/both/bookings" element={<RequireRole roles={['OWNER']}><OwnerSwapBookingsPage /></RequireRole>} />
      <Route path="/owner/both/pricing" element={<RequireRole roles={['OWNER']}><OwnerTariffsPage /></RequireRole>} />
      <Route path="/owner/both/team" element={<RequireRole roles={['OWNER']}><OwnerTeamPage /></RequireRole>} />
      <Route path="/owner/both/billing" element={<RequireRole roles={['OWNER']}><OwnerEarningsPage /></RequireRole>} />
      <Route path="/owner/both/reports" element={<RequireRole roles={['OWNER']}><OwnerReportsPage /></RequireRole>} />
      <Route path="/owner/both/:section" element={<RequireRole roles={['OWNER']}><PlaceholderPage /></RequireRole>} />

      {/* Station admin */}
      <Route path="/station-admin" element={<RequireRole roles={['STATION_ADMIN']}><StationAdminDashboard /></RequireRole>} />
      <Route path="/station-admin/:section" element={<RequireRole roles={['STATION_ADMIN']}><PlaceholderPage /></RequireRole>} />

      {/* Manager */}
      <Route path="/manager" element={<RequireRole roles={['MANAGER']}><ManagerDashboard /></RequireRole>} />
      <Route path="/manager/:section" element={<RequireRole roles={['MANAGER']}><PlaceholderPage /></RequireRole>} />

      {/* Attendant */}
      <Route path="/attendant" element={<RequireRole roles={['ATTENDANT']}><AttendantDashboard /></RequireRole>} />
      <Route path="/attendant/:section" element={<RequireRole roles={['ATTENDANT']}><PlaceholderPage /></RequireRole>} />

      {/* Technician */}
      <Route path="/technician/org" element={<RequireRole roles={['TECHNICIAN_ORG']}><TechnicianOrgDashboard /></RequireRole>} />
      <Route path="/technician/org/jobs" element={<RequireRole roles={['TECHNICIAN_ORG']}><TechnicianJobsPage /></RequireRole>} />
      <Route path="/technician/org/:section" element={<RequireRole roles={['TECHNICIAN_ORG']}><PlaceholderPage /></RequireRole>} />
      <Route path="/technician/public" element={<RequireRole roles={['TECHNICIAN_PUBLIC']}><TechnicianPublicDashboard /></RequireRole>} />
      <Route path="/technician/public/jobs" element={<RequireRole roles={['TECHNICIAN_PUBLIC']}><TechnicianJobsPage /></RequireRole>} />
      <Route path="/technician/public/:section" element={<RequireRole roles={['TECHNICIAN_PUBLIC']}><PlaceholderPage /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

