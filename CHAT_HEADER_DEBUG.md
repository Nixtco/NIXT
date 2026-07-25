# تشخيص مشكلة عرض معلومات المحادثة في الـ Header

## المشكلة المطلوب حلها

عند فتح محادثة بين مستخدمين (مثل kimo و dfhfgnfg):
- **❌ الحالة الحالية**: كلا الطرفين يريان نفس البيانات في رأس المحادثة
- **✅ المطلوب**: كل طرف يرى معلومات الطرف الآخر

## خطوات التشخيص

### 1. افتح Console في المتصفح
اضغط F12 وانتقل لتبويب "Console"

### 2. ابحث عن الـ Logs التالية

عند تحميل الصفحة، ستظهر هذه الرسائل:

```
🔍 [CHATS] بناء قائمة المحادثات...
🔍 [CHATS] currentUserId: <ID>
🔍 [CHATS] conversations: [...]
```

### 3. تحقق من البيانات

لكل محادثة، ستجد:

```
🔍 [CHAT xxx] client_id=..., admin_id=..., currentUserId=...
✅ [CHAT xxx] المستخدم الحالي هو admin، الطرف الآخر هو client: {...}
✅ [CHAT xxx] ChatItem النهائي: {...}
```

### 4. التحقق من البيانات المتوقعة

#### السيناريو 1: kimo يفتح المحادثة

**المتوقع:**
```javascript
currentUserId: "ID_OF_KIMO"
client_id: "ID_OF_KIMO"
admin_id: "ID_OF_DFHFGNFG"

// يجب أن يكون:
otherUser: { 
  email: "fdbfnrrt@gmail.com",  // بريد dfhfgnfg
  display_name: "dfhfgnfg",
  ...
}

chatItem: {
  clientName: "dfhfgnfg",
  clientEmail: "fdbfnrrt@gmail.com"
}
```

#### السيناريو 2: dfhfgnfg يفتح المحادثة

**المتوقع:**
```javascript
currentUserId: "ID_OF_DFHFGNFG"
client_id: "ID_OF_KIMO"
admin_id: "ID_OF_DFHFGNFG"

// يجب أن يكون:
otherUser: { 
  email: "kimo@example.com",  // بريد kimo
  display_name: "kimo",
  ...
}

chatItem: {
  clientName: "kimo",
  clientEmail: "kimo@example.com"
}
```

## الأخطاء المحتملة

### ❌ خطأ 1: currentUserId = null

**الأعراض:**
```
currentUserId: null
⚠️ fallback: عرض client
```

**الحل:**
تحقق من أن token موجود وصحيح في localStorage

### ❌ خطأ 2: conv.admin أو conv.client = null

**الأعراض:**
```
otherUser: null
clientName: "مستخدم"
clientEmail: undefined
```

**السبب:**
الـ API لا يُرجع بيانات admin أو client في الـ conversation

**الحل:**
تحقق من أن Backend يُضمّن (include) بيانات admin و client عند جلب المحادثات

### ❌ خطأ 3: كلا الطرفين لهما نفس role

**الأعراض:**
```
client_id: "ID1"
admin_id: "ID1"  // ❌ نفس الـ ID!
```

**السبب:**
خطأ في إنشاء المحادثة - كلا الطرفين مُسجلين بنفس الدور

## تحديث كود الـ Header

تم تحديث كود رأس المحادثة ليستخدم بيانات `activeChat` مباشرة:

```tsx
<span className={styles.headerTitle}>
  {activeChat?.type === 'general'
    ? `استفسار — ${activeChat?.clientName || activeChat?.name}`
    : `${activeChat?.name}${activeChat?.clientName ? ' · ' + activeChat?.clientName : ''}`}
</span>

<span className={styles.headerStatus}>
  {activeChat?.clientEmail || activeChat?.subtitle || ''}
</span>
```

## خطوات التأكد من الحل

1. ✅ سجل الدخول كـ **kimo**
2. ✅ افتح المحادثة مع **dfhfgnfg**
3. ✅ تأكد من ظهور:
   - العنوان: `استفسار — dfhfgnfg`
   - الـ subtitle: `fdbfnrrt@gmail.com`

4. ✅ سجل الدخول كـ **dfhfgnfg**
5. ✅ افتح نفس المحادثة
6. ✅ تأكد من ظهور:
   - العنوان: `استفسار — kimo`
   - الـ subtitle: `kimo@example.com`

## ملف الكود المُعدّل

- `components/UI/ChatWidget.tsx`

## التاريخ

- 2026-07-24
