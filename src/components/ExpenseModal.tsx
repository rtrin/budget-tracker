import { useState } from 'react'
import { X } from 'lucide-react'
import type { Expense, ExpenseCategory, Account } from '../types'
import { CATEGORY_CONFIG, getDateKey } from '../store'

interface ExpenseModalProps {
  accounts: Account[]
  onSave: (expense: Expense) => void
  onClose: () => void
}

const categories = Object.entries(CATEGORY_CONFIG) as [ExpenseCategory, typeof CATEGORY_CONFIG[ExpenseCategory]][]

export function ExpenseModal({ accounts, onSave, onClose }: ExpenseModalProps) {
  const spendableAccounts = accounts.filter(a => a.type !== 'liability')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [date, setDate] = useState(getDateKey())
  const [accountId, setAccountId] = useState(spendableAccounts[0]?.id ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!description.trim() || isNaN(parsed) || parsed <= 0) return

    onSave({
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: Math.round(parsed * 100) / 100,
      category,
      date,
      accountId: accountId || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Log Expense</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Culver's, DoorDash..."
              className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40 transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-surface-raised border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm text-text-primary
                    placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                  focus:outline-none focus:border-emerald-accent/40 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Pay From</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                focus:outline-none focus:border-emerald-accent/40 transition-colors [color-scheme:dark] cursor-pointer"
            >
              {spendableAccounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} — ${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`
                    px-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-center
                    ${category === key
                      ? `${config.bg} ${config.color} border border-current/20`
                      : 'bg-surface-raised border border-border text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!description.trim() || !amount || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-xl bg-emerald-accent text-obsidian text-sm font-semibold
              hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Log Expense
          </button>
        </form>
      </div>
    </div>
  )
}
