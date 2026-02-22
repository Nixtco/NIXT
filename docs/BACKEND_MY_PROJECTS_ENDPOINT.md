# 🔧 Backend: إضافة endpoint للمشاريع الخاصة بالمستخدم
# Backend: Add My Projects Endpoint

## المشكلة | Problem

endpoint `/api/v1/projects/user/:userId` يتطلب صلاحيات `owner` أو `admin`، مما يمنع المستخدمين العاديين من رؤية مشاريعهم الخاصة في Dashboard.

The endpoint `/api/v1/projects/user/:userId` requires `owner` or `admin` permissions, which prevents regular users from viewing their own projects in the Dashboard.

---

## الحل | Solution

إنشاء endpoint جديد `/api/v1/projects/my-projects` يسمح لأي مستخدم مُصادق برؤية مشاريعه الخاصة فقط.

Create a new endpoint `/api/v1/projects/my-projects` that allows any authenticated user to view their own projects only.

---

## 📋 المواصفات | Specifications

### معلومات الطلب | Request Information
- **المسار | Route:** `GET /api/v1/projects/my-projects`
- **الوصف | Description:** الحصول على جميع المشاريع الخاصة بالمستخدم الحالي (المُصادق)
- **مستوى الوصول | Access Level:** Private (authenticated users only)
- **الصلاحيات المطلوبة | Required Permissions:** لا يوجد (فقط تسجيل الدخول)

### معاملات الاستعلام | Query Parameters
| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| limit | number | اختياري | عدد النتائج المطلوبة (الحد الأقصى 200) |
| offset | number | اختياري | عدد النتائج المتجاوزة |
| order | string (JSON) | اختياري | ترتيب النتائج |

### مثال على الطلب | Request Example
```http
GET /api/v1/projects/my-projects?limit=10&offset=0
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### الاستجابة المتوقعة | Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "موقع تجارة إلكترونية",
      "user_id": "e98de2b8-fec1-46cf-9805-27a871f11d50",
      "progress": [
        {
          "id": "design",
          "title": "تصميم الواجهة",
          "percent": 100
        }
      ],
      "progress_completed": ["design"],
      "price": 50000,
      "spent": 25000,
      "priority": "high",
      "status": "active",
      "deadline": "2026-06-30T00:00:00.000Z",
      "team": [],
      "created_at": "2026-02-01T10:00:00.000Z",
      "updated_at": "2026-02-20T14:30:00.000Z"
    }
  ],
  "count": 1,
  "nextOffset": 10,
  "left": 0
}
```

### رموز الاستجابة | Response Codes
- `200 OK` - تم جلب المشاريع بنجاح
- `401 Unauthorized` - المستخدم غير مُصادق
- `500 Internal Server Error` - خطأ في الخادم

---

## 💻 Implementation في Backend

### 1. إضافة Route في `src/routes/projects.ts`

```typescript
import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as projectController from '../controllers/projectController'

const router = Router()

// Existing routes...

/**
 * @route   GET /api/v1/projects/my-projects
 * @desc    Get current user's projects
 * @access  Private (any authenticated user)
 */
router.get('/my-projects', auth, projectController.getMyProjects)

// Other routes...

export default router
```

### 2. إضافة Controller في `src/controllers/projectController.ts`

```typescript
import { Request, Response } from 'express'
import Project from '../models/Project'
import { AuthRequest } from '../middleware/auth'

/**
 * Get current user's projects
 * @route GET /api/v1/projects/my-projects
 * @access Private (authenticated users)
 */
export const getMyProjects = async (req: AuthRequest, res: Response) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user?.id || req.user?.userID

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    // Parse query parameters
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200)
    const offset = parseInt(req.query.offset as string) || 0
    const order = req.query.order 
      ? JSON.parse(req.query.order as string) 
      : [['created_at', 'DESC'], ['id', 'ASC']]

    // Fetch projects for this user
    const { rows: projects, count } = await Project.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order
    })

    // Calculate next offset and remaining count
    const nextOffset = offset + limit
    const left = Math.max(0, count - nextOffset)

    return res.status(200).json({
      success: true,
      data: projects,
      count,
      nextOffset,
      left
    })
  } catch (error) {
    console.error('Error fetching user projects:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}
```

### 3. تأكد من auth middleware يضيف user info

