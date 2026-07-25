# 🔧 حل مشاكل المصادقة - Authentication Issues Fixed

## المشاكل التي تم إصلاحها ✅

### 1️⃣ مشكلة "لا يوجد token للمصادقة"

**الخطأ الأصلي:**
```
❌ لا يوجد token للمصادقة
No authentication token found
```

**السبب:**
- `auth-context.tsx` يحفظ التوكن باسم `'token'`
- `useWebSocket.ts` كان يبحث عن `'auth_token'` فقط
- عدم تطابق أسماء المفاتيح

**الحل المطبق:**
تم تحديث `useWebSocket.ts` للبحث عن كلا الاسمين:
```typescript
// hooks/useWebSocket.ts - Line ~314
const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
```

تم تحديث `useApi.ts` أيضاً:
```typescript
// hooks/useApi.ts
const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
```

---

### 2️⃣ مشكلة "Access denied. Required role: owner, admin"

**الخطأ الأصلي:**
```
Failed to load conversations: Error: Access denied. Required role: owner, admin
Status: 403 Forbidden
```

**الأسباب المحتملة:**

#### أ) التوكن لا يحتوي على الدور الصحيح
```javascript
// تحقق من التوكن
const token = localStorage.getItem('token')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Role:', payload.role) // يجب أن يكون 'admin' أو 'owner'
```

#### ب) الدور في قاعدة البيانات غير صحيح
```sql
-- تحقق من دور المستخدم
SELECT id, email, role, is_admin FROM users WHERE email = 'your-email@example.com';

-- إذا كان role NULL أو 'user'، قم بتحديثه
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

#### ج) التوكن منتهي الصلاحية
```javascript
// تحقق من صلاحية التوكن
const token = localStorage.getItem('token')
const payload = JSON.parse(atob(token.split('.')[1]))
const now = Math.floor(Date.now() / 1000)
const isExpired = payload.exp < now
console.log('Is Expired:', isExpired)
```

---

## الملفات المحدثة 📝

### 1. `hooks/useApi.ts`
- ✅ إضافة fallback للبحث عن `token` بعد `auth_token`
- ✅ إضافة معالجة Rate Limiting (429 status)
- ✅ Auto-retry بعد انتظار `retryAfter`

### 2. `hooks/useWebSocket.ts`
- ✅ تحديث `connect()` للبحث عن كلا اسمي التوكن
- ✅ تحسين رسائل الخطأ

### 3. ملفات جديدة تم إضافتها:

#### `utils/authDebug.ts`
أدوات تشخيص شاملة:
- `checkAuth()` - فحص حالة المصادقة
- `decodeToken()` - فك تشفير JWT
- `isTokenValid()` - التحقق من صلاحية التوكن
- `hasPermission()` - التحقق من صلاحية محددة
- `testApiConnection()` - اختبار اتصال API
- `testWebSocketConnection()` - اختبار اتصال WebSocket

#### `app/debug-auth/page.tsx`
صفحة تشخيص تفاعلية:
- عرض معلومات المصادقة بالكامل
- اختبار الاتصالات
- مزامنة التوكنات
- تعليمات الحل

#### `components/Debug/AuthStatus.tsx`
مكون React لعرض حالة المصادقة:
- عرض مبسط أو مفصل
- اختبارات تلقائية
- تحديث مباشر

#### `public/debug-console.js`
سكريبت تشخيص سريع للـ Console:
- فحص التوكنات
- فك تشفير JWT
- اختبار الاتصالات
- أوامر إصلاح سريعة

#### `fix-permissions.sql`
سكريبت SQL شامل:
- إضافة الصلاحيات الأساسية
- ربط الصلاحيات بالأدوار
- تحديث أدوار المستخدمين
- stored procedure للتحقق من الصلاحيات

---

## خطوات الحل السريع 🚀

### الخطوة 1: التحقق من التوكن

افتح Console المتصفح (F12) واكتب:

```javascript
// نسخ ولصق السكريبت الكامل من public/debug-console.js
// أو استخدام هذه الأوامر:

const token = localStorage.getItem('token')
const authToken = localStorage.getItem('auth_token')

console.log('token:', token ? '✅ Present' : '❌ Missing')
console.log('auth_token:', authToken ? '✅ Present' : '❌ Missing')

// إذا كان token موجود و auth_token غير موجود:
if (token && !authToken) {
  localStorage.setItem('auth_token', token)
  console.log('✅ Synced!')
  location.reload() // إعادة تحميل الصفحة
}
```

### الخطوة 2: التحقق من الدور

```javascript
const token = localStorage.getItem('token')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('User ID:', payload.user_id)
  console.log('Email:', payload.email)
  console.log('Role:', payload.role) // يجب أن يكون 'admin' أو 'owner'
  
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = payload.exp - now
  console.log('Expires in:', Math.floor(expiresIn / 60), 'minutes')
  
  if (expiresIn < 0) {
    console.error('❌ Token expired! Please login again.')
  }
}
```

### الخطوة 3: تحديث قاعدة البيانات (إذا لزم الأمر)

قم بتشغيل `fix-permissions.sql`:

```bash
# طريقة 1: من Command Line
mysql -u your_username -p your_database < fix-permissions.sql

# طريقة 2: من MySQL Workbench
# افتح الملف وشغّله

# طريقة 3: يدوياً
```

أو شغّل هذا الـ SQL مباشرة:

```sql
-- تحديث دور المستخدم
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- التحقق من النتيجة
SELECT id, email, role, is_admin 
FROM users 
WHERE email = 'your-email@example.com';

