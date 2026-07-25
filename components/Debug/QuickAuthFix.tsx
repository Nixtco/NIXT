'use client'

import { useState, useEffect } from 'react'

/**
 * مكون بسيط لإصلاح مشكلة التوكن بنقرة واحدة
 * Simple component to fix token issue with one click
 */
export default function QuickAuthFix() {
  const [hasIssue, setHasIssue] = useState(false)
  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const authToken = localStorage.getItem('auth_token')
    
    // Check if there's a mismatch
    if (token && !authToken) {
      setHasIssue(true)
    }
  }, [])

  const handleFix = () => {
    const token = localStorage.getItem('token')
    if (token) {
      localStorage.setItem('auth_token', token)
      setFixed(true)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  if (!hasIssue || fixed) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      zIndex: 99999,
      maxWidth: '350px',
      animation: 'slideIn 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>⚠️</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
            Authentication Issue Detected
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', opacity: 0.9, lineHeight: 1.5 }}>
            Token sync issue found. Click below to fix automatically.
          </p>
          <button
            onClick={handleFix}
            style={{
              width: '100%',
              padding: '10px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {fixed ? '✅ Fixed! Reloading...' : '🔧 Fix Now'}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
