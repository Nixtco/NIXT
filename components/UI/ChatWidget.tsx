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
  type Conversation,
  type Message as APIMessage,
  type AdminStats
} from '@/app/messages/apiFunctions'

export interface ChatWidgetProps {
  mode?: 'user' | 'admin'
  onUnreadChange?: (count: number) => void
}

interface MessageAttachment {
  type: 'image' | 'video' | 'file'
  url: string
  name: string
  size: number
}

interface Message {
  id: number
  text: string
  sender: 'sent' | 'received'
  time: string
  senderName?: string
  attachment?: MessageAttachment
}

type ChatType = 'general' | 'project'

interface ChatItem {
  id: string
  type: ChatType
  name: string
  subtitle?: string
  projectId?: string
  clientId?: string
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
      },
      {
        id: 1002,
        text: language === 'ar'
          ? 'هل يمكن تحديثي على آخر التطورات؟'
          : 'Can you update me on the latest progress?',
        sender: 'received',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: name,
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
    }]
    unread[id] = 1
  }

  return { messages, unread }
}

const GENERAL_CHAT_ID = 'general'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const MAX_FILE_SIZE = 25 * 1024 * 1024

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

export default function ChatWidget({ mode = 'user', onUnreadChange }: ChatWidgetProps) {
  const isAdminMode = mode === 'admin'
  const { language, dir } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [adminClients, setAdminClients] = useState<APIUser[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [conversationsLoading, setConversationsLoading] = useState(false)

  // API-based state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  // UI state
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(
    mode === 'admin' ? {} : { [GENERAL_CHAT_ID]: [getWelcomeMessage(language)] }
  )
  const [activeChatId, setActiveChatId] = useState(GENERAL_CHAT_ID)
  const [typingChats, setTypingChats] = useState<Record<string, boolean>>({})
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [chatFilter, setChatFilter] = useState<'all' | 'unread'>('all')
  const [chatSearch, setChatSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generalChatName = language === 'ar' ? 'استفسار عام' : 'General Inquiry'
  const generalChatSubtitle = language === 'ar' ? 'اسأل عن أي شيء' : 'Ask about anything'

  const chats = useMemo<ChatItem[]>(() => {
    if (isAdminMode) {
      const items: ChatItem[] = []

      for (const client of adminClients) {
        const clientName = getClientDisplayName(client)
        items.push({
          id: buildAdminChatId(client.id, 'general'),
          type: 'general',
          name: clientName,
          subtitle: language === 'ar' ? 'استفسار عام' : 'General Inquiry',
          clientId: client.id,
          clientName,
          clientEmail: client.email,
        })

        for (const project of projects.filter((p) => p.user_id === client.id)) {
          items.push({
            id: buildAdminChatId(client.id, 'project', project.id),
            type: 'project',
            name: project.name,
            subtitle: getStatusLabel(project.status, language),
            projectId: project.id,
            clientId: client.id,
            clientName,
            clientEmail: client.email,
          })
        }
      }

      return items.sort((a, b) => (unreadCounts[b.id] ?? 0) - (unreadCounts[a.id] ?? 0))
    }

    const projectChats: ChatItem[] = projects.map((project) => ({
      id: project.id,
      type: 'project',
      name: project.name,
      subtitle: getStatusLabel(project.status, language),
      projectId: project.id,
    }))

    return [
      {
        id: GENERAL_CHAT_ID,
        type: 'general',
        name: generalChatName,
        subtitle: generalChatSubtitle,
      },
      ...projectChats,
    ]
  }, [isAdminMode, adminClients, projects, language, generalChatName, generalChatSubtitle, unreadCounts])

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

  useEffect(() => {
    async function fetchProjects() {
      try {
        setProjectsLoading(true)
        if (isAdminMode) {
          const [usersRes, projectsRes] = await Promise.all([
            getAllUsers({ limit: 200, offset: 0 }),
            getAllProjects({ limit: 200, offset: 0 }),
          ])
          if (usersRes.success && usersRes.data) {
            setAdminClients(usersRes.data)
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
          }
        } else {
          const res = await getClientConversations({ limit: 100, offset: 0 })
          if (res.success && res.data) {
            setConversations(res.data)
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
  }, [isAdminMode])

  // تحميل الرسائل عند تغيير المحادثة النشطة
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) return

      try {
        setMessagesLoading(true)
        const res = await getConversationMessages(activeConversationId, { limit: 50, offset: 0 })
        if (res.success && res.data) {
          // تحويل رسائل API إلى صيغة الـ UI
          const convertedMessages: Message[] = res.data.map(msg => ({
            id: msg.id.charCodeAt(0), // استخدم الأحرف الأولى من ID كـ number مؤقتاً
            text: msg.text,
            sender: msg.sender_type === 'admin' ? 'sent' : 'received',
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderName: msg.sender?.display_name || msg.sender?.email,
            attachment: msg.attachment || undefined
          }))
          setChatMessages(prev => ({ ...prev, [activeConversationId]: convertedMessages }))
          
          // تحديد الرسائل كمقروءة للمدير
          if (isAdminMode) {
            await markConversationAsRead(activeConversationId)
          }
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [activeConversationId, isAdminMode])

  useEffect(() => {
    if (isAdminMode) return
    setChatMessages((prev) => {
      if (prev[GENERAL_CHAT_ID]) return prev
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
          },
        ],
      }))
    }, 2500)
  }, [language])

  const sendMessage = useCallback((text: string, attachment?: MessageAttachment) => {
    if (!text.trim() && !attachment) return
    if (!activeConversationId) return

    setIsSubmitting(true)
    
    // أضف الرسالة محلياً أولاً
    const chatId = activeChatId
    const newMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'sent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: isAdminMode
        ? (language === 'ar' ? 'الدعم' : 'Support')
        : (language === 'ar' ? 'أنت' : 'You'),
      attachment,
    }

    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), newMessage],
    }))
    setInputValue('')
    setFileError(null)

    // إرسال الرسالة إلى API
    createMessage({
      conversation_id: activeConversationId,
      text: text.trim(),
      attachment: attachment || undefined
    }).then(() => {
      if (isAdminMode) {
        setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }))
      } else {
        pushAutoReply(chatId, !!attachment)
      }
    }).catch((err) => {
      console.error('Failed to send message:', err)
      // يمكن إضافة رسالة خطأ للمستخدم هنا
    }).finally(() => {
      setIsSubmitting(false)
    })
  }, [activeChatId, language, pushAutoReply, isAdminMode, activeConversationId])

  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId)
    if (isAdminMode) {
      setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }))
    }

    // Determine or create the backend conversation id for this chat
    try {
      const chatItem = chats.find(c => c.id === chatId)
      if (!chatItem) {
        setActiveConversationId(null)
        return
      }

      // Try to find an existing conversation from loaded conversations
      const existing = conversations.find(conv => {
        if (!conv) return false
        // match by client + type + optional project
        if (conv.client_id !== chatItem.clientId) return false
        if (conv.type !== chatItem.type) return false
        if ((conv.project_id || null) !== (chatItem.projectId || null)) return false
        return true
      })

      if (existing) {
        setActiveConversationId(existing.id)
        return
      }

      // If not found, request creation (backend will return or create)
      if (chatItem.clientId) {
        const convRes = await getOrCreateConversation({
          other_user_id: chatItem.clientId,
          type: chatItem.type,
          project_id: chatItem.projectId
        })
        if (convRes && convRes.success && convRes.data) {
          setActiveConversationId(convRes.data.id)
          // add to conversations list locally
          setConversations(prev => (convRes.data ? [...prev.filter(c=>c.id!==convRes.data!.id), convRes.data!] : prev))
          return
        }
      }

      // Fallback: clear active conversation id
      setActiveConversationId(null)
    } catch (err) {
      console.error('Failed to select chat / get conversation:', err)
      setActiveConversationId(null)
    }
  }

  const handleFileSelect = useCallback((file: File, forcedType?: MessageAttachment['type']) => {
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

    const url = URL.createObjectURL(file)
    sendMessage(inputValue, {
      type,
      url,
      name: file.name,
      size: file.size,
    })
  }, [inputValue, language, sendMessage])

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
        <div className={styles.chatHeader}>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>
              {isAdminMode
                ? (activeChat?.type === 'general'
                  ? (language === 'ar'
                    ? `استفسار — ${activeChat?.clientName}`
                    : `Inquiry — ${activeChat?.clientName}`)
                  : (language === 'ar'
                    ? `${activeChat?.name} · ${activeChat?.clientName}`
                    : `${activeChat?.name} · ${activeChat?.clientName}`))
                : (activeChat?.type === 'general'
                  ? (language === 'ar' ? 'استفسار عام' : 'General Inquiry')
                  : (language === 'ar'
                    ? `محادثة مشروع ${activeChat?.name}`
                    : `${activeChat?.name} Project Chat`))}
            </span>
            <span className={styles.headerStatus}>
              {isAdminMode && activeChat?.clientEmail
                ? activeChat.clientEmail
                : (activeChat?.subtitle ?? '')}
            </span>
          </div>
          {isAdminMode && lastMessageFromClient && (
            <span className={styles.needsReplyBadge}>
              {language === 'ar' ? '● يحتاج رد' : '● Needs reply'}
            </span>
          )}
        </div>

        <div className={styles.chatMessages}>
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
                  {msg.sender === 'received' && (
                    <span className={isAdminMode ? styles.clientRole : styles.adminRole}>
                      {isAdminMode
                        ? (language === 'ar' ? 'عميل' : 'client')
                        : 'admin'}
                    </span>
                  )}
                  {msg.sender === 'sent' && isAdminMode && (
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
        <form className={styles.chatInputContainer} onSubmit={handleSend}>
          <button type="submit" className={styles.sendBtn} disabled={!inputValue.trim()}>
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
              onChange={(e) => setInputValue(e.target.value)}
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
            <button
              type="button"
              className={styles.actionBtn}
              title={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
              aria-label={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
              onClick={() => attachInputRef.current?.click()}
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

      <aside className={styles.chatSidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>
            {language === 'ar' ? 'المحادثات' : 'Chats'}
          </span>
          <span className={styles.sidebarCount}>
            {isAdminMode && totalUnread > 0 ? totalUnread : chats.length}
          </span>
        </div>

        {isAdminMode && (
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
      </aside>
      </div>
    </div>
  )
}
