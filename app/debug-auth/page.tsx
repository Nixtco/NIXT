'use client'

import { useState, useEffect } from 'react'
import { useGlobalAuth } from '@/lib/auth-context'
import { checkAuth, testApiConnection, testWebSocketConnection } from '@/utils/authDebug'

export const dynamic = 'force-dynamic'

export default function DebugAuthPage() {
  const globalAuth = useGlobalAuth()
  const [localAuth, setLocalAuth] = useState<any>(null)
  const [apiTest, setApiTest] = useState<any>(null)
  const [wsTest, setWsTest] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLocalAuth(checkAuth())
  }, [])

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px 20px' }}>Loading...</div>
  }

  const runTests = async () => {
    setTesting(true)
    
    // Test API
    const api = await testApiConnection()
    setApiTest(api)
    
    // Test WebSocket
    const ws = await testWebSocketConnection()
    setWsTest(ws)
    
    setTesting(false)
  }

  const syncTokens = () => {
    const token = localStorage.getItem('token')
    if (token) {
      localStorage.setItem('auth_token', token)
      alert('✅ Synced! token copied to auth_token')
      setLocalAuth(checkAuth())
    } else {
      alert('❌ No token found in localStorage')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      padding: '40px 20px',
      fontFamily: 'monospace'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>
          🔐 Authentication Debug Panel
        </h1>

        {/* Global Auth Context */}
        <section style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#4ade80' }}>
            📦 Global Auth Context (from useGlobalAuth)
          </h2>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <span style={{ color: '#888' }}>Is Authenticated:</span>{' '}
              <span style={{ color: globalAuth.isAuthenticated ? '#4ade80' : '#f87171' }}>
                {globalAuth.isAuthenticated ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Is Loading:</span>{' '}
              <span>{globalAuth.isLoading ? '⏳' : '✅'}</span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>User Email:</span>{' '}
              <span style={{ color: '#60a5fa' }}>{globalAuth.user?.email || 'N/A'}</span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Role:</span>{' '}
              <span style={{ 
                color: globalAuth.user?.role === 'admin' || globalAuth.user?.role === 'owner' ? '#a78bfa' : '#fbbf24' 
              }}>
                {globalAuth.user?.role || 'N/A'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Is Admin:</span>{' '}
              <span style={{ color: globalAuth.isAdmin ? '#4ade80' : '#f87171' }}>
                {globalAuth.isAdmin ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Is Owner:</span>{' '}
              <span style={{ color: globalAuth.isOwner ? '#4ade80' : '#f87171' }}>
                {globalAuth.isOwner ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Has Token:</span>{' '}
              <span style={{ color: globalAuth.token ? '#4ade80' : '#f87171' }}>
                {globalAuth.token ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Permissions:</span>{' '}
              <span style={{ color: '#fbbf24' }}>
                {globalAuth.user?.permissions?.length || 0} permissions
              </span>
            </div>
            
            {globalAuth.user?.permissions && globalAuth.user.permissions.length > 0 && (
              <div style={{ 
                marginTop: '8px', 
                padding: '12px', 
                background: '#0a0a0a',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {globalAuth.user.permissions.map((perm) => (
                  <span key={perm} style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    margin: '4px',
                    background: '#1e293b',
                    borderRadius: '4px',
                    color: '#94a3b8'
                  }}>
                    {perm}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Local Storage Tokens */}
        <section style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#60a5fa' }}>
            💾 localStorage Tokens
          </h2>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <span style={{ color: '#888' }}>token:</span>{' '}
              <span style={{ 
                color: localStorage.getItem('token') ? '#4ade80' : '#f87171',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>auth_token:</span>{' '}
              <span style={{ 
                color: localStorage.getItem('auth_token') ? '#4ade80' : '#f87171',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={syncTokens}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Sync token → auth_token
              </button>
            </div>
          </div>
        </section>

        {/* Decoded Token Info */}
        <section style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#f59e0b' }}>
            🔍 Decoded Token Information
          </h2>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <span style={{ color: '#888' }}>Has Token:</span>{' '}
              <span style={{ color: localAuth.token ? '#4ade80' : '#f87171' }}>
                {localAuth.token ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Is Valid:</span>{' '}
              <span style={{ color: localAuth.isValid ? '#4ade80' : '#f87171' }}>
                {localAuth.isValid ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div>
              <span style={{ color: '#888' }}>Is Expired:</span>{' '}
              <span style={{ color: localAuth.isExpired ? '#f87171' : '#4ade80' }}>
                {localAuth.isExpired ? '❌ Yes' : '✅ No'}
              </span>
            </div>
            
            {localAuth.expiresIn !== null && (
              <div>
                <span style={{ color: '#888' }}>Expires In:</span>{' '}
                <span style={{ 
                  color: localAuth.expiresIn < 300 ? '#f87171' : '#4ade80' 
                }}>
                  {Math.floor(localAuth.expiresIn / 60)}m {localAuth.expiresIn % 60}s
                </span>
              </div>
            )}
            
            {localAuth.payload && (
              <>
                <div>
                  <span style={{ color: '#888' }}>User ID:</span>{' '}
                  <span style={{ fontSize: '12px' }}>{localAuth.payload.user_id}</span>
                </div>
                
                <div>
                  <span style={{ color: '#888' }}>Email:</span>{' '}
                  <span style={{ color: '#60a5fa' }}>{localAuth.payload.email}</span>
                </div>
                
                <div>
                  <span style={{ color: '#888' }}>Role:</span>{' '}
                  <span style={{ color: '#a78bfa' }}>{localAuth.payload.role}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Connection Tests */}
        <section style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#ec4899' }}>
            🧪 Connection Tests
          </h2>
          
          <button
            onClick={runTests}
            disabled={testing}
            style={{
              padding: '12px 24px',
              background: testing ? '#374151' : '#ec4899',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: testing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              marginBottom: '16px'
            }}
          >
            {testing ? '⏳ Testing...' : '▶️ Run Tests'}
          </button>
          
          {apiTest && (
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              background: '#0a0a0a',
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                API Test Results:
              </div>
              <div style={{ display: 'grid', gap: '4px', fontSize: '14px' }}>
                <div>
                  Status: <span style={{ 
                    color: apiTest.success ? '#4ade80' : '#f87171' 
                  }}>
                    {apiTest.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                <div>Status Code: {apiTest.status}</div>
                <div>Message: {apiTest.message}</div>
                <div>
                  Has Permissions: <span style={{ 
                    color: apiTest.hasPermissions ? '#4ade80' : '#f87171' 
                  }}>
                    {apiTest.hasPermissions ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {wsTest && (
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              background: '#0a0a0a',
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                WebSocket Test Results:
              </div>
              <div style={{ display: 'grid', gap: '4px', fontSize: '14px' }}>
                <div>
                  Status: <span style={{ 
                    color: wsTest.success ? '#4ade80' : '#f87171' 
                  }}>
                    {wsTest.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                <div>Message: {wsTest.message}</div>
                {wsTest.latency && <div>Latency: {wsTest.latency}ms</div>}
              </div>
            </div>
          )}
        </section>

        {/* Instructions */}
        <section style={{
          background: '#1e293b',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#fbbf24' }}>
            📝 Instructions
          </h2>
          
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>If you see "❌ لا يوجد token للمصادقة":</strong>
            </p>
            <ol style={{ marginLeft: '20px', marginBottom: '12px' }}>
              <li>Check if "token" exists in localStorage above</li>
              <li>Click "🔄 Sync token → auth_token" button</li>
              <li>Refresh the page</li>
            </ol>
            
            <p style={{ marginBottom: '12px' }}>
              <strong>If you see "403 Forbidden":</strong>
            </p>
            <ol style={{ marginLeft: '20px', marginBottom: '12px' }}>
              <li>Check if "Role" shows "admin" or "owner"</li>
              <li>Check if "Is Admin" is ✅ Yes</li>
              <li>Run the connection tests</li>
              <li>Check permissions in database</li>
            </ol>
            
            <p style={{ marginBottom: '12px' }}>
              <strong>Backend Check:</strong>
            </p>
            <pre style={{ 
              background: '#0a0a0a', 
              padding: '12px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
{`-- Run this SQL to fix permissions:
SELECT id, email, role FROM users WHERE email = 'your-email';
UPDATE users SET role = 'admin' WHERE email = 'your-email';`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}
