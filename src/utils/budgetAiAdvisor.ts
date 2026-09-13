import type {
  Category,
  Budget,
  UserProfile,
  SafeToSpendBreakdown,
  HealthScoreBreakdown,
  Transaction,
  Subscription,
  AffordabilityResult,
} from '../types'
import { answerAntigravityQuery } from './antigravityEngine'

export interface BudgetActionData {
  type: 'budget_created' | 'budget_updated' | 'budget_plan_recommended'
  category?: Category
  limit?: number
  oldLimit?: number
  spent?: number
  remaining?: number
  plan?: Array<{ category: Category; limit: number; percentage: number }>
}

export interface AiCoachAdvisorResult {
  text: string
  actionData?: BudgetActionData
  budgetActionToExecute?: {
    category: Category
    limit: number
    period: 'monthly' | 'weekly'
  }
}

export interface BudgetAdvisorContext {
  profile: UserProfile
  budgets: Budget[]
  categoryTotals: Record<Category, number>
  totalIncome: number
  totalExpenses: number
  currentBalance: number
  safeToSpend: SafeToSpendBreakdown
  healthScore: HealthScoreBreakdown
  predictedMonthEnd: number
  moneyRunwayDays: number
  topSpendingCategory: { category: Category; amount: number; percentage: number }
  goals: Array<{ id: string; title: string; targetAmount: number; savedAmount: number }>
  formatMoney: (amount: number) => string
  transactions?: Transaction[]
  subscriptions?: Subscription[]
  evaluateAffordability?: (item: string, amount: number, category?: Category) => AffordabilityResult
}

export const CATEGORY_SYNONYMS: Record<Category, string[]> = {
  Food: [
    'food',
    'dining',
    'swiggy',
    'zomato',
    'canteen',
    'mess',
    'groceries',
    'grocery',
    'eating',
    'meals',
    'snack',
    'snacks',
    'lunch',
    'dinner',
    'breakfast',
    'cafe',
  ],
  Travel: [
    'travel',
    'transit',
    'commute',
    'metro',
    'bus',
    'train',
    'cab',
    'cabs',
    'uber',
    'ola',
    'auto',
    'fuel',
    'petrol',
    'fare',
  ],
  Education: [
    'education',
    'books',
    'book',
    'study',
    'course',
    'courses',
    'tuition',
    'academic',
    'xerox',
    'stationery',
    'college fee',
    'exam',
    'udemy',
    'coursera',
  ],
  Shopping: [
    'shopping',
    'clothes',
    'clothing',
    'apparel',
    'gear',
    'shoes',
    'amazon',
    'flipkart',
    'myntra',
    'zudio',
    'gadget',
    'gadgets',
  ],
  Entertainment: [
    'entertainment',
    'movies',
    'movie',
    'cinema',
    'games',
    'gaming',
    'party',
    'outing',
    'concert',
    'fun',
    'club',
    'pub',
  ],
  Subscriptions: [
    'subscriptions',
    'subscription',
    'netflix',
    'spotify',
    'prime',
    'hotstar',
    'youtube',
    'membership',
  ],
  Bills: [
    'bills',
    'bill',
    'hostel',
    'rent',
    'electricity',
    'wifi',
    'broadband',
    'water',
    'maintenance',
    'recharge',
    'mobile bill',
  ],
  Health: [
    'health',
    'medical',
    'medicine',
    'meds',
    'pharmacy',
    'doctor',
    'clinic',
    'gym',
    'fitness',
    'hospital',
    'dental',
  ],
  Income: ['income', 'salary', 'stipend', 'pocket money', 'allowance'],
  Other: ['other', 'misc', 'miscellaneous'],
}

export function matchCategory(text: string): Category | null {
  const lower = text.toLowerCase()
  for (const [cat, words] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const w of words) {
      const regex = new RegExp(`\\b${w}\\b`, 'i')
      if (regex.test(lower)) {
        return cat as Category
      }
    }
  }
  return null
}

export function extractAmount(text: string): number | null {
  const clean = text.replace(/\b(?:2024|2025|2026|2027)\b/g, '')

  const kMatch = clean.match(/(?:(?:rs\.?|inr|₹|\$)\s*)?(\d+(?:\.\d+)?)\s*k\b/i)
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000
  }

  const match = clean.match(/(?:(?:rs\.?|inr|₹|\$)\s*)?(\d[\d,]*)(?:\s*(?:rupees|rs|inr))?/i)
  if (match) {
    const raw = match[1].replace(/,/g, '')
    const val = parseFloat(raw)
    if (!isNaN(val) && val > 0) return val
  }

  return null
}

export function generateRecommendedBudgetPlan(
  allowance: number
): Array<{ category: Category; limit: number; percentage: number }> {
  const base = allowance > 0 ? allowance : 15000
  return [
    { category: 'Food', percentage: 30, limit: Math.round((base * 0.3) / 100) * 100 },
    { category: 'Travel', percentage: 15, limit: Math.round((base * 0.15) / 100) * 100 },
    { category: 'Education', percentage: 15, limit: Math.round((base * 0.15) / 100) * 100 },
    { category: 'Shopping', percentage: 10, limit: Math.round((base * 0.1) / 100) * 100 },
    { category: 'Entertainment', percentage: 10, limit: Math.round((base * 0.1) / 100) * 100 },
    { category: 'Subscriptions', percentage: 5, limit: Math.round((base * 0.05) / 100) * 100 },
    { category: 'Health', percentage: 5, limit: Math.round((base * 0.05) / 100) * 100 },
  ]
}

export type BudgetIntent =
  | { type: 'set_budget'; category: Category; amount: number; period: 'monthly' | 'weekly' }
  | { type: 'plan_recommendation' }
  | { type: 'spending_reduction_advice' }
  | { type: 'all_budgets_status' }
  | { type: 'over_budget_check' }
  | { type: 'daily_budget_query'; category?: Category }
  | { type: 'category_budget_query'; category: Category }
  | { type: 'profile_name' }
  | { type: 'bot_identity' }
  | { type: 'profile_college' }
  | { type: 'balance_query' }
  | { type: 'transactions_query' }
  | { type: 'affordability_query'; amount?: number }
  | { type: 'what_is_budget' }
  | { type: 'student_money_management' }
  | { type: 'how_to_save_money_student' }
  | { type: 'budgeting_methods' }
  | { type: 'stick_to_budget_overspending' }
  | { type: 'needs_vs_wants' }
  | { type: 'emergency_fund_student' }
  | { type: 'investing_student' }
  | { type: 'earn_money_student' }
  | { type: 'peer_pressure' }
  | { type: 'inflation_concept' }
  | { type: 'credit_score_student' }
  | { type: 'greeting' }
  | { type: 'gratitude' }
  | { type: 'budget_advice' }
  | { type: 'general' }

