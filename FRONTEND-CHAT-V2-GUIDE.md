# 🎨 دليل Frontend - نظام الدردشة V2

## 📋 التعديلات المطلوبة

### 1. تحديث Types في `apiFunctions.ts`

```typescript
// إضافة نوع جديد
export type ConversationType = 'general' | 'project' | 'admin_internal';

// تحديث Conversation interface
export interface Conversation {
  id: string;
  client_id: string | null;  // nullable الآن
  admin_id: string | null;    // nullable الآن
  project_id?: string | null;
  type: ConversationType;
  status: string;
  unread_count: number;
  last_message_at: string | null;
  
  // حقول جديدة للزوار
  guest_name?: string | null;
  guest_email?: string | null;
  guest_session_id?: string | null;
  
  // associations
  client?: User | null;
  admin?: User | null;
  project?: Project | null;
  
  created_at: string;
  updated_at: string;
}

// تحديث GetOrCreateConversationParams
export interface GetOrCreateConversationParams {
  other_user_id?: string;
  type: ConversationType;
  project_id?: string;
  
  // حقول الزوار
  guest_name?: string;
  guest_email?: string;
  guest_session_id?: string;
}

// دالة جديدة لجلب المستخدمين المتاحين
export async function getAvailableUsersForChat() {
  return apiRequest<{
    admins: User[];
    clientConversations: Conversation[];
  }>('/conversations/available-users', 'GET');
}

// تحديث getOrCreateConversation
export async function getOrCreateConversation(
  params: GetOrCreateConversationParams
): Promise<ApiResponse<Conversation>> {
  return apiRequest<Conversation>(
    '/conversations/get-or-create',
    'POST',
    params
  );
}
```

---

### 2. إضافة Guest Chat Utilities

إنشاء ملف جديد: `utils/guestChat.ts`

```typescript
/**
 * إدارة جلسات الزوار للدردشة
 */

const STORAGE_KEY = 'guestChatSession';

export interface GuestSession {
  sessionId: string;
  name?: string;
  email?: string;
  createdAt: number;
}

/**
 * جلب أو إنشاء session ID للزائر
 */
export function getOrCreateGuestSession(): string {
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * حفظ معلومات الزائر
 */
export function saveGuestInfo(name: string, email?: string) {
  const sessionId = getOrCreateGuestSession();
  
  const session: GuestSession = {
    sessionId,
    name,
    email,
    createdAt: Date.now()
  };
  
  localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(session));
}

/**
 * جلب معلومات الزائر المحفوظة
 */
export function getGuestInfo(): GuestSession | null {
  const info = localStorage.getItem(`${STORAGE_KEY}_info`);
  return info ? JSON.parse(info) : null;
}

/**
 * مسح جلسة الزائر (عند التسجيل)
 */
export function clearGuestSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(`${STORAGE_KEY}_info`);
}

/**
 * التحقق من وجود جلسة زائر نشطة
 */
export function hasActiveGuestSession(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}
```

---

### 3. تحديث `ChatWidget.tsx`

#### أ. إضافة دالة لتحديد نوع المحادثة وعرضها

```typescript
interface ConversationDisplayInfo {
  name: string;
  subtitle: string;
  avatar: string;
  type: 'client' | 'guest' | 'admin' | 'project';
  badge?: string;
}

/**
 * الحصول على معلومات العرض للمحادثة
 */
function getConversationDisplayInfo(
  conv: Conversation,
  currentUserId: string,
  language: string,
  isAdminMode: boolean
): ConversationDisplayInfo {
  // محادثة زائر
  if (conv.guest_session_id) {
    return {
      name: conv.guest_name || (language === 'ar' ? 'زائر' : 'Guest'),
      subtitle: conv.guest_email || (language === 'ar' ? 'غير مسجل' : 'Visitor'),
      avatar: '👤',
      type: 'guest',
      badge: language === 'ar' ? 'زائر' : 'Guest'
    };
  }
  
  // محادثة بين إداريين
  if (conv.type === 'admin_internal') {
    const otherAdmin = conv.client_id === currentUserId 
      ? conv.admin 
      : conv.client;
    
    return {
      name: otherAdmin?.display_name || (language === 'ar' ? 'إداري' : 'Admin'),
      subtitle: otherAdmin?.email || '',
      avatar: otherAdmin?.display_name?.[0]?.toUpperCase() || 'A',
      type: 'admin',
      badge: language === 'ar' ? 'إداري' : 'Admin'
    };
  }
  
  // محادثة مشروع
  if (conv.type === 'project') {
    if (isAdminMode) {
      return {
        name: conv.project?.name || (language === 'ar' ? 'مشروع' : 'Project'),
        subtitle: conv.client?.display_name || (language === 'ar' ? 'عميل' : 'Client'),
        avatar: '📁',
        type: 'project',
        badge: language === 'ar' ? 'مشروع' : 'Project'
      };
    } else {
      return {
        name: conv.project?.name || (language === 'ar' ? 'مشروع' : 'Project'),
        subtitle: getStatusLabel(conv.project?.status || 'active', language),
        avatar: '📁',
        type: 'project'
      };
    }
  }
  
  // محادثة عادية
  if (isAdminMode) {
    return {
      name: conv.client?.display_name || (language === 'ar' ? 'عميل' : 'Client'),
      subtitle: conv.client?.email || '',
      avatar: conv.client?.display_name?.[0]?.toUpperCase() || 'C',
      type: 'client'
    };
  } else {
    return {
      name: language === 'ar' ? 'استفسار عام' : 'General Inquiry',
      subtitle: language === 'ar' ? 'الدعم الفني' : 'Support',
      avatar: '💬',
      type: 'client'
    };
  }
}
```

