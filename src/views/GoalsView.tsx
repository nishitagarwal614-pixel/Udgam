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

  // Goal Form Fields
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState<number | ''>('')
  const [category, setCategory] = useState('Gadget')
  const [targetDate, setTargetDate] = useState('2027-06-30')
  const [initialDeposit, setInitialDeposit] = useState<number | ''>('')

  // Deposit Form Fields
  const [depositAmount, setDepositAmount] = useState<number | ''>(500)

  const openCreateModal = () => {
    setEditingGoal(null)
    setTitle('')
    setTargetAmount('')
    setCategory('Gadget')
    setTargetDate('2027-06-30')
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
    if (!title.trim() || !target || target <= 0) return

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

  // Calculate required monthly saving for a goal
  const calculateMonthlySaving = (goal: Goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)
    const deadline = new Date(goal.targetDate)
    const now = new Date('2026-09-02')
    const diffMonths = Math.max(
      1,
      (deadline.getFullYear() - now.getFullYear()) * 12 +
        (deadline.getMonth() - now.getMonth())
    )
    return Math.ceil(remaining / diffMonths)
  }

  return (
    <div className="goals-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">SAVINGS TARGETS & MILESTONES</p>
          <h1>Financial Goals</h1>
          <p className="muted">
            Track and fund your laptop, semester trips, and safety net with dynamic pacing.
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
        {goals.map((goal) => {
          const pct = Math.min(
            100,
            Math.round((goal.savedAmount / goal.targetAmount) * 100)
          )
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
                <span style={{ width: `${pct}%`, background: '#1f9d67' }} />
              </div>

              <div className="goal-stats-grid">
                <div className="goal-stat-item">
                  <span>Remaining</span>
                  <strong>{formatMoney(remaining)}</strong>
                </div>
                <div className="goal-stat-item">
                  <span>Required / Month</span>
                  <strong style={{ color: '#1f9d67' }}>{formatMoney(monthlyReq)}</strong>
                </div>
                <div className="goal-stat-item">
                  <span>Target Date</span>
                  <small>{goal.targetDate}</small>
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
        })}
      </div>

      {/* AI Pace Advisory */}
      <div className="card big-score" style={{ marginTop: '24px' }}>
        <p className="eyebrow">
          AI STRATEGY FOR {(profile.name.split(' ')[0] || 'NISHITA').toUpperCase()}
        </p>
        <h2>Auto-Allocate ₹2,400 / month</h2>
        <p>
          At your current pace of saving ₹3,800/month from allowance, your New M3 MacBook Pro
          will be fully funded by May 2027 (1 month ahead of schedule).
        </p>
      </div>

      {/* Create / Edit Goal Modal */}
      {isGoalModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGoalModalOpen(false)}>
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

            <p className="eyebrow">{editingGoal ? 'EDIT GOAL' : 'NEW SAVINGS GOAL'}</p>
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
                placeholder="e.g. Sony WH-1000XM5 Headphones"
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
                    setTargetAmount(e.target.value ? Number(e.target.value) : '')
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
                    setInitialDeposit(e.target.value ? Number(e.target.value) : '')
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
                  setDepositAmount(e.target.value ? Number(e.target.value) : '')
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
