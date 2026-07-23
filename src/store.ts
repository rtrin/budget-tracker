import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppState, Account, Expense, Toast, ExpenseCategory, CustomBudget, SavingsGoal } from './types'
import { loadFromIDB, saveToIDB, loadFromLS, saveToLS } from './db'

const DEFAULT_STATE: AppState = {
  accounts: [
    { id: '1', name: 'Individual Cash Account', institution: 'Individual - 3.30% APY', type: 'cash', balance: 10750.17, apy: 3.3 },
    { id: '2', name: 'Emergency Fund', institution: 'Individual - 3.30% APY', type: 'cash', balance: 0, apy: 3.3 },
    { id: '3', name: 'Checking - 9292', institution: 'Bank of America', type: 'cash', balance: 811.01 },
    { id: '4', name: 'Roth IRA', institution: 'Roth IRA', type: 'investment', balance: 19876.17 },
    { id: '5', name: 'Credit Card - 4750', institution: 'Bank of America', type: 'liability', balance: 0 },
    { id: '6', name: 'Credit Card - 6076', institution: 'Discover', type: 'liability', balance: 0 },
    { id: '7', name: 'Credit Card - 6427', institution: 'Chase', type: 'liability', balance: 0 },
    { id: '8', name: 'Credit Card - 7054', institution: 'Capital One', type: 'liability', balance: 0 },
  ],
  expenses: [],
  dailyBudget: 50,
  savingsXP: 0,
  budgets: [
    { id: 'b1', name: 'Eating Out', monthlyLimit: 200, categories: ['eating_out'] },
    { id: 'b2', name: 'Groceries', monthlyLimit: 150, categories: ['groceries'] },
    { id: 'b3', name: 'Gas', monthlyLimit: 80, categories: ['gas'] },
    { id: 'b4', name: 'Games', monthlyLimit: 50, categories: ['entertainment'] },
    { id: 'b5', name: 'Shopping', monthlyLimit: 100, categories: ['shopping'] },
  ],
  savingsGoals: [
    { id: 'g1', name: 'Dine Out Meal', targetAmount: 30, savedAmount: 0, avoidCategory: 'eating_out', daysPerReward: 7, rewardAmount: 30 },
  ],
}

function loadStateSync(): AppState {
  const loaded = loadFromLS()
  if (loaded) {
    if (!loaded.budgets) loaded.budgets = DEFAULT_STATE.budgets
    if (!loaded.savingsGoals) loaded.savingsGoals = DEFAULT_STATE.savingsGoals
    return loaded
  }
  return DEFAULT_STATE
}