#### ب. تحديث عرض قائمة المحادثات

```typescript
// في visibleChats mapping
{visibleChats.map((chat) => {
  const unread = unreadCounts[chat.id] ?? 0;
  
  // الحصول على معلومات العرض
  const displayInfo = getConversationDisplayInfo(
    chat,
    userId!,
    language,
    isAdminMode
  );
  
  return (
    <button
      key={chat.id}
      type="button"
      className={`
        ${styles.chatListItem} 
        ${activeChatId === chat.id ? styles.chatListItemActive : ''} 
        ${displayInfo.type === 'guest' ? styles.chatListItemGuest : ''}
        ${displayInfo.type === 'admin' ? styles.chatListItemAdmin : ''}
        ${unread > 0 ? styles.chatListItemUnread : ''}
      `}
      onClick={() => handleSelectChat(chat.id)}
    >
      <div className={`${styles.chatListAvatar} ${styles[`avatar${displayInfo.type}`]}`}>
        {displayInfo.avatar}
      </div>
      
      <div className={styles.chatListInfo}>
        <div className={styles.chatListTop}>
          <span className={styles.chatListName}>
            {displayInfo.name}
          </span>
          
          {displayInfo.badge && (
            <span className={styles[`badge${displayInfo.type}`]}>
              {displayInfo.badge}
            </span>
          )}
          
          {unread > 0 && (
            <span className={styles.unreadBadge}>{unread}</span>
          )}
        </div>
        
        <span className={styles.chatListPreview}>
          {displayInfo.subtitle}
        </span>
      </div>
    </button>
  );
})}
```

#### ج. إضافة Guest Chat Form

```typescript
// Component جديد للزوار
function GuestChatForm({ 
  onSubmit, 
  language 
}: { 
  onSubmit: (name: string, email?: string) => void;
  language: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(true);
  
  // التحقق من وجود معلومات محفوظة
  useEffect(() => {
    const savedInfo = getGuestInfo();
    if (savedInfo) {
      setName(savedInfo.name || '');
      setEmail(savedInfo.email || '');
      setShowForm(false);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveGuestInfo(name, email);
      onSubmit(name, email || undefined);
      setShowForm(false);
    }
  };
  
  if (!showForm) return null;
  
  return (
    <div className={styles.guestChatForm}>
      <h3>{language === 'ar' ? 'ابدأ محادثة' : 'Start Chat'}</h3>
      <p>
        {language === 'ar' 
          ? 'أدخل اسمك للبدء في التواصل معنا'
          : 'Enter your name to start chatting'}
      </p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={language === 'ar' ? 'الاسم *' : 'Name *'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.guestInput}
        />
        
        <input
          type="email"
          placeholder={language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.guestInput}
        />
        
        <button type="submit" className={styles.guestSubmit}>
          {language === 'ar' ? 'بدء المحادثة' : 'Start Chat'}
        </button>
      </form>
    </div>
  );
}
```

#### د. دمج Guest Chat في ChatWidget

```typescript
export default function ChatWidget({ mode = 'user', onUnreadChange, isGuest = false }: ChatWidgetProps) {
  const [guestConversation, setGuestConversation] = useState<Conversation | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(isGuest && !hasActiveGuestSession());
  
  // دالة لبدء محادثة زائر
  const startGuestChat = async (name: string, email?: string) => {
    try {
      const sessionId = getOrCreateGuestSession();
      
      const response = await getOrCreateConversation({
        type: 'general',
        guest_session_id: sessionId,
        guest_name: name,
        guest_email: email
      });
      
      if (response.success && response.data) {
        setGuestConversation(response.data);
        setActiveConversationId(response.data.id);
        setShowGuestForm(false);
      }
    } catch (error) {
      console.error('فشل بدء محادثة الزائر:', error);
    }
  };
  
  // في JSX
  return (
    <div className={styles.chatContainer}>
      {isGuest && showGuestForm ? (
        <GuestChatForm 
          onSubmit={startGuestChat} 
          language={language} 
        />
      ) : (
        // عرض الدردشة العادية
        <>
          {/* ... بقية الكود */}
        </>
      )}
    </div>
  );
}
```

