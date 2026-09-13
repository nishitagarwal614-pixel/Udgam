import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  Trash2,
  CheckCircle,
  ArrowRight,
  Key,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'
import type { BudgetActionData } from '../types'

interface ChatMessage {
  id: string
  sender: 'user' | 'coach'
  text: string
  timestamp: string
  actionData?: BudgetActionData
}

let messageCounter = 1

function renderFormattedMessage(text: string) {
  // Split on code blocks ```code```
  const parts = text.split(/(```[\s\S]*?```)/g)

  return parts.map((part, partIdx) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineBreak = part.indexOf('\n')
      const lang = firstLineBreak !== -1 ? part.slice(3, firstLineBreak).trim() : ''
      const code = firstLineBreak !== -1 ? part.slice(firstLineBreak + 1, -3) : part.slice(3, -3)

      return (
        <div key={partIdx} style={{ margin: '12px 0' }}>
          {lang && (
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#94a3b8',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 12px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: 'none',
                display: 'inline-block',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {lang}
            </div>
          )}
          <pre
            style={{
              backgroundColor: '#101018',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: lang ? '0 8px 8px 8px' : '8px',
              padding: '12px 16px',
              overflowX: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              color: '#e2e8f0',
              margin: 0,
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      )
    }

    // Regular paragraphs with inline bold and backtick codes
    return part.split('\n').map((line, lIdx) => {
      if (!line.trim()) return <div key={lIdx} style={{ height: '6px' }} />

      const inlineTokens = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)

      return (
        <p key={lIdx} style={{ margin: '4px 0', lineHeight: 1.6 }}>
          {inlineTokens.map((token, tIdx) => {
            if (token.startsWith('**') && token.endsWith('**')) {
              return <strong key={tIdx}>{token.slice(2, -2)}</strong>
            }
            if (token.startsWith('`') && token.endsWith('`')) {
              return (
                <code
                  key={tIdx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.88em',
                    fontFamily: 'monospace',
                    color: '#a78bfa',
                  }}
                >
                  {token.slice(1, -1)}
                </code>
              )
            }
            return token
          })}
        </p>
      )
    })
  })
}

