import { apiCall } from '@/hooks/useApi'

// ==================== Types ====================

export interface ContractClause {
  title: string
  description: string
}

export interface ProjectDetail {
  title: string
  description: string
}

export interface Contract {
  id: string
  contract_number: string
  user_id: string | null
  client_name: string
  client_email: string
  project_name: string
  description: string
  clauses: ContractClause[]
  project_details: ProjectDetail[]
  price: number
  pay_number: number
  project_duration: number | null
  project_duration_unit: string | null
  revisions_allowed: number | null
  warranty_period: number | null
  auto_cancel_days: number | null
  progress_tolerance: number | null
  delay_compensation: number | null
  client_fault_refund: number | null
  progress_timeline_link: string | null
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  signed_at: string | null
  signature_black?: { type: 'Buffer'; data: number[] } | null
  signature_blue?: { type: 'Buffer'; data: number[] } | null
  signature_white?: { type: 'Buffer'; data: number[] } | null
  project_id: string | null
  created_at: string
  updated_at: string
}

export interface ContractsResponse {
  success: boolean
  data: Contract[]
  count: number
  nextOffset: number
  left: number
}

export interface SingleContractResponse {
  success: boolean
  data: Contract
}

export interface ContractStatistics {
  success: boolean
  data: {
    total: number
    byStatus: {
      pending: number
      active: number
      completed: number
      cancelled: number
    }
  }
}

export interface MutationResponse {
  success: boolean
  data: {
    changedRows: number
  } | null
}

export interface CreateContractPayload {
  contract_number: string
  user_id?: string | null
  client_name: string
  client_email: string
  project_name: string
  description: string
  clauses?: ContractClause[]
  project_details?: ProjectDetail[]
  price: number
  pay_number: number
  project_duration?: number
  project_duration_unit?: string
  revisions_allowed?: number
  warranty_period?: number
  auto_cancel_days?: number
  progress_tolerance?: number
  delay_compensation?: number
  client_fault_refund?: number
  progress_timeline_link?: string
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
  project_id?: string | null
}

export interface UpdateContractPayload {
  contract_number?: string
  user_id?: string | null
  client_name?: string
  client_email?: string
  project_name?: string
  description?: string
  clauses?: ContractClause[]
  project_details?: ProjectDetail[]
  price?: number
  pay_number?: number
  project_duration?: number
  project_duration_unit?: string
  revisions_allowed?: number
  warranty_period?: number
  auto_cancel_days?: number
  progress_tolerance?: number
  delay_compensation?: number
  client_fault_refund?: number
  progress_timeline_link?: string
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
  project_id?: string | null
}

export interface GetContractsParams {
  limit?: number
  offset?: number
  order?: string
  search?: string
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
  user_id?: string
  project_id?: string
  client_email?: string
}

// ==================== API Functions ====================

const BASE_PATH = '/contracts'

/**
 * Get all contracts with optional search, filter, and pagination
 */
export async function getAllContracts(params?: GetContractsParams): Promise<ContractsResponse> {
  const queryParams = new URLSearchParams()

  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.user_id) queryParams.append('user_id', params.user_id)
  if (params?.project_id) queryParams.append('project_id', params.project_id)
  if (params?.client_email) queryParams.append('client_email', params.client_email)

  const query = queryParams.toString()
  const url = query ? `${BASE_PATH}?${query}` : BASE_PATH

  return apiCall<ContractsResponse>(url)
}

/**
 * Get contract statistics (total count, distribution by status)
 */
export async function getContractStatistics(): Promise<ContractStatistics> {
  return apiCall<ContractStatistics>(`${BASE_PATH}/statistics`)
}

/**
 * Get current user's contracts (any authenticated user)
 */
export async function getMyContracts(
  params?: { limit?: number; offset?: number; order?: string }
): Promise<ContractsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/my-contracts?${query}`
    : `${BASE_PATH}/my-contracts`

  return apiCall<ContractsResponse>(url)
}

/**
 * Get contract by contract number
 */
export async function getContractByNumber(contractNumber: string): Promise<SingleContractResponse> {
  return apiCall<SingleContractResponse>(`${BASE_PATH}/number/${encodeURIComponent(contractNumber)}`)
}

/**
 * Get contracts by user ID (requires admin permissions)
 */
export async function getContractsByUserId(
  userId: string,
  params?: { limit?: number; offset?: number; order?: string }
): Promise<ContractsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/user/${userId}?${query}`
    : `${BASE_PATH}/user/${userId}`

  return apiCall<ContractsResponse>(url)
}

/**
 * Get contracts by project ID
 */
export async function getContractsByProjectId(
  projectId: string,
  params?: { limit?: number; offset?: number; order?: string }
): Promise<ContractsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/project/${projectId}?${query}`
    : `${BASE_PATH}/project/${projectId}`

  return apiCall<ContractsResponse>(url)
}

/**
 * Get a single contract by ID
 */
export async function getContractById(id: string): Promise<SingleContractResponse> {
  return apiCall<SingleContractResponse>(`${BASE_PATH}/${id}`)
}

/**
 * Create a new contract
 */
export async function createContract(payload: CreateContractPayload): Promise<SingleContractResponse> {
  return apiCall<SingleContractResponse>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update an existing contract
 */
export async function updateContract(id: string, payload: UpdateContractPayload): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Sign a contract (sets signed_at, changes status to active, and saves the signature)
 */
export async function signContract(id: string, signature: string): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}/sign`, {
    method: 'PATCH',
    body: JSON.stringify({ signature }),
  })
}

/**
 * Change contract status
 */
export async function changeContractStatus(
  id: string,
  status: 'pending' | 'active' | 'completed' | 'cancelled'
): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

/**
 * Delete a contract
 */
export async function deleteContract(id: string): Promise<MutationResponse> {
  return apiCall<MutationResponse>(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}