function persistState(state: AppState) {
  saveToLS(state)
  saveToIDB(state)
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadStateSync)
  const [toasts, setToasts] = useState<Toast[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    loadFromIDB().then(idbState => {
      if (!idbState) return
      const lsState = loadFromLS()
      if (!lsState) {
        setState(idbState)
        saveToLS(idbState)
      }
    })
  }, [])

  useEffect(() => {
    persistState(state)
  }, [state])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addExpense = useCallback((expense: Expense) => {
    setState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
      accounts: expense.accountId
        ? prev.accounts.map(a => a.id === expense.accountId ? { ...a, balance: Math.round((a.balance - expense.amount) * 100) / 100 } : a)
        : prev.accounts,
    }))
    addToast('Expense logged')
  }, [addToast])

  const deleteExpense = useCallback((id: string) => {
    setState(prev => {
      const expense = prev.expenses.find(e => e.id === id)
      return {
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id),
        accounts: expense?.accountId
          ? prev.accounts.map(a => a.id === expense.accountId ? { ...a, balance: Math.round((a.balance + expense.amount) * 100) / 100 } : a)
          : prev.accounts,
      }
    })
    addToast('Expense removed')
  }, [addToast])

  const addAccount = useCallback((account: Account) => {
    setState(prev => ({ ...prev, accounts: [...prev.accounts, account] }))
    addToast('Account added')
  }, [addToast])

  const updateAccount = useCallback((account: Account) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === account.id ? account : a),
    }))
    addToast('Account updated')
  }, [addToast])

  const deleteAccount = useCallback((id: string) => {
    setState(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }))
    addToast('Account removed')
  }, [addToast])

  const setDailyBudget = useCallback((budget: number) => {
    setState(prev => ({ ...prev, dailyBudget: budget }))
    addToast('Daily budget updated')
  }, [addToast])

  const addBudget = useCallback((budget: CustomBudget) => {
    setState(prev => ({ ...prev, budgets: [...prev.budgets, budget] }))
    addToast('Budget created')
  }, [addToast])

  const updateBudget = useCallback((budget: CustomBudget) => {
    setState(prev => ({ ...prev, budgets: prev.budgets.map(b => b.id === budget.id ? budget : b) }))
    addToast('Budget updated')
  }, [addToast])

  const deleteBudget = useCallback((id: string) => {
    setState(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }))
    addToast('Budget removed')
  }, [addToast])

  const addSavingsGoal = useCallback((goal: SavingsGoal) => {
    setState(prev => ({ ...prev, savingsGoals: [...prev.savingsGoals, goal] }))
    addToast('Savings goal created')
  }, [addToast])

  const updateSavingsGoal = useCallback((goal: SavingsGoal) => {
    setState(prev => ({ ...prev, savingsGoals: prev.savingsGoals.map(g => g.id === goal.id ? goal : g) }))
  }, [])

  const deleteSavingsGoal = useCallback((id: string) => {
    setState(prev => ({ ...prev, savingsGoals: prev.savingsGoals.filter(g => g.id !== id) }))
    addToast('Savings goal removed')
  }, [addToast])

  const addSavingsXP = useCallback((xp: number) => {
    setState(prev => ({ ...prev, savingsXP: prev.savingsXP + xp }))
  }, [])

  const importData = useCallback((data: AppState) => {
    setState(data)
    addToast('Data imported successfully')
  }, [addToast])

  const clearData = useCallback(() => {
    setState(DEFAULT_STATE)
    addToast('All data cleared')
  }, [addToast])

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Data exported')
  }, [state, addToast])

  return {
    state, toasts,
    addToast, dismissToast,
    addExpense, deleteExpense,
    addAccount, updateAccount, deleteAccount,
    setDailyBudget, addSavingsXP,
    addBudget, updateBudget, deleteBudget,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    importData, clearData, exportData,
  }
}

export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getExpensesForDate(expenses: Expense[], dateKey: string): Expense[] {
  return expenses.filter(e => e.date === dateKey)
}

export function getTotalForDate(expenses: Expense[], dateKey: string): number {
  return getExpensesForDate(expenses, dateKey).reduce((sum, e) => sum + e.amount, 0)
}

export function getNetWorth(accounts: Account[]): { assets: number; liabilities: number; net: number } {
  let assets = 0
  let liabilities = 0
  for (const a of accounts) {
    if (a.type === 'liability') {
      liabilities += a.balance
    } else {
      assets += a.balance
    }
  }
  return { assets, liabilities, net: assets - liabilities }
}

export function getSavingsStreak(expenses: Expense[], dailyBudget: number): { current: number; best: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const byDate = new Map<string, number>()
  for (const e of expenses) {
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount)
  }

  let current = 0
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  for (let i = 0; i < 365; i++) {
    const key = getDateKey(d)
    const spent = byDate.get(key) ?? 0
    if (spent <= dailyBudget) {
      current++
    } else {
      break
    }
    d.setDate(d.getDate() - 1)
  }

  const todaySpent = byDate.get(getDateKey(today)) ?? 0
  if (todaySpent <= dailyBudget) current++

  let best = 0
  let streak = 0
  const d2 = new Date(today)
  for (let i = 0; i < 365; i++) {
    const key = getDateKey(d2)
    const spent = byDate.get(key) ?? 0
    if (spent <= dailyBudget) {
      streak++
    } else {
      best = Math.max(best, streak)
      streak = 0
    }
    d2.setDate(d2.getDate() - 1)
  }
  best = Math.max(best, streak)

  return { current, best }
}

