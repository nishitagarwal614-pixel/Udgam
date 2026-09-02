import React from 'react'
import {
  LayoutDashboard,
  History,
  Camera,
  Target,
  Bot,
} from 'lucide-react'
import { useFinancial } from '../context/FinancialContext'

interface MobileNavProps {
  onOpenScanner: () => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenScanner }) => {
  const { activeView, setActiveView } = useFinancial()

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <button
        type="button"
        className={`mobile-nav-tab ${activeView === 'Overview' ? 'active' : ''}`}
        onClick={() => setActiveView('Overview')}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-tab ${activeView === 'History' ? 'active' : ''}`}
        onClick={() => setActiveView('History')}
      >
        <History size={20} />
        <span>History</span>
      </button>

      <button
        type="button"
        className="mobile-nav-scan-cta"
        onClick={onOpenScanner}
        aria-label="Scan receipt"
      >
        <div className="scan-circle">
          <Camera size={22} />
        </div>
        <span>Scan</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-tab ${activeView === 'Goals' ? 'active' : ''}`}
        onClick={() => setActiveView('Goals')}
      >
        <Target size={20} />
        <span>Goals</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-tab ${activeView === 'AI Coach' ? 'active' : ''}`}
        onClick={() => setActiveView('AI Coach')}
      >
        <Bot size={20} />
        <span>Coach</span>
      </button>
    </nav>
  )
}
