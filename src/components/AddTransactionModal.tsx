import React, { useState } from 'react'
import { X, Check, Camera, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Category, PaymentMethod, TransactionType } from '../types'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenScanner: () => void
  onSuccessToast: (msg: string) => void
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onOpenScanner,
  onSuccessToast,
}) => {
  const { addTransaction, formatMoney } = useFinancial()

  const [type, setType] = useState<TransactionType>('expense')
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [category, setCategory] = useState<Category>('Food')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [date, setDate] = useState('2026-09-02')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setType('expense')
    setMerchant('')
    setAmount('')
    setCategory('Food')
    setPaymentMethod('UPI')
    setDate('2026-09-02')
    setNotes('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim()) {
      setError('Please provide a merchant or income source name.')
      return
    }
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }

    addTransaction({
      merchant: merchant.trim(),
      amount: parsedAmount,
      category: type === 'income' ? 'Income' : category,
      date,
      displayDate: 'Today',
      type,
      paymentMethod,
      notes: notes.trim(),
    })

    onSuccessToast(
      `${type === 'income' ? 'Income' : 'Expense'} of ${formatMoney(parsedAmount)} added!`
    )
    resetForm()
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <p className="eyebrow">TRANSACTION ENTRY</p>
        <h2>Record Cashflow</h2>
        <p className="muted">
          Keep your picture accurate with one small update.
        </p>

        {/* Type Toggle */}
        <div className="tab-pill-group" style={{ margin: '16px 0' }}>
          <button
            type="button"
            className={`tab-pill ${type === 'expense' ? 'active danger' : ''}`}
            onClick={() => {
              setType('expense')
              if (category === 'Income') setCategory('Food')
            }}
          >
            <ArrowUpRight size={15} /> Expense
          </button>
          <button
            type="button"
            className={`tab-pill ${type === 'income' ? 'active success' : ''}`}
            onClick={() => {
              setType('income')
              setCategory('Income')
            }}
          >
            <ArrowDownRight size={15} /> Income
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <label>
          {type === 'expense' ? 'Merchant / Payee' : 'Income Source'}
          <input
            autoFocus
            required
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder={
              type === 'expense' ? 'e.g. Swiggy, Metro, Campus Store' : 'e.g. Pocket Money, Stipend, Scholarship'
            }
          />
        </label>

        <label>
          Amount (₹)
          <input
            type="number"
            min="1"
            step="any"
            required
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value ? Number(e.target.value) : '')
            }
            placeholder="e.g. 350"
          />
        </label>

        {type === 'expense' && (
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value="Food">Food & Dining</option>
              <option value="Travel">Travel & Transit</option>
              <option value="Education">Education & Books</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Shopping">Shopping & Gadgets</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Hostel & Bills</option>
              <option value="Health">Health & Wellness</option>
              <option value="Other">Other</option>
            </select>
          </label>
        )}

        <div className="form-row" style={{ marginTop: '12px' }}>
          <label style={{ margin: 0 }}>
            Payment Method
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              <option value="UPI">UPI (GPay/PhonePe)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </label>

          <label style={{ margin: 0 }}>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>

        <label>
          Notes (Optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Shared with roomie"
          />
        </label>

        {type === 'expense' && (
          <div className="receipt-scanner-prompt-card">
            <div>
              <strong>Have a physical or digital receipt?</strong>
              <small>Auto-extract items, date and total with AI Vision</small>
            </div>
            <button
              type="button"
              className="secondary-btn small"
              onClick={() => {
                onClose()
                onOpenScanner()
              }}
            >
              <Camera size={14} /> Scan receipt
            </button>
          </div>
        )}

        <button className="primary-btn full" type="submit" style={{ marginTop: '20px' }}>
          <Check size={17} /> Save {type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </form>
    </div>
  )
}
