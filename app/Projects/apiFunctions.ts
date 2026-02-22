import { apiCall } from '@/hooks/useApi'

// ==================== Types ====================

export interface ProgressItem {
  id: string
  title: string
  percent: number
}

export interface Project {
  id: string
  name: string
  user_id: string
  progress: ProgressItem[]
  progress_completed: string[]
  price: number
  spent: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'pending' | 'completed' | 'onhold'
  deadline: string
  team: string[]
  has_signed: boolean
  created_at: string
  updated_at: string
}

export interface ProjectsResponse {
  success: boolean
  data: Project[]
  count: number
  nextOffset: number
  left: number
}

export interface SingleProjectResponse {
  success: boolean
  data: Project
}

export interface ProjectStatistics {
  success: boolean
  data: {
    total: number
    byStatus: {
      active: number
      pending: number
      completed: number
      onhold: number
    }
  }
}

export interface MutationResponse {
  success: boolean
  data: {
    changedRows: number
  } | null
}

export interface CreateProjectPayload {
  name: string
  user_id: string
  progress?: ProgressItem[]
  progress_completed?: string[]
  price: number
  spent?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'active' | 'pending' | 'completed' | 'onhold'
  deadline: string
  team?: string[]
}

export interface UpdateProjectPayload {
  name?: string
  progress?: ProgressItem[]
  progress_completed?: string[]
  price?: number
  spent?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'active' | 'pending' | 'completed' | 'onhold'
  deadline?: string
  team?: string[]
  has_signed?: boolean
}

export interface GetProjectsParams {
  limit?: number
  offset?: number
  order?: string
  search?: string
  status?: 'active' | 'pending' | 'completed' | 'onhold'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  user_id?: string
}

// ==================== API Functions ====================

const BASE_PATH = '/projects'

/**
 * Get all projects with optional search, filter, and pagination
 */
export async function getAllProjects(params?: GetProjectsParams): Promise<ProjectsResponse> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.priority) queryParams.append('priority', params.priority)
  if (params?.user_id) queryParams.append('user_id', params.user_id)

  const query = queryParams.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiCall<ProjectsResponse>(url)
}

/**
 * Get project statistics (total count, distribution by status)
 */
export async function getProjectStatistics(): Promise<ProjectStatistics> {
  return apiCall<ProjectStatistics>(`${BASE_PATH}/statistics`)
}

/**
 * Get projects by user ID (requires admin permissions)
 */
export async function getProjectsByUserId(
  userId: string,
  params?: { limit?: number; offset?: number; order?: string }
): Promise<ProjectsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/user/${userId}?${query}`
    : `${BASE_PATH}/user/${userId}`

  return apiCall<ProjectsResponse>(url)
}

/**
 * Get current user's projects (no admin permissions required)
 * This endpoint allows any authenticated user to view their own projects
 */
export async function getMyProjects(
  params?: { limit?: number; offset?: number; order?: string }
): Promise<ProjectsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/my-projects?${query}`
    : `${BASE_PATH}/my-projects`

  return apiCall<ProjectsResponse>(url)
}

/**
 * Get projects by team member (admin ID)
 */
export async function getProjectsByTeamMember(
  adminId: string,
  params?: { limit?: number; offset?: number; order?: string }
): Promise<ProjectsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/team/${adminId}?${query}`
    : `${BASE_PATH}/team/${adminId}`

  return apiCall<ProjectsResponse>(url)
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<SingleProjectResponse> {
  return apiCall<SingleProjectResponse>(`${BASE_PATH}/${id}`)
}

/**
 * Create a new project
 */
export async function createProject(payload: CreateProjectPayload): Promise<SingleProjectResponse> {
  return apiCall<SingleProjectResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, payload: UpdateProjectPayload): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

// ==================== Progress Management ====================

/**
 * Add a progress item to a project
 */
export async function addProgressItem(
  projectId: string,
  item: ProgressItem
): Promise<MutationResponse> {
  const payload = { item }
  console.log('addProgressItem API call:', {
    url: `${BASE_PATH}/${projectId}/progress`,
    payload,
    stringified: JSON.stringify(payload)
  })
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/progress`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update a progress item in a project
 */
export async function updateProgressItem(
  projectId: string,
  itemId: string,
  updates: { title?: string; percent?: number }
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/progress/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

/**
 * Remove a progress item from a project
 */
export async function removeProgressItem(
  projectId: string,
  itemId: string
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/progress/${itemId}`, {
    method: 'DELETE',
  })
}

/**
 * Mark a progress item as completed
 */
export async function markProgressCompleted(
  projectId: string,
  itemId: string
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/progress/complete`, {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  })
}

/**
 * Unmark a progress item as completed
 */
export async function unmarkProgressCompleted(
  projectId: string,
  itemId: string
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/progress/uncomplete`, {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  })
}

// ==================== Team Management ====================

/**
 * Add a team member to a project
 */
export async function addTeamMember(
  projectId: string,
  adminId: string
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/team`, {
    method: 'POST',
    body: JSON.stringify({ admin_id: adminId }),
  })
}

/**
 * Remove a team member from a project
 */
export async function removeTeamMember(
  projectId: string,
  adminId: string
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${projectId}/team`, {
    method: 'DELETE',
    body: JSON.stringify({ admin_id: adminId }),
  })
}
