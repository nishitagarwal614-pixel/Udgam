import React from 'react'
import {
  LayoutDashboard,
  Activity,
  History,
  Gauge,
  TrendingUp,
  Sparkles,
  Target,
  Camera,
  Bot,
  FileSpreadsheet,
  Bell,
  Settings,
  CircleHelp,
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

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
  onOpenScanner,
}) => {
  const { activeView, setActiveView, alerts, profile } = useFinancial()

  const unreadAlertsCount = alerts.filter((a) => !a.read).length

  const handleNavClick = (view: string) => {
    setActiveView(view)
    if (onCloseMobile) onCloseMobile()
  }

  const workspaceNav = [
    { label: 'Overview', view: 'Overview', icon: LayoutDashboard },
    { label: 'Transactions', view: 'Transactions', icon: Activity },
    { label: 'History', view: 'History', icon: History },
    { label: 'Budgets', view: 'Budgets', icon: Gauge },
    { label: 'Insights', view: 'Insights', icon: TrendingUp, badge: '3' },
    { label: 'Predictions', view: 'Predictions', icon: Sparkles },
    { label: 'Goals', view: 'Goals', icon: Target },
    {
      label: 'Receipt Scanner',
      view: 'Receipt Scanner',
      icon: Camera,
      highlightBadge: 'AI OCR',
    },
    { label: 'AI Coach', view: 'AI Coach', icon: Bot },
  ]

  const manageNav = [
    { label: 'Reports', view: 'Reports', icon: FileSpreadsheet },
    {
      label: 'Alerts',
      view: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined,
      dot: unreadAlertsCount > 0,
    },
    { label: 'Settings', view: 'Settings', icon: Settings },
    { label: 'Help & Support', view: 'Help & Support', icon: CircleHelp },
  ]

  return (
    <>
      {isOpenOnMobile && (
        <div className="mobile-drawer-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${isOpenOnMobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand" onClick={() => handleNavClick('Overview')} style={{ cursor: 'pointer' }}>
            <span className="brand-mark">
              <Sparkles size={18} />
            </span>
            <span>
              finwise<span className="brand-dot">.</span>
            </span>
          </div>
          {isOpenOnMobile && (
            <button className="mobile-drawer-close" onClick={onCloseMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Student Profile Pill */}
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
            <small>{profile.college.split('·')[0].trim() || 'Student'}</small>
          </span>
          <ChevronRight size={15} />
        </div>

        {/* Quick OCR Scan Banner in Sidebar */}
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
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.view)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.highlightBadge && (
                  <span className="nav-highlight-badge">{item.highlightBadge}</span>
                )}
                {item.badge && !item.highlightBadge && <i>{item.badge}</i>}
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
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.view)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.dot && <i className="alert-dot">{item.badge || '•'}</i>}
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

          <button
            className="help"
            onClick={() => handleNavClick('Help & Support')}
          >
            <Shield size={16} /> Student Protection Plan
          </button>
        </div>
      </aside>
    </>
  )
}
