import type { Role, RegionId } from '@/core/auth/types'
import type { ApprovalStatus } from '@/ui/components/StatusPill'

export type UserStatus = 'Active' | 'Suspended' | 'Pending'

export type UserRow = {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  status: UserStatus
  region: RegionId | 'ALL'
  orgId: string | '—'
  stations: string[]
  lastActive: string
  createdAt: string
  approvalStatus?: ApprovalStatus
  mfaEnabled?: boolean
}

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

export const regions: Array<{ id: RegionId | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All Regions' },
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'AMERICAS', label: 'Americas' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'MIDDLE_EAST', label: 'Middle East' },
]

const seed: UserRow[] = [
  {
    id: 'U-0001',
    name: 'Delta',
    email: 'delta@evzone.app',
    phone: '+256 7xx xxx xxx',
    role: 'EVZONE_ADMIN',
    status: 'Active',
    region: 'ALL',
    orgId: '—',
    stations: [],
    lastActive: '2m ago',
    createdAt: '2025-03-02',
    mfaEnabled: true,
  },
  {
    id: 'U-0042',
    name: 'Jon Ops',
    email: 'jon@sunrun.com',
    phone: '+256 7xx xxx xxx',
    role: 'EVZONE_OPERATOR',
    status: 'Active',
    region: 'AFRICA',
    orgId: 'SUNRUN_OPS',
    stations: ['ST-0001', 'ST-0002', 'ST-0092'],
    lastActive: '14m ago',
    createdAt: '2025-06-18',
    mfaEnabled: true,
  },
  {
    id: 'U-0112',
    name: 'Sarah Owner',
    email: 'sarah@volt.co',
    phone: '+256 7xx xxx xxx',
    role: 'OWNER',
    status: 'Active',
    region: 'AFRICA',
    orgId: 'VOLT_MOBILITY',
    stations: ['ST-0001', 'ST-0017'],
    lastActive: '1h ago',
    createdAt: '2025-07-01',
    mfaEnabled: false,
  },
  {
    id: 'U-0180',
    name: 'Grace SiteOwner',
    email: 'grace@mall.com',
    phone: '+256 7xx xxx xxx',
    role: 'SITE_OWNER',
    status: 'Active',
    region: 'AFRICA',
    orgId: 'MALL_HOLDINGS',
    stations: [],
    lastActive: '3d ago',
    createdAt: '2025-08-22',
    mfaEnabled: true,
  },
  {
    id: 'U-0208',
    name: 'Allan Tech',
    email: 'allan@tech.me',
    phone: '+256 7xx xxx xxx',
    role: 'TECHNICIAN_PUBLIC',
    status: 'Pending',
    region: 'AFRICA',
    orgId: '—',
    stations: [],
    lastActive: '—',
    createdAt: '2025-11-04',
    approvalStatus: 'Pending',
    mfaEnabled: false,
  },
  {
    id: 'U-0255',
    name: 'Mary Manager',
    email: 'mary@volt.co',
    phone: '+256 7xx xxx xxx',
    role: 'MANAGER',
    status: 'Active',
    region: 'AFRICA',
    orgId: 'VOLT_MOBILITY',
    stations: ['ST-0001'],
    lastActive: '20m ago',
    createdAt: '2025-10-10',
    mfaEnabled: false,
  },
  {
    id: 'U-0261',
    name: 'Asha Attendant',
    email: 'asha@volt.co',
    phone: '+256 7xx xxx xxx',
    role: 'ATTENDANT',
    status: 'Suspended',
    region: 'AFRICA',
    orgId: 'VOLT_MOBILITY',
    stations: ['ST-0001'],
    lastActive: '10d ago',
    createdAt: '2025-10-14',
    mfaEnabled: false,
  },
]

function keyFor(id: string) {
  return `mock.user.${id}`
}

function readOverride(id: string): Partial<UserRow> | null {
  try {
    const raw = localStorage.getItem(keyFor(id))
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<UserRow>
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

function applyOverride(u: UserRow): UserRow {
  if (typeof window === 'undefined') return u
  const o = readOverride(u.id)
  return o ? { ...u, ...o } : u
}

export async function apiListUsers(): Promise<UserRow[]> {
  await new Promise((r) => setTimeout(r, 140))
  return seed.map(applyOverride)
}

export async function apiGetUser(id: string): Promise<UserRow | null> {
  await new Promise((r) => setTimeout(r, 120))
  const found = seed.find((u) => u.id.toLowerCase() === id.toLowerCase()) ?? null
  return found ? applyOverride(found) : null
}

export async function apiUpdateUser(id: string, patch: Partial<UserRow>): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 220))
  if (typeof window !== 'undefined') {
    const prev = readOverride(id) ?? {}
    localStorage.setItem(keyFor(id), JSON.stringify({ ...prev, ...patch }))
  }
  return { ok: true }
}


