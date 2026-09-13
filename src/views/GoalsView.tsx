import React, { useState } from 'react'
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Goal } from '../types'

interface GoalsViewProps {
  onSuccessToast: (msg: string) => void
}

export const GoalsView: React.FC<GoalsViewProps> = ({ onSuccessToast }) => {
  const {
    goals,
    profile,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    currentBalance,
    formatMoney,
  } = useFinancial()

  // Modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [activeGoalForDeposit, setActiveGoalForDeposit] = useState<Goal | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Goal form fields
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState<number | ''>('')
  const [category, setCategory] = useState('Gadget')
  const [targetDate, setTargetDate] = useState('')
  const [initialDeposit, setInitialDeposit] = useState<number | ''>('')

  // Deposit form fields
  const [depositAmount, setDepositAmount] = useState<number | ''>(500)

  const openCreateModal = () => {
    setEditingGoal(null)
    setTitle('')
    setTargetAmount('')
    setCategory('Gadget')
    setTargetDate('')
    setInitialDeposit('')
    setIsGoalModalOpen(true)
  }

  const openEditModal = (g: Goal) => {
    setEditingGoal(g)
    setTitle(g.title)
    setTargetAmount(g.targetAmount)
    setCategory(g.category)
    setTargetDate(g.targetDate)
    setInitialDeposit('')
    setIsGoalModalOpen(true)
  }

  const openDepositModal = (g: Goal) => {
    setActiveGoalForDeposit(g)
    setDepositAmount(500)
    setIsDepositModalOpen(true)
  }

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()

    const target = Number(targetAmount)
    if (!title.trim() || !target || target <= 0 || !targetDate) return

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: target,
        category,
        targetDate,
      })
      onSuccessToast(`Updated goal: ${title.trim()}`)
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: target,
        category,
        targetDate,
        color: 'mint',
        initialDeposit: initialDeposit ? Number(initialDeposit) : 0,
      })
      onSuccessToast(`Goal "${title.trim()}" created!`)
    }

    setIsGoalModalOpen(false)
  }

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGoalForDeposit) return

    const amount = Number(depositAmount)
    if (!amount || amount <= 0) return

    if (amount > currentBalance) {
      onSuccessToast('Deposit amount exceeds your current liquid balance.')
      return
    }

    contributeToGoal(activeGoalForDeposit.id, amount)
    onSuccessToast(`Transferred ${formatMoney(amount)} into ${activeGoalForDeposit.title}!`)
    setIsDepositModalOpen(false)
  }

  const handleDelete = (id: string, goalTitle: string) => {
    deleteGoal(id)
    onSuccessToast(`Deleted goal: ${goalTitle}`)
  }

  // Calculate required monthly saving from today's actual date.
  const calculateMonthlySaving = (goal: Goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)
    if (remaining <= 0) return 0

    const deadline = new Date(`${goal.targetDate}T23:59:59`)
    const now = new Date()

    if (deadline.getTime() <= now.getTime()) {
      return remaining
    }

    const months =
      (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth()) +
      (deadline.getDate() >= now.getDate() ? 0 : -1)

    const monthsRemaining = Math.max(1, months)

    return Math.ceil(remaining / monthsRemaining)
  }

  const formatTargetDate = (date: string) => {
    if (!date) return '—'

    const parsed = new Date(`${date}T12:00:00`)
    if (Number.isNaN(parsed.getTime())) return date

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // The strategy card is based only on the user's actual goals and profile.
  const primaryGoal = goals[0] ?? null
  const primaryGoalMonthlyRequirement = primaryGoal
    ? calculateMonthlySaving(primaryGoal)
    : 0

  const displayName = profile.name?.trim() || 'you'
  const monthlyAllowance = Number(profile.monthlyAllowance) || 0

  const allocationPercent =
    monthlyAllowance > 0 && primaryGoalMonthlyRequirement > 0
      ? Math.round((primaryGoalMonthlyRequirement / monthlyAllowance) * 100)
      : 0

  const strategyTitle = primaryGoal
    ? primaryGoal.savedAmount >= primaryGoal.targetAmount
      ? 'Goal fully funded'
      : `Set aside ${formatMoney(primaryGoalMonthlyRequirement)} / month`
    : 'Create a goal to get a savings strategy'

  const strategyDescription = primaryGoal
    ? primaryGoal.savedAmount >= primaryGoal.targetAmount
      ? `${primaryGoal.title} has reached its target. You can create another goal whenever you are ready.`
      : monthlyAllowance > 0
        ? `To reach ${primaryGoal.title} by ${formatTargetDate(primaryGoal.targetDate)}, the remaining ${formatMoney(
            Math.max(0, primaryGoal.targetAmount - primaryGoal.savedAmount)
          )} requires about ${formatMoney(primaryGoalMonthlyRequirement)} per month. That is approximately ${allocationPercent}% of your recorded monthly allowance.`
        : `To reach ${primaryGoal.title} by ${formatTargetDate(primaryGoal.targetDate)}, the remaining ${formatMoney(
            Math.max(0, primaryGoal.targetAmount - primaryGoal.savedAmount)
          )} requires about ${formatMoney(primaryGoalMonthlyRequirement)} per month.`
    : 'Your personalized strategy will appear here after you create a savings goal with a target amount and deadline.'

  return (
    <div className="goals-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">SAVINGS TARGETS & MILESTONES</p>
          <h1>Financial Goals</h1>
          <p className="muted">
            Create and fund savings targets with a monthly pace calculated from your actual goal data.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={openCreateModal}
        >
          <Plus size={16} /> Create new goal
        </button>
      </section>

      {/* Goals Grid */}
      <div className="goals-cards-grid">
        {goals.length === 0 ? (
          <div className="card goal-empty-state">
            <div className="badge-icon mint">
              <Target size={20} />
            </div>
            <h3>No savings goals yet</h3>
            <p className="muted">
              Create your first goal and Finwise will calculate the amount you need to set aside each month.
            </p>
            <button
              type="button"
              className="primary-btn"
              onClick={openCreateModal}
            >
              <Plus size={15} /> Create your first goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Math.min(
                    100,
                    Math.round((goal.savedAmount / goal.targetAmount) * 100)
                  )
                : 0

            const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)
            const monthlyReq = calculateMonthlySaving(goal)

            return (
              <div key={goal.id} className="card goal-item-card">
                <div className="goal-card-header">
                  <div className="goal-title-block">
                    <div className="badge-icon mint">
                      <Target size={18} />
                    </div>

                    <div>
                      <span className="goal-category-tag">{goal.category}</span>
                      <h3>{goal.title}</h3>
                    </div>
                  </div>

                  <div className="goal-header-actions">
                    <button
                      type="button"
                      className="icon-btn-sm"
                      onClick={() => openEditModal(goal)}
                      title="Edit goal"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      className="icon-btn-sm danger"
                      onClick={() => handleDelete(goal.id, goal.title)}
                      title="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="goal-financials-display">
                  <div className="goal-saved-col">
                    <strong>{formatMoney(goal.savedAmount)}</strong>
                    <small>Saved of {formatMoney(goal.targetAmount)}</small>
                  </div>

                  <span className="goal-percent-badge">{pct}%</span>
                </div>

                <div className="progress" style={{ height: '9px' }}>
                  <span
                    style={{
                      width: `${pct}%`,
                      background: '#1f9d67',
                    }}
                  />
                </div>

                <div className="goal-stats-grid">
                  <div className="goal-stat-item">
                    <span>Remaining</span>
                    <strong>{formatMoney(remaining)}</strong>
                  </div>

                  <div className="goal-stat-item">
                    <span>Required / Month</span>
                    <strong style={{ color: '#1f9d67' }}>
                      {formatMoney(monthlyReq)}
                    </strong>
                  </div>

                  <div className="goal-stat-item">
                    <span>Target Date</span>
                    <small>{formatTargetDate(goal.targetDate)}</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn full"
                  style={{ marginTop: '16px' }}
                  onClick={() => openDepositModal(goal)}
                >
                  <Plus size={15} /> Add Money to Goal
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Dynamic AI Pace Advisory */}
      <div className="card big-score" style={{ marginTop: '24px' }}>
        <p className="eyebrow">
          {primaryGoal ? `AI STRATEGY FOR ${displayName.toUpperCase()}` : 'AI SAVINGS STRATEGY'}
        </p>

        <h2>{strategyTitle}</h2>

        <p>{strategyDescription}</p>
      </div>

      {/* Create / Edit Goal Modal */}
      {isGoalModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsGoalModalOpen(false)}
        >
          <form
            className="modal"
            style={{ maxWidth: '440px' }}
            onSubmit={handleSaveGoal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsGoalModalOpen(false)}
            >
              <X size={18} />
            </button>

            <p className="eyebrow">
              {editingGoal ? 'EDIT GOAL' : 'NEW SAVINGS GOAL'}
            </p>

            <h2>{editingGoal ? 'Modify Target' : 'Create a Student Goal'}</h2>

            <p className="muted" style={{ marginBottom: '16px' }}>
              Set a target and deadline. Finwise will automatically compute the monthly saving pace.
            </p>

            <label>
              Goal Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New headphones, trip, course..."
              />
            </label>

            <div className="form-row">
              <label>
                Target Amount (₹)
                <input
                  type="number"
                  min="500"
                  step="100"
                  required
                  value={targetAmount}
                  onChange={(e) =>
                    setTargetAmount(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  placeholder="e.g. 25000"
                />
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Gadget">Gadget & Tech</option>
                  <option value="Travel">Travel & Trip</option>
                  <option value="Security">Emergency Fund</option>
                  <option value="Education">Course / Certificate</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <label>
              Target Date
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </label>

            {!editingGoal && (
              <label>
                Initial Deposit from Balance (Optional ₹)
                <input
                  type="number"
                  min="0"
                  value={initialDeposit}
                  onChange={(e) =>
                    setInitialDeposit(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  placeholder="e.g. 1000"
                />
              </label>
            )}

            <div className="modal-actions-bar" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsGoalModalOpen(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                <Save size={15} /> Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Money (Deposit) Modal */}
      {isDepositModalOpen && activeGoalForDeposit && (
        <div
          className="modal-backdrop"
          onClick={() => setIsDepositModalOpen(false)}
        >
          <form
            className="modal"
            style={{ maxWidth: '400px' }}
            onSubmit={handleDepositSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsDepositModalOpen(false)}
            >
              <X size={18} />
            </button>

            <p className="eyebrow">FUND GOAL</p>

            <h2>Deposit into {activeGoalForDeposit.title}</h2>

            <p className="muted" style={{ marginBottom: '14px' }}>
              Transfers funds from your liquid balance ({formatMoney(currentBalance)}) into this target.
            </p>

            <label>
              Deposit Amount (₹)
              <input
                type="number"
                min="50"
                max={currentBalance}
                step="50"
                required
                autoFocus
                value={depositAmount}
                onChange={(e) =>
                  setDepositAmount(
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
                placeholder="e.g. 500"
              />
            </label>

            <div className="quick-deposit-presets" style={{ marginTop: '10px' }}>
              {[200, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="tab-pill"
                  onClick={() => setDepositAmount(preset)}
                >
                  +{formatMoney(preset)}
                </button>
              ))}
            </div>

            <div className="modal-actions-bar" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsDepositModalOpen(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                <CheckCircle2 size={15} /> Confirm Deposit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
