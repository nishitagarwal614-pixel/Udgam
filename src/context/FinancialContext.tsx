import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import type {
  Alert,
  Budget,
  Category,
  Goal,
  HealthScoreBreakdown,
  SafeToSpendBreakdown,
  Subscription,
  Transaction,
  UserProfile,
  AffordabilityResult,
  OnboardingAnswers,
  AiCoachResponse,
} from '../types'
import { processBudgetAdvisorQuery, callGeminiAdvisor } from '../utils/budgetAiAdvisor'


interface FinancialContextType {
  // State
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  subscriptions: Subscription[]
  alerts: Alert[]
  profile: UserProfile
  activeView: string
  showOnboarding: boolean

  // Calculated metrics
  currentBalance: number
  totalIncome: number
  totalExpenses: number
  netSavings: number
  safeToSpend: SafeToSpendBreakdown
  healthScore: HealthScoreBreakdown
  predictedMonthEnd: number
  moneyRunwayDays: number
  categoryTotals: Record<Category, number>
  topSpendingCategory: { category: Category; amount: number; percentage: number }
  spendingPersonality: {
    title: string
    badge: string
    description: string
    topTrait: string
    tip: string
  }
  aiMonthlyStory: string

  // Actions
  setActiveView: (view: string) => void
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => Transaction
  updateTransaction: (id: string, updated: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addBudget: (budget: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, updated: Partial<Budget>) => void
  deleteBudget: (id: string) => void
  setCategoryBudget: (category: Category, limit: number, period?: 'monthly' | 'weekly') => void
  applyBudgetPlan: (plan: Array<{ category: Category; limit: number; period?: 'monthly' | 'weekly' }>) => void

  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'> & { initialDeposit?: number }) => void
  updateGoal: (id: string, updated: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void

  markAlertRead: (id: string) => void
  deleteAlert: (id: string) => void
  clearAllAlerts: () => void

  updateProfile: (updated: Partial<UserProfile>) => void
  resetDataToDefault: () => void

  setShowOnboarding: (show: boolean) => void
  generatePersonalizedPlan: (answers: OnboardingAnswers) => void

  evaluateAffordability: (item: string, amount: number, category?: Category) => AffordabilityResult
  askAiCoach: (query: string) => Promise<AiCoachResponse>
  formatMoney: (amount: number) => string
}

const STORAGE_KEY = 'finwise_student_data_v2'

const initialProfile: UserProfile = {
  name: 'Nishita',
  college: 'IIT Delhi · Computer Science',
  plan: 'Student Pro',
  avatarInitials: 'N',
  monthlyAllowance: 15000,
  streakDays: 5,
  currency: '₹',
  theme: 'light',
  aiPersonality: 'Balanced',
  privacyMode: false,
  notificationsEnabled: true,
  hasCompletedOnboarding: false,

}

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    merchant: 'Swiggy',
    category: 'Food',
    date: '2026-09-02',
    displayDate: 'Today, 12:40 PM',
    timestamp: new Date('2026-09-02T12:40:00').getTime(),
    amount: 340,
    type: 'expense',
    paymentMethod: 'UPI',
    notes: 'Campus mess lunch supplement',
    items: [
      { name: 'Paneer Butter Masala', price: 220, quantity: 1 },
      { name: 'Butter Naan x2', price: 120, quantity: 2 },
    ],
  },
  {
    id: 'tx-2',
    merchant: 'Monthly Stipend & Pocket Money',
    category: 'Income',
    date: '2026-09-01',
    displayDate: 'Yesterday, 9:00 AM',
    timestamp: new Date('2026-09-01T09:00:00').getTime(),
    amount: 15000,
    type: 'income',
    paymentMethod: 'NetBanking',
    notes: 'September pocket allowance & lab assistant stipend',
  },
  {
    id: 'tx-3',
    merchant: 'Metro Card Recharge',
    category: 'Travel',
    date: '2026-09-01',
    displayDate: 'Yesterday, 5:15 PM',
    timestamp: new Date('2026-09-01T17:15:00').getTime(),
    amount: 220,
    type: 'expense',
    paymentMethod: 'UPI',
    notes: 'Yellow line transit to university',
  },
  {
    id: 'tx-4',
    merchant: 'Netflix Student',
    category: 'Subscriptions',
    date: '2026-08-28',
    displayDate: '28 Aug 2026',
    timestamp: new Date('2026-08-28T10:00:00').getTime(),
    amount: 199,
    type: 'expense',
    paymentMethod: 'UPI',
    notes: 'Monthly standard tier split with roomie',
  },
  {
    id: 'tx-5',
    merchant: 'Campus Bookstore',
    category: 'Education',
    date: '2026-08-27',
    displayDate: '27 Aug 2026',
    timestamp: new Date('2026-08-27T16:20:00').getTime(),
    amount: 780,
    type: 'expense',
    paymentMethod: 'Card',
    notes: 'Algorithms textbook & notebook refills',
    items: [
      { name: 'Introduction to Algorithms (Paperback)', price: 650 },
      { name: 'Classmate Spiral Notebooks (Pack of 2)', price: 130 },
    ],
  },
  {
    id: 'tx-6',
    merchant: 'Subway',
    category: 'Food',
    date: '2026-08-25',
    displayDate: '25 Aug 2026',
    timestamp: new Date('2026-08-25T13:10:00').getTime(),
    amount: 280,
    type: 'expense',
    paymentMethod: 'UPI',
    notes: 'Lunch after lab test',
  },
  {
    id: 'tx-7',
    merchant: 'Hostel Maintenance & Mess Share',
    category: 'Bills',
    date: '2026-08-24',
    displayDate: '24 Aug 2026',
    timestamp: new Date('2026-08-24T11:00:00').getTime(),
    amount: 2500,
    type: 'expense',
    paymentMethod: 'NetBanking',
    notes: 'Hostel committee mess dues',
  },
  {
    id: 'tx-8',
    merchant: 'Amazon India',
    category: 'Shopping',
    date: '2026-08-22',
    displayDate: '22 Aug 2026',
    timestamp: new Date('2026-08-22T19:45:00').getTime(),
    amount: 899,
    type: 'expense',
    paymentMethod: 'Card',
    notes: 'Ergonomic desk lamp for hostel room',
  },
  {
    id: 'tx-9',
    merchant: 'Tech Fest Hackathon Fee',
    category: 'Entertainment',
    date: '2026-08-20',
    displayDate: '20 Aug 2026',
    timestamp: new Date('2026-08-20T14:30:00').getTime(),
    amount: 450,
    type: 'expense',
    paymentMethod: 'UPI',
    notes: 'National student hackathon team registration',
  },
  {
    id: 'tx-10',
    merchant: 'Merit Scholarship Prize',
    category: 'Income',
    date: '2026-08-15',
    displayDate: '15 Aug 2026',
    timestamp: new Date('2026-08-15T10:00:00').getTime(),
    amount: 5000,
    type: 'income',
    paymentMethod: 'NetBanking',
    notes: 'Semester academic excellence grant',
  },
]

