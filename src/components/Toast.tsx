import React from 'react'
import { Check, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  text: string
  type?: 'success' | 'error' | 'info'
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type || 'success'}`}>
          <div className="toast-icon">
            {toast.type === 'error' ? (
              <AlertCircle size={18} />
            ) : toast.type === 'info' ? (
              <Info size={18} />
            ) : (
              <Check size={18} />
            )}
          </div>
          <span className="toast-text">{toast.text}</span>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
