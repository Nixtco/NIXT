# دليل ربط المشاريع مع صفحة Dashboard
# Projects Dashboard Integration Guide

## نظرة عامة | Overview

تم ربط نظام المشاريع بصفحة Dashboard بشكل كامل. الآن كل عميل يستطيع رؤية المشاريع الخاصة به في صفحة Dashboard مع تفاصيل كاملة عن التقدم والميزانية والموعد النهائي.

The project system is fully integrated with the Dashboard page. Now each client can see their projects on the Dashboard with full details about progress, budget, and deadline.

---

## آلية العمل | How It Works

### 1. تسجيل الدخول | Login
عندما يسجل العميل دخوله إلى النظام، يتم التعرف عليه من خلال `user.id`

When a client logs in, they are identified using their `user.id`

### 2. جلب المشاريع | Fetching Projects
صفحة Dashboard تستخدم `ProjectOverview` component الذي يقوم بـ:
- جلب المشاريع الخاصة بالمستخدم من API
- استخدام endpoint: `GET /api/v1/projects/user/:userId`
- عرض تفاصيل كل مشروع

The Dashboard page uses the `ProjectOverview` component which:
- Fetches user's projects from the API
- Uses endpoint: `GET /api/v1/projects/user/:userId`
- Displays details for each project

### 3. البيانات المعروضة | Displayed Data

لكل مشروع، يتم عرض:

For each project, the following is displayed:

#### الحقول الأساسية | Basic Fields
- اسم المشروع | Project Name
- الحالة | Status (قيد التطوير، مكتمل، معلق، متوقف)
- الأولوية | Priority (منخفضة، متوسطة، عالية، عاجلة)

#### التقدم | Progress
- قائمة بجميع مراحل المشروع | List of all project phases
- نسبة الإنجاز لكل مرحلة | Completion percentage for each phase
- علامة اكتمال المهمة | Task completion mark (✓)
- شريط التقدم الإجمالي | Overall progress bar

#### البيانات المالية | Financial Data
- الميزانية الإجمالية | Total Budget
- المصروف حتى الآن | Amount Spent
- الموعد النهائي | Deadline

---

## كيفية استخدام النظام | How to Use the System

### للمدير (Controllers Page) | For Admin (Controllers Page)

#### 1. إضافة مشروع جديد | Add New Project

```
1. افتح صفحة Controllers | Open Controllers page
2. اذهب إلى تبويب "Projects" | Go to "Projects" tab
3. اضغط "إضافة مشروع" | Click "Add Project"
4. املأ البيانات:
   - اسم المشروع | Project Name
   - العميل (من القائمة المنسدلة) | Client (from dropdown)
   - السعر | Price
   - الموعد النهائي | Deadline
   - الأولوية | Priority
   - الحالة | Status
5. اضغط "حفظ" | Click "Save"
```

#### 2. إضافة مراحل التقدم | Add Progress Phases

```
1. افتح تفاصيل المشروع | Open project details
2. اضغط "إدارة التقدم" | Click "Manage Progress"
3. أضف مرحلة جديدة:
   - العنوان | Title (مثل: "تصميم الواجهة")
   - النسبة | Percentage (0-100)
4. احفظ التغييرات | Save changes
```

#### 3. تحديد المراحل المكتملة | Mark Phases as Complete

```
1. في تفاصيل المشروع | In project details
2. اضغط على العلامة بجانب المرحلة | Click the checkbox next to phase
3. سيتم تحديثها تلقائياً | It will update automatically
```

#### 4. إضافة أعضاء الفريق | Add Team Members

```
1. افتح تفاصيل المشروع | Open project details
2. اضغط "إدارة الفريق" | Click "Manage Team"
3. اختر العضو من القائمة | Select member from list
4. اضغط "إضافة" | Click "Add"
```

### للعميل (Dashboard Page) | For Client (Dashboard Page)

#### ماذا يرى العميل؟ | What Does the Client See?

```
1. سجل الدخول | Login
2. اذهب إلى Dashboard | Go to Dashboard
3. ستجد قسم "نظرة عامة على المشاريع" | You'll find "Project Overview" section
4. سترى جميع المشاريع الخاصة بك | You'll see all your projects
```

#### التفاصيل المتاحة | Available Details

```
✓ اسم المشروع والحالة | Project name and status
✓ جميع مراحل التقدم | All progress phases
✓ النسبة المئوية للإنجاز | Completion percentage
✓ الميزانية والمصروف | Budget and spent amount
✓ الموعد النهائي | Deadline
✓ الأولوية | Priority
```

---

## مثال عملي | Practical Example

### السيناريو | Scenario
لديك عميل اسمه "أحمد" وتريد إنشاء مشروع له

You have a client named "Ahmed" and want to create a project for him

### الخطوات | Steps

