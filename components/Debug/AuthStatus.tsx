'use client'

import { useState, useEffect } from 'react'
import { checkAuth, testApiConnection, testWebSocketConnection } from '@/utils/authDebug'
import styles from './AuthStatus.module.css'

interface AuthStatusProps {
  showDetails?: boolean
  autoTest?: boolean
}

export default function AuthStatus({ showDetails = false, autoTest = false }: AuthStatusProps) {
  const [auth, setAuth] = useState(checkAuth())
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [wsStatus, setWsStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [expanded, setExpanded] = useState(showDetails)

  useEffect(() => {
    // Refresh auth status every 10 seconds
    const interval = setInterval(() => {
      setAuth(checkAuth())
    }, 10000)

    // Run auto tests if enabled
    if (autoTest) {
      runTests()
    }

    return () => clearInterval(interval)
  }, [autoTest])

  const runTests = async () => {
    // Test API
    setApiStatus('testing')
    const apiTest = await testApiConnection()
    setApiStatus(apiTest.success ? 'success' : 'error')

    // Test WebSocket
    setWsStatus('testing')
    const wsTest = await testWebSocketConnection()
    setWsStatus(wsTest.success ? 'success' : 'error')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing': return '⏳'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '⚪'
    }
  }

  const getStatusColor = (isGood: boolean) => {
    return isGood ? 'var(--success-color, #22c55e)' : 'var(--error-color, #ef4444)'
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'N/A'
    if (seconds < 0) return 'Expired'
    
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
    
    return `${minutes}m ${secs}s`
  }

  if (!expanded) {
    return (
      <div className={styles.compact} onClick={() => setExpanded(true)}>
        <span className={styles.indicator} style={{ 
          backgroundColor: auth.isAuthenticated ? getStatusColor(true) : getStatusColor(false)
        }} />
        <span className={styles.role}>{auth.role || 'Not authenticated'}</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🔐 Authentication Status</h3>
        <button className={styles.closeBtn} onClick={() => setExpanded(false)}>×</button>
      </div>

      <div className={styles.content}>
        {/* Basic Status */}
        <div className={styles.section}>
          <div className={styles.row}>
            <span className={styles.label}>Status:</span>
            <span className={styles.value} style={{ 
              color: getStatusColor(auth.isAuthenticated)
            }}>
              {auth.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Token:</span>
            <span className={styles.value}>
              {auth.token ? '✅ Present' : '❌ Missing'}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Valid:</span>
            <span className={styles.value} style={{ 
              color: getStatusColor(auth.isValid)
            }}>
              {auth.isValid ? '✅ Yes' : '❌ No'}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>Expired:</span>
            <span className={styles.value} style={{ 
              color: getStatusColor(!auth.isExpired)
            }}>
              {auth.isExpired ? '❌ Yes' : '✅ No'}
            </span>
          </div>
        </div>

        {/* User Info */}
        {auth.payload && (
          <div className={styles.section}>
            <h4>👤 User Information</h4>
            
            <div className={styles.row}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{auth.payload.email || 'N/A'}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Role:</span>
              <span className={styles.value} style={{ 
                fontWeight: 'bold',
                color: auth.role === 'ADMIN' ? '#3b82f6' : auth.role === 'CONTROLLER' ? '#8b5cf6' : '#6b7280'
              }}>
                {auth.role || 'N/A'}
              </span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>User ID:</span>
              <span className={styles.value} style={{ fontSize: '0.85em', fontFamily: 'monospace' }}>
                {auth.payload.user_id || 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Token Expiration */}
        {auth.expiresIn !== null && (
          <div className={styles.section}>
            <h4>⏰ Token Expiration</h4>
            
            <div className={styles.row}>
              <span className={styles.label}>Expires In:</span>
              <span className={styles.value} style={{ 
                color: auth.expiresIn < 300 ? getStatusColor(false) : getStatusColor(true)
              }}>
                {formatTime(auth.expiresIn)}
              </span>
            </div>

            {auth.payload?.exp && (
              <div className={styles.row}>
                <span className={styles.label}>Expires At:</span>
                <span className={styles.value} style={{ fontSize: '0.85em' }}>
                  {new Date(auth.payload.exp * 1000).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Permissions */}
        {auth.permissions.length > 0 && (
          <div className={styles.section}>
            <h4>🔑 Permissions ({auth.permissions.length})</h4>
            <div className={styles.permissions}>
              {auth.permissions.map((perm) => (
                <span key={perm} className={styles.permissionBadge}>
                  {perm}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connection Tests */}
        <div className={styles.section}>
          <h4>🔌 Connection Status</h4>
          
          <div className={styles.row}>
            <span className={styles.label}>API:</span>
            <span className={styles.value}>
              {getStatusIcon(apiStatus)} {apiStatus}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>WebSocket:</span>
            <span className={styles.value}>
              {getStatusIcon(wsStatus)} {wsStatus}
            </span>
          </div>

          <button className={styles.testBtn} onClick={runTests}>
            🧪 Run Tests
          </button>
        </div>
      </div>
    </div>
  )
}
