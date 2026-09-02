import React, { useState, useRef } from 'react'
import {
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

interface ReceiptScannerViewProps {
  onSuccessToast: (msg: string) => void
}

export const ReceiptScannerView: React.FC<ReceiptScannerViewProps> = ({
  onSuccessToast,
}) => {
  const { addTransaction, formatMoney, setActiveView } = useFinancial()

  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload')
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

  const startScanningSimulation = (presetData?: ReceiptPreset, customFilename?: string) => {
    setStep('scanning')
    setScanProgress(15)
    setScanStatusText('Enhancing image contrast and detecting receipt layout...')

    const selected = presetData || PRESET_RECEIPTS[0]

    setTimeout(() => {
      setScanProgress(45)
      setScanStatusText('Reading text lines with Optical Character Recognition...')
    }, 450)

    setTimeout(() => {
      setScanProgress(75)
      setScanStatusText('Extracting total amount, merchant name, items and date...')
    }, 900)

    setTimeout(() => {
      setScanProgress(100)
      setScanStatusText('Parsing complete! Preparing review card...')

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
    }, 1300)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
      const randomPreset = PRESET_RECEIPTS[Math.floor(Math.random() * PRESET_RECEIPTS.length)]
      startScanningSimulation(randomPreset, file.name)
    }
    reader.readAsDataURL(file)
  }

  const handlePresetSelect = (preset: ReceiptPreset) => {
    setPreviewImage(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="%23fcfcfd" rx="10" stroke="%23e2e8e4" stroke-width="2"/><text x="150" y="45" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle" fill="%231d2a25">${preset.merchant}</text><text x="150" y="70" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%237c8882">${preset.date} · ${preset.paymentMethod}</text><line x1="25" y1="90" x2="275" y2="90" stroke="%23e2e8e4" stroke-dasharray="4"/><text x="30" y="125" font-family="sans-serif" font-size="12" fill="%234b5563">1x Kathi Roll Special</text><text x="270" y="125" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%231d2a25">₹210.00</text><text x="30" y="155" font-family="sans-serif" font-size="12" fill="%234b5563">1x Cold Coffee</text><text x="270" y="155" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%231d2a25">₹90.00</text><text x="30" y="185" font-family="sans-serif" font-size="12" fill="%234b5563">GST & Delivery</text><text x="270" y="185" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%231d2a25">₹47.00</text><line x1="25" y1="215" x2="275" y2="215" stroke="%231d2a25" stroke-width="1.5"/><text x="30" y="245" font-family="sans-serif" font-size="15" font-weight="bold" fill="%231d2a25">TOTAL</text><text x="270" y="245" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="end" fill="%231f9d67">₹${preset.amount}.00</text><text x="150" y="380" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%239ca8a0">THANK YOU FOR YOUR VISIT</text></svg>`)
    startScanningSimulation(preset)
  }

  const handleConfirm = (e: React.FormEvent) => {
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
    setActiveView('History')
  }

  return (
    <div className="receipt-scanner-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">SMART OPTICAL EXTRACTION</p>
          <h1>Receipt Scanner</h1>
          <p className="muted">
            Upload any physical receipt or digital invoice. Finwise OCR automatically extracts
            merchant, total amount, line items, and updates your budgets and history.
          </p>
        </div>
      </section>

      <div className="card full-scanner-card">
        {step === 'upload' && (
          <div>
            <div
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    setPreviewImage(ev.target?.result as string)
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
                <UploadCloud size={36} />
              </div>
              <h3>Drag & drop your receipt, or browse device</h3>
              <p>Supports PNG, JPG, WEBP, and PDF receipts up to 10MB</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Choose file from computer
              </button>
            </div>

            {/* Presets */}
            <div className="presets-section" style={{ marginTop: '28px' }}>
              <p className="eyebrow">TRY WITH PRE-LOADED STUDENT RECEIPTS</p>
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
                      <ShoppingBag size={15} />
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
          <div className="scanning-container" style={{ padding: '40px 0' }}>
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
              <h2>Processing Receipt Data</h2>
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
          <form onSubmit={handleConfirm}>
            <div className="modal-header">
              <span className="badge-success-icon">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <p className="eyebrow">STEP 2 OF 2 · REVIEW EXTRACTED DETAILS</p>
                <h2>Receipt Detected</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: '20px' }}>
              Check the extracted data below. You can edit any field before adding it to
              your live financial system.
            </p>

            {errorMsg && (
              <div className="error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="review-layout">
              {/* Receipt Visual Preview */}
              <div className="extracted-receipt-card">
                <div className="receipt-badge">
                  <FileText size={14} />
                  <span>Extracted Document</span>
                </div>
                {previewImage && (
                  <div className="receipt-image-preview">
                    <img src={previewImage} alt="Receipt preview" />
                  </div>
                )}
                {items.length > 0 && (
                  <div className="receipt-items-list">
                    <p className="items-title">
                      <Layers size={13} /> Extracted Line Items ({items.length})
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

              {/* Form Input Fields */}
              <div className="review-fields-form">
                <label>
                  Merchant / Vendor
                  <input
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                  />
                </label>

                <div className="form-row">
                  <label>
                    Amount (₹)
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value ? Number(e.target.value) : '')
                      }
                    />
                  </label>

                  <label>
                    Date
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row">
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
                      <option value="Health">Health</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label>
                    Payment Method
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Debit / Credit Card</option>
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
                    placeholder="e.g. Scanned receipt for mess food"
                  />
                </label>

                <div className="modal-actions-bar" style={{ marginTop: '22px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetScanner}
                  >
                    <RotateCcw size={15} /> Scan Another
                  </button>
                  <button type="submit" className="primary-btn">
                    <CheckCircle2 size={16} /> Confirm & Add to Transactions
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
