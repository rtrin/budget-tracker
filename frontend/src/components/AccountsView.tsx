import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, Landmark, TrendingUp, CreditCard } from 'lucide-react'
import type { Account } from '../types'
import { getNetWorth, ACCOUNT_TYPE_CONFIG } from '../store'

interface AccountsViewProps {
  accounts: Account[]
  onAddAccount: () => void
  onEditAccount: (account: Account) => void
  onDeleteAccount: (id: string) => void
}

const typeIcons = {
  cash: Landmark,
  investment: TrendingUp,
  liability: CreditCard,
}

export function AccountsView({ accounts, onAddAccount, onEditAccount, onDeleteAccount }: AccountsViewProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { assets, liabilities, net } = getNetWorth(accounts)

  const grouped = accounts.reduce<Record<string, Account[]>>((acc, a) => {
    ;(acc[a.type] ??= []).push(a)
    return acc
  }, {})

  const typeOrder = ['cash', 'investment'] as const

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight mb-1">Accounts</h1>
          <p className="text-text-secondary text-sm">Manage your assets and liabilities</p>
        </div>
        <button
          onClick={onAddAccount}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-accent text-obsidian text-sm font-semibold
            hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6">
        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium mb-2">Net Worth</p>
        <p className={`font-display text-4xl ${net >= 0 ? 'text-emerald-accent' : 'text-rose-accent'}`}>
          ${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-6 mt-3">
          <span className="text-xs text-text-secondary">
            Assets: <span className="text-emerald-accent font-medium">${assets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </span>
          <span className="text-xs text-text-secondary">
            Liabilities: <span className="text-rose-accent font-medium">${liabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </span>
        </div>
      </div>

      {/* Account Groups */}
      {typeOrder.map(type => {
        const typeAccounts = grouped[type]
        if (!typeAccounts?.length) return null
        const config = ACCOUNT_TYPE_CONFIG[type]
        const Icon = typeIcons[type]
        const typeTotal = typeAccounts.reduce((s, a) => s + a.balance, 0)

        return (
          <div key={type}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Icon size={12} className={config.color} />
                {config.label}
              </h3>
              <span className={`text-xs font-medium ${config.color}`}>
                ${typeTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="space-y-2">
              {typeAccounts.map((account, i) => (
                <div
                  key={account.id}
                  className="glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4 group animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${type === 'investment' ? 'bg-violet-glow' : 'bg-emerald-glow'}`}
                  >
                    <Icon size={20} className={config.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{account.name}</p>
                    <p className="text-xs text-text-muted">
                      {account.institution}
                      {account.apy ? ` · ${account.apy}% APY` : ''}
                    </p>
                  </div>

                  <p className={`text-base font-display ${config.color} shrink-0`}>
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => onEditAccount(account)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    {confirmDelete === account.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded-lg text-[10px] text-text-muted hover:bg-white/[0.04] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { onDeleteAccount(account.id); setConfirmDelete(null) }}
                          className="px-2 py-1 rounded-lg text-[10px] text-rose-accent bg-rose-glow hover:brightness-110 cursor-pointer flex items-center gap-1"
                        >
                          <AlertTriangle size={10} /> Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(account.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-rose-accent transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