في `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    userID?: string // بعض الأنظمة تستخدم userID
    email?: string
    role?: string
  }
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any

    // Add user info to request
    req.user = {
      id: decoded.id || decoded.userID,
      userID: decoded.userID,
      email: decoded.email,
      role: decoded.role
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}
```

---

## 🧪 Testing

### Test 1: بدون Token
```bash
curl -X GET http://localhost:3003/api/v1/projects/my-projects
```

**Expected:**
```json
{
  "success": false,
  "message": "No authentication token provided"
}
```

### Test 2: مع Token صحيح
```bash
curl -X GET http://localhost:3003/api/v1/projects/my-projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
```json
{
  "success": true,
  "data": [...],
  "count": 2
}
```

### Test 3: مع Pagination
```bash
curl -X GET "http://localhost:3003/api/v1/projects/my-projects?limit=5&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 الأمان | Security

### ✅ الممارسات الجيدة | Best Practices

1. **Authentication Required**
   - يتطلب JWT token صالح
   - لا يمكن الوصول بدون تسجيل دخول

2. **User Isolation**
   - كل مستخدم يرى مشاريعه فقط
   - يتم جلب `user_id` من الـ token (وليس من الـ request)
   - لا يمكن للمستخدم رؤية مشاريع مستخدمين آخرين

3. **Validation**
   - التحقق من صحة JWT token
   - التحقق من وجود user_id
   - Sanitize query parameters

4. **Error Handling**
   - عدم كشف معلومات حساسة في الأخطاء
   - Log errors for debugging
   - Return user-friendly messages

---

## 📊 الفرق بين الـ Endpoints | Difference Between Endpoints

| Feature | `/projects/user/:userId` | `/projects/my-projects` |
|---------|-------------------------|------------------------|
| **الصلاحيات** | owner, admin | أي مستخدم مُصادق |
| **User ID** | من الـ URL parameter | من الـ JWT token |
| **Use Case** | Admin panel | User dashboard |
| **Security** | يمكن رؤية مشاريع أي مستخدم | فقط المشاريع الخاصة |

---

## 🔄 Migration Path

إذا كنت تريد تحديث الـ endpoint القديم:

### Option 1: Keep Both (Recommended)
```typescript
// Admin endpoint - requires permissions
router.get('/user/:userId', requireRoles(['owner', 'admin']), 
  projectController.getProjectsByUserId)

// User endpoint - requires only authentication
router.get('/my-projects', auth, 
  projectController.getMyProjects)
```

### Option 2: Modify Existing
```typescript
router.get('/user/:userId', auth, (req, res, next) => {
  const requestedUserId = req.params.userId
  const currentUserId = req.user?.id

  // Allow user to access their own projects
  if (requestedUserId === currentUserId) {
    return next()
  }

  // Require admin role for other users
  return requireRoles(['owner', 'admin'])(req, res, next)
}, projectController.getProjectsByUserId)
```

---

## ✅ Checklist

قبل Deploy:

```
[ ] إضافة route في projects router
[ ] إضافة controller function
[ ] التأكد من auth middleware يعمل
[ ] اختبار الـ endpoint مع Postman/curl
[ ] التأكد من user isolation (كل مستخدم يرى مشاريعه فقط)
[ ] إضافة error handling
[ ] إضافة logging
[ ] تحديث API documentation
[ ] اختبار مع Frontend
```

---

## 📝 API Documentation Update

أضف هذا في ملف التوثيق:

```markdown
## Get My Projects

**Endpoint:** `GET /api/v1/projects/my-projects`

**Description:** Get all projects for the currently authenticated user

**Authentication:** Required (JWT)

**Permissions:** None (any authenticated user)

**Query Parameters:**
- `limit` (optional): Number of results (max 200)
- `offset` (optional): Pagination offset
- `order` (optional): Sort order

**Response:**
- `200 OK`: Projects retrieved successfully
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error
```

---

## 🚀 بعد التطبيق | After Implementation

1. **أعد تشغيل Backend**
   ```bash
   npm start
   ```

2. **اختبر الـ endpoint**
   ```bash
   # في Postman أو curl
   GET http://localhost:3003/api/v1/projects/my-projects
   ```

3. **اختبر من Frontend**
   ```
   - سجل دخول كعميل
   - افتح Dashboard
   - يجب أن تظهر المشاريع بدون أخطاء!
   ```

---

**تم إنشاء هذا التوثيق في: 21 فبراير 2026**

**Documentation created on: February 21, 2026**
