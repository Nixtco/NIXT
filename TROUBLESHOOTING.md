# 🔧 دليل حل المشاكل - NIXT Platform

## المشاكل الحالية والحلول

---

## 1️⃣ مشكلة الصلاحيات (Access Denied - Missing Permissions)

### الخطأ:
```json
{
  "success": false,
  "message": "Access denied. Missing permissions: view_projects",
  "error": "MISSING_PERMISSIONS"
}
```

### السبب:
- المستخدم الحالي لا يملك صلاحية `view_projects` في قاعدة البيانات
- الـ Backend API يتحقق من الصلاحيات قبل السماح بعرض المشاريع

### الحل:

#### الخيار 1: إضافة الصلاحية للمستخدم (قاعدة البيانات)
```sql
-- 1. تحقق من دور المستخدم
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

-- 2. إذا كان الدور 'ADMIN'، تأكد من وجود الصلاحية
SELECT * FROM permissions WHERE name = 'view_projects';

-- 3. ربط الصلاحية بالدور
INSERT INTO role_permissions (role_name, permission_name)
VALUES ('ADMIN', 'view_projects')
ON DUPLICATE KEY UPDATE role_name = role_name;
```

#### الخيار 2: تحديث دور المستخدم
```sql
-- تحديث دور المستخدم إلى ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

#### الخيار 3: التحقق من Backend Configuration
تأكد من أن صلاحيات المشاريع مضبوطة في Backend:
```javascript
// في ملف permissions.js أو middleware
const projectPermissions = {
  view_projects: ['ADMIN', 'CONTROLLER'], // الأدوار المسموحة
  edit_projects: ['ADMIN'],
  delete_projects: ['ADMIN']
}
```

---

## 2️⃣ مشكلة التوكن (Authentication Token Issues)

### الخطأ:
```
❌ لا يوجد token للمصادقة
No authentication token found
```

### السبب:
كان هناك تضارب في اسم مفتاح التوكن:
- `useApi.ts` كان يستخدم `'token'`
- `useWebSocket.ts` كان يستخدم `'auth_token'`

### الحل (تم تطبيقه ✅):
تم توحيد قراءة التوكن في كلا الملفات:
```typescript
// الآن يبحث عن auth_token أولاً، ثم token كخيار احتياطي
const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
```

### التحقق من التوكن:
افتح Console المتصفح واكتب:
```javascript
// تحقق من وجود التوكن
console.log('auth_token:', localStorage.getItem('auth_token'))
console.log('token:', localStorage.getItem('token'))

// فحص صلاحية التوكن
const token = localStorage.getItem('auth_token')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token payload:', payload)
  console.log('Token expires:', new Date(payload.exp * 1000))
}
```

---

## 3️⃣ مشكلة Rate Limiting (Too Many Requests)

### الخطأ:
```json
{
  "error": "Too many message actions, please slow down.",
  "retryAfter": 46
}
```

### السبب:
- استدعاء الـ API بشكل متكرر وسريع جداً
- السيرفر يطبق Rate Limiting لحماية من Abuse

### الحل:

#### 1. إضافة Debounce للطلبات:
```typescript
import { useCallback } from 'react'
import debounce from 'lodash/debounce'

// في component
const debouncedFetchMessages = useCallback(
  debounce(async () => {
    await loadMessages()
  }, 1000), // انتظر ثانية بين الطلبات
  []
)
```

#### 2. إضافة Cache للبيانات:
```typescript
const [messagesCache, setMessagesCache] = useState<Map<string, Message[]>>(new Map())

const loadMessages = async (conversationId: string) => {
  // تحقق من Cache أولاً
  if (messagesCache.has(conversationId)) {
    return messagesCache.get(conversationId)
  }
  
  // استدعاء API فقط إذا لم تكن البيانات في Cache
  const messages = await apiCall(`/messages/${conversationId}`)
  messagesCache.set(conversationId, messages)
  return messages
}
```

#### 3. استخدام React Query (مستحسن):
```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query'

