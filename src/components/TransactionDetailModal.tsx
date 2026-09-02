import React, { useState } from 'react'
import {
  X,
  Trash2,
  Save,
  Calendar,
  CreditCard,
  Tag,
  Edit2,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Category, PaymentMethod, Transaction } from '../types'

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onSuccessToast: (msg: string) => void
}

interface DetailContentProps {
  transaction: Transaction
  onClose: () => void
  onSuccessToast: (msg: string) => void
}

const TransactionDetailContent: React.FC<DetailContentProps> = ({
  transaction,
  onClose,
  onSuccessToast,
}) => {
  const { updateTransaction, deleteTransaction, formatMoney } = useFinancial()

  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [merchant, setMerchant] = useState(transaction.merchant)
  const [amount, setAmount] = useState<number | ''>(transaction.amount)
  const [category, setCategory] = useState<Category>(transaction.category)
  const [date, setDate] = useState(transaction.date)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction.paymentMethod || 'UPI')
  const [notes, setNotes] = useState(transaction.notes || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = Number(amount)
    if (!merchant.trim() || !parsed || parsed <= 0) return

    updateTransaction(transaction.id, {
      merchant: merchant.trim(),
      amount: parsed,
      category,
      date,
      paymentMethod,
      notes: notes.trim(),
    })

    onSuccessToast(`Updated ${merchant.trim()} successfully!`)
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteTransaction(transaction.id)
    onSuccessToast(`Deleted transaction of ${formatMoney(transaction.amount)}.`)
    onClose()
  }

  return (
    <div
      className="modal"
      style={{ maxWidth: '480px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <X size={18} />
      </button>

      {!isEditing ? (
        <div>
          <div className="modal-header">
            <div
              className={`merchant-icon large ${transaction.category.toLowerCase()}`}
            >
              {transaction.category.slice(0, 3)}
            </div>
            <div>
              <p className="eyebrow">
                {transaction.type.toUpperCase()} DETAILS
              </p>
              <h2>{transaction.merchant}</h2>
            </div>
          </div>

          <div className="detail-amount-display">
            <span
              className={`big-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatMoney(transaction.amount)}
            </span>
            <span className="badge-pill">{transaction.category}</span>
          </div>

          <div className="detail-info-list">
            <div className="detail-row">
              <span className="detail-label">
                <Calendar size={15} /> Date
              </span>
              <strong>{transaction.date} ({transaction.displayDate || 'Recorded'})</strong>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <CreditCard size={15} /> Payment
              </span>
              <strong>{transaction.paymentMethod || 'UPI'}</strong>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <Tag size={15} /> Category
              </span>
              <strong>{transaction.category}</strong>
            </div>

            {transaction.notes && (
              <div className="detail-row">
                <span className="detail-label">
                  <FileText size={15} /> Notes
                </span>
                <span>{transaction.notes}</span>
              </div>
            )}

            {transaction.items && transaction.items.length > 0 && (
              <div className="receipt-items-section" style={{ marginTop: '14px' }}>
                <p className="eyebrow">ITEMIZED BREAKDOWN</p>
                <div className="receipt-items-list">
                  {transaction.items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <span>
                        {item.quantity ? `${item.quantity}x ` : ''}
                        {item.name}
                      </span>
                      <strong>{formatMoney(item.price)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {confirmDelete ? (
            <div className="delete-confirm-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <span>Are you sure you want to delete this transaction?</span>
              </div>
              <div className="modal-actions-bar" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={handleDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="modal-actions-bar" style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={15} /> Edit
              </button>
              <button
                type="button"
                className="danger-outline-btn"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <p className="eyebrow">EDIT TRANSACTION</p>
          <h2>Modify Entry</h2>
          <p className="muted" style={{ marginBottom: '16px' }}>
            Changes will instantly update your balance, category budget and analytics.
          </p>

          <label>
            Merchant / Source
            <input
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
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
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Education">Education</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Health">Health</option>
              <option value="Income">Income</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <div className="form-row">
            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label>
              Payment
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="NetBanking">Net Banking</option>
              </select>
            </label>
          </div>

          <label>
            Notes
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="modal-actions-bar" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  if (!isOpen || !transaction) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <TransactionDetailContent
        key={transaction.id}
        transaction={transaction}
        onClose={onClose}
        onSuccessToast={onSuccessToast}
      />
    </div>
  )
}
