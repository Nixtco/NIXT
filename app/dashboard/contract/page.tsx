'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ContractDashboard from '@/components/Dashboard/ContractDashboard'
import styles from '@/components/Dashboard/Dashboard.module.css'
import ThemeSwitcher from '@/components/UI/ThemeSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage'
import { useGlobalAuth } from '@/lib/auth-context'

function ContractPageContent() {
  const router = useRouter()
  const { t, language, setLanguage, dir } = useLanguage()
  const { user, isAuthenticated, isLoading, logout } = useGlobalAuth()
  const { nextTheme, setTheme, currentTheme } = useTheme()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className={styles.dashboard} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className={styles.dashboard} style={{ direction: dir }}>
      <div className={styles.dashboardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 className={styles.dashboardTitle}>
            {t.sections.contract}
          </h1>
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className={styles.toggleBtn}
            style={{ fontSize: '0.9rem', padding: '6px 12px' }}
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>
        
        <div className={styles.headerControls}>
          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '6px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '0.85rem',
              color: 'var(--text-dim)'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#00C781',
                display: 'inline-block'
              }} />
              <span>{user.display_name || user.email}</span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span style={{ color: '#7042f8', fontWeight: 600 }}>{user.role}</span>
            </div>
          )}

          <button
            className={styles.toggleBtn}
            onClick={() => router.push('/dashboard')}
          >
            {language === 'ar' ? '← العودة للداشبورد' : '← Back to Dashboard'}
          </button>

          <button
            className={styles.settingsBtn}
            onClick={() => {
              logout()
              router.push('/login')
            }}
            style={{ 
              background: 'rgba(255, 68, 68, 0.1)', 
              borderColor: 'rgba(255, 68, 68, 0.2)',
              color: '#ff6b6b'
            }}
          >
            {t.login.logout}
          </button>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <ContractDashboard />
      </div>

      <ThemeSwitcher 
        onThemeChange={nextTheme} 
        onSetTheme={setTheme} 
        currentTheme={currentTheme}
      />
    </div>
  )
}

export default function ContractPage() {
  return (
    <LanguageProvider>
      <ContractPageContent />
    </LanguageProvider>
  )
}
