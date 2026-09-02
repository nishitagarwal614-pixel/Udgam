import React from 'react'
import { X, Gauge, CheckCircle2, AlertCircle } from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface FinancialHealthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FinancialHealthModal: React.FC<FinancialHealthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { healthScore, moneyRunwayDays } = useFinancial()

  if (!isOpen) return null

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
            <Gauge size={20} />
          </div>
          <div>
            <p className="eyebrow">STUDENT FINANCIAL HEALTH</p>
            <h2>Score Breakdown: {healthScore.overall} / 100</h2>
          </div>
        </div>

        <p className="muted" style={{ marginBottom: '18px' }}>
          Your score reflects your campus cashflow resilience, discipline against category limits,
          savings rate, and goal progress.
        </p>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-header">
              <span>Budget Discipline</span>
              <strong>{healthScore.budgetDisciplineScore} / 30</strong>
            </div>
            <div className="progress">
              <span
                style={{
                  width: `${(healthScore.budgetDisciplineScore / 30) * 100}%`,
                }}
              />
            </div>
            <small>Adherence to monthly Food, Travel, and Books limits</small>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <span>Savings Rate</span>
              <strong>{healthScore.savingsRateScore} / 25</strong>
            </div>
            <div className="progress">
              <span
                style={{
                  width: `${(healthScore.savingsRateScore / 25) * 100}%`,
                }}
              />
            </div>
            <small>Surplus saved from your allowance and stipends</small>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <span>Cash Runway Stability</span>
              <strong>{healthScore.runwayScore} / 25</strong>
            </div>
            <div className="progress">
              <span
                style={{
                  width: `${(healthScore.runwayScore / 25) * 100}%`,
                }}
              />
            </div>
            <small>Current cushion can sustain ~{moneyRunwayDays} days of average spending</small>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <span>Goal Progress Pace</span>
              <strong>{healthScore.goalPaceScore} / 20</strong>
            </div>
            <div className="progress">
              <span
                style={{
                  width: `${(healthScore.goalPaceScore / 20) * 100}%`,
                }}
              />
            </div>
            <small>Velocity towards your M3 MacBook & Goa trip</small>
          </div>
        </div>

        <div className="health-feedback-section" style={{ marginTop: '20px' }}>
          <div className="feedback-column">
            <h4 style={{ color: '#1f9d67', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Key Strengths
            </h4>
            <ul>
              {healthScore.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="feedback-column" style={{ marginTop: '14px' }}>
            <h4 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> High-Impact Improvements
            </h4>
            <ul>
              {healthScore.improvements.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          className="primary-btn full"
          style={{ marginTop: '22px' }}
          onClick={onClose}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
