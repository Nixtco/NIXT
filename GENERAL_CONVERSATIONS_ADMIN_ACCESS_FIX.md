# Fix: جميع الإداريين يمكنهم رؤية المحادثات العامة

**التاريخ:** 2026-07-24  
**المشكلة:** المحادثات العامة (General Inquiry) التي `admin_id = NULL` تظهر فقط للـ owner (kimo) ولا تظهر للإداريين العاديين (مثل dfhfgnfg)

---

## المشكلة

عندما يقوم مستخدم جديد بإنشاء محادثة General Inquiry (حيث `admin_id = NULL`):
- ✅ تظهر المحادثة لـ **owner** (kimo)
- ❌ **لا تظهر** للإداريين العاديين (dfhfgnfg)

**السبب الجذري:**
دالة `getAdminConversations` كانت تجلب فقط المحادثات التي:
- `admin_id === userId` (محادثات مخصصة لهذا الإداري)
- `client_id === userId` (محادثات داخلية بين إداريين)

**لكنها لم تجلب المحادثات التي `admin_id = NULL` (المحادثات العامة)!**

---

## الحل

تم تعديل 3 دوال في الـ backend:

### 1. `getAdminConversations()` - جلب المحادثات
**الملف:** `src/modules/database/postgreSQL/services/conversations.service.ts`

**قبل:**
```typescript
async getAdminConversations(adminId: string | null, options: ...) {
  let where: WhereOptions = {};
  
  if (adminId) {
    where = {
      [Op.or]: [
        { admin_id: adminId },
        { client_id: adminId }
      ]
    };
  }
  
  return this.getConversations({ ...options, where });
}
```

**بعد:**
```typescript
async getAdminConversations(adminId: string | null, options: ...) {
  let where: WhereOptions = {};
  
  if (adminId) {
    where = {
      [Op.or]: [
        { admin_id: adminId },
        { client_id: adminId },
        { 
          admin_id: { [Op.is]: null },
          type: ConversationType.GENERAL
        } // ✅ المحادثات العامة متاحة لجميع الإداريين
      ]
    };
  }
  
  return this.getConversations({ ...options, where });
}
```

**التغيير:**
- إضافة شرط جديد: المحادثات التي `admin_id = NULL` و `type = 'general'` يتم جلبها لجميع الإداريين

---

### 2. `checkUserAccess()` - التحقق من الصلاحيات
**الملف:** `src/modules/database/postgreSQL/services/conversations.service.ts`

**قبل:**
```typescript
async checkUserAccess(conversationId: string, userId: string, isOwner: boolean) {
  const conversation = await Conversation.findByPk(conversationId);
  
  if (!conversation) return { hasAccess: false, conversation: null };
  if (isOwner) return { hasAccess: true, conversation };
  
  const hasAccess = conversation.client_id === userId || conversation.admin_id === userId;
  return { hasAccess, conversation };
}
```

**بعد:**
```typescript
async checkUserAccess(conversationId: string, userId: string, isOwner: boolean, isAdmin: boolean = false) {
  const conversation = await Conversation.findByPk(conversationId);
  
  if (!conversation) return { hasAccess: false, conversation: null };
  if (isOwner) return { hasAccess: true, conversation };
  
  const isParticipant = conversation.client_id === userId || conversation.admin_id === userId;
  const isGeneralConversation = conversation.admin_id === null && conversation.type === ConversationType.GENERAL && isAdmin;
  
  const hasAccess = isParticipant || isGeneralConversation; // ✅
  return { hasAccess, conversation };
}
```

**التغيير:**
- إضافة parameter جديد: `isAdmin`
- السماح للإداريين بالوصول للمحادثات العامة (`admin_id = NULL`)

---

### 3. `checkDeletePermission()` - صلاحيات الحذف
**الملف:** `src/modules/database/postgreSQL/services/conversations.service.ts`

