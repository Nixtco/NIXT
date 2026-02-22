/**
 * @deprecated This component is no longer used in the application.
 * The app now uses the global authentication system (useGlobalAuth) instead.
 * All pages have been updated to redirect to /login page.
 * 
 * This file is kept for reference only and may be removed in future cleanup.
 */

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, AllowedUser } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import styles from './DashboardLogin.module.css'

interface DashboardLoginProps {
  onLoginSuccess: () => void
  /** Where the login page is being shown from */
  context?: 'dashboard' | 'controllers' | 'global'
}

export default function DashboardLogin({ onLoginSuccess, context = 'dashboard' }: DashboardLoginProps) {
  const { t, language, setLanguage, dir } = useLanguage()
  const { loginToDashboard, loginToDashboardWithRole } = useAuth()
  const router = useRouter()
  const isRTL = language === 'ar'

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Role selection state
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<AllowedUser[]>([])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const navigateByRole = (role: string) => {
    if (context === 'global') {
      // Coming from homepage login - route based on role
      if (role === 'manager') {
        router.push('/controllers')
      } else {
        router.push('/dashboard')
      }
    } else {
      // Already on the target page, just refresh
      onLoginSuccess()
    }
  }

  const handleRoleSelect = async (role: string) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = loginToDashboardWithRole(email.trim(), role)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigateByRole(role)
      }, 1000)
    } else {
      setError(t.login.noAccess)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError(t.login.invalidEmail)
      return
    }

    if (!validateEmail(email)) {
      setError(t.login.invalidEmail)
      return
    }

    setIsLoading(true)

    // Simulate slight delay for UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const result = loginToDashboard(email.trim())

    if (result.success) {
      setSuccess(true)
      // Determine where to go based on the logged-in role
      const loggedRole = result.message === 'LOGIN_SUCCESS' ? (() => {
        // Get the role from the session
        const roles = result.roles
        return roles && roles.length > 0 ? roles[0].role : 'client'
      })() : 'client'
      
      setTimeout(() => {
        if (context === 'global') {
          // Get role from session
          const storedSession = localStorage.getItem('nixt-dashboard-session')
          if (storedSession) {
            const session = JSON.parse(storedSession)
            navigateByRole(session.role)
          } else {
            onLoginSuccess()
          }
        } else {
          onLoginSuccess()
        }
      }, 1000)
    } else if (result.message === 'MULTIPLE_ROLES' && result.roles) {
      // User has multiple roles - show role picker
      setAvailableRoles(result.roles)
      setShowRolePicker(true)
      setIsLoading(false)
      return
    } else {
      switch (result.message) {
        case 'EMAIL_NOT_FOUND':
          setError(t.login.emailNotFound)
          break
        case 'ACCOUNT_DISABLED':
          setError(t.login.accountDisabled)
          break
        default:
          setError(t.login.noAccess)
      }
    }

    setIsLoading(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      case 'manager':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        )
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return '#7042f8'
      case 'manager': return '#0070F3'
      default: return '#666'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'client': return isRTL ? 'عميل' : 'Client'
      case 'manager': return isRTL ? 'مسؤول' : 'Manager'
      case 'viewer': return isRTL ? 'مشاهد' : 'Viewer'
      default: return role
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'client': return isRTL ? 'الدخول إلى لوحة التحكم لمتابعة المشاريع والتقارير' : 'Go to Dashboard to follow projects and reports'
      case 'manager': return isRTL ? 'الدخول إلى لوحة التحكم الإدارية مع صلاحيات كاملة' : 'Go to Admin Controllers with full permissions'
      case 'viewer': return isRTL ? 'الدخول كمشاهد للاطلاع فقط' : 'Enter as a viewer for read-only access'
      default: return ''
    }
  }

  return (
    <div className={styles.loginPage} style={{ direction: dir }}>
      {/* Background Effects */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.loginContainer}>
        {/* Language Toggle */}
        <button
          className={styles.langBtn}
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        >
          {language === 'ar' ? 'EN' : 'ع'}
        </button>

        {/* Logo/Brand */}
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h1 className={styles.loginTitle}>
            {showRolePicker 
              ? (isRTL ? 'اختر طريقة الدخول' : 'Choose Access Type')
              : t.login.title
            }
          </h1>
          <p className={styles.loginSubtitle}>
            {showRolePicker
              ? (isRTL ? 'لديك أكثر من صلاحية. اختر المكان الذي تريد الذهاب إليه' : 'You have multiple roles. Choose where you want to go')
              : t.login.subtitle
            }
          </p>
        </div>

        {/* Role Picker */}
        {showRolePicker ? (
          <div className={styles.rolePicker}>
            {availableRoles.map((roleUser) => (
              <button
                key={roleUser.role}
                className={styles.roleCard}
                onClick={() => handleRoleSelect(roleUser.role)}
                disabled={isLoading || success}
                style={{ '--role-color': getRoleColor(roleUser.role) } as React.CSSProperties}
              >
                <div className={styles.roleIconWrapper} style={{ background: `linear-gradient(135deg, ${getRoleColor(roleUser.role)}, ${getRoleColor(roleUser.role)}88)` }}>
                  {getRoleIcon(roleUser.role)}
                </div>
                <div className={styles.roleInfo}>
                  <span className={styles.roleBadge} style={{ backgroundColor: getRoleColor(roleUser.role) }}>
                    {getRoleName(roleUser.role)}
                  </span>
                  <p className={styles.roleDescription}>
                    {getRoleDescription(roleUser.role)}
                  </p>
                </div>
                <div className={styles.roleArrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points={isRTL ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
                  </svg>
                </div>
              </button>
            ))}

            {success && (
              <div className={styles.successMessage}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t.login.loginSuccess}
              </div>
            )}

            <button
              className={styles.backLink}
              onClick={() => {
                setShowRolePicker(false)
                setAvailableRoles([])
                setError('')
              }}
              style={{ marginTop: '1rem', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
            >
              ← {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </button>
          </div>
        ) : (
          <>
            {/* Login Form */}
            <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>{t.login.email}</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder={t.login.emailPlaceholder}
                className={styles.loginInput}
                disabled={isLoading || success}
                autoFocus
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {t.login.loginSuccess}
            </div>
          )}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading || success}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : success ? (
              '✓'
            ) : (
              t.login.loginBtn
            )}
          </button>
        </form>

        {/* Contact Admin Notice */}
        <div className={styles.contactNotice}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{t.login.contactAdmin}</span>
        </div>

        {/* Back to Home */}
        <a href="/" className={styles.backLink}>
          ← {t.login.backToHome}
        </a>
          </>
        )}
      </div>
    </div>
  )
}
