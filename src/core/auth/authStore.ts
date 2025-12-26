import { create } from 'zustand'
import type { OwnerCapability, Role, UserProfile } from './types'

const LS_KEY = 'evzone:session'

type AuthState = {
  user: UserProfile | null
  login: (opts: { role: Role; name?: string; ownerCapability?: OwnerCapability }) => void
  logout: () => void
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

function save(user: UserProfile | null) {
  if (!user) localStorage.removeItem(LS_KEY)
  else localStorage.setItem(LS_KEY, JSON.stringify(user))
}

export const useAuthStore = create<AuthState>((set) => ({
  user: load(),
  login: ({ role, name, ownerCapability }) => {
    const user: UserProfile = {
      id: 'u_' + Math.random().toString(16).slice(2),
      name: name ?? 'Demo User',
      role,
      ownerCapability,
    }
    save(user)
    set({ user })
  },
  logout: () => {
    save(null)
    set({ user: null })
  },
}))

