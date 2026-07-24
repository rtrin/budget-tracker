import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react'
import type { Toast as ToastType } from '../types'

const iconMap = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
}

const colorMap = {
  success: 'text-emerald-accent',
  info: 'text-sky-accent',
  error: 'text-rose-accent',
}

interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] animate-toast-in"
          >
            <Icon size={18} className={colorMap[toast.type]} />
            <span className="text-sm text-text-primary flex-1">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
