# إصلاح مشكلة عرض اسم المحادثة "واحد"

## المشكلة

عند الضغط على اسم "الإداري" في قائمة المحادثات، كان يختفي الاسم ويظهر بدلاً منه "واحد". 

## السبب

المستخدم في قاعدة البيانات كان لديه:
- `first_name` = "واحد"
- `last_name` = "" (فارغ أو null)
- `display_name` = null أو فارغ

الكود السابق كان يقوم بـ:
```typescript
const otherUserName = otherUser?.display_name
  || `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim()
  || otherUser?.email
  || 'مستخدم'
```

هذا يعني أنه يأخذ `first_name + last_name` مباشرة = "واحد" دون فحص إذا كان هذا اسماً غير مفيد.

## الحل

تم تحديث المنطق لفحص إذا كان الاسم الكامل يساوي "واحد" أو "One"، وفي هذه الحالة يتم استخدام البريد الإلكتروني بدلاً منه:

```typescript
// بناء اسم المستخدم الآخر مع التأكد من عدم كون الاسم "واحد"
let otherUserName = otherUser?.display_name?.trim()

// إذا لم يكن هناك display_name، جرب first_name + last_name
if (!otherUserName) {
  const fullName = `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim()
  if (fullName && fullName !== 'واحد' && fullName !== 'One') {
    otherUserName = fullName
  }
}

// إذا ما زال فارغاً أو يساوي "واحد"، استخدم البريد الإلكتروني
if (!otherUserName || otherUserName === 'واحد' || otherUserName === 'One') {
  otherUserName = otherUser?.email || (language === 'ar' ? 'مستخدم' : 'User')
}
```

## التأثير

الآن عند:
1. إنشاء محادثة مع إداري اسمه "واحد"
2. الضغط على المحادثة
3. سيتم عرض **البريد الإلكتروني** بدلاً من "واحد"

## الأماكن المُصلحة

تم تطبيق هذا الإصلاح في:
1. **المحادثات الموجودة** (items): السطر ~407
2. **الإداريين بدون محادثات** (adminItems): السطر ~437

## ملاحظات

- هذا الإصلاح يعمل على مستوى الواجهة (Frontend)
- المشكلة الأساسية في البيانات (قاعدة البيانات) - المستخدم فعلاً اسمه "واحد"
- **للحل الجذري**: يجب تحديث بيانات المستخدم في قاعدة البيانات:

```sql
-- تحديث اسم المستخدم الذي اسمه "واحد"
UPDATE users 
SET 
  display_name = 'الاسم الصحيح للإداري',
  first_name = 'الاسم الأول',
  last_name = 'اسم العائلة'
WHERE first_name = 'واحد';
```

## التاريخ

- **التاريخ**: 2026-07-24
- **الملف المُعدّل**: `components/UI/ChatWidget.tsx`
- **النوع**: Bug Fix
