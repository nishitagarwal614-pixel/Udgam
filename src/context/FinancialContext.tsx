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

const STORAGE_KEY = 'finwise_student_data_v3'

const initialProfile: UserProfile = {
  name: 'Student',
  college: '',
  plan: 'Student',
  avatarInitials: 'S',
  monthlyAllowance: 0,
  streakDays: 0,
  currency: '₹',
  theme: 'light',
  aiPersonality: 'Balanced',
  privacyMode: false,
  notificationsEnabled: true,
  hasCompletedOnboarding: false,

}

const initialTransactions: Transaction[] = []

const initialBudgets: Budget[] = []

const initialGoals: Goal[] = []

const initialSubscriptions: Subscription[] = []

const initialAlerts: Alert[] = []

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage
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

    // No fictional starting balance: balance comes only from the user's records.
    const startingBankBalance = 0
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
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const todayDate = now.getDate()
    const daysRemaining = Math.max(1, daysInMonth - todayDate)

    const upcomingBills = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
    // Use only the user's configured allowance; no fictional savings target is added.
    const monthlySavingsBuffer = Math.min(
      Math.max(0, currentBalance),
      Math.floor(Math.max(0, profile.monthlyAllowance) * 0.15),
    )

    const availablePool = Math.max(0, currentBalance - upcomingBills - monthlySavingsBuffer)
    const dailyAllowance = Math.max(0, Math.floor(availablePool / daysRemaining))
    const dailyBurnRate =
      totalExpenses > 0
        ? Math.round(totalExpenses / Math.max(1, todayDate))
        : 0

    return {
      safeDaily: dailyAllowance,
      currentBalance,
      upcomingBillsTotal: upcomingBills,
      savingsBufferTotal: monthlySavingsBuffer,
      availablePool,
      daysRemainingInMonth: daysRemaining,
      dailyBurnRate,
      explanation: `Calculated from your ₹${currentBalance.toLocaleString('en-IN')} available balance, minus ₹${upcomingBills} upcoming recurring bills and ₹${monthlySavingsBuffer} savings buffer, spread across ${daysRemaining} remaining days in the current month.`,
    }
  }, [currentBalance, subscriptions, profile.monthlyAllowance, totalExpenses])

  // Health score (0 - 100)
  const healthScore = useMemo<HealthScoreBreakdown>(() => {
    // 1. Savings rate (max 25)
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0
    const savingsRateScore = totalIncome > 0 ? Math.min(25, Math.max(0, Math.round(savingsRatio * 100 * 0.6))) : 0

    // 2. Budget discipline (max 30)
    let budgetsChecked = 0
    let budgetsUnder = 0
    budgets.forEach((b) => {
      budgetsChecked++
      const spent = categoryTotals[b.category] || 0
      if (spent <= b.limit) budgetsUnder++
    })
    const budgetDisciplineScore =
      budgetsChecked > 0 ? Math.round((budgetsUnder / budgetsChecked) * 30) : 0

    // 3. Runway score (max 25)
    const dailySpend = totalExpenses > 0 ? totalExpenses / 10 : 0
    const runwayDays = dailySpend > 0 ? Math.floor(currentBalance / dailySpend) : 0
    const runwayScore = dailySpend > 0 ? Math.min(25, Math.max(0, Math.round((runwayDays / 30) * 25))) : 0

    // 4. Goal pace score (max 20)
    const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
    const totalGoalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)
    const goalRatio = totalGoalTarget > 0 ? totalGoalSaved / totalGoalTarget : 0
    const goalPaceScore = totalGoalTarget > 0 ? Math.min(20, Math.max(0, Math.round(goalRatio * 40))) : 0

    const overall = Math.min(
      100,
      savingsRateScore + budgetDisciplineScore + runwayScore + goalPaceScore
    )

    const strengths = []
    const improvements = []

    if (totalIncome > 0) {
      if (savingsRateScore >= 18) strengths.push('Strong savings rate')
      else improvements.push('Savings margin is tight; review non-essential spending')
    }

    if (budgetsChecked > 0) {
      if (budgetDisciplineScore >= 24) strengths.push('High adherence to category limits')
      else improvements.push('One or more recorded categories are above budget')
    }

    if (dailySpend > 0) {
      if (runwayScore >= 18) strengths.push(`Health buffer of ~${runwayDays} days runway`)
      else improvements.push('Runway is below 15 days; prioritize reserves')
    }

    if (totalGoalTarget > 0) {
      if (goalPaceScore >= 12) strengths.push('Good progress toward your savings goals')
      else improvements.push('Consider regular contributions to your active goals')
    }

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
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysLeft = Math.max(0, daysInMonth - now.getDate())
    const dailyBurn = safeToSpend.dailyBurnRate
    const predictedSpendRemaining = dailyBurn * daysLeft
    const upcomingBills = safeToSpend.upcomingBillsTotal
    const projected = currentBalance - predictedSpendRemaining - upcomingBills
    return Math.max(0, projected)
  }, [currentBalance, safeToSpend])

  // Money runway in days
  const moneyRunwayDays = useMemo(() => {
    const avgDaily = totalExpenses > 0 ? Math.max(1, Math.round(totalExpenses / 12)) : 0
    return avgDaily > 0 ? Math.floor(currentBalance / avgDaily) : 0
  }, [currentBalance, totalExpenses])

  // Spending personality
  const spendingPersonality = useMemo(() => {
    const foodRatio = totalExpenses > 0 ? (categoryTotals.Food || 0) / totalExpenses : 0
    const savingsRatio = totalIncome > 0 ? netSavings / totalIncome : 0

    if (totalExpenses === 0 && totalIncome === 0) {
      return {
        title: 'Getting Started',
        badge: 'New Dashboard',
        description:
          'Add your income and expenses to build a personalized picture of your spending habits.',
        topTrait: 'No spending pattern yet',
        tip: 'Start by recording your latest income or expense.',
      }
    } else if (foodRatio > 0.4) {
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
        tip: 'Keep logging transactions regularly to make your spending pattern more accurate.',
      }
    }
  }, [totalExpenses, categoryTotals, totalIncome, netSavings])

  // Dynamic AI Monthly Story
  const aiMonthlyStory = useMemo(() => {
    const topCatName = topSpendingCategory.category
    const topCatSpent = formatMoney(topSpendingCategory.amount)
    const monthName = new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(new Date())
    if (totalIncome === 0 && totalExpenses === 0) {
      return 'Add your income and expenses to see your personalized monthly financial story.'
    }
    return `In ${monthName}, you recorded ${formatMoney(totalIncome)} in income and ${formatMoney(totalExpenses)} in expenses. ${topCatName} was your top spending category at ${topCatSpent} (${topSpendingCategory.percentage}% of expenses). Your current net savings are ${formatMoney(netSavings)}, with an estimated runway of ${moneyRunwayDays} days. Your current daily safe-to-spend amount is ${formatMoney(safeToSpend.safeDaily)}.`
    }, [
    topSpendingCategory,
    totalIncome,
    totalExpenses,
    netSavings,
    moneyRunwayDays,
    safeToSpend.safeDaily,
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

    setTransactions([])
    setBudgets([])
    setGoals([])
    setAlerts([])
    setProfile(initialProfile)
  }

  const generatePersonalizedPlan = (answers: OnboardingAnswers) => {
    // 1. Update Profile
    const studentName = answers.name.trim() || 'Student'
    const studentCollege = answers.college.trim()
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
          .slice(0, 2) || 'S',
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

    // 3. Create only goals explicitly entered during onboarding.
    const customGoals: Goal[] = answers.goalTitle.trim() && answers.goalTarget > 0
      ? [
          {
            id: 'g-1',
            title: answers.goalTitle.trim(),
            targetAmount: answers.goalTarget,
            savedAmount: 0,
            category: 'Gadget',
            targetDate: '2027-06-30',
            color: 'mint',
            icon: 'Target',
          },
        ]
      : []
    setGoals(customGoals)

    // 4. Do not seed fictional transactions.
    // Transactions are added only when the user records them.
    setTransactions([])

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
    const categoryLimit = budget ? budget.limit : Number.POSITIVE_INFINITY
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
        ? 'May delay one or more of your current savings goals.'
        : 'No immediate delay to your active savings goals.'

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

  // Intelligent Contextual AI Coach
  const askAiCoach = async (query: string): Promise<string> => {
    // Simulate brief thinking time
    await new Promise((resolve) => setTimeout(resolve, 450))

    const q = query.toLowerCase()

    if (q.includes('where') && (q.includes('money') || q.includes('go') || q.includes('spend'))) {
      return `Looking at your actual records: you spent a total of ${formatMoney(totalExpenses)}. Your #1 expense category is **${topSpendingCategory.category}** at ${formatMoney(topSpendingCategory.amount)} (${topSpendingCategory.percentage}% of all expenses). The categories shown here come only from transactions you recorded.`
    }

    if (q.includes('food')) {
      const foodSpent = categoryTotals.Food || 0
      const foodBudget = budgets.find((b) => b.category === 'Food')?.limit
      if (!foodBudget) {
        return `You have recorded ${formatMoney(foodSpent)} in Food spending. Add a Food budget to compare your spending against a planned limit.`
      }
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysLeft = Math.max(1, daysInMonth - now.getDate())
      const pct = Math.round((foodSpent / foodBudget) * 100)
      const remaining = Math.max(0, foodBudget - foodSpent)
      return `You have spent **${formatMoney(foodSpent)}** on Food out of your ${formatMoney(foodBudget)} budget (${pct}% used). With ${daysLeft} days left in the month, that leaves about ${formatMoney(Math.floor(remaining / daysLeft))}/day within the remaining Food budget.`
    }

    if (q.includes('can i spend') || q.includes('spend today') || q.includes('500')) {
      const safe = safeToSpend.safeDaily
      if (q.includes('500')) {
        return `Your calculated safe limit for today is **${formatMoney(safe)}**. Spending ₹500 today is **feasible but slightly above pace** by ₹${500 - safe}. If you spend ₹500 today, compensate tomorrow by keeping under ₹${Math.max(100, safe - (500 - safe))}.`
      }
      return `Your **Safe to Spend today is ${formatMoney(safe)}**. This preserves your ₹${safeToSpend.upcomingBillsTotal} upcoming bills and your monthly goal reserves across the remaining ${safeToSpend.daysRemainingInMonth} days of the current month.`
    }

    if (q.includes('how much can i save') || q.includes('save this month')) {
      return `Based on your ${formatMoney(totalIncome)} income and normal spending trajectory, you are projected to save **${formatMoney(predictedMonthEnd)}** this month. If you reduce your highest-spending category, your projected savings can improve further.`
    }

    if (q.includes('cut') || q.includes('save 2000') || q.includes('2,000') || q.includes('reduce')) {
      return `To reduce spending, start with your highest-spending categories shown in the dashboard. Set a budget for those categories and compare your actual transactions against it each week.`
    }

    if (q.includes('score') || q.includes('health')) {
      return `Your Financial Health Score is **${healthScore.overall}/100**. Here is why:\n- Budget Discipline: **${healthScore.budgetDisciplineScore}/30** (based on your recorded budgets)\n- Savings Rate: **${healthScore.savingsRateScore}/25** (based on your recorded income and expenses)\n- Runway Buffer: **${healthScore.runwayScore}/25** (~${moneyRunwayDays} days of living expenses)\n- Goal Progress: **${healthScore.goalPaceScore}/20** (based on your active goals)\nTo improve your score, keep your recorded category spending within your budgets and build savings consistently.`
    }

    if (q.includes('end of the month') || q.includes('month end') || q.includes('projected') || q.includes('balance')) {
      return `Your projected end-of-month balance is **${formatMoney(predictedMonthEnd)}**. This estimate uses your recorded spending pace and currently configured recurring bills.`
    }

    if (q.includes('laptop') || q.includes('goal') || q.includes('save')) {
      const goal = goals[0]
      if (!goal) {
        return 'You do not have an active savings goal yet. Add a goal to start tracking your progress.'
      }
      const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)
      const percent = goal.targetAmount > 0
        ? Math.round((goal.savedAmount / goal.targetAmount) * 100)
        : 0
      return `You have saved **${formatMoney(goal.savedAmount)}** towards **${goal.title}** (${percent}% complete). Remaining: ${formatMoney(remaining)}.`
    }

    // Default intelligent student finance assistant reply
    if (transactions.length === 0 && goals.length === 0 && budgets.length === 0) {
      return 'Your dashboard is ready. Add your income, expenses, budgets, or goals and I will use those records to answer your questions.'
    }
    return `Based on your current records: you have ${formatMoney(currentBalance)} in liquid balance, your safe daily spend is ${formatMoney(safeToSpend.safeDaily)}, and your financial health score is ${healthScore.overall}/100. Ask about your budgets, transactions, goals, or an upcoming purchase.`
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
