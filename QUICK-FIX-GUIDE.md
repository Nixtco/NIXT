# 🚀 دليل الإصلاح السريع | Quick Fix Guide

## المشكلة: "❌ لا يوجد token للمصادقة"

### الحل في 3 خطوات ⚡

#### 1️⃣ افتح Console المتصفح
اضغط `F12` ثم اذهب لـ **Console** tab

#### 2️⃣ انسخ والصق هذا الكود:
```javascript
// Auto-fix token sync
const token = localStorage.getItem('token');
if (token) {
  localStorage.setItem('auth_token', token);
  console.log('✅ Fixed! Reloading...');
  location.reload();
} else {
  console.error('❌ No token found. Please login again.');
  window.location.href = '/login';
}
```

#### 3️⃣ اضغط Enter
الصفحة ستُعاد تحميلها تلقائياً ✅

---

## المشكلة: "403 Forbidden - Access denied"

### السبب: دور المستخدم غير صحيح في قاعدة البيانات

### الحل:

#### الطريقة 1: من قاعدة البيانات (SQL)

```sql
-- غيّر your-email@example.com بإيميلك الحقيقي
UPDATE users 
SET role = 'admin', is_admin = true 
WHERE email = 'your-email@example.com';

-- تحقق من النتيجة
SELECT id, email, role, is_admin FROM users 
WHERE email = 'your-email@example.com';
```

#### الطريقة 2: استخدام السكريبت الجاهز

```bash
# من مجلد المشروع
mysql -u your_username -p your_database < fix-permissions.sql
```

#### الطريقة 3: من Console المتصفح (للتحقق فقط)

```javascript
// تحقق من دور المستخدم الحالي
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Current Role:', payload.role);
  console.log('Should be: admin or owner');
  
  if (payload.role !== 'admin' && payload.role !== 'owner') {
    console.error('❌ Wrong role! Update database and login again.');
  }
}
```

**بعد التحديث:**
1. احذف التوكن القديم
2. سجل دخول من جديد

```javascript
// في Console
localStorage.removeItem('token');
localStorage.removeItem('auth_token');
window.location.href = '/login';
```

---

## أدوات التشخيص 🔍

### 1. صفحة التشخيص الكاملة
```
http://localhost:3000/debug-auth
```
عرض شامل لحالة المصادقة + اختبارات تلقائية

### 2. سكريبت Console السريع
```javascript
// نسخ والصق في Console
fetch('/debug-console.js')
  .then(r => r.text())
  .then(code => eval(code))
```

### 3. التحقق السريع
```javascript
// معلومات أساسية
console.table({
  'Has token': !!localStorage.getItem('token'),
  'Has auth_token': !!localStorage.getItem('auth_token'),
  'Token matches': localStorage.getItem('token') === localStorage.getItem('auth_token')
});

// معلومات المستخدم
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.table({
    'Email': payload.email,
    'Role': payload.role,
    'User ID': payload.user_id,
    'Expires': new Date(payload.exp * 1000).toLocaleString()
  });
}
```

---

## FAQ - الأسئلة الشائعة

### ❓ لماذا يوجد `token` و `auth_token`؟

**الجواب:** 
- `token` هو الاسم الأساسي الذي يحفظه `auth-context`
- `auth_token` كان يُستخدم في WebSocket قديماً
- الآن الكود يبحث عن **كليهما** تلقائياً

**الحل الأفضل:** استخدام `token` فقط، لكن الكود يدعم الاثنين للتوافق.

---

### ❓ Token موجود لكن ما زال الخطأ موجود؟

**السبب المحتمل:** التوكن منتهي الصلاحية

**التحقق:**
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const now = Math.floor(Date.now() / 1000);
const isExpired = payload.exp < now;
console.log('Token expired:', isExpired);
```

**الحل:** سجل دخول من جديد

---

### ❓ بعد تحديث قاعدة البيانات ما زال الخطأ موجود؟

**السبب:** التوكن القديم يحتوي على دور قديم

**الحل:**
```javascript
// احذف التوكن وسجل دخول من جديد
localStorage.clear();
window.location.href = '/login';
```

---

### ❓ كيف أتأكد أن Backend يعمل؟

```bash
# Test API
curl http://localhost:3003/api/v1/health

# Test WebSocket
# (يحتاج WebSocket client)
```

أو من Console:
```javascript
fetch('http://localhost:3003/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## Checklist قبل طلب المساعدة ☑️

- [ ] جربت sync التوكنات من Console
- [ ] تحققت من دور المستخدم في قاعدة البيانات
- [ ] التوكن غير منتهي (expires in > 0)
- [ ] Backend API يعمل (port 3003)
- [ ] WebSocket Server يعمل (port 8080)
- [ ] زرت صفحة `/debug-auth`
- [ ] مسحت Cache وأعدت تسجيل الدخول

---

## أوامر مفيدة 📝

### تنظيف localStorage
```javascript
// مسح كل شيء
localStorage.clear();

// مسح التوكنات فقط
localStorage.removeItem('token');
localStorage.removeItem('auth_token');
localStorage.removeItem('refreshToken');
```

### إعادة تسجيل الدخول
```javascript
localStorage.clear();
window.location.href = '/login';
```

### تصدير Token للتحقق
```javascript
// نسخ التوكن
copy(localStorage.getItem('token'));
console.log('Token copied to clipboard!');

// فك تشفير في jwt.io
// الصق في https://jwt.io
```

---

## الملفات المهمة 📁

| الملف | الوصف |
|------|-------|
| `AUTH-ISSUES-FIXED.md` | شرح تفصيلي للمشاكل والحلول |
| `TROUBLESHOOTING.md` | دليل troubleshooting كامل |
| `fix-permissions.sql` | سكريبت قاعدة البيانات |
| `app/debug-auth/page.tsx` | صفحة التشخيص التفاعلية |
| `utils/authDebug.ts` | أدوات برمجية للتشخيص |
| `public/debug-console.js` | سكريبت Console سريع |

---

## للدعم 🆘

1. **راجع الملفات أعلاه**
2. **شغّل أدوات التشخيص**
3. **شارك الـ output من `/debug-auth`**

---

**آخر تحديث:** 2026-07-24  
**الحالة:** ✅ جاهز للاستخدام
