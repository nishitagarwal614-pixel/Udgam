import React from 'react'
import {
  Download,
  Printer,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface ReportsViewProps {
  onSuccessToast: (msg: string) => void
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onSuccessToast }) => {
  const {
    profile,
    transactions,
    totalIncome,
    totalExpenses,
    netSavings,
    currentBalance,
    categoryTotals,
    formatMoney,
  } = useFinancial()

  const handleDownloadCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Type,Amount,PaymentMethod,Notes\n'
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.merchant}","${t.category}","${t.type}",${t.amount},"${t.paymentMethod || 'UPI'}","${(t.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finwise_financial_statement_${profile.name.replace(/\s+/g, '_')}_Sep2026.csv`
    a.click()
    URL.revokeObjectURL(url)
    onSuccessToast('Financial report CSV downloaded.')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="reports-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">FORMAL STATEMENTS & AUDIT</p>
          <h1>Financial Reports</h1>
          <p className="muted">
            Export official student income and expense statements for scholarships or parents.
          </p>
        </div>

        <div className="heading-actions-cluster">
          <button
            type="button"
            className="secondary-btn"
            onClick={handlePrint}
          >
            <Printer size={15} /> Print
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleDownloadCSV}
          >
            <Download size={15} /> Download CSV
          </button>
        </div>
      </section>

      {/* Printable Report Document Card */}
      <div className="card report-document-card">
        <div className="report-doc-header">
          <div>
            <h2>Finwise Student Statement</h2>
            <p className="muted">Statement Period: 01 Aug 2026 – 02 Sep 2026</p>
          </div>
          <div className="report-student-meta">
            <strong>{profile.name}</strong>
            <span>{profile.college}</span>
            <small>Plan: {profile.plan}</small>
          </div>
        </div>

        <div className="report-summary-metrics">
          <div className="rep-metric">
            <span>Total Inflow</span>
            <strong className="income">+{formatMoney(totalIncome)}</strong>
          </div>
          <div className="rep-metric">
            <span>Total Outflow</span>
            <strong className="expense">-{formatMoney(totalExpenses)}</strong>
          </div>
          <div className="rep-metric">
            <span>Net Saved</span>
            <strong>{formatMoney(netSavings)}</strong>
          </div>
          <div className="rep-metric">
            <span>Closing Balance</span>
            <strong style={{ color: '#1f9d67' }}>{formatMoney(currentBalance)}</strong>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="report-table-section">
          <h3>Category Outflow Breakdown</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Share (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryTotals)
                .filter(([cat]) => cat !== 'Income')
                .map(([cat, amt]) => {
                  const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0
                  return (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td>{formatMoney(amt)}</td>
                      <td>{pct}%</td>
                      <td>
                        <span className="status-pill success">Verified</span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
