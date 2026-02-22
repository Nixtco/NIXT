'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProjectOverview from '@/components/Dashboard/ProjectOverview'
import AnalyticsDashboard from '@/components/Dashboard/AnalyticsDashboard'
import FinancialDashboard from '@/components/Dashboard/FinancialDashboard'
import SupportCenter from '@/components/Dashboard/SupportCenter'
import ContractDashboard from '@/components/Dashboard/ContractDashboard'
import DashboardSettings from '@/components/Dashboard/DashboardSettings'
import styles from '@/components/Dashboard/Dashboard.module.css'
import ThemeSwitcher from '@/components/UI/ThemeSwitcher'
import { useTheme } from '@/hooks/useTheme'
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage'
import { useGlobalAuth } from '@/lib/auth-context'

interface DashboardSection {
  id: string
  name: string
  component: React.ComponentType<any>
  enabled: boolean
}

interface DashboardSettingsType {
  refreshInterval: number
  enableNotifications: boolean
  defaultView: 'grid' | 'list'
  enabledSections: string[]
  currency: 'USD' | 'EUR' | 'SAR'
  timezone: string
}

function DashboardContent() {
  const router = useRouter()
  // Use translations hook
  const { t, language, setLanguage, dir } = useLanguage()
  const { user, isAuthenticated, isLoading, logout } = useGlobalAuth()
  
  const [showSettings, setShowSettings] = useState(false)
  
  const { nextTheme, setTheme, currentTheme } = useTheme()

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettingsType>({
    refreshInterval: 30000,
    enableNotifications: true,
    defaultView: 'grid',
    enabledSections: ['project'],
    currency: 'USD',
    timezone: 'UTC'
  })

  const sectionsList = [
    { id: 'project', component: ProjectOverview, nameKey: 'project' },
    { id: 'analytics', component: AnalyticsDashboard, nameKey: 'analytics' },
    { id: 'financial', component: FinancialDashboard, nameKey: 'financial' },
    { id: 'support', component: SupportCenter, nameKey: 'support' },
    { id: 'contract', component: ContractDashboard, nameKey: 'contract' },
  ]

  const [enabledSectionIds, setEnabledSectionIds] = useState<string[]>(
    ['project']
  )

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // All hooks are above — now we can do conditional returns

  // Show loading state while checking authentication
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

  // If not authenticated, return null (router will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  // Filter sections based on user permissions (you can customize this based on user.role)
  const availableSections = sectionsList

  const toggleSection = (sectionId: string) => {
    if (sectionId === 'contract') {
      router.push('/dashboard/contract')
      return
    }
    setEnabledSectionIds(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSettingsUpdate = (newSettings: DashboardSettingsType) => {
    setDashboardSettings(newSettings)
    setEnabledSectionIds(newSettings.enabledSections)
  }

  if (showSettings) {
    return (
      <div className={styles.dashboard} style={{ direction: dir }}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>{t.settings.title}</h1>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowSettings(false)}
          >
            {language === 'ar' ? 'العودة للداشبورد' : 'Back to Dashboard'}
          </button>
        </div>

        <DashboardSettings 
          settings={dashboardSettings}
          onSettingsUpdate={handleSettingsUpdate}
        />
      </div>
    )
  }

  return (
    <div className={styles.dashboard} style={{ direction: dir }}>
      <div className={styles.dashboardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 className={styles.dashboardTitle}>{t.dashboard.title}</h1>
          {/* Language Switcher */}
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className={styles.toggleBtn}
            style={{ fontSize: '0.9rem', padding: '6px 12px' }}
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>
        
        <div className={styles.headerControls}>
          {/* User Info */}
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

          <div className={styles.sectionsToggle}>
            {availableSections.map((section) => (
              <button
                key={section.id}
                className={`${styles.toggleBtn} ${section.id === 'contract' ? '' : enabledSectionIds.includes(section.id) ? styles.active : ''} ${section.id !== 'project' && section.id !== 'contract' ? styles.hiddenTab : ''}`}
                onClick={() => toggleSection(section.id)}
                disabled={section.id !== 'project' && section.id !== 'contract'}
                aria-hidden={section.id !== 'project' && section.id !== 'contract'}
              >
                {t.sections[section.nameKey as keyof typeof t.sections]}
              </button>
            ))}
          </div>
          
          <button
            className={styles.settingsBtn}
            onClick={() => setShowSettings(true)}
          >
            ⚙️ {t.dashboard.settings}
          </button>

          {/* Logout Button */}
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
        {availableSections.map((section) => {
          if (!enabledSectionIds.includes(section.id)) return null
          
          const Component = section.component
          return <Component key={section.id} />
        })}
      </div>

      {/* Demo Mode Indicator */}
      <div className={styles.apiStatus} style={language === 'ar' ? { left: '20px', right: 'auto' } : { right: '20px', left: 'auto' }}>
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot}></span>
          {t.dashboard.demoMode}
        </div>
      </div>

      <ThemeSwitcher 
        onThemeChange={nextTheme} 
        onSetTheme={setTheme} 
        currentTheme={currentTheme}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  )
}
