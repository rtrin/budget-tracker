import { useState, useMemo } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Expense, ExpenseCategory } from '../types'
import { CATEGORY_CONFIG, getDateKey } from '../store'

interface ExpensesViewProps {
  expenses: Expense[]
  onAddExpense: () => void
  onDeleteExpense: (id: string) => void
}

export function ExpensesView({ expenses, onAddExpense, onDeleteExpense }: ExpensesViewProps) {
  const [filter, setFilter] = useState<ExpenseCategory | 'all'>('all')
  const [monthOffset, setMonthOffset] = useState(0)

  const viewDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - monthOffset)
    return d
  }, [monthOffset])

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`

  const monthExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.date.startsWith(monthKey))
    if (filter !== 'all') filtered = filtered.filter(e => e.category === filter)
    return filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [expenses, monthKey, filter])

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Expense[]> = {}
    for (const e of monthExpenses) {
      ;(groups[e.date] ??= []).push(e)
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [monthExpenses])

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of expenses.filter(e => e.date.startsWith(monthKey))) {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [expenses, monthKey])

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const todayKey = getDateKey()
    if (dateStr === todayKey) return 'Today'
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (dateStr === getDateKey(yesterday)) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const categories = Object.entries(CATEGORY_CONFIG) as [ExpenseCategory, typeof CATEGORY_CONFIG[ExpenseCategory]][]

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight mb-1">Expenses</h1>
          <p className="text-text-secondary text-sm">Track your spending</p>
        </div>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-accent text-obsidian text-sm font-semibold
            hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthOffset(monthOffset + 1)}
          className="p-2 rounded-lg hover:bg-white/[0.04] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-display text-xl">{monthLabel}</p>
          <p className="text-rose-accent text-sm font-medium">${monthTotal.toFixed(2)} spent</p>
        </div>
        <button
          onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))}
          disabled={monthOffset === 0}
          className="p-2 rounded-lg hover:bg-white/[0.04] text-text-secondary hover:text-text-primary transition-colors cursor-pointer
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Category Summary */}
      {categoryTotals.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="space-y-2">
            {categoryTotals.map(([cat, total]) => {
              const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
              const pct = monthTotal > 0 ? (total / monthTotal) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs w-24 ${config.color} font-medium`}>{config.label}</span>
                  <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.bg}`}
                      style={{ width: `${pct}%`, opacity: 0.8 }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary w-20 text-right font-medium">${total.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
            ${filter === 'all' ? 'bg-emerald-accent/10 text-emerald-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >
          All
        </button>
        {categories.map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${filter === key ? `${config.bg} ${config.color}` : 'text-text-secondary hover:text-text-primary'}`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Expense List */}
      {groupedByDate.length > 0 ? (
        <div className="space-y-6">
          {groupedByDate.map(([date, dateExpenses]) => {
            const dayTotal = dateExpenses.reduce((s, e) => s + e.amount, 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">{formatDate(date)}</h3>
                  <span className="text-xs text-text-secondary">${dayTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {dateExpenses.map((expense, i) => {
                    const cat = CATEGORY_CONFIG[expense.category]
                    return (
                      <div
                        key={expense.id}
                        className="glass glass-hover rounded-xl px-5 py-3 flex items-center gap-4 group animate-fade-in"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div className={`w-9 h-9 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                          <span className={`text-xs font-bold ${cat.color}`}>{cat.label[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{expense.description}</p>
                          <p className="text-xs text-text-muted">{cat.label}</p>
                        </div>
                        <span className="text-sm font-semibold text-rose-accent">-${expense.amount.toFixed(2)}</span>
                        <button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-rose-accent transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted mb-4">No expenses this month</p>
          <button
            onClick={onAddExpense}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-accent text-obsidian text-sm font-semibold
              hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus size={16} /> Log an Expense
          </button>
        </div>
      )}
    </div>
  )
}