export function getNoSpendDays(expenses: Expense[]): number {
  const daysWithSpending = new Set(expenses.map(e => e.date))
  const today = new Date()
  let count = 0
  const d = new Date(today)
  for (let i = 0; i < 30; i++) {
    if (!daysWithSpending.has(getDateKey(d))) count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export function getLevel(xp: number): { level: number; currentXP: number; xpForNext: number } {
  let level = 0
  let remaining = xp
  while (remaining >= (level + 1) * 100) {
    remaining -= (level + 1) * 100
    level++
  }
  return { level, currentXP: remaining, xpForNext: (level + 1) * 100 }
}

export const SAVINGS_MILESTONES = [
  { days: 3, label: 'Penny Pincher', icon: '🪙' },
  { days: 7, label: 'Week Saver', icon: '💰' },
  { days: 14, label: 'Frugal Fortnight', icon: '⚡' },
  { days: 30, label: 'Monthly Miser', icon: '🌟' },
  { days: 60, label: 'Budget Boss', icon: '💎' },
  { days: 90, label: 'Quarter King', icon: '🏆' },
  { days: 180, label: 'Half Year Hero', icon: '👑' },
  { days: 365, label: 'Savings Legend', icon: '🐉' },
] as const

export function getCurrentMilestone(streakDays: number) {
  type Milestone = typeof SAVINGS_MILESTONES[number]
  let current: Milestone | null = null
  let next: Milestone | null = SAVINGS_MILESTONES[0]
  for (let i = SAVINGS_MILESTONES.length - 1; i >= 0; i--) {
    if (streakDays >= SAVINGS_MILESTONES[i].days) {
      current = SAVINGS_MILESTONES[i]
      next = SAVINGS_MILESTONES[i + 1] ?? null
      break
    }
  }
  if (!current) next = SAVINGS_MILESTONES[0]
  return { current, next }
}

export function getStreakTier(days: number): 'none' | 'spark' | 'flame' | 'blaze' | 'inferno' {
  if (days >= 90) return 'inferno'
  if (days >= 30) return 'blaze'
  if (days >= 7) return 'flame'
  if (days >= 3) return 'spark'
  return 'none'
}

export const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string; bg: string }> = {
  eating_out: { label: 'Eating Out', color: 'text-rose-accent', bg: 'bg-rose-glow' },
  groceries: { label: 'Groceries', color: 'text-emerald-accent', bg: 'bg-emerald-glow' },
  gas: { label: 'Gas', color: 'text-sky-accent', bg: 'bg-sky-glow' },
  subscriptions: { label: 'Subscriptions', color: 'text-violet-accent', bg: 'bg-violet-glow' },
  shopping: { label: 'Shopping', color: 'text-amber-accent', bg: 'bg-amber-glow' },
  bills: { label: 'Bills', color: 'text-sky-accent', bg: 'bg-sky-glow' },
  entertainment: { label: 'Entertainment', color: 'text-violet-accent', bg: 'bg-violet-glow' },
  other: { label: 'Other', color: 'text-text-secondary', bg: 'bg-surface-raised' },
}

export function getMonthlySpendingByCategory(expenses: Expense[], monthKey: string): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const e of expenses) {
    if (e.date.startsWith(monthKey)) {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount
    }
  }
  return totals
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getGoalStreak(expenses: Expense[], avoidCategory: ExpenseCategory): { current: number; cleanDays30d: number } {
  const avoidDates = new Set(
    expenses.filter(e => e.category === avoidCategory).map(e => e.date),
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let current = 0
  const d = new Date(today)
  for (let i = 0; i < 365; i++) {
    if (avoidDates.has(getDateKey(d))) break
    current++
    d.setDate(d.getDate() - 1)
  }

  let cleanDays30d = 0
  const d2 = new Date(today)
  for (let i = 0; i < 30; i++) {
    if (!avoidDates.has(getDateKey(d2))) cleanDays30d++
    d2.setDate(d2.getDate() - 1)
  }

  return { current, cleanDays30d }
}

export function getBudgetSpent(expenses: Expense[], budget: CustomBudget, monthKey: string): number {
  return expenses
    .filter(e => e.date.startsWith(monthKey) && budget.categories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0)
}

export const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  cash: { label: 'Cash', color: 'text-emerald-accent' },
  investment: { label: 'Investments', color: 'text-violet-accent' },
  liability: { label: 'Liabilities', color: 'text-rose-accent' },
}
