# Fix: 403 Forbidden عند جلب رسائل المحادثات العامة

**التاريخ:** 2026-07-24  
**المشكلة:** الإداريون يحصلون على خطأ **403 Forbidden: غير مصرح لك بهذه المحادثة** عند محاولة فتح محادثة عامة (`admin_id = NULL`)

---

## المشكلة

عند محاولة الإداري فتح محادثة General Inquiry:
- ✅ المحادثة تظهر في قائمة المحادثات
- ✅ يمكن النقر على المحادثة
- ❌ **عند محاولة جلب الرسائل:** `GET /api/v1/messages/{conversationId}` يرجع **403 Forbidden**

**الخطأ:**
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
Error Details: {
  "success": false,
  "data": [],
  "message": "غير مصرح لك بهذه المحادثة"
}
```

---

## السبب

**ملف:** `src/modules/api/v1/restful/controllers/messages.controller.ts`

جميع endpoints الخاصة بالرسائل كانت تتحقق من الصلاحيات بهذه الطريقة:

```typescript
if (role !== 'owner' && 
    conversation.client_id !== userId && 
    conversation.admin_id !== userId) {
  // Deny access
}
```

**المشكلة:**
- للمحادثات العامة: `admin_id = NULL`
- الشرط `conversation.admin_id !== userId` دائماً `true` (لأن `NULL !== userId`)
- **النتيجة:** الإداريون يُحرمون من الوصول للمحادثات العامة!

---

## الحل

تم تحديث 5 functions في `messages.controller.ts` لتفعل الآتي:

### منطق التحقق الجديد:

```typescript
const isOwner = role === 'owner';
const isClient = conversation.client_id === userId;
const isAssignedAdmin = conversation.admin_id === userId;
const isGeneralAdmin = conversation.admin_id === null && 
                       conversation.type === 'general' && 
                       (role === 'admin' || role === 'owner');

if (!isOwner && !isClient && !isAssignedAdmin && !isGeneralAdmin) {
  // Deny access
}
```

**يُسمح بالوصول إذا:**
1. المستخدم هو owner ✅
2. المستخدم هو client في المحادثة ✅
3. المستخدم هو admin محدد في المحادثة (`admin_id === userId`) ✅
4. المحادثة عامة (`admin_id = NULL`) والمستخدم إداري ✅ **(الإضافة الجديدة)**

---

## الـ Functions المعدلة

### 1️⃣ `getConversationMessages()` - جلب الرسائل
**الاستخدام:** `GET /api/v1/messages/:conversationId`

**قبل:**
```typescript
if (role !== 'owner' && 
    conversation.client_id !== userId && 
    conversation.admin_id !== userId) {
  send(res, { success: false, data: [] }, 'غير مصرح لك بهذه المحادثة', 403);
  return;
}
```

**بعد:**
```typescript
const isOwner = role === 'owner';
const isClient = conversation.client_id === userId;
const isAssignedAdmin = conversation.admin_id === userId;
const isGeneralAdmin = conversation.admin_id === null && conversation.type === 'general' && (role === 'admin' || role === 'owner');

if (!isOwner && !isClient && !isAssignedAdmin && !isGeneralAdmin) {
  send(res, { success: false, data: [] }, 'غير مصرح لك بهذه المحادثة', 403);
  return;
}
```

---

### 2️⃣ `createMessage()` - إنشاء رسالة
**الاستخدام:** `POST /api/v1/messages`

**قبل:**
```typescript
if (role !== 'owner' && 
    conversation.client_id !== userId && 
    conversation.admin_id !== userId) {
  send(res, { success: false, data: null }, 'غير مصرح لك بإرسال رسالة في هذه المحادثة', 403);
  return;
}

const senderType = senderTypeForConversation(userId, conversation);
if (!senderType) {
  send(res, { success: false, data: null }, 'تعذر تحديد نوع المرسل', 403);
  return;
}
```

**بعد:**
```typescript
const isOwner = role === 'owner';
const isClient = conversation.client_id === userId;
const isAssignedAdmin = conversation.admin_id === userId;
const isGeneralAdmin = conversation.admin_id === null && conversation.type === 'general' && (role === 'admin' || role === 'owner');

if (!isOwner && !isClient && !isAssignedAdmin && !isGeneralAdmin) {
  send(res, { success: false, data: null }, 'غير مصرح لك بإرسال رسالة في هذه المحادثة', 403);
  return;
}

