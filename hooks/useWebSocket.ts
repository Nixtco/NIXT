/**
 * Hook مخصص لإدارة اتصال WebSocket للدردشة
 * Custom hook for managing WebSocket connection for chat
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// أنواع الرسائل والأحداث
export type WSMessageType =
  | 'auth:success'
  | 'auth:failed'
  | 'message:send'
  | 'message:sent'
  | 'message:update-status'
  | 'message:delivered'
  | 'message:read'
  | 'message:delete'
  | 'message:deleted'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline'
  | 'conversation:join'
  | 'conversation:joined'
  | 'conversation:leave'
  | 'conversation:left'
  | 'ping'
  | 'pong'
  | 'error'

export interface WSMessage {
  type: WSMessageType
  data?: any
  error?: string
  timestamp?: number
  conversationId?: string
  messageId?: string
}

export interface MessageAttachment {
  type: 'image' | 'video' | 'file' | 'payment_request'
  url: string
  name: string
  size?: number
  // معلومات طلب الدفع
  payment_data?: {
    amount: number
    currency: string
    description?: string
    payment_link?: string
  }
}

export interface IncomingMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'client' | 'admin' | 'CLIENT' | 'ADMIN' // Support both cases
  text: string
  attachment?: MessageAttachment | null
  status: 'sent' | 'delivered' | 'read'
  created_at: string
  sender?: {
    id: string
    email: string
    display_name?: string | null
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  }
}

export interface WSEventHandlers {
  onAuthSuccess?: (data: any) => void
  onAuthFailed?: (error: string) => void
  onMessageSent?: (message: IncomingMessage, conversationId: string) => void
  onMessageDelivered?: (data: { messageId: string; conversationId: string; status: string }) => void
  onMessageRead?: (data: { messageId: string; conversationId: string; status: string; read_at?: string }) => void
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void
  onTypingStart?: (data: { conversationId: string; userId: string; displayName?: string }) => void
  onTypingStop?: (data: { conversationId: string; userId: string }) => void
  onUserOnline?: (data: { userId: string; status: string; timestamp: number }) => void
  onUserOffline?: (data: { userId: string; status: string; timestamp: number }) => void
  onConversationJoined?: (data: any, conversationId: string) => void
  onConversationLeft?: (data: any, conversationId: string) => void
  onError?: (error: string) => void
  onConnectionOpen?: () => void
  onConnectionClose?: (event: CloseEvent) => void
  onConnectionError?: (error: Event) => void
}

interface UseWebSocketOptions {
  enabled?: boolean // تمكين الاتصال
  autoReconnect?: boolean // إعادة الاتصال التلقائي
  maxReconnectAttempts?: number // عدد محاولات إعادة الاتصال
  reconnectInterval?: number // المدة بين المحاولات (ms)
  pingInterval?: number // فترة إرسال ping (ms)
  handlers?: WSEventHandlers
}

export interface UseWebSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'
  
  // إرسال الرسائل والأحداث
  sendMessage: (conversationId: string, text: string, attachment?: MessageAttachment) => void
  updateMessageStatus: (messageId: string, conversationId: string, status: 'delivered' | 'read') => void
  deleteMessage: (messageId: string, conversationId: string) => void
  sendTypingStart: (conversationId: string, displayName?: string) => void
  sendTypingStop: (conversationId: string) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendPing: () => void
  
  // إدارة الاتصال
  connect: () => void
  disconnect: () => void
  reconnect: () => void
}

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    enabled = true,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    pingInterval = 30000,
    handlers = {}
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'>('disconnected')

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const handlersRef = useRef(handlers)

  // تحديث الـ handlers
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  // معالجة الرسائل الواردة
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WSMessage = JSON.parse(event.data)
      console.log('📨 WebSocket رسالة واردة:', message)

      const h = handlersRef.current

      switch (message.type) {
        case 'auth:success':
          console.log('✅ تمت المصادقة بنجاح')
          h.onAuthSuccess?.(message.data)
          break

        case 'auth:failed':
          console.error('❌ فشلت المصادقة:', message.error)
          h.onAuthFailed?.(message.error || 'Authentication failed')
          break

        case 'message:sent':
          console.log('✅ [RECEIVE] تم استلام تأكيد إرسال الرسالة من السيرفر:', message.data)
          h.onMessageSent?.(message.data, message.conversationId || message.data?.conversation_id)
          break

        case 'message:delivered':
          h.onMessageDelivered?.(message.data)
          break

        case 'message:read':
          h.onMessageRead?.(message.data)
          break

        case 'message:deleted':
          h.onMessageDeleted?.(message.data)
          break

        case 'typing:start':
          h.onTypingStart?.(message.data)
          break

        case 'typing:stop':
          h.onTypingStop?.(message.data)
          break

        case 'user:online':
          h.onUserOnline?.(message.data)
          break

        case 'user:offline':
          h.onUserOffline?.(message.data)
          break

        case 'conversation:joined':
          h.onConversationJoined?.(message.data, message.conversationId || message.data?.conversationId)
          break

        case 'conversation:left':
          h.onConversationLeft?.(message.data, message.conversationId || message.data?.conversationId)
          break

        case 'pong':
          // Pong received - connection is alive
          break

        case 'error':
          console.error('❌ خطأ من السيرفر:', message.error)
          h.onError?.(message.error || 'Unknown error')
          break

        default:
          console.warn('⚠️ نوع رسالة غير معروف:', message.type)
      }
    } catch (err) {
      console.error('❌ خطأ في تحليل رسالة WebSocket:', err)
    }
  }, [])

  // إرسال رسالة عبر WebSocket
  const send = useCallback((message: WSMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
      console.log('📤 WebSocket رسالة مرسلة:', message)
    } else {
      console.error('❌ WebSocket غير متصل')
    }
  }, [])

  // API Functions
  const sendMessage = useCallback((conversationId: string, text: string, attachment?: MessageAttachment) => {
    console.log('🚀 [SEND] إرسال رسالة عبر WebSocket:', {
      conversationId,
      text,
      attachment,
      socketState: socketRef.current?.readyState === WebSocket.OPEN ? 'OPEN' : 'CLOSED'
    })
    
    send({
      type: 'message:send',
      data: {
        conversation_id: conversationId,
        text,
        attachment: attachment || undefined
      }
    })
  }, [send])

  const updateMessageStatus = useCallback((messageId: string, conversationId: string, status: 'delivered' | 'read') => {
    send({
      type: 'message:update-status',
      data: {
        messageId,
        conversationId,
        status
      }
    })
  }, [send])

  const deleteMessage = useCallback((messageId: string, conversationId: string) => {
    send({
      type: 'message:delete',
      data: {
        messageId,
        conversationId
      }
    })
  }, [send])

  const sendTypingStart = useCallback((conversationId: string, displayName?: string) => {
    send({
      type: 'typing:start',
      data: {
        conversationId,
        displayName
      }
    })
  }, [send])

  const sendTypingStop = useCallback((conversationId: string) => {
    send({
      type: 'typing:stop',
      data: {
        conversationId
      }
    })
  }, [send])

  const joinConversation = useCallback((conversationId: string) => {
    send({
      type: 'conversation:join',
      data: {
        conversationId
      }
    })
  }, [send])

  const leaveConversation = useCallback((conversationId: string) => {
    send({
      type: 'conversation:leave',
      data: {
        conversationId
      }
    })
  }, [send])

  const sendPing = useCallback(() => {
    send({
      type: 'ping',
      timestamp: Date.now()
    })
  }, [send])

  // إنشاء اتصال WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket متصل بالفعل')
      return
    }

    // البحث عن التوكن بكلا الاسمين (auth_token أو token)
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    if (!token) {
      console.error('❌ لا يوجد token للمصادقة')
      setError('No authentication token found')
      setConnectionStatus('failed')
      return
    }

    setIsConnecting(true)
    setConnectionStatus('connecting')
    setError(null)

    const wsUrl = `${WS_BASE_URL}/ws/chat?token=${token}`
    console.log('🔌 محاولة الاتصال بـ WebSocket:', wsUrl)

    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('✅ تم الاتصال بـ WebSocket بنجاح')
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionStatus('connected')
      setError(null)
      reconnectAttemptsRef.current = 0

      // بدء إرسال ping بشكل دوري
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      pingIntervalRef.current = setInterval(() => {
        sendPing()
      }, pingInterval)

      handlersRef.current.onConnectionOpen?.()
    }

    socket.onmessage = handleMessage

    socket.onclose = (event) => {
      console.log('❌ تم قطع اتصال WebSocket', event.code, event.reason)
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionStatus('disconnected')

      // إيقاف ping
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = undefined
      }

      handlersRef.current.onConnectionClose?.(event)

      // محاولة إعادة الاتصال
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        setConnectionStatus('reconnecting')
        console.log(`🔄 محاولة إعادة الاتصال ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`)

        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setConnectionStatus('failed')
        setError('Failed to connect after multiple attempts')
        console.error('❌ فشل إعادة الاتصال بعد عدة محاولات')
      }
    }

    socket.onerror = (event) => {
      console.error('❌ خطأ في WebSocket:', event)
      setError('WebSocket connection error')
      handlersRef.current.onConnectionError?.(event)
    }
  }, [autoReconnect, maxReconnectAttempts, reconnectInterval, pingInterval, handleMessage, sendPing])

  // قطع الاتصال
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = undefined
    }

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setConnectionStatus('disconnected')
    reconnectAttemptsRef.current = 0
  }, [])

  // إعادة الاتصال يدوياً
  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  // الاتصال التلقائي عند التحميل
  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isConnected,
    isConnecting,
    error,
    connectionStatus,
    sendMessage,
    updateMessageStatus,
    deleteMessage,
    sendTypingStart,
    sendTypingStop,
    joinConversation,
    leaveConversation,
    sendPing,
    connect,
    disconnect,
    reconnect
  }
}