export const AiCoachView: React.FC = () => {
  const {
    profile,
    askAiCoach,
    formatMoney,
    currentBalance,
    safeToSpend,
    setActiveView,
    applyBudgetPlan,
  } = useFinancial()

  const firstName = profile.name.split(' ')[0] || 'Nishita'

  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [appliedPlanIds, setAppliedPlanIds] = useState<string[]>([])
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('finwise_gemini_api_key') || ''
  })
  const [hasGeminiKey, setHasGeminiKey] = useState(() => {
    return Boolean(localStorage.getItem('finwise_gemini_api_key'))
  })

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('finwise_gemini_api_key', apiKeyInput.trim())
      setHasGeminiKey(true)
    } else {
      localStorage.removeItem('finwise_gemini_api_key')
      setHasGeminiKey(false)
    }
    setShowApiKeyModal(false)
  }
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'coach',
      text: `Hello ${firstName}! 🌌 I am **Finwise AI**, your autonomous AI agent and student co-pilot. You have ${formatMoney(currentBalance)} in liquid balance, with a safe daily spending pace of ${formatMoney(safeToSpend.safeDaily)}/day.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || isThinking) return

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: `msg-${++messageCounter}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: nowStr,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!queryText) setInput('')
    setIsThinking(true)

    try {
      const response = await askAiCoach(textToSend)
      const coachMsg: ChatMessage = {
        id: `msg-${++messageCounter}`,
        sender: 'coach',
        text: typeof response === 'string' ? response : response.text,
        actionData: typeof response === 'object' ? response.actionData : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, coachMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-${++messageCounter}`,
        sender: 'coach',
        text: 'I ran into a problem crunching your numbers. Please ask again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsThinking(false)
    }
  }

  const suggestionChips = [
    'Write quicksort in Python',
    'How to crack tech campus placements?',
    'Explain quantum computing simply',
    'Can I spend ₹350 on lunch today?',
    'Create a budget of ₹3,000 for Entertainment',
    'Create a budget for me',
    'What was my last transaction?',
    'Draft email to professor for leave',
    'How to stop overspending?',
    'What is 25 * 40?',
  ]

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        sender: 'coach',
        text: `Fresh slate, ${firstName}! 🌌 I'm **Finwise AI**, ready for any question—from coding and algorithms to university exams and your live budget (${formatMoney(currentBalance)}). Ask me anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  return (
    <div className="ai-coach-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow" style={{ color: '#818cf8', fontWeight: 700, letterSpacing: '0.08em' }}>
            STUDENT FINANCIAL & AGENTIC INTELLIGENCE
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>Finwise AI</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: '#c084fc',
              }}
            >
              <Sparkles size={12} /> Finwise AI 2.0 • Active
            </span>
          </div>
          <p className="muted" style={{ marginTop: '4px' }}>
            Autonomous agentic intelligence, software engineering mentor, and student financial co-pilot.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="secondary-btn small"
            onClick={() => setShowApiKeyModal(true)}
            title="Configure live Google Gemini AI key"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: hasGeminiKey ? 'rgba(16, 185, 129, 0.4)' : undefined,
              color: hasGeminiKey ? '#10b981' : undefined,
            }}
          >
            <Key size={14} /> {hasGeminiKey ? 'Gemini Active' : 'Connect Gemini AI'}
          </button>
          <button
            type="button"
            className="secondary-btn small"
            onClick={clearChat}
            title="Reset conversation"
          >
            <Trash2 size={14} /> Clear chat
          </button>
        </div>
      </section>

      {/* Suggested Chips Bar */}
      <div className="suggested-chips-scroll">
        <span className="chips-label">
          <Lightbulb size={14} /> Suggested Questions:
        </span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="suggestion-chip"
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="card chat-thread-card">
        <div className="messages-stream">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble-wrapper ${msg.sender === 'user' ? 'user-msg' : 'coach-msg'}`}
            >
              {msg.sender === 'coach' && (
                <div className="coach-avatar-bubble">
                  <Bot size={18} />
                </div>
              )}

              <div className="message-content">
                <div className="bubble-text">
                  {renderFormattedMessage(msg.text)}

                  {/* Render Action Cards */}
                  {msg.actionData &&
                    (msg.actionData.type === 'budget_created' ||
                      msg.actionData.type === 'budget_updated') && (
                      <div className="coach-budget-action-card">
                        <div className="budget-action-card-header">
                          <span className="budget-action-badge">
                            <CheckCircle size={13} />{' '}
                            {msg.actionData.type === 'budget_created'
                              ? 'Budget Created'
                              : 'Budget Updated'}
                          </span>
                          <span className="budget-action-category">
                            {msg.actionData.category}
                          </span>
                        </div>
                        <div className="budget-action-card-body">
                          <div className="budget-action-stat">
                            <span className="stat-label">Monthly Limit</span>
                            <span className="stat-value">
                              {formatMoney(msg.actionData.limit || 0)}
                            </span>
                          </div>
                          <div className="budget-action-stat">
                            <span className="stat-label">Spent to Date</span>
                            <span className="stat-value">
                              {formatMoney(msg.actionData.spent || 0)}
                            </span>
                          </div>
                          <div className="budget-action-stat">
                            <span className="stat-label">Remaining</span>
                            <span
                              className={`stat-value ${
                                (msg.actionData.remaining || 0) < 0
                                  ? 'text-danger'
                                  : 'text-success'
                              }`}
                            >
                              {formatMoney(msg.actionData.remaining || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="budget-action-card-footer">
                          <button
                            type="button"
                            className="secondary-btn small"
                            onClick={() => setActiveView('Budgets')}
                          >
                            View in Budgets <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    )}

                  {msg.actionData &&
                    msg.actionData.type === 'budget_plan_recommended' && (
                      <div className="coach-plan-action-card">
                        <div className="plan-action-header">
                          <h4>✨ Recommended Student Budget Breakdown</h4>
                          <p>Balanced against your monthly allowance</p>
                        </div>
                        <div className="plan-items-grid">
                          {msg.actionData.plan?.map((item, pIdx) => (
                            <div key={pIdx} className="plan-item-row">
                              <div className="plan-item-name">
                                <span className="plan-item-dot" />
                                <span>{item.category}</span>
                              </div>
                              <span className="plan-item-pct">{item.percentage}%</span>
                              <span className="plan-item-amt">
                                {formatMoney(item.limit)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="plan-action-footer">
                          <button
                            type="button"
                            className="primary-btn apply-plan-btn"
                            onClick={() => {
                              if (msg.actionData?.plan) {
                                applyBudgetPlan(msg.actionData.plan)
                                setAppliedPlanIds((prev) => [...prev, msg.id])
                              }
                            }}
                            disabled={appliedPlanIds.includes(msg.id)}
                          >
                            {appliedPlanIds.includes(msg.id) ? (
                              <>
                                <CheckCircle size={14} /> Plan Applied to Budgets!
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} /> Apply This Budget Plan Now
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="secondary-btn small"
                            onClick={() => setActiveView('Budgets')}
                          >
                            Open Budgets <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                </div>
                <small className="bubble-time">{msg.timestamp}</small>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="message-bubble-wrapper coach-msg">
              <div className="coach-avatar-bubble">
                <Bot size={18} />
              </div>
              <div className="message-content">
                <div className="bubble-text thinking-bubble">
                  <Sparkles size={16} className="spinning-sparkle" />
                  <span>Finwise is analyzing your transactions and budgets...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chat-composer-bar"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            placeholder="Ask anything or say 'Create a budget of ₹3,000 for Entertainment'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="primary-btn composer-send-btn"
            disabled={!input.trim() || isThinking}
            aria-label="Send query to AI coach"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {showApiKeyModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowApiKeyModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '16px',
          }}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1.2rem',
                }}
              >
                <Sparkles size={18} color="#6366f1" /> Connect Google Gemini AI
              </h3>
              <button
                type="button"
                className="secondary-btn small"
                onClick={() => setShowApiKeyModal(false)}
                style={{ padding: '4px 10px', fontSize: '1rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <p
              className="muted"
              style={{ fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}
            >
              FinWise features an instant built-in conversational student advisor that works 100% locally with zero latency. If you wish to connect live <strong>Google Gemini 1.5 Flash</strong>, paste your API key below:
            </p>
            <input
              type="password"
              placeholder="Paste your Gemini API key (AIzaSy...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="text-input"
              style={{
                width: '100%',
                marginBottom: '20px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {hasGeminiKey ? (
                <button
                  type="button"
                  className="secondary-btn small"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  onClick={() => {
                    localStorage.removeItem('finwise_gemini_api_key')
                    setApiKeyInput('')
                    setHasGeminiKey(false)
                    setShowApiKeyModal(false)
                  }}
                >
                  Remove Key
                </button>
              ) : (
                <span />
              )}
              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="secondary-btn small"
                  onClick={() => setShowApiKeyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn small"
                  onClick={saveApiKey}
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