#### 1. إضافة المشروع | Add Project
```json
{
  "name": "موقع تجارة إلكترونية",
  "user_id": "550e8400-e29b-41d4-a716-446655440000", // معرف أحمد
  "price": 50000,
  "deadline": "2026-06-30",
  "priority": "high",
  "status": "active"
}
```

#### 2. إضافة مراحل التقدم | Add Progress Phases
```json
[
  { "id": "design", "title": "تصميم الواجهة", "percent": 100 },
  { "id": "frontend", "title": "تطوير الواجهة", "percent": 80 },
  { "id": "backend", "title": "تطوير Backend", "percent": 60 },
  { "id": "testing", "title": "الاختبار", "percent": 20 },
  { "id": "launch", "title": "الإطلاق", "percent": 0 }
]
```

#### 3. تحديد المراحل المكتملة | Mark Completed Phases
```json
["design"]
```

#### 4. النتيجة | Result
عندما يسجل "أحمد" دخوله ويذهب إلى Dashboard، سيرى:

When "Ahmed" logs in and goes to Dashboard, he will see:

```
📊 موقع تجارة إلكترونية
   حالة: قيد التطوير
   
   مراحل المشروع:
   ✅ تصميم الواجهة - 100%
   🔄 تطوير الواجهة - 80%
   🔄 تطوير Backend - 60%
   🔄 الاختبار - 20%
   ⏳ الإطلاق - 0%
   
   التقدم الإجمالي: 52%
   
   الميزانية: $50,000
   المصروف: $0
   الموعد النهائي: 30 يونيو 2026
   الأولوية: عالية
```

---

## استكشاف الأخطاء | Troubleshooting

### المشكلة: العميل لا يرى المشاريع | Issue: Client doesn't see projects

#### الحلول | Solutions

1. **تحقق من user_id**
   ```
   - تأكد أن المشروع مرتبط بـ user_id الصحيح
   - افتح Controllers → Projects
   - تحقق من حقل "العميل"
   ```

2. **تحقق من تسجيل الدخول**
   ```
   - تأكد أن العميل سجل دخوله بنجاح
   - تحقق من وجود token في localStorage
   ```

3. **تحقق من API**
   ```
   - افتح Developer Tools → Network
   - تحقق من طلب: GET /api/v1/projects/user/:userId
   - تأكد أن الاستجابة تحتوي على البيانات
   ```

### المشكلة: التقدم لا يظهر | Issue: Progress doesn't show

#### الحلول | Solutions

1. **تحقق من بيانات التقدم**
   ```javascript
   // يجب أن يكون بهذا الشكل
   progress: [
     { id: "step1", title: "المرحلة 1", percent: 50 }
   ]
   ```

2. **تحقق من progress_completed**
   ```javascript
   // للمراحل المكتملة
   progress_completed: ["step1", "step2"]
   ```

---

## الأكواد المهمة | Important Code References

### 1. صفحة Dashboard
```
ملف: app/dashboard/page.tsx
السطور: 1-239
```

### 2. مكون ProjectOverview
```
ملف: components/Dashboard/ProjectOverview.tsx
السطور: 1-320
```

### 3. دوال API
```
ملف: app/Projects/apiFunctions.ts
الدالة: getProjectsByUserId()
```

### 4. API Client
```
ملف: hooks/useApi.ts
الدالة: apiCall()
```

---

## ملاحظات مهمة | Important Notes

1. **الأمان | Security**
   - جميع الطلبات تستخدم JWT token
   - كل مستخدم يرى مشاريعه فقط
   - المدير يرى جميع المشاريع

2. **الأداء | Performance**
   - يتم جلب المشاريع مرة واحدة عند تحميل الصفحة
   - استخدم limit & offset للصفحات الكبيرة

3. **التحديث المباشر | Real-time Updates**
   - حالياً لا يوجد تحديث مباشر
   - يجب إعادة تحميل الصفحة لرؤية التحديثات

4. **اللغات | Languages**
   - يدعم العربية والإنجليزية
   - يتم التبديل تلقائياً حسب إعدادات المستخدم

---

## التطوير المستقبلي | Future Development

### مقترحات | Suggestions

1. **إشعارات فورية | Real-time Notifications**
   - عند تحديث التقدم
   - عند اكتمال مرحلة
   - عند اقتراب الموعد النهائي

2. **التعليقات والملاحظات | Comments & Notes**
   - السماح للعميل بإضافة تعليقات
   - التواصل مع الفريق

3. **المرفقات | Attachments**
   - رفع ملفات التصاميم
   - مشاركة الوثائق

4. **التقارير | Reports**
   - تقرير شهري بالتقدم
   - إحصائيات تفصيلية

---

## الدعم الفني | Technical Support

للمساعدة أو الاستفسارات:

For help or inquiries:

- البريد الإلكتروني | Email: support@nixt.com
- التوثيق | Documentation: `/docs`
- GitHub Issues

---

**تم إنشاء هذا التوثيق في: 21 فبراير 2026**

**Documentation created on: February 21, 2026**
