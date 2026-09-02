import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  Trash2,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface ChatMessage {
  id: string
  sender: 'user' | 'coach'
  text: string
  timestamp: string
}

let messageCounter = 1

export const AiCoachView: React.FC = () => {
  const { askAiCoach, formatMoney, currentBalance, safeToSpend } = useFinancial()

  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'coach',
      text: `Hello Arjun! I have analyzed your September cashflow. You have ${formatMoney(currentBalance)} in your account, and your Safe to Spend limit for today is ${formatMoney(safeToSpend.safeDaily)}. What financial decision or question can I help you with?`,
      timestamp: 'Today, 9:00 AM',
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

    const userMsg: ChatMessage = {
      id: `msg-${++messageCounter}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, userMsg])
    if (!queryText) setInput('')
    setIsThinking(true)

    try {
      const response = await askAiCoach(textToSend)
      const coachMsg: ChatMessage = {
        id: `msg-${++messageCounter}`,
        sender: 'coach',
        text: response,
        timestamp: 'Just now',
      }
      setMessages((prev) => [...prev, coachMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-${++messageCounter}`,
        sender: 'coach',
        text: 'I ran into a problem crunching your numbers. Please ask again.',
        timestamp: 'Just now',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsThinking(false)
    }
  }

  const suggestionChips = [
    'Where did most of my money go?',
    'How much did I spend on food this month?',
    'Can I spend ₹500 today?',
    'How much can I save this month?',
    'What should I cut to save ₹2,000?',
    'Why did my financial score change?',
    'How much will I have at the end of the month?',
    'How is my laptop goal pacing?',
  ]

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        sender: 'coach',
        text: `Fresh slate! I'm here with your live balance of ${formatMoney(currentBalance)}. Ask me anything.`,
        timestamp: 'Just now',
      },
    ])
  }

  return (
    <div className="ai-coach-view">
      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR PERSONAL STUDENT ADVISOR</p>
          <h1>Finwise AI Coach</h1>
          <p className="muted">
            Directly connected to your live transactions, budgets, and savings goals.
          </p>
        </div>

        <button
          type="button"
          className="secondary-btn small"
          onClick={clearChat}
          title="Reset conversation"
        >
          <Trash2 size={14} /> Clear chat
        </button>
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
                  {/* Render formatted message with newlines */}
                  {msg.text.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('**').map((part, bIdx) =>
                        bIdx % 2 === 1 ? <strong key={bIdx}>{part}</strong> : part
                      )}
                    </p>
                  ))}
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
            placeholder="Ask your coach anything about your money, budget, or savings..."
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
    </div>
  )
}