---

### 4. إضافة Styles في `ChatWidget.module.css`

```css
/* Guest Chat Form */
.guestChatForm {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--surface-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.guestChatForm h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.guestChatForm p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.guestInput {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
}

.guestSubmit {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.guestSubmit:hover {
  background: var(--primary-color-dark);
}

/* Guest Chat Item */
.chatListItemGuest {
  border-left: 3px solid #fbbf24;
}

.chatListItemGuest .chatListAvatar {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

/* Admin Internal Chat Item */
.chatListItemAdmin {
  border-left: 3px solid #8b5cf6;
}

.chatListItemAdmin .chatListAvatar {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

/* Badges */
.badgeguest {
  padding: 0.25rem 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badgeadmin {
  padding: 0.25rem 0.5rem;
  background: #ede9fe;
  color: #5b21b6;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badgeproject {
  padding: 0.25rem 0.5rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Avatar Types */
.avatarguest {
  font-size: 1.5rem;
}

.avataradmin {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.avatarproject {
  font-size: 1.2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
```

---

### 5. إضافة Guest Chat في الصفحة الرئيسية

إنشاء component جديد: `components/GuestChatButton.tsx`

```typescript
'use client'

import { useState } from 'react';
import ChatWidget from './ChatWidget';
import styles from './GuestChatButton.module.css';

export default function GuestChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* زر الدردشة العائم */}
      <button
        className={styles.floatingChatButton}
        onClick={() => setIsOpen(true)}
        aria-label="بدء محادثة"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      
      {/* نافذة الدردشة */}
      {isOpen && (
        <div className={styles.chatModal}>
          <div className={styles.chatModalHeader}>
            <span>تواصل معنا</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className={styles.chatModalBody}>
            <ChatWidget mode="user" isGuest={true} />
          </div>
        </div>
      )}
    </>
  );
}
```

`GuestChatButton.module.css`:

```css
.floatingChatButton {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 1000;
}

.floatingChatButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.chatModal {
  position: fixed;
  bottom: 100px;
  right: 2rem;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chatModalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
}

.chatModalHeader button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.chatModalBody {
  flex: 1;
  overflow: hidden;
}
```

ثم أضف في `app/page.tsx` أو `app/layout.tsx`:

```typescript
import GuestChatButton from '@/components/GuestChatButton';

// في JSX
<GuestChatButton />
```

---

## ✅ قائمة التحقق

### TypeScript:
- [ ] تحديث types في `apiFunctions.ts`
- [ ] إضافة `utils/guestChat.ts`
- [ ] تحديث `getOrCreateConversation`
- [ ] إضافة `getAvailableUsersForChat`

### Components:
- [ ] تحديث `ChatWidget.tsx`
- [ ] إضافة `getConversationDisplayInfo`
- [ ] إضافة `GuestChatForm`
- [ ] إضافة `GuestChatButton`

### Styles:
- [ ] إضافة guest chat styles
- [ ] إضافة admin internal styles
- [ ] إضافة badges styles

### Integration:
- [ ] اختبار محادثة زائر
- [ ] اختبار محادثة إداريين
- [ ] اختبار محادثة مشروع تلقائية
- [ ] اختبار قائمة الإداري الموحدة

---

## 🧪 Testing Scenarios

### 1. Guest Chat
```typescript
// 1. زائر يبدأ محادثة
// 2. يُنشأ session ID تلقائياً
// 3. تُحفظ المعلومات في localStorage
// 4. يظهر للإداري كـ "Guest"
// 5. الإداري يرد
// 6. الزائر يرى الرد فوراً
```

### 2. Admin Internal Chat
```typescript
// 1. إداري يفتح قائمة المحادثات
// 2. يرى قائمة جميع الإداريين
// 3. يختار إداري آخر
// 4. تُنشأ محادثة admin_internal
// 5. الإداري الآخر يرى المحادثة
// 6. يتبادلان الرسائل
```

### 3. Auto Project Chat
```typescript
// 1. عميل يفتح صفحة مشروع
// 2. تُنشأ محادثة المشروع تلقائياً
// 3. تظهر في قائمة المشاريع
// 4. الإداري يراها في قائمته
// 5. العميل يرسل رسالة
// 6. الإداري يرد
```

---

**الحالة:** 📝 جاهز للتطبيق  
**الوقت المتوقع:** 2-3 ساعات  
**الصعوبة:** ⭐⭐⭐ متوسطة
