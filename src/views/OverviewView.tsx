import React, { useState } from 'react'
import {
  Wallet,
  CreditCard,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Target,
  HelpCircle,
  Search,
  Sparkles,
  Gauge,
  Bot,
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
  onOpenAffordModal,
  onOpenSafeModal,
  onOpenHealthModal,
  onSelectTransaction,
}) => {
  const {
    totalIncome,
    totalExpenses,
    currentBalance,
    safeToSpend,
    healthScore,
    predictedMonthEnd,
    categoryTotals,
    topSpendingCategory,
    budgets,
    goals,
    transactions,
    profile,
    setActiveView,
    setShowOnboarding,
    formatMoney,
  } = useFinancial()

  const [query, setQuery] = useState('')
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

  const filteredRecent = transactions
    .filter((t) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      )
    })
    .slice(0, 5)

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

  // Primary goal
  const primaryGoal = goals[0] || null
  const goalPercent = primaryGoal
    ? Math.min(
        100,
        Math.round((primaryGoal.savedAmount / primaryGoal.targetAmount) * 100)
      )
    : 0

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

      {/* Image 4 Components: Top 2 Metric Cards */}
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

      {/* KPI Metric Grid */}
      <section className="metric-grid">
        <div
          className="metric card clickable"
          onClick={() => setActiveView('Transactions & History')}
          title="Click to view all transactions"
        >
          <div className="metric-icon mint">
            <Wallet size={18} />
          </div>
          <span>Total Balance</span>
          <strong>{formatMoney(currentBalance)}</strong>
          <small className="positive">
            <TrendingUp size={12} /> Projected month-end: {formatMoney(predictedMonthEnd)}
          </small>
        </div>

        <div
          className="metric card clickable"
          onClick={() => setActiveView('Transactions & History')}
          title="Click to view income history"
        >
          <div className="metric-icon blue">
            <ArrowDownRight size={18} />
          </div>
          <span>Money In ({new Date().toLocaleDateString('en-IN', { month: 'short' })})</span>
          <strong>{formatMoney(totalIncome)}</strong>
          <small>Pocket allowance & merit grants</small>
        </div>

        <div
          className="metric card clickable"
          onClick={() => setActiveView('Transactions & History')}
          title="Click to view expense history"
        >
          <div className="metric-icon peach">
            <ArrowUpRight size={18} />
          </div>
          <span>Money Out ({new Date().toLocaleDateString('en-IN', { month: 'short' })})</span>
          <strong>{formatMoney(totalExpenses)}</strong>
          <small>
            Top: {topSpendingCategory.category} ({topSpendingCategory.percentage}%)
          </small>
        </div>

        <div
          className="metric card clickable"
          onClick={onOpenHealthModal}
          title="Click to see complete Health Score breakdown"
        >
          <div className="metric-icon lavender">
            <Gauge size={18} />
          </div>
          <span>Financial Health</span>
          <strong>{healthScore.overall} / 100</strong>
          <small>
              {totalIncome === 0 && totalExpenses === 0
                ? 'Add financial activity to calculate your score'
                : 'Tap for complete score breakdown'}
            </small>
        </div>
      </section>

      {/* Image 4 Components: Monthly Overview Card */}
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

      {/* Image 4 Components: 3 Action Cards */}
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

        {/* AI Coach Card */}
        <div className="card coach-card">
          <div className="coach-top-row">
            <div className="coach-orb">
              <Bot size={24} />
            </div>
            <span className="badge-pill">Finwise AI</span>
          </div>

          <p className="eyebrow">YOUR CONTEXTUAL COACH</p>
          <h2>One small shift, a bigger month.</h2>
          <p>
            {totalExpenses > 0 ? (
              <>
                Your highest spending category is{' '}
                <strong>{topSpendingCategory.category}</strong> at{' '}
                <strong>{formatMoney(topSpendingCategory.amount)}</strong>.
                Keeping your daily spending near{' '}
                <strong>{formatMoney(safeToSpend.safeDaily)}</strong> can help
                protect your projected month-end balance.
              </>
            ) : (
              <>
                Start recording your income and expenses to receive
                personalized spending guidance based on your actual data.
              </>
            )}
          </p>

          <div className="coach-actions-cluster">
            <button
              type="button"
              className="dark-btn"
              onClick={() => setActiveView('AI Coach')}
            >
              Ask Finwise AI <Sparkles size={16} />
            </button>
            <button
              type="button"
              className="why-btn"
              onClick={onOpenSafeModal}
            >
              Why this advice?
            </button>
          </div>
        </div>
      </section>

      {/* Lower Grid: Recent Activity + Smart Budget */}
      <section className="lower-grid">
        {/* Recent Activity Card */}
        <div className="card transactions-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">RECENT ACTIVITY</p>
              <h2>Latest Transactions</h2>
            </div>
            <button
              type="button"
              className="text-btn"
              onClick={() => setActiveView('Transactions & History')}
            >
              See all ({transactions.length}) <ChevronRight size={15} />
            </button>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search merchant, category, or note..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="transaction-list">
            {filteredRecent.length === 0 ? (
              <p className="empty-text">
                {transactions.length === 0
                  ? 'No transactions recorded yet. Add your first income or expense to get started.'
                  : 'No transactions match your search.'}
              </p>
            ) : (
              filteredRecent.map((item) => (
                <div
                  key={item.id}
                  className="transaction clickable"
                  onClick={() => onSelectTransaction?.(item)}
                  title="Click to view, edit, or delete"
                >
                  <div
                    className={`merchant-icon ${item.category.toLowerCase()}`}
                  >
                    {item.category.slice(0, 3)}
                  </div>
                  <div className="transaction-name">
                    <strong>{item.merchant}</strong>
                    <small>
                      {item.category} · {item.displayDate || item.date}
                      {item.paymentMethod ? ` · ${item.paymentMethod}` : ''}
                    </small>
                  </div>
                  <strong
                    className={item.type === 'income' ? 'income' : 'expense'}
                  >
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amount)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>

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

      {/* Quick Action Grid */}
      <section className="quick-grid">
        {/* Goal Card */}
        <div
          className="quick-card card clickable"
          onClick={() => setActiveView('Goals')}
          title="Open savings goals"
        >
          <div className="quick-icon mint">
            <Target size={18} />
          </div>

          <div className="quick-info">
            {primaryGoal ? (
              <>
                <strong>Save for {primaryGoal.title}</strong>
                <small>
                  {formatMoney(primaryGoal.savedAmount)} of{' '}
                  {formatMoney(primaryGoal.targetAmount)}
                </small>
              </>
            ) : (
              <>
                <strong>Create a savings goal</strong>
                <small>Set a target and start tracking progress</small>
              </>
            )}
          </div>

          {primaryGoal ? <b>{goalPercent}%</b> : <b>Set up</b>}

          <ChevronRight size={16} />
        </div>

        {/* Safe to Spend Today Card */}
        <div
          className="quick-card card clickable"
          onClick={onOpenSafeModal}
          title="Click to see full Safe to Spend breakdown"
        >
          <div className="quick-icon lavender">
            <Sparkles size={18} />
          </div>
          <div className="quick-info">
            <strong>Safe to spend today</strong>
            <small>Tap to see formula & upcoming bills</small>
          </div>
          <b>{formatMoney(safeToSpend.safeDaily)}</b>
          <ChevronRight size={16} />
        </div>

        {/* Can I Afford This? Card */}
        <div
          className="quick-card card clickable"
          onClick={onOpenAffordModal}
          title="Test an upcoming expense before buying"
        >
          <div className="quick-icon peach">
            <HelpCircle size={18} />
          </div>
          <div className="quick-info">
            <strong>Can I Afford This?</strong>
            <small>AI impact prediction engine</small>
          </div>
          <b>Check</b>
          <ChevronRight size={16} />
        </div>
      </section>
    </div>
  )
}
