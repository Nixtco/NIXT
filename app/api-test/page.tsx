'use client'

import { useState } from 'react'

export default function APITestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    // Test 1: Check environment variables
    testResults.env = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV
    }

    // Test 2: Check localStorage
    testResults.localStorage = {
      hasToken: !!localStorage.getItem('token'),
      token: localStorage.getItem('token')?.substring(0, 20) + '...',
      hasRefreshToken: !!localStorage.getItem('refreshToken')
    }

    // Test 3: Test API connection
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
      const token = localStorage.getItem('token')

      // Test auth/me
      const meResponse = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      testResults.authMe = {
        status: meResponse.status,
        ok: meResponse.ok,
        data: meResponse.ok ? await meResponse.json() : null
      }

      // Test projects endpoint if user exists
      if (testResults.authMe.ok && testResults.authMe.data?.user?.id) {
        const userId = testResults.authMe.data.user.id
        const projectsResponse = await fetch(`${apiUrl}/projects/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        testResults.projects = {
          status: projectsResponse.status,
          ok: projectsResponse.ok,
          data: projectsResponse.ok ? await projectsResponse.json() : null
        }
      }
    } catch (error: any) {
      testResults.apiError = {
        message: error.message,
        stack: error.stack
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'monospace'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        background: '#1a1a2e', 
        borderRadius: '16px', 
        padding: '40px',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>🔧 API Test Page</h1>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>
          Test your API connection and authentication
        </p>

        <button
          onClick={runTests}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '30px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Running Tests...' : '▶️ Run Tests'}
        </button>

        {Object.keys(results).length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', marginTop: '40px' }}>
              📊 Test Results
            </h2>

            {/* Environment Variables */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#667eea' }}>
                🌍 Environment Variables
              </h3>
              <pre style={{ 
                background: '#0d1117', 
                padding: '15px', 
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.9rem'
              }}>
                {JSON.stringify(results.env, null, 2)}
              </pre>
              <div style={{ marginTop: '10px', padding: '10px', background: results.env?.apiUrl !== 'NOT SET' ? '#1e4d2b' : '#7c2d12', borderRadius: '8px' }}>
                {results.env?.apiUrl !== 'NOT SET' ? '✅ API URL is configured' : '❌ API URL is NOT configured'}
              </div>
            </div>

            {/* LocalStorage */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#667eea' }}>
                💾 LocalStorage
              </h3>
              <pre style={{ 
                background: '#0d1117', 
                padding: '15px', 
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.9rem'
              }}>
                {JSON.stringify(results.localStorage, null, 2)}
              </pre>
              <div style={{ marginTop: '10px', padding: '10px', background: results.localStorage?.hasToken ? '#1e4d2b' : '#7c2d12', borderRadius: '8px' }}>
                {results.localStorage?.hasToken ? '✅ Token exists' : '❌ Token is missing - Please login'}
              </div>
            </div>

            {/* Auth/Me Test */}
            {results.authMe && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#667eea' }}>
                  👤 /auth/me Test
                </h3>
                <pre style={{ 
                  background: '#0d1117', 
                  padding: '15px', 
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '0.9rem',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(results.authMe, null, 2)}
                </pre>
                <div style={{ marginTop: '10px', padding: '10px', background: results.authMe?.ok ? '#1e4d2b' : '#7c2d12', borderRadius: '8px' }}>
                  {results.authMe?.ok ? `✅ Authentication successful - User: ${results.authMe.data?.user?.email}` : `❌ Authentication failed - Status: ${results.authMe?.status}`}
                </div>
              </div>
            )}

            {/* Projects Test */}
            {results.projects && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#667eea' }}>
                  📦 /projects/user/:userId Test
                </h3>
                <pre style={{ 
                  background: '#0d1117', 
                  padding: '15px', 
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '0.9rem',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(results.projects, null, 2)}
                </pre>
                <div style={{ marginTop: '10px', padding: '10px', background: results.projects?.ok ? '#1e4d2b' : '#7c2d12', borderRadius: '8px' }}>
                  {results.projects?.ok ? `✅ Projects loaded successfully - Count: ${results.projects.data?.count || 0}` : `❌ Projects loading failed - Status: ${results.projects?.status}`}
                </div>
              </div>
            )}

            {/* API Error */}
            {results.apiError && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#dc2626' }}>
                  ❌ API Error
                </h3>
                <pre style={{ 
                  background: '#7c2d12', 
                  padding: '15px', 
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '0.9rem',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(results.apiError, null, 2)}
                </pre>
                <div style={{ marginTop: '10px', padding: '10px', background: '#7c2d12', borderRadius: '8px' }}>
                  💡 Tip: Make sure Backend server is running on port 3003
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ marginTop: '40px', padding: '20px', background: '#1e3a8a', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>📋 Summary</h3>
              <ul style={{ lineHeight: '2' }}>
                <li>{results.env?.apiUrl !== 'NOT SET' ? '✅' : '❌'} Environment configured</li>
                <li>{results.localStorage?.hasToken ? '✅' : '❌'} User logged in</li>
                <li>{results.authMe?.ok ? '✅' : '❌'} Authentication working</li>
                <li>{results.projects?.ok ? '✅' : '❌'} Projects API working</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
