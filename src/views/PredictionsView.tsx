import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Zap,
  RotateCcw,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface PredictionsViewProps {
  onSuccessToast: (msg: string) => void
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  onSuccessToast,
}) => {
  const {
    currentBalance,
    totalIncome,
    totalExpenses,
    safeToSpend,
    predictedMonthEnd,
    formatMoney,
  } = useFinancial()

  // What-If Simulator Controls
  const [simIncomeDelta, setSimIncomeDelta] = useState(0) // slider: -5000 to +10000
  const [simDailySpendChange, setSimDailySpendChange] = useState(0) // slider: -150 to +300
  const [simOneTimePurchase, setSimOneTimePurchase] = useState(0) // slider: 0 to 5000

  // Digital Twin Active Scenario
  const [twinScenario, setTwinScenario] = useState<'baseline' | 'food20' | 'save1k' | 'freelance'>('baseline')

  // Calculate What-If simulated results
  const simulatedResults = useMemo(() => {
    const daysLeft = 28
    const baseDailySpend = safeToSpend.safeDaily
    const newDailySpend = Math.max(50, baseDailySpend + simDailySpendChange)
    const simulatedTotalOutflow = newDailySpend * daysLeft + safeToSpend.upcomingBillsTotal + simOneTimePurchase
    const simulatedTotalInflow = totalIncome + simIncomeDelta
    const simulatedEndingBalance = Math.max(
      0,
      currentBalance + simIncomeDelta - (newDailySpend * daysLeft) - simOneTimePurchase - safeToSpend.upcomingBillsTotal
    )
    const deltaFromBaseline = simulatedEndingBalance - predictedMonthEnd

    return {
      newDailySpend,
      simulatedEndingBalance,
      deltaFromBaseline,
      simulatedTotalInflow,
      simulatedTotalOutflow,
    }
  }, [currentBalance, totalIncome, safeToSpend, simIncomeDelta, simDailySpendChange, simOneTimePurchase, predictedMonthEnd])

  // Digital Twin 6-Month Projections
  const twinProjections = useMemo(() => {
    const baseMonthlySavings = Math.max(1000, totalIncome - totalExpenses)

    switch (twinScenario) {
      case 'food20': {
        const extraSaved = 800
        const monthly = baseMonthlySavings + extraSaved
        return {
          title: 'Reduce Food Delivery by 20%',
          sixMonthSavings: monthly * 6,
          gain: extraSaved * 6,
          description:
            'By substituting 2 restaurant/Swiggy orders each week with mess dining, you pocket an extra ₹800/month.',
          milestone: 'Laptop goal deadline moves up by 2 full months.',
        }
      }
      case 'save1k': {
        const extraSaved = 1000
        const monthly = baseMonthlySavings + extraSaved
        return {
          title: 'Save ₹1,000 Extra / Month',
          sixMonthSavings: monthly * 6,
          gain: extraSaved * 6,
          description:
            'Automating a ₹250 weekly micro-deposit right when pocket money arrives builds effortless long-term momentum.',
          milestone: 'Fully covers your Semester-end Goa trip with zero debt.',
        }
      }
      case 'freelance': {
        const extraEarned = 3500
        const monthly = baseMonthlySavings + extraEarned
        return {
          title: 'Weekend Tutoring / Coding Gig',
          sixMonthSavings: monthly * 6,
          gain: extraEarned * 6,
          description:
            'Taking a 4-hour weekend campus lab tutoring or coding freelance gig adds ₹3,500/month in discretionary stipend.',
          milestone: 'MacBook Pro goal fully funded by December 2026.',
        }
      }
      default: {
        return {
          title: 'Current Behavior (Baseline)',
          sixMonthSavings: baseMonthlySavings * 6,
          gain: 0,
          description:
            'Maintaining your current balance between campus mess, occasional Swiggy, and steady stipend income.',
          milestone: 'Steady progress toward goals; keeps safety cushion intact.',
        }
      }
    }
  }, [twinScenario, totalIncome, totalExpenses])

  const resetWhatIf = () => {
    setSimIncomeDelta(0)
    setSimDailySpendChange(0)
    setSimOneTimePurchase(0)
    onSuccessToast('Reset What-If simulator to current live baseline.')
  }

  return (
    <div className="predictions-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">FINANCIAL DIGITAL TWIN & FORECASTING</p>
          <h1>Cashflow Predictions</h1>
          <p className="muted">
            Simulate your future financial trajectory, test scenarios, and project month-end buffers.
          </p>
        </div>
      </section>

      {/* Feature 1: Month-End Balance Projection Curve */}
      <div className="card prediction-hero-card" style={{ marginBottom: '24px' }}>
        <div className="prediction-hero-content">
          <div>
            <p className="eyebrow">PROJECTED MONTH-END BALANCE</p>
            <strong className="prediction-amount">{formatMoney(predictedMonthEnd)}</strong>
            <p className="muted">
              Based on your {formatMoney(safeToSpend.safeDaily)}/day safe-to-spend allowance,
              current balance of {formatMoney(currentBalance)}, and {formatMoney(safeToSpend.upcomingBillsTotal)} in scheduled bills.
            </p>
          </div>

          {/* Clean Interactive SVG Line Chart */}
          <div className="prediction-graph-container">
            <svg viewBox="0 0 360 140" className="prediction-chart-svg">
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f9d67" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1f9d67" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="35" x2="360" y2="35" stroke="var(--line)" strokeDasharray="3" />
              <line x1="0" y1="75" x2="360" y2="75" stroke="var(--line)" strokeDasharray="3" />
              <line x1="0" y1="115" x2="360" y2="115" stroke="var(--line)" strokeDasharray="3" />

              {/* Shaded Area */}
              <path
                d="M 20 40 Q 110 50, 200 70 T 340 90 L 340 130 L 20 130 Z"
                fill="url(#predGrad)"
              />

              {/* Main Trend Line */}
              <path
                d="M 20 40 Q 110 50, 200 70 T 340 90"
                fill="none"
                stroke="#1f9d67"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Current Date Dot */}
              <circle cx="20" cy="40" r="5" fill="#1f9d67" />
              <circle cx="340" cy="90" r="5" fill="#1f9d67" />
            </svg>

            <div className="graph-labels-row">
              <span>02 Sep (Today: {formatMoney(currentBalance)})</span>
              <span>15 Sep (Mid-month)</span>
              <span>30 Sep ({formatMoney(predictedMonthEnd)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: WHAT-IF SIMULATOR */}
      <div className="card whatif-card" style={{ marginBottom: '24px' }}>
        <div className="card-head">
          <div>
            <p className="eyebrow">INTERACTIVE SANDBOX</p>
            <h2>What-If Simulator</h2>
            <p className="muted">
              Slide parameters to see immediate ripple effects on your month-end reserves.
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn small"
            onClick={resetWhatIf}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="whatif-controls-grid">
          {/* Slider 1: Monthly Income Delta */}
          <div className="slider-box">
            <div className="slider-header">
              <span>Monthly Allowance / Stipend Change</span>
              <strong>
                {simIncomeDelta >= 0 ? `+${formatMoney(simIncomeDelta)}` : `-${formatMoney(Math.abs(simIncomeDelta))}`}
              </strong>
            </div>
            <input
              type="range"
              min="-4000"
              max="8000"
              step="500"
              value={simIncomeDelta}
              onChange={(e) => setSimIncomeDelta(Number(e.target.value))}
            />
            <div className="slider-hints">
              <span>-₹4,000</span>
              <span>Baseline</span>
              <span>+₹8,000</span>
            </div>
          </div>

          {/* Slider 2: Daily Spending Change */}
          <div className="slider-box">
            <div className="slider-header">
              <span>Daily Spend Adjustment</span>
              <strong>
                {simDailySpendChange >= 0
                  ? `+${formatMoney(simDailySpendChange)} / day`
                  : `-${formatMoney(Math.abs(simDailySpendChange))} / day`}
              </strong>
            </div>
            <input
              type="range"
              min="-150"
              max="250"
              step="25"
              value={simDailySpendChange}
              onChange={(e) => setSimDailySpendChange(Number(e.target.value))}
            />
            <div className="slider-hints">
              <span>-₹150 (Frugal)</span>
              <span>Baseline (₹{safeToSpend.safeDaily})</span>
              <span>+₹250 (Splurge)</span>
            </div>
          </div>

          {/* Slider 3: One-Time Purchase */}
          <div className="slider-box">
            <div className="slider-header">
              <span>One-Time Purchase / Event</span>
              <strong>{formatMoney(simOneTimePurchase)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="250"
              value={simOneTimePurchase}
              onChange={(e) => setSimOneTimePurchase(Number(e.target.value))}
            />
            <div className="slider-hints">
              <span>₹0</span>
              <span>₹2,000 (Fest / Shoes)</span>
              <span>₹4,000 (Gadget)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Output Box */}
        <div className="simulation-feedback-banner">
          <div className="sim-metric">
            <span>Simulated Safe Daily Spend</span>
            <strong>{formatMoney(simulatedResults.newDailySpend)} / day</strong>
          </div>
          <div className="sim-metric">
            <span>Simulated Month-End Balance</span>
            <strong
              style={{
                color: simulatedResults.deltaFromBaseline >= 0 ? '#1f9d67' : '#dc2626',
              }}
            >
              {formatMoney(simulatedResults.simulatedEndingBalance)}
            </strong>
          </div>
          <div className="sim-metric">
            <span>Impact vs Baseline</span>
            <strong
              style={{
                color: simulatedResults.deltaFromBaseline >= 0 ? '#1f9d67' : '#dc2626',
              }}
            >
              {simulatedResults.deltaFromBaseline >= 0 ? '+' : ''}
              {formatMoney(simulatedResults.deltaFromBaseline)}
            </strong>
          </div>
        </div>
      </div>

      {/* Feature 3: FINANCIAL DIGITAL TWIN */}
      <div className="card digital-twin-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">FINANCIAL DIGITAL TWIN</p>
            <h2>6-Month Future Simulation</h2>
            <p className="muted">
              Compare how different student behavioral choices alter your wealth in 6 months.
            </p>
          </div>
          <Zap size={20} color="#1f9d67" />
        </div>

        <div className="tab-pill-group" style={{ margin: '16px 0' }}>
          <button
            type="button"
            className={`tab-pill ${twinScenario === 'baseline' ? 'active' : ''}`}
            onClick={() => setTwinScenario('baseline')}
          >
            Current Behavior
          </button>
          <button
            type="button"
            className={`tab-pill ${twinScenario === 'food20' ? 'active' : ''}`}
            onClick={() => setTwinScenario('food20')}
          >
            -20% Food Delivery
          </button>
          <button
            type="button"
            className={`tab-pill ${twinScenario === 'save1k' ? 'active' : ''}`}
            onClick={() => setTwinScenario('save1k')}
          >
            +₹1,000 Extra Savings
          </button>
          <button
            type="button"
            className={`tab-pill ${twinScenario === 'freelance' ? 'active' : ''}`}
            onClick={() => setTwinScenario('freelance')}
          >
            Weekend Tutoring Gig
          </button>
        </div>

        <div className="twin-scenario-display">
          <div className="twin-highlight-box">
            <span className="eyebrow">PROJECTED 6-MONTH ACCUMULATED SAVINGS</span>
            <strong className="twin-amount">
              {formatMoney(twinProjections.sixMonthSavings)}
            </strong>
            {twinProjections.gain > 0 && (
              <span className="gain-chip">
                +{formatMoney(twinProjections.gain)} higher than baseline
              </span>
            )}
          </div>

          <div className="twin-narrative">
            <h3>{twinProjections.title}</h3>
            <p>{twinProjections.description}</p>
            <div className="milestone-box">
              <CheckCircle2 size={16} color="#1f9d67" />
              <span>
                <strong>Milestone:</strong> {twinProjections.milestone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
