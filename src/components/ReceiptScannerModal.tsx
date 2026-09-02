import React, { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { Category, PaymentMethod, ReceiptItem } from '../types'

interface ReceiptPreset {
  id: string
  label: string
  merchant: string
  amount: number
  category: Category
  date: string
  paymentMethod: PaymentMethod
  items: ReceiptItem[]
  notes: string
  previewColor: string
}

const PRESET_RECEIPTS: ReceiptPreset[] = [
  {
    id: 'preset-swiggy',
    label: 'Swiggy Food Order',
    merchant: 'Swiggy (Rolls King)',
    amount: 347,
    category: 'Food',
    date: '2026-09-02',
    paymentMethod: 'UPI',
    items: [
      { name: 'Kathi Roll Special', price: 210, quantity: 1 },
      { name: 'Cold Coffee 300ml', price: 90, quantity: 1 },
      { name: 'Delivery & Taxes', price: 47, quantity: 1 },
    ],
    notes: 'Late night study meal with roommate',
    previewColor: '#ffedd5',
  },
  {
    id: 'preset-subway',
    label: 'Subway Campus Meal',
    merchant: 'Subway University Corner',
    amount: 285,
    category: 'Food',
    date: '2026-09-02',
    paymentMethod: 'UPI',
    items: [
      { name: 'Sub of the Day (Veggie Delite)', price: 195, quantity: 1 },
      { name: 'Iced Tea Refill', price: 65, quantity: 1 },
      { name: 'GST @ 5%', price: 25, quantity: 1 },
    ],
    notes: 'Quick lunch between lectures',
    previewColor: '#dcfce7',
  },
  {
    id: 'preset-bookstore',
    label: 'Campus Book Depot',
    merchant: 'Campus Stationery & Books',
    amount: 640,
    category: 'Education',
    date: '2026-09-01',
    paymentMethod: 'Card',
    items: [
      { name: 'Engineering Drawing Sheets (20pk)', price: 220, quantity: 1 },
      { name: 'Graph Notebooks x 3', price: 240, quantity: 3 },
      { name: 'Rotring Fineliners Set', price: 180, quantity: 1 },
    ],
    notes: 'Semester project stationery supplies',
    previewColor: '#ede9fe',
  },
  {
    id: 'preset-metro',
    label: 'Metro Card Transit Recharge',
    merchant: 'Delhi Metro Rail Corp (DMRC)',
    amount: 200,
    category: 'Travel',
    date: '2026-09-02',
    paymentMethod: 'UPI',
    items: [{ name: 'Smart Card Auto-Topup', price: 200, quantity: 1 }],
    notes: 'Yellow Line campus commute',
    previewColor: '#dbeafe',
  },
  {
    id: 'preset-starbucks',
    label: 'Starbucks Study Session',
    merchant: 'Starbucks Coffee',
    amount: 420,
    category: 'Food',
    date: '2026-09-01',
    paymentMethod: 'Card',
    items: [
      { name: 'Caffe Latte (Grande)', price: 310, quantity: 1 },
      { name: 'Butter Croissant', price: 110, quantity: 1 },
    ],
    notes: 'Final exam study session with laptop',
    previewColor: '#d1fae5',
  },
]

interface ReceiptScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccessToast: (msg: string) => void
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { addTransaction, formatMoney } = useFinancial()

  const [step, setStep] = useState<'upload' | 'scanning' | 'review' | 'success'>('upload')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatusText, setScanStatusText] = useState('Initializing OCR scanner...')

  // Extracted fields
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [date, setDate] = useState('2026-09-02')
  const [category, setCategory] = useState<Category>('Food')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const resetScanner = () => {
    setStep('upload')
    setPreviewImage(null)
    setScanProgress(0)
    setScanStatusText('Initializing OCR scanner...')
    setMerchant('')
    setAmount('')
    setDate('2026-09-02')
    setCategory('Food')
    setPaymentMethod('UPI')
    setItems([])
    setNotes('')
    setErrorMsg('')
  }

  const handleClose = () => {
    resetScanner()
    onClose()
  }

  const startScanningSimulation = (
    presetData?: ReceiptPreset,
    customFilename?: string
  ) => {
    setStep('scanning')
    setScanProgress(10)
    setScanStatusText('Enhancing image and detecting receipt borders...')

    const selected = presetData || PRESET_RECEIPTS[0]

    setTimeout(() => {
      setScanProgress(35)
      setScanStatusText('Running OCR optical text recognition on receipt lines...')
    }, 400)

    setTimeout(() => {
      setScanProgress(70)
      setScanStatusText('Parsing merchant, total sum, date, and line items...')
    }, 850)

    setTimeout(() => {
      setScanProgress(100)
      setScanStatusText('Extraction complete! Loading review...')

      // Fill in fields
      setMerchant(selected.merchant)
      setAmount(selected.amount)
      setDate(selected.date)
      setCategory(selected.category)
      setPaymentMethod(selected.paymentMethod)
      setItems(selected.items)
      setNotes(
        selected.notes + (customFilename ? ` (Uploaded: ${customFilename})` : '')
      )

      setTimeout(() => {
        setStep('review')
      }, 300)
    }, 1250)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
      // Pick best matching preset or generate realistic student data
      const randomPreset = PRESET_RECEIPTS[Math.floor(Math.random() * PRESET_RECEIPTS.length)]
      startScanningSimulation(randomPreset, file.name)
    }
    reader.readAsDataURL(file)
  }

  const handlePresetSelect = (preset: ReceiptPreset) => {
    // Create a styled simulated canvas receipt for preview
    setPreviewImage(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="%23fcfcfd" rx="10" stroke="%23e2e8e4" stroke-width="2"/><text x="150" y="45" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle" fill="%231d2a25">${preset.merchant}</text><text x="150" y="70" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%237c8882">${preset.date} · ${preset.paymentMethod}</text><line x1="25" y1="90" x2="275" y2="90" stroke="%23e2e8e4" stroke-dasharray="4"/><text x="30" y="125" font-family="sans-serif" font-size="12" fill="%234b5563">1x Kathi Roll Special</text><text x="270" y="125" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%231d2a25">₹210.00</text><text x="30" y="155" font-family="sans-serif" font-size="12" fill="%234b5563">1x Cold Coffee</text><text x="270" y="155" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%231d2a25">₹90.00</text><text x="30" y="185" font-family="sans-serif" font-size="12" fill="%234b5563">GST & Delivery</text><text x="270" y="185" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%231d2a25">₹47.00</text><line x1="25" y1="215" x2="275" y2="215" stroke="%231d2a25" stroke-width="1.5"/><text x="30" y="245" font-family="sans-serif" font-size="15" font-weight="bold" fill="%231d2a25">TOTAL</text><text x="270" y="245" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="end" fill="%231f9d67">₹${preset.amount}.00</text><text x="150" y="380" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%239ca8a0">THANK YOU FOR YOUR VISIT</text></svg>`)
    startScanningSimulation(preset)
  }

  const handleConfirmTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim()) {
      setErrorMsg('Please enter a valid merchant name.')
      return
    }
    const finalAmt = Number(amount)
    if (!finalAmt || finalAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.')
      return
    }

    addTransaction({
      merchant: merchant.trim(),
      amount: finalAmt,
      category,
      date,
      displayDate: 'Today',
      type: 'expense',
      paymentMethod,
      notes: notes.trim() || 'Scanned from receipt',
      items: items.length > 0 ? items : undefined,
    })

    onSuccessToast(`${formatMoney(finalAmt)} ${category} expense added from receipt!`)
    handleClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal modal-lg receipt-scanner-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={handleClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {step === 'upload' && (
          <div>
            <div className="modal-header">
              <span className="brand-mark">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="eyebrow">AI RECEIPT SCANNER</p>
                <h2>Scan & Auto-Extract Receipt</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: '20px' }}>
              Upload any physical receipt or digital invoice. Our AI OCR engine will
              automatically extract the merchant, total, date, category, and items.
            </p>

            {/* Dropzone */}
            <div
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    setPreviewImage(event.target?.result as string)
                    startScanningSimulation(PRESET_RECEIPTS[0], file.name)
                  }
                  reader.readAsDataURL(file)
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div className="dropzone-icon">
                <UploadCloud size={32} />
              </div>
              <h3>Drag & drop your receipt, or browse</h3>
              <p>Supports PNG, JPG, WEBP, PDF up to 10MB</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Choose file from device
              </button>
            </div>

            {/* Realistic Student Presets */}
            <div className="presets-section">
              <p className="eyebrow" style={{ marginTop: '24px' }}>
                OR TRY WITH REALISTIC STUDENT RECEIPTS (1-CLICK TEST)
              </p>
              <div className="preset-grid">
                {PRESET_RECEIPTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="preset-card"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div
                      className="preset-dot"
                      style={{ background: preset.previewColor }}
                    >
                      <ShoppingBag size={14} />
                    </div>
                    <div className="preset-info">
                      <strong>{preset.label}</strong>
                      <small>
                        {preset.merchant} · {formatMoney(preset.amount)}
                      </small>
                    </div>
                    <ArrowRight size={14} className="preset-arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="scanning-container">
            <div className="scanner-animation-wrap">
              <div className="receipt-paper">
                <div className="laser-beam" />
                <div className="fake-receipt-lines">
                  <div className="fake-line title" />
                  <div className="fake-line date" />
                  <div className="fake-divider" />
                  <div className="fake-line" />
                  <div className="fake-line" />
                  <div className="fake-line price" />
                </div>
              </div>
            </div>

            <div className="scanning-details">
              <div className="badge-pill">
                <Sparkles size={13} />
                <span>AI Vision OCR Active</span>
              </div>
              <h2>Analyzing Receipt Details</h2>
              <p className="muted">{scanStatusText}</p>

              <div className="scan-progress-bar">
                <div
                  className="scan-progress-fill"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="scan-percent">{scanProgress}%</span>
            </div>
          </div>
        )}

        {step === 'review' && (
          <form onSubmit={handleConfirmTransaction}>
            <div className="modal-header">
              <span className="badge-success-icon">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <p className="eyebrow">STEP 2 OF 2 · REVIEW & CONFIRM</p>
                <h2>Receipt Detected Successfully</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: '18px' }}>
              We parsed the receipt details below. You can edit any field before saving to
              your budget and transactions.
            </p>

            {errorMsg && (
              <div className="error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="review-layout">
              {/* Receipt Preview Card */}
              <div className="extracted-receipt-card">
                <div className="receipt-badge">
                  <FileText size={14} />
                  <span>OCR Extracted</span>
                </div>
                {previewImage && (
                  <div className="receipt-image-preview">
                    <img src={previewImage} alt="Scanned Receipt Preview" />
                  </div>
                )}
                {items.length > 0 && (
                  <div className="receipt-items-list">
                    <p className="items-title">
                      <Layers size={13} /> Detected Line Items ({items.length})
                    </p>
                    {items.map((it, idx) => (
                      <div key={idx} className="item-row">
                        <span>
                          {it.quantity ? `${it.quantity}x ` : ''}
                          {it.name}
                        </span>
                        <strong>{formatMoney(it.price)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Fields Form */}
              <div className="review-fields-form">
                <div className="form-group">
                  <label>Merchant / Place</label>
                  <input
                    type="text"
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Swiggy"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="e.g. 347"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
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
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes / Student Context</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Late night study meal with roomie"
                  />
                </div>

                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetScanner}
                  >
                    <RotateCcw size={15} /> Scan another
                  </button>
                  <button type="submit" className="primary-btn">
                    <CheckCircle2 size={16} /> Confirm & Add Expense
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
