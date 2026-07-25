'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from 'emoji-picker-react'
import styles from './ChatWidget.module.css'
import { useLanguage } from '@/hooks/useLanguage'
import { getMyProjects, getAllProjects, type Project } from '@/app/Projects/apiFunctions'
import { getAllUsers, type User as APIUser } from '@/app/users/apiFunctions'
import {
  createMessage,
  getConversationMessages,
  getAdminConversations,
  getClientConversations,
  markConversationAsRead,
  getOrCreateConversation,
  updateMessageStatus,
  getAdminMessageStats,
  getAvailableUsers,
  getAdminsWithConversationStatus,
  type Conversation,
  type Message as APIMessage,
  type AdminStats,
  type AvailableUser,
  type ConversationResponse
} from '@/app/messages/apiFunctions'
import { apiCall } from '@/hooks/useApi'
import { useWebSocket, type IncomingMessage } from '@/hooks/useWebSocket'

export interface ChatWidgetProps {
  mode?: 'user' | 'admin'
  onUnreadChange?: (count: number) => void
}

interface MessageAttachment {
  type: 'image' | 'video' | 'file' | 'payment_request'
  url: string
  name: string
  size: number
  // معلومات طلب الدفع
  payment_data?: {
    amount: number
    currency: string
    description?: string
    payment_link?: string
  }
}

interface Message {
  id: string | number
  text: string
  sender: 'sent' | 'received'
  time: string
  senderName?: string
  senderType?: 'admin' | 'client'  // ✅ إضافة نوع المرسل الفعلي
  attachment?: MessageAttachment
  status?: 'sent' | 'delivered' | 'read'
}

type ChatType = 'general' | 'project'

interface ChatItem {
  id: string
  type: ChatType
  name: string
  subtitle?: string
  projectId?: string
  clientId?: string
  otherUserId?: string
  clientName?: string
  clientEmail?: string
}

function getClientDisplayName(user: APIUser): string {
  return user.display_name?.trim()
    || `${user.first_name || ''} ${user.last_name || ''}`.trim()
    || user.email
}

function buildAdminChatId(clientId: string, type: ChatType, projectId?: string): string {
  if (type === 'general') return `user-${clientId}-general`
  return `user-${clientId}-project-${projectId}`
}

function createAdminSeedMessages(
  chats: ChatItem[],
  language: string
): { messages: Record<string, Message[]>, unread: Record<string, number> } {
  const messages: Record<string, Message[]> = {}
  const unread: Record<string, number> = {}
  const generalChats = chats.filter((c) => c.type === 'general')
  const projectChats = chats.filter((c) => c.type === 'project')

  if (generalChats[0]) {
    const id = generalChats[0].id
    const name = generalChats[0].clientName || 'Client'
    messages[id] = [
      {
        id: 1001,
        text: language === 'ar'
          ? 'مرحباً، أريد الاستفسار عن موعد تسليم المشروع'
          : 'Hi, I would like to ask about the project delivery timeline',
        sender: 'received',
        time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: name,
        senderType: 'client', // ✅ رسالة من العميل
      },
      {
        id: 1002,
        text: language === 'ar'
          ? 'هل يمكن تحديثي على آخر التطورات؟'
          : 'Can you update me on the latest progress?',
        sender: 'received',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: name,
        senderType: 'client', // ✅ رسالة من العميل
      },
    ]
    unread[id] = 2
  }

  if (generalChats[1]) {
    const id = generalChats[1].id
    const name = generalChats[1].clientName || 'Client'
    messages[id] = [{
      id: 2001,
      text: language === 'ar'
        ? 'أحتاج مساعدة في فهم بنود العقد'
        : 'I need help understanding the contract terms',
      sender: 'received',
      time: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: name,
      senderType: 'client', // ✅ رسالة من العميل
    }]
    unread[id] = 1
  }

  if (projectChats[0]) {
    const id = projectChats[0].id
    const name = projectChats[0].clientName || 'Client'
    messages[id] = [{
      id: 3001,
      text: language === 'ar'
        ? 'هل انتهى تصميم الصفحة الرئيسية؟'
        : 'Is the homepage design finished?',
      sender: 'received',
      time: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: name,
      senderType: 'client', // ✅ رسالة من العميل
    }]
    unread[id] = 1
  }

  return { messages, unread }
}

const GENERAL_CHAT_ID = 'general'
const BASE_PATH = '/api/v1'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // تقليل لـ 10MB متوافق مع S3
const MAX_FILE_SIZE = 10 * 1024 * 1024 // تقليل لـ 10MB متوافق مع S3

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getWelcomeMessage(language: string): Message {
  return {
    id: 1,
    text: language === 'ar'
      ? 'مرحباً! يمكنك الاستفسار عن أي شيء هنا وسنرد عليك قريباً.'
      : 'Hello! You can ask anything here and we will reply soon.',
    sender: 'received',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    senderName: language === 'ar' ? 'الدعم' : 'Support',
    senderType: 'admin', // ✅ الرسالة الترحيبية من الدعم (admin)
  }
}

function getStatusLabel(status: Project['status'], language: string): string {
  const map: Record<Project['status'], { ar: string; en: string }> = {
    active: { ar: 'قيد التطوير', en: 'In Development' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    onhold: { ar: 'متوقف', en: 'On Hold' },
    cancelled: { ar: 'ملغى', en: 'Cancelled' },
  }
  return language === 'ar' ? map[status].ar : map[status].en
}

// دالة للحصول على userId من الـ token
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token')
  if (!token) {
    console.warn('⚠️ [getCurrentUserId] لا يوجد token في localStorage')
    return null
  }
  
  try {
    // فك تشفير JWT token (الجزء الثاني هو payload)
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('🔑 [getCurrentUserId] Token payload:', payload)
    
    // تجربة أسماء مختلفة للـ userId
    const userId = payload.userID || payload.userId || payload.id || payload.sub || null
    console.log('✅ [getCurrentUserId] userId المستخرج:', userId)
    
    return userId
  } catch (error) {
    console.error('❌ [getCurrentUserId] فشل فك تشفير token:', error)
    return null
  }
}