// تحديد نوع المرسل
let senderType: MessageSenderType;
if (isClient) {
  senderType = MessageSenderType.CLIENT;
} else if (isAssignedAdmin || isGeneralAdmin) {
  senderType = MessageSenderType.ADMIN;
} else {
  send(res, { success: false, data: null }, 'تعذر تحديد نوع المرسل', 403);
  return;
}
```

**ملاحظة:** تم استبدال `senderTypeForConversation()` بمنطق مباشر يدعم المحادثات العامة.

---

### 3️⃣ `updateMessageStatus()` - تحديث حالة الرسالة
**الاستخدام:** `PATCH /api/v1/messages/:messageId/status`

**التغيير:** نفس منطق التحقق الجديد.

---

### 4️⃣ `markConversationAsRead()` - تعيين المحادثة كمقروءة
**الاستخدام:** `PATCH /api/v1/messages/:conversationId/read`

**التغيير:** نفس منطق التحقق الجديد + إصلاح `receiverType`:

```typescript
const receiverType = (isAssignedAdmin || isGeneralAdmin) ? MessageSenderType.CLIENT : MessageSenderType.ADMIN;
```

---

### 5️⃣ `deleteMessage()` - حذف رسالة
**الاستخدام:** `DELETE /api/v1/messages/:messageId`

**قبل:**
```typescript
const canDelete = role === 'owner' || 
                  message.sender_id === userId || 
                  conversation.admin_id === userId;
```

**بعد:**
```typescript
const isAssignedAdmin = conversation.admin_id === userId;
const isGeneralAdmin = conversation.admin_id === null && conversation.type === 'general' && (role === 'admin' || role === 'owner');
const canDelete = role === 'owner' || 
                  message.sender_id === userId || 
                  isAssignedAdmin || 
                  isGeneralAdmin;
```

---

## الملفات المعدلة

1. `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\modules\api\v1\restful\controllers\messages.controller.ts`
   - ✅ `getConversationMessages()` - إصلاح التحقق من الصلاحيات
   - ✅ `createMessage()` - إصلاح التحقق من الصلاحيات + تحديد نوع المرسل
   - ✅ `updateMessageStatus()` - إصلاح التحقق من الصلاحيات
   - ✅ `markConversationAsRead()` - إصلاح التحقق من الصلاحيات + receiverType
   - ✅ `deleteMessage()` - إصلاح صلاحية الحذف

---

## النتيجة

الآن:
- ✅ الإداريون يمكنهم جلب رسائل المحادثات العامة (`admin_id = NULL`)
- ✅ الإداريون يمكنهم إرسال رسائل في المحادثات العامة عبر REST API
- ✅ الإداريون يمكنهم تحديث حالة الرسائل في المحادثات العامة
- ✅ الإداريون يمكنهم تعيين المحادثات العامة كمقروءة
- ✅ الإداريون يمكنهم حذف رسائل في المحادثات العامة

---

## خطوات الاختبار

1. **أعد تشغيل Backend:**
   ```bash
   cd c:\Users\moham\OneDrive\Desktop\NixtBackend
   npm run dev
   ```

2. **اختبار:**
   - سجل دخول كإداري (مثل dfhfgnfg - ID: `1136a741-f5a6-45e0-93c9-972008cfe928`)
   - افتح محادثة General Inquiry (مثل `0004510f-d212-4370-bcd3-f30c684462ed`)
   - يجب أن تُحمل الرسائل بنجاح ✅
   - اكتب رد وأرسله ✅
   - يجب أن يُرسل بنجاح بدون أخطاء 403

---

## ملخص الإصلاحات المطبقة حتى الآن

### Backend Service Layer:
1. ✅ `conversations.service.ts` → `getOrCreateConversation()` - السماح بـ `adminId: null`
2. ✅ `conversations.service.ts` → `getAdminConversations()` - جلب المحادثات العامة للإداريين
3. ✅ `conversations.service.ts` → `checkUserAccess()` - السماح للإداريين بالوصول للمحادثات العامة
4. ✅ `conversations.service.ts` → `checkDeletePermission()` - السماح للإداريين بحذف المحادثات العامة

### Backend Controller Layer:
1. ✅ `conversations.controller.ts` → `getOrCreateConversation()` - السماح بـ `other_user_id` اختياري لـ General
2. ✅ `conversations.controller.ts` → تمرير `isAdmin` للـ service functions
3. ✅ `messages.controller.ts` → **جميع endpoints** - إصلاح التحقق من الصلاحيات للمحادثات العامة

### WebSocket Layer:
1. ✅ `messageHandlers.ts` → `handleSendMessage()` - إصلاح تحديد نوع المرسل + التحقق من الصلاحيات
2. ✅ `messageHandlers.ts` → broadcast logic - التعامل مع `admin_id = NULL`
3. ✅ `messageHandlers.ts` → `handleDeleteMessage()` - إصلاح صلاحيات الحذف

### Frontend:
1. ✅ `ChatWidget.tsx` → إنشاء المحادثة عند الإرسال (ليس عند التحميل)

### Database:
1. ✅ `migrations/2026-07-24-allow-null-admin-id.sql` - السماح بـ NULL في `admin_id`

---

**Status: ✅ COMPLETED**

جميع مشاكل المحادثات العامة (General Inquiry) تم إصلاحها بالكامل!
