import React, { useState, useMemo } from 'react'
import { CheckCircle2, Zap, RotateCcw } from 'lucide-react'
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
    categoryTotals,
    goals,
    formatMoney,
  } = useFinancial()

  // What-If Simulator Controls
  const [simIncomeDelta, setSimIncomeDelta] = useState(0)
  const [simDailySpendChange, setSimDailySpendChange] = useState(0)
  const [simOneTimePurchase, setSimOneTimePurchase] = useState(0)

  // Digital Twin Active Scenario
  const [twinScenario, setTwinScenario] = useState<
    'baseline' | 'food20' | 'save1k' | 'freelance'
  >('baseline')

  const daysRemainingInMonth = Math.max(
    1,
    safeToSpend.daysRemainingInMonth || 1,
  )

  // Calculate What-If simulated results from the user's actual data.
  const simulatedResults = useMemo(() => {
    const baseDailySpend = safeToSpend.safeDaily
    const newDailySpend = Math.max(0, baseDailySpend + simDailySpendChange)

    const simulatedTotalOutflow =
      newDailySpend * daysRemainingInMonth +
      safeToSpend.upcomingBillsTotal +
      simOneTimePurchase

    const simulatedTotalInflow = Math.max(
      0,
      totalIncome + simIncomeDelta,
    )

    const simulatedEndingBalance = Math.max(
      0,
      currentBalance +
        simIncomeDelta -
        newDailySpend * daysRemainingInMonth -
        simOneTimePurchase -
        safeToSpend.upcomingBillsTotal,
    )

    const deltaFromBaseline = simulatedEndingBalance - predictedMonthEnd

    return {
      newDailySpend,
      simulatedEndingBalance,
      deltaFromBaseline,
      simulatedTotalInflow,
      simulatedTotalOutflow,
    }
  }, [
    currentBalance,
    totalIncome,
    safeToSpend,
    simIncomeDelta,
    simDailySpendChange,
    simOneTimePurchase,
    predictedMonthEnd,
    daysRemainingInMonth,
  ])

  // Digital Twin 6-Month Projections.
  // All baseline values come from the user's actual recorded data.
  const twinProjections = useMemo(() => {
    const baseMonthlySavings = Math.max(
      0,
      totalIncome - totalExpenses,
    )

    switch (twinScenario) {
      case 'food20': {
        const currentFoodSpend = categoryTotals.Food || 0
        const extraSaved = Math.round(currentFoodSpend * 0.2)
        const monthly = baseMonthlySavings + extraSaved

        return {
          title: 'Reduce Food Spending by 20%',
          sixMonthSavings: monthly * 6,
          gain: extraSaved * 6,
          description:
            currentFoodSpend > 0
              ? `If you reduce your current Food spending by 20%, your projected monthly savings increase by ${formatMoney(extraSaved)}.`
              : 'Record some Food spending first to calculate the effect of a 20% reduction.',
          milestone:
            goals.length > 0
              ? `This increases the amount available for your active savings goals.`
              : 'This increases the amount available for future savings goals.',
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
            'A hypothetical extra ₹1,000 saved each month is applied to your current savings rate.',
          milestone:
            goals.length > 0
              ? 'The additional savings can accelerate your active goals.'
              : 'The additional savings can be allocated to a future savings goal.',
        }
      }

      case 'freelance': {
        const extraEarned = 3500
        const monthly = baseMonthlySavings + extraEarned

        return {
          title: 'Add ₹3,500 Extra Income / Month',
          sixMonthSavings: monthly * 6,
          gain: extraEarned * 6,
          description:
            'A hypothetical additional ₹3,500 monthly income is applied to your current savings rate.',
          milestone:
            goals.length > 0
              ? 'The additional income can increase contributions toward your active goals.'
              : 'The additional income can strengthen your future savings buffer.',
        }
      }

      default:
        return {
          title: 'Current Behavior (Baseline)',
          sixMonthSavings: baseMonthlySavings * 6,
          gain: 0,
          description:
            totalIncome > 0 || totalExpenses > 0
              ? 'Projects six months using your current recorded income and expenses as the baseline.'
              : 'Add income and expenses to create a personalized six-month baseline.',
          milestone:
            goals.length > 0
              ? 'Your current savings rate is projected across six months.'
              : 'Add a savings goal if you want to track a specific target.',
        }
    }
  }, [
    twinScenario,
    totalIncome,
    totalExpenses,
    categoryTotals,
    goals,
    formatMoney,
  ])

  const resetWhatIf = () => {
    setSimIncomeDelta(0)
    setSimDailySpendChange(0)
    setSimOneTimePurchase(0)
    onSuccessToast('Reset What-If simulator to your current live baseline.')
  }

  return (
    <div className="predictions-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">FINANCIAL DIGITAL TWIN & FORECASTING</p>
          <h1>Cashflow Predictions</h1>
          <p className="muted">
            Simulate your future financial trajectory, test scenarios, and
            project month-end buffers using your recorded data.
          </p>
        </div>
      </section>

      {/* WHAT-IF SIMULATOR */}
      <div className="card whatif-card" style={{ marginBottom: '24px' }}>
        <div className="card-head">
          <div>
            <p className="eyebrow">INTERACTIVE SANDBOX</p>
            <h2>What-If Simulator</h2>
            <p className="muted">
              Adjust the controls to see immediate changes to your projected
              month-end balance.
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
          {/* Monthly Income */}
          <div className="slider-box">
            <div className="slider-header">
              <span>Monthly Income Change</span>
              <strong>
                {simIncomeDelta >= 0
                  ? `+${formatMoney(simIncomeDelta)}`
                  : `-${formatMoney(Math.abs(simIncomeDelta))}`}
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

          {/* Daily Spending */}
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
              onChange={(e) =>
                setSimDailySpendChange(Number(e.target.value))
              }
            />

            <div className="slider-hints">
              <span>-₹150 (Frugal)</span>
              <span>Baseline ({formatMoney(safeToSpend.safeDaily)})</span>
              <span>+₹250 (Splurge)</span>
            </div>
          </div>

          {/* One-Time Purchase */}
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
              onChange={(e) =>
                setSimOneTimePurchase(Number(e.target.value))
              }
            />

            <div className="slider-hints">
              <span>₹0</span>
              <span>₹2,000</span>
              <span>₹4,000</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Output */}
        <div className="simulation-feedback-banner">
          <div className="sim-metric">
            <span>Simulated Safe Daily Spend</span>
            <strong>
              {formatMoney(simulatedResults.newDailySpend)} / day
            </strong>
          </div>

          <div className="sim-metric">
            <span>Simulated Month-End Balance</span>
            <strong
              className={
                simulatedResults.deltaFromBaseline >= 0
                  ? 'positive'
                  : 'negative'
              }
            >
              {formatMoney(simulatedResults.simulatedEndingBalance)}
            </strong>
          </div>

          <div className="sim-metric">
            <span>Impact vs Baseline</span>
            <strong
              className={
                simulatedResults.deltaFromBaseline >= 0
                  ? 'positive'
                  : 'negative'
              }
            >
              {simulatedResults.deltaFromBaseline >= 0 ? '+' : ''}
              {formatMoney(simulatedResults.deltaFromBaseline)}
            </strong>
          </div>
        </div>

        <p className="muted simulation-note">
          Simulation inflow: {formatMoney(simulatedResults.simulatedTotalInflow)}
          {' · '}
          projected outflow: {formatMoney(simulatedResults.simulatedTotalOutflow)}
        </p>
      </div>

      {/* FINANCIAL DIGITAL TWIN */}
      <div className="card digital-twin-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">FINANCIAL DIGITAL TWIN</p>
            <h2>6-Month Future Simulation</h2>
            <p className="muted">
              Compare how different hypothetical choices could change your
              six-month savings trajectory.
            </p>
          </div>

          <Zap size={20} />
        </div>

        <div className="tab-pill-group" style={{ margin: '16px 0' }}>
          <button
            type="button"
            className={`tab-pill ${
              twinScenario === 'baseline' ? 'active' : ''
            }`}
            onClick={() => setTwinScenario('baseline')}
          >
            Current Behavior
          </button>

          <button
            type="button"
            className={`tab-pill ${
              twinScenario === 'food20' ? 'active' : ''
            }`}
            onClick={() => setTwinScenario('food20')}
          >
            -20% Food Spending
          </button>

          <button
            type="button"
            className={`tab-pill ${
              twinScenario === 'save1k' ? 'active' : ''
            }`}
            onClick={() => setTwinScenario('save1k')}
          >
            +₹1,000 Savings
          </button>

          <button
            type="button"
            className={`tab-pill ${
              twinScenario === 'freelance' ? 'active' : ''
            }`}
            onClick={() => setTwinScenario('freelance')}
          >
            +₹3,500 Income
          </button>
        </div>

        <div className="twin-scenario-display">
          <div className="twin-highlight-box">
            <span className="eyebrow">
              PROJECTED 6-MONTH ACCUMULATED SAVINGS
            </span>

            <strong className="twin-amount">
              {formatMoney(twinProjections.sixMonthSavings)}
            </strong>

            {twinProjections.gain > 0 && (
              <span className="gain-chip">
                +{formatMoney(twinProjections.gain)} vs baseline
              </span>
            )}
          </div>

          <div className="twin-narrative">
            <h3>{twinProjections.title}</h3>
            <p>{twinProjections.description}</p>

            <div className="milestone-box">
              <CheckCircle2 size={16} />
              <span>
                <strong>Impact:</strong> {twinProjections.milestone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
