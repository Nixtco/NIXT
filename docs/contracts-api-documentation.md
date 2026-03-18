# توثيق APIs إدارة العقود
# Contracts API Documentation

**الرابط الأساسي | Base URL:** `http://localhost:3003`

## نظرة عامة | Overview

هذا التوثيق يغطي جميع نقاط النهاية (APIs) المتعلقة بإدارة العقود. هذا النظام يُستخدم لإدارة العقود بين الشركة والعملاء مثل الإنشاء، التحديث، التوقيع، تغيير الحالة، الحذف، والحصول على الإحصائيات. جميع المسارات تبدأ بـ `/api/v1/contracts`

This documentation covers all API endpoints related to contracts management. This system is used to manage contracts between the company and clients such as creating, updating, signing, changing status, deleting, and retrieving statistics. All routes start with `/api/v1/contracts`

---

## جدول المحتويات | Table of Contents

1. [الحصول على جميع العقود](#1-get-all-contracts)
2. [الحصول على إحصائيات العقود](#2-get-contract-statistics)
3. [الحصول على عقود المستخدم الحالي](#3-get-my-contracts)
4. [الحصول على عقد بواسطة رقم العقد](#4-get-contract-by-number)
5. [الحصول على عقود المستخدم](#5-get-contracts-by-user-id)
6. [الحصول على عقود المشروع](#6-get-contracts-by-project-id)
7. [الحصول على عقد بواسطة المعرف](#7-get-contract-by-id)
8. [إنشاء عقد جديد](#8-create-new-contract)
9. [تحديث عقد](#9-update-contract)
10. [توقيع العقد](#10-sign-contract)
11. [تغيير حالة العقد](#11-change-contract-status)
12. [حذف عقد](#12-delete-contract)
13. [هيكل نموذج العقود](#13-contract-model-structure)
14. [ملاحظات مهمة](#14-important-notes)

---

## 1. الحصول على جميع العقود | Get All Contracts

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts`
- **الوصف | Description:** الحصول على قائمة بجميع العقود مع إمكانية البحث والتصفية
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `view_contracts`

### معاملات الاستعلام | Query Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| limit | number | اختياري | عدد النتائج المطلوبة (الحد الأقصى 200) |
| offset | number | اختياري | عدد النتائج المتجاوزة |
| order | string (JSON) | اختياري | ترتيب النتائج (مصفوفة JSON) |
| search | string | اختياري | البحث في رقم العقد أو اسم العميل أو البريد أو اسم المشروع |
| status | string | اختياري | تصفية حسب الحالة (`pending`, `active`, `completed`, `cancelled`) |
| user_id | string | اختياري | تصفية حسب معرف المستخدم (UUID) |
| project_id | string | اختياري | تصفية حسب معرف المشروع (UUID) |
| client_email | string | اختياري | تصفية حسب بريد العميل |

> **ملاحظة:** معاملات `search` و `status` و `user_id` و `project_id` و `client_email` حصرية - يتم استخدام واحد فقط بالأولوية: search > status > user_id > project_id > client_email

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts?limit=10&offset=0
Content-Type: application/json
```

### مثال على البحث | Search Example
```http
GET /api/v1/contracts?search=NIXT-2026&limit=20
Content-Type: application/json
```

### مثال على التصفية حسب الحالة | Filter by Status Example
```http
GET /api/v1/contracts?status=active&limit=10
Content-Type: application/json
```

### مثال على التصفية حسب بريد العميل | Filter by Client Email Example
```http
GET /api/v1/contracts?client_email=client@example.com&limit=10
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contract_number": "NIXT-2026-0223",
      "user_id": "660e8400-e29b-41d4-a716-446655440001",
      "client_name": "أحمد محمد",
      "client_email": "ahmed@example.com",
      "project_name": "موقع إلكتروني للشركة",
      "description": "تطوير موقع إلكتروني متكامل للشركة يشمل الواجهة الأمامية والخلفية",
      "clauses": [
        {
          "title": "مدة التنفيذ",
          "description": "يتم تسليم المشروع خلال 3 أشهر من تاريخ التوقيع"
        },
        {
          "title": "الدفعات",
          "description": "يتم الدفع على 3 دفعات متساوية"
        }
      ],
      "project_details": [
        {
          "title": "الواجهة الأمامية",
          "description": "تصميم وتطوير واجهة المستخدم باستخدام React"
        },
        {
          "title": "الواجهة الخلفية",
          "description": "تطوير API باستخدام Node.js و Express"
        }
      ],
      "price": 15000.00,
      "pay_number": 3,
      "project_duration": 45,
      "project_duration_unit": "يوم عمل",
      "revisions_allowed": 2,
      "warranty_period": 3,
      "auto_cancel_days": 365,
      "progress_tolerance": 10,
      "delay_compensation": 3,
      "client_fault_refund": 30,
      "progress_timeline_link": "https://example.com/timeline/project-001",
      "status": "active",
      "signed_at": "2026-03-01T10:30:00.000Z",
      "project_id": "770e8400-e29b-41d4-a716-446655440002",
      "created_at": "2026-02-19T10:30:00.000Z",
      "updated_at": "2026-03-01T10:30:00.000Z"
    }
  ],
  "count": 50,
  "nextOffset": 10,
  "left": 40
}
```

### وصف حقول الاستجابة | Response Fields Description
| الحقل | النوع | الوصف |
|-------|------|-------|
| data | array | مصفوفة العقود |
| count | number | العدد الإجمالي لجميع العقود |
| nextOffset | number | قيمة الـ offset التالية للصفحة القادمة |
| left | number | عدد العقود المتبقية بعد الـ offset الحالي |

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب العقود بنجاح
- `500 Internal Server Error` - خطأ في الخادم

---

## 2. الحصول على إحصائيات العقود | Get Contract Statistics

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts/statistics`
- **الوصف | Description:** الحصول على إحصائيات شاملة للعقود تشمل العدد الإجمالي والتوزيع حسب الحالة
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `view_contracts`

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts/statistics
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "total": 50,
    "byStatus": {
      "pending": 15,
      "active": 20,
      "completed": 10,
      "cancelled": 5
    }
  }
}
```

### وصف حقول الاستجابة | Response Fields Description
| الحقل | النوع | الوصف |
|-------|------|-------|
| total | number | العدد الإجمالي للعقود |
| byStatus | object | توزيع عدد العقود حسب كل حالة |

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب الإحصائيات بنجاح
- `500 Internal Server Error` - خطأ في الخادم

---

## 3. الحصول على عقود المستخدم الحالي | Get My Contracts

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts/my-contracts`
- **الوصف | Description:** الحصول على جميع العقود الخاصة بالمستخدم المُصادق حالياً
- **مستوى الوصول | Access Level:** Private (owner, admin, user) - أي مستخدم مُصادق

### معاملات الاستعلام | Query Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| limit | number | اختياري | عدد النتائج المطلوبة (الحد الأقصى 200) |
| offset | number | اختياري | عدد النتائج المتجاوزة |
| order | string (JSON) | اختياري | ترتيب النتائج |

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts/my-contracts?limit=10&offset=0
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contract_number": "NIXT-2026-0223",
      "user_id": "660e8400-e29b-41d4-a716-446655440001",
      "client_name": "أحمد محمد",
      "client_email": "ahmed@example.com",
      "project_name": "موقع إلكتروني للشركة",
      "description": "تطوير موقع إلكتروني متكامل",
      "clauses": [],
      "project_details": [],
      "price": 15000.00,
      "pay_number": 3,
      "project_duration": 45,
      "project_duration_unit": "يوم عمل",
      "revisions_allowed": 2,
      "warranty_period": 3,
      "auto_cancel_days": 365,
      "progress_tolerance": 10,
      "delay_compensation": 3,
      "client_fault_refund": 30,
      "progress_timeline_link": null,
      "status": "pending",
      "signed_at": null,
      "project_id": null,
      "created_at": "2026-02-19T10:30:00.000Z",
      "updated_at": "2026-02-19T10:30:00.000Z"
    }
  ],
  "count": 5,
  "nextOffset": 10,
  "left": 0
}
```

### وصف حقول الاستجابة | Response Fields Description
| الحقل | النوع | الوصف |
|-------|------|-------|
| data | array | مصفوفة عقود المستخدم الحالي |
| count | number | العدد الإجمالي لعقود المستخدم |
| nextOffset | number | قيمة الـ offset التالية للصفحة القادمة |
| left | number | عدد العقود المتبقية بعد الـ offset الحالي |

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب العقود بنجاح
- `401 Unauthorized` - المستخدم غير مُصادق
- `500 Internal Server Error` - خطأ في الخادم

---

## 4. الحصول على عقد بواسطة رقم العقد | Get Contract by Number

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts/number/:contractNumber`
- **الوصف | Description:** الحصول على عقد محدد بواسطة رقم العقد الفريد
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `view_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| contractNumber | string | نعم | رقم العقد (1-50 حرف) |

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts/number/NIXT-2026-0223
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "contract_number": "NIXT-2026-0223",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "client_name": "أحمد محمد",
    "client_email": "ahmed@example.com",
    "project_name": "موقع إلكتروني للشركة",
    "description": "تطوير موقع إلكتروني متكامل للشركة",
    "clauses": [
      {
        "title": "مدة التنفيذ",
        "description": "يتم تسليم المشروع خلال 3 أشهر"
      }
    ],
    "price": 15000.00,
    "pay_number": 3,
    "project_duration": 45,
    "project_duration_unit": "يوم عمل",
    "revisions_allowed": 2,
    "warranty_period": 3,
    "auto_cancel_days": 365,
    "progress_tolerance": 10,
    "delay_compensation": 3,
    "client_fault_refund": 30,
    "progress_timeline_link": null,
    "status": "active",
    "signed_at": "2026-03-01T10:30:00.000Z",
    "project_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-02-19T10:30:00.000Z",
    "updated_at": "2026-03-01T10:30:00.000Z"
  }
}
```

### استجابة عقد غير موجود | Contract Not Found Response
```json
{
  "success": false,
  "data": null
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب العقد بنجاح
- `400 Bad Request` - رقم العقد غير صالح (يجب أن يكون 1-50 حرف)
- `404 Not Found` - العقد غير موجود
- `500 Internal Server Error` - خطأ في الخادم

---

## 5. الحصول على عقود المستخدم | Get Contracts by User ID

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts/user/:userId`
- **الوصف | Description:** الحصول على جميع العقود الخاصة بمستخدم معين
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `view_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| userId | string (UUID) | نعم | معرف المستخدم |

### معاملات الاستعلام | Query Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| limit | number | اختياري | عدد النتائج المطلوبة (الحد الأقصى 200) |
| offset | number | اختياري | عدد النتائج المتجاوزة |
| order | string (JSON) | اختياري | ترتيب النتائج |

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts/user/660e8400-e29b-41d4-a716-446655440001?limit=10&offset=0
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contract_number": "NIXT-2026-0223",
      "user_id": "660e8400-e29b-41d4-a716-446655440001",
      "client_name": "أحمد محمد",
      "client_email": "ahmed@example.com",
      "project_name": "موقع إلكتروني للشركة",
      "description": "تطوير موقع إلكتروني متكامل",
      "clauses": [],
      "project_details": [],
      "price": 15000.00,
      "pay_number": 3,
      "project_duration": 45,
      "project_duration_unit": "يوم عمل",
      "revisions_allowed": 2,
      "warranty_period": 3,
      "auto_cancel_days": 365,
      "progress_tolerance": 10,
      "delay_compensation": 3,
      "client_fault_refund": 30,
      "progress_timeline_link": null,
      "status": "active",
      "signed_at": "2026-03-01T10:30:00.000Z",
      "project_id": null,
      "created_at": "2026-02-19T10:30:00.000Z",
      "updated_at": "2026-03-01T10:30:00.000Z"
    }
  ]
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب عقود المستخدم بنجاح
- `400 Bad Request` - معرف المستخدم غير صالح (يجب أن يكون UUID)
- `500 Internal Server Error` - خطأ في الخادم

---

## 6. الحصول على عقود المشروع | Get Contracts by Project ID

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts/project/:projectId`
- **الوصف | Description:** الحصول على جميع العقود المرتبطة بمشروع معين
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `view_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| projectId | string (UUID) | نعم | معرف المشروع |

### معاملات الاستعلام | Query Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| limit | number | اختياري | عدد النتائج المطلوبة (الحد الأقصى 200) |
| offset | number | اختياري | عدد النتائج المتجاوزة |
| order | string (JSON) | اختياري | ترتيب النتائج |

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts/project/770e8400-e29b-41d4-a716-446655440002?limit=10&offset=0
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "contract_number": "NIXT-2026-0223",
      "user_id": "660e8400-e29b-41d4-a716-446655440001",
      "client_name": "أحمد محمد",
      "client_email": "ahmed@example.com",
      "project_name": "موقع إلكتروني للشركة",
      "description": "تطوير موقع إلكتروني متكامل",
      "clauses": [],
      "project_details": [],
      "price": 15000.00,
      "pay_number": 3,
      "project_duration": 45,
      "project_duration_unit": "يوم عمل",
      "revisions_allowed": 2,
      "warranty_period": 3,
      "auto_cancel_days": 365,
      "progress_tolerance": 10,
      "delay_compensation": 3,
      "client_fault_refund": 30,
      "progress_timeline_link": "https://example.com/timeline/project-001",
      "status": "active",
      "signed_at": "2026-03-01T10:30:00.000Z",
      "project_id": "770e8400-e29b-41d4-a716-446655440002",
      "created_at": "2026-02-19T10:30:00.000Z",
      "updated_at": "2026-03-01T10:30:00.000Z"
    }
  ]
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب عقود المشروع بنجاح
- `400 Bad Request` - معرف المشروع غير صالح (يجب أن يكون UUID)
- `500 Internal Server Error` - خطأ في الخادم

---

## 7. الحصول على عقد بواسطة المعرف | Get Contract by ID

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/contracts/:id`
- **الوصف | Description:** الحصول على عقد محدد بواسطة معرفه الفريد (UUID)
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `view_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string (UUID) | نعم | معرف العقد |

### مثال على الطلب | Request Example
```http
GET /api/v1/contracts/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "contract_number": "NIXT-2026-0223",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "client_name": "أحمد محمد",
    "client_email": "ahmed@example.com",
    "project_name": "موقع إلكتروني للشركة",
    "description": "تطوير موقع إلكتروني متكامل للشركة يشمل الواجهة الأمامية والخلفية",
    "clauses": [
      {
        "title": "مدة التنفيذ",
        "description": "يتم تسليم المشروع خلال 3 أشهر من تاريخ التوقيع"
      },
      {
        "title": "الدفعات",
        "description": "يتم الدفع على 3 دفعات متساوية"
      }
    ],
    "project_details": [
      {
        "title": "الواجهة الأمامية",
        "description": "تصميم وتطوير واجهة المستخدم باستخدام React"
      },
      {
        "title": "الواجهة الخلفية",
        "description": "تطوير API باستخدام Node.js و Express"
      }
    ],
    "price": 15000.00,
    "pay_number": 3,
    "project_duration": 45,
    "project_duration_unit": "يوم عمل",
    "revisions_allowed": 2,
    "warranty_period": 3,
    "auto_cancel_days": 365,
    "progress_tolerance": 10,
    "delay_compensation": 3,
    "client_fault_refund": 30,
    "progress_timeline_link": "https://example.com/timeline/project-001",
    "status": "active",
    "signed_at": "2026-03-01T10:30:00.000Z",
    "project_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-02-19T10:30:00.000Z",
    "updated_at": "2026-03-01T10:30:00.000Z"
  }
}
```

### استجابة عقد غير موجود | Contract Not Found Response
```json
{
  "success": false,
  "data": null
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب العقد بنجاح
- `400 Bad Request` - معرف العقد غير صالح (يجب أن يكون UUID)
- `404 Not Found` - العقد غير موجود
- `500 Internal Server Error` - خطأ في الخادم

---

## 8. إنشاء عقد جديد | Create New Contract

### معلومات الطلب | Request Information
- **المسار | Route:** `POST /api/v1/contracts`
- **الوصف | Description:** إنشاء عقد جديد بين الشركة والعميل
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `create_contracts`

### جسم الطلب | Request Body
| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| contract_number | string | نعم | رقم العقد الفريد (1-50 حرف) مثل `NIXT-2026-0223` |
| user_id | string (UUID) \| null | لا | معرف المستخدم (صاحب المشروع) |
| client_name | string | نعم | اسم العميل (الطرف الثاني) (1-255 حرف) |
| client_email | string | نعم | بريد العميل (يجب أن يكون بريد إلكتروني صالح) |
| project_name | string | نعم | اسم المشروع (1-255 حرف) |
| description | string | نعم | وصف المشروع بشكل كامل |
| clauses | array | لا | بنود العقد (القيمة الافتراضية: مصفوفة فارغة `[]`) |
| clauses[].title | string | نعم* | عنوان البند (1-255 حرف) - مطلوب إذا تم تمرير بنود |
| clauses[].description | string | نعم* | وصف البند - مطلوب إذا تم تمرير بنود |
| project_details | array | لا | تفاصيل المشروع (القيمة الافتراضية: مصفوفة فارغة `[]`) |
| project_details[].title | string | نعم* | عنوان التفصيل (1-255 حرف) - مطلوب إذا تم تمرير تفاصيل |
| project_details[].description | string | نعم* | وصف التفصيل - مطلوب إذا تم تمرير تفاصيل |
| price | number | نعم | السعر الإجمالي (يجب أن يكون 0 على الأقل) |
| pay_number | number | نعم | عدد الدفعات المطلوبة (عدد صحيح، 1 على الأقل) |
| project_duration | number | لا | مدة المشروع (القيمة الافتراضية: `45`) |
| project_duration_unit | string | لا | وحدة مدة المشروع (القيمة الافتراضية: `يوم عمل`) - أمثلة: يوم عمل، أسبوع، شهر |
| revisions_allowed | number | لا | عدد التعديلات المسموح بها (القيمة الافتراضية: `2`) |
| warranty_period | number | لا | فترة الضمان بالأشهر (القيمة الافتراضية: `3`) |
| auto_cancel_days | number | لا | عدد أيام الإلغاء التلقائي (القيمة الافتراضية: `365`) |
| progress_tolerance | number | لا | نسبة التسامح في التقدم % (القيمة الافتراضية: `10`، 0-100) |
| delay_compensation | number | لا | نسبة التعويض عن التأخير % (القيمة الافتراضية: `3`، 0-100) |
| client_fault_refund | number | لا | نسبة الاسترداد بسبب خطأ العميل % (القيمة الافتراضية: `30`، 0-100) |
| progress_timeline_link | string (URL) | لا | رابط الجدول الزمني للتقدم (القيمة الافتراضية: `null`) |
| status | string | لا | حالة العقد (القيمة الافتراضية: `pending`) - القيم المسموح بها: `pending`, `active`, `completed`, `cancelled` |
| project_id | string (UUID) \| null | لا | ربط اختياري بمشروع موجود |

### مثال على الطلب | Request Example
```http
POST /api/v1/contracts
Content-Type: application/json

{
  "contract_number": "NIXT-2026-0311",
  "user_id": "660e8400-e29b-41d4-a716-446655440001",
  "client_name": "أحمد محمد",
  "client_email": "ahmed@example.com",
  "project_name": "تطبيق موبايل للتجارة الإلكترونية",
  "description": "تطوير تطبيق موبايل متكامل للتجارة الإلكترونية يعمل على iOS و Android",
  "clauses": [
    {
      "title": "مدة التنفيذ",
      "description": "يتم تسليم المشروع خلال 4 أشهر من تاريخ التوقيع"
    },
    {
      "title": "الدفعات",
      "description": "يتم الدفع على 4 دفعات متساوية عند اكتمال كل مرحلة"
    },
    {
      "title": "الضمان",
      "description": "ضمان سنة كاملة بعد التسليم يشمل إصلاح الأخطاء"
    }
  ],
  "project_details": [
    {
      "title": "تصميم الواجهة",
      "description": "تصميم واجهة المستخدم لتطبيق الموبايل"
    },
    {
      "title": "الباكند",
      "description": "تطوير الواجهة الخلفية وقاعدة البيانات"
    }
  ],
  "price": 25000.00,
  "pay_number": 4,
  "project_duration": 60,
  "project_duration_unit": "يوم عمل",
  "revisions_allowed": 3,
  "warranty_period": 6,
  "auto_cancel_days": 180,
  "progress_tolerance": 15,
  "delay_compensation": 5,
  "client_fault_refund": 25,
  "progress_timeline_link": "https://example.com/timeline/project-123",
  "project_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "contract_number": "NIXT-2026-0311",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "client_name": "أحمد محمد",
    "client_email": "ahmed@example.com",
    "project_name": "تطبيق موبايل للتجارة الإلكترونية",
    "description": "تطوير تطبيق موبايل متكامل للتجارة الإلكترونية يعمل على iOS و Android",
    "clauses": [
      {
        "title": "مدة التنفيذ",
        "description": "يتم تسليم المشروع خلال 4 أشهر من تاريخ التوقيع"
      },
      {
        "title": "الدفعات",
        "description": "يتم الدفع على 4 دفعات متساوية عند اكتمال كل مرحلة"
      },
      {
        "title": "الضمان",
        "description": "ضمان سنة كاملة بعد التسليم يشمل إصلاح الأخطاء"
      }
    ],
    "project_details": [
      {
        "title": "تصميم الواجهة",
        "description": "تصميم واجهة المستخدم لتطبيق الموبايل"
      },
      {
        "title": "الباكند",
        "description": "تطوير الواجهة الخلفية وقاعدة البيانات"
      }
    ],
    "price": 25000.00,
    "pay_number": 4,
    "project_duration": 60,
    "project_duration_unit": "يوم عمل",
    "revisions_allowed": 3,
    "warranty_period": 6,
    "auto_cancel_days": 180,
    "progress_tolerance": 15,
    "delay_compensation": 5,
    "client_fault_refund": 25,
    "progress_timeline_link": "https://example.com/timeline/project-123",
    "status": "pending",
    "signed_at": null,
    "project_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-03-11T10:30:00.000Z",
    "updated_at": "2026-03-11T10:30:00.000Z"
  }
}
```

### رموز الاستجابة | Response Codes
- `201 Created` - تم إنشاء العقد بنجاح
- `400 Bad Request` - بيانات غير صالحة أو رقم العقد مستخدم بالفعل
- `500 Internal Server Error` - خطأ في الخادم

---

## 9. تحديث عقد | Update Contract

### معلومات الطلب | Request Information
- **المسار | Route:** `PUT /api/v1/contracts/:id`
- **الوصف | Description:** تحديث بيانات عقد موجود (يجب توفير حقل واحد على الأقل)
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `update_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string (UUID) | نعم | معرف العقد |

### جسم الطلب | Request Body
| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| contract_number | string | لا | رقم العقد الجديد (1-50 حرف) |
| user_id | string (UUID) \| null | لا | معرف المستخدم |
| client_name | string | لا | اسم العميل (1-255 حرف) |
| client_email | string | لا | بريد العميل (بريد إلكتروني صالح) |
| project_name | string | لا | اسم المشروع (1-255 حرف) |
| description | string | لا | وصف المشروع |
| clauses | array | لا | بنود العقد |
| clauses[].title | string | نعم* | عنوان البند (1-255 حرف) - مطلوب إذا تم تمرير بنود |
| clauses[].description | string | نعم* | وصف البند - مطلوب إذا تم تمرير بنود |
| project_details | array | لا | تفاصيل المشروع |
| project_details[].title | string | نعم* | عنوان التفصيل (1-255 حرف) - مطلوب إذا تم تمرير تفاصيل |
| project_details[].description | string | نعم* | وصف التفصيل - مطلوب إذا تم تمرير تفاصيل |
| price | number | لا | السعر الإجمالي (0 على الأقل) |
| pay_number | number | لا | عدد الدفعات (1 على الأقل) |
| project_duration | number | لا | مدة المشروع (1 على الأقل) |
| project_duration_unit | string | لا | وحدة مدة المشروع (1-50 حرف) |
| revisions_allowed | number | لا | عدد التعديلات المسموحة (0 على الأقل) |
| warranty_period | number | لا | فترة الضمان بالأشهر (0 على الأقل) |
| auto_cancel_days | number | لا | أيام الإلغاء التلقائي (1 على الأقل) |
| progress_tolerance | number | لا | نسبة التسامح في التقدم % (0-100) |
| delay_compensation | number | لا | نسبة التعويض عن التأخير % (0-100) |
| client_fault_refund | number | لا | نسبة الاسترداد بسبب خطأ العميل % (0-100) |
| progress_timeline_link | string (URL) | لا | رابط الجدول الزمني |
| status | string | لا | حالة العقد: `pending`, `active`, `completed`, `cancelled` |
| project_id | string (UUID) \| null | لا | ربط بمشروع |

> **ملاحظة:** يجب توفير حقل واحد على الأقل للتحديث. لا يمكن تحديث الـ `id`. إذا تم تغيير `contract_number`، يتم التحقق من عدم استخدامه بالفعل.

### مثال على الطلب | Request Example
```http
PUT /api/v1/contracts/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "client_name": "أحمد محمد العلي",
  "price": 18000.00,
  "pay_number": 4,
  "clauses": [
    {
      "title": "مدة التنفيذ",
      "description": "يتم تسليم المشروع خلال 4 أشهر من تاريخ التوقيع"
    }
  ]
}
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "changedRows": 1
  }
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم تحديث العقد بنجاح
- `400 Bad Request` - بيانات غير صالحة أو لا يوجد بيانات للتحديث أو رقم العقد مستخدم بالفعل
- `500 Internal Server Error` - خطأ في الخادم

---

## 10. توقيع العقد | Sign Contract

### معلومات الطلب | Request Information
- **المسار | Route:** `PATCH /api/v1/contracts/:id/sign`
- **الوصف | Description:** توقيع العقد - يتم تسجيل وقت التوقيع وتغيير الحالة تلقائياً إلى `active`
- **مستوى الوصول | Access Level:** Private (owner, admin, user) - أي مستخدم مُصادق

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string (UUID) | نعم | معرف العقد |

### مثال على الطلب | Request Example
```http
PATCH /api/v1/contracts/550e8400-e29b-41d4-a716-446655440000/sign
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "changedRows": 1
  }
}
```

### ملاحظات | Notes
- عند التوقيع، يتم تعيين `signed_at` إلى التاريخ/الوقت الحالي
- يتم تغيير `status` تلقائياً إلى `active`
- لا يمكن توقيع عقد تم توقيعه بالفعل (سيُرجع خطأ)
- لا يمكن توقيع عقد غير موجود (سيُرجع خطأ)

### رموز الاستجابة | Response Codes
- `200 OK` - تم توقيع العقد بنجاح
- `400 Bad Request` - العقد غير موجود أو موقع بالفعل
- `500 Internal Server Error` - خطأ في الخادم

---

## 11. تغيير حالة العقد | Change Contract Status

### معلومات الطلب | Request Information
- **المسار | Route:** `PATCH /api/v1/contracts/:id/status`
- **الوصف | Description:** تغيير حالة العقد يدوياً
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `update_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string (UUID) | نعم | معرف العقد |

### جسم الطلب | Request Body
| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| status | string | نعم | الحالة الجديدة: `pending`, `active`, `completed`, `cancelled` |

### مثال على الطلب | Request Example
```http
PATCH /api/v1/contracts/550e8400-e29b-41d4-a716-446655440000/status
Content-Type: application/json

{
  "status": "completed"
}
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": {
    "changedRows": 1
  }
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم تغيير الحالة بنجاح
- `400 Bad Request` - الحالة غير صالحة أو العقد غير موجود
- `500 Internal Server Error` - خطأ في الخادم

---

## 12. حذف عقد | Delete Contract

### معلومات الطلب | Request Information
- **المسار | Route:** `DELETE /api/v1/contracts/:id`
- **الوصف | Description:** حذف عقد نهائياً من النظام
- **مستوى الوصول | Access Level:** Private (owner, admin) - يتطلب صلاحية `delete_contracts`

### معاملات المسار | Path Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| id | string (UUID) | نعم | معرف العقد |

### مثال على الطلب | Request Example
```http
DELETE /api/v1/contracts/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": null
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم حذف العقد بنجاح
- `400 Bad Request` - معرف العقد غير صالح
- `500 Internal Server Error` - خطأ في الخادم

---

## 13. هيكل نموذج العقود | Contract Model Structure

### الحقول | Fields

| الحقل | النوع | مطلوب | القيمة الافتراضية | الوصف |
|-------|------|-------|-------------------|-------|
| id | UUID | تلقائي | UUIDv4 | معرف العقد الفريد |
| contract_number | STRING(50) | نعم | - | رقم العقد الفريد مثل `NIXT-2026-0223` |
| user_id | UUID | لا | null | معرف المستخدم (صاحب المشروع) |
| client_name | STRING(255) | نعم | - | اسم العميل (الطرف الثاني) |
| client_email | STRING(255) | نعم | - | بريد العميل (يتم التحقق من صحته) |
| project_name | STRING(255) | نعم | - | اسم المشروع |
| description | TEXT | نعم | - | وصف المشروع بشكل كامل |
| clauses | JSONB | نعم | `[]` | بنود العقد `[{title, description}]` |
| project_details | JSONB | نعم | `[]` | تفاصيل المشروع `[{title, description}]` |
| price | DECIMAL(10,2) | نعم | - | السعر الإجمالي |
| pay_number | INTEGER | نعم | - | عدد الدفعات المطلوبة |
| project_duration | INTEGER | نعم | `45` | مدة المشروع (رقم) |
| project_duration_unit | STRING(50) | نعم | `يوم عمل` | وحدة مدة المشروع (يوم عمل، أسبوع، شهر) |
| revisions_allowed | INTEGER | نعم | `2` | عدد التعديلات المسموح بها |
| warranty_period | INTEGER | نعم | `3` | فترة الضمان بالأشهر |
| auto_cancel_days | INTEGER | نعم | `365` | عدد أيام الإلغاء التلقائي |
| progress_tolerance | DECIMAL(5,2) | نعم | `10` | نسبة التسامح في التقدم % |
| delay_compensation | DECIMAL(5,2) | نعم | `3` | نسبة التعويض عن التأخير % |
| client_fault_refund | DECIMAL(5,2) | نعم | `30` | نسبة الاسترداد بسبب خطأ العميل % |
| progress_timeline_link | TEXT | لا | null | رابط الجدول الزمني للتقدم |
| status | ENUM | نعم | `pending` | حالة العقد |
| signed_at | DATE | لا | null | وقت التوقيع |
| project_id | UUID | لا | null | ربط اختياري بمشروع |
| created_at | DATE | تلقائي | NOW | تاريخ الإنشاء |
| updated_at | DATE | تلقائي | NOW | تاريخ آخر تحديث |

### حالات العقد | Contract Statuses

| الحالة | الوصف |
|--------|-------|
| `pending` | قيد الانتظار - العقد تم إنشاؤه ولم يتم التوقيع عليه بعد |
| `active` | نشط - تم التوقيع على العقد والعمل جارٍ |
| `completed` | مكتمل - تم إنجاز جميع بنود العقد |
| `cancelled` | ملغي - تم إلغاء العقد |

### هيكل بند العقد | Contract Clause Structure

```json
{
  "title": "عنوان البند (string, 1-255 حرف)",
  "description": "وصف البند (string, حرف واحد على الأقل)"
}
```

### هيكل تفاصيل المشروع | Project Detail Structure

```json
{
  "title": "عنوان التفصيل (string, 1-255 حرف)",
  "description": "وصف التفصيل (string, حرف واحد على الأقل)"
}
```

### العلاقات | Relationships

| العلاقة | النوع | النموذج المرتبط | المفتاح الأجنبي | عند الحذف |
|---------|------|----------------|----------------|-----------|
| user | belongsTo | User | user_id | SET NULL |
| project | belongsTo | Project | project_id | SET NULL |

### الفهارس | Indexes

| الاسم | الحقول | فريد |
|-------|--------|------|
| idx_contract_number | contract_number | نعم |
| idx_contract_user_id | user_id | لا |
| idx_contract_project_id | project_id | لا |
| idx_contract_status | status | لا |
| idx_contract_signed_at | signed_at | لا |

### الدوال المساعدة | Helper Methods

| الدالة | الوصف | القيمة المُرجعة |
|--------|-------|----------------|
| `isSigned()` | التحقق مما إذا كان العقد موقعاً | `boolean` |
| `getPaymentAmount()` | حساب قيمة الدفعة الواحدة (`price / pay_number`) | `number` |

---

## 14. ملاحظات مهمة | Important Notes

### المصادقة والصلاحيات | Authentication & Permissions
- جميع المسارات تتطلب مصادقة (Authentication)
- صلاحيات القراءة (`view_contracts`): مطلوبة لجلب العقود والإحصائيات
- صلاحيات الإنشاء (`create_contracts`): مطلوبة لإنشاء عقود جديدة
- صلاحيات التحديث (`update_contracts`): مطلوبة لتحديث العقود وتغيير حالتها
- صلاحيات الحذف (`delete_contracts`): مطلوبة لحذف العقود
- توقيع العقد (`sign`): متاح لأي مستخدم مُصادق (owner, admin, user)
- عقود المستخدم الحالي (`my-contracts`): متاح لأي مستخدم مُصادق (owner, admin, user)

### الصفحات | Pagination
- الحد الأقصى لعدد النتائج في الطلب الواحد هو **200**
- الترتيب الافتراضي: `created_at DESC, id ASC` (الأحدث أولاً)
- يمكن تخصيص الترتيب عبر معامل `order` كمصفوفة JSON:
  ```
  ?order=[["price","DESC"],["created_at","ASC"]]
  ```

### البحث | Search
- البحث يعمل بشكل `case-insensitive` (لا يفرق بين الأحرف الكبيرة والصغيرة)
- يتم البحث في: `contract_number`, `client_name`, `client_email`, `project_name`
- البحث يستخدم `ILIKE` مع `%query%` (بحث جزئي)

### رقم العقد | Contract Number
- يجب أن يكون فريداً في النظام بالكامل
- يتم التحقق من عدم تكرار الرقم عند الإنشاء والتحديث
- الحد الأقصى للطول: 50 حرف

### التوقيع | Signing
- عند توقيع العقد، يتم تعيين `signed_at` تلقائياً إلى الوقت الحالي
- يتم تغيير `status` تلقائياً إلى `active`
- العقد لا يمكن توقيعه مرتين (يُرجع خطأ إذا كان موقعاً بالفعل)

### حساب الدفعات | Payment Calculation
- قيمة الدفعة الواحدة = `price / pay_number`
- يتم تقريب النتيجة إلى منزلتين عشريتين

### العلاقات | Relationships
- العقد مرتبط بـ `User` عبر `user_id` (اختياري) - عند حذف المستخدم يتم تعيين `user_id` إلى `NULL`
- العقد مرتبط بـ `Project` عبر `project_id` (اختياري) - عند حذف المشروع يتم تعيين `project_id` إلى `NULL`

### أكواد HTTP الشائعة | Common HTTP Status Codes

| الكود | الوصف |
|-------|-------|
| `200 OK` | العملية تمت بنجاح |
| `201 Created` | تم إنشاء المورد بنجاح |
| `400 Bad Request` | بيانات الطلب غير صالحة |
| `401 Unauthorized` | المستخدم غير مُصادق |
| `404 Not Found` | المورد المطلوب غير موجود |
| `500 Internal Server Error` | خطأ داخلي في الخادم |
