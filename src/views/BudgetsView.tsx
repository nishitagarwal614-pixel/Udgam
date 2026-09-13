import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Category, Budget } from '../types'

interface BudgetsViewProps {
  onOpenAddExpense: () => void
  onSuccessToast: (msg: string) => void
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onOpenAddExpense,
  onSuccessToast,
}) => {
  const {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    categoryTotals,
    totalExpenses,
    formatMoney,
  } = useFinancial()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [category, setCategory] = useState<Category>('Food')
  const [limit, setLimit] = useState<number | ''>('')

  const openCreateModal = () => {
    setEditingBudget(null)
    setCategory('Food')
    setLimit(2500)
    setIsModalOpen(true)
  }

  const openEditModal = (b: Budget) => {
    setEditingBudget(b)
    setCategory(b.category)
    setLimit(b.limit)
    setIsModalOpen(true)
  }

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedLimit = Number(limit)
    if (!parsedLimit || parsedLimit <= 0) return

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        category,
        limit: parsedLimit,
      })
      onSuccessToast(`Updated ${category} budget to ${formatMoney(parsedLimit)}.`)
    } else {
      addBudget({
        category,
        limit: parsedLimit,
        period: 'monthly',
      })
      onSuccessToast(`Created ${category} budget of ${formatMoney(parsedLimit)}.`)
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string, cat: string) => {
    deleteBudget(id)
    onSuccessToast(`Removed budget limit for ${cat}.`)
  }

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalBudgetSpent = totalExpenses
  const overallPct =
    totalBudgetLimit > 0
      ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100)
      : 0

  return (
    <div className="budgets-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">STUDENT EXPENSE CONTROLS</p>
          <h1>Smart Budgets</h1>
          <p className="muted">
            Flexible guardrails built around student life. Spend with zero guilt within your limits.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button
            type="button"
            className="secondary-btn"
            onClick={onOpenAddExpense}
          >
            Record expense
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={openCreateModal}
          >
            <Plus size={16} /> Create budget
          </button>
        </div>
      </section>

      {/* Overall Allocation Summary Card */}
      <div className="module-grid" style={{ marginBottom: '24px' }}>
        <div className="card big-score">
          <p className="eyebrow">MONTHLY ALLOCATION STATUS</p>
          <strong>{formatMoney(totalBudgetSpent)} <small>of {formatMoney(totalBudgetLimit)}</small></strong>
          <p>
            {overallPct > 100
              ? 'You have exceeded your total monthly budget plan. Consider trimming non-essential dining.'
              : overallPct > 80
              ? 'You have consumed over 80% of your plan. Pace your discretionary spending.'
              : 'You are spending within safe limits, leaving ample headroom for savings.'}
          </p>
          <div className="progress" style={{ height: '10px', marginTop: '14px' }}>
            <span
              style={{
                width: `${Math.min(100, overallPct)}%`,
                background: overallPct > 100 ? '#ef4444' : overallPct > 80 ? '#d97706' : '#1f9d67',
              }}
            />
          </div>
          <div className="budget-meta">
            <span>
              {formatMoney(Math.max(0, totalBudgetLimit - totalBudgetSpent))} remaining
            </span>
            <span>{overallPct}% utilized</span>
          </div>
        </div>

      </div>

      {/* Category Budgets Grid */}
      <div className="category-budgets-grid">
        {budgets.map((b) => {
          const spent = categoryTotals[b.category] || 0
          const pct = Math.round((spent / b.limit) * 100)
          const isOver = pct > 100
          const isWarning = pct >= 80 && pct <= 100

          return (
            <div
              key={b.id}
              className={`card budget-category-card ${isOver ? 'over-budget' : isWarning ? 'warning-budget' : ''}`}
            >
              <div className="budget-card-top">
                <div className="budget-cat-badge">
                  <div className={`category-icon ${b.category.toLowerCase()}`}>
                    {b.category.slice(0, 3)}
                  </div>
                  <div>
                    <h3>{b.category}</h3>
                    <small>Monthly allowance</small>
                  </div>
                </div>

                <div className="budget-card-actions">
                  <button
                    type="button"
                    className="icon-btn-sm"
                    onClick={() => openEditModal(b)}
                    title="Edit limit"
                    aria-label={`Edit ${b.category} budget`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn-sm danger"
                    onClick={() => handleDelete(b.id, b.category)}
                    title="Delete budget"
                    aria-label={`Delete ${b.category} budget`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="budget-amount-row">
                <strong>{formatMoney(spent)}</strong>
                <span>of {formatMoney(b.limit)}</span>
              </div>

              <div className="progress">
                <span
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: isOver ? '#ef4444' : isWarning ? '#d97706' : '#1f9d67',
                  }}
                />
              </div>

              <div className="budget-card-footer">
                {isOver ? (
                  <span className="status-pill danger">
                    <AlertTriangle size={12} /> Over by {formatMoney(spent - b.limit)} ({pct}%)
                  </span>
                ) : isWarning ? (
                  <span className="status-pill warning">
                    <AlertTriangle size={12} /> {formatMoney(b.limit - spent)} left ({pct}%)
                  </span>
                ) : (
                  <span className="status-pill success">
                    <CheckCircle2 size={12} /> {formatMoney(b.limit - spent)} left ({pct}%)
                  </span>
                )}
                <small>{b.period}</small>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <form
            className="modal"
            style={{ maxWidth: '420px' }}
            onSubmit={handleSaveBudget}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={18} />
            </button>

            <p className="eyebrow">
              {editingBudget ? 'EDIT BUDGET' : 'NEW CATEGORY BUDGET'}
            </p>
            <h2>{editingBudget ? `Adjust ${editingBudget.category}` : 'Set Spending Limit'}</h2>
            <p className="muted" style={{ marginBottom: '16px' }}>
              Keep campus spending predictable with a monthly cap.
            </p>

            <label>
              Category
              <select
                value={category}
                disabled={!!editingBudget}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="Food">Food & Dining</option>
                <option value="Travel">Travel & Commute</option>
                <option value="Education">Education & Books</option>
                <option value="Shopping">Shopping & Gear</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bills">Hostel & Bills</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Monthly Limit ({formatMoney(0).charAt(0)})
              <input
                type="number"
                min="100"
                step="50"
                required
                value={limit}
                onChange={(e) =>
                  setLimit(e.target.value ? Number(e.target.value) : '')
                }
                placeholder="e.g. 4000"
              />
            </label>

            <div className="modal-actions-bar" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                <Save size={15} /> Save Budget
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
