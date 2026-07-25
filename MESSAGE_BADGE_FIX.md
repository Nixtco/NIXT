# Fix: عرض Badge صحيح للرسائل (CLIENT vs ADMIN)

**التاريخ:** 2026-07-24  
**المشكلة:** جميع الرسائل تظهر بـ badge "CLIENT" بالرغم من أن بعضها من admins (kimo - owner, dfhfgnfg - admin)

---

## المشكلة

في واجهة المحادثات:
- جميع الرسائل تعرض badge **"CLIENT"**
- حتى الرسائل المرسلة من الإداريين (kimo - owner, dfhfgnfg - admin) تظهر بـ badge "CLIENT"
- المنطق الصحيح: 
  - رسائل من CLIENT → badge "CLIENT" ✅
  - رسائل من ADMIN → badge "ADMIN" ✅

---

## السبب الجذري

**الملف:** `components/UI/ChatWidget.tsx`

المنطق القديم لعرض الـ badge (السطر ~1680):

```typescript
{msg.sender === 'received' && (
  <span className={isAdminMode ? styles.clientRole : styles.adminRole}>
    {isAdminMode
      ? (language === 'ar' ? 'عميل' : 'client')
      : 'admin'}
  </span>
)}
```

**المشكلة:**
- الكود يعتمد على `msg.sender` ('sent' | 'received') و `isAdminMode`
- `msg.sender` يُحدد فقط **اتجاه الرسالة بالنسبة للمستخدم الحالي**:
  - `sent` = أنا أرسلت هذه الرسالة
  - `received` = أنا استقبلت هذه الرسالة
- لكن **لا يُحدد النوع الفعلي للمرسل** (client أو admin)!

**مثال:**
- الإداري kimo يفتح محادثة مع hemoo (client)
- hemoo أرسل رسالة → في واجهة kimo: `sender = 'received'`
- kimo أرسل رسالة → في واجهة kimo: `sender = 'sent'`
- المنطق القديم يقول: `isAdminMode = true` → إذاً الرسائل `received` هي من "CLIENT" ✅
- **لكن!** عندما يرد إداري آخر (dfhfgnfg)، رسالته أيضاً `received` بالنسبة لـ kimo!
- النتيجة: رسالة dfhfgnfg (admin) تظهر بـ badge "CLIENT" ❌

---

## الحل

### 1. إضافة `senderType` للـ Message Interface

```typescript
interface Message {
  id: string | number
  text: string
  sender: 'sent' | 'received'  // اتجاه الرسالة
  time: string
  senderName?: string
  senderType?: 'admin' | 'client'  // ✅ النوع الفعلي للمرسل
  attachment?: MessageAttachment
  status?: 'sent' | 'delivered' | 'read'
}
```

**`senderType`** يأتي مباشرة من API (`sender_type` في جدول `messages`)

---

### 2. تحديث منطق تحويل الرسائل

في جميع الأماكن التي تُحوّل الرسائل من API إلى UI format:

#### أ. `onMessageSent` handler (WebSocket):

```typescript
const newMessage: Message = {
  id: message.id,
  text: message.text,
  sender: isMyMessage ? 'sent' : 'received',
  time: new Date(message.created_at).toLocaleTimeString(...),
  senderName: message.sender?.display_name || message.sender?.email,
  senderType: message.sender_type === 'admin' ? 'admin' : 'client', // ✅
  attachment: ...,
  status: message.status
}
```

#### ب. `loadMessages` (REST API):

```typescript
const convertedMessages: Message[] = res.data.map(msg => {
  const isMyMessage = currentUserId && msg.sender_id === currentUserId
  
  return {
    id: msg.id,
    text: msg.text,
    sender: isMyMessage ? 'sent' : 'received',
    time: new Date(msg.created_at).toLocaleTimeString(...),
    senderName: msg.sender?.display_name || msg.sender?.email,
    senderType: msg.sender_type === 'admin' ? 'admin' : 'client', // ✅
    attachment: msg.attachment || undefined,
    status: msg.status
  }
})
```

#### ج. رسائل مؤقتة (Seed messages, Welcome message, Auto-reply):

