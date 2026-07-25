# دليل اختبار المستخدم الجديد | New User Testing Guide

## خطوات الاختبار | Testing Steps

### 1. تحضير البيئة | Environment Setup

```bash
# تأكد من تشغيل الباك إند
cd c:\Users\moham\OneDrive\Desktop\NixtBackend
npm run dev

# تأكد من تشغيل الفرونت إند
cd c:\Users\moham\OneDrive\Desktop\NIXT
npm run dev
```

### 2. إنشاء مستخدم جديد | Create New User

1. افتح المتصفح على `http://localhost:3000/register`
2. قم بالتسجيل بمستخدم جديد:
   ```
   Email: newuser@test.com
   Password: Test123!
   First Name: Test
   Last Name: User
   Display Name: TestUser
   ```
3. انتقل إلى `/login` وسجل الدخول

### 3. فتح صفحة Dashboard | Open Dashboard

1. انتقل إلى `/dashboard`
2. افتح أداة الدردشة (ChatWidget)

### 4. فحص Console المتصفح | Check Browser Console

#### ✅ الـ Output المتوقع:

```javascript
// 1. جلب معلومات المستخدم
👤 User: {id: "...", email: "newuser@test.com", ...}
🔑 Token in localStorage: EXISTS
✅ [getCurrentUserId] userId المستخرج: [user-id]

// 2. اتصال WebSocket
🔌 محاولة الاتصال بـ WebSocket: ws://localhost:8080/ws/chat?token=...
✅ تم الاتصال بـ WebSocket بنجاح
✅ تمت المصادقة بنجاح

// 3. جلب المحادثات (فارغة)
📡 Fetching projects for current user
✅ API Success Data: {success: true, data: [], count: 0}

// 4. إنشاء محادثة تلقائية
📝 لا توجد محادثات للمستخدم الجديد، سيتم إنشاء محادثة general تلقائياً
📞 [INIT] إنشاء محادثة general مع admin: [admin-id]
✅ [INIT] تم إنشاء محادثة: [conversation-id]

// 5. الانضمام للمحادثة عبر WebSocket
🔌 الانضمام للمحادثة عبر WebSocket: [conversation-id]
📥 بدء تحميل الرسائل للمحادثة: [conversation-id]
👋 عرض رسالة ترحيبية للمستخدم الجديد
```

#### ❌ الـ Output في حالة الخطأ (قبل الحل):

```javascript
⚠️ لا يوجد activeConversationId
❌ تم قطع اتصال WebSocket 1006
🔄 محاولة إعادة الاتصال 1/5
```

### 5. فحص الواجهة | Check UI

#### ✅ يجب أن تظهر:

1. **رسالة ترحيبية** في محادثة "General Inquiry":
   - 🇬🇧 EN: "Hello! You can ask anything here and we will reply soon."
   - 🇦🇪 AR: "مرحباً! يمكنك الاستفسار عن أي شيء هنا وسنرد عليك قريباً."

2. **مؤشر WebSocket الأخضر** (●) بجانب اسم المحادثة

3. **اسم المحادثة** في الـ header:
   - 🇬🇧 EN: "Inquiry — [Admin Name]"
   - 🇦🇪 AR: "استفسار — [اسم المسؤول]"

4. **حقل الإدخال** متاح للكتابة

### 6. إرسال رسالة | Send Message

1. اكتب رسالة في حقل الإدخال: "مرحباً، هذه أول رسالة لي"
2. اضغط على زر "إرسال" أو Enter

#### ✅ الـ Console المتوقع:

```javascript
// 1. إرسال الرسالة
📤 [SEND] إرسال رسالة عبر WebSocket: {text: "مرحباً، هذه أول رسالة لي", ...}
📤 WebSocket رسالة مرسلة: {type: "message:send", data: {...}}

// 2. استلام تأكيد
📨 WebSocket رسالة واردة: {type: "message:sent", data: {...}}
💬 [RECEIVE] رسالة جديدة عبر WebSocket
💬 [RECEIVE] isMyMessage: true
✅ [RECEIVE] إضافة الرسالة إلى [chat-id]
```

#### ✅ يجب أن تظهر الرسالة:

```
┌─────────────────────────────────────┐
│ You                    [time]  user │
│ ┌─────────────────────────────────┐ │
│ │ مرحباً، هذه أول رسالة لي        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 7. فحص Console الباك إند | Check Backend Console

#### ✅ يجب أن يظهر:

```javascript
// 1. اتصال WebSocket
🔄 WebSocket upgrade request received
✅ User [user-id] authenticated for WebSocket with role: user
✅ User [user-id] connected. Total connections: 1

// 2. استلام الرسالة
📨 رسالة واردة عبر WebSocket: {type: "message:send", ...}

// 3. حفظ في قاعدة البيانات
✅ تم حفظ الرسالة: [message-id]

// 4. Broadcast للطرفين
✅ تم إرسال message:sent إلى المرسل
✅ تم إرسال message:sent إلى المستقبل
```

## حالات الخطأ المحتملة | Possible Error Cases

### ❌ خطأ 1: لا يوجد admin متاح

**السبب**: لا يوجد مستخدمين بدور `admin` في قاعدة البيانات

**الحل**:
```sql
-- تحديث مستخدم موجود ليصبح admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### ❌ خطأ 2: WebSocket لا يتصل

**السبب**: خدمة WebSocket غير مشغلة أو على بورت خاطئ

