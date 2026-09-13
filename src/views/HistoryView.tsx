import React, { useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  List,
  Plus,
  Search,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Transaction } from '../types'

interface HistoryViewProps {
  onOpenAddExpense: () => void
  onOpenScanner: () => void
  onSelectTransaction: (tx: Transaction) => void
  onSuccessToast: (
    text: string,
    type?: 'success' | 'error' | 'info'
  ) => void
}

type HistoryTab = 'timeline' | 'calendar' | 'analytics'
type TypeFilter = 'all' | 'income' | 'expense'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Important: never use new Date('YYYY-MM-DD') for calendar comparisons.
// That parses as UTC and can shift the displayed day in some timezones.
const parseDateKey = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date)

const formatLongDate = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

const downloadCsv = (transactions: Transaction[]) => {
  const headers = [
    'Date',
    'Merchant',
    'Category',
    'Type',
    'Amount',
    'Payment Method',
    'Notes',
  ]

  const escapeCsv = (value: unknown) => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  const rows = transactions.map((tx) =>
    [
      tx.date,
      tx.merchant,
      tx.category,
      tx.type,
      tx.amount,
      tx.paymentMethod || '',
      tx.notes || '',
    ]
      .map(escapeCsv)
      .join(',')
  )

  const blob = new Blob(
    [[headers.map(escapeCsv).join(','), ...rows].join('\n')],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `finwise-transactions-${toDateKey(new Date())}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onOpenAddExpense,
  onOpenScanner,
  onSelectTransaction,
  onSuccessToast,
}) => {
  const { transactions, formatMoney } = useFinancial()

  const today = useMemo(() => new Date(), [])
  const todayKey = toDateKey(today)

  const [activeTab, setActiveTab] = useState<HistoryTab>('calendar')
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortNewest, setSortNewest] = useState(true)

  const normalizedQuery = query.trim().toLowerCase()

  const filteredTransactions = useMemo(() => {
  return [...transactions]
    .filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false
      if (!normalizedQuery) return true

      const haystack = [
        tx.merchant,
        tx.category,
        tx.notes,
        tx.paymentMethod,
        tx.date,
        tx.displayDate,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
    .sort((a, b) => {
      const aTime = a.timestamp || parseDateKey(a.date)?.getTime() || 0
      const bTime = b.timestamp || parseDateKey(b.date)?.getTime() || 0
      return sortNewest ? bTime - aTime : aTime - bTime
    })
}, [transactions, typeFilter, normalizedQuery, sortNewest])

  const monthTransactions = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()

    return filteredTransactions.filter((tx) => {
      const date = parseDateKey(tx.date)
      return date?.getFullYear() === year && date.getMonth() === month
    })
  }, [filteredTransactions, viewMonth])

  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {}

    monthTransactions.forEach((tx) => {
      const key = tx.date.slice(0, 10)
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(tx)
    })

    return grouped
  }, [monthTransactions])

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<{ key: string; day: number | null }> = []

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({ key: `empty-${i}`, day: null })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      cells.push({ key: toDateKey(date), day })
    }

    // Keep the grid stable at complete weeks.
    while (cells.length % 7 !== 0) {
      cells.push({ key: `empty-end-${cells.length}`, day: null })
    }

    return cells
  }, [viewMonth])

  const selectedDateObject = useMemo(
    () => parseDateKey(selectedDate) || today,
    [selectedDate, today]
  )

  const selectedTransactions = transactionsByDate[selectedDate] || []

  const selectedSpent = selectedTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const selectedIncome = selectedTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const monthSpent = monthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const monthIncome = monthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const categoryAnalytics = useMemo(() => {
    const totals: Record<string, number> = {}

    monthTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        totals[tx.category] = (totals[tx.category] || 0) + tx.amount
      })

    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [monthTransactions])

  const maxCategoryAmount = categoryAnalytics[0]?.[1] || 0

  const changeMonth = (delta: number) => {
    const next = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth() + delta,
      1
    )

    setViewMonth(next)

    // Select the first day that has activity in the newly opened month.
    // If there is no activity, select the first day of the month.
    const firstTransaction = filteredTransactions
      .map((tx) => parseDateKey(tx.date))
      .filter(
        (date): date is Date =>
          !!date &&
          date.getFullYear() === next.getFullYear() &&
          date.getMonth() === next.getMonth()
      )
      .sort((a, b) => a.getTime() - b.getTime())[0]

    setSelectedDate(
      firstTransaction
        ? toDateKey(firstTransaction)
        : toDateKey(new Date(next.getFullYear(), next.getMonth(), 1))
    )
  }

  const jumpToToday = () => {
    const next = new Date(today.getFullYear(), today.getMonth(), 1)
    setViewMonth(next)
    setSelectedDate(todayKey)
  }

  const handleDayClick = (key: string) => {
    setSelectedDate(key)
  }

  const handleAddForSelectedDate = () => {
    onOpenAddExpense()
    onSuccessToast(
      `Add the transaction for ${formatLongDate(selectedDateObject)}.`,
      'info'
    )
  }

  return (
    <div className="history-page">
      <style>{`
        .history-page .calendar-nav {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 8px !important;
          flex-direction: row !important;
        }

        .history-page .calendar-cell {
          color: #f8fbff !important;
          background: #0d1d32 !important;
          font-family: var(--font-body) !important;
        }

        .history-page .calendar-cell .cal-day-num {
          color: #f8fbff !important;
          font-weight: 800 !important;
        }

        .history-page .calendar-cell:hover:not(.empty) {
          color: #f8fbff !important;
          background: #112640 !important;
        }

        .history-page .calendar-cell.selected {
          color: #f8fbff !important;
          background: #17375f !important;
        }

        .history-page .calendar-cell.today {
          color: #f8fbff !important;
        }

        .history-page .cal-meta {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 2px !important;
          min-height: 28px !important;
          overflow: hidden !important;
        }

        .history-page .cal-spend-tag,
        .history-page .cal-income-tag,
        .history-page .cal-entry-count {
          display: block !important;
          line-height: 1.2 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
        }

        .history-page .cal-entry-count {
          color: #9fb2c9 !important;
          font-size: 9px !important;
          font-weight: 600 !important;
        }

        .history-page .calendar-inspector-card .day-tx-list .transaction {
          width: 100% !important;
          min-height: 58px !important;
          box-sizing: border-box !important;
          display: grid !important;
          grid-template-columns: 38px minmax(0, 1fr) auto !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 10px 12px !important;
          margin: 0 !important;
          border: 1px solid #263d5b !important;
          border-radius: 12px !important;
          background: #122640 !important;
          color: #f8fbff !important;
          text-align: left !important;
          cursor: pointer !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          box-shadow: none !important;
        }

        .history-page .calendar-inspector-card .day-tx-list .transaction:hover {
          background: #193653 !important;
          border-color: #365575 !important;
        }

        .history-page .calendar-inspector-card .day-tx-list .transaction .transaction-name strong {
          color: #f8fbff !important;
          font-size: 13px !important;
          font-weight: 700 !important;
        }

        .history-page .calendar-inspector-card .day-tx-list .transaction .transaction-name small {
          color: #9fb2c9 !important;
          font-size: 11px !important;
        }

        .history-page .calendar-inspector-card .day-tx-list .transaction > strong {
          font-size: 13px !important;
          white-space: nowrap !important;
        }

        .history-page .calendar-inspector-card .day-tx-list .merchant-icon {
          width: 38px !important;
          height: 38px !important;
          border-radius: 10px !important;
        }

        .history-page .calendar-inspector-card .empty-state {
          flex: 1 !important;
          display: flex !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          padding-top: 12px !important;
        }
      `}</style>
      <section className="page-head">
        <div>
          <p className="eyebrow">TRANSACTION RECORDS</p>
          <h1>Financial History</h1>
          <p>
            All your historical transactions, searchable, editable, and grouped
            by date.
          </p>
        </div>

        <div className="page-head-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => downloadCsv(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
          >
            <Download size={15} /> Export CSV
          </button>

          <button type="button" className="secondary-btn" onClick={onOpenScanner}>
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

      <div className="history-tabs-bar">
        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <List size={14} /> List Timeline
          </button>

          <button
            type="button"
            className={`tab-pill ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarDays size={14} /> Calendar Matrix
          </button>

          <button
            type="button"
            className={`tab-pill ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={14} /> Analytics Breakdown
          </button>
        </div>

        <strong>Total Entries: {filteredTransactions.length}</strong>
      </div>

      <div className="card filter-bar-card">
        <div className="search-box inline-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by merchant, food item, or note..."
          />
        </div>

        <div className="filter-controls-group">
          <div className="select-with-icon">
            <Filter size={13} />
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as TypeFilter)
              }
              aria-label="Transaction type"
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          <select
            value={sortNewest ? 'newest' : 'oldest'}
            onChange={(event) => setSortNewest(event.target.value === 'newest')}
            aria-label="Sort transactions"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {activeTab === 'calendar' && (
        <div className="history-calendar-layout">
          <div className="card calendar-matrix-card">
            <div className="calendar-month-header">
              <div>
                <h3>{formatMonth(viewMonth)}</h3>
                <small>
                  {monthTransactions.length}{' '}
                  {monthTransactions.length === 1
                    ? 'record'
                    : 'records'}{' '}
                  in this month
                </small>
              </div>

              <div className="calendar-nav">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  title="Previous month"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  className="secondary-btn small"
                  onClick={jumpToToday}
                >
                  Today
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  title="Next month"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            <div className="calendar-weekdays-grid">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-days-grid">
              {calendarDays.map((cell) => {
                if (!cell.day) {
                  return (
                    <div
                      key={cell.key}
                      className="calendar-cell empty"
                      aria-hidden="true"
                    />
                  )
                }

                const dayTransactions = transactionsByDate[cell.key] || []
                const daySpent = dayTransactions
                  .filter((tx) => tx.type === 'expense')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                const dayIncome = dayTransactions
                  .filter((tx) => tx.type === 'income')
                  .reduce((sum, tx) => sum + tx.amount, 0)

                const isSelected = selectedDate === cell.key
                const isToday = todayKey === cell.key

                return (
                  <button
                    type="button"
                    key={cell.key}
                    className={`calendar-cell ${isToday ? 'today' : ''} ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => handleDayClick(cell.key)}
                    aria-label={`${cell.day} ${formatMonth(viewMonth)}`}
                    aria-pressed={isSelected}
                  >
                    <span className="cal-day-num">{cell.day}</span>

                    <span className="cal-meta">
                      {daySpent > 0 && (
                        <span className="cal-spend-tag">
                          −{formatMoney(daySpent)}
                        </span>
                      )}

                      {dayIncome > 0 && (
                        <span className="cal-income-tag">
                          +{formatMoney(dayIncome)}
                        </span>
                      )}

                      {dayTransactions.length > 0 && (
                        <span className="cal-entry-count">
                          {dayTransactions.length}{' '}
                          {dayTransactions.length === 1 ? 'entry' : 'entries'}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <aside className="card calendar-inspector-card">
            <div className="inspector-head">
              <div>
                <p className="eyebrow">DAY INSPECTOR</p>
                <h3>{formatLongDate(selectedDateObject)}</h3>
              </div>
              <strong>
                {selectedTransactions.length}{' '}
                {selectedTransactions.length === 1 ? 'entry' : 'entries'}
              </strong>
            </div>

            <div className="day-summary-metrics">
              <div>
                <span>Total Spent</span>
                <strong className="expense">
                  −{formatMoney(selectedSpent)}
                </strong>
              </div>

              <div>
                <span>Total Income</span>
                <strong className="income">
                  +{formatMoney(selectedIncome)}
                </strong>
              </div>
            </div>

            {selectedTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No financial activity recorded on this day.</p>
              </div>
            ) : (
              <div className="day-tx-list">
                {selectedTransactions.map((tx) => (
                  <button
                    type="button"
                    key={tx.id}
                    className="transaction clickable"
                    onClick={() => onSelectTransaction(tx)}
                  >
                    <div
                      className={`merchant-icon ${tx.category.toLowerCase()}`}
                    >
                      {tx.category.slice(0, 3)}
                    </div>

                    <div className="transaction-name">
                      <strong>{tx.merchant}</strong>
                      <small>
                        {tx.category}
                        {tx.paymentMethod ? ` · ${tx.paymentMethod}` : ''}
                      </small>
                    </div>

                    <strong
                      className={
                        tx.type === 'income' ? 'income' : 'expense'
                      }
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </strong>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="secondary-btn full-width"
              onClick={handleAddForSelectedDate}
            >
              <Plus size={15} /> Add entry on this date
            </button>
          </aside>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div>
          {filteredTransactions.length === 0 ? (
            <div className="card empty-state">
              <Activity size={24} />
              <h3>No transactions yet</h3>
              <p>
                Record your first income or expense and it will appear here.
              </p>
              <button
                type="button"
                className="primary-btn"
                onClick={onOpenAddExpense}
              >
                <Plus size={15} /> Record cashflow
              </button>
            </div>
          ) : (
            (() => {
              const grouped: Record<string, Transaction[]> = {}

              filteredTransactions.forEach((tx) => {
                if (!grouped[tx.date]) grouped[tx.date] = []
                grouped[tx.date].push(tx)
              })

              return Object.entries(grouped).map(([dateKey, dayItems]) => {
                const date = parseDateKey(dateKey)
                if (!date) return null

                return (
                  <section className="timeline-group" key={dateKey}>
                    <div className="timeline-header">
                      <span className="timeline-dot" />
                      <h3>{formatLongDate(date)}</h3>
                      <span className="timeline-count">
                        {dayItems.length}
                      </span>
                    </div>

                    <div className="card timeline-card">
                      {dayItems.map((tx) => (
                        <button
                          type="button"
                          key={tx.id}
                          className="transaction clickable"
                          onClick={() => onSelectTransaction(tx)}
                        >
                          <div
                            className={`merchant-icon ${tx.category.toLowerCase()}`}
                          >
                            {tx.category.slice(0, 3)}
                          </div>

                          <div className="transaction-name">
                            <strong>{tx.merchant}</strong>
                            <small>
                              {tx.category}
                              {tx.paymentMethod
                                ? ` · ${tx.paymentMethod}`
                                : ''}
                              {tx.notes ? ` · ${tx.notes}` : ''}
                            </small>
                          </div>

                          <strong
                            className={
                              tx.type === 'income' ? 'income' : 'expense'
                            }
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatMoney(tx.amount)}
                          </strong>
                        </button>
                      ))}
                    </div>
                  </section>
                )
              })
            })()
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="history-analytics-layout">
          <div className="card">
            <div className="card-head">
              <div>
                <p className="eyebrow">MONTH SUMMARY</p>
                <h2>{formatMonth(viewMonth)}</h2>
              </div>
            </div>

            <div className="payment-split-grid">
              <div className="method-card">
                <span>Total Income</span>
                <strong className="income">+{formatMoney(monthIncome)}</strong>
                <small>{monthTransactions.filter((tx) => tx.type === 'income').length} entries</small>
              </div>

              <div className="method-card">
                <span>Total Spent</span>
                <strong className="expense">−{formatMoney(monthSpent)}</strong>
                <small>{monthTransactions.filter((tx) => tx.type === 'expense').length} entries</small>
              </div>
            </div>

            <div className="method-card" style={{ marginTop: 12 }}>
              <span>Net Cashflow</span>
              <strong className={monthIncome - monthSpent >= 0 ? 'income' : 'expense'}>
                {monthIncome - monthSpent >= 0 ? '+' : '−'}
                {formatMoney(Math.abs(monthIncome - monthSpent))}
              </strong>
              <small>Based only on recorded transactions</small>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <p className="eyebrow">CATEGORY BREAKDOWN</p>
                <h2>Where your money went</h2>
              </div>
            </div>

            {categoryAnalytics.length === 0 ? (
              <div className="empty-state">
                <p>No expense data for {formatMonth(viewMonth)} yet.</p>
              </div>
            ) : (
              <div className="category-rankings-table">
                {categoryAnalytics.map(([category, amount]) => (
                  <div className="rank-row" key={category}>
                    <span>{category}</span>
                    <div className="rank-bar-wrap">
                      <div
                        className="rank-bar-fill"
                        style={{
                          width: `${
                            maxCategoryAmount > 0
                              ? Math.round((amount / maxCategoryAmount) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{formatMoney(amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
