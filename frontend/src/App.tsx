import { useState } from 'react'
import type { View, Account } from './types'
import { useAppState } from './store'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { ExpensesView } from './components/ExpensesView'
import { AccountsView } from './components/AccountsView'
import { SettingsView } from './components/SettingsView'
import { ExpenseModal } from './components/ExpenseModal'
import { AccountModal } from './components/AccountModal'
import { ToastContainer } from './components/Toast'

export default function App() {
  const {
    state, toasts,
    addToast, dismissToast,
    addExpense, deleteExpense,
    addAccount, updateAccount, deleteAccount,
    setDailyBudget,
    addBudget, updateBudget, deleteBudget,
    addSavingsGoal, deleteSavingsGoal,
    importData, clearData, exportData,
  } = useAppState()

  const [view, setView] = useState<View>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null | undefined>(undefined)

  const showAccountModal = editingAccount !== undefined

  return (
    <div className="flex h-screen bg-obsidian">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {view === 'dashboard' && (
            <DashboardView
              accounts={state.accounts}
              expenses={state.expenses}
              dailyBudget={state.dailyBudget}
              savingsXP={state.savingsXP}
              budgets={state.budgets}
              savingsGoals={state.savingsGoals}
              onAddExpense={() => setShowExpenseModal(true)}
            />
          )}
          {view === 'expenses' && (
            <ExpensesView
              expenses={state.expenses}
              onAddExpense={() => setShowExpenseModal(true)}
              onDeleteExpense={deleteExpense}
            />
          )}
          {view === 'accounts' && (
            <AccountsView
              accounts={state.accounts}
              onAddAccount={() => setEditingAccount(null)}
              onEditAccount={a => setEditingAccount(a)}
              onDeleteAccount={deleteAccount}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              dailyBudget={state.dailyBudget}
              budgets={state.budgets}
              savingsGoals={state.savingsGoals}
              onSetDailyBudget={setDailyBudget}
              onAddBudget={addBudget}
              onUpdateBudget={updateBudget}
              onDeleteBudget={deleteBudget}
              onAddSavingsGoal={addSavingsGoal}
              onDeleteSavingsGoal={deleteSavingsGoal}
              onExport={exportData}
              onImport={importData}
              onClear={clearData}
              addToast={addToast}
            />
          )}
        </div>
      </main>

      {showExpenseModal && (
        <ExpenseModal
          accounts={state.accounts}
          onSave={expense => { addExpense(expense); setShowExpenseModal(false) }}
          onClose={() => setShowExpenseModal(false)}
        />
      )}

      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          onSave={account => {
            if (editingAccount) updateAccount(account)
            else addAccount(account)
            setEditingAccount(undefined)
          }}
          onClose={() => setEditingAccount(undefined)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
