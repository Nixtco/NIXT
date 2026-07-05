import { FC, useRef } from 'react'
import styles from './Stats.module.css'
import { useLanguage } from '@/hooks/useLanguage'
import { useCountUp } from '@/hooks/useCountUp'

interface StatCardProps {
  value: string
  label: string
  prefix?: string
  suffix?: string
  icon: React.ReactNode
}

const StatCard: FC<StatCardProps> = ({ value, label, prefix, suffix, icon }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Parse the number for animation
  const numericValue = parseInt(value, 10)
  const count = useCountUp(isNaN(numericValue) ? 0 : numericValue, 2500)
  
  // Format the display value (pad with 0 if original had it, like '07')
  const displayValue = isNaN(numericValue) 
    ? value 
    : (value.startsWith('0') && count < 10 ? `0${count}` : count)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div 
      className={styles.statCard} 
      ref={cardRef}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.statIcon}>
        {icon}
      </div>
      <div className={styles.statValueWrapper}>
        {prefix && <span className={styles.statPrefix}>{prefix}</span>}
        <span className={styles.statValue}>{displayValue}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

const StatsSection: FC = () => {
  const { t } = useLanguage()

  const stats = [
    { 
      value: '07', 
      label: (t as any).stats?.projects || 'Major Projects',
      suffix: '',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    { 
      value: '30', 
      label: (t as any).stats?.countries || 'Countries Globally',
      suffix: '+',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      )
    },
    { 
      value: '15', 
      label: (t as any).stats?.revenue || 'Revenue Generated',
      prefix: '+',
      suffix: 'K',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    }
  ]


  return (
    <section className={styles.statsContainer} id="stats">
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </section>
  )
}

export default StatsSection