export function parseBudgetIntent(query: string): BudgetIntent {
  const q = query.toLowerCase().trim()

  // 1. Plan recommendation
  if (
    q.includes('create a budget for me') ||
    q.includes('create budget for me') ||
    q.includes('create budgets for me') ||
    q.includes('make a budget for me') ||
    q.includes('suggest a budget') ||
    q.includes('recommend a budget') ||
    q.includes('budget plan') ||
    q.includes('how should i allocate') ||
    q.includes('create my budget') ||
    q.includes('plan my budget') ||
    q.includes('build a budget') ||
    q.includes('help me make a budget') ||
    (q.includes('create budget') &&
      (q.includes('recommend') || q.includes('auto') || q.includes('suggest') || q.includes('ideal')))
  ) {
    return { type: 'plan_recommendation' }
  }

  // 2. Set / update specific category budget
  const isCreateVerb = /\b(?:create|set|add|make|change|update|new|put|allocate|budget)\b/i.test(q)
  const hasBudgetWord = /\b(?:budget|limit|allowance|cap)\b/i.test(q)

  if (isCreateVerb || hasBudgetWord || q.startsWith('budget ')) {
    const cat = matchCategory(q)
    const amt = extractAmount(q)
    if (cat && amt && amt >= 100) {
      const period = q.includes('week') ? 'weekly' : 'monthly'
      return {
        type: 'set_budget',
        category: cat,
        amount: amt,
        period,
      }
    }
  }

  // 3. Profile Name & Identity (e.g. "why is my name?", "what is my name?", "who am I?")
  if (
    q.includes('my name') ||
    q.includes('who am i') ||
    q.includes('call me') ||
    q.includes('why is my name') ||
    q.includes('what is my name') ||
    q.includes('name is') ||
    q.includes('change my name')
  ) {
    return { type: 'profile_name' }
  }

  // 4. Bot Identity (e.g. "who are you?", "what are you?", "what is your name?")
  if (
    q.includes('who are you') ||
    q.includes('what are you') ||
    q.includes('what is your name') ||
    q.includes('what can you do') ||
    q.includes('your purpose')
  ) {
    return { type: 'bot_identity' }
  }

  // 5. College / University
  if (
    q.includes('my college') ||
    q.includes('what college') ||
    q.includes('which college') ||
    q.includes('which university') ||
    q.includes('where do i study') ||
    q.includes('where i study') ||
    q.includes('my campus')
  ) {
    return { type: 'profile_college' }
  }

  // 6. Balance Query (e.g. "what is my balance?", "how much money do I have?")
  if (
    q.includes('my balance') ||
    q.includes('how much money do i have') ||
    q.includes('how much cash') ||
    q.includes('current balance') ||
    q.includes('account balance') ||
    q.includes('how much in my account') ||
    q.includes('what do i have left')
  ) {
    return { type: 'balance_query' }
  }

  // 7. Transactions Query (e.g. "what was my last transaction?", "show recent expenses")
  if (
    q.includes('last transaction') ||
    q.includes('recent transaction') ||
    q.includes('recent expense') ||
    q.includes('latest transaction') ||
    q.includes('latest expense') ||
    q.includes('what did i spend') ||
    q.includes('show recent transactions') ||
    q.includes('transaction history') ||
    q.includes('past expenses')
  ) {
    return { type: 'transactions_query' }
  }

  // 8. Affordability Query (e.g. "can I afford...", "can I buy...", "can I spend ₹500 on...")
  if (
    q.includes('can i afford') ||
    q.includes('can i buy') ||
    (q.includes('can i spend') && extractAmount(q) !== null) ||
    q.includes('should i buy') ||
    q.includes('is it safe to buy')
  ) {
    const amt = extractAmount(q)
    return { type: 'affordability_query', amount: amt || undefined }
  }

  // 9. Investing for students
  if (
    q.includes('invest') ||
    q.includes('investing') ||
    q.includes('stock market') ||
    q.includes('mutual fund') ||
    q.includes('sip') ||
    q.includes('stocks') ||
    q.includes('shares') ||
    q.includes('crypto')
  ) {
    return { type: 'investing_student' }
  }

  // 10. Earning money / Side hustles
  if (
    q.includes('earn money') ||
    q.includes('earning money') ||
    q.includes('side hustle') ||
    q.includes('side gig') ||
    q.includes('make money in college') ||
    q.includes('make money as a student') ||
    q.includes('freelance') ||
    q.includes('internship stipend')
  ) {
    return { type: 'earn_money_student' }
  }

  // 11. Peer Pressure & FOMO
  if (
    q.includes('peer pressure') ||
    q.includes('friends spending') ||
    q.includes('friends spend') ||
    q.includes('fomo') ||
    q.includes('eating out with friends') ||
    q.includes('hanging out')
  ) {
    return { type: 'peer_pressure' }
  }

  // 12. Inflation Concept
  if (q.includes('inflation') || q.includes('cost of living')) {
    return { type: 'inflation_concept' }
  }

  // 13. Credit Score for Students
  if (
    q.includes('credit score') ||
    q.includes('cibil') ||
    q.includes('credit card') ||
    q.includes('build credit')
  ) {
    return { type: 'credit_score_student' }
  }

  // 14. Greetings
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'yo' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.startsWith('hey ') ||
    q.includes('good morning') ||
    q.includes('good afternoon') ||
    q.includes('good evening')
  ) {
    return { type: 'greeting' }
  }

  // 15. Gratitude
  if (
    q.includes('thank you') ||
    q.includes('thanks') ||
    q.includes('thx') ||
    q.includes('awesome thanks') ||
    q.includes('great help')
  ) {
    return { type: 'gratitude' }
  }

  // 15b. Spending reduction & Where to spend less / cut expenses
  if (
    (q.includes('spend') &&
      (q.includes('less') ||
        q.includes('least') ||
        q.includes('lower') ||
        q.includes('cut') ||
        q.includes('reduce') ||
        q.includes('stop') ||
        q.includes('too much'))) ||
    ((q.includes('reduce') ||
      q.includes('cut') ||
      q.includes('lower') ||
      q.includes('trim') ||
      q.includes('minimize')) &&
      (q.includes('expense') ||
        q.includes('spending') ||
        q.includes('spend') ||
        q.includes('cost'))) ||
    q.includes('cut down') ||
    q.includes('cut back') ||
    q.includes('spend less') ||
    q.includes('spend lesser') ||
    q.includes('where to save') ||
    q.includes('where should i save') ||
    q.includes('where can i save') ||
    q.includes('where am i spending') ||
    q.includes('where is my money going') ||
    q.includes('where is all my money') ||
    q.includes('what should i reduce') ||
    q.includes('what to reduce') ||
    q.includes('what to cut') ||
    q.includes('what should i cut') ||
    q.includes('where am i wasting') ||
    q.includes('wasting money') ||
    q.includes('waste money') ||
    q.includes('spending too much') ||
    q.includes('spend too much') ||
    q.includes('which category should i') ||
    q.includes('which category am i') ||
    q.includes('highest expense') ||
    q.includes('biggest expense') ||
    q.includes('most expensive category') ||
    q.includes('audit my spending') ||
    q.includes('review my spending') ||
    q.includes('spending advice') ||
    q.includes('how to spend less') ||
    q.includes('how can i spend less')
  ) {
    return { type: 'spending_reduction_advice' }
  }

  // 16. Sticking to budget & Avoiding overspending (check before all_budgets_status so "stick to my budget" matches here)
  if (
    q.includes('stick to') ||
    q.includes('stop overspending') ||
    q.includes('avoid overspending') ||
    q.includes('control spending') ||
    q.includes('impulse buying') ||
    q.includes('why do budgets fail') ||
    q.includes('discipline with money')
  ) {
    return { type: 'stick_to_budget_overspending' }
  }

  // 17. All Budgets status
  if (
    q.includes('all budget') ||
    q.includes('my budgets') ||
    q.includes('list budget') ||
    q.includes('show budget') ||
    q.includes('total budget') ||
    q.includes('budget overview') ||
    q.includes('budget status') ||
    q.includes('budget summary') ||
    q.includes('what is my budget') ||
    q.includes('how is my budget') ||
    q.includes('how are my budgets')
  ) {
    return { type: 'all_budgets_status' }
  }

  // 18. Over budget / Danger check
  if (
    q.includes('over budget') ||
    q.includes('exceed') ||
    q.includes('danger') ||
    q.includes('overspending') ||
    q.includes('too much') ||
    q.includes('over limit') ||
    q.includes('at risk') ||
    q.includes('cross any budget') ||
    q.includes('crossed my budget')
  ) {
    return { type: 'over_budget_check' }
  }

  // 19. Definition & Importance of a budget
  if (
    q.includes('what is a budget') ||
    q.includes('what is budget') ||
    q.includes('what is budgeting') ||
    q.includes('define budget') ||
    q.includes('meaning of budget') ||
    q.includes('why budget') ||
    q.includes('why is budgeting important') ||
    q.includes('purpose of a budget') ||
    q.includes('benefits of budgeting') ||
    q.includes('why should i budget') ||
    q.includes('why do i need a budget') ||
    q.includes('importance of budget') ||
    q.includes('budget definition')
  ) {
    return { type: 'what_is_budget' }
  }

  // 20. Student Money Management & Allowance/Hostel
  if (
    q.includes('student budget') ||
    q.includes('student budgeting') ||
    q.includes('manage money') ||
    q.includes('money management') ||
    q.includes('budget management') ||
    q.includes('manage budget') ||
    q.includes('managing budget') ||
    q.includes('manage my money') ||
    q.includes('pocket money') ||
    q.includes('hostel') ||
    q.includes('college budget') ||
    q.includes('student finance') ||
    (q.includes('manage') && (q.includes('allowance') || q.includes('expenses') || q.includes('cashflow')))
  ) {
    return { type: 'student_money_management' }
  }

  // 21. How to Save Money as Student
  if (
    q.includes('how to save money') ||
    q.includes('how can i save money') ||
    q.includes('ways to save money') ||
    q.includes('saving money in college') ||
    q.includes('save money as a student') ||
    q.includes('savings tips') ||
    q.includes('student discounts') ||
    q.includes('save more money') ||
    q.includes('cheap student hacks')
  ) {
    return { type: 'how_to_save_money_student' }
  }

  // 22. Budgeting Methods & Frameworks
  if (
    q.includes('50/30/20') ||
    q.includes('50 30 20') ||
    q.includes('zero based') ||
    q.includes('envelope') ||
    q.includes('pay yourself first') ||
    q.includes('budgeting method') ||
    q.includes('budgeting system') ||
    q.includes('budgeting technique') ||
    q.includes('ways to budget') ||
    q.includes('budgeting rule')
  ) {
    return { type: 'budgeting_methods' }
  }

  // 23. Needs vs Wants
  if (
    q.includes('needs vs wants') ||
    q.includes('need vs want') ||
    q.includes('essential vs') ||
    q.includes('discretionary') ||
    q.includes('prioritize expenses')
  ) {
    return { type: 'needs_vs_wants' }
  }

  // 24. Emergency Fund
  if (
    q.includes('emergency fund') ||
    q.includes('safety net') ||
    q.includes('contingency fund') ||
    q.includes('rainy day fund') ||
    q.includes('emergency buffer')
  ) {
    return { type: 'emergency_fund_student' }
  }

  // 25. Daily budget query
  if (
    (q.includes('daily') || q.includes('each day') || q.includes('per day')) &&
    (q.includes('budget') || q.includes('spend') || q.includes('food') || q.includes('travel'))
  ) {
    const cat = matchCategory(q)
    return { type: 'daily_budget_query', category: cat || undefined }
  }

  // 26. Category-specific question
  const cat = matchCategory(q)
  if (
    cat &&
    (hasBudgetWord ||
      q.includes('how much') ||
      q.includes('spent') ||
      q.includes('spending') ||
      q.includes('left') ||
      q.includes('status') ||
      q.includes('remaining'))
  ) {
    return { type: 'category_budget_query', category: cat }
  }

  // 27. General budget advice
  if (
    q.includes('how to budget') ||
    q.includes('how should i budget') ||
    q.includes('budget advice') ||
    q.includes('budget guide') ||
    q.includes('budgeting guide') ||
    q.includes('budget tips')
  ) {
    return { type: 'budget_advice' }
  }

  return { type: 'general' }
}

