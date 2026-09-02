import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  BookOpen,
} from 'lucide-react'

interface HelpSupportViewProps {
  onSuccessToast: (msg: string) => void
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({
  onSuccessToast,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const faqs = [
    {
      q: 'How is "Safe to Spend Today" calculated?',
      a: 'Finwise subtracts your upcoming recurring subscriptions and monthly goal buffers from your current balance, then divides the remaining discretionary pool by the number of days left in the month. If you spend less today, tomorrow\'s safe limit automatically rises.',
    },
    {
      q: 'How does the Receipt Scanner work?',
      a: 'Click "Scan Receipt" anywhere in the app, upload an invoice or receipt image (or select one of our pre-loaded student receipts), and our OCR engine extracts merchant, date, amount, items, and category. You can review and edit before confirming.',
    },
    {
      q: 'Will my changes survive a page refresh?',
      a: 'Yes! All transactions, custom budgets, savings goals, and profile settings are stored in local persistent browser storage and survive refreshes and browser restarts.',
    },
    {
      q: 'What is the "Can I Afford This?" tool?',
      a: 'It evaluates an upcoming purchase against your live bank balance, category limit, upcoming bills, and savings goals. It issues an instant CAN AFFORD, CAUTION, or NOT RECOMMENDED verdict with advice on goal impact.',
    },
    {
      q: 'How can I save for a laptop or trip on pocket money?',
      a: 'Create a target in the Goals module. Finwise automatically calculates the required monthly contribution and suggests painless spending cuts (like 2 fewer Swiggy orders per week).',
    },
  ]

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    onSuccessToast('Support inquiry sent! Student support typically responds in < 2 hours.')
    setSubject('')
    setMessage('')
  }

  return (
    <div className="help-support-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">STUDENT RESOURCES & GUIDANCE</p>
          <h1>Help & Support</h1>
          <p className="muted">
            Frequently asked questions about student budgeting, OCR receipt scanning, and our algorithms.
          </p>
        </div>
      </section>

      <div className="module-grid">
        {/* FAQs */}
        <div className="card faq-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">COMMON QUESTIONS</p>
              <h2>Student Finance FAQs</h2>
            </div>
            <BookOpen size={18} />
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === idx && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="card contact-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">GET IN TOUCH</p>
              <h2>Ask Campus Support</h2>
            </div>
            <Sparkles size={18} />
          </div>

          <form onSubmit={handleSupportSubmit}>
            <label>
              Subject / Topic
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about goal auto-save"
              />
            </label>

            <label>
              Your Message
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you need assistance with..."
              />
            </label>

            <button
              type="submit"
              className="primary-btn full"
              style={{ marginTop: '16px' }}
            >
              <Send size={15} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
