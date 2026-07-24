export type AccountType = 'cash' | 'investment' | 'liability'

export interface Account {
  id: string
  name: string
  institution: string
  type: AccountType
  balance: number
  apy?: number
}

export type ExpenseCategory =
  | 'eating_out'
  | 'groceries'
  | 'gas'
  | 'subscriptions'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'other'

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  accountId?: string
}

export interface CustomBudget {
  id: string
  name: string
  monthlyLimit: number
  categories: ExpenseCategory[]
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  avoidCategory: ExpenseCategory
  daysPerReward: number
  rewardAmount: number
}

export interface AppState {
  accounts: Account[]
  expenses: Expense[]
  dailyBudget: number
  savingsXP: number
  budgets: CustomBudget[]
  savingsGoals: SavingsGoal[]
}

export type View = 'dashboard' | 'expenses' | 'accounts' | 'settings'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'error'
}
