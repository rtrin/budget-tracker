import { useMemo } from 'react'
import { Plus, TrendingUp, Flame, Trophy, Wallet, ShieldCheck, Sparkles, Target } from 'lucide-react'
import type { Account, Expense, CustomBudget, SavingsGoal } from '../types'
import {
  getDateKey, getTotalForDate, getNetWorth,
  getSavingsStreak, getNoSpendDays, getLevel, getCurrentMilestone,
  getStreakTier, CATEGORY_CONFIG, getCurrentMonthKey, getGoalStreak,
  getBudgetSpent,
} from '../store'

interface DashboardViewProps {
  accounts: Account[]
  expenses: Expense[]
  dailyBudget: number
  savingsXP: number
  budgets: CustomBudget[]
  savingsGoals: SavingsGoal[]
  onAddExpense: () => void
}

function BudgetRing({ spent, budget, size = 120, stroke = 8 }: { spent: number; budget: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(spent / budget, 1)
  const offset = circumference - ratio * circumference
  const overBudget = spent > budget

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={overBudget ? '#f43f5e' : '#10b981'}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ '--ring-circumference': circumference } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-2xl ${overBudget ? 'text-rose-accent' : 'text-text-primary'}`}>${spent.toFixed(0)}</span>
        <span className="text-text-muted text-[10px]">of ${budget}</span>
      </div>
    </div>
  )
}

function StreakBadge({ streak }: { streak: { current: number; best: number } }) {
  const tier = getStreakTier(streak.current)
  const { current: milestone, next } = getCurrentMilestone(streak.current)
  if (streak.current === 0) return null
  const tierClass = tier !== 'none' ? `streak-${tier}` : ''

  return (
    <div className={`flex items-center gap-2 ${tierClass}`}>
      <Flame
        size={tier === 'inferno' ? 18 : tier === 'blaze' ? 16 : 14}
        className={`text-emerald-accent ${tier === 'blaze' || tier === 'inferno' ? 'animate-flame-flicker' : ''}`}
      />
      <span className="text-xs font-semibold text-emerald-accent">{streak.current}d streak</span>
      {milestone && <span className="text-[10px] ml-0.5" title={milestone.label}>{milestone.icon}</span>}
      {next && streak.current > 0 && (
        <div className="flex items-center gap-1 ml-1">
          <div className="w-12 h-1 bg-surface-raised rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-accent/50 transition-all duration-500"
              style={{ width: `${((streak.current - (milestone?.days ?? 0)) / (next.days - (milestone?.days ?? 0))) * 100}%` }} />
          </div>
          <span className="text-[9px] text-text-muted">{next.days}d</span>
        </div>
      )}
    </div>
  )
}

function LevelBadge({ savingsXP }: { savingsXP: number }) {
  const { level, currentXP, xpForNext } = getLevel(savingsXP)
  if (savingsXP === 0) return null

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-accent/20 to-violet-accent/20 flex items-center justify-center border border-emerald-accent/20">
        <span className="font-display text-lg text-emerald-accent">{level}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-text-secondary">Saver Lv.{level}</span>
          <span className="text-[10px] text-text-muted">{currentXP}/{xpForNext} XP</span>
        </div>
        <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-accent to-violet-accent transition-all duration-700"
            style={{ width: `${(currentXP / xpForNext) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

function GoalCard({ goal, expenses }: { goal: SavingsGoal; expenses: Expense[] }) {
  const { current, cleanDays30d } = getGoalStreak(expenses, goal.avoidCategory)
  const rewardsEarned = Math.floor(cleanDays30d / goal.daysPerReward)
  const totalEarned = rewardsEarned * goal.rewardAmount
  const daysIntoReward = current % goal.daysPerReward
  const daysLeft = goal.daysPerReward - daysIntoReward
  const progress = daysIntoReward / goal.daysPerReward
  const catLabel = CATEGORY_CONFIG[goal.avoidCategory].label

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-amber-accent" />
        <span className="text-sm font-medium text-text-primary">{goal.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">{current}d without {catLabel.toLowerCase()}</span>
            <span className="text-xs text-text-muted">{daysLeft} more = +${goal.rewardAmount}</span>
          </div>
          <div className="h-2 bg-surface-raised rounded-full overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-accent to-amber-accent transition-all duration-700"
              style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="flex justify-between">
            {[...Array(goal.daysPerReward)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < daysIntoReward ? 'bg-emerald-accent' : 'bg-surface-raised'}`} />
            ))}
          </div>
        </div>
        <div className="text-center shrink-0 pl-3 border-l border-border">
          <p className="font-display text-xl text-amber-accent">${totalEarned}</p>
          <p className="text-[10px] text-text-muted">earned (30d)</p>
        </div>
      </div>
      {goal.targetAmount > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted">Goal: ${goal.targetAmount}</span>
            <span className="text-[10px] text-text-muted">{Math.min(100, Math.round((totalEarned / goal.targetAmount) * 100))}%</span>
          </div>
          <div className="h-1 bg-surface-raised rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-amber-accent/60 transition-all duration-500"
              style={{ width: `${Math.min(100, (totalEarned / goal.targetAmount) * 100)}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardView({ accounts, expenses, dailyBudget, savingsXP, budgets, savingsGoals, onAddExpense }: DashboardViewProps) {
  const today = new Date()
  const dateKey = getDateKey(today)
  const todayTotal = getTotalForDate(expenses, dateKey)
  const { assets, net } = getNetWorth(accounts)
  const streak = getSavingsStreak(expenses, dailyBudget)
  const noSpendDays = getNoSpendDays(expenses)
  const monthKey = getCurrentMonthKey()

  const recentExpenses = useMemo(() =>
    [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 15),
    [expenses],
  )

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const monthName = today.toLocaleDateString('en-US', { month: 'long' })
  const underBudget = todayTotal <= dailyBudget
  const saved = Math.max(0, dailyBudget - todayTotal)

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight mb-1">{dayName}</h1>
        <p className="text-text-secondary text-sm">{dateStr}</p>
      </div>

      {/* Budget + Gamification */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-8">
          <BudgetRing spent={todayTotal} budget={dailyBudget} />
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-wider font-medium mb-1">Daily Budget</p>
              {underBudget ? (
                <p className="text-emerald-accent text-sm font-medium">${saved.toFixed(2)} saved today</p>
              ) : (
                <p className="text-rose-accent text-sm font-medium">${(todayTotal - dailyBudget).toFixed(2)} over budget</p>
              )}
            </div>
            <LevelBadge savingsXP={savingsXP} />
            <StreakBadge streak={streak} />
            {todayTotal === 0 && (
              <div className="flex items-center gap-2 animate-milestone-burst">
                <ShieldCheck size={16} className="text-emerald-accent" />
                <span className="text-emerald-accent text-sm font-semibold">No-spend day so far!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      {savingsGoals.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Savings Goals</h3>
          <div className="space-y-3">
            {savingsGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} expenses={expenses} />
            ))}
          </div>
        </div>
      )}

      {/* Category Budgets */}
      {budgets.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">{monthName} Budgets</h3>
          <div className="grid grid-cols-2 gap-3">
            {budgets.map(budget => {
              const spent = getBudgetSpent(expenses, budget, monthKey)
              const remaining = budget.monthlyLimit - spent
              const pct = budget.monthlyLimit > 0 ? Math.min(spent / budget.monthlyLimit, 1) : 1
              const catConfig = CATEGORY_CONFIG[budget.categories[0]] ?? CATEGORY_CONFIG.other

              return (
                <div key={budget.id} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-md ${catConfig.bg} flex items-center justify-center`}>
                      <span className={`text-[10px] font-bold ${catConfig.color}`}>{budget.name[0]}</span>
                    </div>
                    <span className="text-xs font-medium text-text-primary">{budget.name}</span>
                  </div>
                  <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${remaining < 0 ? 'bg-rose-accent' : 'bg-emerald-accent'}`}
                      style={{ width: `${pct * 100}%`, opacity: 0.7 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">${spent.toFixed(2)} spent</span>
                    <span className={`text-xs font-semibold ${remaining >= 0 ? 'text-emerald-accent' : 'text-rose-accent'}`}>
                      {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `-$${Math.abs(remaining).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Net Worth */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-emerald-accent" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Assets</span>
          </div>
          <p className="font-display text-xl text-emerald-accent">${assets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-text-primary" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Net Worth</span>
          </div>
          <p className={`font-display text-xl ${net >= 0 ? 'text-emerald-accent' : 'text-rose-accent'}`}>
            ${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-glow flex items-center justify-center">
            <Sparkles size={18} className="text-emerald-accent" />
          </div>
          <div>
            <p className="text-xs text-text-muted">No-Spend Days (30d)</p>
            <p className="font-display text-lg">{noSpendDays}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-glow flex items-center justify-center">
            <Trophy size={18} className="text-amber-accent" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Best Streak</p>
            <p className="font-display text-lg">{streak.best}d</p>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Recent Expenses</h3>
          <button onClick={onAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-accent/10 text-emerald-accent text-xs font-medium hover:bg-emerald-accent/20 transition-colors cursor-pointer">
            <Plus size={14} /> Log
          </button>
        </div>
        {recentExpenses.length > 0 ? (
          <div className="space-y-2">
            {recentExpenses.map((expense, i) => {
              const cat = CATEGORY_CONFIG[expense.category]
              const isToday = expense.date === dateKey
              return (
                <div key={expense.id} className="glass glass-hover rounded-xl px-5 py-3 flex items-center gap-4 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className={`w-9 h-9 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-xs font-bold ${cat.color}`}>{cat.label[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{expense.description}</p>
                    <p className="text-xs text-text-muted">{cat.label}{!isToday && ` · ${formatDate(expense.date)}`}</p>
                  </div>
                  <span className="text-sm font-semibold text-rose-accent">-${expense.amount.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass rounded-xl px-5 py-8 text-center">
            <p className="text-text-muted text-sm mb-3">No expenses logged yet</p>
            <button onClick={onAddExpense}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-accent text-obsidian text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
              <Plus size={16} /> Log an Expense
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
