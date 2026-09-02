import React, { useState } from 'react'
import {
  Menu,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Camera,
  Plus,
  HelpCircle,
  Check,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface TopbarProps {
  onToggleMobileMenu: () => void
  onOpenScanner: () => void
  onOpenAddExpense: () => void
  onOpenAffordModal: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileMenu,
  onOpenScanner,
  onOpenAddExpense,
  onOpenAffordModal,
}) => {
  const {
    activeView,
    setActiveView,
    profile,
    updateProfile,
    alerts,
    markAlertRead,
    setShowOnboarding,
  } = useFinancial()

  const [showNotifications, setShowNotifications] = useState(false)

  const unreadAlerts = alerts.filter((a) => !a.read)

  const toggleTheme = () => {
    updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="breadcrumb">
          {activeView !== 'Overview' && (
            <button
              type="button"
              className="breadcrumb-back-btn"
              onClick={() => setActiveView('Overview')}
              title="Back to Overview"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <span>Finwise</span>
          <ChevronRight size={14} />
          <strong>{activeView}</strong>
        </div>
      </div>

      <div className="top-actions">
        {/* Personalize with AI Button */}
        <button
          type="button"
          className="top-action-pill desktop-only"
          onClick={() => setShowOnboarding(true)}
          title="Retake AI survey to personalize homepage"
        >
          <Sparkles size={14} color="#1f9d67" />
          <span>Personalize with AI</span>
        </button>

        {/* Can I Afford This? Quick Button */}
        <button
          type="button"
          className="top-action-pill desktop-only"
          onClick={onOpenAffordModal}
          title="Analyze an upcoming purchase"
        >
          <HelpCircle size={15} />
          <span>Can I Afford?</span>
        </button>

        {/* Scan Receipt Quick Button */}
        <button
          type="button"
          className="top-action-pill highlight desktop-only"
          onClick={onOpenScanner}
          title="Upload or scan a receipt"
        >
          <Camera size={15} />
          <span>Scan Receipt</span>
        </button>

        {/* Add Transaction Button */}
        <button
          type="button"
          className="primary-btn small"
          onClick={onOpenAddExpense}
        >
          <Plus size={16} />
          <span className="btn-text-desktop">Record Cashflow</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${profile.theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle dark/light theme"
        >
          {profile.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Popover */}
        <div className="notification-wrapper">
          <button
            type="button"
            className={`icon-btn notification ${unreadAlerts.length > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications & Alerts"
            aria-label="View alerts"
          >
            <Bell size={18} />
            {unreadAlerts.length > 0 && <span className="unread-dot" />}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <strong>Notifications</strong>
                <span className="tiny-chip">{alerts.length}</span>
              </div>
              <div className="dropdown-list">
                {alerts.length === 0 ? (
                  <p className="empty-text">No alerts right now.</p>
                ) : (
                  alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className={`dropdown-alert-item ${alert.read ? 'read' : 'unread'}`}
                      onClick={() => {
                        markAlertRead(alert.id)
                        if (alert.actionView) setActiveView(alert.actionView)
                        setShowNotifications(false)
                      }}
                    >
                      <div className={`alert-indicator ${alert.type}`} />
                      <div className="alert-content">
                        <strong>{alert.title}</strong>
                        <p>{alert.message}</p>
                        <small>{alert.date}</small>
                      </div>
                      {!alert.read && <Check size={14} className="mark-read-icon" />}
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                className="dropdown-footer-btn"
                onClick={() => {
                  setShowNotifications(false)
                  setActiveView('Alerts')
                }}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <button
          type="button"
          className="profile-btn"
          onClick={() => setActiveView('Settings')}
          title="Open profile settings"
        >
          <span className="avatar small">{profile.avatarInitials}</span>
          <ChevronRight size={14} className="desktop-only" />
        </button>
      </div>
    </header>
  )
}
