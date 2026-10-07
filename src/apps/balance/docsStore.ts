import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DocSheet {
  id: string
  name: string
  content: string
}

export interface BalanceDoc {
  id: string
  title: string
  sheets: DocSheet[]
  createdAt: number
  updatedAt: number
}

function uid() { return Math.random().toString(36).slice(2, 10) }

const WELCOME: BalanceDoc = {
  id: 'welcome',
  title: 'Bienvenida',
  sheets: [{
    id: 'welcome-s1',
    name: 'Hoja 1',
    content: '<h1 style="font-size:1.5rem;font-weight:700;color:#e2e8f0;margin-bottom:8px">Bienvenido a Document Suite</h1><p style="color:#94a3b8">Crea, edita y guarda documentos con múltiples hojas.</p>',
  }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

interface DocsState {
  docs: BalanceDoc[]
  createDoc: () => string
  deleteDoc: (id: string) => void
  updateSheet: (docId: string, sheetId: string, content: string) => void
  updateDocTitle: (docId: string, title: string) => void
  addSheet: (docId: string) => void
  deleteSheet: (docId: string, sheetId: string) => void
  renameSheet: (docId: string, sheetId: string, name: string) => void
}

export const useDocsStore = create<DocsState>()(
  persist(
    (set) => ({
      docs: [WELCOME],

      createDoc() {
        const id = uid()
        set((s) => ({
          docs: [...s.docs, {
            id,
            title: 'Nuevo documento',
            sheets: [{ id: uid(), name: 'Hoja 1', content: '' }],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }],
        }))
        return id
      },

      deleteDoc(id) {
        set((s) => ({ docs: s.docs.filter((d) => d.id !== id && d.id !== 'welcome') }))
      },

      updateSheet(docId, sheetId, content) {
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === docId
              ? { ...d, sheets: d.sheets.map((sh) => sh.id === sheetId ? { ...sh, content } : sh), updatedAt: Date.now() }
              : d,
          ),
        }))
      },

      updateDocTitle(docId, title) {
        set((s) => ({
          docs: s.docs.map((d) => d.id === docId ? { ...d, title, updatedAt: Date.now() } : d),
        }))
      },

      addSheet(docId) {
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === docId
              ? { ...d, sheets: [...d.sheets, { id: uid(), name: `Hoja ${d.sheets.length + 1}`, content: '' }], updatedAt: Date.now() }
              : d,
          ),
        }))
      },

      deleteSheet(docId, sheetId) {
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === docId && d.sheets.length > 1
              ? { ...d, sheets: d.sheets.filter((sh) => sh.id !== sheetId), updatedAt: Date.now() }
              : d,
          ),
        }))
      },

      renameSheet(docId, sheetId, name) {
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === docId
              ? { ...d, sheets: d.sheets.map((sh) => sh.id === sheetId ? { ...sh, name } : sh) }
              : d,
          ),
        }))
      },
    }),
    { name: 'balance-docs.v1' },
  ),
)
