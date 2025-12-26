import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/core/auth/authStore'
import type { Role } from '@/core/auth/types'

export function RequireAuth({ children }: PropsWithChildren) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

export function RequireRole({ roles, children }: PropsWithChildren<{ roles: Role[] }>) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}

