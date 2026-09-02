export type TransactionType = 'expense' | 'income'

export type Category =
  | 'Food'
  | 'Travel'
  | 'Education'
  | 'Subscriptions'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Income'
  | 'Other'

export type PaymentMethod = 'UPI' | 'Card' | 'Cash' | 'NetBanking'

export interface ReceiptItem {
  name: string
  price: number
  quantity?: number
}

export interface Transaction {
  id: string
  merchant: string
  category: Category
  date: string // e.g. 2026-09-02
  displayDate?: string
  timestamp: number
  amount: number
  type: TransactionType
  paymentMethod?: PaymentMethod
  notes?: string
  receiptUrl?: string
  items?: ReceiptItem[]
}

export interface Budget {
  id: string
  category: Category
  limit: number
  period: 'monthly' | 'weekly'
  color?: string
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  savedAmount: number
  category: string
  targetDate: string // YYYY-MM-DD
  color: string
  icon?: string
}

export interface Subscription {
  id: string
  name: string
  amount: number
  billingCycle: 'monthly' | 'annual'
  nextBillingDate: string
  category: Category
  icon?: string
}

export type AlertType = 'warning' | 'info' | 'success' | 'danger'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  date: string
  read: boolean
  actionView?: string
}

export interface UserProfile {
  name: string
  college: string
  plan: string
  avatarInitials: string
  monthlyAllowance: number
  streakDays: number
  currency: string
  theme: 'light' | 'dark'
  aiPersonality: 'Balanced' | 'Strict' | 'Encouraging'
  privacyMode: boolean
  notificationsEnabled: boolean
  hasCompletedOnboarding?: boolean
}

export interface OnboardingAnswers {
  name: string
  college: string
  monthlyAllowance: number
  livingSituation: 'hostel' | 'flat' | 'home'
  foodBudget: number
  travelBudget: number
  booksBudget: number
  rentOrMess: number
  subscriptionsBudget: number
  goalTitle: string
  goalTarget: number
}

export interface AffordabilityResult {
  verdict: 'CAN AFFORD' | 'CAUTION' | 'NOT RECOMMENDED'
  explanation: string
  purchaseAmount: number
  balanceAfter: number
  safeToSpendImpact: string
  goalImpact: string
  monthEndImpact: string
}

export interface HealthScoreBreakdown {
  overall: number
  savingsRateScore: number // max 25
  budgetDisciplineScore: number // max 30
  runwayScore: number // max 25
  goalPaceScore: number // max 20
  strengths: string[]
  improvements: string[]
}

export interface SafeToSpendBreakdown {
  safeDaily: number
  currentBalance: number
  upcomingBillsTotal: number
  savingsBufferTotal: number
  availablePool: number
  daysRemainingInMonth: number
  dailyBurnRate: number
  explanation: string
}
