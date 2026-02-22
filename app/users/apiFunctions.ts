import { apiCall } from '@/hooks/useApi'

// ==================== Types ====================

export interface User {
  id: string
  email: string
  auth_provider: 'local' | 'google'
  google_id: string | null
  first_name: string | null
  last_name: string | null
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface UsersResponse {
  success: boolean
  data: User[]
  count: number
  nextOffset: number
  left: number
}

export interface SingleUserResponse {
  success: boolean
  data: User | null
}

export interface MutationResponse {
  success: boolean
  data: {
    changedRows?: number
  } | null
}

export interface GetUsersParams {
  limit?: number
  offset?: number
  order?: string
  search?: string
  auth_provider?: 'local' | 'google' | 'all'
}

export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
  phone?: string
}

// ==================== API Functions ====================

const BASE_PATH = '/users'

/**
 * Get all users with optional search, filter, and pagination
 */
export async function getAllUsers(params?: GetUsersParams): Promise<UsersResponse> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.auth_provider && params.auth_provider !== 'all') {
    queryParams.append('auth_provider', params.auth_provider)
  }

  const query = queryParams.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiCall<UsersResponse>(url)
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<SingleUserResponse> {
  return apiCall<SingleUserResponse>(`${BASE_PATH}/${id}`)
}

/**
 * Get a single user by email
 */
export async function getUserByEmail(email: string): Promise<SingleUserResponse> {
  return apiCall<SingleUserResponse>(`${BASE_PATH}/email/${email}`)
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<SingleUserResponse> {
  return apiCall<SingleUserResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}