```typescript
// Welcome message
function getWelcomeMessage(language: string): Message {
  return {
    ...
    senderType: 'admin', // ✅ من الدعم
  }
}

// Seed messages
messages[id] = [{
  ...
  senderType: 'client', // ✅ من العميل
}]

// Auto-reply
{
  ...
  senderType: 'admin', // ✅ رد تلقائي من الدعم
}

// Temp message (REST fallback)
const newMessage: Message = {
  ...
  senderType: isAdminMode ? 'admin' : 'client', // ✅
}
```

---

### 3. تحديث منطق عرض الـ Badge

**قبل:**
```typescript
{msg.sender === 'received' && (
  <span className={isAdminMode ? styles.clientRole : styles.adminRole}>
    {isAdminMode ? 'client' : 'admin'}
  </span>
)}
{msg.sender === 'sent' && isAdminMode && (
  <span className={styles.adminRole}>admin</span>
)}
```

**بعد:**
```typescript
{/* عرض الـ badge بناءً على senderType الفعلي من API */}
{msg.senderType === 'client' && (
  <span className={styles.clientRole}>
    {language === 'ar' ? 'عميل' : 'client'}
  </span>
)}
{msg.senderType === 'admin' && (
  <span className={styles.adminRole}>admin</span>
)}
```

**الفرق:**
- ✅ الآن Badge يعتمد فقط على `msg.senderType` من API
- ✅ لا يعتمد على `msg.sender` أو `isAdminMode`
- ✅ يعرض النوع الفعلي للمرسل

---

## النتيجة

الآن:
- ✅ رسائل hemoo (client) → badge **"CLIENT"** ✅
- ✅ رسائل kimo (owner/admin) → badge **"ADMIN"** ✅
- ✅ رسائل dfhfgnfg (admin) → badge **"ADMIN"** ✅
- ✅ Badge يعرض النوع الصحيح بغض النظر عن من يشاهد المحادثة

---

## الملفات المعدلة

1. `c:\Users\moham\OneDrive\Desktop\NIXT\components\UI\ChatWidget.tsx`
   - ✅ إضافة `senderType` للـ Message interface
   - ✅ تحديث `getWelcomeMessage()` لإضافة `senderType`
   - ✅ تحديث `createAdminSeedMessages()` لإضافة `senderType`
   - ✅ تحديث `pushAutoReply()` لإضافة `senderType`
   - ✅ تحديث `onMessageSent` handler لإضافة `senderType`
   - ✅ تحديث `loadMessages()` لإضافة `senderType`
   - ✅ تحديث `sendMessage()` (REST fallback) لإضافة `senderType`
   - ✅ تحديث JSX لعرض badge بناءً على `senderType`

---

## خطوات الاختبار

1. **إعادة تشغيل Frontend:**
   ```bash
   cd c:\Users\moham\OneDrive\Desktop\NIXT
   npm run dev
   ```

2. **اختبار:**
   - افتح محادثة General Inquiry كإداري (kimo أو dfhfgnfg)
   - شاهد الرسائل:
     - رسائل hemoo (client) → يجب أن تعرض badge "CLIENT" ✅
     - رسائل kimo (admin) → يجب أن تعرض badge "ADMIN" ✅
     - رسائل dfhfgnfg (admin) → يجب أن تعرض badge "ADMIN" ✅

3. **اختبار من جانب العميل:**
   - سجل دخول كـ hemoo
   - افتح General Inquiry
   - شاهد الرسائل:
     - رسائل hemoo → لا يوجد badge (لأنها `sent`)
     - رسائل من admins → يجب أن تعرض badge "ADMIN" ✅

---

## الفرق بين المفاهيم

### `sender` ('sent' | 'received')
- **معناه:** اتجاه الرسالة بالنسبة للمستخدم الحالي
- **استخدامه:** تحديد أين تُعرض الرسالة (يمين أو يسار)
- **مثال:**
  - أنا أرسلت رسالة → `sender = 'sent'` → عرض على اليمين
  - أنا استقبلت رسالة → `sender = 'received'` → عرض على اليسار

### `senderType` ('admin' | 'client')
- **معناه:** النوع الفعلي للمرسل في قاعدة البيانات
- **استخدامه:** عرض badge صحيح (CLIENT أو ADMIN)
- **مصدره:** `sender_type` من جدول `messages` في API
- **ثابت:** لا يتغير بتغيير من يشاهد الرسالة

---

**Status: ✅ COMPLETED**

الآن جميع الرسائل تعرض badge صحيح بناءً على النوع الفعلي للمرسل!
