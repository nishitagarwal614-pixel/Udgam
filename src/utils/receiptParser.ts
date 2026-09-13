import Tesseract from 'tesseract.js'
import type { Category, PaymentMethod, ReceiptItem } from '../types'

export interface ParsedReceiptResult {
  merchant: string
  amount: number
  date: string
  category: Category
  paymentMethod: PaymentMethod
  items: ReceiptItem[]
  notes: string
  rawText: string
  confidence: number
}

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

/**
 * Preprocess image on canvas:
 * 1. Enhances contrast and converts to grayscale
 * 2. Upscales low-res images so tiny decimal dots (.) are sharp and readable
 */
async function preprocessImage(imageSource: string | File | Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Canvas 2D context not available'))
      }

      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      // If image is small or low-res, upscale to make punctuation like dots (.) distinct
      let scale = 1
      if (width < 1400 && height < 1400) {
        scale = Math.min(2.0, 1600 / Math.max(width, height))
      } else if (width > 2200 || height > 2200) {
        scale = 2000 / Math.max(width, height)
      }

      const targetWidth = Math.round(width * scale)
      const targetHeight = Math.round(height * scale)

      canvas.width = targetWidth
      canvas.height = targetHeight

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Apply grayscale + contrast enhancement
      ctx.filter = 'grayscale(1) contrast(1.4) brightness(1.04)'
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      resolve(canvas)
    }

    img.onerror = (err) => reject(err)

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else {
      img.src = URL.createObjectURL(imageSource)
    }
  })
}

/**
 * Normalizes common OCR misreads where decimal dots were replaced by spaces, commas, colons, or middle dots.
 * E.g. "45 60" -> "45.60", "45,60" -> "45.60", "7:00" -> "7.00"
 */
function normalizeOcrLine(line: string): string {
  let cleaned = line.trim()
  // Replace comma, colon, middle dot, apostrophe, backtick, dash between digits with a standard dot
  cleaned = cleaned.replace(/(\d+)[,·:;'`-](\d{2})\b/g, '$1.$2')
  // Replace trailing space between integer and 2 decimals: e.g. "Total 45 60" -> "Total 45.60"
  cleaned = cleaned.replace(/(\d+)[ \t]+(\d{2})\s*$/g, '$1.$2')
  return cleaned
}

/**
 * Extracts a price amount from the end of a line or near a currency symbol.
 * Handles missing decimal dots (e.g. "45 60" -> 45.60), currency prefixes ("Rs. 150.50" -> 150.50),
 * and thermal print separators (comma, colon, middle dot, apostrophe, dash).
 */
export function extractPriceFromLine(line: string): number | null {
  let trimmed = line.trim()
  // Strip trailing noise like /-, *, #, etc.
  trimmed = trimmed.replace(/[/*#~=_-]+$/, '').trim()

  // 1. Currency tagged amount near the end
  const currMatch = trimmed.match(/(?:rs\.?|inr|₹|\$)\s*(\d+(?:[.,·:;'`\s]\d{1,2})?)/i)
  if (currMatch) {
    const rawVal = currMatch[1].trim()
    const normalized = rawVal.replace(/[,·:;'`\s-]/g, '.')
    const parts = normalized.split('.')
    let numStr = parts[0]
    if (parts.length > 1) {
      numStr += '.' + parts.slice(1).join('')
    }
    const val = parseFloat(numStr)
    if (!isNaN(val) && val > 0) return val
  }

  // 2. Explicit decimal at the end
  const decMatch = trimmed.match(/(\d+)[.,·:;'`-](\d{1,2})\s*$/)
  if (decMatch) {
    const val = parseFloat(`${decMatch[1]}.${decMatch[2]}`)
    if (!isNaN(val) && val > 0) return val
  }

  // 3. Space-separated decimal at the end: e.g. "Total 45 60", "Yogurt 7 00"
  const spaceDecMatch = trimmed.match(/(\d+)[ \t]+(\d{2})\s*$/)
  if (spaceDecMatch) {
    const val = parseFloat(`${spaceDecMatch[1]}.${spaceDecMatch[2]}`)
    if (!isNaN(val) && val > 0) return val
  }

  // 4. Integer amount at the end: e.g. "TOTAL: 120"
  const intMatch = trimmed.match(/(\d+)\s*$/)
  if (intMatch) {
    const val = parseFloat(intMatch[1])
    if (!isNaN(val) && val > 0) return val
  }

  return null
}

/**
 * Extracts and strictly validates receipt dates into YYYY-MM-DD
 */
function extractReceiptDate(lines: string[]): string {
  const parseDateCandidate = (text: string): string | null => {
    // 1. DD/MM/YYYY or DD-MM-YYYY
    const numMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/)
    if (numMatch) {
      let p1 = parseInt(numMatch[1], 10)
      let p2 = parseInt(numMatch[2], 10)
      let yearStr = numMatch[3]
      if (yearStr.length === 2) {
        yearStr = (parseInt(yearStr, 10) > 50 ? '19' : '20') + yearStr
      }
      const y = parseInt(yearStr, 10)
      if (y >= 1990 && y <= 2035) {
        if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
          return `${yearStr}-${p2.toString().padStart(2, '0')}-${p1.toString().padStart(2, '0')}`
        }
        if (p2 >= 1 && p2 <= 31 && p1 >= 1 && p1 <= 12) {
          return `${yearStr}-${p1.toString().padStart(2, '0')}-${p2.toString().padStart(2, '0')}`
        }
      }
    }

    // 2. DD-MMM-YYYY or DD MMM YYYY (e.g., 29-Mar-23, 29 Mar 2023)
    const alphaMatch = text.match(
      /\b(\d{1,2})[-/.\s]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/.\s]+(\d{2,4})\b/i
    )
    if (alphaMatch) {
      const day = parseInt(alphaMatch[1], 10)
      const monStr = alphaMatch[2].slice(0, 3).toLowerCase()
      const mon = MONTH_MAP[monStr]
      let yearStr = alphaMatch[3]
      if (yearStr.length === 2) {
        yearStr = (parseInt(yearStr, 10) > 50 ? '19' : '20') + yearStr
      }
      const y = parseInt(yearStr, 10)
      if (day >= 1 && day <= 31 && mon && y >= 1990 && y <= 2035) {
        return `${yearStr}-${mon}-${day.toString().padStart(2, '0')}`
      }
    }

    // 3. YYYY-MM-DD (ISO)
    const isoMatch = text.match(/\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/)
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10)
      const m = parseInt(isoMatch[2], 10)
      const d = parseInt(isoMatch[3], 10)
      if (y >= 1990 && y <= 2035 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
      }
    }

    return null
  }

  // Priority 1: Check lines explicitly labeled with "Date"
  for (const line of lines) {
    if (/\bdate\b/i.test(line)) {
      const d = parseDateCandidate(line)
      if (d) return d
    }
  }

  // Priority 2: Check any line in the receipt
  for (const line of lines) {
    const d = parseDateCandidate(line)
    if (d) return d
  }

  // Fallback to recent date
  return '2026-09-02'
}

