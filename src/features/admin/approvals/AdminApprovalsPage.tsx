import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { OnboardingApprovalsPanel } from './OnboardingApprovalsPanel'

export function AdminApprovalsPage() {
  return (
    <DashboardLayout pageTitle="Approvals">
      <OnboardingApprovalsPanel />
    </DashboardLayout>
  )
}
