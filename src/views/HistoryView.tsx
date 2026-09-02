import React, { useState, useMemo } from 'react'
import {
  History,
  Calendar,
  BarChart3,
  List,
  Search,
  Plus,
  Filter,
  Download,
  CreditCard,
  Layers,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Transaction } from '../types'

interface HistoryViewProps {
  onOpenAddExpense: () => void
  onOpenScanner: () => void
  onSelectTransaction: (tx: Transaction) => void
  onSuccessToast: (msg: string) => void
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onOpenAddExpense,
  onOpenScanner,
  onSelectTransaction,
  onSuccessToast,
}) => {
  const { transactions, formatMoney, categoryTotals } = useFinancial()

  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'analytics'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>('2026-09-02')

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false

        // Category filter
        if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false

        // Text search
        const q = searchQuery.toLowerCase().trim()
        if (q) {
          const match =
            tx.merchant.toLowerCase().includes(q) ||
            tx.category.toLowerCase().includes(q) ||
            (tx.notes && tx.notes.toLowerCase().includes(q)) ||
            (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(q)) ||
            (tx.items &&
              tx.items.some((it) => it.name.toLowerCase().includes(q)))
          if (!match) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.timestamp - a.timestamp
        if (sortBy === 'oldest') return a.timestamp - b.timestamp
        if (sortBy === 'highest') return b.amount - a.amount
        if (sortBy === 'lowest') return a.amount - b.amount
        return 0
      })
  }, [transactions, selectedType, selectedCategory, searchQuery, sortBy])

  // Group transactions for List View
  const groupedList = useMemo(() => {
    const groups: { title: string; items: Transaction[] }[] = [
      { title: 'Today (02 Sep 2026)', items: [] },
      { title: 'Yesterday (01 Sep 2026)', items: [] },
      { title: 'Late August 2026', items: [] },
      { title: 'Earlier Activity', items: [] },
    ]

    filteredTransactions.forEach((tx) => {
      if (tx.date === '2026-09-02' || tx.displayDate?.includes('Today')) {
        groups[0].items.push(tx)
      } else if (tx.date === '2026-09-01' || tx.displayDate?.includes('Yesterday')) {
        groups[1].items.push(tx)
      } else if (tx.date.startsWith('2026-08-2') || tx.date.startsWith('2026-08-3')) {
        groups[2].items.push(tx)
      } else {
        groups[3].items.push(tx)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [filteredTransactions])

  // Calendar Day Data
  const calendarDays = useMemo(() => {
    // Generate 30 days for September 2026 (starts on Tuesday = offset 2)
    const days = []
    for (let day = 1; day <= 30; day++) {
      const dateStr = `2026-09-${day < 10 ? `0${day}` : day}`
      const dayTxs = transactions.filter((tx) => tx.date === dateStr)
      const dayExpense = dayTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const dayIncome = dayTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      days.push({
        day,
        dateStr,
        transactions: dayTxs,
        dayExpense,
        dayIncome,
      })
    }
    return days
  }, [transactions])

  const selectedCalendarDayData = useMemo(() => {
    return (
      calendarDays.find((d) => d.dateStr === calendarSelectedDate) ||
      calendarDays[1] // 02 Sep
    )
  }, [calendarDays, calendarSelectedDate])

  // Analytics View calculations
  const paymentMethodSplit = useMemo(() => {
    const split: Record<string, number> = { UPI: 0, Card: 0, Cash: 0, NetBanking: 0 }
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const method = tx.paymentMethod || 'UPI'
        split[method] = (split[method] || 0) + tx.amount
      })
    return split
  }, [transactions])

  const exportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Type,Amount,PaymentMethod,Notes\n'
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.merchant}","${t.category}","${t.type}",${t.amount},"${t.paymentMethod || 'UPI'}","${(t.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finwise_student_transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onSuccessToast('Exported filtered transactions as CSV!')
  }

  return (
    <div className="history-view">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">STUDENT EXPENSE & INCOME LEDGER</p>
          <h1>Financial History</h1>
          <p className="muted">
            All your historical transactions, searchable, editable, and grouped by date.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button
            type="button"
            className="secondary-btn"
            onClick={exportCSV}
            title="Download records as CSV spreadsheet"
          >
            <Download size={16} /> Export CSV
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
            <Plus size={16} /> Record cashflow
          </button>
        </div>
      </section>

      {/* View Switcher Tabs */}
      <div className="history-tabs-bar">
        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <List size={16} /> List Timeline
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={16} /> Calendar Matrix
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} /> Analytics Breakdown
          </button>
        </div>

        <div className="history-quick-stats">
          <span>
            Total Entries: <strong>{filteredTransactions.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-bar-card">
        <div className="search-box inline-search">
          <Search size={16} />
          <input
            placeholder="Search by merchant, food item, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls-group">
          {/* Category Filter */}
          <div className="select-with-icon">
            <Filter size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Education">Education</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Health">Health</option>
              <option value="Income">Income Only</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as 'all' | 'expense' | 'income')
            }
            aria-label="Filter by Type"
          >
            <option value="all">All Types (Income & Expenses)</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest'
              )
            }
            aria-label="Sort Transactions"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {activeTab === 'list' && (
        <div className="history-list-container">
          {groupedList.length === 0 ? (
            <div className="card empty-state-card">
              <History size={40} className="empty-icon" />
              <h3>No matching transactions found</h3>
              <p>Try clearing your search query or changing category filters.</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setSelectedType('all')
                }}
              >
                Reset all filters
              </button>
            </div>
          ) : (
            groupedList.map((group, gIdx) => (
              <div key={gIdx} className="timeline-group">
                <div className="timeline-header">
                  <span className="timeline-dot" />
                  <h3>{group.title}</h3>
                  <span className="timeline-count">{group.items.length} items</span>
                </div>

                <div className="card timeline-card">
                  {group.items.map((tx) => (
                    <div
                      key={tx.id}
                      className="transaction clickable"
                      onClick={() => onSelectTransaction(tx)}
                      title="Click to view full receipt details, edit, or delete"
                    >
                      <div className={`merchant-icon ${tx.category.toLowerCase()}`}>
                        {tx.category.slice(0, 3)}
                      </div>

                      <div className="transaction-name">
                        <div className="tx-title-row">
                          <strong>{tx.merchant}</strong>
                          {tx.items && tx.items.length > 0 && (
                            <span className="items-chip">
                              <Layers size={11} /> {tx.items.length} items
                            </span>
                          )}
                          {tx.paymentMethod && (
                            <span className="method-pill">{tx.paymentMethod}</span>
                          )}
                        </div>
                        <small>
                          {tx.category} · {tx.displayDate || tx.date}
                          {tx.notes ? ` · "${tx.notes}"` : ''}
                        </small>
                      </div>

                      <div className="transaction-amount-col">
                        <strong
                          className={tx.type === 'income' ? 'income' : 'expense'}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </strong>
                        <small>Tap to edit</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: CALENDAR MATRIX VIEW */}
      {activeTab === 'calendar' && (
        <div className="history-calendar-layout">
          <div className="card calendar-matrix-card">
            <div className="calendar-month-header">
              <h3>September 2026</h3>
              <span className="badge-pill">Current Semester</span>
            </div>

            <div className="calendar-weekdays-grid">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="calendar-days-grid">
              {/* September 2026 starts on Tuesday (offset 2 empty cells) */}
              <div className="calendar-cell empty" />
              <div className="calendar-cell empty" />

              {calendarDays.map((d) => {
                const isSelected = d.dateStr === calendarSelectedDate
                const hasExpense = d.dayExpense > 0
                const hasIncome = d.dayIncome > 0
                const isToday = d.day === 2

                return (
                  <div
                    key={d.day}
                    className={`calendar-cell ${isSelected ? 'selected' : ''} ${
                      isToday ? 'today' : ''
                    } ${hasExpense ? 'has-expense' : ''} ${hasIncome ? 'has-income' : ''}`}
                    onClick={() => setCalendarSelectedDate(d.dateStr)}
                  >
                    <span className="cal-day-num">{d.day}</span>
                    {hasExpense && (
                      <span className="cal-spend-tag">-{formatMoney(d.dayExpense)}</span>
                    )}
                    {hasIncome && (
                      <span className="cal-income-tag">+{formatMoney(d.dayIncome)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day Inspection Drawer */}
          <div className="card calendar-inspector-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">DAY INSPECTOR</p>
                <h2>{calendarSelectedDate}</h2>
              </div>
              <span className="tiny-chip">
                {selectedCalendarDayData.transactions.length} entries
              </span>
            </div>

            <div className="day-summary-metrics">
              <div>
                <span>Total Spent</span>
                <strong className="expense">
                  -{formatMoney(selectedCalendarDayData.dayExpense)}
                </strong>
              </div>
              <div>
                <span>Total Income</span>
                <strong className="income">
                  +{formatMoney(selectedCalendarDayData.dayIncome)}
                </strong>
              </div>
            </div>

            <div className="day-tx-list">
              {selectedCalendarDayData.transactions.length === 0 ? (
                <p className="empty-text">No financial activity recorded on this day.</p>
              ) : (
                selectedCalendarDayData.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="transaction clickable"
                    onClick={() => onSelectTransaction(tx)}
                  >
                    <div className={`merchant-icon ${tx.category.toLowerCase()}`}>
                      {tx.category.slice(0, 3)}
                    </div>
                    <div className="transaction-name">
                      <strong>{tx.merchant}</strong>
                      <small>{tx.category}</small>
                    </div>
                    <strong className={tx.type === 'income' ? 'income' : 'expense'}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </strong>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="secondary-btn full"
              style={{ marginTop: '16px' }}
              onClick={onOpenAddExpense}
            >
              <Plus size={15} /> Add entry on this date
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div className="history-analytics-layout">
          {/* Payment Method Distribution */}
          <div className="card analytics-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">PAYMENT METHODS</p>
                <h2>Where you swipe or pay</h2>
              </div>
              <CreditCard size={18} />
            </div>

            <div className="payment-split-grid">
              {Object.entries(paymentMethodSplit).map(([method, amt]) => (
                <div key={method} className="method-card">
                  <span>{method}</span>
                  <strong>{formatMoney(amt)}</strong>
                  <small>
                    {filteredTransactions.length > 0
                      ? `${Math.round(
                          (amt /
                            Math.max(
                              1,
                              Object.values(paymentMethodSplit).reduce(
                                (a, b) => a + b,
                                0
                              )
                            )) *
                            100
                        )}% of outgo`
                      : '0%'}
                  </small>
                </div>
              ))}
            </div>
          </div>

          {/* Category Spending Table */}
          <div className="card analytics-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">EXPENDITURE RANKING</p>
                <h2>Category Distribution</h2>
              </div>
            </div>

            <div className="category-rankings-table">
              {Object.entries(categoryTotals)
                .filter(([cat]) => cat !== 'Income')
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => (
                  <div key={cat} className="rank-row">
                    <span className="rank-cat">{cat}</span>
                    <div className="rank-bar-wrap">
                      <div
                        className="rank-bar-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (amt / Math.max(1, categoryTotals.Food || 2000)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <strong>{formatMoney(amt)}</strong>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
