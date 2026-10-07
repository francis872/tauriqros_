import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DexStatus = 'online' | 'available' | 'busy' | 'idle'
export type ContactType = 'personal' | 'business' | 'organization'

export interface DexContact {
  id: string
  name: string
  status: DexStatus
  email?: string
  contactType: ContactType
  avatarColor?: string
  industry?: string
  website?: string
}

export interface DexMessage {
  id: string
  contactId: string
  text: string
  fromMe: boolean
  sentAt: number
  read: boolean
  type: 'chat' | 'email'
  subject?: string
  toEmail?: string
}

function uid() { return Math.random().toString(36).slice(2, 10) }

const INIT_CONTACTS: DexContact[] = [
  { id: 'c1', name: 'Ana López',       status: 'online',    email: 'ana.lopez@MY-LYNK.RB',   contactType: 'personal',     avatarColor: '#6d28d9' },
  { id: 'c2', name: 'Mario Ruiz',      status: 'available', email: 'mario.ruiz@MY-LYNK.RB',  contactType: 'personal',     avatarColor: '#0891b2' },
  { id: 'c3', name: 'Lina Vega',       status: 'busy',      email: 'lina.vega@MY-LYNK.RB',   contactType: 'personal',     avatarColor: '#059669' },
  { id: 'c4', name: 'Acme Corp',       status: 'available', email: 'soporte@MY-LYNK.RB',     contactType: 'business',     avatarColor: '#d97706', industry: 'Tecnología', website: 'https://acme.example' },
  { id: 'c5', name: 'Fundación Salud', status: 'idle',      email: 'fundacion@MY-LYNK.RB',   contactType: 'organization', avatarColor: '#0d9488', industry: 'Salud' },
]

const INIT_MESSAGES: DexMessage[] = [
  { id: 'm1', contactId: 'c1', text: 'Hola, ¿cómo va tu semana?', fromMe: false, sentAt: Date.now() - 3600000, read: true, type: 'chat' },
  { id: 'm2', contactId: 'c3', text: 'Revisa el informe cuando puedas 🙏', fromMe: false, sentAt: Date.now() - 7200000, read: false, type: 'chat' },
  { id: 'm3', contactId: 'c1', text: 'Te envío el resumen de la reunión de ayer. Por favor confirma si los puntos están correctos.', fromMe: false, sentAt: Date.now() - 1800000, read: false, type: 'email', subject: 'Resumen reunión' },
]

interface DexState {
  contacts: DexContact[]
  messages: DexMessage[]
  sendMessage: (contactId: string, text: string) => void
  sendEmail: (contactId: string | null, toEmail: string, subject: string, body: string) => void
  markRead: (contactId: string) => void
  updateStatus: (contactId: string, status: DexStatus) => void
}

export const useDexStore = create<DexState>()(
  persist(
    (set) => ({
      contacts: INIT_CONTACTS,
      messages: INIT_MESSAGES,

      sendMessage(contactId, text) {
        set((s) => ({
          messages: [...s.messages, { id: uid(), contactId, text, fromMe: true, sentAt: Date.now(), read: true, type: 'chat' }],
        }))
      },

      sendEmail(contactId, toEmail, subject, body) {
        const resolvedId = contactId ?? `ext-${uid()}`
        set((s) => ({
          messages: [...s.messages, {
            id: uid(),
            contactId: resolvedId,
            text: body,
            fromMe: true,
            sentAt: Date.now(),
            read: true,
            type: 'email',
            subject,
            toEmail,
          }],
        }))
      },

      markRead(contactId) {
        set((s) => ({
          messages: s.messages.map((m) => m.contactId === contactId ? { ...m, read: true } : m),
        }))
      },

      updateStatus(contactId, status) {
        set((s) => ({
          contacts: s.contacts.map((c) => c.id === contactId ? { ...c, status } : c),
        }))
      },
    }),
    { name: 'balance-dex.v1' },
  ),
)
