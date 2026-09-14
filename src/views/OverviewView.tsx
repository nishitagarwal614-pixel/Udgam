import React, { useState } from 'react'
import {
  Wallet,
  CreditCard,
  Plus,
  ArrowRight,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Category, Transaction } from '../types'

interface OverviewViewProps {
  onOpenAddExpense: () => void
  onOpenAddIncome?: () => void
  onOpenScanner: () => void
  onOpenAffordModal?: () => void
  onOpenSafeModal?: () => void
  onOpenHealthModal?: () => void
  onSelectTransaction?: (tx: Transaction) => void
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenAddExpense,
  onOpenAddIncome,
}) => {
  const {
    totalIncome,
    totalExpenses,
    categoryTotals,
    topSpendingCategory,
    budgets,
    profile,
    setActiveView,
    setShowOnboarding,
    formatMoney,
  } = useFinancial()

  const [spendPeriod, setSpendPeriod] = useState<'this-month' | 'last-month'>('this-month')

  const totalBudgetLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const effectiveBudget =
    totalBudgetLimit > 0
      ? totalBudgetLimit
      : totalIncome > 0
        ? totalIncome
        : 15000
  const moneyUsed = totalExpenses
  const moneyLeft = Math.max(0, effectiveBudget - moneyUsed)

  // Calculate category percentages for the donut chart
  const categoriesList: { category: Category; label: string; color: string }[] = [
    { category: 'Food', label: 'Food & Dining', color: '#1f9d67' },
    { category: 'Education', label: 'Education & Books', color: '#8669c7' },
    { category: 'Travel', label: 'Travel & Commute', color: '#5385d5' },
    { category: 'Shopping', label: 'Shopping & Gear', color: '#c7764e' },
    { category: 'Subscriptions', label: 'Subscriptions', color: '#eab308' },
    { category: 'Other', label: 'Hostel & Other', color: '#94a3b8' },
  ]

  let cumulativePercent = 0
  const donutSegments = categoriesList.map((cat) => {
    let amount = 0
    if (cat.category === 'Other') {
      amount =
        (categoryTotals.Bills || 0) +
        (categoryTotals.Entertainment || 0) +
        (categoryTotals.Health || 0) +
        (categoryTotals.Other || 0)
    } else {
      amount = categoryTotals[cat.category] || 0
    }

    const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
    const start = cumulativePercent
    cumulativePercent += pct
    const end = Math.min(100, cumulativePercent)

    return {
      ...cat,
      amount,
      pct,
      start,
      end,
    }
  })

  const budgetPercent =
    totalBudgetLimit > 0
      ? Math.min(100, Math.round((totalExpenses / totalBudgetLimit) * 100))
      : 0
  const gaugeRadius = 38
  const gaugeCircumference = 2 * Math.PI * gaugeRadius
  const gaugeDashoffset =
    gaugeCircumference - (budgetPercent / 100) * gaugeCircumference
  const totalBudgetProgress = budgetPercent

  return (
    <div className="overview-view">
      {/* Top Header Section */}
      <section className="page-heading banner">
        <div>
          <h1>
            Good morning, {profile.name.split(' ')[0] || 'Student'} <span>✦</span>
          </h1>
          <p className="muted">
            Here's your live student cashflow, completely connected and in control.
          </p>
        </div>

        <div className="banner-actions">
          <button
            type="button"
            className="secondary-btn small"
            onClick={() => setShowOnboarding(true)}
            title="Update your answers and re-customize homepage"
          >
            <Sparkles size={13} /> Retake AI Setup
          </button>
        </div>
      </section>

      {/* Top 2 Metric Cards */}
      <section className="money-summary-grid">
        {/* Money Left Card */}
        <div className="money-summary-card left">
          <div className="money-card-icon-wrap left">
            <Wallet size={24} strokeWidth={2} />
          </div>
          <div className="money-card-content">
            <span className="money-card-label">MONEY LEFT</span>
            <strong className="money-card-value">{formatMoney(moneyLeft)}</strong>
            <p className="money-card-subtext">
              You can still spend {formatMoney(moneyLeft)} this month.
            </p>
          </div>
        </div>

        {/* Money Used Card */}
        <div className="money-summary-card used">
          <div className="money-card-icon-wrap used">
            <CreditCard size={24} strokeWidth={2} />
          </div>
          <div className="money-card-content">
            <span className="money-card-label">MONEY USED</span>
            <strong className="money-card-value">{formatMoney(moneyUsed)}</strong>
            <p className="money-card-subtext">
              Total expenditure logged across all categories.
            </p>
          </div>
        </div>
      </section>

      {/* Monthly Overview Card */}
      <section className="card monthly-overview-card">
        <div className="monthly-overview-header">
          <h3>Monthly Overview</h3>
          <p className="muted">Your budget, usage and remaining balance.</p>
        </div>

        <div className="monthly-overview-body">
          <div className="monthly-overview-stats">
            <div className="monthly-stat-item">
              <span className="stat-label">Total Budget</span>
              <strong className="stat-value">{formatMoney(effectiveBudget)}</strong>
            </div>

            <div className="monthly-stat-item">
              <span className="stat-label">Used</span>
              <strong className="stat-value">{formatMoney(moneyUsed)}</strong>
            </div>

            <div className="monthly-stat-item has-divider">
              <span className="stat-label">Left</span>
              <strong className="stat-value text-green">{formatMoney(moneyLeft)}</strong>
            </div>
          </div>

          {/* Circular Donut Gauge */}
          <div className="monthly-overview-gauge-container">
            <div className="gauge-box">
              <svg viewBox="0 0 100 100" className="gauge-svg">
                <circle
                  cx="50"
                  cy="50"
                  r={gaugeRadius}
                  fill="transparent"
                  stroke="var(--line)"
                  strokeWidth="9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={gaugeRadius}
                  fill="transparent"
                  stroke="#1f9d67"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${gaugeCircumference} ${gaugeCircumference}`}
                  strokeDashoffset={gaugeDashoffset}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="gauge-label">
                <strong>{budgetPercent}%</strong>
                <small>used</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Action Cards */}
      <section className="overview-action-grid">
        <button
          type="button"
          className="action-shortcut-card expense"
          onClick={onOpenAddExpense}
        >
          <div className="action-shortcut-left">
            <div className="action-icon-badge expense">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div className="action-shortcut-text">
              <strong>Add Expense</strong>
              <small>Track where your money goes</small>
            </div>
          </div>
          <ArrowRight size={17} className="action-arrow" />
        </button>

        <button
          type="button"
          className="action-shortcut-card income"
          onClick={onOpenAddIncome || onOpenAddExpense}
        >
          <div className="action-shortcut-left">
            <div className="action-icon-badge income">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div className="action-shortcut-text">
              <strong>Add Income</strong>
              <small>Increase your balance</small>
            </div>
          </div>
          <ArrowRight size={17} className="action-arrow" />
        </button>

        <button
          type="button"
          className="action-shortcut-card details"
          onClick={() => setActiveView('Budgets')}
        >
          <div className="action-shortcut-left">
            <div className="action-icon-badge details">
              <BarChart3 size={18} strokeWidth={2.2} />
            </div>
            <div className="action-shortcut-text">
              <strong>View Details</strong>
              <small>See full breakdown</small>
            </div>
          </div>
          <ArrowRight size={17} className="action-arrow" />
        </button>
      </section>

      {/* Main Grid: Spending Breakdown */}
      <section className="main-grid single-card">
        {/* Spending Overview Card */}
        <div className="card spend-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">LIVE SPENDING BREAKDOWN</p>
              <h2>Where your money went</h2>
            </div>
            <select
              value={spendPeriod}
              onChange={(e) =>
                setSpendPeriod(e.target.value as 'this-month' | 'last-month')
              }
              aria-label="Filter spend period"
            >
              <option value="this-month">
                This month ({new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})
              </option>
              <option value="last-month">
                Last month ({new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})
              </option>
            </select>
          </div>

          <div className="chart-wrap">
            {/* Real SVG Donut Chart */}
            <div className="donut-chart-box">
              <svg viewBox="0 0 160 160" className="donut-svg">
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="transparent"
                  stroke="var(--line)"
                  strokeWidth="18"
                />
                {totalExpenses > 0 ? (
                  donutSegments.map((seg, idx) => {
                    if (seg.pct <= 0) return null
                    const circumference = 2 * Math.PI * 62
                    const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`
                    const strokeDashoffset = -((seg.start / 100) * circumference)

                    return (
                      <circle
                        key={idx}
                        cx="80"
                        cy="80"
                        r="62"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 80 80)"
                      />
                    )
                  })
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="transparent"
                    stroke="var(--line)"
                    strokeWidth="18"
                  />
                )}
              </svg>
              <div className="donut-center-label">
                <strong>{formatMoney(totalExpenses)}</strong>
                <small>total spent</small>
              </div>
            </div>

            {/* Legend with Real Percentages */}
            <div className="legend">
              {donutSegments.map((seg, idx) => (
                <div key={idx} className="legend-row">
                  <span
                    className="legend-dot"
                    style={{ background: seg.color }}
                  />
                  <span>{seg.label}</span>
                  <strong>{formatMoney(seg.amount)}</strong>
                  <small>{seg.pct}%</small>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-footer">
            <span>
              <TrendingUp size={15} />{' '}
              <strong>{topSpendingCategory.category}</strong> is your top category ({topSpendingCategory.percentage}%)
            </span>
            <button
              type="button"
              className="text-btn"
              onClick={() => setActiveView('Transactions & History')}
            >
              Full History & Analytics <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Lower Grid: Smart Budget */}
      <section className="lower-grid single-card">
        {/* Smart Budget Card */}
        <div className="card budget-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">SMART BUDGET</p>
              <h2>
                {new Date().toLocaleDateString('en-IN', {
                  month: 'long',
                })} Allocation
              </h2>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setActiveView('Budgets')}
              title="Manage category budgets"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="budget-total">
            <strong>{formatMoney(totalExpenses)}</strong>
            <span>of {formatMoney(totalBudgetLimit)} total limit</span>
          </div>

          <div className="progress">
            <span
              style={{
                width: `${totalBudgetProgress}%`,
                background: totalBudgetProgress > 90 ? '#ef4444' : '#1f9d67',
              }}
            />
          </div>

          <div className="budget-meta">
            <span>
              {formatMoney(Math.max(0, totalBudgetLimit - totalExpenses))} remaining
            </span>
            <span>{totalBudgetProgress}% used</span>
          </div>

          {/* Category Rows */}
          {budgets.length > 0 ? (
            budgets.slice(0, 4).map((b) => {
              const spent = categoryTotals[b.category] || 0
              const pct =
                b.limit > 0
                  ? Math.round((spent / b.limit) * 100)
                  : 0

              return (
                <div
                  key={b.id}
                  className="budget-row clickable"
                  onClick={() => setActiveView('Budgets')}
                >
                  <div className={`category-icon ${b.category.toLowerCase()}`}>
                    {b.category.slice(0, 3)}
                  </div>

                  <span>
                    {b.category}
                    <small>
                      {formatMoney(spent)} of {formatMoney(b.limit)}
                    </small>
                  </span>

                  <strong
                    style={{
                      color:
                        pct >= 100
                          ? '#ef4444'
                          : pct >= 80
                            ? '#d97706'
                            : '#1f9d67',
                    }}
                  >
                    {pct}%
                  </strong>
                </div>
              )
            })
          ) : (
            <div className="empty-text">
              No budgets set yet. Open Budgets to create your first category
              limit.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
