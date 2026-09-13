import React, { useState } from 'react'
import {
  Activity,
  History,
} from 'lucide-react'

import { TransactionsView } from './TransactionsView'
import { HistoryView } from './HistoryView'
import type { Transaction } from '../types'

interface TransactionsHistoryViewProps {
  onOpenAddExpense: () => void
  onOpenScanner: () => void
  onSelectTransaction: (tx: Transaction) => void
  onSuccessToast: (
    text: string,
    type?: 'success' | 'error' | 'info'
  ) => void
}

export const TransactionsHistoryView: React.FC<
  TransactionsHistoryViewProps
> = ({
  onOpenAddExpense,
  onOpenScanner,
  onSelectTransaction,
  onSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'history'>(
    'transactions'
  )

  return (
    <div className="transactions-history-view">
      {/* Page Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">MONEY ACTIVITY</p>

          <h1>Transactions & History</h1>

          <p className="muted">
            Manage, search, analyze, and review all your financial activity
            in one place.
          </p>
        </div>
      </section>

      {/* Main Tabs */}
      <div className="history-tabs-bar">
        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill ${
              activeTab === 'transactions' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            <Activity size={16} />
            Transactions
          </button>

          <button
            type="button"
            className={`tab-pill ${
              activeTab === 'history' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            Financial History
          </button>
        </div>
      </div>

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <TransactionsView
          onOpenAddExpense={onOpenAddExpense}
          onOpenScanner={onOpenScanner}
          onSelectTransaction={onSelectTransaction}
          onSuccessToast={onSuccessToast}
        />
      )}

      {/* Financial History */}
      {activeTab === 'history' && (
        <HistoryView
          onOpenAddExpense={onOpenAddExpense}
          onOpenScanner={onOpenScanner}
          onSelectTransaction={onSelectTransaction}
          onSuccessToast={onSuccessToast}
        />
      )}
    </div>
  )
}