**قبل:**
```typescript
async checkDeletePermission(conversationId: string, userId: string, isOwner: boolean) {
  const conversation = await Conversation.findByPk(conversationId);
  
  if (!conversation) return { canDelete: false, conversation: null };
  if (isOwner) return { canDelete: true, conversation };
  
  const canDelete = conversation.admin_id === userId;
  return { canDelete, conversation };
}
```

**بعد:**
```typescript
async checkDeletePermission(conversationId: string, userId: string, isOwner: boolean, isAdmin: boolean = false) {
  const conversation = await Conversation.findByPk(conversationId);
  
  if (!conversation) return { canDelete: false, conversation: null };
  if (isOwner) return { canDelete: true, conversation };
  
  const canDelete = conversation.admin_id === userId || 
                    (conversation.admin_id === null && conversation.type === ConversationType.GENERAL && isAdmin); // ✅
  return { canDelete, conversation };
}
```

**التغيير:**
- السماح للإداريين بحذف المحادثات العامة

---

### 4. تحديث الـ Controller
**الملف:** `src/modules/api/v1/restful/controllers/conversations.controller.ts`

تم تحديث استدعاءات الـ service functions لتمرير `isAdmin`:

```typescript
// في getConversationById
const isOwner = role === 'owner';
const isAdmin = role === 'admin' || role === 'owner'; // ✅
const { hasAccess } = await conversationsService.checkUserAccess(conversationId, userId!, isOwner, isAdmin);

// في deleteConversation
const isOwner = role === 'owner';
const isAdmin = role === 'admin' || role === 'owner'; // ✅
const { canDelete } = await conversationsService.checkDeletePermission(conversationId, userId!, isOwner, isAdmin);
```

---

## النتيجة

الآن:
- ✅ المحادثات العامة (`admin_id = NULL` و `type = 'general'`) تظهر لجميع الإداريين
- ✅ أي إداري يمكنه فتح وقراءة المحادثات العامة
- ✅ أي إداري يمكنه الرد على المحادثات العامة
- ✅ أي إداري يمكنه حذف المحادثات العامة
- ✅ المحادثات المخصصة (`admin_id` محدد) لا تزال مقتصرة على الإداري المحدد فقط

---

## اختبار

1. **مستخدم جديد** ينشئ محادثة General Inquiry
2. **Owner (kimo)** يجب أن يرى المحادثة → ✅
3. **Admin (dfhfgnfg)** يجب أن يرى المحادثة الآن → ✅
4. **أي إداري** يمكنه الرد على المحادثة → ✅

---

## الملفات المعدلة

1. `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\modules\database\postgreSQL\services\conversations.service.ts`
   - `getAdminConversations()` - إضافة شرط للمحادثات العامة
   - `checkUserAccess()` - إضافة parameter `isAdmin` والسماح بالوصول للمحادثات العامة
   - `checkDeletePermission()` - إضافة parameter `isAdmin` والسماح بحذف المحادثات العامة

2. `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\modules\api\v1\restful\controllers\conversations.controller.ts`
   - تحديث استدعاء `checkUserAccess()` لتمرير `isAdmin`
   - تحديث استدعاء `checkDeletePermission()` لتمرير `isAdmin`

---

## ملاحظة هامة

**لا حاجة لإضافة أذونات جديدة في Admin Management Tab!**

السلوك الحالي:
- أي مستخدم يحمل role = `'admin'` أو `'owner'` يمكنه رؤية والرد على المحادثات العامة
- هذا يعتمد على role المستخدم في جدول `users` وليس على أذونات إضافية

إذا كان هناك حاجة لتخصيص أكثر في المستقبل (مثلاً: بعض الإداريين لا يمكنهم رؤية المحادثات العامة)، يمكن إضافة إذن جديد في `project_admin_permissions` مثل:
- `permission_name: 'view_general_conversations'`
- `description: 'السماح للإداري برؤية المحادثات العامة'`

لكن حالياً، جميع الإداريين لديهم وصول كامل للمحادثات العامة.
