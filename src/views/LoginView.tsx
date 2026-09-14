import React, { useState } from 'react'
import {
  Sparkles,
  Bot,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Target,
  Home,
  Building2,
  Users,
  Compass,
  Smile,
  Shield,
  Zap,
  Coffee,
  Bus,
  BookOpen,
  Film,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { OnboardingAnswers } from '../types'

interface LoginViewProps {
  onSuccessToast?: (msg: string) => void
}

const AVATARS = ['🎓', '⚡', '🚀', '💻', '💡', '🌟', '🎨', '🎯']

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessToast }) => {
  const {
    generatePersonalizedPlan,
    loadStudentPreset,
    profile,
    formatMoney,
  } = useFinancial()

  // Mode: 'register' (Interactive Onboarding) vs 'login' (Quick Return / Presets)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')

  // Step in interactive onboarding (0 to 4)
  const [step, setStep] = useState<number>(0)

  // Step 1: Student Identity
  const [name, setName] = useState(profile.name || 'Nishita')
  const [college, setCollege] = useState(profile.college || 'IIT Delhi')
  const [courseYear, setCourseYear] = useState('B.Tech CS · 2nd Year')
  const [selectedAvatar, setSelectedAvatar] = useState('🎓')

  // Step 2: Allowances & Starting Funds
  const [monthlyAllowance, setMonthlyAllowance] = useState<number>(
    profile.monthlyAllowance || 15000
  )
  const [startingBalance, setStartingBalance] = useState<number>(5000)
  const [email, setEmail] = useState('student@campus.edu')

  // Step 3: Living Situation & Monthly Spend
  const [livingSituation, setLivingSituation] = useState<'hostel' | 'flat' | 'home'>('hostel')
  const [foodBudget, setFoodBudget] = useState<number>(3500)
  const [rentOrMess, setRentOrMess] = useState<number>(2500)
  const [travelBudget, setTravelBudget] = useState<number>(1500)
  const [booksBudget, setBooksBudget] = useState<number>(1200)
  const [subscriptionsBudget, setSubscriptionsBudget] = useState<number>(600)

  // Step 4: Primary Savings Goal
  const [goalTitle, setGoalTitle] = useState('New M3 MacBook Pro')
  const [goalTarget, setGoalTarget] = useState<number>(60000)
  const [goalMonths, setGoalMonths] = useState<number>(8)

  // Step 5: AI Coach Personality
  const [aiPersonality, setAiPersonality] = useState<'Balanced' | 'Strict' | 'Encouraging'>('Balanced')

  // Transition state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Live calculations for the interactive preview panel
  const totalAllocatedExpenses =
    foodBudget + rentOrMess + travelBudget + booksBudget + subscriptionsBudget
  const remainingMonthlySavingsPool = Math.max(0, monthlyAllowance - totalAllocatedExpenses)
  const safeDailyEstimate = Math.max(0, Math.round(remainingMonthlySavingsPool / 30))

  // Preset demo students
  const presets: Array<{
    id: string
    title: string
    subtitle: string
    badge: string
    avatar: string
    data: OnboardingAnswers
  }> = [
    {
      id: 'nishita',
      title: 'Nishita Agarwal',
      subtitle: 'IIT Delhi · CS 2nd Year',
      badge: 'Hostel Resident',
      avatar: '💻',
      data: {
        name: 'Nishita Agarwal',
        college: 'IIT Delhi · Computer Science',
        courseYear: 'B.Tech CS · 2nd Year',
        monthlyAllowance: 15000,
        startingBalance: 5000,
        livingSituation: 'hostel',
        foodBudget: 4000,
        rentOrMess: 2500,
        travelBudget: 1500,
        booksBudget: 2000,
        subscriptionsBudget: 700,
        goalTitle: 'New M3 MacBook Pro',
        goalTarget: 60000,
        aiPersonality: 'Balanced',
        avatarInitials: 'NA',
      },
    },
    {
      id: 'aman',
      title: 'Aman Sharma',
      subtitle: 'Delhi University · Economics',
      badge: 'Shared Flat / PG',
      avatar: '🚀',
      data: {
        name: 'Aman Sharma',
        college: 'Delhi University · Hansraj College',
        courseYear: 'B.A. Economics · 3rd Year',
        monthlyAllowance: 18000,
        startingBalance: 8500,
        livingSituation: 'flat',
        foodBudget: 5500,
        rentOrMess: 5000,
        travelBudget: 2000,
        booksBudget: 1500,
        subscriptionsBudget: 1000,
        goalTitle: 'Graduation Euro Trip',
        goalTarget: 45000,
        aiPersonality: 'Strict',
        avatarInitials: 'AS',
      },
    },
    {
      id: 'priya',
      title: 'Priya Verma',
      subtitle: 'BITS Pilani · Electronics',
      badge: 'Day Scholar / Home',
      avatar: '🌟',
      data: {
        name: 'Priya Verma',
        college: 'BITS Pilani · Electrical & Electronics',
        courseYear: 'Dual Degree · 1st Year',
        monthlyAllowance: 12000,
        startingBalance: 6000,
        livingSituation: 'home',
        foodBudget: 2800,
        rentOrMess: 0,
        travelBudget: 2500,
        booksBudget: 2200,
        subscriptionsBudget: 500,
        goalTitle: 'Drone Tech Kit',
        goalTarget: 30000,
        aiPersonality: 'Encouraging',
        avatarInitials: 'PV',
      },
    },
  ]

  const handleLivingChange = (type: 'hostel' | 'flat' | 'home') => {
    setLivingSituation(type)
    if (type === 'hostel') {
      setRentOrMess(2500)
      setFoodBudget(3500)
      setTravelBudget(1200)
    } else if (type === 'flat') {
      setRentOrMess(5500)
      setFoodBudget(4500)
      setTravelBudget(1800)
    } else {
      setRentOrMess(0)
      setFoodBudget(2500)
      setTravelBudget(2500)
    }
  }

  const handleFinishOnboarding = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      const answers: OnboardingAnswers = {
        name: name.trim() || 'Student',
        college: college.trim() || 'University',
        courseYear,
        email,
        monthlyAllowance,
        startingBalance,
        livingSituation,
        foodBudget,
        travelBudget,
        booksBudget,
        rentOrMess,
        subscriptionsBudget,
        goalTitle: goalTitle.trim() || 'Savings Goal',
        goalTarget,
        aiPersonality,
        avatarInitials:
          name
            .trim()
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'S',
      }

      generatePersonalizedPlan(answers)
      setIsSubmitting(false)
      onSuccessToast?.(`Welcome, ${name}! Your Finwise dashboard is ready.`)
    }, 750)
  }

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setIsSubmitting(true)
    setTimeout(() => {
      loadStudentPreset(preset.data)
      setIsSubmitting(false)
      onSuccessToast?.(`Signed in as ${preset.title} (${preset.subtitle}).`)
    }, 500)
  }

  return (
    <div className="login-page-container">
      {/* Background ambient accents */}
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />

      <div className="login-card-shell">
        {/* Top Header Bar */}
        <div className="login-header-nav">
          <div className="login-brand">
            <div className="brand-badge-icon">
              <Bot size={22} />
            </div>
            <div>
              <span className="brand-title">Finwise AI</span>
              <span className="brand-subtitle">Student Financial OS</span>
            </div>
          </div>

          <div className="login-mode-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              <UserPlus size={15} />
              <span>Get Started</span>
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              <LogIn size={15} />
              <span>Quick Sign In</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Interactive Simulator vs Right Step Engine */}
        <div className="login-split-layout">
          {/* LEFT: Live Interactive Financial Simulator */}
          <div className="login-simulator-panel">
            <div className="simulator-header">
              <div className="simulator-badge">
                <Sparkles size={13} /> Live Campus Simulator
              </div>
              <span className="simulator-caption">Calibrating in real-time</span>
            </div>

            {/* Student ID Badge Preview */}
            <div className="student-id-card">
              <div className="id-card-top">
                <span className="id-avatar-circle">{selectedAvatar}</span>
                <div className="id-student-meta">
                  <h3>{name || 'Student Name'}</h3>
                  <p>{college || 'Your College / Campus'}</p>
                  <small>{courseYear || 'Degree & Year'}</small>
                </div>
              </div>
              <div className="id-card-bottom">
                <span className="id-pill">
                  {livingSituation === 'hostel' && 'Hostel Resident'}
                  {livingSituation === 'flat' && 'Shared Flat / PG'}
                  {livingSituation === 'home' && 'Living at Home'}
                </span>
                <span className="id-pill coach-pill">
                  {aiPersonality} Coach
                </span>
              </div>
            </div>

            {/* Live Key Metrics */}
            <div className="simulator-metrics-grid">
              <div className="sim-metric-item">
                <span>Monthly Allowance</span>
                <strong>{formatMoney(monthlyAllowance)}</strong>
              </div>

              <div className="sim-metric-item">
                <span>Starting Funds</span>
                <strong className="text-green">{formatMoney(startingBalance)}</strong>
              </div>

              <div className="sim-metric-item highlight">
                <span>Safe to Spend / Day</span>
                <strong>{formatMoney(safeDailyEstimate)}</strong>
              </div>

              <div className="sim-metric-item">
                <span>Savings Pool / Mo</span>
                <strong>{formatMoney(remainingMonthlySavingsPool)}</strong>
              </div>
            </div>

            {/* Live Budget Breakdown Preview */}
            <div className="sim-budget-preview">
              <div className="sim-budget-head">
                <span>Planned Expenses</span>
                <strong>
                  {formatMoney(totalAllocatedExpenses)} of {formatMoney(monthlyAllowance)}
                </strong>
              </div>

              <div className="sim-progress-bar">
                <div
                  className="sim-bar-fill food"
                  style={{ width: `${Math.min(100, (foodBudget / monthlyAllowance) * 100)}%` }}
                  title={`Food: ${formatMoney(foodBudget)}`}
                />
                <div
                  className="sim-bar-fill rent"
                  style={{ width: `${Math.min(100, (rentOrMess / monthlyAllowance) * 100)}%` }}
                  title={`Mess/Rent: ${formatMoney(rentOrMess)}`}
                />
                <div
                  className="sim-bar-fill travel"
                  style={{ width: `${Math.min(100, (travelBudget / monthlyAllowance) * 100)}%` }}
                  title={`Travel: ${formatMoney(travelBudget)}`}
                />
                <div
                  className="sim-bar-fill study"
                  style={{ width: `${Math.min(100, (booksBudget / monthlyAllowance) * 100)}%` }}
                  title={`Books: ${formatMoney(booksBudget)}`}
                />
                <div
                  className="sim-bar-fill subs"
                  style={{ width: `${Math.min(100, (subscriptionsBudget / monthlyAllowance) * 100)}%` }}
                  title={`Subs: ${formatMoney(subscriptionsBudget)}`}
                />
              </div>

              <div className="sim-legend-row">
                <span className="legend-chip food">Food {formatMoney(foodBudget)}</span>
                <span className="legend-chip rent">Rent/Mess {formatMoney(rentOrMess)}</span>
                <span className="legend-chip travel">Travel {formatMoney(travelBudget)}</span>
                <span className="legend-chip study">Study {formatMoney(booksBudget)}</span>
                <span className="legend-chip subs">Subs {formatMoney(subscriptionsBudget)}</span>
              </div>
            </div>

            {/* Goal Pace Insight */}
            <div className="sim-goal-insight">
              <div className="goal-insight-icon">
                <Target size={18} />
              </div>
              <div>
                <strong>{goalTitle || 'Your Savings Target'} ({formatMoney(goalTarget)})</strong>
                <p>
                  {remainingMonthlySavingsPool > 0 ? (
                    <>
                      Saving your monthly buffer of{' '}
                      <b>{formatMoney(remainingMonthlySavingsPool)}</b> will fund this in{' '}
                      <b>{Math.ceil(goalTarget / remainingMonthlySavingsPool)} months</b>.
                    </>
                  ) : (
                    <>
                      Your expenses equal your allowance. Adjust categories to unlock savings!
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive Form / Flow */}
          <div className="login-interactive-panel">
            {authMode === 'login' ? (
              /* QUICK SIGN IN & PRESET PROFILES */
              <div className="quick-login-flow">
                <div className="flow-step-header">
                  <h2>Welcome Back, Scholar 👋</h2>
                  <p className="muted">
                    Sign in to your active student session or test a pre-configured campus profile.
                  </p>
                </div>

                <div className="returning-user-box">
                  <div className="user-pill-big">
                    <span className="avatar medium">{profile.avatarInitials || 'NA'}</span>
                    <div className="user-meta">
                      <strong>{profile.name || 'Nishita Agarwal'}</strong>
                      <small>{profile.college || 'IIT Delhi · Computer Science'}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="primary-btn full glow-btn"
                    onClick={handleFinishOnboarding}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Connecting...'
                    ) : (
                      <>
                        Continue to Dashboard <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                <div className="presets-section-divider">
                  <span>OR SELECT A DEMO PROFILE</span>
                </div>

                <div className="preset-cards-list">
                  {presets.map((p) => (
                    <div
                      key={p.id}
                      className="preset-student-card"
                      onClick={() => handleApplyPreset(p)}
                    >
                      <span className="preset-avatar">{p.avatar}</span>
                      <div className="preset-info">
                        <strong>{p.title}</strong>
                        <small>{p.subtitle}</small>
                      </div>
                      <div className="preset-action">
                        <span className="badge-pill">{p.badge}</span>
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="switch-prompt">
                  <span>Want to personalize from scratch?</span>{' '}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setAuthMode('register')
                      setStep(0)
                    }}
                  >
                    Start Student Setup →
                  </button>
                </div>
              </div>
            ) : (
              /* INTERACTIVE MULTI-STEP SETUP */
              <div className="register-flow">
                {/* Stepper Dots */}
                <div className="stepper-bar">
                  {[
                    { label: 'Campus', num: 0 },
                    { label: 'Money', num: 1 },
                    { label: 'Living', num: 2 },
                    { label: 'Goal', num: 3 },
                    { label: 'Coach', num: 4 },
                  ].map((s) => (
                    <div
                      key={s.num}
                      className={`step-indicator ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
                      onClick={() => setStep(s.num)}
                    >
                      <span className="step-num">{step > s.num ? '✓' : s.num + 1}</span>
                      <span className="step-label">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* STEP 0: Student Identity */}
                {step === 0 && (
                  <div className="step-body fade-in">
                    <div className="flow-step-header">
                      <span className="step-badge">STEP 1 OF 5</span>
                      <h2>Let's set up your Student ID 🎓</h2>
                      <p className="muted">
                        Finwise shapes your experience around your campus life and academics.
                      </p>
                    </div>

                    <div className="form-group">
                      <label>What's your name?</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Nishita Agarwal"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>College / University</label>
                        <input
                          type="text"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="e.g. IIT Delhi, BITS, DU..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Degree & Year</label>
                        <input
                          type="text"
                          value={courseYear}
                          onChange={(e) => setCourseYear(e.target.value)}
                          placeholder="e.g. B.Tech CS · 2nd Year"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Choose your Avatar Emoji</label>
                      <div className="avatar-picker-grid">
                        {AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`avatar-choice ${selectedAvatar === emoji ? 'active' : ''}`}
                            onClick={() => setSelectedAvatar(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 1: Pocket Money & Starting Balance */}
                {step === 1 && (
                  <div className="step-body fade-in">
                    <div className="flow-step-header">
                      <span className="step-badge">STEP 2 OF 5</span>
                      <h2>Your Money & Starting Balance 💰</h2>
                      <p className="muted">
                        Enter your monthly pocket allowance and any current liquid funds in your bank/UPI.
                      </p>
                    </div>

                    <div className="form-group">
                      <div className="label-with-val">
                        <label>Monthly Allowance / Stipend (₹)</label>
                        <strong>{formatMoney(monthlyAllowance)}</strong>
                      </div>
                      <input
                        type="range"
                        min="3000"
                        max="50000"
                        step="500"
                        value={monthlyAllowance}
                        onChange={(e) => setMonthlyAllowance(Number(e.target.value))}
                      />
                      <div className="quick-tags-row">
                        {[8000, 12000, 15000, 20000, 25000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`tag-btn ${monthlyAllowance === val ? 'active' : ''}`}
                            onClick={() => setMonthlyAllowance(val)}
                          >
                            {formatMoney(val)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <div className="label-with-val">
                        <label>Starting Liquid Balance (₹)</label>
                        <strong className="text-green">{formatMoney(startingBalance)}</strong>
                      </div>
                      <p className="field-hint">
                        Current funds in bank account, Paytm, cash, or wallet.
                      </p>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={startingBalance}
                        onChange={(e) => setStartingBalance(Number(e.target.value) || 0)}
                        placeholder="e.g. 5000"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email (for student report alerts)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. nishita@campus.edu"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Living Situation & Expenses */}
                {step === 2 && (
                  <div className="step-body fade-in">
                    <div className="flow-step-header">
                      <span className="step-badge">STEP 3 OF 5</span>
                      <h2>Living Setup & Planned Expenses 🏠</h2>
                      <p className="muted">
                        Select your accommodation to set realistic standard Indian student budgets.
                      </p>
                    </div>

                    <div className="living-cards-row">
                      <button
                        type="button"
                        className={`living-card-btn ${livingSituation === 'hostel' ? 'active' : ''}`}
                        onClick={() => handleLivingChange('hostel')}
                      >
                        <Building2 size={22} />
                        <strong>Hostel</strong>
                        <small>Mess + Room Included</small>
                      </button>

                      <button
                        type="button"
                        className={`living-card-btn ${livingSituation === 'flat' ? 'active' : ''}`}
                        onClick={() => handleLivingChange('flat')}
                      >
                        <Users size={22} />
                        <strong>Flat / PG</strong>
                        <small>Rent & Utilities</small>
                      </button>

                      <button
                        type="button"
                        className={`living-card-btn ${livingSituation === 'home' ? 'active' : ''}`}
                        onClick={() => handleLivingChange('home')}
                      >
                        <Home size={22} />
                        <strong>Day Scholar</strong>
                        <small>Living with Family</small>
                      </button>
                    </div>

                    <div className="expense-sliders-list">
                      <div className="expense-slider-row">
                        <div className="slider-icon food">
                          <Coffee size={15} />
                        </div>
                        <div className="slider-info">
                          <span>Food, Canteen & Dining</span>
                          <input
                            type="range"
                            min="500"
                            max="12000"
                            step="200"
                            value={foodBudget}
                            onChange={(e) => setFoodBudget(Number(e.target.value))}
                          />
                        </div>
                        <strong>{formatMoney(foodBudget)}</strong>
                      </div>

                      <div className="expense-slider-row">
                        <div className="slider-icon rent">
                          <Building2 size={15} />
                        </div>
                        <div className="slider-info">
                          <span>{livingSituation === 'hostel' ? 'Mess & Hostel Dues' : livingSituation === 'flat' ? 'Room Rent & Groceries' : 'Personal Discretionary'}</span>
                          <input
                            type="range"
                            min="0"
                            max="15000"
                            step="250"
                            value={rentOrMess}
                            onChange={(e) => setRentOrMess(Number(e.target.value))}
                          />
                        </div>
                        <strong>{formatMoney(rentOrMess)}</strong>
                      </div>

                      <div className="expense-slider-row">
                        <div className="slider-icon travel">
                          <Bus size={15} />
                        </div>
                        <div className="slider-info">
                          <span>Metro, Bus & Travel</span>
                          <input
                            type="range"
                            min="200"
                            max="6000"
                            step="100"
                            value={travelBudget}
                            onChange={(e) => setTravelBudget(Number(e.target.value))}
                          />
                        </div>
                        <strong>{formatMoney(travelBudget)}</strong>
                      </div>

                      <div className="expense-slider-row">
                        <div className="slider-icon study">
                          <BookOpen size={15} />
                        </div>
                        <div className="slider-info">
                          <span>Books, Tech & Courses</span>
                          <input
                            type="range"
                            min="200"
                            max="5000"
                            step="100"
                            value={booksBudget}
                            onChange={(e) => setBooksBudget(Number(e.target.value))}
                          />
                        </div>
                        <strong>{formatMoney(booksBudget)}</strong>
                      </div>

                      <div className="expense-slider-row">
                        <div className="slider-icon subs">
                          <Film size={15} />
                        </div>
                        <div className="slider-info">
                          <span>Subscriptions & Weekend Outings</span>
                          <input
                            type="range"
                            min="100"
                            max="3000"
                            step="50"
                            value={subscriptionsBudget}
                            onChange={(e) => setSubscriptionsBudget(Number(e.target.value))}
                          />
                        </div>
                        <strong>{formatMoney(subscriptionsBudget)}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Primary Savings Goal */}
                {step === 3 && (
                  <div className="step-body fade-in">
                    <div className="flow-step-header">
                      <span className="step-badge">STEP 4 OF 5</span>
                      <h2>Your First Target Goal 🎯</h2>
                      <p className="muted">
                        What are you saving up for? Finwise calculates an automatic monthly pace.
                      </p>
                    </div>

                    <div className="form-group">
                      <label>Goal Title</label>
                      <input
                        type="text"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="e.g. New M3 MacBook Pro, Exam Fees, Ladakh Trip..."
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Target Amount (₹)</label>
                        <input
                          type="number"
                          min="500"
                          step="500"
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(Number(e.target.value) || 0)}
                          placeholder="e.g. 50000"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Target Timeline</label>
                        <select
                          value={goalMonths}
                          onChange={(e) => setGoalMonths(Number(e.target.value))}
                        >
                          <option value={3}>In 3 Months</option>
                          <option value={6}>In 6 Months</option>
                          <option value={8}>In 8 Months</option>
                          <option value={12}>In 1 Year</option>
                          <option value={24}>In 2 Years</option>
                        </select>
                      </div>
                    </div>

                    <div className="goal-preset-chips">
                      <label>Popular Student Goals:</label>
                      <div className="quick-tags-row">
                        {[
                          { title: 'New Laptop', amt: 60000 },
                          { title: 'Semester Trip', amt: 12000 },
                          { title: 'Noise Cancelling Headphones', amt: 8000 },
                          { title: 'Cloud Certification', amt: 10000 },
                        ].map((item) => (
                          <button
                            key={item.title}
                            type="button"
                            className="tag-btn"
                            onClick={() => {
                              setGoalTitle(item.title)
                              setGoalTarget(item.amt)
                            }}
                          >
                            {item.title} ({formatMoney(item.amt)})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: AI Coach Style & Confirmation */}
                {step === 4 && (
                  <div className="step-body fade-in">
                    <div className="flow-step-header">
                      <span className="step-badge">STEP 5 OF 5</span>
                      <h2>Choose Your AI Coach Tone 🤖</h2>
                      <p className="muted">
                        How would you like Finwise AI to advise you on daily spending and impulsive buys?
                      </p>
                    </div>

                    <div className="persona-cards-list">
                      <div
                        className={`persona-card ${aiPersonality === 'Balanced' ? 'active' : ''}`}
                        onClick={() => setAiPersonality('Balanced')}
                      >
                        <div className="persona-icon-box balanced">
                          <Compass size={22} />
                        </div>
                        <div className="persona-text">
                          <strong>Balanced & Smart (Recommended)</strong>
                          <p>
                            Praises smart choices, issues gentle warnings before overspending, and prioritizes balance.
                          </p>
                        </div>
                        {aiPersonality === 'Balanced' && (
                          <CheckCircle2 size={18} className="check-icon" />
                        )}
                      </div>

                      <div
                        className={`persona-card ${aiPersonality === 'Strict' ? 'active' : ''}`}
                        onClick={() => setAiPersonality('Strict')}
                      >
                        <div className="persona-icon-box strict">
                          <Shield size={22} />
                        </div>
                        <div className="persona-text">
                          <strong>Strict & Disciplined</strong>
                          <p>
                            No nonsense. Directly questions unnecessary expenses and keeps you laser-focused on savings.
                          </p>
                        </div>
                        {aiPersonality === 'Strict' && (
                          <CheckCircle2 size={18} className="check-icon" />
                        )}
                      </div>

                      <div
                        className={`persona-card ${aiPersonality === 'Encouraging' ? 'active' : ''}`}
                        onClick={() => setAiPersonality('Encouraging')}
                      >
                        <div className="persona-icon-box encouraging">
                          <Smile size={22} />
                        </div>
                        <div className="persona-text">
                          <strong>Encouraging & Cheerful</strong>
                          <p>
                            Focuses on positivity, celebrates every milestone, and supports student well-being.
                          </p>
                        </div>
                        {aiPersonality === 'Encouraging' && (
                          <CheckCircle2 size={18} className="check-icon" />
                        )}
                      </div>
                    </div>

                    <div className="final-ready-banner">
                      <div className="ready-icon">
                        <Zap size={20} />
                      </div>
                      <div className="ready-text">
                        <strong>All systems calibrated!</strong>
                        <p>
                          Finwise will personalize your Overview, Safe-to-Spend limits, and Budgets using your inputs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Navigation Bar */}
                <div className="step-footer-actions">
                  {step > 0 ? (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => setStep((s) => Math.min(4, s + 1))}
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-btn glow-btn"
                      onClick={handleFinishOnboarding}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Activating Dashboard...'
                      ) : (
                        <>
                          Launch My Finwise Dashboard ✦ <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
