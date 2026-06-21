'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './ChatWidget.module.css'
import { useLanguage } from '@/hooks/useLanguage'

interface Message {
  id: number
  text: string
  sender: 'sent' | 'received'
  time: string
  senderName?: string
}

export default function ChatWidget() {
  const { language, dir } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: language === 'ar' ? 'مرحباً' : 'Hello',
      sender: 'received',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: 'Tamer'
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'sent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: language === 'ar' ? 'أنت' : 'You'
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsTyping(true)
    
    // Simulate auto-reply delay naturally
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: language === 'ar' 
          ? 'تم استلام استفسارك! سنقوم بالرد عليك قريباً.' 
          : 'Message received! We will reply soon.',
        sender: 'received',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: 'Tamer'
      }])
    }, 2500)
  }

  return (
    <div className={styles.chatContainer} dir={dir}>
      <div className={styles.chatWindow}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>
              {language === 'ar' ? 'المحادثة مع الناصري ياسر' : 'Conversation with Yasser Al-Nasiri'}
            </span>
            <span className={styles.headerStatus}>
              {language === 'ar' ? 'تصميم واجهة وتجربة - تامر القيمري ◾ PRJ-1001' : 'UI/UX Design - Tamer AlQemari ◾ PRJ-1001'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.chatMessages}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
              <div className={styles.messageAvatar}>
                {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : (msg.sender === 'sent' ? 'U' : 'T')}
              </div>
              <div className={styles.messageContentWrapper}>
                <div className={styles.messageMeta}>
                  <span>{msg.time}</span>
                  {msg.sender === 'received' && <span className={styles.adminRole}>admin</span>}
                  <span className={styles.adminName}>{msg.senderName}</span>
                </div>
                <div className={styles.messageContent}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.received}`}>
              <div className={styles.messageAvatar}>T</div>
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

        {/* Input Area */}
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
              placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className={styles.actionIcons}>
            <button type="button" className={styles.actionBtn} title="Attach">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <button type="button" className={styles.actionBtn} title="Video">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button type="button" className={styles.actionBtn} title="Image">
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
  )
}
