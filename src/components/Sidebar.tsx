import React from 'react'
import {
  LayoutDashboard,
  Activity,
  Gauge,
  Sparkles,
  Target,
  Camera,
  Bot,
  FileSpreadsheet,
  Bell,
  Settings,
  Zap,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface SidebarProps {
  isOpenOnMobile?: boolean
  onCloseMobile?: () => void
  onOpenScanner: () => void
}

interface NavItem {
  label: string
  view: string
  icon: React.ElementType
  highlightBadge?: string
  badge?: string
  dot?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
  onOpenScanner,
}) => {
  const { activeView, setActiveView, alerts, profile } = useFinancial()

  const unreadAlertsCount = alerts.filter((a) => !a.read).length

  const handleNavClick = (view: string) => {
    setActiveView(view)
    if (onCloseMobile) {
      onCloseMobile()
    }
  }

  const workspaceNav: NavItem[] = [
    { label: 'Overview', view: 'Overview', icon: LayoutDashboard },
    {
      label: 'Transactions & History',
      view: 'Transactions & History',
      icon: Activity,
    },
    { label: 'Budgets', view: 'Budgets', icon: Gauge },
    { label: 'Predictions', view: 'Predictions', icon: Sparkles },
    { label: 'Goals', view: 'Goals', icon: Target },
    { label: 'Finwise AI', view: 'AI Coach', icon: Bot, highlightBadge: '2.0' },
  ]

  const manageNav: NavItem[] = [
    { label: 'Reports', view: 'Reports', icon: FileSpreadsheet },
    {
      label: 'Alerts',
      view: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined,
      dot: unreadAlertsCount > 0,
    },
    { label: 'Settings', view: 'Settings', icon: Settings },
  ]

  return (
    <>
      {isOpenOnMobile && (
        <div
          className="mobile-drawer-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar ${isOpenOnMobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div
            className="brand"
            onClick={() => handleNavClick('Overview')}
            style={{ cursor: 'pointer' }}
          >
            <span className="brand-mark">
              <Sparkles size={18} />
            </span>

            <span>
              finwise<span className="brand-dot">.</span>
            </span>
          </div>

          {isOpenOnMobile && (
            <button
              className="mobile-drawer-close"
              onClick={onCloseMobile}
              type="button"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div
          className="student-pill"
          onClick={() => handleNavClick('Settings')}
          title="Open student profile settings"
          role="button"
          tabIndex={0}
        >
          <span className="avatar">{profile.avatarInitials}</span>

          <span className="student-details">
            <strong>{profile.name}</strong>
            <small>
              {profile.college.split('·')[0].trim() || 'Student'}
            </small>
          </span>

          <ChevronRight size={15} />
        </div>

        <button
          type="button"
          className="sidebar-scanner-cta"
          onClick={() => {
            if (onCloseMobile) onCloseMobile()
            onOpenScanner()
          }}
        >
          <Camera size={16} />
          <span>Scan Any Receipt</span>
          <span className="tiny-chip">New</span>
        </button>

        <p className="nav-label">Workspace</p>

        <nav>
          {workspaceNav.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view

            return (
              <button
                key={item.view}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.view)}
              >
                <Icon size={18} />
                <span>{item.label}</span>

                {item.highlightBadge && (
                  <span className="nav-highlight-badge">
                    {item.highlightBadge}
                  </span>
                )}

                {item.badge && !item.highlightBadge && (
                  <i>{item.badge}</i>
                )}
              </button>
            )
          })}
        </nav>

        <p className="nav-label">Manage</p>

        <nav>
          {manageNav.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view

            return (
              <button
                key={item.view}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.view)}
              >
                <Icon size={18} />
                <span>{item.label}</span>

                {item.dot && (
                  <i className="alert-dot">
                    {item.badge || '•'}
                  </i>
                )}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="streak">
            <Zap size={17} fill="currentColor" />

            <span>
              <strong>{profile.streakDays} day streak</strong>
              <small>Tracking daily cashflow</small>
            </span>
          </div>

          <div className="help">
            <Shield size={16} />
            Student Protection Plan
          </div>
        </div>
      </aside>
    </>
  )
}