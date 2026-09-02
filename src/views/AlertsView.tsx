import React, { useState } from 'react'
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Check,
  ArrowRight,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface AlertsViewProps {
  onSuccessToast: (msg: string) => void
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onSuccessToast }) => {
  const {
    alerts,
    markAlertRead,
    deleteAlert,
    clearAllAlerts,
    setActiveView,
  } = useFinancial()

  const [filterType, setFilterType] = useState<'all' | 'unread'>('all')

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'unread') return !a.read
    return true
  })

  const handleMarkAllRead = () => {
    alerts.forEach((a) => markAlertRead(a.id))
    onSuccessToast('All alerts marked as read.')
  }

  const handleClearAll = () => {
    clearAllAlerts()
    onSuccessToast('Cleared all notifications.')
  }

  return (
    <div className="alerts-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">INTELLIGENT SYSTEM MONITORING</p>
          <h1>Smart Financial Alerts</h1>
          <p className="muted">
            Proactive alerts triggered by budget thresholds, recurring bills, and spending anomalies.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button
            type="button"
            className="secondary-btn small"
            onClick={handleMarkAllRead}
            disabled={alerts.every((a) => a.read)}
          >
            <Check size={14} /> Mark all read
          </button>
          <button
            type="button"
            className="danger-outline-btn small"
            onClick={handleClearAll}
            disabled={alerts.length === 0}
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="tab-pill-group" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`tab-pill ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          type="button"
          className={`tab-pill ${filterType === 'unread' ? 'active' : ''}`}
          onClick={() => setFilterType('unread')}
        >
          Unread ({alerts.filter((a) => !a.read).length})
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="alerts-list-container">
        {filteredAlerts.length === 0 ? (
          <div className="card empty-state-card">
            <Bell size={40} className="empty-icon" />
            <h3>All caught up!</h3>
            <p>No active financial alerts or warnings right now.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card alert-item-card ${alert.read ? 'read' : 'unread'} ${alert.type}`}
            >
              <div className="alert-item-left">
                <div className={`alert-icon-box ${alert.type}`}>
                  {alert.type === 'danger' || alert.type === 'warning' ? (
                    <AlertTriangle size={18} />
                  ) : alert.type === 'success' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Info size={18} />
                  )}
                </div>

                <div className="alert-body">
                  <div className="alert-title-row">
                    <strong>{alert.title}</strong>
                    {!alert.read && <span className="new-chip">New</span>}
                    <small>{alert.date}</small>
                  </div>
                  <p>{alert.message}</p>
                </div>
              </div>

              <div className="alert-item-actions">
                {alert.actionView && (
                  <button
                    type="button"
                    className="secondary-btn small"
                    onClick={() => {
                      markAlertRead(alert.id)
                      setActiveView(alert.actionView!)
                    }}
                  >
                    View in {alert.actionView} <ArrowRight size={14} />
                  </button>
                )}

                {!alert.read && (
                  <button
                    type="button"
                    className="icon-btn-sm"
                    onClick={() => markAlertRead(alert.id)}
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}

                <button
                  type="button"
                  className="icon-btn-sm danger"
                  onClick={() => deleteAlert(alert.id)}
                  title="Dismiss alert"
                  aria-label="Delete alert"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