export default function ChatWidget({ mode = 'user', onUnreadChange }: ChatWidgetProps) {
  const isAdminMode = mode === 'admin'
  const { language, dir } = useLanguage()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [adminClients, setAdminClients] = useState<APIUser[]>([])
  const [adminsWithConversations, setAdminsWithConversations] = useState<{
    admin: AvailableUser;
    conversation: Conversation | null;
    hasConversation: boolean;
  }[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [conversationsLoading, setConversationsLoading] = useState(false)

  // API-based state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  // UI state
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(() => {
    // ✅ FIX: تهيئة رسالة ترحيبية للمستخدمين الجدد
    if (mode === 'user') {
      const initialMessages: Record<string, Message[]> = {
        [GENERAL_CHAT_ID]: [getWelcomeMessage('en')]
      }
      return initialMessages
    }
    return {} // للـ admin mode: لا توجد رسائل أولية
  })
  const [activeChatId, setActiveChatId] = useState(GENERAL_CHAT_ID)
  const [typingChats, setTypingChats] = useState<Record<string, boolean>>({})
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [chatFilter, setChatFilter] = useState<'all' | 'unread'>('all')
  const [chatSearch, setChatSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false) // حالة رفع الملف
  const [selectedFilePreview, setSelectedFilePreview] = useState<{
    file: File;
    type: MessageAttachment['type'];
    previewUrl?: string;
  } | null>(null) // معاينة الملف قبل الإرسال
  const [isDragging, setIsDragging] = useState(false) // حالة السحب والإفلات
  const [showPaymentDialog, setShowPaymentDialog] = useState(false) // dialog طلب الدفع
  const [paymentAmount, setPaymentAmount] = useState<string>('') // المبلغ المطلوب
  const [paymentDescription, setPaymentDescription] = useState<string>('') // وصف الدفع

  // WebSocket Integration - استخدام useMemo للـ handlers
  const wsHandlers = useMemo(() => ({
    onAuthSuccess: (data: any) => {
      console.log('✅ WebSocket authenticated:', data)
    },
    onAuthFailed: (error: any) => {
      console.error('❌ WebSocket auth failed:', error)
    },
    onMessageSent: (message: IncomingMessage, conversationId: string) => {
      console.log('💬 [RECEIVE] رسالة جديدة عبر WebSocket:', message)
      console.log('💬 [RECEIVE] Conversation ID:', conversationId)
      console.log('💬 [RECEIVE] activeChatId:', activeChatId)
      console.log('💬 [RECEIVE] activeConversationId:', activeConversationId)
      console.log('💬 [RECEIVE] currentUserId:', currentUserId)
      console.log('💬 [RECEIVE] message.sender_id:', message.sender_id)
      
      // ✅ FIX: تحديد sender بناءً على المستخدم الحالي، وليس النوع
      // إذا كان المرسل هو المستخدم الحالي -> sent
      // إذا كان المرسل شخص آخر -> received
      const isMyMessage = currentUserId && message.sender_id === currentUserId
      
      // تحويل الرسالة إلى صيغة UI
      const newMessage: Message = {
        id: message.id,
        text: message.text,
        sender: isMyMessage ? 'sent' : 'received',
        time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: message.sender?.display_name || message.sender?.email,
        senderType: message.sender_type === 'admin' ? 'admin' : 'client', // ✅ إضافة نوع المرسل الفعلي
        attachment: message.attachment ? {
          type: message.attachment.type,
          url: message.attachment.url,
          name: message.attachment.name,
          size: message.attachment.size || 0
        } : undefined,
        status: message.status
      }
      
      console.log('💬 [RECEIVE] رسالة محولة:', newMessage)
      console.log('💬 [RECEIVE] isMyMessage:', isMyMessage)

      // تحديث الرسائل في الواجهة
      setChatMessages(prev => {
        // إذا كانت الرسالة للمحادثة النشطة، استخدم activeChatId
        let targetChatId = activeChatId
        
        if (conversationId !== activeConversationId) {
          // إذا كانت لمحادثة أخرى، استخدم conversationId مباشرة
          targetChatId = conversationId
        }
        
        const existing = prev[targetChatId] || []
        
        // تحقق من عدم وجود الرسالة مسبقاً
        if (existing.find(m => m.id === message.id)) {
          console.log('💬 [RECEIVE] الرسالة موجودة مسبقاً، تخطي')
          return prev
        }
        
        console.log(`💬 [RECEIVE] إضافة الرسالة إلى ${targetChatId}`)
        
        return {
          ...prev,
          [targetChatId]: [...existing, newMessage]
        }
      })

      // تحديث عداد الرسائل غير المقروءة إذا كانت الرسالة من الطرف الآخر
      if (!isMyMessage) {
        // استخدام الـ chatId المناسب
        const chatId = conversationId === activeConversationId ? activeChatId : conversationId
        setUnreadCounts(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1
        }))
      }
    },
    onTypingStart: (data: any) => {
      console.log('⌨️ يكتب الآن:', data)
      setTypingChats(prev => ({ ...prev, [data.conversationId]: true }))
    },
    onTypingStop: (data: any) => {
      console.log('⌨️ توقف عن الكتابة:', data)
      setTypingChats(prev => ({ ...prev, [data.conversationId]: false }))
    },
    onMessageDelivered: (data: any) => {
      console.log('✓ تم توصيل الرسالة:', data)
      // تحديث حالة الرسالة في UI
      setChatMessages(prev => {
        const convId = data.conversationId
        const msgs = prev[convId]
        if (!msgs) return prev
        
        return {
          ...prev,
          [convId]: msgs.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        }
      })
    },
    onMessageRead: (data: any) => {
      console.log('✓✓ تم قراءة الرسالة:', data)
      // تحديث حالة الرسالة في UI
      setChatMessages(prev => {
        const convId = data.conversationId
        const msgs = prev[convId]
        if (!msgs) return prev
        
        return {
          ...prev,
          [convId]: msgs.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, status: 'read' as const }
              : msg
          )
        }
      })
    },
    onUserOnline: (data: any) => {
      console.log('🟢 المستخدم متصل:', data)
    },
    onUserOffline: (data: any) => {
      console.log('🔴 المستخدم غير متصل:', data)
    },
    onConversationJoined: (data: any, conversationId: string) => {
      console.log('✅ تم الانضمام للمحادثة:', conversationId)
    },
    onError: (error: any) => {
      console.error('❌ خطأ WebSocket:', error)
    }
  }), [activeChatId, activeConversationId, currentUserId])

  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    sendMessage: wsSendMessage,
    sendTypingStart: wsSendTypingStart,
    sendTypingStop: wsSendTypingStop,
    joinConversation: wsJoinConversation,
    leaveConversation: wsLeaveConversation,
    updateMessageStatus: wsUpdateMessageStatus,
  } = useWebSocket({
    enabled: true,
    handlers: wsHandlers
  })

  const generalChatName = language === 'ar' ? 'استفسار عام' : 'General Inquiry'
  const generalChatSubtitle = language === 'ar' ? 'اسأل عن أي شيء' : 'Ask about anything'

  // جلب userId الحالي من token
  useEffect(() => {
    const userId = getCurrentUserId()
    setCurrentUserId(userId)
  }, [])

  const chats = useMemo<ChatItem[]>(() => {
    if (isAdminMode) {
      console.log('🔍 [CHATS] بناء قائمة المحادثات...')
      console.log('🔍 [CHATS] currentUserId:', currentUserId)
      console.log('🔍 [CHATS] conversations:', conversations)
      
      const items: ChatItem[] = conversations.map((conv) => {
        // تحديد الطرف الآخر في المحادثة
        let otherUser: Conversation['client'] | Conversation['admin'] | null = null
        let otherUserId: string | null = null
        
        console.log(`🔍 [CHAT ${conv.id}] client_id=${conv.client_id}, admin_id=${conv.admin_id}, currentUserId=${currentUserId}`)
        
        // إذا كان المستخدم الحالي هو الـ client_id، الطرف الآخر هو admin
        if (currentUserId && conv.client_id === currentUserId) {
          otherUser = conv.admin || null
          otherUserId = conv.admin_id
          console.log(`✅ [CHAT ${conv.id}] المستخدم الحالي هو client، الطرف الآخر هو admin:`, otherUser)
        }
        // إذا كان المستخدم الحالي هو الـ admin_id، الطرف الآخر هو client
        else if (currentUserId && conv.admin_id === currentUserId) {
          otherUser = conv.client || null
          otherUserId = conv.client_id
          console.log(`✅ [CHAT ${conv.id}] المستخدم الحالي هو admin، الطرف الآخر هو client:`, otherUser)
        }
        // fallback: عرض الـ client
        else {
          otherUser = conv.client || null
          otherUserId = conv.client_id
          console.log(`⚠️ [CHAT ${conv.id}] fallback: عرض client:`, otherUser)
        }

        // بناء اسم المستخدم الآخر مع التأكد من عدم كون الاسم "واحد"
        let otherUserName = otherUser?.display_name?.trim()
        
        // إذا لم يكن هناك display_name، جرب first_name + last_name
        if (!otherUserName) {
          const fullName = `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim()
          if (fullName && fullName !== 'واحد' && fullName !== 'One') {
            otherUserName = fullName
          }
        }
        
        // إذا ما زال فارغاً أو يساوي "واحد"، استخدم البريد الإلكتروني
        if (!otherUserName || otherUserName === 'واحد' || otherUserName === 'One') {
          otherUserName = otherUser?.email || (language === 'ar' ? 'مستخدم' : 'User')
        }

        const statusSubtitle = conv.type === 'project'
          ? (conv.project?.name || (language === 'ar' ? 'محادثة مشروع' : 'Project Conversation'))
          : (otherUser?.email || (language === 'ar' ? 'استفسار عام' : 'General Inquiry'))

        const chatItem = {
          id: conv.id,
          type: conv.type,
          name: conv.type === 'project' ? (conv.project?.name || statusSubtitle) : otherUserName,
          subtitle: statusSubtitle,
          projectId: conv.project_id || undefined,
          clientId: conv.client_id,
          clientName: otherUserName,
          clientEmail: otherUser?.email || undefined,
          otherUserId: otherUserId || undefined,
        }
        
        console.log(`✅ [CHAT ${conv.id}] ChatItem النهائي:`, chatItem)
        
        return chatItem
      })

      // إضافة الإداريين الذين ليس لديهم محادثات فقط
      // فلترة الإداريين الذين لديهم محادثات موجودة مسبقاً
      const adminItems: ChatItem[] = adminsWithConversations
        .filter((item) => !item.hasConversation) // فقط الإداريين بدون محادثات
        .map((item) => {
          // بناء اسم الإداري مع التأكد من عدم كون الاسم "واحد"
          let adminName = item.admin.display_name?.trim()
          
          // إذا لم يكن هناك display_name، جرب first_name + last_name
          if (!adminName) {
            const fullName = `${item.admin.first_name || ''} ${item.admin.last_name || ''}`.trim()
            if (fullName && fullName !== 'واحد' && fullName !== 'One') {
              adminName = fullName
            }
          }
          
          // إذا ما زال فارغاً أو يساوي "واحد"، استخدم البريد الإلكتروني
          if (!adminName || adminName === 'واحد' || adminName === 'One') {
            adminName = item.admin.email || (language === 'ar' ? 'إداري' : 'Admin')
          }

          return {
            id: `admin-${item.admin.id}`, // placeholder ID
            type: 'general' as ChatType,
            name: adminName,
            subtitle: item.admin.email || (language === 'ar' ? 'إداري' : 'Admin'),
            clientId: undefined,
            otherUserId: item.admin.id,
            clientName: adminName,
            clientEmail: item.admin.email || undefined,
          }
        })

      // دمج المحادثات العادية والإداريين بدون محادثات
      const allItems = [...items, ...adminItems]

      return allItems.sort((a, b) => (unreadCounts[b.id] ?? 0) - (unreadCounts[a.id] ?? 0))
    }

    const existingGeneral = conversations.find((c) => c.type === 'general')
    const existingProjectMap = new Map(conversations.filter((c) => c.type === 'project' && c.project_id).map((c) => [c.project_id as string, c]))

    const projectChats: ChatItem[] = projects.map((project) => {
      const existing = existingProjectMap.get(project.id)
      if (existing) {
        return {
          id: existing.id,
          type: 'project',
          name: project.name,
          subtitle: getStatusLabel(project.status, language),
          projectId: project.id,
          otherUserId: existing.admin_id,
        }
      }

      return {
        id: `project-${project.id}`,
        type: 'project',
        name: project.name,
        subtitle: getStatusLabel(project.status, language),
        projectId: project.id,
        otherUserId: undefined, // ✅ لا نحدد admin - سيكون admin_id = null
      }
    })

    const generalChat: ChatItem = existingGeneral
      ? {
          id: existingGeneral.id,
          type: 'general',
          name: generalChatName,
          subtitle: generalChatSubtitle,
          otherUserId: existingGeneral.admin_id,
        }
      : {
          id: GENERAL_CHAT_ID,
          type: 'general',
          name: generalChatName,
          subtitle: generalChatSubtitle,
          otherUserId: projects.find((p) => (p.team?.length || 0) > 0)?.team?.[0],
        }

    return [generalChat, ...projectChats]
  }, [isAdminMode, conversations, projects, language, generalChatName, generalChatSubtitle, unreadCounts, adminsWithConversations, currentUserId])

  const visibleChats = useMemo(() => {
    let list = chats
    if (chatFilter === 'unread') {
      list = list.filter((c) => (unreadCounts[c.id] ?? 0) > 0)
    }
    if (chatSearch.trim()) {
      const q = chatSearch.toLowerCase()
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q)
        || c.clientName?.toLowerCase().includes(q)
        || c.clientEmail?.toLowerCase().includes(q)
        || c.subtitle?.toLowerCase().includes(q)
      )
    }
    return list
  }, [chats, chatFilter, chatSearch, unreadCounts])

  const totalUnread = useMemo(
    () => Object.values(unreadCounts).reduce((sum, count) => sum + count, 0),
    [unreadCounts]
  )

  const waitingReplyCount = useMemo(() => {
    return chats.filter((chat) => {
      const msgs = chatMessages[chat.id]
      if (!msgs?.length) return false
      return msgs[msgs.length - 1].sender === 'received'
    }).length
  }, [chats, chatMessages])

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0]
  const activeMessages = chatMessages[activeChatId] ?? []
  const isTyping = typingChats[activeChatId] ?? false

  // تسجيل معلومات التصحيح
  useEffect(() => {
    console.log('🔍 معلومات التصحيح:')
    console.log('  - activeChatId:', activeChatId)
    console.log('  - activeConversationId:', activeConversationId)
    console.log('  - activeChat:', activeChat)
    console.log('  - activeChat?.clientName:', activeChat?.clientName)
    console.log('  - activeChat?.clientEmail:', activeChat?.clientEmail)
    console.log('  - activeMessages.length:', activeMessages.length)
    console.log('  - chatMessages keys:', Object.keys(chatMessages))
  }, [activeChatId, activeConversationId, activeChat, activeMessages.length, chatMessages])

  useEffect(() => {
    async function fetchProjects() {
      try {
        setProjectsLoading(true)
        if (isAdminMode) {
          // استخدام API الصحيح للحصول على المستخدمين المتاحين للمحادثة
          const [usersRes, projectsRes] = await Promise.all([
            getAvailableUsers(),
            getAllProjects({ limit: 200, offset: 0 }),
          ])
          if (usersRes.success && usersRes.data) {
            setAdminClients(usersRes.data as unknown as APIUser[])
          }
          if (projectsRes.success && projectsRes.data) {
            setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : [projectsRes.data])
          }
        } else {
          const response = await getMyProjects()
          if (response.success && response.data) {
            setProjects(Array.isArray(response.data) ? response.data : [response.data])
          }
        }
      } catch {
        if (isAdminMode) {
          setAdminClients([])
        }
        setProjects([])
      } finally {
        setProjectsLoading(false)
      }
    }

    fetchProjects()
  }, [isAdminMode])

  // جلب قائمة الإداريين (للإداريين فقط)
  useEffect(() => {
    async function loadAdmins() {
      if (!isAdminMode) return;
      
      try {
        console.log('📥 جلب قائمة الإداريين...')
        const res = await getAdminsWithConversationStatus()
        if (res.success && res.data) {
          console.log('✅ تم جلب', res.data.length, 'إداري')
          setAdminsWithConversations(res.data)
        }
      } catch (err) {
        console.error('❌ فشل جلب قائمة الإداريين:', err)
      }
    }

    loadAdmins()
  }, [isAdminMode])

  useEffect(() => {
    async function loadConversations() {
      try {
        setConversationsLoading(true)
        if (isAdminMode) {
          const res = await getAdminConversations({ limit: 100, offset: 0 })
          if (res.success && res.data) {
            setConversations(res.data)
            // تحديث الـ unread counts
            const unreadMap: Record<string, number> = {}
            res.data.forEach(conv => {
              unreadMap[conv.id] = conv.unread_count
            })
            setUnreadCounts(unreadMap)
            if (res.data.length > 0) {
              setActiveChatId((prev) => prev === GENERAL_CHAT_ID ? res.data[0].id : prev)
              setActiveConversationId((prev) => prev || res.data[0].id)
            }
          }
        } else {
          const res = await getClientConversations({ limit: 100, offset: 0 })
          if (res.success && res.data) {
            setConversations(res.data)
            const unreadMap: Record<string, number> = {}
            res.data.forEach(conv => {
              unreadMap[conv.id] = conv.unread_count
            })
            setUnreadCounts(unreadMap)
            if (res.data.length > 0) {
              setActiveChatId((prev) => prev === GENERAL_CHAT_ID ? res.data[0].id : prev)
              setActiveConversationId((prev) => prev || res.data[0].id)
            } else {
              // ✅ FIX: المستخدم الجديد - سيتم إنشاء محادثة General Inquiry عند إرسال أول رسالة
              console.log('📝 لا توجد محادثات للمستخدم الجديد')
              console.log('💡 محادثة General Inquiry ستُنشأ تلقائياً عند إرسال أول رسالة')
              // لا نفعل شيء هنا - سيتم الإنشاء في sendMessage()
            }
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
      } finally {
        setConversationsLoading(false)
      }
    }

    if (isAdminMode || !isAdminMode) {
      loadConversations()
    }
  }, [isAdminMode, wsConnected, wsJoinConversation])

  // تحميل الرسائل عند تغيير المحادثة النشطة
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) {
        console.log('⚠️ لا يوجد activeConversationId')
        
        // ✅ FIX: إذا لم يكن هناك محادثة، عرض رسالة ترحيبية للمستخدم الجديد
        if (!isAdminMode && activeChatId === GENERAL_CHAT_ID) {
          console.log('👋 عرض رسالة ترحيبية للمستخدم الجديد')
          setChatMessages(prev => ({
            ...prev,
            [GENERAL_CHAT_ID]: [getWelcomeMessage(language)]
          }))
        }
        
        return
      }

      try {
        console.log('📥 بدء تحميل الرسائل للمحادثة:', activeConversationId)
        setMessagesLoading(true)
        
        // الانضمام للمحادثة عبر WebSocket أولاً
        if (wsConnected) {
          console.log('🔌 الانضمام للمحادثة عبر WebSocket:', activeConversationId)
          wsJoinConversation(activeConversationId)
          // إعطاء وقت قصير للـ subscription
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        const res = await getConversationMessages(activeConversationId, { limit: 50, offset: 0 })
        console.log('📨 استجابة API للرسائل:', res)
        
        if (res.success && res.data) {
          console.log(`✅ تم تحميل ${res.data.length} رسالة`)
          console.log('📋 بيانات الرسائل:', res.data)
          
          // تحويل رسائل API إلى صيغة الـ UI
          const convertedMessages: Message[] = res.data.map(msg => {
            // ✅ FIX: تحديد sender بناءً على المستخدم الحالي، وليس النوع
            const isMyMessage = currentUserId && msg.sender_id === currentUserId
            const sender = isMyMessage ? 'sent' : 'received'
            
            console.log(`📝 رسالة ${msg.id}: sender_id=${msg.sender_id}, currentUserId=${currentUserId}, isMyMessage=${isMyMessage}, converted=${sender}`)
            
            return {
              id: msg.id,
              text: msg.text,
              sender,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              senderName: msg.sender?.display_name || msg.sender?.email,
              senderType: msg.sender_type === 'admin' ? 'admin' : 'client', // ✅ إضافة نوع المرسل الفعلي
              attachment: msg.attachment || undefined,
              status: msg.status
            }
          })
          
          console.log('💾 حفظ الرسائل في activeChatId:', activeChatId)
          console.log('💾 حفظ الرسائل في activeConversationId:', activeConversationId)
          console.log('💾 الرسائل المحولة:', convertedMessages)
          
          // CRITICAL FIX: استخدام activeChatId فقط لأنه هو المستخدم في العرض
          setChatMessages(prev => {
            const updated = { 
              ...prev,
              [activeChatId]: convertedMessages
            }
            console.log('💾 حالة chatMessages المحدثة:', updated)
            return updated
          })
          
          await markConversationAsRead(activeConversationId)
          
          // تحديث عداد الرسائل غير المقروءة باستخدام activeChatId
          setUnreadCounts(prev => ({ ...prev, [activeChatId]: 0 }))
          
          // تحديث حالة الرسائل غير المقروءة عبر WebSocket
          if (wsConnected && res.data.length > 0) {
            // إرسال تحديث لجميع الرسائل غير المقروءة من الطرف الآخر
            res.data.forEach(msg => {
              const isMyMessage = currentUserId && msg.sender_id === currentUserId
              if (msg.status !== 'read' && !isMyMessage) {
                wsUpdateMessageStatus(msg.id, activeConversationId, 'read')
              }
            })
          }
        } else {
          console.log('⚠️ لا توجد رسائل في الاستجابة')
          // حتى لو لم تكن هناك رسائل، قم بتهيئة المصفوفة
          setChatMessages(prev => ({
            ...prev,
            [activeChatId]: []
          }))
        }
      } catch (err) {
        console.error('❌ فشل تحميل الرسائل:', err)
        // في حالة الخطأ، قم بتهيئة المصفوفة
        setChatMessages(prev => ({
          ...prev,
          [activeChatId]: []
        }))
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [activeConversationId, activeChatId, isAdminMode, wsConnected, wsJoinConversation, wsUpdateMessageStatus, currentUserId, language])

  useEffect(() => {
    if (isAdminMode) return
    setChatMessages((prev) => {
      const currentMessages = prev[GENERAL_CHAT_ID] || []
      
      // إذا كانت هناك رسائل حقيقية (أكثر من الرسالة الترحيبية)، لا تغير شيء
      if (currentMessages.length > 1) return prev
      
      // إذا لم تكن هناك رسائل أو رسالة واحدة فقط (الترحيبية)، حدّث الرسالة الترحيبية
      return { ...prev, [GENERAL_CHAT_ID]: [getWelcomeMessage(language)] }
    })
  }, [language, isAdminMode])

  useEffect(() => {
    if (isAdminMode && onUnreadChange) {
      onUnreadChange(totalUnread)
    }
  }, [isAdminMode, onUnreadChange, totalUnread])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeMessages, isTyping, activeChatId, scrollToBottom])

  useEffect(() => {
    if (!showEmojiPicker) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        emojiPickerRef.current?.contains(target) ||
        emojiBtnRef.current?.contains(target)
      ) return
      setShowEmojiPicker(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)')

    const updateLayout = () => {
      const small = mediaQuery.matches
      setIsSmallScreen(small)
      setIsSidebarExpanded(!small)
    }

    updateLayout()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateLayout)
      return () => mediaQuery.removeEventListener('change', updateLayout)
    }

    mediaQuery.addListener(updateLayout)
    return () => mediaQuery.removeListener(updateLayout)
  }, [])

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const getLastMessagePreview = (chatId: string): string => {
    const chatMsgs = chatMessages[chatId]
    if (!chatMsgs || chatMsgs.length === 0) {
      return language === 'ar' ? 'لا توجد رسائل' : 'No messages yet'
    }
    const last = chatMsgs[chatMsgs.length - 1]
    if (last.attachment) {
      const prefix = last.attachment.type === 'image'
        ? (language === 'ar' ? '📷 صورة' : '📷 Image')
        : last.attachment.type === 'video'
          ? (language === 'ar' ? '🎬 فيديو' : '🎬 Video')
          : (language === 'ar' ? '📎 ملف' : '📎 File')
      return last.text ? `${prefix}: ${last.text.slice(0, 30)}` : prefix
    }
    return last.text.length > 40 ? `${last.text.slice(0, 40)}...` : last.text
  }

  const pushAutoReply = useCallback((chatId: string, hasAttachment: boolean) => {
    setTypingChats((prev) => ({ ...prev, [chatId]: true }))

    setTimeout(() => {
      setTypingChats((prev) => ({ ...prev, [chatId]: false }))
      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [
          ...(prev[chatId] ?? []),
          {
            id: Date.now() + 1,
            text: hasAttachment
              ? (language === 'ar'
                ? 'تم استلام الملف! سنراجعه والرد عليك قريباً.'
                : 'File received! We will review it and reply soon.')
              : (language === 'ar'
                ? 'تم استلام استفسارك! سنقوم بالرد عليك قريباً.'
                : 'Message received! We will reply soon.'),
            sender: 'received',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderName: language === 'ar' ? 'الدعم' : 'Support',
            senderType: 'admin', // ✅ رد تلقائي من الدعم (admin)
          },
        ],
      }))
    }, 2500)
  }, [language])

  const sendMessage = useCallback(async (text: string, attachment?: MessageAttachment) => {
    if (!text.trim() && !attachment) return

    console.log('📤 [SEND] محاولة إرسال رسالة:', {
      text: text.trim(),
      activeConversationId,
      activeChatId,
      wsConnected,
      hasAttachment: !!attachment
    })

    setIsSubmitting(true)
    
    // ✅ FIX: إذا لم يكن هناك activeConversationId، قم بإنشائه أولاً
    let conversationId = activeConversationId
    
    if (!conversationId) {
      console.log('📝 [SEND] لا يوجد activeConversationId، سيتم إنشاء محادثة General Inquiry تلقائياً...')
      
      try {
        // 🎯 للمستخدمين العاديين: إنشاء محادثة general بدون admin محدد
        // سيتم توجيهها لجميع الـ admins تلقائياً
        if (!isAdminMode) {
          console.log('📞 [SEND] إنشاء محادثة General Inquiry للمستخدم الجديد')
          
          // إنشاء المحادثة مباشرة عبر API
          const convRes = await apiCall<ConversationResponse>(`${BASE_PATH}/conversations`, {
            method: 'POST',
            body: JSON.stringify({
              type: 'general'
              // لا نرسل other_user_id - المحادثة ستكون عامة لجميع الـ admins
            })
          })
          
          if (convRes && convRes.success && convRes.data) {
            console.log('✅ [SEND] تم إنشاء محادثة:', convRes.data.id)
            conversationId = convRes.data.id
            setActiveConversationId(convRes.data.id)
            setConversations(prev => [...prev, convRes.data!])
            setActiveChatId(convRes.data.id)
            
            // الانضمام للمحادثة عبر WebSocket
            if (wsConnected) {
              wsJoinConversation(convRes.data.id)
              // إعطاء وقت قصير للـ subscription
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          } else {
            console.error('❌ [SEND] فشل إنشاء محادثة:', convRes)
            setIsSubmitting(false)
            return
          }
        } else {
          // الإداريين: يجب أن يكون لديهم conversationId دائماً
          console.error('❌ [SEND] لا يوجد activeConversationId للإداري')
          setIsSubmitting(false)
          return
        }
      } catch (err) {
        console.error('❌ [SEND] فشل إنشاء محادثة:', err)
        setIsSubmitting(false)
        return
      }
    }
    
    // إرسال الرسالة عبر WebSocket أولاً (سيتم broadcast تلقائياً من Backend)
    if (wsConnected) {
      console.log('📤 [SEND] إرسال الرسالة عبر WebSocket')
      wsSendMessage(conversationId, text.trim(), attachment)
      
      // ⚠️ لا نضيف الرسالة محلياً هنا! سننتظر رد message:sent من السيرفر
      // سيتم إضافتها تلقائياً في onMessageSent handler
      
      setInputValue('')
      setFileError(null)
      setIsSubmitting(false)
    } else {
      // Fallback: استخدام REST API إذا كان WebSocket غير متصل
      console.warn('⚠️ [SEND] WebSocket غير متصل، استخدام REST API')
      
      const chatId = activeChatId
      const tempId = `temp-${Date.now()}`
      const newMessage: Message = {
        id: tempId,
        text: text.trim(),
        sender: 'sent', // دائماً sent لأنها رسالة من المستخدم الحالي
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: isAdminMode
          ? (language === 'ar' ? 'الدعم' : 'Support')
          : (language === 'ar' ? 'أنت' : 'You'),
        senderType: isAdminMode ? 'admin' : 'client', // ✅ تحديد نوع المرسل
        attachment,
        status: 'sent'
      }

      // إضافة الرسالة محلياً مؤقتاً
      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), newMessage],
      }))
      setInputValue('')
      setFileError(null)

      // إرسال الرسالة إلى API
      createMessage({
        conversation_id: conversationId,
        text: text.trim(),
        attachment: attachment || undefined
      }).then((result) => {
        if (result.success && result.data) {
          // استبدال الرسالة المؤقتة بالرسالة الحقيقية
          setChatMessages((prev) => {
            const messages = prev[chatId] || []
            const updatedMessages = messages.map(msg =>
              msg.id === tempId
                ? {
                    ...msg,
                    id: result.data!.id,
                    status: result.data!.status as 'sent' | 'delivered' | 'read'
                  }
                : msg
            )
            return {
              ...prev,
              [chatId]: updatedMessages
            }
          })
        } else {
          // في حالة الفشل، إزالة الرسالة المؤقتة
          setChatMessages((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || []).filter(msg => msg.id !== tempId)
          }))
        }
        
        if (isAdminMode) {
          setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }))
        }
      }).catch((err) => {
        console.error('❌ [SEND] فشل إرسال الرسالة عبر REST API:', err)
        // إزالة الرسالة المؤقتة في حالة الفشل
        setChatMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter(msg => msg.id !== tempId)
        }))
      }).finally(() => {
        setIsSubmitting(false)
      })
    }
  }, [activeChatId, language, isAdminMode, activeConversationId, wsConnected, wsSendMessage, wsJoinConversation])

  // معالج الكتابة - إرسال إشارة "يكتب الآن"
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  /**
   * رفع ملف إلى S3 عبر REST API
   */
  const uploadFileToS3 = useCallback(async (file: File): Promise<MessageAttachment | null> => {
    try {
      setUploadingFile(true)
      setFileError(null)
      
      console.log('📤 [UPLOAD] بدء رفع الملف:', file.name, file.size)
      
      // إنشاء FormData
      const formData = new FormData()
      formData.append('file', file)
      
      // رفع الملف
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('لا يوجد token للمصادقة')
      }
      
      const response = await fetch(`${API_URL}/messages/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'فشل رفع الملف')
      }
      
      const result = await response.json()
      console.log('✅ [UPLOAD] تم رفع الملف بنجاح:', result.data)
      
      return result.data as MessageAttachment
    } catch (error: any) {
      console.error('❌ [UPLOAD] فشل رفع الملف:', error)
      setFileError(error.message || (language === 'ar' ? 'فشل رفع الملف' : 'File upload failed'))
      return null
    } finally {
      setUploadingFile(false)
    }
  }, [language])
  
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
    
    // إرسال إشارة بدء الكتابة
    if (activeConversationId && wsConnected && value.trim()) {
      const displayName = isAdminMode 
        ? (language === 'ar' ? 'الدعم' : 'Support')
        : undefined
      
      wsSendTypingStart(activeConversationId, displayName)
      
      // إلغاء المؤقت السابق
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // إرسال إشارة إيقاف الكتابة بعد 3 ثواني من عدم الكتابة
      typingTimeoutRef.current = setTimeout(() => {
        if (activeConversationId && wsConnected) {
          wsSendTypingStop(activeConversationId)
        }
      }, 3000)
    }
  }, [activeConversationId, wsConnected, wsSendTypingStart, wsSendTypingStop, isAdminMode, language])

  // 🧪 دالة اختبار REST API
  const testRestAPI = useCallback(async () => {
    if (!activeConversationId) {
      alert('❌ لا توجد محادثة نشطة')
      console.error('❌ لا يوجد activeConversationId')
      return
    }

    const testMessage = '🧪 اختبار REST API - ' + new Date().toLocaleTimeString('ar-SA')
    
    console.log('═══════════════════════════════════════')
    console.log('🧪 [TEST] بدء اختبار REST API')
    console.log('Conversation ID:', activeConversationId)
    console.log('Test Message:', testMessage)
    console.log('═══════════════════════════════════════')

    try {
      const result = await createMessage({
        conversation_id: activeConversationId,
        text: testMessage
      })

      console.log('✅ [TEST] نجح الطلب:', result)
      
      if (result.success && result.data) {
        console.log('✅✅ [TEST] تم حفظ الرسالة بنجاح!')
        console.log('Message ID:', result.data.id)
        console.log('Created At:', result.data.created_at)
        console.log('Sender Type:', result.data.sender_type)
        
        alert(
          `✅ نجح اختبار REST API!\n\n` +
          `Message ID: ${result.data.id}\n` +
          `Created: ${new Date(result.data.created_at).toLocaleString('ar-SA')}\n` +
          `Sender: ${result.data.sender_type}\n\n` +
          `التشخيص: قاعدة البيانات تعمل ✅\n` +
          `المشكلة في WebSocket فقط ⚠️`
        )
        
        // إعادة تحميل الرسائل من API
        const res = await getConversationMessages(activeConversationId, { limit: 50, offset: 0 })
        if (res.success && res.data) {
          const convertedMessages: Message[] = res.data.map(msg => {
            const isMyMessage = currentUserId && msg.sender_id === currentUserId
            return {
              id: msg.id,
              text: msg.text,
              sender: isMyMessage ? 'sent' : 'received',
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              senderName: msg.sender?.display_name || msg.sender?.email,
              attachment: msg.attachment ? {
                type: msg.attachment.type,
                url: msg.attachment.url,
                name: msg.attachment.name,
                size: msg.attachment.size || 0
              } : undefined,
              status: msg.status
            }
          })
          
          setChatMessages(prev => ({
            ...prev,
            [activeConversationId]: convertedMessages,
            [activeChatId]: convertedMessages
          }))
        }
      } else {
        console.error('❌ [TEST] فشل حفظ الرسالة:', result)
        alert('❌ فشل الاختبار:\n\n' + JSON.stringify(result, null, 2))
      }
    } catch (error: any) {
      console.error('❌ [TEST] خطأ في الطلب:', error)
      alert(
        `❌ خطأ في الاختبار:\n\n` +
        `${error.message || error}\n\n` +
        `التشخيص: مشكلة في الاتصال أو الصلاحيات`
      )
    }
    
    console.log('═══════════════════════════════════════')
  }, [activeConversationId, activeChatId, isAdminMode])

  const handleSelectChat = async (chatId: string) => {
    console.log('🎯 تم اختيار محادثة:', chatId)
    setActiveChatId(chatId)
    if (isSmallScreen) {
      setIsSidebarExpanded(false)
    }

    // مغادرة المحادثة السابقة
    if (activeConversationId && wsConnected) {
      console.log('👋 مغادرة المحادثة السابقة:', activeConversationId)
      wsLeaveConversation(activeConversationId)
    }

    if (isAdminMode) {
      console.log('👨‍💼 وضع المدير - تحديث المحادثة النشطة إلى:', chatId)
      
      // التحقق إذا كان chatId هو placeholder لإداري (admin-xxx)
      if (chatId.startsWith('admin-')) {
        // هذه محادثة إداري لم تُنشأ بعد
        const adminId = chatId.replace('admin-', '')
        console.log('📞 إنشاء محادثة admin_internal مع:', adminId)
        
        try {
          const convRes = await getOrCreateConversation({
            other_user_id: adminId,
            type: 'admin_internal' as any, // سنحتاج تحديث الـ type
            project_id: undefined
          })
          
          if (convRes && convRes.success && convRes.data) {
            console.log('✅ تم إنشاء محادثة admin_internal:', convRes.data.id)
            setActiveConversationId(convRes.data.id)
            setConversations(prev => [...prev, convRes.data!])
            
            // تحديث adminsWithConversations
            setAdminsWithConversations(prev => 
              prev.map(item => 
                item.admin.id === adminId 
                  ? { ...item, conversation: convRes.data!, hasConversation: true }
                  : item
              )
            )
            
            // الانضمام للمحادثة عبر WebSocket
            if (wsConnected) {
              wsJoinConversation(convRes.data.id)
            }
          }
        } catch (err) {
          console.error('❌ فشل إنشاء محادثة admin_internal:', err)
        }
        
        return
      }
      
      // محادثة موجودة مسبقاً
      setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }))
      setActiveConversationId(chatId)
      
      // الانضمام للمحادثة الجديدة عبر WebSocket
      if (wsConnected) {
        console.log('🔌 الانضمام للمحادثة عبر WebSocket:', chatId)
        wsJoinConversation(chatId)
      }
      
      return
    }

    const existing = conversations.find((c) => c.id === chatId)
    if (existing) {
      console.log('✅ محادثة موجودة مسبقاً:', existing.id)
      setActiveConversationId(existing.id)
      
      // الانضمام للمحادثة عبر WebSocket
      if (wsConnected) {
        console.log('🔌 الانضمام للمحادثة عبر WebSocket:', existing.id)
        wsJoinConversation(existing.id)
      }
      
      return
    }

    // user mode: create conversation for placeholders (general/project)
    try {
      const chatItem = chats.find(c => c.id === chatId)
      console.log('🔍 البحث عن chatItem:', chatItem)
      
      // ✅ FIX: لمحادثات المشاريع، نسمح بـ other_user_id = null
      // سيتم إنشاء المحادثة بـ: client_id = user, admin_id = null, project_id = project
      const otherUserId = chatItem?.otherUserId || null
      
      // للمحادثات العامة، يجب أن يكون هناك otherUserId
      if (chatItem?.type === 'general' && !otherUserId) {
        console.log('⚠️ محادثة عامة تحتاج إلى otherUserId')
        setActiveConversationId(null)
        return
      }

      console.log('📞 إنشاء أو جلب محادثة - Type:', chatItem?.type, 'OtherUserId:', otherUserId, 'ProjectId:', chatItem?.projectId)
      
      const convRes = await getOrCreateConversation({
        other_user_id: otherUserId || undefined,
        type: chatItem!.type,
        project_id: chatItem!.projectId
      })
      
      console.log('📨 استجابة إنشاء/جلب المحادثة:', convRes)
      
      if (convRes && convRes.success && convRes.data) {
        console.log('✅ تم إنشاء/جلب المحادثة:', convRes.data.id)
        setActiveConversationId(convRes.data.id)
        setConversations(prev => (convRes.data ? [...prev.filter(c => c.id !== convRes.data!.id), convRes.data!] : prev))
        
        // الانضمام للمحادثة عبر WebSocket
        if (wsConnected) {
          console.log('🔌 الانضمام للمحادثة الجديدة عبر WebSocket:', convRes.data.id)
          wsJoinConversation(convRes.data.id)
        }
      } else {
        console.log('❌ فشل إنشاء/جلب المحادثة')
        setActiveConversationId(null)
      }
    } catch (err) {
      console.error('❌ خطأ في اختيار المحادثة:', err)
      setActiveConversationId(null)
    }
  }

  const handleFileSelect = useCallback(async (file: File, forcedType?: MessageAttachment['type']) => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    const type: MessageAttachment['type'] = forcedType ?? (
      isImage ? 'image' : isVideo ? 'video' : 'file'
    )

    if (type === 'image' && !isImage) {
      setFileError(language === 'ar' ? 'يرجى اختيار صورة صالحة' : 'Please select a valid image file')
      return
    }
    if (type === 'video' && !isVideo) {
      setFileError(language === 'ar' ? 'يرجى اختيار فيديو صالح' : 'Please select a valid video file')
      return
    }

    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : type === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE
    if (file.size > maxSize) {
      setFileError(
        language === 'ar'
          ? `حجم الملف كبير جداً (الحد الأقصى ${formatFileSize(maxSize)})`
          : `File too large (max ${formatFileSize(maxSize)})`
      )
      return
    }

    // إنشاء معاينة للصور والفيديو
    let previewUrl: string | undefined
    if (isImage || isVideo) {
      previewUrl = URL.createObjectURL(file)
    }

    // عرض معاينة الملف
    setSelectedFilePreview({
      file,
      type,
      previewUrl
    })
    setFileError(null)
  }, [language])

  // دالة لإرسال الملف المعاين
  const handleSendSelectedFile = useCallback(async () => {
    if (!selectedFilePreview) return

    const { file } = selectedFilePreview

    // رفع الملف إلى S3
    console.log('🚀 [FILE] بدء رفع الملف إلى S3')
    const attachment = await uploadFileToS3(file)
    
    // تنظيف المعاينة
    if (selectedFilePreview.previewUrl) {
      URL.revokeObjectURL(selectedFilePreview.previewUrl)
    }
    setSelectedFilePreview(null)
    
    if (!attachment) {
      console.error('❌ [FILE] فشل رفع الملف')
      return
    }
    
    console.log('✅ [FILE] تم رفع الملف بنجاح، إرسال الرسالة:', attachment)
    
    // إرسال الرسالة مع المرفق
    sendMessage(inputValue, attachment)
  }, [selectedFilePreview, inputValue, sendMessage, uploadFileToS3])

  // دالة لإلغاء معاينة الملف
  const handleCancelFilePreview = useCallback(() => {
    if (selectedFilePreview?.previewUrl) {
      URL.revokeObjectURL(selectedFilePreview.previewUrl)
    }
    setSelectedFilePreview(null)
    setFileError(null)
  }, [selectedFilePreview])

  // دالة لإرسال طلب الدفع
  const handleSendPaymentRequest = useCallback(async () => {
    const amount = parseFloat(paymentAmount)
    
    if (isNaN(amount) || amount <= 0) {
      setFileError(language === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount')
      return
    }
    
    // إنشاء payment attachment
    const paymentAttachment: MessageAttachment = {
      type: 'payment_request',
      url: '', // لا نحتاج URL فعلي
      name: `Payment Request: $${amount}`,
      size: 0,
      payment_data: {
        amount,
        currency: 'USD',
        description: paymentDescription.trim() || undefined,
        // سيتم توليد رابط الدفع في Backend
      }
    }
    
    // إرسال رسالة مع طلب الدفع
    const message = paymentDescription.trim() 
      ? paymentDescription 
      : (language === 'ar' 
        ? `طلب دفع بمبلغ $${amount}` 
        : `Payment request for $${amount}`)
    
    await sendMessage(message, paymentAttachment)
    
    // إغلاق الـ dialog
    setShowPaymentDialog(false)
    setPaymentAmount('')
    setPaymentDescription('')
    setFileError(null)
  }, [paymentAmount, paymentDescription, language, sendMessage])

  // دالة لإلغاء طلب الدفع
  const handleCancelPaymentRequest = useCallback(() => {
    setShowPaymentDialog(false)
    setPaymentAmount('')
    setPaymentDescription('')
    setFileError(null)
  }, [])

  // معالجات السحب والإفلات
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // فقط إذا غادرنا المنطقة تماماً
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    forcedType?: MessageAttachment['type']
  ) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) handleFileSelect(file, forcedType)
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return
    sendMessage(inputValue)
  }

  const renderAttachment = (attachment: MessageAttachment) => {
    // طلب دفع
    if (attachment.type === 'payment_request' && attachment.payment_data) {
      const { amount, currency, description, payment_link } = attachment.payment_data
      
      return (
        <div className={styles.paymentRequestCard}>
          <div className={styles.paymentRequestHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span className={styles.paymentRequestTitle}>
              {language === 'ar' ? 'طلب دفع' : 'Payment Request'}
            </span>
          </div>
          <div className={styles.paymentRequestBody}>
            <div className={styles.paymentRequestAmount}>
              <span className={styles.paymentCurrency}>{currency}</span>
              <span className={styles.paymentValue}>{amount.toFixed(2)}</span>
            </div>
            {description && (
              <p className={styles.paymentRequestDescription}>{description}</p>
            )}
          </div>
          <div className={styles.paymentRequestActions}>
            {payment_link ? (
              <a 
                href={payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.paymentRequestButton}
              >
                {language === 'ar' ? '💳 ادفع الآن' : '💳 Pay Now'}
              </a>
            ) : (
              <button 
                className={styles.paymentRequestButton}
                onClick={() => {
                  // سيتم تنفيذ الدفع باستخدام SpaceRemit
                  const paymentUrl = `/payment?amount=${amount}&currency=${currency}&notes=${encodeURIComponent(description || '')}&source=chat`
                  window.open(paymentUrl, '_blank')
                }}
              >
                {language === 'ar' ? '💳 ادفع الآن' : '💳 Pay Now'}
              </button>
            )}
          </div>
        </div>
      )
    }
    
    if (attachment.type === 'image') {
      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.messageAttachmentLink}
        >
          <img
            src={attachment.url}
            alt={attachment.name}
            className={styles.messageImage}
          />
        </a>
      )
    }

    if (attachment.type === 'video') {
      return (
        <video
          src={attachment.url}
          controls
          playsInline
          className={styles.messageVideo}
          preload="metadata"
        />
      )
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        download={attachment.name}
        className={styles.messageFile}
      >
        <span className={styles.messageFileIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </span>
        <span className={styles.messageFileInfo}>
          <span className={styles.messageFileName}>{attachment.name}</span>
          <span className={styles.messageFileSize}>{formatFileSize(attachment.size)}</span>
        </span>
      </a>
    )
  }

  const getChatAvatar = (chat: ChatItem): string => {
    if (chat.type === 'general' && !isAdminMode) return '?'
    return (chat.clientName || chat.name).charAt(0).toUpperCase()
  }

  const lastMessageFromClient = activeMessages.length > 0 && activeMessages[activeMessages.length - 1].sender === 'received'

  return (
    <div className={`${styles.chatContainer} ${isAdminMode ? styles.chatContainerAdmin : ''}`} dir={dir}>
      {isAdminMode && (
        <div className={styles.adminStatsBar}>
          <div className={styles.adminStatCard}>
            <span className={styles.adminStatValue}>{totalUnread}</span>
            <span className={styles.adminStatLabel}>
              {language === 'ar' ? 'غير مقروء' : 'Unread'}
            </span>
          </div>
          <div className={styles.adminStatCard}>
            <span className={styles.adminStatValue}>{waitingReplyCount}</span>
            <span className={styles.adminStatLabel}>
              {language === 'ar' ? 'بانتظار الرد' : 'Awaiting Reply'}
            </span>
          </div>
          <div className={styles.adminStatCard}>
            <span className={styles.adminStatValue}>{chats.length}</span>
            <span className={styles.adminStatLabel}>
              {language === 'ar' ? 'المحادثات' : 'Conversations'}
            </span>
          </div>
        </div>
      )}

      <div className={styles.chatMainRow}>
      <div className={styles.chatWindow}>
        {isDragging && (
          <div className={styles.dragOverlay}>
            <div className={styles.dragOverlayContent}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>{language === 'ar' ? 'أفلت الملف هنا' : 'Drop file here'}</p>
            </div>
          </div>
        )}
        <div className={styles.chatHeader}>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>
              {/* عرض اسم الطرف الآخر بناءً على نوع المحادثة */}
              {activeChat?.type === 'general'
                ? (language === 'ar'
                  ? `استفسار — ${activeChat?.clientName || activeChat?.name}`
                  : `Inquiry — ${activeChat?.clientName || activeChat?.name}`)
                : (language === 'ar'
                  ? `${activeChat?.name}${activeChat?.clientName ? ' · ' + activeChat?.clientName : ''}`
                  : `${activeChat?.name}${activeChat?.clientName ? ' · ' + activeChat?.clientName : ''}`)}
            </span>
            <span className={styles.headerStatus}>
              {/* عرض البريد الإلكتروني للطرف الآخر */}
              {activeChat?.clientEmail || activeChat?.subtitle || ''}
              {/* مؤشر حالة WebSocket */}
              {wsStatus === 'connected' && (
                <span style={{ marginLeft: '8px', marginRight: '8px', color: '#4ade80' }} title="WebSocket متصل">
                  ●
                </span>
              )}
              {wsStatus === 'connecting' && (
                <span style={{ marginLeft: '8px', marginRight: '8px', color: '#fbbf24' }} title="جاري الاتصال...">
                  ●
                </span>
              )}
              {wsStatus === 'reconnecting' && (
                <span style={{ marginLeft: '8px', marginRight: '8px', color: '#fb923c' }} title="إعادة الاتصال...">
                  ●
                </span>
              )}
              {(wsStatus === 'disconnected' || wsStatus === 'failed') && (
                <span style={{ marginLeft: '8px', marginRight: '8px', color: '#ef4444' }} title="غير متصل">
                  ●
                </span>
              )}
            </span>
          </div>
          {isAdminMode && lastMessageFromClient && (
            <span className={styles.needsReplyBadge}>
              {language === 'ar' ? '● يحتاج رد' : '● Needs reply'}
            </span>
          )}
        </div>

        <div 
          className={styles.chatMessages}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {activeMessages.length === 0 && (
            <div className={styles.emptyChat}>
              <span className={styles.emptyChatIcon}>💬</span>
              <p>{language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}</p>
              <p className={styles.emptyChatHint}>
                {language === 'ar' ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}
              </p>
            </div>
          )}
          {activeMessages.map((msg) => (
            <div key={msg.id} className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
              <div className={styles.messageAvatar}>
                {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : (msg.sender === 'sent' ? 'U' : 'S')}
              </div>
              <div className={styles.messageContentWrapper}>
                <div className={styles.messageMeta}>
                  <span>{msg.time}</span>
                  {/* عرض الـ badge بناءً على senderType الفعلي من API */}
                  {msg.senderType === 'client' && (
                    <span className={styles.clientRole}>
                      {language === 'ar' ? 'عميل' : 'client'}
                    </span>
                  )}
                  {msg.senderType === 'admin' && (
                    <span className={styles.adminRole}>admin</span>
                  )}
                  <span className={styles.adminName}>{msg.senderName}</span>
                </div>
                <div className={styles.messageContent}>
                  {msg.attachment && (
                    <div className={styles.messageAttachment}>
                      {renderAttachment(msg.attachment)}
                    </div>
                  )}
                  {msg.text && <span>{msg.text}</span>}
                  {/* مؤشر حالة الرسالة */}
                  {msg.sender === 'sent' && msg.status && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      marginLeft: '4px',
                      marginRight: '4px',
                      color: msg.status === 'read' ? '#4ade80' : '#9ca3af',
                      display: 'inline-block',
                      verticalAlign: 'bottom'
                    }}>
                      {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.received}`}>
              <div className={styles.messageAvatar}>S</div>
              <div className={styles.messageContentWrapper}>
                <div className={styles.typingIndicator}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputArea}>
          {fileError && (
            <p className={styles.fileError} role="alert">
              {fileError}
            </p>
          )}
          {uploadingFile && (
            <p className={styles.uploadingIndicator} role="status">
              {language === 'ar' ? '📤 جاري رفع الملف...' : '📤 Uploading file...'}
            </p>
          )}
          {selectedFilePreview && (
            <div className={styles.filePreviewContainer}>
              <div className={styles.filePreviewContent}>
                {selectedFilePreview.type === 'image' && selectedFilePreview.previewUrl && (
                  <img 
                    src={selectedFilePreview.previewUrl} 
                    alt={selectedFilePreview.file.name}
                    className={styles.filePreviewImage}
                  />
                )}
                {selectedFilePreview.type === 'video' && selectedFilePreview.previewUrl && (
                  <video 
                    src={selectedFilePreview.previewUrl}
                    controls
                    className={styles.filePreviewVideo}
                  />
                )}
                {selectedFilePreview.type === 'file' && (
                  <div className={styles.filePreviewFile}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
                <div className={styles.filePreviewInfo}>
                  <span className={styles.filePreviewName}>{selectedFilePreview.file.name}</span>
                  <span className={styles.filePreviewSize}>{formatFileSize(selectedFilePreview.file.size)}</span>
                </div>
              </div>
              <div className={styles.filePreviewActions}>
                <button 
                  type="button"
                  onClick={handleCancelFilePreview}
                  className={styles.filePreviewCancel}
                  disabled={uploadingFile}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="button"
                  onClick={handleSendSelectedFile}
                  className={styles.filePreviewSend}
                  disabled={uploadingFile}
                >
                  {uploadingFile 
                    ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                    : (language === 'ar' ? 'إرسال' : 'Send')
                  }
                </button>
              </div>
            </div>
          )}
          {/* Payment Request Dialog */}
          {showPaymentDialog && (
            <div className={styles.paymentDialog}>
              <div className={styles.paymentDialogContent}>
                <div className={styles.paymentDialogHeader}>
                  <h3>{language === 'ar' ? 'إرسال طلب دفع' : 'Send Payment Request'}</h3>
                  <button 
                    type="button"
                    onClick={handleCancelPaymentRequest}
                    className={styles.paymentDialogClose}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className={styles.paymentDialogBody}>
                  <div className={styles.paymentDialogField}>
                    <label htmlFor="paymentAmount">
                      {language === 'ar' ? 'المبلغ المطلوب (USD)' : 'Amount (USD)'}
                    </label>
                    <input
                      id="paymentAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder={language === 'ar' ? '0.00' : '0.00'}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className={styles.paymentDialogInput}
                      autoFocus
                    />
                  </div>
                  <div className={styles.paymentDialogField}>
                    <label htmlFor="paymentDescription">
                      {language === 'ar' ? 'الوصف (اختياري)' : 'Description (optional)'}
                    </label>
                    <textarea
                      id="paymentDescription"
                      placeholder={language === 'ar' ? 'مثال: دفعة أولى للمشروع' : 'e.g: Initial project payment'}
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      className={styles.paymentDialogTextarea}
                      rows={3}
                    />
                  </div>
                  {fileError && (
                    <p className={styles.paymentDialogError}>{fileError}</p>
                  )}
                </div>
                <div className={styles.paymentDialogActions}>
                  <button 
                    type="button"
                    onClick={handleCancelPaymentRequest}
                    className={styles.paymentDialogCancelBtn}
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleSendPaymentRequest}
                    className={styles.paymentDialogSendBtn}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  >
                    {language === 'ar' ? 'إرسال الطلب' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          )}
        <form className={styles.chatInputContainer} onSubmit={handleSend}>
          <button type="submit" className={styles.sendBtn} disabled={!inputValue.trim() || uploadingFile}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }}>
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
          </button>

          <div className={styles.chatInputWrapper}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder={
                isAdminMode
                  ? (language === 'ar' ? 'اكتب ردك للعميل...' : 'Type your reply to the client...')
                  : (language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...')
              }
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <button
              ref={emojiBtnRef}
              type="button"
              className={`${styles.emojiBtn} ${showEmojiPicker ? styles.emojiBtnActive : ''}`}
              title={language === 'ar' ? 'إيموجي' : 'Emoji'}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className={styles.emojiPicker}>
                <EmojiPicker
                  theme={Theme.DARK}
                  width={320}
                  height={400}
                  lazyLoadEmojis
                  searchDisabled={true}
                  emojiStyle={EmojiStyle.NATIVE}
                  previewConfig={{ showPreview: false }}
                  onEmojiClick={handleEmojiSelect}
                />
              </div>
            )}
          </div>

          <div className={styles.actionIcons}>
            <input
              ref={attachInputRef}
              type="file"
              className={styles.hiddenFileInput}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              onChange={(e) => handleFileInputChange(e)}
            />
            <input
              ref={videoInputRef}
              type="file"
              className={styles.hiddenFileInput}
              accept="video/*"
              onChange={(e) => handleFileInputChange(e, 'video')}
            />
            <input
              ref={imageInputRef}
              type="file"
              className={styles.hiddenFileInput}
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, 'image')}
            />
            {/* زر طلب الدفع - فقط للإداريين */}
            {isAdminMode && (
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.paymentBtn}`}
                title={language === 'ar' ? 'إرسال طلب دفع' : 'Send payment request'}
                aria-label={language === 'ar' ? 'إرسال طلب دفع' : 'Send payment request'}
                onClick={() => setShowPaymentDialog(true)}
                disabled={uploadingFile}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </button>
            )}
            <button
              type="button"
              className={styles.actionBtn}
              title={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
              aria-label={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
              onClick={() => attachInputRef.current?.click()}
              disabled={uploadingFile}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              title={language === 'ar' ? 'إرفاق فيديو' : 'Attach video'}
              aria-label={language === 'ar' ? 'إرفاق فيديو' : 'Attach video'}
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingFile}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              title={language === 'ar' ? 'إرفاق صورة' : 'Attach image'}
              aria-label={language === 'ar' ? 'إرفاق صورة' : 'Attach image'}
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingFile}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          </div>
        </form>
        </div>
      </div>

      <aside className={`${styles.chatSidebar} ${isSmallScreen && !isSidebarExpanded ? styles.chatSidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderMain}>
            <span className={styles.sidebarTitle}>
              {language === 'ar' ? 'المحادثات' : 'Chats'}
            </span>
            <span className={styles.sidebarCount}>
              {isAdminMode && totalUnread > 0 ? totalUnread : chats.length}
            </span>
          </div>
          <button
            type="button"
            className={`${styles.sidebarToggleBtn} ${isSidebarExpanded ? styles.sidebarToggleBtnExpanded : ''}`}
            onClick={() => setIsSidebarExpanded(prev => !prev)}
            aria-label={isSidebarExpanded
              ? (language === 'ar' ? 'إخفاء قائمة المحادثات' : 'Hide chats list')
              : (language === 'ar' ? 'إظهار قائمة المحادثات' : 'Show chats list')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {isSidebarExpanded && isAdminMode && (
          <>
            <div className={styles.sidebarSearchWrap}>
              <input
                type="text"
                className={styles.sidebarSearch}
                placeholder={language === 'ar' ? 'بحث عن عميل...' : 'Search client...'}
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
              />
            </div>
            <div className={styles.chatFilterRow}>
              <button
                type="button"
                className={`${styles.chatFilterBtn} ${chatFilter === 'all' ? styles.chatFilterBtnActive : ''}`}
                onClick={() => setChatFilter('all')}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                className={`${styles.chatFilterBtn} ${chatFilter === 'unread' ? styles.chatFilterBtnActive : ''}`}
                onClick={() => setChatFilter('unread')}
              >
                {language === 'ar' ? 'غير مقروء' : 'Unread'}
                {totalUnread > 0 && <span className={styles.filterBadge}>{totalUnread}</span>}
              </button>
            </div>
          </>
        )}

        {isSidebarExpanded && (
        <div className={styles.chatList}>
          {projectsLoading && (isAdminMode ? visibleChats.length === 0 : chats.length <= 1) && (
            <div className={styles.sidebarLoading}>
              {language === 'ar'
                ? (isAdminMode ? 'جاري تحميل المحادثات...' : 'جاري تحميل المشاريع...')
                : (isAdminMode ? 'Loading conversations...' : 'Loading projects...')}
            </div>
          )}

          {!projectsLoading && visibleChats.length === 0 && (
            <div className={styles.sidebarLoading}>
              {language === 'ar' ? 'لا توجد محادثات' : 'No conversations found'}
            </div>
          )}

          {visibleChats.map((chat) => {
            const unread = unreadCounts[chat.id] ?? 0
            return (
            <button
              key={chat.id}
              type="button"
              className={`${styles.chatListItem} ${activeChatId === chat.id ? styles.chatListItemActive : ''} ${chat.type === 'general' ? styles.chatListItemGeneral : ''} ${unread > 0 ? styles.chatListItemUnread : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className={`${styles.chatListAvatar} ${chat.type === 'general' ? styles.chatListAvatarGeneral : ''}`}>
                {getChatAvatar(chat)}
              </div>
              <div className={styles.chatListInfo}>
                <div className={styles.chatListTop}>
                  <span className={styles.chatListName}>
                    {isAdminMode && chat.type === 'project' ? chat.clientName : chat.name}
                  </span>
                  {chat.type === 'general' && !isAdminMode && (
                    <span className={styles.generalBadge}>
                      {language === 'ar' ? 'أساسي' : 'Main'}
                    </span>
                  )}
                  {isAdminMode && chat.type === 'project' && (
                    <span className={styles.projectChatBadge}>
                      {language === 'ar' ? 'مشروع' : 'Project'}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className={styles.unreadBadge}>{unread}</span>
                  )}
                </div>
                <span className={styles.chatListPreview}>
                  {isAdminMode && chat.type === 'project' ? chat.name : getLastMessagePreview(chat.id)}
                </span>
                {isAdminMode && (
                  <span className={styles.chatListSubline}>{chat.subtitle}</span>
                )}
              </div>
            </button>
          )})}
        </div>
        )}
      </aside>
      </div>
    </div>
  )
}
