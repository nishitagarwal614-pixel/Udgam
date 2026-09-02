import React, { useState } from 'react'
import {
  X,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Target,
  ArrowRight,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Category, AffordabilityResult } from '../types'

interface CanIAffordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccessToast: (msg: string) => void
}

export const CanIAffordModal: React.FC<CanIAffordModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const {
    currentBalance,
    evaluateAffordability,
    addTransaction,
    addGoal,
    formatMoney,
  } = useFinancial()

  const [item, setItem] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [category, setCategory] = useState<Category>('Shopping')
  const [result, setResult] = useState<AffordabilityResult | null>(null)

  if (!isOpen) return null

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number(amount)
    if (!item.trim() || !parsedAmount || parsedAmount <= 0) return

    const res = evaluateAffordability(item.trim(), parsedAmount, category)
    setResult(res)
  }

  const handleAddAsExpense = () => {
    if (!result) return
    addTransaction({
      merchant: item.trim(),
      amount: result.purchaseAmount,
      category,
      date: new Date().toISOString().split('T')[0],
      displayDate: 'Today',
      type: 'expense',
      paymentMethod: 'UPI',
      notes: `Evaluated with "Can I Afford This?" (${result.verdict})`,
    })
    onSuccessToast(`Added ${item} (${formatMoney(result.purchaseAmount)}) as expense.`)
    onClose()
  }

  const handleCreateAsGoal = () => {
    if (!result) return
    addGoal({
      title: item.trim(),
      targetAmount: result.purchaseAmount,
      category: category,
      targetDate: '2026-11-30',
      color: 'mint',
      initialDeposit: 0,
    })
    onSuccessToast(`Turned "${item}" into a savings goal instead!`)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="badge-icon lavender">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="eyebrow">STUDENT AI DECISION TOOL</p>
            <h2>Can I Afford This?</h2>
          </div>
        </div>

        <p className="muted" style={{ marginBottom: '18px' }}>
          Test any purchase against your current balance ({formatMoney(currentBalance)}),
          monthly budgets, and upcoming commitments before spending.
        </p>

        <form onSubmit={handleEvaluate}>
          <label>
            What do you want to buy?
            <input
              autoFocus
              required
              value={item}
              onChange={(e) => {
                setItem(e.target.value)
                setResult(null)
              }}
              placeholder="e.g. Sony Noise Cancelling Headphones"
            />
          </label>

          <div className="form-row">
            <label>
              Cost ({formatMoney(0).charAt(0)})
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value ? Number(e.target.value) : '')
                  setResult(null)
                }}
                placeholder="e.g. 2499"
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category)
                  setResult(null)
                }}
              >
                <option value="Shopping">Shopping & Gadgets</option>
                <option value="Food">Food & Outing</option>
                <option value="Entertainment">Entertainment / Fest</option>
                <option value="Education">Course / Certification</option>
                <option value="Travel">Travel & Trip</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <button type="submit" className="primary-btn full" style={{ marginTop: '16px' }}>
            Analyze with AI Coach <ArrowRight size={16} />
          </button>
        </form>

        {result && (
          <div className="affordability-result-box" style={{ marginTop: '22px' }}>
            <div
              className={`verdict-badge ${
                result.verdict === 'CAN AFFORD'
                  ? 'success'
                  : result.verdict === 'CAUTION'
                  ? 'warning'
                  : 'danger'
              }`}
            >
              {result.verdict === 'CAN AFFORD' && <CheckCircle2 size={18} />}
              {result.verdict === 'CAUTION' && <AlertTriangle size={18} />}
              {result.verdict === 'NOT RECOMMENDED' && <XCircle size={18} />}
              <span>{result.verdict}</span>
            </div>

            <p className="verdict-explanation">{result.explanation}</p>

            <div className="metrics-summary-table">
              <div className="summary-row">
                <span>Current Balance</span>
                <strong>{formatMoney(currentBalance)}</strong>
              </div>
              <div className="summary-row">
                <span>Purchase Amount</span>
                <strong className="expense">-{formatMoney(result.purchaseAmount)}</strong>
              </div>
              <div className="summary-row highlight">
                <span>Balance After</span>
                <strong>{formatMoney(result.balanceAfter)}</strong>
              </div>
              <div className="summary-row">
                <span>Safe to Spend Impact</span>
                <small>{result.safeToSpendImpact}</small>
              </div>
              <div className="summary-row">
                <span>Goal Impact</span>
                <small>{result.goalImpact}</small>
              </div>
              <div className="summary-row">
                <span>Month-End Buffer</span>
                <small>{result.monthEndImpact}</small>
              </div>
            </div>

            <div className="modal-actions-bar" style={{ marginTop: '18px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCreateAsGoal}
              >
                <Target size={15} /> Save as Goal Instead
              </button>
              {result.verdict !== 'NOT RECOMMENDED' && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleAddAsExpense}
                >
                  <PlusCircle size={15} /> Buy & Record
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