const { data: messages, isLoading } = useQuery({
  queryKey: ['messages', conversationId],
  queryFn: () => loadMessages(conversationId),
  staleTime: 30000, // البيانات صالحة لمدة 30 ثانية
  cacheTime: 300000, // احتفظ بالـ cache لمدة 5 دقائق
})
```

#### 4. معالجة الـ retryAfter:
```typescript
export async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // ... existing code ...
  
  if (!response.ok) {
    try {
      const errorData = await response.json()
      
      // معالجة Rate Limit
      if (response.status === 429 && errorData.retryAfter) {
        const retryAfter = errorData.retryAfter
        console.warn(`⏳ Rate limited. Retry after ${retryAfter} seconds`)
        
        // انتظر ثم أعد المحاولة تلقائياً
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        return apiCall<T>(endpoint, options)
      }
      
      // ... rest of error handling
    } catch (e) {
      // ...
    }
  }
}
```

---

## 4️⃣ مشكلة WebSocket Connection

### الخطأ:
```
❌ تم قطع اتصال WebSocket
```

### الحلول:

#### 1. التحقق من WebSocket URL:
```typescript
// في .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8080

// أو إذا كان HTTPS:
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

#### 2. التحقق من Backend:
تأكد أن WebSocket Server يعمل:
```bash
# تحقق من المنفذ
netstat -ano | findstr :8080
```

#### 3. إضافة Reconnection Logic (موجود بالفعل ✅):
الـ hook الحالي يحتوي على:
- Auto reconnection (5 محاولات)
- Ping/Pong للحفاظ على الاتصال
- Error handling

---

## 🎯 خطوات التشخيص السريع

### 1. تحقق من المصادقة:
```javascript
// في Console المتصفح
const token = localStorage.getItem('auth_token')
console.log('Has token:', !!token)

if (token) {
  const parts = token.split('.')
  const payload = JSON.parse(atob(parts[1]))
  console.log('User ID:', payload.user_id)
  console.log('Role:', payload.role)
  console.log('Expires:', new Date(payload.exp * 1000))
}
```

### 2. تحقق من الاتصال بالـ API:
```javascript
fetch('http://localhost:3003/api/v1/projects', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(console.log)
.catch(console.error)
```

### 3. تحقق من WebSocket:
```javascript
const ws = new WebSocket(`ws://localhost:8080/ws/chat?token=${localStorage.getItem('auth_token')}`)
ws.onopen = () => console.log('✅ WebSocket connected')
ws.onerror = (err) => console.error('❌ WebSocket error:', err)
ws.onmessage = (msg) => console.log('📨 Message:', msg.data)
```

---

## 📋 Checklist قبل الإبلاغ عن مشكلة:

- [ ] تحققت من وجود التوكن في localStorage
- [ ] تحققت من صلاحية التوكن (لم ينته وقته)
- [ ] تحققت من دور المستخدم (ADMIN/CLIENT/CONTROLLER)
- [ ] تحققت من عمل Backend API (http://localhost:3003)
- [ ] تحققت من عمل WebSocket Server (ws://localhost:8080)
- [ ] تحققت من الصلاحيات في قاعدة البيانات
- [ ] راجعت Console Logs في المتصفح
- [ ] راجعت Network Tab في DevTools

---

## 🆘 الحصول على المساعدة

إذا استمرت المشاكل:

1. **افتح DevTools** (F12)
2. **اذهب لـ Console Tab** وانسخ الأخطاء
3. **اذهب لـ Network Tab** وتحقق من:
   - Status Code للطلبات
   - Request Headers (التوكن موجود؟)
   - Response Body (ماذا يقول السيرفر؟)
4. **شارك المعلومات** مع الفريق

---

## ✅ التعديلات المطبقة

- [x] توحيد اسم مفتاح التوكن في `useApi.ts`
- [x] إضافة fallback للبحث عن `token` القديم
- [x] تحسين رسائل الأخطاء في Console
- [ ] إضافة Rate Limit Handling (يحتاج تطبيق)
- [ ] إضافة Caching Layer (اختياري)
- [ ] إضافة React Query (مستحسن للمستقبل)

---

تاريخ التحديث: 2026-07-24