**الحل**:
```bash
# تحقق من أن الباك إند يعمل على البورت 8080
# في .env.local تأكد من:
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### ❌ خطأ 3: فشل إنشاء المحادثة

**السبب**: مشكلة في الصلاحيات أو قاعدة البيانات

**الحل**:
1. تحقق من Console الباك إند للأخطاء
2. تحقق من أن جدول `conversations` موجود
3. تحقق من صلاحيات المستخدم

## قائمة التحقق | Checklist

### قبل الاختبار | Before Testing

- [ ] الباك إند يعمل على البورت 3003
- [ ] WebSocket يعمل على البورت 8080
- [ ] الفرونت إند يعمل على البورت 3000
- [ ] يوجد مستخدم واحد على الأقل بدور `admin`
- [ ] قاعدة البيانات متصلة

### أثناء الاختبار | During Testing

- [ ] المستخدم الجديد تم تسجيله بنجاح
- [ ] تسجيل الدخول يعمل
- [ ] صفحة Dashboard تفتح بدون أخطاء
- [ ] أداة الدردشة تظهر بشكل صحيح
- [ ] WebSocket متصل (مؤشر أخضر)
- [ ] رسالة ترحيبية تظهر
- [ ] يمكن كتابة رسالة
- [ ] يمكن إرسال رسالة
- [ ] الرسالة تظهر مباشرة

### بعد الاختبار | After Testing

- [ ] لا توجد أخطاء في console المتصفح
- [ ] لا توجد أخطاء في console الباك إند
- [ ] المحادثة محفوظة في قاعدة البيانات
- [ ] الرسائل محفوظة في قاعدة البيانات
- [ ] يمكن للمدير (admin) رؤية المحادثة

## أدوات التشخيص | Diagnostic Tools

### 1. فحص قاعدة البيانات

```sql
-- فحص المستخدم الجديد
SELECT id, email, role, display_name 
FROM users 
WHERE email = 'newuser@test.com';

-- فحص المحادثات
SELECT c.id, c.type, c.status, c.client_id, c.admin_id, c.created_at,
       u1.email as client_email, u2.email as admin_email
FROM conversations c
LEFT JOIN users u1 ON c.client_id = u1.id
LEFT JOIN users u2 ON c.admin_id = u2.id
WHERE c.client_id IN (SELECT id FROM users WHERE email = 'newuser@test.com');

-- فحص الرسائل
SELECT m.id, m.text, m.sender_type, m.status, m.created_at,
       u.email as sender_email
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id
WHERE m.conversation_id IN (
  SELECT id FROM conversations 
  WHERE client_id IN (SELECT id FROM users WHERE email = 'newuser@test.com')
)
ORDER BY m.created_at DESC;
```

### 2. فحص localStorage

```javascript
// في console المتصفح
console.log('Token:', localStorage.getItem('token'))
console.log('Auth Token:', localStorage.getItem('auth_token'))

// فك تشفير Token
const token = localStorage.getItem('token')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token Payload:', payload)
}
```

### 3. فحص WebSocket

```javascript
// في console المتصفح
// انتظر قليلاً ثم نفذ:
console.log('WebSocket Status:', wsStatus)
console.log('Is Connected:', wsConnected)
console.log('Active Conversation ID:', activeConversationId)
console.log('Active Chat ID:', activeChatId)
```

## نتائج متوقعة | Expected Results

### ✅ نجاح الاختبار | Test Success

```
✓ المستخدم تم تسجيله بنجاح
✓ تم إنشاء محادثة general تلقائياً
✓ WebSocket متصل بنجاح
✓ رسالة ترحيبية تظهر
✓ يمكن إرسال الرسائل واستقبالها
✓ الرسائل محفوظة في قاعدة البيانات
✓ المدير يمكنه رؤية المحادثة والرد
```

---

## معلومات إضافية | Additional Information

### API Endpoints المستخدمة

1. **`GET /api/v1/users/chat/available`**
   - يجلب قائمة الإداريين المتاحين
   - للمستخدمين: يعيد فقط admins
   - للإداريين: يعيد جميع المستخدمين

2. **`POST /api/v1/conversations/get-or-create`**
   - ينشئ محادثة جديدة أو يعيد موجودة
   - يدعم: general, project, admin_internal

3. **`GET /api/v1/messages/:conversationId`**
   - يجلب رسائل محادثة محددة

4. **`POST /api/v1/messages`**
   - ينشئ رسالة جديدة

### WebSocket Events

```typescript
// من Client إلى Server
- message:send       // إرسال رسالة
- typing:start       // بدء الكتابة
- typing:stop        // إيقاف الكتابة
- conversation:join  // الانضمام لمحادثة
- conversation:leave // مغادرة محادثة

// من Server إلى Client
- auth:success       // نجاح المصادقة
- message:sent       // تأكيد إرسال الرسالة
- message:delivered  // توصيل الرسالة
- message:read       // قراءة الرسالة
- typing:start       // الطرف الآخر يكتب
- typing:stop        // الطرف الآخر توقف
```

---

## الدعم | Support

إذا واجهت أي مشاكل:

1. **تحقق من Console** (المتصفح + الباك إند)
2. **تحقق من قاعدة البيانات** (هل البيانات محفوظة؟)
3. **تحقق من الاتصال** (WebSocket متصل؟)
4. **راجع ملف الإصلاح**: `NEW_USER_CHAT_FIX.md`

---

**آخر تحديث**: 24 يوليو 2026  
**النسخة**: 1.0  
**الحالة**: ✅ جاهز للاختبار
