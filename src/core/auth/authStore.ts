import { create } from 'zustand'
import type { OwnerCapability, Role, UserProfile } from './types'

const LS_KEY = 'evzone:session'
const LS_IMP_KEY = 'evzone:impersonator'
const LS_IMP_RETURN_KEY = 'evzone:impersonation:returnTo'

type AuthState = {
  user: UserProfile | null
  impersonator: UserProfile | null
  impersonationReturnTo: string | null
  login: (opts: { role: Role; name?: string; ownerCapability?: OwnerCapability }) => void
  logout: () => void
  startImpersonation: (target: { id: string; name: string; role: Role; ownerCapability?: OwnerCapability }, returnTo: string) => void
  stopImpersonation: () => void
}

function load(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

function loadImpersonator(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LS_IMP_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

function loadReturnTo(): string | null {
  try {
    return localStorage.getItem(LS_IMP_RETURN_KEY)
  } catch {
    return null
  }
}

function save(user: UserProfile | null) {
  if (!user) localStorage.removeItem(LS_KEY)
  else localStorage.setItem(LS_KEY, JSON.stringify(user))
}

function saveImpersonator(user: UserProfile | null) {
  if (!user) localStorage.removeItem(LS_IMP_KEY)
  else localStorage.setItem(LS_IMP_KEY, JSON.stringify(user))
}

function saveReturnTo(value: string | null) {
  if (!value) localStorage.removeItem(LS_IMP_RETURN_KEY)
  else localStorage.setItem(LS_IMP_RETURN_KEY, value)
}

export const useAuthStore = create<AuthState>((set) => ({
  user: load(),
  impersonator: loadImpersonator(),
  impersonationReturnTo: loadReturnTo(),
  login: ({ role, name, ownerCapability }) => {
    const user: UserProfile = {
      id: 'u_' + Math.random().toString(16).slice(2),
      name: name ?? 'Demo User',
      role,
      ownerCapability,
    }
    save(user)
    saveImpersonator(null)
    saveReturnTo(null)
    set({ user, impersonator: null, impersonationReturnTo: null })
  },
  logout: () => {
    save(null)
    saveImpersonator(null)
    saveReturnTo(null)
    set({ user: null, impersonator: null, impersonationReturnTo: null })
  },
  startImpersonation: (target, returnTo) => {
    const current = load()
    if (!current) return
    // only allow admins to impersonate in this demo
    if (current.role !== 'EVZONE_ADMIN') return

    const next: UserProfile = {
      id: target.id,
      name: target.name,
      role: target.role,
      ownerCapability: target.ownerCapability,
    }

    saveImpersonator(current)
    saveReturnTo(returnTo)
    save(next)
    set({ impersonator: current, impersonationReturnTo: returnTo, user: next })
  },
  stopImpersonation: () => {
    const imp = loadImpersonator()
    if (!imp) return
    saveImpersonator(null)
    saveReturnTo(null)
    save(imp)
    set({ impersonator: null, impersonationReturnTo: null, user: imp })
  },
}))

