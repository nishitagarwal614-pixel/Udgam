import React from 'react'
import {
  Sparkles,
  Bot,
  Hourglass,
  Lightbulb,
  Award,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface InsightsViewProps {
  onOpenHealthModal: () => void
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  onOpenHealthModal,
}) => {
  const {
    aiMonthlyStory,
    spendingPersonality,
    healthScore,
    moneyRunwayDays,
    topSpendingCategory,
    safeToSpend,
    predictedMonthEnd,
    setActiveView,
    formatMoney,
  } = useFinancial()

  return (
    <div className="insights-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">INTELLIGENT CASHFLOW ANALYSIS</p>
          <h1>AI Insights & Story</h1>
          <p className="muted">
            Patterns, behavioral personality, and dynamic forecasts generated from your real transactions.
          </p>
        </div>

        <button
          type="button"
          className="dark-btn"
          onClick={() => setActiveView('AI Coach')}
        >
          <Bot size={16} /> Chat with Coach
        </button>
      </section>

      {/* Feature 1: AI Monthly Narrative Story */}
      <div className="card story-hero-card" style={{ marginBottom: '24px' }}>
        <div className="story-card-top">
          <div className="badge-icon mint">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="eyebrow">DYNAMIC FINANCIAL STORY</p>
            <h2>Your September Cashflow Recap</h2>
          </div>
          <span className="badge-pill">September 2026</span>
        </div>

        <p className="story-narrative-text">{aiMonthlyStory}</p>

        <div className="story-metrics-strip">
          <div className="story-metric">
            <span>Burn Velocity</span>
            <strong>{formatMoney(safeToSpend.dailyBurnRate)} / day</strong>
          </div>
          <div className="story-metric">
            <span>Top Outflow</span>
            <strong>{topSpendingCategory.category} ({topSpendingCategory.percentage}%)</strong>
          </div>
          <div className="story-metric">
            <span>Money Runway</span>
            <strong>~{moneyRunwayDays} days</strong>
          </div>
          <div className="story-metric">
            <span>Month-End Buffer</span>
            <strong style={{ color: '#1f9d67' }}>{formatMoney(predictedMonthEnd)}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Spending Personality + Health Score Pillars */}
      <div className="module-grid" style={{ marginBottom: '24px' }}>
        {/* Feature 2: Spending Personality */}
        <div className="card personality-card">
          <div className="personality-top">
            <div className="badge-icon lavender">
              <Award size={20} />
            </div>
            <div>
              <p className="eyebrow">BEHAVIORAL AI PROFILE</p>
              <h2>{spendingPersonality.title}</h2>
            </div>
            <span className="badge-pill personality-badge">
              {spendingPersonality.badge}
            </span>
          </div>

          <p className="personality-desc">{spendingPersonality.description}</p>

          <div className="trait-box">
            <span>Dominant Campus Trait</span>
            <strong>{spendingPersonality.topTrait}</strong>
          </div>

          <div className="personality-tip">
            <Lightbulb size={16} color="#d97706" />
            <span>
              <strong>Coach Action:</strong> {spendingPersonality.tip}
            </span>
          </div>
        </div>

        {/* Feature 3: Financial Health Score Radar */}
        <div
          className="card big-score clickable"
          onClick={onOpenHealthModal}
          title="Click to view full health score breakdown"
        >
          <div className="card-head">
            <div>
              <p className="eyebrow">FINANCIAL RESILIENCE</p>
              <h2>Health Score</h2>
            </div>
            <span className="badge-pill mint">Tier: Strong</span>
          </div>

          <strong>
            {healthScore.overall}
            <span> / 100</span>
          </strong>

          <div className="score-bars-visual">
            <div className="bar-col">
              <div
                className="bar-fill"
                style={{
                  height: `${(healthScore.budgetDisciplineScore / 30) * 100}%`,
                }}
              />
              <small>Budget</small>
            </div>
            <div className="bar-col">
              <div
                className="bar-fill"
                style={{
                  height: `${(healthScore.savingsRateScore / 25) * 100}%`,
                }}
              />
              <small>Savings</small>
            </div>
            <div className="bar-col">
              <div
                className="bar-fill"
                style={{
                  height: `${(healthScore.runwayScore / 25) * 100}%`,
                }}
              />
              <small>Runway</small>
            </div>
            <div className="bar-col">
              <div
                className="bar-fill"
                style={{
                  height: `${(healthScore.goalPaceScore / 20) * 100}%`,
                }}
              />
              <small>Goals</small>
            </div>
          </div>

          <p style={{ marginTop: '16px' }}>
            High budget discipline and healthy savings buffer give you top student standing.
          </p>

          <button
            type="button"
            className="text-btn"
            onClick={(e) => {
              e.stopPropagation()
              onOpenHealthModal()
            }}
          >
            Inspect full diagnostic report <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Feature 4: Money Runway & Actionable Student Hacks */}
      <div className="lower-grid">
        <div className="card runway-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">SURVIVAL RUNWAY</p>
              <h2>Student Money Runway</h2>
            </div>
            <Hourglass size={20} color="#1f9d67" />
          </div>

          <div className="runway-hero">
            <strong>{moneyRunwayDays} Days</strong>
            <p>
              At your typical burn velocity of {formatMoney(safeToSpend.dailyBurnRate)}/day, your
              current balance can support living expenses for <strong>{moneyRunwayDays} full days</strong> with zero additional income.
            </p>
          </div>

          <div className="runway-progress">
            <div className="progress">
              <span style={{ width: `${Math.min(100, (moneyRunwayDays / 30) * 100)}%` }} />
            </div>
            <div className="budget-meta">
              <span>Goal: 30 days buffer</span>
              <span>{Math.min(100, Math.round((moneyRunwayDays / 30) * 100))}% cushion</span>
            </div>
          </div>
        </div>

        <div className="card student-hacks-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">TAILORED ADVICE</p>
              <h2>Student Money Hacks</h2>
            </div>
            <CheckCircle2 size={18} color="#1f9d67" />
          </div>

          <div className="hacks-list">
            <div className="hack-item">
              <span className="hack-tag">Food</span>
              <div>
                <strong>Pair Mess with Swiggy Weekends</strong>
                <small>Sticking to hostel dining Mon-Thu frees ~₹1,200/mo.</small>
              </div>
            </div>
            <div className="hack-item">
              <span className="hack-tag">Subscriptions</span>
              <div>
                <strong>Verify Student Discount Pricing</strong>
                <small>Spotify Student saves ₹60/mo vs individual tier.</small>
              </div>
            </div>
            <div className="hack-item">
              <span className="hack-tag">Decision</span>
              <div>
                <strong>Run "Can I Afford This?" on big tech</strong>
                <small>Test gadget cart items before tapping UPI pin.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
