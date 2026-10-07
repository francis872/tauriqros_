import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TxType = 'income' | 'expense' | 'saving' | 'investment'

export interface Transaction {
  id: string
  type: TxType
  amount: number
  category: string
  account: string
  description: string
  date: number
}

interface FinanceState {
  transactions: Transaction[]
  categories: string[]
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void
  deleteTransaction: (id: string) => void
  addCategory: (name: string) => void
  deleteCategory: (name: string) => void
}

function uid() { return Math.random().toString(36).slice(2, 10) }

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      categories: ['Ingresos', 'Gastos', 'Ahorro', 'Inversión'],

      addTransaction(partial) {
        set((s) => ({
          transactions: [{ ...partial, id: uid(), date: Date.now() }, ...s.transactions],
        }))
      },

      deleteTransaction(id) {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
      },

      addCategory(name) {
        if (!name.trim()) return
        set((s) => ({ categories: [...new Set([...s.categories, name.trim()])] }))
      },

      deleteCategory(name) {
        set((s) => ({ categories: s.categories.filter((c) => c !== name) }))
      },
    }),
    { name: 'balance-finance.v1' },
  ),
)

export function selectTotals(transactions: Transaction[]) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense }
}

export function selectBudgetDeviation(transactions: Transaction[]) {
  const { income } = selectTotals(transactions)
  if (!income) return { needs: -50, wants: -30, savings: -20 }
  const needs = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const wants = transactions.filter((t) => t.type === 'investment').reduce((s, t) => s + t.amount, 0)
  const savings = transactions.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0)
  return {
    needs: Math.round((needs / income) * 100 - 50),
    wants: Math.round((wants / income) * 100 - 30),
    savings: Math.round((savings / income) * 100 - 20),
  }
}
