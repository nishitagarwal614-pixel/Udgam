import React, { useState } from 'react'
import {
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Building2,
  Home,
  Users,
  Target,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { OnboardingAnswers } from '../types'

interface AiOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccessToast: (msg: string) => void
}

export const AiOnboardingModal: React.FC<AiOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { generatePersonalizedPlan, formatMoney } = useFinancial()

  const [step, setStep] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [synthesisStage, setSynthesisStage] = useState<string>('Analyzing your student cashflow...')

  // Step 1: Student info & allowance
  const [name, setName] = useState('Arjun Sharma')
  const [college, setCollege] = useState('IIT Delhi · Computer Science')
  const [monthlyAllowance, setMonthlyAllowance] = useState<number>(15000)
  const [livingSituation, setLivingSituation] = useState<'hostel' | 'flat' | 'home'>('hostel')

  // Step 2: Typical monthly expenses
  const [foodBudget, setFoodBudget] = useState<number>(3500)
  const [rentOrMess, setRentOrMess] = useState<number>(2500)
  const [travelBudget, setTravelBudget] = useState<number>(1500)
  const [booksBudget, setBooksBudget] = useState<number>(1200)
  const [subscriptionsBudget, setSubscriptionsBudget] = useState<number>(500)

  // Step 3: Primary goal
  const [goalTitle, setGoalTitle] = useState('New M3 MacBook Pro')
  const [goalTarget, setGoalTarget] = useState<number>(60000)

  if (!isOpen) return null

  const handleNext = () => {
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1))
  }

  const handleFinish = () => {
    setIsGenerating(true)
    setSynthesisStage('Connecting to your student financial profile...')

    setTimeout(() => {
      setSynthesisStage('Calibrating your category budgets and living allowances...')
    }, 450)

    setTimeout(() => {
      setSynthesisStage('Calculating your dynamic Safe-to-Spend limit today...')
    }, 900)

    setTimeout(() => {
      setSynthesisStage('Generating your fully personalized homepage...')
    }, 1350)

    setTimeout(() => {
      const answers: OnboardingAnswers = {
        name,
        college,
        monthlyAllowance,
        livingSituation,
        foodBudget,
        travelBudget,
        booksBudget,
        rentOrMess,
        subscriptionsBudget,
        goalTitle,
        goalTarget,
      }

      generatePersonalizedPlan(answers)
      setIsGenerating(false)
      onSuccessToast(`Welcome, ${name}! Your homepage has been personalized.`)
      onClose()
    }, 1800)
  }

  const handleSkip = () => {
    const defaultAnswers: OnboardingAnswers = {
      name: 'Arjun Sharma',
      college: 'IIT Delhi · Computer Science',
      monthlyAllowance: 15000,
      livingSituation: 'hostel',
      foodBudget: 4000,
      travelBudget: 2000,
      booksBudget: 2500,
      rentOrMess: 2500,
      subscriptionsBudget: 800,
      goalTitle: 'New Laptop',
      goalTarget: 60000,
    }
    generatePersonalizedPlan(defaultAnswers)
    onSuccessToast('Loaded personalized student workspace.')
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div
        className="modal modal-lg ai-onboarding-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {isGenerating ? (
          <div className="onboarding-generating-screen">
            <div className="coach-orb large-orb">
              <Bot size={36} />
            </div>
            <div className="badge-pill mint" style={{ margin: '14px 0' }}>
              <Sparkles size={14} /> AI Synthesis Active
            </div>
            <h2>Generating Your Personalized Homepage</h2>
            <p className="muted">{synthesisStage}</p>

            <div className="scan-progress-bar" style={{ width: '280px', marginTop: '20px' }}>
              <div className="scan-progress-fill animated-bar" style={{ width: '100%' }} />
            </div>
          </div>
        ) : (
          <div>
            {/* Step 0: Welcome Greeting */}
            {step === 0 && (
              <div className="onboarding-step-content">
                <div className="coach-top-row">
                  <div className="coach-orb">
                    <Bot size={24} />
                  </div>
                  <span className="badge-pill">Finwise AI Setup</span>
                </div>

                <p className="eyebrow">WELCOME TO FINWISE</p>
                <h1>Meet Your AI Personal Finance Coach</h1>
                <p className="onboarding-intro-text">
                  The moment you join, I ask for a quick 60-second overview of your monthly
                  allowance and typical student expenses. Based on your answers, I will
                  instantly generate a <strong>fully personalized homepage</strong> tailored to your specific
                  financial situation.
                </p>

                <div className="onboarding-perks-list">
                  <div className="perk-item">
                    <CheckCircle2 size={18} color="#1f9d67" />
                    <span>Dynamic Safe-to-Spend limit computed for your exact allowance</span>
                  </div>
                  <div className="perk-item">
                    <CheckCircle2 size={18} color="#1f9d67" />
                    <span>Automated category budgets for food, transit, and books</span>
                  </div>
                  <div className="perk-item">
                    <CheckCircle2 size={18} color="#1f9d67" />
                    <span>Effortless tracking: simply log daily spends or scan receipts</span>
                  </div>
                </div>

                <div className="modal-actions-bar" style={{ marginTop: '28px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleSkip}
                  >
                    Quick Start with Defaults
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleNext}
                  >
                    Start 60s Check-in <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Student Profile & Allowance */}
            {step === 1 && (
              <div className="onboarding-step-content">
                <p className="eyebrow">STEP 1 OF 3 · STUDENT PROFILE & INFLOW</p>
                <h2>What does your monthly cashflow look like?</h2>
                <p className="muted" style={{ marginBottom: '18px' }}>
                  Tell me your university and pocket money/stipend so I can set your baseline reserves.
                </p>

                <div className="form-row">
                  <label>
                    Your Name
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                    />
                  </label>

                  <label>
                    University / College
                    <input
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IIT Delhi · Computer Science"
                    />
                  </label>
                </div>

                <label style={{ marginTop: '16px' }}>
                  Monthly Allowance / Pocket Money / Stipend (₹)
                  <input
                    type="number"
                    min="2000"
                    step="500"
                    required
                    value={monthlyAllowance}
                    onChange={(e) => setMonthlyAllowance(Number(e.target.value))}
                  />
                </label>

                {/* Allowance Quick Presets */}
                <div className="allowance-presets-row">
                  {[8000, 12000, 15000, 22000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`tab-pill ${monthlyAllowance === preset ? 'active success' : ''}`}
                      onClick={() => setMonthlyAllowance(preset)}
                    >
                      {formatMoney(preset)}
                    </button>
                  ))}
                </div>

                <label style={{ marginTop: '16px' }}>Living Situation</label>
                <div className="living-situation-grid">
                  <button
                    type="button"
                    className={`situation-card ${livingSituation === 'hostel' ? 'selected' : ''}`}
                    onClick={() => setLivingSituation('hostel')}
                  >
                    <Building2 size={20} />
                    <strong>Hostel & Mess</strong>
                    <small>Campus room + mess dues</small>
                  </button>

                  <button
                    type="button"
                    className={`situation-card ${livingSituation === 'flat' ? 'selected' : ''}`}
                    onClick={() => setLivingSituation('flat')}
                  >
                    <Users size={20} />
                    <strong>Rented Flat</strong>
                    <small>Roommates & shared rent</small>
                  </button>

                  <button
                    type="button"
                    className={`situation-card ${livingSituation === 'home' ? 'selected' : ''}`}
                    onClick={() => setLivingSituation('home')}
                  >
                    <Home size={20} />
                    <strong>Day Scholar</strong>
                    <small>Living with family</small>
                  </button>
                </div>

                <div className="modal-actions-bar" style={{ marginTop: '24px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleBack}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleNext}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Typical Living Expenses */}
            {step === 2 && (
              <div className="onboarding-step-content">
                <p className="eyebrow">STEP 2 OF 3 · TYPICAL EXPENSES</p>
                <h2>What are your typical monthly spending areas?</h2>
                <p className="muted" style={{ marginBottom: '18px' }}>
                  Provide approximate figures; Finwise will dynamically adjust them as you log expenses.
                </p>

                <div className="form-row">
                  <label>
                    Food & Dining / Swiggy (₹)
                    <input
                      type="number"
                      min="500"
                      step="100"
                      value={foodBudget}
                      onChange={(e) => setFoodBudget(Number(e.target.value))}
                    />
                  </label>

                  <label>
                    {livingSituation === 'hostel'
                      ? 'Hostel Mess & Room Dues (₹)'
                      : livingSituation === 'flat'
                      ? 'Rent & Grocery Share (₹)'
                      : 'Personal Fixed Expenses (₹)'}
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={rentOrMess}
                      onChange={(e) => setRentOrMess(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Daily Transit / Metro Card (₹)
                    <input
                      type="number"
                      min="200"
                      step="100"
                      value={travelBudget}
                      onChange={(e) => setTravelBudget(Number(e.target.value))}
                    />
                  </label>

                  <label>
                    Books & Campus Stationery (₹)
                    <input
                      type="number"
                      min="200"
                      step="100"
                      value={booksBudget}
                      onChange={(e) => setBooksBudget(Number(e.target.value))}
                    />
                  </label>
                </div>

                <label>
                  Subscriptions (Spotify / Netflix / Wi-Fi) (₹)
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={subscriptionsBudget}
                    onChange={(e) => setSubscriptionsBudget(Number(e.target.value))}
                  />
                </label>

                <div className="modal-actions-bar" style={{ marginTop: '24px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleBack}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleNext}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Primary Goal */}
            {step === 3 && (
              <div className="onboarding-step-content">
                <p className="eyebrow">STEP 3 OF 3 · PRIMARY SAVINGS GOAL</p>
                <h2>What is your #1 financial goal right now?</h2>
                <p className="muted" style={{ marginBottom: '18px' }}>
                  Finwise will protect a monthly buffer so you fund this target on schedule.
                </p>

                <div className="goal-preset-chips">
                  {[
                    { title: 'New M3 MacBook Pro', target: 60000 },
                    { title: 'Semester-End Goa Trip', target: 15000 },
                    { title: 'Emergency Student Safety Buffer', target: 10000 },
                    { title: 'Tech Fest & Hackathon Trip', target: 8000 },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      className={`goal-chip-btn ${goalTitle === preset.title ? 'selected' : ''}`}
                      onClick={() => {
                        setGoalTitle(preset.title)
                        setGoalTarget(preset.target)
                      }}
                    >
                      <Target size={14} />
                      <span>{preset.title}</span>
                      <small>({formatMoney(preset.target)})</small>
                    </button>
                  ))}
                </div>

                <div className="form-row" style={{ marginTop: '16px' }}>
                  <label>
                    Goal Name
                    <input
                      required
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                    />
                  </label>

                  <label>
                    Target Amount (₹)
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      required
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="onboarding-ready-box">
                  <Sparkles size={18} color="#1f9d67" />
                  <span>
                    Ready! Finwise will now configure your custom budgets, set your Safe-to-Spend limit, and launch your personalized homepage.
                  </span>
                </div>

                <div className="modal-actions-bar" style={{ marginTop: '24px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleBack}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleFinish}
                  >
                    <Check size={16} /> Generate Personalized Homepage
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
