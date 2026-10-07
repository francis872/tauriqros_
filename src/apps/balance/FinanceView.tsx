import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useFinanceStore, selectTotals, type TxType } from './financeStore'

const TX_TYPE_LABELS: Record<TxType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  saving: 'Ahorro',
  investment: 'Inversión',
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`
}

export default function FinanceView() {
  const { transactions, categories, addTransaction, deleteTransaction, addCategory, deleteCategory } = useFinanceStore()
  const { income, expense, balance } = selectTotals(transactions)

  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[1] ?? 'Gastos')
  const [account, setAccount] = useState('Cuenta Principal')
  const [description, setDescription] = useState('')
  const [newCategory, setNewCategory] = useState('')

  function handleAdd() {
    const amt = parseFloat(amount)
    if (!amt || isNaN(amt) || amt <= 0) return
    addTransaction({ type, amount: amt, category, account, description })
    setAmount('')
    setDescription('')
  }

  function handleAddCategory() {
    if (!newCategory.trim()) return
    addCategory(newCategory.trim())
    setNewCategory('')
  }

  return (
    <div className="overflow-y-auto p-4 space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-base font-bold text-amber-400">💰 Ecosistema Financiero</h2>
        <p className="text-xs text-slate-500">Control de gastos, ingresos, categorías y cuentas.</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-1">Ingresos</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(income)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-1">Gastos</p>
          <p className="text-2xl font-bold text-red-400">{fmt(expense)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-1">Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>{fmt(balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Form */}
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4 space-y-3">
          <p className="text-sm font-bold text-cyan-400">Registrar transacción</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TxType)}
            aria-label="Tipo de transacción"
            title="Tipo de transacción"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            {(Object.keys(TX_TYPE_LABELS) as TxType[]).map((t) => (
              <option key={t} value={t}>{TX_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto"
            aria-label="Monto"
            min={0}
            className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Categoría"
            title="Categoría"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Cuenta Principal"
            aria-label="Cuenta"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            aria-label="Descripción"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
            className="w-full rounded-xl bg-cyan-500/20 py-2.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/30 disabled:opacity-40"
          >
            Añadir
          </button>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4 space-y-3">
          <p className="text-sm font-bold text-cyan-400">Categorías</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="group flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1 text-xs text-slate-300"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => deleteCategory(cat)}
                  aria-label={`Eliminar ${cat}`}
                  title={`Eliminar ${cat}`}
                  className="hidden group-hover:block text-slate-500 hover:text-red-400"
                >×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nueva categoría"
              aria-label="Nueva categoría"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1 rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-600 disabled:opacity-40"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      {transactions.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-slate-800/40 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-400">Historial</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-slate-900/40 px-3 py-2">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500' : tx.type === 'expense' ? 'bg-red-400' : tx.type === 'saving' ? 'bg-cyan-500' : 'bg-violet-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 truncate">{tx.description || tx.category}</p>
                  <p className="text-[10px] text-slate-500">{tx.account} · {new Date(tx.date).toLocaleDateString('es-ES')}</p>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : tx.type === 'expense' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTransaction(tx.id)}
                  aria-label="Eliminar transacción"
                  title="Eliminar"
                  className="rounded-lg p-1 text-slate-600 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
