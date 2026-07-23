import { useState } from 'react'
import { X } from 'lucide-react'
import type { Account, AccountType } from '../types'

interface AccountModalProps {
  account: Account | null
  onSave: (account: Account) => void
  onClose: () => void
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
  { value: 'liability', label: 'Liability' },
]

export function AccountModal({ account, onSave, onClose }: AccountModalProps) {
  const [name, setName] = useState(account?.name ?? '')
  const [institution, setInstitution] = useState(account?.institution ?? '')
  const [type, setType] = useState<AccountType>(account?.type ?? 'cash')
  const [balance, setBalance] = useState(account?.balance?.toString() ?? '')
  const [apy, setApy] = useState(account?.apy?.toString() ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      id: account?.id ?? crypto.randomUUID(),
      name: name.trim(),
      institution: institution.trim(),
      type,
      balance: parseFloat(balance) || 0,
      apy: apy ? parseFloat(apy) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">{account ? 'Edit' : 'Add'} Account</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Checking - 9292"
              className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Institution</label>
            <input
              type="text"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              placeholder="e.g. Bank of America"
              className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`
                    px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer
                    ${type === value
                      ? value === 'liability'
                        ? 'bg-rose-glow text-rose-accent border border-rose-accent/20'
                        : value === 'investment'
                        ? 'bg-violet-glow text-violet-accent border border-violet-accent/20'
                        : 'bg-emerald-glow text-emerald-accent border border-emerald-accent/20'
                      : 'bg-surface-raised border border-border text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-surface-raised border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm text-text-primary
                    placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">APY %</label>
              <input
                type="number"
                step="0.01"
                value={apy}
                onChange={e => setApy(e.target.value)}
                placeholder="Optional"
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                  placeholder:text-text-muted focus:outline-none focus:border-emerald-accent/40 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-emerald-accent text-obsidian text-sm font-semibold
              hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {account ? 'Save Changes' : 'Add Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
