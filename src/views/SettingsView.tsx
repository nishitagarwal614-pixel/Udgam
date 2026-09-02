import React, { useState } from 'react'
import {
  User,
  DollarSign,
  Bell,
  Download,
  RotateCcw,
  Save,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface SettingsViewProps {
  onSuccessToast: (msg: string) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSuccessToast }) => {
  const {
    profile,
    updateProfile,
    resetDataToDefault,
    transactions,
    budgets,
    goals,
  } = useFinancial()

  const [name, setName] = useState(profile.name)
  const [college, setCollege] = useState(profile.college)
  const [allowance, setAllowance] = useState(profile.monthlyAllowance)
  const [currency, setCurrency] = useState(profile.currency)
  const [theme, setTheme] = useState(profile.theme)
  const [aiPersonality, setAiPersonality] = useState(profile.aiPersonality)
  const [notifications, setNotifications] = useState(profile.notificationsEnabled)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name: name.trim(),
      college: college.trim(),
      monthlyAllowance: Number(allowance),
      currency,
      theme,
      aiPersonality,
      notificationsEnabled: notifications,
      avatarInitials: name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AS',
    })
    onSuccessToast('Settings and profile updated successfully!')
  }

  const handleExportJSON = () => {
    const data = {
      profile,
      transactions,
      budgets,
      goals,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finwise_student_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    onSuccessToast('All financial data exported as JSON backup.')
  }

  const handleReset = () => {
    if (window.confirm('Reset all financial data back to student defaults?')) {
      resetDataToDefault()
      setName('Arjun Sharma')
      setCollege('IIT Delhi · Computer Science')
      setAllowance(15000)
      setCurrency('₹')
      setTheme('light')
      setAiPersonality('Balanced')
      setNotifications(true)
      onSuccessToast('System reset to default student profile.')
    }
  }

  return (
    <div className="settings-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PREFERENCES & SECURITY</p>
          <h1>Settings</h1>
          <p className="muted">
            Configure your student identity, currency, theme, and AI advisor style.
          </p>
        </div>
      </section>

      <form onSubmit={handleSaveProfile}>
        <div className="settings-grid">
          {/* Profile Card */}
          <div className="card settings-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">STUDENT IDENTITY</p>
                <h2>Profile Information</h2>
              </div>
              <User size={18} />
            </div>

            <label>
              Full Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              University / Branch
              <input
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </label>

            <label>
              Monthly Pocket Money / Allowance ({currency})
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
              />
            </label>
          </div>

          {/* System & Currency Card */}
          <div className="card settings-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">LOCALIZATION & APPEARANCE</p>
                <h2>Interface & Currency</h2>
              </div>
              <DollarSign size={18} />
            </div>

            <label>
              Preferred Currency
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="₹">₹ Indian Rupee (INR)</option>
                <option value="$">$ US Dollar (USD)</option>
                <option value="€">€ Euro (EUR)</option>
                <option value="£">£ British Pound (GBP)</option>
              </select>
            </label>

            <label>
              Application Theme
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              >
                <option value="light">Light Mode (Fresh Mint)</option>
                <option value="dark">Dark Mode (Forest Slate)</option>
              </select>
            </label>

            <label>
              AI Advisor Tone
              <select
                value={aiPersonality}
                onChange={(e) =>
                  setAiPersonality(
                    e.target.value as 'Balanced' | 'Strict' | 'Encouraging'
                  )
                }
              >
                <option value="Balanced">Balanced (Realistic Student Guidance)</option>
                <option value="Strict">Strict (Aggressive Savings Push)</option>
                <option value="Encouraging">Encouraging (Celebrates Every Small Win)</option>
              </select>
            </label>
          </div>
        </div>

        <div className="card settings-card" style={{ marginTop: '20px' }}>
          <div className="card-head">
            <div>
              <p className="eyebrow">NOTIFICATIONS & PRIVACY</p>
              <h2>Alert Preferences</h2>
            </div>
            <Bell size={18} />
          </div>

          <div className="toggle-row">
            <div>
              <strong>Budget & Overspend Alerts</strong>
              <small>Notify me when any category crosses 85% utilization</small>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              aria-label="Toggle budget alerts"
            />
          </div>
        </div>

        <div className="settings-actions-bar" style={{ marginTop: '24px' }}>
          <button type="submit" className="primary-btn">
            <Save size={16} /> Save Changes
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleExportJSON}
          >
            <Download size={15} /> Export JSON Backup
          </button>
          <button
            type="button"
            className="danger-outline-btn"
            onClick={handleReset}
          >
            <RotateCcw size={15} /> Reset Demo Data
          </button>
        </div>
      </form>
    </div>
  )
}
