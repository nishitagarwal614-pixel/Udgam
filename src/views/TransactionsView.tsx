import React, { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Download,
  Layers,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Transaction } from '../types'

interface TransactionsViewProps {
  onOpenAddExpense: () => void
  onOpenScanner: () => void
  onSelectTransaction: (tx: Transaction) => void
  onSuccessToast: (msg: string) => void
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddExpense,
  onOpenScanner,
  onSelectTransaction,
  onSuccessToast,
}) => {
  const { transactions, formatMoney } = useFinancial()

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all')

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedType !== 'all' && tx.type !== selectedType) return false
      if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false

      const q = query.toLowerCase().trim()
      if (q) {
        return (
          tx.merchant.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [transactions, selectedType, selectedCategory, query])

  const exportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Type,Amount,PaymentMethod\n'
    const rows = filtered
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.merchant}","${t.category}","${t.type}",${t.amount},"${t.paymentMethod || 'UPI'}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finwise_transactions.csv`
    a.click()
    URL.revokeObjectURL(url)
    onSuccessToast('Transactions exported to CSV.')
  }

  return (
    <div className="transactions-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">ACTIVE WORKSPACE</p>
          <h1>Transactions</h1>
          <p className="muted">
            Every rupee, organized and easy to search, inspect, and adjust.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button
            type="button"
            className="secondary-btn"
            onClick={exportCSV}
          >
            <Download size={15} /> Export
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={onOpenScanner}
          >
            Scan receipt
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenAddExpense}
          >
            <Plus size={16} /> Add entry
          </button>
        </div>
      </section>

      <div className="card module-card">
        {/* Controls */}
        <div className="table-controls-bar">
          <div className="search-box inline-search">
            <Search size={16} />
            <input
              placeholder="Search merchant, category, or note..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter category"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Education">Education</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Income">Income</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as 'all' | 'expense' | 'income')
              }
              aria-label="Filter type"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Incomes</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transaction-list full-list">
          {filtered.length === 0 ? (
            <p className="empty-text">No transactions found matching your criteria.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="transaction clickable"
                onClick={() => onSelectTransaction(item)}
                title="Click to view details or edit"
              >
                <div className={`merchant-icon ${item.category.toLowerCase()}`}>
                  {item.category.slice(0, 3)}
                </div>

                <div className="transaction-name">
                  <div className="tx-title-row">
                    <strong>{item.merchant}</strong>
                    {item.items && item.items.length > 0 && (
                      <span className="items-chip">
                        <Layers size={11} /> {item.items.length} items
                      </span>
                    )}
                    {item.paymentMethod && (
                      <span className="method-pill">{item.paymentMethod}</span>
                    )}
                  </div>
                  <small>
                    {item.category} · {item.displayDate || item.date}
                    {item.notes ? ` · ${item.notes}` : ''}
                  </small>
                </div>

                <div className="transaction-amount-col">
                  <strong
                    className={item.type === 'income' ? 'income' : 'expense'}
                  >
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amount)}
                  </strong>
                  <small>Tap to edit</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
