import { useState } from 'react'
import { FinancialProvider, useFinancial } from './context/FinancialContext'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { MobileNav } from './components/MobileNav'
import { ReceiptScannerModal } from './components/ReceiptScannerModal'
import { AddTransactionModal } from './components/AddTransactionModal'
import { TransactionDetailModal } from './components/TransactionDetailModal'
import { CanIAffordModal } from './components/CanIAffordModal'
import { SafeToSpendModal } from './components/SafeToSpendModal'
import { FinancialHealthModal } from './components/FinancialHealthModal'
import { AiOnboardingModal } from './components/AiOnboardingModal'
import { Toast, type ToastMessage } from './components/Toast'

// Views
import { OverviewView } from './views/OverviewView'
import { TransactionsView } from './views/TransactionsView'
import { HistoryView } from './views/HistoryView'
import { BudgetsView } from './views/BudgetsView'
import { GoalsView } from './views/GoalsView'
import { InsightsView } from './views/InsightsView'
import { PredictionsView } from './views/PredictionsView'
import { AiCoachView } from './views/AiCoachView'
import { ReceiptScannerView } from './views/ReceiptScannerView'
import { AlertsView } from './views/AlertsView'
import { ReportsView } from './views/ReportsView'
import { SettingsView } from './views/SettingsView'
import { HelpSupportView } from './views/HelpSupportView'

import type { Transaction } from './types'
import './App.css'

function AppContent() {
  const { activeView, profile, showOnboarding, setShowOnboarding } = useFinancial()

  // Modal states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [addTxType, setAddTxType] = useState<'expense' | 'income'>('expense')
  const [isAffordModalOpen, setIsAffordModalOpen] = useState(false)
  const [isSafeModalOpen, setIsSafeModalOpen] = useState(false)
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleOpenAddExpense = () => {
    setAddTxType('expense')
    setIsAddExpenseOpen(true)
  }

  const handleOpenAddIncome = () => {
    setAddTxType('income')
    setIsAddExpenseOpen(true)
  }

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className={`app ${profile.theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenOnMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main">
        <Topbar
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenAffordModal={() => setIsAffordModalOpen(true)}
        />

        <div className="content">
          {activeView === 'Overview' && (
            <OverviewView
              onOpenAddExpense={handleOpenAddExpense}
              onOpenAddIncome={handleOpenAddIncome}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenAffordModal={() => setIsAffordModalOpen(true)}
              onOpenSafeModal={() => setIsSafeModalOpen(true)}
              onOpenHealthModal={() => setIsHealthModalOpen(true)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {activeView === 'Transactions' && (
            <TransactionsView
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onSuccessToast={addToast}
            />
          )}

          {activeView === 'History' && (
            <HistoryView
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onSuccessToast={addToast}
            />
          )}

          {activeView === 'Budgets' && (
            <BudgetsView
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onSuccessToast={addToast}
            />
          )}

          {activeView === 'Goals' && <GoalsView onSuccessToast={addToast} />}

          {activeView === 'Insights' && (
            <InsightsView
              onOpenHealthModal={() => setIsHealthModalOpen(true)}
            />
          )}

          {activeView === 'Predictions' && (
            <PredictionsView onSuccessToast={addToast} />
          )}

          {activeView === 'AI Coach' && <AiCoachView />}

          {activeView === 'Receipt Scanner' && (
            <ReceiptScannerView onSuccessToast={addToast} />
          )}

          {activeView === 'Alerts' && <AlertsView onSuccessToast={addToast} />}

          {activeView === 'Reports' && <ReportsView onSuccessToast={addToast} />}

          {activeView === 'Settings' && <SettingsView onSuccessToast={addToast} />}

          {activeView === 'Help & Support' && (
            <HelpSupportView onSuccessToast={addToast} />
          )}
        </div>
      </main>

      {/* Fixed Mobile Bottom Bar */}
      <MobileNav onOpenScanner={() => setIsScannerOpen(true)} />

      {/* Global Modals */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccessToast={addToast}
      />

      <AddTransactionModal
        isOpen={isAddExpenseOpen}
        initialType={addTxType}
        onClose={() => setIsAddExpenseOpen(false)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onSuccessToast={addToast}
      />

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onSuccessToast={addToast}
      />

      <CanIAffordModal
        isOpen={isAffordModalOpen}
        onClose={() => setIsAffordModalOpen(false)}
        onSuccessToast={addToast}
      />

      <SafeToSpendModal
        isOpen={isSafeModalOpen}
        onClose={() => setIsSafeModalOpen(false)}
      />

      <FinancialHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />

      <AiOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSuccessToast={addToast}
      />

      {/* Global Toast System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

function App() {
  return (
    <FinancialProvider>
      <AppContent />
    </FinancialProvider>
  )
}

export default App
