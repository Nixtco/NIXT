/**
 * Authentication Debug Utilities
 * أدوات للتحقق من المصادقة وتشخيص المشاكل
 */

export interface TokenPayload {
  user_id?: string
  email?: string
  role?: string
  permissions?: string[]
  iat?: number // Issued At
  exp?: number // Expiration
}

/**
 * فحص التوكن واستخراج البيانات منه
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('❌ Invalid token format')
      return null
    }

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.error('❌ Error decoding token:', error)
    return null
  }
}

/**
 * التحقق من صلاحية التوكن
 */
export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) {
    return false
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

/**
 * الحصول على التوكن من localStorage
 */
export function getAuthToken(): string | null {
  // Try auth_token first, then fallback to token
  return localStorage.getItem('auth_token') || localStorage.getItem('token')
}

/**
 * التحقق من المصادقة الكاملة
 */
export function checkAuth(): {
  isAuthenticated: boolean
  token: string | null
  payload: TokenPayload | null
  isValid: boolean
  isExpired: boolean
  expiresIn: number | null // seconds until expiration
  role: string | null
  permissions: string[]
} {
  const token = getAuthToken()
  
  if (!token) {
    return {
      isAuthenticated: false,
      token: null,
      payload: null,
      isValid: false,
      isExpired: false,
      expiresIn: null,
      role: null,
      permissions: []
    }
  }

  const payload = decodeToken(token)
  const isValid = isTokenValid(token)
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = payload?.exp ? payload.exp - now : null
  const isExpired = expiresIn !== null && expiresIn <= 0

  return {
    isAuthenticated: isValid,
    token,
    payload,
    isValid,
    isExpired,
    expiresIn,
    role: payload?.role || null,
    permissions: payload?.permissions || []
  }
}

/**
 * طباعة معلومات المصادقة في Console
 */
export function debugAuth(): void {
  console.group('🔐 Authentication Debug Info')
  
  const auth = checkAuth()
  
  console.log('Has Token:', !!auth.token)
  console.log('Is Authenticated:', auth.isAuthenticated)
  console.log('Is Valid:', auth.isValid)
  console.log('Is Expired:', auth.isExpired)
  
  if (auth.expiresIn !== null) {
    const minutes = Math.floor(auth.expiresIn / 60)
    const seconds = auth.expiresIn % 60
    console.log(`Expires In: ${minutes}m ${seconds}s`)
    
    if (auth.payload?.exp) {
      console.log('Expires At:', new Date(auth.payload.exp * 1000).toLocaleString())
    }
  }
  
  console.log('Role:', auth.role)
  console.log('Permissions:', auth.permissions)
  
  if (auth.payload) {
    console.log('User ID:', auth.payload.user_id)
    console.log('Email:', auth.payload.email)
    console.log('Full Payload:', auth.payload)
  }
  
  console.groupEnd()
}

/**
 * التحقق من صلاحية محددة
 */
export function hasPermission(permission: string): boolean {
  const auth = checkAuth()
  if (!auth.isAuthenticated) {
    return false
  }

  // Admin has all permissions
  if (auth.role === 'ADMIN') {
    return true
  }

  return auth.permissions.includes(permission)
}

/**
 * التحقق من دور المستخدم
 */
export function hasRole(role: string | string[]): boolean {
  const auth = checkAuth()
  if (!auth.isAuthenticated || !auth.role) {
    return false
  }

  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(auth.role)
}

/**
 * تحذير المستخدم قبل انتهاء التوكن
 */
export function setupTokenExpirationWarning(
  warningMinutes: number = 5,
  onWarning?: () => void
): NodeJS.Timeout | null {
  const auth = checkAuth()
  
  if (!auth.expiresIn) {
    return null
  }

  const warningTime = warningMinutes * 60 // convert to seconds
  const timeUntilWarning = auth.expiresIn - warningTime

  if (timeUntilWarning <= 0) {
    // Token expires soon or already expired
    if (onWarning) {
      onWarning()
    }
    return null
  }

  // Set timeout to warn before expiration
  return setTimeout(() => {
    console.warn(`⚠️ Token will expire in ${warningMinutes} minutes!`)
    if (onWarning) {
      onWarning()
    }
  }, timeUntilWarning * 1000)
}

/**
 * اختبار الاتصال بالـ API
 */
export async function testApiConnection(apiUrl?: string): Promise<{
  success: boolean
  status: number
  message: string
  hasPermissions: boolean
  permissions?: string[]
}> {
  const baseUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
  const token = getAuthToken()

  if (!token) {
    return {
      success: false,
      status: 0,
      message: 'No authentication token found',
      hasPermissions: false
    }
  }

  try {
    const response = await fetch(`${baseUrl}/projects/statistics`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'API connection successful' : data.message || data.error || 'API request failed',
      hasPermissions: response.ok,
      permissions: data.permissions
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
      hasPermissions: false
    }
  }
}

/**
 * اختبار اتصال WebSocket
 */
export async function testWebSocketConnection(wsUrl?: string): Promise<{
  success: boolean
  message: string
  latency?: number
}> {
  const baseUrl = wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
  const token = getAuthToken()

  if (!token) {
    return {
      success: false,
      message: 'No authentication token found'
    }
  }

  return new Promise((resolve) => {
    const startTime = Date.now()
    const wsTestUrl = `${baseUrl}/ws/chat?token=${token}`
    
    try {
      const ws = new WebSocket(wsTestUrl)
      
      const timeout = setTimeout(() => {
        ws.close()
        resolve({
          success: false,
          message: 'WebSocket connection timeout'
        })
      }, 5000)

      ws.onopen = () => {
        const latency = Date.now() - startTime
        clearTimeout(timeout)
        ws.close()
        resolve({
          success: true,
          message: 'WebSocket connection successful',
          latency
        })
      }

      ws.onerror = (error) => {
        clearTimeout(timeout)
        resolve({
          success: false,
          message: 'WebSocket connection failed'
        })
      }
    } catch (error) {
      resolve({
        success: false,
        message: error instanceof Error ? error.message : 'WebSocket connection error'
      })
    }
  })
}

/**
 * تشغيل جميع الاختبارات
 */
export async function runAllTests(): Promise<void> {
  console.group('🧪 Running Authentication Tests')
  
  // Test 1: Token validation
  console.log('\n1️⃣ Token Validation')
  debugAuth()
  
  // Test 2: API connection
  console.log('\n2️⃣ API Connection Test')
  const apiTest = await testApiConnection()
  console.log('Status:', apiTest.status)
  console.log('Success:', apiTest.success)
  console.log('Message:', apiTest.message)
  console.log('Has Permissions:', apiTest.hasPermissions)
  
  // Test 3: WebSocket connection
  console.log('\n3️⃣ WebSocket Connection Test')
  const wsTest = await testWebSocketConnection()
  console.log('Success:', wsTest.success)
  console.log('Message:', wsTest.message)
  if (wsTest.latency) {
    console.log('Latency:', wsTest.latency, 'ms')
  }
  
  console.groupEnd()
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    checkAuth,
    debugAuth,
    hasPermission,
    hasRole,
    testApiConnection,
    testWebSocketConnection,
    runAllTests
  }
}