/**
 * Parses a single line item, extracting name, quantity, and unit/total price.
 */
function parseItemLine(rawLine: string, detectedTotal: number): ReceiptItem | null {
  const line = rawLine.trim()
  const lower = line.toLowerCase()

  // Skip lines that are totals, headers, or metadata
  const skipKeywords = [
    'total',
    'subtotal',
    'tax',
    'invoice',
    'date',
    'till',
    'manager',
    'cashier',
    'bank card',
    'card:',
    'thank you',
    'welcome',
    'order',
    'change due',
    'cash receipt',
    'tendered',
    'balance',
    'terminal',
    'gstin',
    'gst',
    'phone',
    'tel',
    'transaction',
    'auth',
    'approval',
    'rrn',
    'batch',
    'trace',
    'reference',
  ]
  if (skipKeywords.some((kw) => lower.includes(kw))) return null
  if (/^[=*~_\-#\s]{3,}$/.test(line)) return null

  // Skip address or contact lines
  if (
    /\b(?:unit|gate|floor|court|road|street|st\.|ave|avenue|nagar|sector|building|mumbai|delhi|bengaluru|kolkata|chennai|hyderabad|pune|bigcity|lane|pin|pincode|mobile|email)\b/i.test(
      lower
    )
  ) {
    return null
  }

  // Strip leading bullets (#, *, •, -, etc.) or numbered list indicators (1., 2.)
  const cleanLine = line.replace(/^[#*•>–~-]+\s*/, '').replace(/^\d+[.)]\s+/, '').trim()

  const priceVal = extractPriceFromLine(cleanLine)
  if (!priceVal || priceVal <= 0) return null

  // Don't accept item price wildly above detected total
  if (detectedTotal > 0 && priceVal > detectedTotal * 1.05) return null

  // Cut off trailing price token from cleanLine to get the item name and optional quantity
  let beforePrice = cleanLine
    .replace(/(?:(?:rs\.?|inr|₹|\$)\s*)?\d+(?:[.,·:;'`\s]\d{1,2})?\s*(?:rs\.?|₹|\$|inr|[/~*-])*\s*$/i, '')
    .trim()

  let qty = 1
  // Check if there is a quantity and rate column before the total: e.g. "Fruit Chat 1 120.00"
  const qtyRateMatch = beforePrice.match(/^(.+?)\s+(\d+)\s+[\d.,]+$/)
  if (qtyRateMatch) {
    beforePrice = qtyRateMatch[1].trim()
    qty = parseInt(qtyRateMatch[2], 10) || 1
  } else {
    // Check if there is just a quantity before price: e.g. "Fruit Chat 2"
    const qtyOnlyMatch = beforePrice.match(/^(.+?)\s+(\d+)$/)
    if (qtyOnlyMatch && qtyOnlyMatch[1].length >= 2) {
      beforePrice = qtyOnlyMatch[1].trim()
      qty = parseInt(qtyOnlyMatch[2], 10) || 1
    }
  }

  const itemName = beforePrice.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g, '').trim()
  if (!itemName || itemName.length < 2 || !/[a-zA-Z]/.test(itemName)) {
    return null
  }

  return {
    name: itemName,
    quantity: qty > 0 ? qty : 1,
    price: priceVal,
  }
}

/**
 * Extracts line items from receipt lines
 */
function extractReceiptItems(rawLines: string[], detectedTotal: number): ReceiptItem[] {
  const items: ReceiptItem[] = []
  for (const rawLine of rawLines) {
    const it = parseItemLine(rawLine, detectedTotal)
    if (it) {
      items.push(it)
    }
  }
  return items
}

/**
 * Main parser function: processes normalized lines and extracts structured data
 */
export function parseReceiptText(rawText: string, filename?: string): Omit<ParsedReceiptResult, 'confidence'> {
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const lines = rawLines.map(normalizeOcrLine)

  // 1. Merchant Extraction
  let merchant = ''
  const skipWords = [
    'tax invoice',
    'cash receipt',
    'retail invoice',
    'bill of supply',
    'invoice',
    'tax',
    'welcome',
    'thank you',
    'receipt',
    'order',
    'bill',
    'till',
    'table',
    'manager',
    'cashier',
  ]

  for (const line of lines.slice(0, 7)) {
    const lower = line.toLowerCase()
    const isSkip = skipWords.some((sw) => lower.startsWith(sw) || lower === sw)
    const hasLetters = /[a-zA-Z]{3,}/.test(line)
    const isAddress = /\b(?:st\.|street|road|floor|unit|avenue|box|tel|phone)\b/i.test(lower)
    const isPureSymbols = /^[*=~_#\s-]+$/.test(line)

    if (!isSkip && hasLetters && !isAddress && !isPureSymbols) {
      merchant = line
        .replace(/^[#*•>–~-]+\s*/, '')
        .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9)]+$/g, '')
        .trim()
      if (merchant.length >= 3) break
    }
  }

  if (!merchant && filename) {
    const cleanName = filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/receipt|scan|bill|image|photo/gi, '')
      .trim()
    if (cleanName.length >= 3) {
      merchant = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    }
  }
  if (!merchant) merchant = 'Store / Merchant'

  // 2. Date Extraction
  const date = extractReceiptDate(lines)

  // 3. Amount & Total Extraction (With dot recovery and currency handling)
  let amount = 0
  const totalKeywords = [
    'grand total',
    'net total',
    'total amount',
    'bill total',
    'final total',
    'total',
    'bank card',
    'card:',
    'amount paid',
    'amt paid',
    'net amount',
    'balance due',
    'paid',
  ]

  const candidateTotals: number[] = []
  for (const line of lines) {
    const lower = line.toLowerCase()
    for (const kw of totalKeywords) {
      if (lower.includes(kw)) {
        const p = extractPriceFromLine(line)
        if (p && p > 0 && p < 500000) {
          candidateTotals.push(p)
        }
      }
    }
  }

  if (candidateTotals.length > 0) {
    const decCandidates = candidateTotals.filter((c) => c % 1 !== 0)
    if (decCandidates.length > 0) {
      amount = Math.max(...decCandidates)
    } else {
      amount = Math.max(...candidateTotals)
    }
  }

  // 4. Line Items Extraction
  const items = extractReceiptItems(rawLines, amount)

  // If items were detected, use them for decimal dot cross-validation:
  if (items.length > 0) {
    const itemsSum = items.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0)

    // Check if the total amount missed a decimal dot: e.g. amount is 4560 while items sum to 45.60
    if (amount > 0 && Math.abs(amount / 100 - itemsSum) < 0.2) {
      amount = Math.round(itemsSum * 100) / 100
    }

    // If total was 0 or unread, use the sum of line items
    if (!amount || amount === 0) {
      amount = Math.round(itemsSum * 100) / 100
    }
  }

  // If no items extracted but we have an amount, create single summary line item
  if (items.length === 0 && amount > 0) {
    items.push({
      name: merchant,
      quantity: 1,
      price: amount,
    })
  }

  // 5. Category Inference (Strict word-boundary matching)
  let category: Category = 'Food'
  const fullTextLower = (rawText + ' ' + merchant + ' ' + items.map((i) => i.name).join(' ')).toLowerCase()

  if (
    /\b(?:juice|chill|fruit|canteen|mess|food|dining|swiggy|zomato|subway|mcdonald|burger|pizza|chat|coffee|tea|cafe|restaurant|bistro|diner|dhaba|roll|biryani|dosa|kitchen|eats|snack|bakery|lunch|dinner|meal|yogurt|spinach|tomato|tomatoes|cucumber|cabbage|milk|cereal|bread|butter|cheese|egg|grocery|groceries|supermarket|market|vegetable|vegetables)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Food'
  } else if (
    /\b(?:mall|store|clothing|apparel|fashion|zara|h&m|shoes|footwear|electronics|gadget|croma|reliance|amazon|flipkart|myntra)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Shopping'
  } else if (
    /\b(?:metro|transit|bus|train|railway|irctc|uber|ola|auto|\bcab\b|\bcabs\b|taxi|flight|airline|petrol|fuel|diesel|commute|toll|parking)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Travel'
  } else if (
    /\b(?:book|books|stationery|xerox|print|photocopy|pen|notebook|paper|exam|drawing|academic|tuition|course|udemy|coursera|textbook|library)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Education'
  } else if (
    /\b(?:pharmacy|medical|chemist|medicine|meds|tablet|doctor|hospital|clinic|apollo|health|lab)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Health'
  } else if (
    /\b(?:netflix|spotify|prime|hotstar|youtube|apple|subscription|membership)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Subscriptions'
  } else if (
    /\b(?:movie|cinema|pvr|inox|ticket|game|gaming|concert|fest|event|show|theatre)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Entertainment'
  } else if (
    /\b(?:hostel|rent|room|electricity|water|broadband|wifi|maintenance|bill)\b/i.test(
      fullTextLower
    )
  ) {
    category = 'Bills'
  }

  // 6. Payment Method Inference
  let paymentMethod: PaymentMethod = 'UPI'
  if (/\b(?:bank card|card|visa|mastercard|pos|debit|credit|amex|rupay)\b/i.test(fullTextLower)) {
    paymentMethod = 'Card'
  } else if (/\b(?:cash|tendered|change due)\b/i.test(fullTextLower)) {
    paymentMethod = 'Cash'
  } else if (/\b(?:netbanking|neft|rtgs|imps|transfer)\b/i.test(fullTextLower)) {
    paymentMethod = 'NetBanking'
  } else if (/\b(?:upi|gpay|phonepe|paytm|bhim|qr)\b/i.test(fullTextLower)) {
    paymentMethod = 'UPI'
  }

  // 7. Notes
  const notes =
    items.length > 0
      ? items.map((it) => `${it.quantity && it.quantity > 1 ? `${it.quantity}x ` : ''}${it.name}`).join(', ')
      : `Scanned from receipt (${merchant})`

  return {
    merchant,
    amount,
    date,
    category,
    paymentMethod,
    items,
    notes,
    rawText,
  }
}

/**
 * Main function: Takes an image source, performs OCR via Tesseract.js,
 * and returns structured receipt fields.
 */
export async function parseReceiptImage(
  imageSource: string | File | Blob,
  onProgress?: (progressPercent: number, statusText: string) => void
): Promise<ParsedReceiptResult> {
  onProgress?.(15, 'Enhancing image contrast for optimal OCR...')

  let canvas: HTMLCanvasElement | null = null
  if (typeof document !== 'undefined') {
    try {
      canvas = await preprocessImage(imageSource)
    } catch (err) {
      console.warn('Canvas pre-processing failed, falling back to direct image OCR', err)
    }
  }

  onProgress?.(30, 'Starting Optical Character Recognition (OCR)...')

  const inputTarget = canvas || imageSource

  const ocrResult = await Tesseract.recognize(inputTarget, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = Math.round(30 + (m.progress || 0) * 55)
        onProgress?.(pct, `Scanning receipt text (${Math.round((m.progress || 0) * 100)}%)...`)
      }
    },
  })

  onProgress?.(90, 'Parsing extracted text into transaction details...')

  const rawText = ocrResult.data.text || ''
  const confidence = ocrResult.data.confidence || 0

  const filename = imageSource instanceof File ? imageSource.name : undefined

  const parsed = parseReceiptText(rawText, filename)

  onProgress?.(100, 'Receipt detected successfully!')

  return {
    ...parsed,
    confidence,
  }
}