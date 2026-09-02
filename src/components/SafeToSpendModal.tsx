import React from 'react'
import { X, Sparkles, ShieldCheck, Info } from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface SafeToSpendModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SafeToSpendModal: React.FC<SafeToSpendModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { safeToSpend, formatMoney } = useFinancial()

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="badge-icon mint">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="eyebrow">MATHEMATICAL TRANSPARENCY</p>
            <h2>How Safe to Spend is Calculated</h2>
          </div>
        </div>

        <div className="safe-spend-hero-box">
          <span>Your Recommended Limit Today</span>
          <strong>{formatMoney(safeToSpend.safeDaily)}</strong>
          <small>Guarantees you never run short before month-end allowance</small>
        </div>

        <div className="formula-step-breakdown">
          <div className="formula-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <span className="step-title">Current Liquid Balance</span>
              <p className="step-sub">Total bank and UPI funds available right now</p>
              <strong>+{formatMoney(safeToSpend.currentBalance)}</strong>
            </div>
          </div>

          <div className="formula-step minus">
            <div className="step-num">2</div>
            <div className="step-content">
              <span className="step-title">Upcoming Recurring Subscriptions & Bills</span>
              <p className="step-sub">Committed student expenses (Netflix, Spotify, Wi-Fi)</p>
              <strong className="expense">-{formatMoney(safeToSpend.upcomingBillsTotal)}</strong>
            </div>
          </div>

          <div className="formula-step minus">
            <div className="step-num">3</div>
            <div className="step-content">
              <span className="step-title">Monthly Goal Savings Protection Buffer</span>
              <p className="step-sub">Protected reserve so you hit your Laptop target</p>
              <strong className="expense">-{formatMoney(safeToSpend.savingsBufferTotal)}</strong>
            </div>
          </div>

          <div className="formula-divider" />

          <div className="formula-step pool">
            <div className="step-num">=</div>
            <div className="step-content">
              <span className="step-title">Available Discretionary Pool</span>
              <strong>{formatMoney(safeToSpend.availablePool)}</strong>
            </div>
          </div>

          <div className="formula-step divide">
            <div className="step-num">÷</div>
            <div className="step-content">
              <span className="step-title">Days Remaining in September</span>
              <strong>{safeToSpend.daysRemainingInMonth} days</strong>
            </div>
          </div>

          <div className="formula-result-banner">
            <ShieldCheck size={18} />
            <span>
              Result: <strong>{formatMoney(safeToSpend.safeDaily)} / day</strong> keeps you safe and financially healthy.
            </span>
          </div>
        </div>

        <div className="tip-box">
          <Info size={15} />
          <span>
            If you spend under this today, your limit for tomorrow automatically rises!
          </span>
        </div>

        <button
          type="button"
          className="primary-btn full"
          style={{ marginTop: '20px' }}
          onClick={onClose}
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  )
}
