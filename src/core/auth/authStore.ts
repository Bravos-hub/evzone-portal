import { create } from 'zustand'
import type { OwnerCapability, Role, UserProfile } from './types'

const LS_KEY = 'evzone:session'
const LS_IMP_KEY = 'evzone:impersonator'

type AuthState = {
  user: UserProfile | null
  impersonator: UserProfile | null
  login: (opts: { role: Role; name?: string; ownerCapability?: OwnerCapability }) => void
  logout: () => void
  startImpersonation: (target: { id: string; name: string; role: Role; ownerCapability?: OwnerCapability }) => void
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

function save(user: UserProfile | null) {
  if (!user) localStorage.removeItem(LS_KEY)
  else localStorage.setItem(LS_KEY, JSON.stringify(user))
}

function saveImpersonator(user: UserProfile | null) {
  if (!user) localStorage.removeItem(LS_IMP_KEY)
  else localStorage.setItem(LS_IMP_KEY, JSON.stringify(user))
}

export const useAuthStore = create<AuthState>((set) => ({
  user: load(),
  impersonator: loadImpersonator(),
  login: ({ role, name, ownerCapability }) => {
    const user: UserProfile = {
      id: 'u_' + Math.random().toString(16).slice(2),
      name: name ?? 'Demo User',
      role,
      ownerCapability,
    }
    save(user)
    saveImpersonator(null)
    set({ user, impersonator: null })
  },
  logout: () => {
    save(null)
    saveImpersonator(null)
    set({ user: null, impersonator: null })
  },
  startImpersonation: (target) => {
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
    save(next)
    set({ impersonator: current, user: next })
  },
  stopImpersonation: () => {
    const imp = loadImpersonator()
    if (!imp) return
    saveImpersonator(null)
    save(imp)
    set({ impersonator: null, user: imp })
  },
}))

