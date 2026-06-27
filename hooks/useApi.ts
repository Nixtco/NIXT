'use client'

import { useState, useEffect } from 'react'

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function buildApiUrl(endpoint: string, baseUrl?: string): string {
  const normalizedBaseUrl = (baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1').replace(/\/$/, '')
  const normalizedEndpoint = endpoint.startsWith('/api/v1')
    ? endpoint.replace(/^\/api\/v1/, '') || '/'
    : endpoint

  return `${normalizedBaseUrl}${normalizedEndpoint.startsWith('/') ? normalizedEndpoint : `/${normalizedEndpoint}`}`
}

export function useApi<T>(endpoint: string, options?: RequestInit): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
        const response = await fetch(buildApiUrl(endpoint, baseUrl), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            ...options?.headers,
          },
          ...options,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('API Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  return { data, loading, error }
}

export async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
  const token = localStorage.getItem('token')
  const fullUrl = buildApiUrl(endpoint, baseUrl)
  
  console.log('🌐 API Call:', {
    endpoint,
    baseUrl,
    fullUrl,
    hasToken: !!token,
    method: options?.method || 'GET'
  })
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`,
      ...options?.headers,
    },
    ...options,
  })

  console.log('📡 API Response:', {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  })

  if (!response.ok) {
    // Try to get error details from response
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const errorData = await response.json()
      console.error('❌ API Error Response:', errorData)
      console.error('Error Details:', JSON.stringify(errorData, null, 2))
      
      // Extract error message from various formats
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        // Handle error as object or string
        if (typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || JSON.stringify(errorData.error)
        } else {
          errorMessage = errorData.error
        }
      }
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  const jsonData = await response.json()
  console.log('✅ API Success Data:', jsonData)
  return jsonData
}