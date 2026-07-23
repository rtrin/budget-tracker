import { LayoutDashboard, Receipt, Landmark, Settings, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import type { View } from '../types'

const navItems: { view: View; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'expenses', label: 'Expenses', icon: Receipt },
  { view: 'accounts', label: 'Accounts', icon: Landmark },
  { view: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  currentView: View
  onNavigate: (view: View) => void
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ currentView, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`
        relative flex flex-col h-full bg-surface border-r border-border
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
    >
      <div className={`flex items-center gap-3 px-5 h-16 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-emerald-accent/20 flex items-center justify-center shrink-0">
          <DollarSign size={18} className="text-emerald-accent" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg text-text-primary tracking-tight">Budget</span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ view, label, icon: Icon }) => {
          const active = currentView === view
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${collapsed ? 'justify-center' : ''}
                ${active
                  ? 'bg-emerald-accent/10 text-emerald-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                }
              `}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-raised border border-border
          flex items-center justify-center text-text-muted hover:text-text-secondary
          transition-colors cursor-pointer z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
