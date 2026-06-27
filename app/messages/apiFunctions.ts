import { apiCall } from '@/hooks/useApi'

// ==================== Types ====================

export interface MessageAttachment {
  type: 'image' | 'video' | 'file'
  url: string
  name: string
  size: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'client' | 'admin'
  text: string
  attachment?: MessageAttachment | null
  status: 'sent' | 'delivered' | 'read'
  read_at?: string | null
  sender?: {
    id: string
    email: string
    display_name: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
  created_at: string
  updated_at: string
}

export interface MessagesResponse {
  success: boolean
  data: Message[]
  count?: number
  nextOffset?: number
  left?: number
}

export interface MessageResponse {
  success: boolean
  data: Message | null
}

export interface Conversation {
  id: string
  client_id: string
  admin_id: string
  project_id?: string | null
  type: 'general' | 'project'
  status: 'active' | 'closed' | 'archived'
  unread_count: number
  last_message_at?: string | null
  client?: {
    id: string
    email: string
    display_name: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
  admin?: {
    id: string
    email: string
    display_name: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
  project?: {
    id: string
    name: string
    status: string
  }
  messages?: Message[]
  created_at: string
  updated_at: string
}

export interface ConversationsResponse {
  success: boolean
  data: Conversation[]
  count?: number
  nextOffset?: number
  left?: number
}

export interface ConversationResponse {
  success: boolean
  data: Conversation | null
}

export interface AdminStats {
  unreadConversations: number
  totalConversations: number
  activeConversations: number
}

export interface AdminStatsResponse {
  success: boolean
  data: AdminStats | null
}

export interface CreateMessageParams {
  conversation_id: string
  text: string
  attachment?: MessageAttachment | null
}

export interface UpdateMessageStatusParams {
  status: 'sent' | 'delivered' | 'read'
}

export interface GetConversationsParams {
  limit?: number
  offset?: number
  order?: string
}

export interface CreateConversationParams {
  other_user_id: string
  type: 'general' | 'project'
  project_id?: string
}

export interface UpdateConversationStatusParams {
  status: 'active' | 'closed' | 'archived'
}

// ==================== API Endpoints ====================

const BASE_PATH = '/api/v1'

// ==================== Messages Functions ====================

/**
 * إنشاء رسالة جديدة
 * Create new message
 */
export async function createMessage(params: CreateMessageParams): Promise<MessageResponse> {
  return apiCall<MessageResponse>(`${BASE_PATH}/messages`, {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

/**
 * الحصول على رسائل المحادثة
 * Get conversation messages
 */
export async function getConversationMessages(
  conversationId: string,
  params?: { limit?: number; offset?: number }
): Promise<MessagesResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/messages/${conversationId}?${query}`
    : `${BASE_PATH}/messages/${conversationId}`

  return apiCall<MessagesResponse>(url)
}

/**
 * تحديث حالة الرسالة
 * Update message status
 */
export async function updateMessageStatus(
  messageId: string,
  params: UpdateMessageStatusParams
): Promise<MessageResponse> {
  return apiCall<MessageResponse>(`${BASE_PATH}/messages/${messageId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(params)
  })
}

/**
 * تحديد جميع رسائل المحادثة كمقروءة
 * Mark all conversation messages as read
 */
export async function markConversationAsRead(conversationId: string): Promise<{ success: boolean; data?: { updated: number } }> {
  return apiCall(`${BASE_PATH}/messages/${conversationId}/read`, {
    method: 'PATCH',
    body: JSON.stringify({})
  })
}

/**
 * حذف رسالة
 * Delete message
 */
export async function deleteMessage(messageId: string): Promise<MessageResponse> {
  return apiCall<MessageResponse>(`${BASE_PATH}/messages/${messageId}`, {
    method: 'DELETE'
  })
}

// ==================== Conversations Functions ====================

/**
 * الحصول على محادثات المدير
 * Get admin conversations
 */
export async function getAdminConversations(
  params?: GetConversationsParams
): Promise<ConversationsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/conversations/admin/list?${query}`
    : `${BASE_PATH}/conversations/admin/list`

  return apiCall<ConversationsResponse>(url)
}

/**
 * الحصول على محادثات العميل
 * Get client conversations
 */
export async function getClientConversations(
  params?: GetConversationsParams
): Promise<ConversationsResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString())

  const query = queryParams.toString()
  const url = query
    ? `${BASE_PATH}/conversations/client/list?${query}`
    : `${BASE_PATH}/conversations/client/list`

  return apiCall<ConversationsResponse>(url)
}

/**
 * الحصول على محادثة بواسطة المعرف
 * Get conversation by ID
 */
export async function getConversationById(conversationId: string): Promise<ConversationResponse> {
  return apiCall<ConversationResponse>(`${BASE_PATH}/conversations/${conversationId}`)
}

/**
 * إنشاء أو الحصول على محادثة
 * Create or get conversation
 */
export async function getOrCreateConversation(params: CreateConversationParams): Promise<ConversationResponse> {
  return apiCall<ConversationResponse>(`${BASE_PATH}/conversations`, {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

/**
 * تحديث حالة المحادثة
 * Update conversation status
 */
export async function updateConversationStatus(
  conversationId: string,
  params: UpdateConversationStatusParams
): Promise<ConversationResponse> {
  return apiCall<ConversationResponse>(`${BASE_PATH}/conversations/${conversationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(params)
  })
}

/**
 * الحصول على إحصائيات الرسائل للمدير
 * Get admin message statistics
 */
export async function getAdminMessageStats(): Promise<AdminStatsResponse> {
  return apiCall<AdminStatsResponse>(`${BASE_PATH}/conversations/admin/stats`)
}

/**
 * حذف محادثة
 * Delete conversation
 */
export async function deleteConversation(conversationId: string): Promise<ConversationResponse> {
  return apiCall<ConversationResponse>(`${BASE_PATH}/conversations/${conversationId}`, {
    method: 'DELETE'
  })
}