export function processBudgetAdvisorQuery(
  query: string,
  context: BudgetAdvisorContext
): AiCoachAdvisorResult {
  const intent = parseBudgetIntent(query)
  const {
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
    transactions = [],
    evaluateAffordability,
  } = context

  const daysLeft = Math.max(1, safeToSpend.daysRemainingInMonth || 28)
  const userName = profile.name.split(' ')[0] || 'Nishita'
  const q = query.toLowerCase().trim()

  switch (intent.type) {
    case 'set_budget': {
      const { category, amount, period } = intent
      const existing = budgets.find(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      )
      const spent = categoryTotals[category] || 0
      const remaining = amount - spent
      const dailyAllowance = Math.max(0, Math.floor(remaining / daysLeft))
      const isExceeded = remaining < 0

      let reply = ''
      if (existing) {
        reply = `✅ Done! I have updated your **${category}** budget from ${formatMoney(
          existing.limit
        )} to **${formatMoney(amount)}** (${period}).\n\n`
      } else {
        reply = `✨ Done! I have created a new **${category}** budget with a limit of **${formatMoney(
          amount
        )}** (${period}).\n\n`
      }

      if (isExceeded) {
        reply += `⚠️ **Notice**: You have already spent **${formatMoney(
          spent
        )}** on ${category} this month, which exceeds your new limit by **${formatMoney(
          Math.abs(remaining)
        )}**.`
      } else {
        reply += `• Spent so far: **${formatMoney(spent)}** (${Math.round(
          (spent / amount) * 100
        )}% used)\n• Remaining buffer: **${formatMoney(
          remaining
        )}**\n• Recommended safe daily pace: **${formatMoney(
          dailyAllowance
        )}/day** across the remaining ${daysLeft} days of the month.`
      }

      return {
        text: reply,
        budgetActionToExecute: {
          category,
          limit: amount,
          period,
        },
        actionData: {
          type: existing ? 'budget_updated' : 'budget_created',
          category,
          limit: amount,
          oldLimit: existing?.limit,
          spent,
          remaining,
        },
      }
    }

    case 'plan_recommendation': {
      const allowance = profile.monthlyAllowance || totalIncome || 15000
      const plan = generateRecommendedBudgetPlan(allowance)
      const allocatedSum = plan.reduce((acc, curr) => acc + curr.limit, 0)
      const savingsBuffer = allowance - allocatedSum

      let text = `🎯 **Personalized Student Budget Plan for ${userName}**\n\nBased on your monthly allowance of **${formatMoney(
        allowance
      )}**, here is an ideal, student-tested allocation designed to keep you stress-free:\n\n`

      plan.forEach((item) => {
        text += `• **${item.category}**: ${formatMoney(item.limit)} (${item.percentage}%)\n`
      })

      text += `• **Savings & Safety Buffer**: ${formatMoney(
        Math.max(0, savingsBuffer)
      )} (~10%)\n\n`
      text += `💡 *This plan balances daily campus life (mess/canteen food, metro commutes, stationery) with fun and steady savings for your goals.*\n\nClick the button below to apply this plan directly to your account with 1 click!`

      return {
        text,
        actionData: {
          type: 'budget_plan_recommended',
          plan,
        },
      }
    }

    case 'profile_name': {
      if (
        q.includes('why is my name') ||
        q.includes('why my name') ||
        q.includes('why is it') ||
        (q.includes('why') && q.includes('name'))
      ) {
        return {
          text: `Your name is registered as **${profile.name}** in your FinWise student profile! 👤\n\nThis name is used throughout your dashboard to personalize your financial health score, daily safe spending pace, and goal tracking. If you'd like to use a different name or nickname, you can change it anytime in the **Settings** tab!`,
        }
      }
      if (q.includes('who am i')) {
        return {
          text: `You are **${profile.name}**, a student at **${profile.college || 'your university'}**! 🎓\n\nYou're currently using FinWise to manage your allowance of ${formatMoney(profile.monthlyAllowance || 15000)}/month, maintain healthy financial habits, and work toward your savings goals.`,
        }
      }
      return {
        text: `Your name is **${profile.name}**! 👤 You can update your name, college, or profile details anytime in the **Settings** tab.`,
      }
    }

    case 'bot_identity': {
      return {
        text: `🌌 **Greetings! I am Finwise AI.**\n\nI am an advanced autonomous agentic AI assistant and student co-pilot. I combine deep analytical reasoning, coding mastery, academic mentorship, and student financial advisory into a single seamless assistant.\n\n**What I can do for you, ${userName}:**\n• 💻 **Code & Algorithms**: Write, debug, and explain Python, TypeScript, React, DSA (Quicksort, Binary Search), and system design.\n• 🎓 **College & Academics**: Placement roadmaps, semester exam strategies (OS, DBMS, CN), and project architectures.\n• 📚 **Universal Knowledge**: Science, physics (gravity, relativity, quantum), mathematics, and email drafting.\n• 💰 **Live Financial Co-Pilot**: Connected directly to your finances at **${profile.college || 'Delhi Technological University (DTU)'}** (Balance: **${formatMoney(currentBalance)}**, Safe Daily Spend: **${formatMoney(safeToSpend.safeDaily)}/day**).\n\nFeel free to ask me literally anything!`,
      }
    }

    case 'profile_college': {
      return {
        text: `According to your profile, you are currently enrolled at **${profile.college || 'Delhi Technological University (DTU)'}**! 🎓\n\nYou can update your college name or academic details anytime in the **Settings** tab.`,
      }
    }

    case 'balance_query': {
      return {
        text: `You currently have **${formatMoney(currentBalance)}** available in your liquid balance. 💰\n\n• **Safe Daily Spend**: ${formatMoney(safeToSpend.safeDaily)}/day for the remaining ${daysLeft} days\n• **Projected Month-End**: ${formatMoney(predictedMonthEnd)}\n• **Financial Health Score**: ${healthScore.overall}/100`,
      }
    }

    case 'transactions_query': {
      if (!transactions || transactions.length === 0) {
        return {
          text: `You don't have any recent transactions logged yet. You can log one by clicking the **Add Expense** button or by uploading a receipt in the **Scanner** tab!`,
        }
      }

      const sorted = [...transactions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      const latest = sorted[0]
      const recentList = sorted.slice(0, 4)

      let text = `🧾 **Recent Transactions**\n\nYour most recent transaction was **${latest.merchant}** for **${formatMoney(latest.amount)}** (${latest.category}, ${latest.displayDate || latest.date}).\n\n**Recent Activity:**\n`
      recentList.forEach((t) => {
        const sign = t.type === 'income' ? '+' : '-'
        text += `• ${t.merchant}: **${sign}${formatMoney(t.amount)}** (${t.category}, ${t.displayDate || t.date})\n`
      })

      return { text }
    }

    case 'affordability_query': {
      const amt = intent.amount || extractAmount(query) || 500
      const cat = matchCategory(query) || 'Shopping'

      if (evaluateAffordability) {
        const verdict = evaluateAffordability(query, amt, cat)
        let icon = '🟢'
        if (verdict.verdict === 'CAUTION') icon = '🟡'
        if (verdict.verdict === 'NOT RECOMMENDED') icon = '🔴'

        return {
          text: `${icon} **Affordability Verdict: ${verdict.verdict}**\n\n${verdict.explanation}\n\n• **Balance After**: ${formatMoney(verdict.balanceAfter)}\n• **Today's Limit Impact**: ${verdict.safeToSpendImpact}\n• **Goal Impact**: ${verdict.goalImpact}\n• **Projected Month-End**: ${verdict.monthEndImpact}`,
        }
      }

      const safe = safeToSpend.safeDaily
      const canAfford = amt <= currentBalance
      if (!canAfford) {
        return {
          text: `🔴 **Not Recommended**: You have ${formatMoney(currentBalance)} in balance. Spending ${formatMoney(amt)} exceeds your available funds.`,
        }
      }

      const fitsInDaily = amt <= safe
      return {
        text: `${fitsInDaily ? '🟢 **Can Afford**' : '🟡 **Caution**'}: Spending ${formatMoney(amt)} will leave you with ${formatMoney(currentBalance - amt)}.\nYour safe daily pace is ${formatMoney(safe)}/day. ${fitsInDaily ? "This fits safely into today's allowance." : "This uses " + Math.round((amt / safe) * 100) + "% of today's pace, so keep tomorrow's spend lighter."}`,
      }
    }

    case 'investing_student': {
      return {
        text: `📈 **Smart Investing Blueprint for College Students**\n\nInvesting in college is the single best way to harness the power of compound interest. Here is how to do it safely:\n\n**1. Emergency Cushion First**\nNever invest money you might need for mess dues, rent, or upcoming semester fees. Build a ₹3,000–₹5,000 safety buffer before investing.\n\n**2. Start Small with Index Mutual Funds (SIP)**\n• You don't need thousands—you can start a monthly SIP of just **₹250 to ₹500** in a Nifty 50 Index Fund via SEBI-registered apps (like Groww, Zerodha Coin, or IndMoney).\n• Index funds mirror India's top 50 companies with very low expense ratios.\n\n**3. Avoid High-Risk Traps**\n• ❌ **F&O (Futures & Options)**: 93% of retail traders lose money in F&O. Never risk student allowance here.\n• ❌ **Crypto meme coins & Telegram "tip" channels**: High risk of total capital loss.\n\n**4. The Best Investment in College is Skills**\nSpending ₹1,000 on a high-value software, design, or finance certification that leads to a ₹25,000/month stipend beats any stock market return at this stage!\n\n💡 *Finwise helps you build that initial savings pool. Check your **Goals** tab to set your first investment target!*`,
      }
    }

    case 'earn_money_student': {
      return {
        text: `💼 **High-Impact Ways to Earn Money in College**\n\nHere are legitimate, student-tested side hustles that build your resume while earning cash:\n\n**1. High-Skill Freelancing (₹5,000–₹25,000/month)**\n• Web Development / React (building websites for local businesses or startups)\n• UI/UX Design on Figma\n• Technical Content Writing or SEO writing\n• Platforms: Upwork, Freelancer, Contra, Twitter/X, LinkedIn outreach.\n\n**2. Paid Remote Internships**\n• Search Internshala, Wellfound (AngelList), and LinkedIn for part-time winter/summer internships.\n• Many tech, marketing, and research roles offer ₹8,000 to ₹20,000 monthly stipends.\n\n**3. Subject Matter Tutoring**\n• Teach school students (maths, physics, coding) or help juniors in college.\n• Platforms like Chegg India, Cuemath, or offline neighborhood tutoring pay ₹300–₹800/hour.\n\n**4. Campus Ambassador Programs**\n• Represent tech brands (GeeksforGeeks, Unstop, Red Bull) on campus for stipends, free swags, and referral bonuses.\n\n💡 *When your extra income arrives, Finwise automatically tags it as **Income** so your Safe to Spend pace expands!*`,
      }
    }

    case 'peer_pressure': {
      return {
        text: `🤝 **Handling Social Peer Pressure & FOMO in College**\n\nSocial outings are a huge part of university life, but peer pressure can silently drain your monthly allowance by the 10th of the month. Here are practical ways to manage it:\n\n**1. Suggest High-Vibe, Low-Cost Alternatives**\nInstead of an expensive cafe with ₹250 coffee, suggest campus canteen chai, hostel rooftop hangouts, or grabbing street momos.\n\n**2. The 10% Guilt-Free Fun Bucket**\nGive yourself a dedicated **Entertainment / Outing** budget (e.g. ₹1,500/month). Once you know you have dedicated money for fun, you spend guilt-free and stop when that bucket is done.\n\n**3. Master the Respectful Decline Phrase**\nPractice simple, confident phrases: *“I'm saving up for my new laptop right now, so I'll skip this dinner, but let's definitely catch up afterwards!”* True friends always respect financial boundaries.\n\n**4. Never Pay for the Entire Group on UPI**\nIf you pay the bill, send payment requests with split amounts immediately before everyone leaves the table. Unsettled informal debts are the #1 invisible student cash leak!\n\n💡 *Check **"How much is left in my Entertainment budget?"** anytime to see your live fun balance!*`,
      }
    }

    case 'inflation_concept': {
      return {
        text: `📉 **What is Inflation & How Does It Impact Students?**\n\n**Inflation** is the steady rise in prices over time, which means each rupee buys fewer goods and services than before.\n\n**A Simple Real-World Example:**\nIf a plate of college canteen noodles was ₹50 two years ago and costs ₹60 today, that ₹10 increase (20%) is inflation at work. Your pocket money didn't shrink in rupee count, but its purchasing power did.\n\n**How Students Can Beat Inflation:**\n1. **Don't hoard all cash idle in a 0% checking jar**: Keep your emergency buffer in high-yield savings (3.5%–7% p.a.) or auto-sweep FDs.\n2. **Buy annual student transit & software subscriptions**: Lock in discounted student pricing before rates increase.\n3. **Grow your earning capacity**: College is the best time to learn high-income skills (programming, data analysis, marketing) that outpace inflation rates!\n\n💡 *Finwise monitors your category spending trends each month to show you where inflation is creeping into your lifestyle.*`,
      }
    }

    case 'credit_score_student': {
      return {
        text: `💳 **Credit Scores (CIBIL) for College Students Explained**\n\nA **credit score** (ranging from 300 to 900) measures how reliably you repay borrowed money. A high score (750+) unlocks low-interest education loans, car loans, and premium credit cards later in life.\n\n**Can a Student Build a Credit Score?**\nYes, but you must be careful:\n• **Secured Credit Card (FD-backed)**: Open a ₹5,000–₹10,000 Fixed Deposit at a bank (like OneCard, IDFC WOW, or Kotak 811) to get a student credit card without proof of income.\n• **Keep Utilization Under 30%**: If your limit is ₹10,000, never spend more than ₹3,000 on the card.\n• **Pay in Full Every Single Month**: Never pay just the "minimum due"—always clear 100% on time via auto-debit.\n• ❌ **Avoid "Buy Now Pay Later" (BNPL) trap apps**: Excessive micro-loans from sketchy lending apps can hurt your young credit profile.\n\n💡 *Focus on managing your debit and UPI allowance first with Finwise before taking on credit cards!*`,
      }
    }

    case 'greeting': {
      return {
        text: `Hello ${userName}! 👋 I'm your FinWise AI Coach. \n\nYou currently have **${formatMoney(currentBalance)}** available, with a safe spending pace of **${formatMoney(safeToSpend.safeDaily)}/day** for today.\n\nHow can I help you today? You can ask me to create a budget, check recent transactions, see how much you can afford, or ask any question about student money management!`,
      }
    }

    case 'gratitude': {
      return {
        text: `You're very welcome, ${userName}! 😊 I'm always here to help you stay stress-free with your money. Just ask whenever you need guidance, budget adjustments, or financial advice!`,
      }
    }

    case 'all_budgets_status': {
      if (budgets.length === 0) {
        return {
          text: `You don't have any budgets set up yet. Ask me to **"Create a budget for me"** or say **"Create a budget of ₹4,000 for Food"** to get started!`,
        }
      }

      const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
      const totalBudgetSpent = budgets.reduce(
        (sum, b) => sum + (categoryTotals[b.category] || 0),
        0
      )
      const totalRemaining = totalLimit - totalBudgetSpent
      const overallPercent = Math.round((totalBudgetSpent / totalLimit) * 100)

      let text = `📊 **Your Monthly Budgets Overview**\n\n`
      text += `• **Total Budget Limit**: ${formatMoney(totalLimit)}\n`
      text += `• **Total Spent**: ${formatMoney(totalBudgetSpent)} (${overallPercent}% utilized)\n`
      text += `• **Remaining Across All Budgets**: ${formatMoney(
        Math.max(0, totalRemaining)
      )}\n`
      text += `• **Days Remaining in Month**: ${daysLeft} days\n\n`
      text += `**Category Breakdown:**\n`

      budgets.forEach((b) => {
        const spent = categoryTotals[b.category] || 0
        const pct = Math.round((spent / b.limit) * 100)
        let icon = '🟢'
        let status = 'On Track'
        if (pct >= 100) {
          icon = '🔴'
          status = 'Exceeded'
        } else if (pct >= 75) {
          icon = '🟡'
          status = 'Warning'
        }

        text += `${icon} **${b.category}**: ${formatMoney(spent)} / ${formatMoney(
          b.limit
        )} (${pct}%) — *${status}*\n`
      })

      if (overallPercent < 50) {
        text += `\n🌟 Excellent pace! You are well within your limits for this point in the month.`
      } else if (overallPercent < 85) {
        text += `\n👍 You are on a steady pace. Keep an eye on top categories.`
      } else {
        text += `\n⚠️ High utilization alert: Try keeping daily spends strictly within ${formatMoney(
          safeToSpend.safeDaily
        )}.`
      }

      return { text }
    }

    case 'spending_reduction_advice': {
      const sortedCategories = (Object.entries(categoryTotals) as [Category, number][])
        .filter(([, amt]) => amt > 0)
        .sort((a, b) => b[1] - a[1])

      if (sortedCategories.length === 0) {
        return {
          text: `📊 **Spending Audit & Expense Reduction**\n\n` +
            `You haven't logged any expenses yet this month! You have your full **${formatMoney(currentBalance)}** available with a comfortable safe spending rate of **${formatMoney(safeToSpend.safeDaily)}/day**.\n\n` +
            `When you start logging expenses, I will analyze your transactions and pinpoint exactly which categories have room for savings.`,
        }
      }

      const [topCategory, topAmount] = sortedCategories[0]
      const totalMonthExpenses = totalExpenses > 0 ? totalExpenses : sortedCategories.reduce((acc, [, v]) => acc + v, 0)
      const topPct = Math.round((topAmount / (totalMonthExpenses || 1)) * 100)

      const exceededCategories = budgets.filter((b) => (categoryTotals[b.category] || 0) > b.limit)
      const warningCategories = budgets.filter((b) => {
        const spent = categoryTotals[b.category] || 0
        return spent <= b.limit && spent / b.limit >= 0.75
      })

      const discretionaryMap: Partial<Record<Category, string>> = {
        Food: 'Late-night food deliveries (Swiggy/Zomato), cafes, and canteen snacks. Opting for the campus mess or home meals 2-3 extra times a week can easily save ₹1,500–₹2,500/month.',
        Shopping: 'Impulse online purchases and clothes. Follow the **48-Hour Wishlist Rule**: wait 2 days before buying non-essential cart items. In 70% of cases, the desire fades.',
        Entertainment: 'Weekend outings, movies, gaming, and parties. Take advantage of student discount IDs for tickets, or split group tabs instead of paying solo.',
        Subscriptions: 'Recurring streaming services (Netflix, Spotify, Prime, YouTube). Review and cancel or share student/family plans for services you haven\'t opened this week.',
        Travel: 'Daily cab rides (Uber/Ola). Switching to campus shuttles, metro, or carpooling for regular routes can cut travel expenses by up to 50%.',
      }

      const topDiscretionary = sortedCategories.find(([cat]) => cat in discretionaryMap)

      let reply = `💡 **Where You Should Spend Less (Spending Audit for ${userName})**\n\n`
      reply += `Based on your live account data, your highest expense this month is **${topCategory}** at **${formatMoney(topAmount)}** (${topPct}% of your total spending).\n\n`

      if (exceededCategories.length > 0) {
        reply += `🚨 **Immediate Attention (Over Budget):**\n`
        exceededCategories.forEach((b) => {
          const spent = categoryTotals[b.category] || 0
          const diff = spent - b.limit
          reply += `• 🔴 **${b.category}**: Spent ${formatMoney(spent)} vs limit of ${formatMoney(b.limit)} (**+${formatMoney(diff)} over limit**)\n`
        })
        reply += `\n`
      } else if (warningCategories.length > 0) {
        reply += `⚠️ **Approaching Budget Limit (75%+ used):**\n`
        warningCategories.forEach((b) => {
          const spent = categoryTotals[b.category] || 0
          const pct = Math.round((spent / b.limit) * 100)
          reply += `• 🟡 **${b.category}**: ${formatMoney(spent)} / ${formatMoney(b.limit)} (${pct}% used)\n`
        })
        reply += `\n`
      }

      reply += `📊 **Current Spending Breakdown:**\n`
      sortedCategories.slice(0, 4).forEach(([cat, amt]) => {
        const pct = Math.round((amt / (totalMonthExpenses || 1)) * 100)
        const b = budgets.find((item) => item.category.toLowerCase() === cat.toLowerCase())
        const budgetStr = b ? ` (Budget: ${formatMoney(b.limit)})` : ''
        reply += `• **${cat}**: ${formatMoney(amt)} — ${pct}% of total${budgetStr}\n`
      })
      reply += `\n`

      reply += `🎯 **High-Impact Areas to Cut Back Right Now:**\n\n`
      if (topDiscretionary) {
        const [dCat, dAmt] = topDiscretionary
        reply += `1. **Cut ${dCat} (Your Top Flexible Expense: ${formatMoney(dAmt)}):**\n`
        reply += `   ${discretionaryMap[dCat]}\n\n`
      }

      const secondaryDiscretionary = sortedCategories.filter(
        ([cat]) => cat in discretionaryMap && cat !== topDiscretionary?.[0]
      )
      if (secondaryDiscretionary.length > 0) {
        const [sCat, sAmt] = secondaryDiscretionary[0]
        reply += `2. **Trim ${sCat} (${formatMoney(sAmt)} spent):**\n`
        reply += `   ${discretionaryMap[sCat]}\n\n`
      } else {
        reply += `2. **Audit Subscriptions & Micro-transactions:**\n`
        reply += `   Small ₹50–₹150 daily UPI payments quietly accumulate to ₹3,000+ per month. Review your transaction log regularly.\n\n`
      }

      const targetCat = topDiscretionary ? topDiscretionary[0] : topCategory
      const targetAmt = topDiscretionary ? topDiscretionary[1] : topAmount
      const potentialMonthlySavings = Math.round(targetAmt * 0.25)
      const dailyBoost = Math.max(1, Math.round(potentialMonthlySavings / daysLeft))

      reply += `💰 **The Payoff:**\n`
      reply += `If you trim your **${targetCat}** spending by just **25%**, you will save **${formatMoney(potentialMonthlySavings)}** this month. That increases your safe daily spending pace from **${formatMoney(safeToSpend.safeDaily)}/day** to **${formatMoney(safeToSpend.safeDaily + dailyBoost)}/day**!\n\n`
      reply += `Would you like me to set a cap for ${targetCat}? Say: *"Set ${targetCat} budget to ${formatMoney(Math.round(targetAmt * 0.8))}"*`

      return { text: reply }
    }

    case 'over_budget_check': {
      const exceeded = budgets.filter((b) => {
        const spent = categoryTotals[b.category] || 0
        return spent > b.limit
      })

      const warning = budgets.filter((b) => {
        const spent = categoryTotals[b.category] || 0
        return spent <= b.limit && spent / b.limit >= 0.75
      })

      if (exceeded.length === 0 && warning.length === 0) {
        return {
          text: `🎉 **All Clear!** None of your budgets are exceeded or in danger.\n\nEvery category is comfortably under 75% utilization. Your disciplined spending leaves you with ${formatMoney(
            currentBalance
          )} in liquid balance and a safe daily allowance of **${formatMoney(
            safeToSpend.safeDaily
          )}**.`,
        }
      }

      let text = `🚨 **Budget Alert Check**\n\n`

      if (exceeded.length > 0) {
        text += `**Exceeded Categories:**\n`
        exceeded.forEach((b) => {
          const spent = categoryTotals[b.category] || 0
          const diff = spent - b.limit
          text += `• 🔴 **${b.category}**: Spent ${formatMoney(spent)} (Limit: ${formatMoney(
            b.limit
          )}, **+${formatMoney(diff)} over limit**)\n`
        })
        text += `\n*Actionable recovery*: Pause flexible spending in these areas. You can also adjust your budget limit by saying *"Set ${exceeded[0].category} budget to ${formatMoney(
          Math.ceil((categoryTotals[exceeded[0].category] || 0) * 1.1)
        )}"*\n\n`
      }

      if (warning.length > 0) {
        text += `**Approaching Limit (75%+ used):**\n`
        warning.forEach((b) => {
          const spent = categoryTotals[b.category] || 0
          const pct = Math.round((spent / b.limit) * 100)
          const rem = b.limit - spent
          text += `• 🟡 **${b.category}**: ${formatMoney(spent)} / ${formatMoney(
            b.limit
          )} (${pct}% used, only ${formatMoney(rem)} left)\n`
        })
      }

      return { text }
    }

    case 'daily_budget_query': {
      if (intent.category) {
        const cat = intent.category
        const b = budgets.find((item) => item.category.toLowerCase() === cat.toLowerCase())
        const spent = categoryTotals[cat] || 0
        const limit = b ? b.limit : 3000
        const remaining = Math.max(0, limit - spent)
        const daily = Math.floor(remaining / daysLeft)

        return {
          text: `📅 **Daily ${cat} Pace**\n\n• Limit: ${formatMoney(
            limit
          )}\n• Spent: ${formatMoney(spent)}\n• Remaining: ${formatMoney(
            remaining
          )}\n• Days remaining: ${daysLeft} days\n\n👉 Your safe daily pace for **${cat}** is **${formatMoney(
            daily
          )}/day**. Staying under this amount ensures you won't exceed your budget by month-end.`,
        }
      }

      return {
        text: `📅 **Safe to Spend Today**\n\nYour calculated safe spending limit for today is **${formatMoney(
          safeToSpend.safeDaily
        )}**.\n\nThis accounts for your upcoming recurring bills (${formatMoney(
          safeToSpend.upcomingBillsTotal
        )}), preserves your goal deposits, and spreads your liquid cash across the remaining ${daysLeft} days of the month.`,
      }
    }

    case 'category_budget_query': {
      const cat = intent.category
      const b = budgets.find((item) => item.category.toLowerCase() === cat.toLowerCase())
      const spent = categoryTotals[cat] || 0

      if (!b) {
        return {
          text: `You don't currently have a set budget for **${cat}**.\nYou have spent **${formatMoney(
            spent
          )}** on ${cat} this month.\n\nWould you like me to create one? Just say: *"Create a budget of ₹${Math.max(
            1500,
            Math.ceil((spent * 1.5) / 500) * 500
          )} for ${cat}"*.`,
        }
      }

      const rem = b.limit - spent
      const pct = Math.round((spent / b.limit) * 100)
      const daily = Math.max(0, Math.floor(rem / daysLeft))

      let reply = `🔍 **${cat} Budget Status**\n\n`
      reply += `• Monthly Limit: **${formatMoney(b.limit)}**\n`
      reply += `• Spent to Date: **${formatMoney(spent)}** (${pct}%)\n`
      reply += `• Remaining Balance: **${formatMoney(rem)}**\n`
      reply += `• Safe Daily Pace: **${formatMoney(daily)}/day** (for ${daysLeft} days)\n\n`

      if (pct > 100) {
        reply += `⚠️ You have exceeded this budget by ${formatMoney(
          Math.abs(rem)
        )}. Try holding off on discretionary expenses or increase the cap by asking me to update it.`
      } else if (pct >= 80) {
        reply += `🟡 You have used over 80% of your ${cat} budget. Keeping daily spend under ${formatMoney(
          daily
        )} will keep you safe.`
      } else {
        reply += `🟢 You are well within your ${cat} budget! Keep up the good work.`
      }

      return { text: reply }
    }

    case 'budget_advice': {
      return {
        text: `🎓 **Student Budgeting Blueprint (The 50/30/20 Rule for College Life)**\n\nManaging pocket money and stipends is all about balance:\n\n1. **50% Essentials**: Hostel/rent, campus mess, metro cards, textbooks, and essential pharmacy.\n2. **30% Campus Life & Social**: Cafe meetups, movie nights, Swiggy orders, and weekend fun.\n3. **20% Future You**: Emergency safety buffer and gadget/savings goals (like a new coding laptop).\n\n💡 **Top 3 Pro-Tips for Students**:\n• **Mind the UPI Micropayments**: ₹40 chai + ₹30 snacks 4x a day quietly adds up to ₹8,400/month!\n• **Batch Delivery Orders**: Combine Swiggy/Zomato with hostel roommates to split delivery fees.\n• **Set Category Caps**: Ask me anytime to adjust your caps (e.g. *"Set Food budget to ₹4,000"*).`,
      }
    }

    case 'what_is_budget': {
      return {
        text: `📘 **What is a Budget & Why Does It Matter for Students?**\n\nA budget is simply **a proactive plan for your money**. It tells every rupee where to go *before* the month begins, rather than leaving you wondering where it all went at month-end.\n\n**The 4 Core Superpowers of Budgeting in College:**\n1. **Guilt-Free Spending**: When you have an allocated budget for dining or movies, you can enjoy outings and parties without financial anxiety or guilt.\n2. **Defeating the "Week 3 Broke" Syndrome**: Paces your monthly allowance/stipend evenly across all 30 days so you don't run out of cash before the next pocket money arrives.\n3. **Funding Dream Goals**: Even a modest student budget builds real progress—saving ₹1,500/month gets you ₹18,000 in a year toward a laptop, trip, or certification.\n4. **Total Freedom & Control**: A budget is NOT a restriction or punishment—it gives you total control over your life and choices.\n\n💡 *Ready to set yours? Ask me: **"Create a budget for me"** or say **"Create a budget of ₹4,000 for Food"**!*`,
      }
    }

    case 'student_money_management': {
      return {
        text: `🎓 **The Complete Student Money Management Playbook**\n\nManaging money in college is about balancing academic essentials, campus life, and peace of mind. Here is a battle-tested framework for university students:\n\n**1. The 4-Week Pacing Rule**\nDivide your monthly allowance by 4 weeks (e.g. ₹12,000 ÷ 4 = ₹3,000/week). Treat each week as an independent cycle so you don't blow your funds in the first 10 days.\n\n**2. Tame UPI Micropayments (The #1 Student Cash Leak)**\nSmall payments—₹40 chai, ₹50 campus snacks, ₹70 quick rides—quietly add up to ₹3,000–₹5,000/month! Check your transactions regularly on Finwise to catch these leaks early.\n\n**3. Settle Roommate & Group Expenses Immediately**\nWhen splitting food delivery, cab rides, or hostel groceries, settle immediately via UPI. Informal debts cause social friction and unrecorded cash drain.\n\n**4. Separate Essentials from Flexible Fun**\nRingfence mandatory costs first (mess fees, monthly metro pass, mobile recharge). Whatever remains is your true flexible spending money.\n\n**5. Build a ₹3,000–₹5,000 Student Safety Net**\nKeep an emergency buffer for unexpected expenses (laptop charger dies, prescription meds, urgent tickets home) so you never have to scramble.\n\n💡 *Want me to design your ideal student budget? Just say: **"Create a budget for me"**!*`,
      }
    }

    case 'how_to_save_money_student': {
      return {
        text: `💡 **Top Student Money-Saving Hacks**\n\nHere are high-impact, realistic ways to save ₹2,000 to ₹4,000 every month without sacrificing your college experience:\n\n**1. Dining & Food Delivery**\n• Combine Swiggy/Zomato orders with hostel friends to split delivery fees and packaging.\n• Treat campus mess meals as your baseline; save cafe visits and food delivery for weekends.\n\n**2. Transit & Commute**\n• Get a student concession metro or bus pass—it saves 40%–50% compared to daily single tokens or auto rides.\n• Walk or cycle for campus trips under 1.5 km.\n\n**3. Academic & Tech Discounts**\n• Use your student email for massive discounts: Spotify Premium Student (₹59/mo), Apple Student Pricing, GitHub Student Developer Pack, and Amazon Prime Student.\n• Buy second-hand textbooks from seniors or borrow digital editions from your campus library.\n\n**4. The 48-Hour Impulse Rule**\nBefore buying non-essential apparel, gadgets, or accessories online, wait 48 hours. 70% of the time, the urge fades and you keep your money.\n\n💡 *Try asking me: **"What should I cut to save ₹2,000?"** for an analysis tailored to your real spending!*`,
      }
    }

    case 'budgeting_methods': {
      return {
        text: `🧭 **The 4 Best Budgeting Systems for Students**\n\nChoose the method that matches your lifestyle:\n\n**1. The 50/30/20 College Rule (Best for Beginners)**\n• **50% Needs**: Hostel/mess, commute passes, prescribed books, medical essentials.\n• **30% Wants**: Cafes, weekend movies, fashion, subscriptions, social events.\n• **20% Savings**: Emergency buffer and goal funds (like a laptop or travel).\n\n**2. The Digital Envelope System (What Finwise Uses!)**\nAssign fixed spending limits to each category (e.g., Food: ₹4,000, Travel: ₹2,000, Entertainment: ₹1,500). When a category's envelope is exhausted, you stop spending there until the next month.\n\n**3. Zero-Based Budgeting (ZBB)**\nIncome – Expenses – Savings = ₹0. Every rupee received is assigned a specific task before you spend it. Ideal if you earn a predictable monthly stipend.\n\n**4. Pay Yourself First (Reverse Budgeting)**\nThe moment your allowance hits your account, immediately transfer 10%–15% into your savings goal. You can then spend the rest guilt-free knowing your future is secured.\n\n💡 *Say **"Create a budget for me"** and I will automatically calculate the best 50/30/20 plan for your allowance!*`,
      }
    }

    case 'stick_to_budget_overspending': {
      return {
        text: `🛡️ **How to Beat Overspending & Actually Stick to Your Budget**\n\nMost budgets fail not because of bad math, but because of behavioral friction. Here is how to make discipline easy:\n\n**1. Add Friction to Impulse Buys**\n• Unlink 1-click UPI and remove saved cards from quick-commerce apps (Blinkit, Zepto, Swiggy).\n• That 30-second payment delay gives your rational brain a chance to reconsider.\n\n**2. Never Deprive Yourself (Budget for Fun!)**\nBudgets with zero entertainment always fail. Giving yourself a dedicated ₹1,000–₹1,500/month "guilt-free fun" allowance prevents binge overspending.\n\n**3. Use Your Daily Safe to Spend Compass**\nCheck your **Safe to Spend** limit on Finwise every morning (currently ${formatMoney(
          safeToSpend.safeDaily
        )}). If you splurge on Friday, spend a little less on Saturday to keep the month balanced.\n\n**4. Weekly Check-ins Over End-of-Month Shocks**\nReview your status every Sunday for 2 minutes. Catching a leak in Week 1 is painless; fixing it in Week 4 is impossible.\n\n💡 *Ask me: **"Am I over budget in any category?"** to check your status right now.*`,
      }
    }

    case 'needs_vs_wants': {
      return {
        text: `⚖️ **Needs vs. Wants: The Student Decision Matrix**\n\nMastering the difference between needs and wants is the foundation of financial control:\n\n**Needs (Essential for Health, Shelter & Academics)**\n• Campus mess or basic nutritious groceries\n• Hostel rent / utility charges / Wi-Fi for assignments\n• Metro or bus commute to college\n• Required textbooks, lab manuals, stationery\n• Prescription medicines and essential health care\n\n**Wants (Discretionary & Lifestyle Choices)**\n• Food delivery when the mess is already paid for and open\n• Cabs/Uber when public transit is convenient\n• Cafe drinks (₹200 iced lattes)\n• New clothes for every college event\n• Premium gaming skins or unnecessary gadget upgrades\n\n**The 3-Question Filter Before Tapping UPI:**\n1. *Will my grades, health, or safety suffer without this?* (If yes → Need)\n2. *Am I buying this because my friends are buying it?* (If yes → Want)\n3. *Can I wait 7 days before deciding?* (If yes → Want)\n\n💡 *Wants are not bad—just make sure your Needs and Savings goals are funded first!*`,
      }
    }

    case 'emergency_fund_student': {
      return {
        text: `🦺 **Why Every Student Needs an Emergency Buffer**\n\nUnexpected expenses happen to every student: a cracked phone screen during exams, a dead laptop charger, sudden dental/medical visits, or urgent travel home.\n\n**How Much Should a Student Save?**\n• **₹3,000 to ₹5,000** is an ideal, stress-free emergency cushion for most college students.\n• It keeps you independent so you never have to borrow from friends or scramble in a panic.\n\n**How to Build It on Pocket Money:**\n• Deposit just **₹150 to ₹250 each week** into your Finwise **Emergency Student Safety Net** goal.\n• In 3 to 4 months, you will have a fully funded safety net without feeling any pinch in your daily lifestyle!\n\n💡 *Go to the **Goals** section on Finwise to track and fund your Emergency Student Safety Net!*`,
      }
    }

    case 'general':
    default: {
      const q = query.toLowerCase()

      if (
        q.includes('where') &&
        (q.includes('money') || q.includes('go') || q.includes('spend'))
      ) {
        return {
          text: `Looking at your actual records: You spent a total of ${formatMoney(
            totalExpenses
          )}. Your #1 expense category is **${
            topSpendingCategory.category
          }** at ${formatMoney(topSpendingCategory.amount)} (${
            topSpendingCategory.percentage
          }% of all expenses), followed by **Travel** at ${formatMoney(
            categoryTotals.Travel || 0
          )} and **Education** at ${formatMoney(
            categoryTotals.Education || 0
          )}. Campus food and delivery represent your biggest flexible expense.`,
        }
      }

      if (
        q.includes('can i spend') ||
        q.includes('spend today') ||
        q.includes('500')
      ) {
        const safe = safeToSpend.safeDaily
        if (q.includes('500')) {
          return {
            text: `Your safe limit for today is **${formatMoney(
              safe
            )}**. Spending ₹500 today is **feasible ${
              safe >= 500
                ? 'and completely within your safe pace'
                : `but slightly above pace by ₹${500 - safe}`
            }**.\n\nIf you spend ₹500 today, compensate tomorrow by keeping under ${formatMoney(
              Math.max(100, safe - Math.max(0, 500 - safe))
            )}.`,
          }
        }
        return {
          text: `Your **Safe to Spend today is ${formatMoney(
            safe
          )}**. This preserves your ₹${
            safeToSpend.upcomingBillsTotal
          } upcoming bills and your monthly goal reserves across the remaining ${daysLeft} days of the month.`,
        }
      }

      if (q.includes('how much can i save') || q.includes('save this month')) {
        return {
          text: `Based on your ${formatMoney(
            totalIncome
          )} income and current spending trajectory, you are projected to save **${formatMoney(
            predictedMonthEnd
          )}** this month. If you hold dining out to mess meals twice weekly, you can push your total savings to **${formatMoney(
            predictedMonthEnd + 1200
          )}**.`,
        }
      }

      if (
        q.includes('cut') ||
        q.includes('save 2000') ||
        q.includes('2,000') ||
        q.includes('reduce')
      ) {
        return {
          text: `To save ₹2,000 this month, here is an actionable 3-part student plan:\n1. **Food Delivery**: Cut 2 Swiggy orders per week → Saves ~₹900/month.\n2. **Shopping**: Postpone non-essential items on Amazon until after exams → Saves ~₹800.\n3. **Metro / Transit**: Use a monthly student transit pass rather than single tokens → Saves ~₹300.\nTotal targeted savings: **₹2,000** exactly.`,
        }
      }

      if (q.includes('score') || q.includes('health')) {
        return {
          text: `Your Financial Health Score is **${healthScore.overall}/100**:\n• Budget Discipline: **${healthScore.budgetDisciplineScore}/30**\n• Savings Rate: **${healthScore.savingsRateScore}/25**\n• Runway Buffer: **${healthScore.runwayScore}/25** (~${moneyRunwayDays} days of expenses)\n• Goal Pace: **${healthScore.goalPaceScore}/20**\nTo push above 90, keep all category budgets under 80% utilization.`,
        }
      }

      if (
        q.includes('end of the month') ||
        q.includes('month end') ||
        q.includes('projected') ||
        q.includes('balance')
      ) {
        return {
          text: `Your projected end-of-month balance is **${formatMoney(
            predictedMonthEnd
          )}**. This assumes an average daily expenditure of ${formatMoney(
            safeToSpend.safeDaily
          )} and deducts your upcoming recurring subscriptions and bills.`,
        }
      }

      if (q.includes('laptop') || q.includes('goal')) {
        const laptop = goals.find((g) => g.id === 'g-1') || goals[0]
        if (laptop) {
          const remaining = laptop.targetAmount - laptop.savedAmount
          return {
            text: `You have saved **${formatMoney(
              laptop.savedAmount
            )}** towards your **${laptop.title}** (${Math.round(
              (laptop.savedAmount / laptop.targetAmount) * 100
            )}% complete). Remaining: ${formatMoney(
              remaining
            )}. Depositing ₹${Math.ceil(
              remaining / 9
            ).toLocaleString('en-IN')}/month hits your target right on schedule.`,
          }
        }
      }

      // If the query mentions general budget, money, or management topics
      if (
        q.includes('budget') ||
        q.includes('manage') ||
        q.includes('money') ||
        q.includes('student') ||
        q.includes('finance') ||
        q.includes('allowance') ||
        q.includes('save') ||
        q.includes('tip')
      ) {
        return {
          text: `💡 **Smart Budgeting & Money Management Guide for ${userName}**\n\nA budget is your personal roadmap to financial control and freedom during college life:\n\n• **Live Cashflow**: You currently have **${formatMoney(
            currentBalance
          )}** available, with a safe spending pace of **${formatMoney(
            safeToSpend.safeDaily
          )}/day** across the remaining ${daysLeft} days.\n• **The 50/30/20 Rule**: Aim to allocate 50% to essentials (hostel/mess/transit), 30% to college social life, and 20% to savings goals.\n• **Plug Leaks**: Watch out for frequent UPI micropayments (snacks & deliveries), which often eat up 30%+ of student allowances.\n\n**Things you can ask me right now:**\n1. *"Create a budget for me"* — Generates an optimal student plan\n2. *"Create a budget of ₹3,000 for Entertainment"* — Sets an instant category limit\n3. *"How much is left in my Food budget?"* — Live category breakdown\n4. *"What are the best budgeting methods?"* — Learn 50/30/20, Envelope, and Zero-Based systems\n5. *"How to stop overspending?"* — Actionable behavioral hacks\n\nWhat would you like to explore?`,
        }
      }

      // Antigravity Omni-Intelligence Engine (Answers coding, academics, science, math, or universal synthesis)
      const agAnswer = answerAntigravityQuery(query, {
        userName,
        college: profile.college,
        currentBalance,
        safeDailySpend: safeToSpend.safeDaily,
        formatMoney,
      })

      if (agAnswer) {
        return { text: agAnswer }
      }

      return {
        text: `Regarding **"${query}"**:\n\nAs your Finwise AI co-pilot, I'm here to assist with coding, algorithms, university academics, or personal finance. How would you like to proceed?`,
      }
    }
  }
}

export async function callGeminiAdvisor(
  query: string,
  context: BudgetAdvisorContext,
  apiKey: string
): Promise<AiCoachAdvisorResult | null> {
  try {
    const {
      profile,
      budgets,
      totalIncome,
      totalExpenses,
      currentBalance,
      safeToSpend,
      healthScore,
      predictedMonthEnd,
      goals,
      transactions = [],
      formatMoney,
    } = context

    const recentTxSummary = transactions
      .slice(0, 8)
      .map(
        (t) =>
          `- ${t.merchant}: ${t.type === 'expense' ? '-' : '+'}${formatMoney(t.amount)} (${t.category}, ${t.displayDate || t.date})`
      )
      .join('\n')

    const budgetSummary = budgets
      .map((b) => `- ${b.category}: limit ${formatMoney(b.limit)}`)
      .join('\n')

    const systemPrompt = `You are Finwise AI, an advanced, omni-intelligent agentic AI assistant and student co-pilot.
You possess frontier-level capability across software engineering, coding, algorithms, mathematics, university academics, science, writing, and everyday productivity.
You also act as the personal financial co-pilot for ${profile.name}, studying at ${profile.college || 'Delhi Technological University (DTU)'}.
Here is their real-time financial context:
- Available Liquid Balance: ${formatMoney(currentBalance)}
- Monthly Allowance: ${formatMoney(totalIncome)}
- Total Spent This Month: ${formatMoney(totalExpenses)}
- Safe Daily Spending Pace: ${formatMoney(safeToSpend.safeDaily)}/day
- Financial Health Score: ${healthScore.overall}/100
- Projected Month-End: ${formatMoney(predictedMonthEnd)}
- Active Budgets:
${budgetSummary || 'None set yet'}
- Active Goals:
${goals.map((g) => `- ${g.title}: saved ${formatMoney(g.savedAmount)} of ${formatMoney(g.targetAmount)}`).join('\n') || 'None'}
- Recent Transactions:
${recentTxSummary || 'No recent transactions'}

Instructions:
1. Answer ANY question asked by the user with deep intelligence, clarity, precision, and warmth—whether it is a coding question, academic dilemma, mathematical calculation, science concept, writing request, or financial inquiry.
2. Format responses with clean GitHub-flavored markdown (bolding, lists, code blocks with language identifiers when writing code).
3. If they ask about their personal profile, identity, college, balance, or budgets, use the accurate facts from the context above.
4. If they ask to create or set a budget (e.g. "Create a budget of ₹3000 for Entertainment"), confirm the action clearly.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Query: ${query}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    })

    if (!res.ok) {
      console.warn('Gemini API call returned non-OK status:', res.status)
      return null
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (text) {
      return { text }
    }
    return null
  } catch (err) {
    console.error('Gemini API fetch error:', err)
    return null
  }
}
