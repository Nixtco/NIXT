# استكشاف الأخطاء وإصلاحها
# Troubleshooting Guide

## المشكلة: "An error occurred while loading projects"

### الأسباب المحتملة والحلول | Possible Causes & Solutions

---

## 1️⃣ Backend غير مشغل | Backend Not Running

### الأعراض | Symptoms
```
❌ HTTP error! status: 500
❌ Failed to fetch
❌ Network request failed
```

### الحل | Solution
تأكد من تشغيل Backend server:

```bash
# في terminal منفصل
cd c:\Users\Dieln\Desktop\global-hound-backend-main
npm start
```

يجب أن ترى:
```
✅ Server running on port 3003
✅ Database connected
```

---

## 2️⃣ مشكلة في المصادقة | Authentication Issue

### الأعراض | Symptoms
```
❌ Token: MISSING
❌ HTTP error! status: 401 Unauthorized
❌ User ID: NOT FOUND
```

### الحل | Solution

#### أ. تسجيل الدخول مرة أخرى

```
1. اضغط Logout
2. سجل دخول مرة أخرى
3. تأكد من ظهور رسالة "Login successful"
```

#### ب. التحقق من Token

افتح Developer Tools (F12) → Console:

```javascript
// تحقق من وجود token
console.log('Token:', localStorage.getItem('token'))

// يجب أن يظهر:
// Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// إذا كان null:
// Token: null  ❌
```

#### ج. مسح Cache والـ localStorage

```javascript
// في Console
localStorage.clear()
location.reload()
```

ثم سجل دخول مرة أخرى.

---

## 3️⃣ User ID غير موجود | User ID Not Found

### الأعراض | Symptoms
```
⚠️ No user ID found, skipping project fetch
User ID: undefined
```

### الحل | Solution

#### أ. التحقق من بيانات المستخدم

افتح Console (F12):

```javascript
// يجب أن ترى:
👤 User: {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  ...
}
```

#### ب. إذا كان User: null

```
1. سجل خروج
2. امسح localStorage
3. سجل دخول مرة أخرى
4. تحقق من استجابة /api/v1/auth/me
```

---

## 4️⃣ API URL غير صحيح | Wrong API URL

### الأعراض | Symptoms
```
API URL: NOT SET
API URL: https://api.example.com
```

### الحل | Solution

#### أ. تحقق من ملف .env.local

```bash
# في مجلد NIXT
cat .env.local
```

