import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccountType = 'personal' | 'business' | 'organization'

export interface MyLynkAccount {
  id: string
  displayName: string
  email: string
  createdAt: number
  connectedApps: string[]
  accountType: AccountType
  avatarColor: string
  bio?: string
  phone?: string
  // Business & Organization extras
  companyName?: string
  industry?: string
  website?: string
}

export interface RegisterExtra {
  accountType?: AccountType
  avatarColor?: string
  bio?: string
  phone?: string
  companyName?: string
  industry?: string
  website?: string
}

interface StoredAccount extends MyLynkAccount {
  _hash: string
}

interface MyLynkAuthState {
  currentAccount: MyLynkAccount | null
  _accounts: StoredAccount[]
  register: (displayName: string, email: string, password: string, extra?: RegisterExtra) => { ok: boolean; error?: string }
  login: (email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  connectApp: (appId: string) => void
  updateProfile: (patch: Partial<Pick<MyLynkAccount, 'displayName' | 'bio' | 'phone' | 'website' | 'industry' | 'avatarColor'>>) => void
}

const DOMAIN = '@MY-LYNK.RB'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// Simple local hash — suitable for a local desktop app (not a production web service)
function hashPw(password: string, email: string): string {
  return btoa(encodeURIComponent(password + '::' + email.toLowerCase()))
}

/** Accepts either "user" or "user@MY-LYNK.RB" and always returns "user@MY-LYNK.RB" (lowercase). */
function normalizeEmail(input: string): string {
  const stripped = input.trim().toLowerCase().replace(/@my-lynk\.rb$/i, '')
  return stripped + DOMAIN.toLowerCase()
}

function toPublic(account: StoredAccount): MyLynkAccount {
  const { _hash: _ignored, ...pub } = account
  return pub
}

export const useMyLynkAuth = create<MyLynkAuthState>()(
  persist(
    (set, get) => ({
      currentAccount: null,
      _accounts: [],

      register(displayName, email, password, extra = {}) {
        if (!displayName.trim() || !email.trim() || !password) {
          return { ok: false, error: 'Todos los campos son requeridos.' }
        }
        const username = email.trim().toLowerCase().replace(/@my-lynk\.rb$/i, '')
        if (!/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/.test(username)) {
          return { ok: false, error: 'El usuario solo puede contener letras, números, puntos y guiones (mín. 3 caracteres).' }
        }
        if (password.length < 6) {
          return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
        }
        const fullEmail = normalizeEmail(email)
        const { _accounts } = get()
        if (_accounts.some((a) => a.email === fullEmail)) {
          return { ok: false, error: 'Ya existe una cuenta con ese nombre de usuario.' }
        }
        const stored: StoredAccount = {
          id: uid(),
          displayName: displayName.trim(),
          email: fullEmail,
          createdAt: Date.now(),
          connectedApps: [],
          accountType: extra.accountType ?? 'personal',
          avatarColor: extra.avatarColor ?? '#6d28d9',
          bio: extra.bio?.trim() || undefined,
          phone: extra.phone?.trim() || undefined,
          companyName: extra.companyName?.trim() || undefined,
          industry: extra.industry || undefined,
          website: extra.website?.trim() || undefined,
          _hash: hashPw(password, fullEmail),
        }
        set((s) => ({
          _accounts: [...s._accounts, stored],
          currentAccount: toPublic(stored),
        }))
        return { ok: true }
      },

      login(email, password) {
        const fullEmail = normalizeEmail(email)
        const { _accounts } = get()
        const found = _accounts.find((a) => a.email === fullEmail)
        if (!found) {
          return { ok: false, error: 'No existe una cuenta con ese usuario.' }
        }
        if (found._hash !== hashPw(password, fullEmail)) {
          return { ok: false, error: 'Contraseña incorrecta.' }
        }
        set({ currentAccount: toPublic(found) })
        return { ok: true }
      },

      logout() {
        set({ currentAccount: null })
      },

      connectApp(appId) {
        const { currentAccount, _accounts } = get()
        if (!currentAccount) return
        if (currentAccount.connectedApps.includes(appId)) return
        const updated = { ...currentAccount, connectedApps: [...currentAccount.connectedApps, appId] }
        set({
          currentAccount: updated,
          _accounts: _accounts.map((a) =>
            a.id === currentAccount.id ? { ...a, connectedApps: updated.connectedApps } : a
          ),
        })
      },

      updateProfile(patch) {
        const { currentAccount, _accounts } = get()
        if (!currentAccount) return
        const updated = { ...currentAccount, ...patch }
        set({
          currentAccount: updated,
          _accounts: _accounts.map((a) =>
            a.id === currentAccount.id ? { ...a, ...patch } : a
          ),
        })
      },
    }),
    { name: 'mylynk-auth.v3' }
  )
)
