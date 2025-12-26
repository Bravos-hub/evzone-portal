import { create } from 'zustand'
import type { OwnerCapability, Role, UserProfile } from './types'

const LS_KEY = 'evzone:session'
const LS_ACT_AS_KEY = 'evzone:actAs'
const LS_ACT_AS_RETURN_KEY = 'evzone:actAs:returnTo'

type AuthState = {
  user: UserProfile | null
  actingAs: { id: string; name: string; role: Role; ownerCapability?: OwnerCapability } | null
  actAsReturnTo: string | null
  login: (opts: { role: Role; name?: string; ownerCapability?: OwnerCapability }) => void
  logout: () => void
  startActAs: (target: { id: string; name: string; role: Role; ownerCapability?: OwnerCapability }, returnTo: string) => void
  stopActAs: () => void
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

function loadActAs(): AuthState['actingAs'] {
  try {
    const raw = localStorage.getItem(LS_ACT_AS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthState['actingAs']
  } catch {
    return null
  }
}

function loadReturnTo(): string | null {
  try {
    return localStorage.getItem(LS_ACT_AS_RETURN_KEY)
  } catch {
    return null
  }
}

function save(user: UserProfile | null) {
  if (!user) localStorage.removeItem(LS_KEY)
  else localStorage.setItem(LS_KEY, JSON.stringify(user))
}

function saveActAs(value: AuthState['actingAs']) {
  if (!value) localStorage.removeItem(LS_ACT_AS_KEY)
  else localStorage.setItem(LS_ACT_AS_KEY, JSON.stringify(value))
}

function saveReturnTo(value: string | null) {
  if (!value) localStorage.removeItem(LS_ACT_AS_RETURN_KEY)
  else localStorage.setItem(LS_ACT_AS_RETURN_KEY, value)
}

export const useAuthStore = create<AuthState>((set) => ({
  user: load(),
  actingAs: loadActAs(),
  actAsReturnTo: loadReturnTo(),
  login: ({ role, name, ownerCapability }) => {
    const user: UserProfile = {
      id: 'u_' + Math.random().toString(16).slice(2),
      name: name ?? 'Demo User',
      role,
      ownerCapability,
    }
    save(user)
    saveActAs(null)
    saveReturnTo(null)
    set({ user, actingAs: null, actAsReturnTo: null })
  },
  logout: () => {
    save(null)
    saveActAs(null)
    saveReturnTo(null)
    set({ user: null, actingAs: null, actAsReturnTo: null })
  },
  startActAs: (target, returnTo) => {
    const current = load()
    if (!current) return
    // only allow admins to act-as in this demo
    if (current.role !== 'EVZONE_ADMIN') return

    const next = { ...target }
    saveActAs(next)
    saveReturnTo(returnTo)
    set({ actingAs: next, actAsReturnTo: returnTo })
  },
  stopActAs: () => {
    saveActAs(null)
    saveReturnTo(null)
    set({ actingAs: null, actAsReturnTo: null })
  },
}))

