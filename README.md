# Finwise · AI Personal Finance Coach for Students

> An intelligent, local-first personal finance platform tailored for university students. Features conversational AI onboarding, a full OCR receipt scanner, live connected cashflow intelligence, multi-view transaction history, and predictive budgeting.

---

## ✨ Features

- 🤖 **Interactive AI Coach Onboarding**: 60-second conversational check-in that asks for your allowance, living arrangement (hostel/flat/home), and typical expenses, then instantly generates a personalized homepage and custom budgets.
- 🧾 **Full AI Receipt Scanner**: Upload any receipt or choose from 1-click student presets (Swiggy, Subway, Campus Bookstore, Metro Card). Features animated OCR scanning and instant integration into your transactions and budgets.
- 🛡️ **"Safe to Spend Today"**: Dynamic daily spending limit with transparent mathematical breakdown factoring in upcoming recurring bills and savings goal buffers.
- 💡 **"Can I Afford This?"**: AI purchase advisor evaluating account balance, category headroom, and goal impact to issue `CAN AFFORD`, `CAUTION`, or `NOT RECOMMENDED` verdicts.
- 📊 **Multi-View Financial History**:
  - **List Timeline**: Chronological groups (*Today*, *Yesterday*, *Late August*).
  - **Calendar Matrix**: Interactive monthly calendar with daily expense/income badges.
  - **Analytics Breakdown**: Payment method split (UPI vs Card vs Cash) and category rankings.
  - **CSV Export**: One-click download of all transaction records.
- 🎯 **Functional Budgets & Savings Goals**:
  - Full CRUD (Create, Edit, Delete) for category budgets with over-budget alerts.
  - Interactive goal progress with dynamic required monthly saving pace and liquid balance deposits.
- 🔮 **Cashflow Predictions & Digital Twin**:
  - Month-end balance regression curves.
  - What-If Simulator with live sliders for income, daily burn, and one-time purchases.
  - Financial Digital Twin 6-month simulation scenarios.
- 💬 **Live Contextual AI Coach**: Conversational chat interface answering questions directly using your actual balance, food spending, and budget numbers.
- 🎨 **Unified Design System**: Clean typography scale, consistent card hierarchy, and Dark/Light theme switching.
- 🔒 **Local-First & Privacy-Focused**: Persists 100% of data to `localStorage` with zero cloud tracking, zero backend dependency, and offline resilience.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- npm or pnpm / yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build & Lint

```bash
# Type check and build for production
npm run build

# Run linter
npm run lint
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Icons**: Lucide React
- **Styling**: Custom CSS Design Tokens (Light/Dark themes)
- **State & Storage**: React Context + LocalStorage persistence
