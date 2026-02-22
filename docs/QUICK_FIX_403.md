# 🚀 دليل سريع: إصلاح مشكلة 403 في المشاريع
# Quick Guide: Fix 403 Error in Projects

## ✅ تم إصلاح Frontend

**الملفات المُحدثة:**
1. ✅ `app/Projects/apiFunctions.ts` - أضيفت دالة `getMyProjects()`
2. ✅ `components/Dashboard/ProjectOverview.tsx` - يستخدم الـ endpoint الجديد

---

## ⚠️ المطلوب منك: تحديث Backend

### الخطوة 1: افتح مجلد Backend

```bash
cd c:\Users\Dieln\Desktop\global-hound-backend-main
```

### الخطوة 2: أضف Route جديد

افتح الملف: `src/routes/projects.ts` (أو ما يشابهه)

أضف هذا السطر:

```typescript
/**
 * @route   GET /api/v1/projects/my-projects
 * @desc    Get current user's projects
 * @access  Private (any authenticated user)
 */
router.get('/my-projects', auth, projectController.getMyProjects)
```

### الخطوة 3: أضف Controller Function

افتح الملف: `src/controllers/projectController.ts` (أو ما يشابهه)

أضف هذه الدالة:

```typescript
/**
 * Get current user's projects
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

    // Calculate pagination
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
      message: 'Internal server error'
    })
  }
}
```

### الخطوة 4: أعد تشغيل Backend

```bash
# اضغط Ctrl+C لإيقاف Backend
# ثم:
npm start
```

---

## 🧪 اختبر التحديث

### Test 1: اختبر الـ endpoint مباشرة

في Postman أو curl:

```bash
curl -X GET "http://localhost:3003/api/v1/projects/my-projects" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 2: اختبر من Frontend

1. افتح Frontend: `http://localhost:3000`
2. سجل دخول كعميل
3. اذهب إلى Dashboard
4. يجب أن تظهر المشاريع بدون أخطاء! ✅

---

## 📊 ما الذي تغير؟

### قبل (Old):
```
Frontend → GET /projects/user/USER_ID
Backend  → ❌ يتطلب صلاحيات admin
Result   → ❌ 403 Forbidden
```

### بعد (New):
```
Frontend → GET /projects/my-projects
Backend  → ✅ يتعرف على المستخدم من Token
Result   → ✅ 200 OK + المشاريع
```

---

## ❓ إذا لم يعمل؟

### تحقق من:

1. **هل أضفت الـ route؟**
   ```typescript
   router.get('/my-projects', auth, projectController.getMyProjects)
   ```

2. **هل أضفت الـ controller function؟**
   ```typescript
   export const getMyProjects = async (req, res) => { ... }
   ```

3. **هل أعدت تشغيل Backend؟**
   ```bash
   npm start
   ```

4. **هل الـ auth middleware يعمل؟**
   - يجب أن يضيف `req.user` مع `id` أو `userID`

---

## 📚 للمزيد من التفاصيل

راجع الملف الكامل:
[docs/BACKEND_MY_PROJECTS_ENDPOINT.md](./BACKEND_MY_PROJECTS_ENDPOINT.md)

---

## ✅ Checklist

```
[ ] فتحت مجلد Backend
[ ] أضفت Route في projects.ts
[ ] أضفت Controller function
[ ] أعدت تشغيل Backend
[ ] اختبرت الـ endpoint مع Postman/curl
[ ] سجلت دخول في Frontend
[ ] فتحت Dashboard
[ ] المشاريع تظهر بنجاح! 🎉
```

---

**ملاحظة:** Frontend جاهز ومحدث! فقط Backend يحتاج التحديث.

**Note:** Frontend is ready and updated! Only Backend needs updating.