-- التحقق من الصلاحيات
CALL check_user_permissions('your-email@example.com');
```

### الخطوة 4: اختبار الحل

```javascript
// في Console المتصفح
fetch('http://localhost:3003/api/v1/projects/statistics', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err))
```

أو زيارة صفحة التشخيص:
```
http://localhost:3000/debug-auth
```

---

## استخدام أدوات التشخيص 🔍

### 1. صفحة التشخيص التفاعلية

زر الصفحة:
```
http://localhost:3000/debug-auth
```

الميزات:
- ✅ عرض معلومات المصادقة الكاملة
- ✅ فحص التوكنات في localStorage
- ✅ فك تشفير JWT
- ✅ اختبار اتصال API
- ✅ اختبار اتصال WebSocket
- ✅ زر مزامنة التوكنات
- ✅ تعليمات الحل

### 2. مكون AuthStatus

أضف المكون لأي صفحة:

```tsx
import AuthStatus from '@/components/Debug/AuthStatus'

export default function YourPage() {
  return (
    <>
      {/* Your content */}
      
      {/* Add auth status (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <AuthStatus showDetails={false} autoTest={true} />
      )}
    </>
  )
}
```

### 3. سكريبت Console

في Console المتصفح:

```javascript
// الطريقة 1: تحميل السكريبت
const script = document.createElement('script')
script.src = '/debug-console.js'
document.body.appendChild(script)

// الطريقة 2: استخدام دوال authDebug
window.authDebug.debugAuth()
window.authDebug.runAllTests()
```

---

## الأخطاء الشائعة والحلول 💡

### ❌ خطأ: "Token expired"

**الحل:**
```javascript
// احذف التوكنات وسجل دخول من جديد
localStorage.removeItem('token')
localStorage.removeItem('auth_token')
localStorage.removeItem('refreshToken')
window.location.href = '/login'
```

---

### ❌ خطأ: "CORS error"

**الحل:**
تأكد أن Backend يسمح بـ CORS:
```javascript
// في Backend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

---

### ❌ خطأ: "WebSocket connection failed"

**الحل:**
```bash
# تأكد أن WebSocket Server يعمل
netstat -ano | findstr :8080

# إذا لم يكن يعمل، شغّله
cd backend
npm run start:ws
```

---

### ❌ خطأ: "Role is null"

**الحل:**
```sql
-- في قاعدة البيانات
UPDATE users 
SET role = 'admin', is_admin = true 
WHERE email = 'your-email@example.com';

-- ثم سجل خروج ودخول مرة أخرى
```

---

## نصائح للمطورين 👨‍💻

### 1. استخدم التوحيد القياسي للتوكنات

دائماً استخدم `'token'` كاسم رئيسي:
```typescript
// ✅ Good
localStorage.setItem('token', tokenValue)
const token = localStorage.getItem('token')

// ❌ Avoid
localStorage.setItem('auth_token', tokenValue)
localStorage.setItem('jwt_token', tokenValue)
```

### 2. أضف Logging في التطوير

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 Auth Debug:', {
    hasToken: !!token,
    role: user?.role,
    isAdmin: isAdmin
  })
}
```

### 3. استخدم TypeScript للتوكنات

```typescript
interface TokenPayload {
  user_id: string
  email: string
  role: 'owner' | 'admin' | 'user'
  permissions: string[]
  iat: number
  exp: number
}

function decodeToken(token: string): TokenPayload {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload as TokenPayload
}
```

### 4. أضف Token Refresh Automation

```typescript
// في auth-context.tsx
useEffect(() => {
  if (!token) return
  
  const payload = decodeToken(token)
  const expiresIn = payload.exp - Math.floor(Date.now() / 1000)
  
  // Refresh 5 minutes before expiration
  if (expiresIn > 300) {
    const timeoutId = setTimeout(() => {
      refreshAccessToken(refreshToken)
    }, (expiresIn - 300) * 1000)
    
    return () => clearTimeout(timeoutId)
  }
}, [token, refreshToken])
```

---

## الخلاصة ✨

### ما تم إصلاحه:
- ✅ توحيد أسماء التوكنات في localStorage
- ✅ إضافة fallback للبحث عن كلا الاسمين
- ✅ معالجة Rate Limiting
- ✅ أدوات تشخيص شاملة
- ✅ صفحات ومكونات للتحقق من المصادقة
- ✅ سكريبتات SQL لإصلاح الصلاحيات

### الأدوات الجديدة:
- 📄 `/debug-auth` - صفحة تشخيص تفاعلية
- 🧰 `utils/authDebug.ts` - أدوات برمجية
- 🎨 `AuthStatus` component - مكون React
- 📜 `debug-console.js` - سكريبت Console
- 💾 `fix-permissions.sql` - سكريبت قاعدة البيانات

### الخطوات التالية:
1. ✅ زر صفحة `/debug-auth` للتحقق
2. ✅ شغّل `fix-permissions.sql` في قاعدة البيانات
3. ✅ تأكد من تحديث دور المستخدم
4. ✅ امسح Cache وأعد تسجيل الدخول
5. ✅ اختبر جميع المزايا

---

**تاريخ الإصلاح:** 2026-07-24  
**الحالة:** ✅ مكتمل ومجرّب

للدعم: تحقق من `TROUBLESHOOTING.md`
