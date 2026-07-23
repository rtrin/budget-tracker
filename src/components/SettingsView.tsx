import { useState, useRef } from 'react'
import { Download, Upload, Trash2, AlertTriangle, DollarSign, Plus, X } from 'lucide-react'
import type { AppState, ExpenseCategory, CustomBudget, SavingsGoal } from '../types'
import { CATEGORY_CONFIG } from '../store'

interface SettingsViewProps {
  dailyBudget: number
  budgets: CustomBudget[]
  savingsGoals: SavingsGoal[]
  onSetDailyBudget: (budget: number) => void
  onAddBudget: (budget: CustomBudget) => void
  onUpdateBudget: (budget: CustomBudget) => void
  onDeleteBudget: (id: string) => void
  onAddSavingsGoal: (goal: SavingsGoal) => void
  onDeleteSavingsGoal: (id: string) => void
  onExport: () => void
  onImport: (data: AppState) => void
  onClear: () => void
  addToast: (message: string, type: 'success' | 'info' | 'error') => void
}

const allCategories = Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]

function BudgetForm({ onSave, onCancel }: { onSave: (b: CustomBudget) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [cats, setCats] = useState<ExpenseCategory[]>([])

  const toggle = (cat: ExpenseCategory) =>
    setCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const submit = () => {
    if (!name.trim() || cats.length === 0) return
    onSave({ id: crypto.randomUUID(), name: name.trim(), monthlyLimit: parseFloat(limit) || 0, categories: cats })
  }

  return (
    <div className="glass rounded-xl p-4 space-y-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Budget name"
          className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40" />
        <div className="relative">
          <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Monthly limit"
            className="w-full bg-surface-raised border border-border rounded-lg pl-6 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {allCategories.map(cat => {
          const config = CATEGORY_CONFIG[cat]
          const selected = cats.includes(cat)
          return (
            <button key={cat} type="button" onClick={() => toggle(cat)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer
                ${selected ? `${config.bg} ${config.color}` : 'bg-surface-raised text-text-muted hover:text-text-secondary'}`}>
              {config.label}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary cursor-pointer">Cancel</button>
        <button onClick={submit} disabled={!name.trim() || cats.length === 0}
          className="px-3 py-1.5 rounded-lg bg-emerald-accent/10 text-emerald-accent text-xs font-medium hover:bg-emerald-accent/20 cursor-pointer disabled:opacity-40">
          Create
        </button>
      </div>
    </div>
  )
}

function GoalForm({ onSave, onCancel }: { onSave: (g: SavingsGoal) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [avoid, setAvoid] = useState<ExpenseCategory>('eating_out')
  const [days, setDays] = useState('7')
  const [reward, setReward] = useState('30')

  const submit = () => {
    if (!name.trim()) return
    onSave({
      id: crypto.randomUUID(), name: name.trim(),
      targetAmount: parseFloat(target) || 0, savedAmount: 0,
      avoidCategory: avoid, daysPerReward: parseInt(days) || 7,
      rewardAmount: parseFloat(reward) || 0,
    })
  }

  return (
    <div className="glass rounded-xl p-4 space-y-3 animate-fade-in">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Goal name (e.g. New Video Game)"
        className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Target Amount</label>
          <div className="relative">
            <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="60"
              className="w-full bg-surface-raised border border-border rounded-lg pl-6 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40" />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Avoid Category</label>
          <select value={avoid} onChange={e => setAvoid(e.target.value as ExpenseCategory)}
            className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-emerald-accent/40 cursor-pointer [color-scheme:dark]">
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Days to Earn Reward</label>
          <input type="number" value={days} onChange={e => setDays(e.target.value)} min="1"
            className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-emerald-accent/40" />
        </div>
        <div>
          <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">$ Earned Per Cycle</label>
          <div className="relative">
            <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="number" value={reward} onChange={e => setReward(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg pl-6 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-emerald-accent/40" />
          </div>
        </div>
      </div>
      <p className="text-[10px] text-text-muted">
        Every {days || '?'} days without {CATEGORY_CONFIG[avoid].label.toLowerCase()}, you earn ${reward || '0'} toward {name || 'your goal'}
      </p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary cursor-pointer">Cancel</button>
        <button onClick={submit} disabled={!name.trim()}
          className="px-3 py-1.5 rounded-lg bg-emerald-accent/10 text-emerald-accent text-xs font-medium hover:bg-emerald-accent/20 cursor-pointer disabled:opacity-40">
          Create
        </button>
      </div>
    </div>
  )
}

export function SettingsView({
  dailyBudget, budgets, savingsGoals,
  onSetDailyBudget, onAddBudget, onUpdateBudget, onDeleteBudget,
  onAddSavingsGoal, onDeleteSavingsGoal,
  onExport, onImport, onClear, addToast,
}: SettingsViewProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [budgetInput, setBudgetInput] = useState(dailyBudget.toString())
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.accounts && data.expenses !== undefined) {
          onImport(data)
        } else {
          addToast('Invalid backup file format', 'error')
        }
      } catch {
        addToast('Failed to parse backup file', 'error')
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleBudgetSave = () => {
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val > 0) onSetDailyBudget(val)
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-xl">
      <div>
        <h1 className="font-display text-4xl tracking-tight mb-1">Settings</h1>
        <p className="text-text-secondary text-sm">Configure budgets, goals, and manage data</p>
      </div>

      {/* Daily Budget */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Daily Budget</h3>
        <div className="glass glass-hover rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Spending Limit</p>
              <p className="text-xs text-text-secondary mt-0.5">Target per day</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                  className="w-24 bg-surface-raised border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-emerald-accent/40 transition-colors text-right" />
              </div>
              <button onClick={handleBudgetSave}
                className="px-3 py-2 rounded-lg bg-emerald-accent/10 text-emerald-accent text-xs font-medium hover:bg-emerald-accent/20 transition-colors cursor-pointer">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Monthly Budgets</h3>
          <button onClick={() => setShowBudgetForm(true)}
            className="flex items-center gap-1 text-xs text-emerald-accent hover:text-emerald-soft cursor-pointer">
            <Plus size={12} /> Add
          </button>
        </div>

        {budgets.map(budget => {
          const cats = budget.categories.map(c => CATEGORY_CONFIG[c].label).join(', ')
          const isEditing = editingBudgetId === budget.id

          return (
            <div key={budget.id} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{budget.name}</p>
                <p className="text-xs text-text-muted">{cats}</p>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <DollarSign size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="number" defaultValue={budget.monthlyLimit} id={`edit-${budget.id}`}
                      className="w-20 bg-surface-raised border border-border rounded-lg pl-5 pr-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-emerald-accent/40 text-right" />
                  </div>
                  <button onClick={() => {
                    const input = document.getElementById(`edit-${budget.id}`) as HTMLInputElement
                    onUpdateBudget({ ...budget, monthlyLimit: parseFloat(input.value) || 0 })
                    setEditingBudgetId(null)
                  }} className="px-2 py-1 rounded-lg bg-emerald-accent/10 text-emerald-accent text-[10px] font-medium cursor-pointer">
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-text-primary">${budget.monthlyLimit}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingBudgetId(budget.id)}
                      className="px-2 py-1 rounded-lg text-[10px] text-text-muted hover:text-text-primary hover:bg-white/[0.04] cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => onDeleteBudget(budget.id)}
                      className="p-1 rounded-lg text-text-muted hover:text-rose-accent cursor-pointer">
                      <X size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {showBudgetForm && (
          <BudgetForm
            onSave={b => { onAddBudget(b); setShowBudgetForm(false) }}
            onCancel={() => setShowBudgetForm(false)}
          />
        )}
      </div>

      {/* Savings Goals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Savings Goals</h3>
          <button onClick={() => setShowGoalForm(true)}
            className="flex items-center gap-1 text-xs text-emerald-accent hover:text-emerald-soft cursor-pointer">
            <Plus size={12} /> Add
          </button>
        </div>

        {savingsGoals.map(goal => (
          <div key={goal.id} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 group">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{goal.name}</p>
              <p className="text-xs text-text-muted">
                {goal.daysPerReward}d without {CATEGORY_CONFIG[goal.avoidCategory].label.toLowerCase()} = +${goal.rewardAmount}
                {goal.targetAmount > 0 && ` · Goal: $${goal.targetAmount}`}
              </p>
            </div>
            <button onClick={() => onDeleteSavingsGoal(goal.id)}
              className="p-1 rounded-lg text-text-muted hover:text-rose-accent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={12} />
            </button>
          </div>
        ))}

        {showGoalForm && (
          <GoalForm
            onSave={g => { onAddSavingsGoal(g); setShowGoalForm(false) }}
            onCancel={() => setShowGoalForm(false)}
          />
        )}
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Data Management</h3>
        <div className="glass glass-hover rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Export Data</p>
            <p className="text-xs text-text-secondary mt-0.5">Download all data as JSON</p>
          </div>
          <button onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text-primary hover:border-border-hover transition-colors cursor-pointer">
            <Download size={14} /> Export
          </button>
        </div>
        <div className="glass glass-hover rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Import Data</p>
            <p className="text-xs text-text-secondary mt-0.5">Restore from a JSON backup</p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text-primary hover:border-border-hover transition-colors cursor-pointer">
            <Upload size={14} /> Import
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        <div className="glass rounded-xl p-5 flex items-center justify-between border border-rose-accent/10">
          <div>
            <p className="text-sm font-medium text-text-primary">Clear All Data</p>
            <p className="text-xs text-text-secondary mt-0.5">Permanently delete everything</p>
          </div>
          {showClearConfirm ? (
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 rounded-xl border border-border text-xs text-text-secondary hover:bg-white/[0.04] transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={() => { onClear(); setShowClearConfirm(false) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-accent text-white text-xs font-medium hover:brightness-110 transition-all cursor-pointer">
                <AlertTriangle size={12} /> Confirm Delete
              </button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-accent/30 text-sm text-rose-accent hover:bg-rose-glow transition-colors cursor-pointer">
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <p className="text-xs text-text-muted">All data is stored locally in your browser. No data is ever sent to any server.</p>
      </div>
    </div>
  )
}