const initialBudgets: Budget[] = [
  { id: 'b-1', category: 'Food', limit: 4000, period: 'monthly', color: '#1f9d67' },
  { id: 'b-2', category: 'Travel', limit: 2000, period: 'monthly', color: '#5385d5' },
  { id: 'b-3', category: 'Education', limit: 2500, period: 'monthly', color: '#8669c7' },
  { id: 'b-4', category: 'Shopping', limit: 2000, period: 'monthly', color: '#c7764e' },
  { id: 'b-5', category: 'Subscriptions', limit: 800, period: 'monthly', color: '#279265' },
  { id: 'b-6', category: 'Entertainment', limit: 1500, period: 'monthly', color: '#d97706' },
]

const initialGoals: Goal[] = [
  {
    id: 'g-1',
    title: 'New M3 MacBook Pro for Coding',
    targetAmount: 60000,
    savedAmount: 18400,
    category: 'Gadget',
    targetDate: '2027-06-30',
    color: 'mint',
    icon: 'Laptop',
  },
  {
    id: 'g-2',
    title: 'Semester End Goa Roadtrip',
    targetAmount: 12000,
    savedAmount: 4500,
    category: 'Travel',
    targetDate: '2026-12-25',
    color: 'peach',
    icon: 'Palmtree',
  },
  {
    id: 'g-3',
    title: 'Emergency Student Safety Net',
    targetAmount: 10000,
    savedAmount: 6000,
    category: 'Security',
    targetDate: '2026-11-30',
    color: 'lavender',
    icon: 'Shield',
  },
]

const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix Student Tier',
    amount: 199,
    billingCycle: 'monthly',
    nextBillingDate: '2026-09-28',
    category: 'Subscriptions',
  },
  {
    id: 'sub-2',
    name: 'Spotify Premium Student',
    amount: 59,
    billingCycle: 'monthly',
    nextBillingDate: '2026-09-15',
    category: 'Subscriptions',
  },
  {
    id: 'sub-3',
    name: 'Campus High-Speed Wi-Fi Boost',
    amount: 150,
    billingCycle: 'monthly',
    nextBillingDate: '2026-09-10',
    category: 'Bills',
  },
]

const initialAlerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'warning',
    title: 'Food budget approaching limit',
    message: 'You have spent 81% of your ₹4,000 monthly food allowance with 28 days to go.',
    date: '2 hours ago',
    read: false,
    actionView: 'Budgets',
  },
  {
    id: 'alt-2',
    type: 'info',
    title: 'Spotify Student renews soon',
    message: '₹59 will be debited via UPI auto-pay on 15 September.',
    date: '1 day ago',
    read: false,
    actionView: 'Overview',
  },
  {
    id: 'alt-3',
    type: 'success',
    title: 'Goal milestone achieved!',
    message: 'You reached 30% of your New Laptop savings goal. Keep it up!',
    date: '3 days ago',
    read: true,
    actionView: 'Goals',
  },
]

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial seed
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`)
      return saved ? JSON.parse(saved) : initialTransactions
    } catch {
      return initialTransactions
    }
  })

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`)
      return saved ? JSON.parse(saved) : initialBudgets
    } catch {
      return initialBudgets
    }
  })

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_goals`)
      return saved ? JSON.parse(saved) : initialGoals
    } catch {
      return initialGoals
    }
  })

  const [subscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subscriptions`)
      return saved ? JSON.parse(saved) : initialSubscriptions
    } catch {
      return initialSubscriptions
    }
  })

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`)
      return saved ? JSON.parse(saved) : initialAlerts
    } catch {
      return initialAlerts
    }
  })

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name === 'Arjun Sharma' || parsed.name === 'Arjun' || !parsed.name) {
          parsed.name = 'Nishita'
          parsed.avatarInitials = 'N'
        }
        return parsed
      }
      return initialProfile
    } catch {
      return initialProfile
    }
  })

  const [activeView, setActiveView] = useState<string>('Overview')

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.hasCompletedOnboarding !== true
      }
      return true
    } catch {
      return true
    }
  })

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions))
    } catch (e) {
      console.error('Failed to save transactions', e)
    }
  }, [transactions])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets))
    } catch (e) {
      console.error('Failed to save budgets', e)
    }
  }, [budgets])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goals))
    } catch (e) {
      console.error('Failed to save goals', e)
    }
  }, [goals])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts))
    } catch (e) {
      console.error('Failed to save alerts', e)
    }
  }, [alerts])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile))
    } catch (e) {
      console.error('Failed to save profile', e)
    }
  }, [profile])

  // Sync theme with body / HTML root
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [profile.theme])

  // Core Calculations
  const formatMoney = useCallback(
    (amount: number) => {
      const sym = profile.currency || '₹'
      const hasDecimals = amount % 1 !== 0
      return `${sym}${Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2,
      })}`
    },
    [profile.currency]
  )

  // Current balance = all incomes - all expenses
  const { totalIncome, totalExpenses, currentBalance, categoryTotals } = useMemo(() => {
    let inc = 0
    let exp = 0
    const catTotals: Record<Category, number> = {
      Food: 0,
      Travel: 0,
      Education: 0,
      Subscriptions: 0,
      Shopping: 0,
      Entertainment: 0,
      Bills: 0,
      Health: 0,
      Income: 0,
      Other: 0,
    }

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount
      } else {
        exp += tx.amount
        catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount
      }
    })

    // Base balance account started with + incomes - expenses
    const startingBankBalance = 3200 // baseline student starting account cushion
    const balance = startingBankBalance + inc - exp

    return {
      totalIncome: inc,
      totalExpenses: exp,
      currentBalance: Math.max(0, balance),
      categoryTotals: catTotals,
    }
  }, [transactions])

  const netSavings = useMemo(() => {
    return Math.max(0, totalIncome - totalExpenses)
  }, [totalIncome, totalExpenses])

  // Top spending category
  const topSpendingCategory = useMemo(() => {
    let topCat: Category = 'Food'
    let maxAmt = 0
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (cat !== 'Income' && amt > maxAmt) {
        maxAmt = amt
        topCat = cat as Category
      }
    })
    const pct = totalExpenses > 0 ? Math.round((maxAmt / totalExpenses) * 100) : 0
    return { category: topCat, amount: maxAmt, percentage: pct }
  }, [categoryTotals, totalExpenses])

  // Safe to Spend calculation
  const safeToSpend = useMemo<SafeToSpendBreakdown>(() => {
    const daysInMonth = 30
    const todayDate = 2 // 02 September
    const daysRemaining = Math.max(1, daysInMonth - todayDate)

    const upcomingBills = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
    // Allocate 15% of monthly allowance to goals as buffer
    const monthlySavingsBuffer = Math.min(2500, Math.floor(profile.monthlyAllowance * 0.15))

    const availablePool = Math.max(0, currentBalance - upcomingBills - monthlySavingsBuffer)
    const dailyAllowance = Math.max(0, Math.floor(availablePool / daysRemaining))
    const dailyBurnRate = totalExpenses > 0 ? Math.round(totalExpenses / Math.max(1, todayDate)) : 200

    return {
      safeDaily: dailyAllowance > 0 ? dailyAllowance : 150,
      currentBalance,
      upcomingBillsTotal: upcomingBills,
      savingsBufferTotal: monthlySavingsBuffer,
      availablePool,
      daysRemainingInMonth: daysRemaining,
      dailyBurnRate,
      explanation: `Calculated from your ₹${currentBalance.toLocaleString('en-IN')} available balance, minus ₹${upcomingBills} upcoming recurring bills and ₹${monthlySavingsBuffer} savings buffer, spread across ${daysRemaining} remaining days in September.`,
    }
  }, [currentBalance, subscriptions, profile.monthlyAllowance, totalExpenses])

  // Health score (0 - 100)
  const healthScore = useMemo<HealthScoreBreakdown>(() => {
    // 1. Savings rate (max 25)
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0.2
    const savingsRateScore = Math.min(25, Math.max(5, Math.round(savingsRatio * 100 * 0.6)))

    // 2. Budget discipline (max 30)
    let budgetsChecked = 0
    let budgetsUnder = 0
    budgets.forEach((b) => {
      budgetsChecked++
      const spent = categoryTotals[b.category] || 0
      if (spent <= b.limit) budgetsUnder++
    })
    const budgetDisciplineScore =
      budgetsChecked > 0 ? Math.round((budgetsUnder / budgetsChecked) * 30) : 25

    // 3. Runway score (max 25)
    const dailySpend = totalExpenses > 0 ? totalExpenses / 10 : 300
    const runwayDays = dailySpend > 0 ? Math.floor(currentBalance / dailySpend) : 30
    const runwayScore = Math.min(25, Math.max(5, Math.round((runwayDays / 30) * 25)))

    // 4. Goal pace score (max 20)
    const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
    const totalGoalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)
    const goalRatio = totalGoalTarget > 0 ? totalGoalSaved / totalGoalTarget : 0.3
    const goalPaceScore = Math.min(20, Math.max(5, Math.round(goalRatio * 40)))

    const overall = Math.min(
      100,
      Math.max(10, savingsRateScore + budgetDisciplineScore + runwayScore + goalPaceScore)
    )

    const strengths = []
    const improvements = []

    if (savingsRateScore >= 18) strengths.push('Strong student savings rate above 20%')
    else improvements.push('Savings margin is tight; trim non-essential dining')

    if (budgetDisciplineScore >= 24) strengths.push('High adherence to category limits')
    else improvements.push('Food or shopping is straining planned category allocations')

    if (runwayScore >= 18) strengths.push(`Health buffer of ~${runwayDays} days runway`)
    else improvements.push('Runway below 15 days; prioritize emergency reserves')

    if (goalPaceScore >= 12) strengths.push('Consistent deposits into New Laptop goal')
    else improvements.push('Set up small ₹200 weekly micro-deposits for goals')

    return {
      overall,
      savingsRateScore,
      budgetDisciplineScore,
      runwayScore,
      goalPaceScore,
      strengths,
      improvements,
    }
  }, [totalIncome, totalExpenses, budgets, categoryTotals, currentBalance, goals])

  // Predicted month-end balance
  const predictedMonthEnd = useMemo(() => {
    const daysInMonth = 30
    const daysLeft = daysInMonth - 2
    const dailyBurn = safeToSpend.safeDaily
    const predictedSpendRemaining = dailyBurn * daysLeft
    const upcomingBills = safeToSpend.upcomingBillsTotal
    const projected = currentBalance - predictedSpendRemaining - upcomingBills
    return Math.max(800, projected)
  }, [currentBalance, safeToSpend])

  // Money runway in days
  const moneyRunwayDays = useMemo(() => {
    const avgDaily = totalExpenses > 0 ? Math.max(100, Math.round(totalExpenses / 12)) : 250
    return Math.max(1, Math.floor(currentBalance / avgDaily))
  }, [currentBalance, totalExpenses])

  // Spending personality
  const spendingPersonality = useMemo(() => {
    const foodRatio = totalExpenses > 0 ? (categoryTotals.Food || 0) / totalExpenses : 0.3
    const shoppingRatio = totalExpenses > 0 ? (categoryTotals.Shopping || 0) / totalExpenses : 0.1
    const savingsRatio = totalIncome > 0 ? netSavings / totalIncome : 0.2

    if (foodRatio > 0.4) {
      return {
        title: 'Canteen Connoisseur',
        badge: 'Foodie Scholar',
        description:
          'A significant portion of your discretionary pocket money flows into food delivery and canteen treats. You prioritize socializing and good meals.',
        topTrait: 'High Food & Dining Velocity',
        tip: 'Batch ordering with hostel mates or cooking twice a week can unlock ₹1,400 monthly savings.',
      }
    } else if (shoppingRatio > 0.3) {
      return {
        title: 'Tech & Gear Enthusiast',
        badge: 'Impulse Shopper',
        description:
          'You love upgrading your study desk, gadgets, and campus wardrobe. You spend in occasional high-value spikes.',
        topTrait: 'Occasional high-ticket purchases',
        tip: 'Use the 48-hour rule for non-essential online carts to safeguard your end-of-month buffer.',
      }
    } else if (savingsRatio > 0.35) {
      return {
        title: 'Frugal Architect',
        badge: 'Consistent Saver',
        description:
          'You possess exceptional financial discipline for a university student. You consistently maintain reserves and protect your savings targets.',
        topTrait: 'Disciplined cash preservation',
        tip: 'Consider putting idle savings into an automated micro-investment or high-yield student deposit.',
      }
    } else {
      return {
        title: 'Balanced Scholar',
        badge: 'Adaptive Spender',
        description:
          'You balance campus life, books, meals, and fun well. Your spending rises near exams and weekends but returns to a stable mean.',
        topTrait: 'Stable day-to-day rhythm',
        tip: 'Automate ₹500 right when pocket money arrives to grow your laptop fund effortlessly.',
      }
    }
  }, [totalExpenses, categoryTotals, totalIncome, netSavings])

  // Dynamic AI Monthly Story
  const aiMonthlyStory = useMemo(() => {
    const topCatName = topSpendingCategory.category
    const topCatSpent = formatMoney(topSpendingCategory.amount)
    return `In September, you took in ${formatMoney(totalIncome)} across pocket allowance and merit grants, while spending ${formatMoney(totalExpenses)}. ${topCatName} was your top cash outflow at ${topCatSpent} (${topSpendingCategory.percentage}% of expenses). You maintained ${formatMoney(netSavings)} in net surplus, giving you an estimated runway of ${moneyRunwayDays} days. Keep your daily spend under ${formatMoney(safeToSpend.safeDaily)} to cross month-end with a strong ₹${predictedMonthEnd.toLocaleString('en-IN')} buffer.`
  }, [
    topSpendingCategory,
    totalIncome,
    totalExpenses,
    netSavings,
    moneyRunwayDays,
    safeToSpend.safeDaily,
    predictedMonthEnd,
    formatMoney,
  ])

  // Actions
  const addTransaction = (txData: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      displayDate: txData.displayDate || 'Just now',
    }

    setTransactions((prev) => [newTx, ...prev])

    // Generate dynamic alert if an expense exceeds a budget
    if (newTx.type === 'expense') {
      const budget = budgets.find((b) => b.category === newTx.category)
      if (budget) {
        const newCategoryTotal = (categoryTotals[newTx.category] || 0) + newTx.amount
        if (newCategoryTotal > budget.limit) {
          const overBudgetAlert: Alert = {
            id: `alt-${Date.now()}`,
            type: 'danger',
            title: `${newTx.category} budget exceeded!`,
            message: `You spent ${formatMoney(newCategoryTotal)} out of your ${formatMoney(budget.limit)} limit.`,
            date: 'Just now',
            read: false,
            actionView: 'Budgets',
          }
          setAlerts((prev) => [overBudgetAlert, ...prev])
        } else if (newCategoryTotal >= budget.limit * 0.85) {
          const warningAlert: Alert = {
            id: `alt-${Date.now()}`,
            type: 'warning',
            title: `${newTx.category} budget at ${Math.round((newCategoryTotal / budget.limit) * 100)}%`,
            message: `You've used ${formatMoney(newCategoryTotal)} of ${formatMoney(budget.limit)}.`,
            date: 'Just now',
            read: false,
            actionView: 'Budgets',
          }
          setAlerts((prev) => [warningAlert, ...prev])
        }
      }
    }

    return newTx
  }

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    )
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id))
  }

  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `b-${Date.now()}`,
    }
    setBudgets((prev) => [...prev, newBudget])
  }

  const updateBudget = (id: string, updated: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    )
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((item) => item.id !== id))
  }

  const setCategoryBudget = (category: Category, limit: number, period: 'monthly' | 'weekly' = 'monthly') => {
    setBudgets((prev) => {
      const existingIndex = prev.findIndex(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      )
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          limit,
          period,
        }
        return updated
      } else {
        const categoryColors: Record<Category, string> = {
          Food: '#1f9d67',
          Travel: '#5385d5',
          Education: '#8669c7',
          Shopping: '#c7764e',
          Subscriptions: '#279265',
          Entertainment: '#d97706',
          Bills: '#dc2626',
          Health: '#0891b2',
          Income: '#10b981',
          Other: '#64748b',
        }
        const newBudget: Budget = {
          id: `b-${Date.now()}`,
          category,
          limit,
          period,
          color: categoryColors[category] || '#64748b',
        }
        return [...prev, newBudget]
      }
    })
  }

  const applyBudgetPlan = (plan: Array<{ category: Category; limit: number; period?: 'monthly' | 'weekly' }>) => {
    setBudgets((prev) => {
      const updated = [...prev]
      const categoryColors: Record<Category, string> = {
        Food: '#1f9d67',
        Travel: '#5385d5',
        Education: '#8669c7',
        Shopping: '#c7764e',
        Subscriptions: '#279265',
        Entertainment: '#d97706',
        Bills: '#dc2626',
        Health: '#0891b2',
        Income: '#10b981',
        Other: '#64748b',
      }
      plan.forEach((item) => {
        const idx = updated.findIndex((b) => b.category.toLowerCase() === item.category.toLowerCase())
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            limit: item.limit,
            period: item.period || 'monthly',
          }
        } else {
          updated.push({
            id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            category: item.category,
            limit: item.limit,
            period: item.period || 'monthly',
            color: categoryColors[item.category] || '#64748b',
          })
        }
      })
      return updated
    })
  }


  const addGoal = (goalData: Omit<Goal, 'id' | 'savedAmount'> & { initialDeposit?: number }) => {
    const initialDeposit = goalData.initialDeposit || 0
    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      title: goalData.title,
      targetAmount: goalData.targetAmount,
      savedAmount: initialDeposit,
      category: goalData.category,
      targetDate: goalData.targetDate,
      color: goalData.color || 'mint',
      icon: goalData.icon || 'Target',
    }

    if (initialDeposit > 0) {
      // Record transaction deducting deposit from liquid balance
      addTransaction({
        merchant: `Goal Deposit: ${goalData.title}`,
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        displayDate: 'Today',
        amount: initialDeposit,
        type: 'expense',
        paymentMethod: 'UPI',
        notes: `Transfer into savings goal: ${goalData.title}`,
      })
    }

    setGoals((prev) => [...prev, newGoal])
  }

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    )
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((item) => item.id !== id))
  }

  const contributeToGoal = (id: string, amount: number) => {
    if (amount <= 0) return
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g))
    )

    // Deduct from current balance by creating a linked savings transfer expense
    addTransaction({
      merchant: `Savings: ${goal.title}`,
      category: 'Other',
      date: new Date().toISOString().split('T')[0],
      displayDate: 'Today',
      amount,
      type: 'expense',
      paymentMethod: 'UPI',
      notes: `Automated contribution to goal: ${goal.title}`,
    })

    const alert: Alert = {
      id: `alt-${Date.now()}`,
      type: 'success',
      title: `Added ${formatMoney(amount)} to ${goal.title}`,
      message: `Progress is now ${Math.round(((goal.savedAmount + amount) / goal.targetAmount) * 100)}%!`,
      date: 'Just now',
      read: false,
      actionView: 'Goals',
    }
    setAlerts((prev) => [alert, ...prev])
  }

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id))
  }

  const clearAllAlerts = () => {
    setAlerts([])
  }

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }))
  }

  const resetDataToDefault = () => {
    localStorage.removeItem(`${STORAGE_KEY}_transactions`)
    localStorage.removeItem(`${STORAGE_KEY}_budgets`)
    localStorage.removeItem(`${STORAGE_KEY}_goals`)
    localStorage.removeItem(`${STORAGE_KEY}_subscriptions`)
    localStorage.removeItem(`${STORAGE_KEY}_alerts`)
    localStorage.removeItem(`${STORAGE_KEY}_profile`)

    setTransactions(initialTransactions)
    setBudgets(initialBudgets)
    setGoals(initialGoals)
    setAlerts(initialAlerts)
    setProfile(initialProfile)
  }

  const generatePersonalizedPlan = (answers: OnboardingAnswers) => {
    // 1. Update Profile
    const studentName = answers.name.trim() || 'Nishita'
    const studentCollege = answers.college.trim() || 'IIT Delhi · Computer Science'
    const updatedProfile: UserProfile = {
      ...profile,
      name: studentName,
      college: studentCollege,
      monthlyAllowance: answers.monthlyAllowance,
      hasCompletedOnboarding: true,
      avatarInitials:
        studentName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'AS',
    }
    setProfile(updatedProfile)

    // 2. Set Custom Category Budgets based on student answers
    const customBudgets: Budget[] = [
      { id: 'b-1', category: 'Food', limit: answers.foodBudget, period: 'monthly', color: '#1f9d67' },
      { id: 'b-2', category: 'Travel', limit: answers.travelBudget, period: 'monthly', color: '#5385d5' },
      { id: 'b-3', category: 'Education', limit: answers.booksBudget, period: 'monthly', color: '#8669c7' },
      { id: 'b-4', category: 'Bills', limit: answers.rentOrMess, period: 'monthly', color: '#0369a1' },
      { id: 'b-5', category: 'Subscriptions', limit: answers.subscriptionsBudget, period: 'monthly', color: '#279265' },
      {
        id: 'b-6',
        category: 'Shopping',
        limit: Math.max(1000, Math.floor(answers.monthlyAllowance * 0.15)),
        period: 'monthly',
        color: '#c7764e',
      },
    ]
    setBudgets(customBudgets)

    // 3. Set Primary Goal
    const customGoals: Goal[] = [
      {
        id: 'g-1',
        title: answers.goalTitle || 'New M3 MacBook Pro',
        targetAmount: answers.goalTarget || 55000,
        savedAmount: Math.floor((answers.goalTarget || 55000) * 0.25),
        category: 'Gadget',
        targetDate: '2027-06-30',
        color: 'mint',
        icon: 'Target',
      },
      {
        id: 'g-2',
        title: 'Emergency Student Safety Buffer',
        targetAmount: 10000,
        savedAmount: 4500,
        category: 'Security',
        targetDate: '2026-12-31',
        color: 'lavender',
        icon: 'Shield',
      },
    ]
    setGoals(customGoals)

    // 4. Seed initial realistic transactions reflecting their allowance & living situation
    const seededTransactions: Transaction[] = [
      {
        id: `tx-init-inflow`,
        merchant: 'Monthly Pocket Money & Allowance',
        category: 'Income',
        date: '2026-09-01',
        displayDate: '01 Sep',
        timestamp: new Date('2026-09-01T09:00:00').getTime(),
        amount: answers.monthlyAllowance,
        type: 'income',
        paymentMethod: 'NetBanking',
        notes: `Allowance allocated for ${answers.livingSituation === 'hostel' ? 'Hostel campus life' : answers.livingSituation === 'flat' ? 'Rented flat living' : 'Day scholar expenses'}`,
      },
      {
        id: `tx-init-mess`,
        merchant: answers.livingSituation === 'hostel' ? 'Hostel Mess & Room Dues' : answers.livingSituation === 'flat' ? 'Flat Rent & Grocery Share' : 'Family Living Contribution',
        category: 'Bills',
        date: '2026-09-01',
        displayDate: '01 Sep',
        timestamp: new Date('2026-09-01T10:00:00').getTime(),
        amount: answers.rentOrMess,
        type: 'expense',
        paymentMethod: 'UPI',
        notes: 'Monthly fixed accommodation / mess share',
      },
      {
        id: `tx-init-food`,
        merchant: 'Swiggy / Campus Canteen Meal',
        category: 'Food',
        date: '2026-09-02',
        displayDate: 'Today',
        timestamp: new Date('2026-09-02T13:00:00').getTime(),
        amount: 320,
        type: 'expense',
        paymentMethod: 'UPI',
        notes: 'Campus mess supplement & cold drink',
      },
      {
        id: `tx-init-transit`,
        merchant: 'Metro / Campus Transit Recharge',
        category: 'Travel',
        date: '2026-09-02',
        displayDate: 'Today',
        timestamp: new Date('2026-09-02T16:30:00').getTime(),
        amount: 200,
        type: 'expense',
        paymentMethod: 'UPI',
        notes: 'Commute smart card top-up',
      },
    ]
    setTransactions(seededTransactions)

    // 5. Add welcome alert
    const welcomeAlert: Alert = {
      id: `alt-${Date.now()}`,
      type: 'success',
      title: `Welcome, ${studentName}! Homepage Personalized`,
      message: `Your budgets and Safe-to-Spend limits are generated for your ${formatMoney(answers.monthlyAllowance)} allowance. Start logging expenses!`,
      date: 'Just now',
      read: false,
      actionView: 'Overview',
    }
    setAlerts([welcomeAlert])

    setShowOnboarding(false)
  }

  // Affordability Decision Engine
  const evaluateAffordability = (
    item: string,
    amount: number,
    category: Category = 'Shopping'
  ): AffordabilityResult => {
    const balanceAfter = currentBalance - amount
    const budget = budgets.find((b) => b.category === category)
    const currentCategorySpent = categoryTotals[category] || 0
    const categoryLimit = budget ? budget.limit : 3000
    const wouldExceedBudget = currentCategorySpent + amount > categoryLimit
    const remainingMonthEndBefore = predictedMonthEnd
    const remainingMonthEndAfter = Math.max(0, predictedMonthEnd - amount)

    let verdict: 'CAN AFFORD' | 'CAUTION' | 'NOT RECOMMENDED' = 'CAN AFFORD'
    let explanation = ''

    if (amount > currentBalance) {
      verdict = 'NOT RECOMMENDED'
      explanation = `You currently have ${formatMoney(currentBalance)} in your account. Purchasing "${item}" for ${formatMoney(amount)} would cause a negative balance of ${formatMoney(Math.abs(balanceAfter))}.`
    } else if (balanceAfter < safeToSpend.savingsBufferTotal || wouldExceedBudget) {
      verdict = 'CAUTION'
      explanation = `You can technically buy "${item}" for ${formatMoney(amount)}, but it will reduce your projected month-end savings buffer from ${formatMoney(remainingMonthEndBefore)} to ${formatMoney(remainingMonthEndAfter)}${wouldExceedBudget ? ` and push ${category} past your monthly limit of ${formatMoney(categoryLimit)}` : ''}.`
    } else {
      verdict = 'CAN AFFORD'
      explanation = `Go ahead! You have sufficient liquid cash (${formatMoney(currentBalance)}). After buying "${item}" for ${formatMoney(amount)}, your remaining balance of ${formatMoney(balanceAfter)} comfortably covers your upcoming commitments and safe daily budget.`
    }

    const safeToSpendImpact =
      amount <= safeToSpend.safeDaily
        ? `Within today's safe allowance (${formatMoney(safeToSpend.safeDaily)}).`
        : `Consumes ${Math.round((amount / safeToSpend.safeDaily) * 100)}% of today's recommended spending capacity.`

    const goalImpact =
      verdict === 'NOT RECOMMENDED'
        ? 'Severely threatens current savings goals.'
        : verdict === 'CAUTION'
        ? 'May delay your New Laptop goal target by ~2 to 3 weeks.'
        : 'Zero delay to your active savings goals.'

    const monthEndImpact = `Projected month-end reserve shifts from ${formatMoney(remainingMonthEndBefore)} to ${formatMoney(remainingMonthEndAfter)}.`

    return {
      verdict,
      explanation,
      purchaseAmount: amount,
      balanceAfter,
      safeToSpendImpact,
      goalImpact,
      monthEndImpact,
    }
  }

  // Intelligent Contextual AI Coach with Budget Engine & Optional Gemini LLM
  const askAiCoach = async (query: string): Promise<AiCoachResponse> => {
    const advisorContext = {
      profile,
      budgets,
      categoryTotals,
      totalIncome,
      totalExpenses,
      currentBalance,
      safeToSpend,
      healthScore,
      predictedMonthEnd,
      moneyRunwayDays,
      topSpendingCategory,
      goals,
      formatMoney,
      transactions,
      subscriptions,
      evaluateAffordability,
    }

    // Check if user has configured an optional Gemini API key for live generative AI
    const geminiKey =
      typeof window !== 'undefined'
        ? localStorage.getItem('finwise_gemini_api_key')
        : null
    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const geminiResult = await callGeminiAdvisor(query, advisorContext, geminiKey.trim())
        if (geminiResult && geminiResult.text) {
          // If the query was to set or update a budget, also check and execute local action
          const localActionCheck = processBudgetAdvisorQuery(query, advisorContext)
          if (localActionCheck.budgetActionToExecute) {
            const { category, limit, period } = localActionCheck.budgetActionToExecute
            setCategoryBudget(category, limit, period)
            return {
              text: geminiResult.text,
              actionData: localActionCheck.actionData,
            }
          }
          return {
            text: geminiResult.text,
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local advisor:', err)
      }
    }

    // Local deterministic engine (instant, comprehensive, zero failure)
    await new Promise((resolve) => setTimeout(resolve, 350))
    const result = processBudgetAdvisorQuery(query, advisorContext)

    if (result.budgetActionToExecute) {
      const { category, limit, period } = result.budgetActionToExecute
      setCategoryBudget(category, limit, period)
    }

    return {
      text: result.text,
      actionData: result.actionData,
    }
  }

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        subscriptions,
        alerts,
        profile,
        activeView,
        currentBalance,
        totalIncome,
        totalExpenses,
        netSavings,
        safeToSpend,
        healthScore,
        predictedMonthEnd,
        moneyRunwayDays,
        categoryTotals,
        topSpendingCategory,
        spendingPersonality,
        aiMonthlyStory,
        setActiveView,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        setCategoryBudget,
        applyBudgetPlan,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        markAlertRead,
        deleteAlert,
        clearAllAlerts,
        updateProfile,
        resetDataToDefault,
        showOnboarding,
        setShowOnboarding,
        generatePersonalizedPlan,
        evaluateAffordability,
        askAiCoach,
        formatMoney,
      }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export const useFinancial = () => {
  const context = useContext(FinancialContext)
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
}
