import type { Role, OwnerCapability } from '@/core/auth/types'

/** All available roles in the system */
export const ALL_ROLES: Role[] = [
  'EVZONE_ADMIN',
  'EVZONE_OPERATOR',
  'SITE_OWNER',
  'OWNER',
  'STATION_ADMIN',
  'MANAGER',
  'ATTENDANT',
  'TECHNICIAN_ORG',
  'TECHNICIAN_PUBLIC',
]

/** Role display names */
export const ROLE_LABELS: Record<Role, string> = {
  EVZONE_ADMIN: 'EVzone Admin',
  EVZONE_OPERATOR: 'EVzone Operator',
  SITE_OWNER: 'Site Owner',
  OWNER: 'Station Owner',
  STATION_ADMIN: 'Station Admin',
  MANAGER: 'Manager',
  ATTENDANT: 'Attendant',
  TECHNICIAN_ORG: 'Technician (Org)',
  TECHNICIAN_PUBLIC: 'Technician (Public)',
}

/** Owner capability labels */
export const CAPABILITY_LABELS: Record<OwnerCapability, string> = {
  CHARGE: 'Charging',
  SWAP: 'Battery Swap',
  BOTH: 'Charging & Swap',
}

/** Role groups for common permission patterns */
export const ROLE_GROUPS = {
  /** Platform admins with full access */
  PLATFORM_ADMINS: ['EVZONE_ADMIN'] as Role[],
  
  /** Platform operators with regional/operational access */
  PLATFORM_OPS: ['EVZONE_ADMIN', 'EVZONE_OPERATOR'] as Role[],
  
  /** Station managers (owners, admins, managers) */
  STATION_MANAGERS: ['OWNER', 'STATION_ADMIN', 'MANAGER'] as Role[],
  
  /** All station-related roles */
  STATION_STAFF: ['OWNER', 'STATION_ADMIN', 'MANAGER', 'ATTENDANT'] as Role[],
  
  /** Technician roles */
  TECHNICIANS: ['TECHNICIAN_ORG', 'TECHNICIAN_PUBLIC'] as Role[],
  
  /** Roles that can view financial data */
  FINANCIAL_VIEWERS: ['EVZONE_ADMIN', 'EVZONE_OPERATOR', 'OWNER', 'SITE_OWNER'] as Role[],
  
  /** Roles that can manage incidents */
  INCIDENT_MANAGERS: ['EVZONE_ADMIN', 'EVZONE_OPERATOR', 'MANAGER'] as Role[],

  /** All authenticated users */
  ALL_AUTHENTICATED: [
    'EVZONE_ADMIN',
    'EVZONE_OPERATOR',
    'SITE_OWNER',
    'OWNER',
    'STATION_ADMIN',
    'MANAGER',
    'ATTENDANT',
    'TECHNICIAN_ORG',
    'TECHNICIAN_PUBLIC',
  ] as Role[],
}

/** Check if role is in a group */
export function isInGroup(role: Role | undefined, group: Role[]): boolean {
  return role ? group.includes(role) : false
}