يجب أن يحتوي على:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
```

#### ب. إذا لم يكن موجوداً، أنشئه:

```bash
# في c:\Users\Dieln\Desktop\NIXT
echo NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1 > .env.local
```

#### ج. أعد تشغيل Frontend

```bash
# اضغط Ctrl+C في terminal
# ثم:
npm run dev
```

---

## 5️⃣ لا توجد مشاريع في قاعدة البيانات | No Projects in Database

### الأعراض | Symptoms
```
✅ Successfully loaded 0 projects
📦 API Response: { success: true, data: [], count: 0 }
```

### الحل | Solution

#### أ. تأكد من وجود مشاريع للمستخدم

```sql
-- في قاعدة البيانات
SELECT * FROM projects WHERE user_id = 'USER_ID_HERE';
```

#### ب. أضف مشروع من Controllers

```
1. سجل دخول كـ Admin/Owner
2. افتح /controllers
3. اذهب لتبويب Projects
4. اضغط "إضافة مشروع"
5. املأ البيانات واختر العميل
6. احفظ
```

#### ج. تأكد من user_id صحيح

```
في Controllers → Projects:
- افتح المشروع
- تحقق من أن "العميل" مطابق للمستخدم المسجل
```

---

## 6️⃣ مشكلة CORS | CORS Issue

### الأعراض | Symptoms
```
❌ Access to fetch has been blocked by CORS policy
❌ No 'Access-Control-Allow-Origin' header
```

### الحل | Solution

#### أ. تحقق من Backend CORS settings

في Backend:
```javascript
// src/app.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}))
```

#### ب. أعد تشغيل Backend

```bash
cd c:\Users\Dieln\Desktop\global-hound-backend-main
npm start
```

---

## 7️⃣ خطأ في الصلاحيات | Permission Error

### الأعراض | Symptoms
```
❌ HTTP error! status: 403 Forbidden
❌ You don't have permission
```

### الحل | Solution

#### أ. تحقق من صلاحيات المستخدم

في Backend → project-admins table:

```sql
SELECT * FROM project_admins WHERE user_id = 'USER_ID';
```

#### ب. إضافة صلاحية view_projects

```sql
UPDATE project_admins 
SET permissions = JSON_ARRAY('view_projects')
WHERE user_id = 'USER_ID';
```

---

## 8️⃣ Database غير متصل | Database Not Connected

### الأعراض | Symptoms
```
❌ SequelizeConnectionError
❌ connect ECONNREFUSED
```

### الحل | Solution

#### أ. تحقق من MySQL

```bash
# في terminal
mysql -u root -p
# أدخل كلمة المرور
```

#### ب. تحقق من .env في Backend

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

#### ج. إنشاء قاعدة البيانات

```sql
CREATE DATABASE IF NOT EXISTS your_database_name;
```

---

## 🔍 Console Logs للفحص | Debug Console Logs

عند فتح Dashboard، يجب أن ترى في Console:

### ✅ Successful Load
```
🔍 ProjectOverview - Attempting to fetch projects...
👤 User: {id: "550e8400", email: "user@example.com", ...}
🆔 User ID: 550e8400-e29b-41d4-a716-446655440000
🔑 Token in localStorage: EXISTS
📡 Fetching projects for user: 550e8400-e29b-41d4-a716-446655440000
🌐 API Call: {endpoint: "/projects/user/550e8400...", ...}
📡 API Response: {status: 200, ok: true}
✅ API Success Data: {success: true, data: [...], count: 2}
✅ Successfully loaded 2 projects
```

### ❌ Failed Load
```
🔍 ProjectOverview - Attempting to fetch projects...
👤 User: {id: "550e8400", ...}
🆔 User ID: 550e8400-e29b-41d4-a716-446655440000
🔑 Token in localStorage: EXISTS
📡 Fetching projects for user: 550e8400-e29b-41d4-a716-446655440000
🌐 API Call: {endpoint: "/projects/user/550e8400...", ...}
📡 API Response: {status: 500, ok: false}
❌ API Error Response: {error: "Database connection failed"}
❌ Error fetching projects: Error: Database connection failed
```

---

## 🛠️ أدوات الفحص | Debug Tools

### 1. React DevTools
```
افتح: Developer Tools → React Components
تحقق من:
- AuthProvider state
- user object
- token
```

### 2. Network Tab
```
افتح: Developer Tools → Network
ابحث عن:
- GET /api/v1/projects/user/:userId
- تحقق من Headers
- تحقق من Response
```

### 3. Console Tab
```
افتح: Developer Tools → Console
ابحث عن:
- أي رسائل خطأ حمراء
- API Call logs
- User info logs
```

### 4. Application Tab
```
افتح: Developer Tools → Application → Local Storage
تحقق من:
- token
- refreshToken
```

---

## ✅ Checklist للفحص السريع | Quick Check

قبل أن تسأل عن المساعدة، تحقق من:

```
[ ] Backend مشغل على port 3003
[ ] Frontend مشغل على port 3000
[ ] MySQL/Database يعمل
[ ] Token موجود في localStorage
[ ] User ID موجود وصحيح
[ ] .env.local يحتوي على NEXT_PUBLIC_API_URL
[ ] تم إنشاء مشاريع للمستخدم
[ ] لا توجد أخطاء CORS في Console
[ ] صلاحيات المستخدم صحيحة
```

---

## 📞 طلب المساعدة | Getting Help

إذا جربت جميع الحلول ولا زالت المشكلة موجودة:

### المعلومات المطلوبة | Required Information

```
1. Screenshot من رسالة الخطأ
2. Console logs (F12 → Console)
3. Network tab response (F12 → Network)
4. User ID من Debug Info
5. API URL من Debug Info
6. Backend logs من terminal
```

### كيفية الحصول على Logs

#### Frontend Logs
```
F12 → Console → copy all text
```

#### Backend Logs
```
في terminal Backend → copy last 50 lines
```

#### Network Response
```
F12 → Network → Click failed request → Response tab → copy
```

---

**آخر تحديث: 21 فبراير 2026**

**Last updated: February 21, 2026**
