# 📤 دليل رفع الملفات في Frontend - نظام الدردشة

## نظرة عامة

تم تطبيق نظام رفع الملفات إلى S3 (CloudFlare R2) في الـ ChatWidget. يتم رفع الملفات تلقائياً إلى S3 قبل إرسال الرسالة.

---

## 🔄 آلية العمل

### 1. اختيار الملف
المستخدم يختار ملف من:
- 📷 زر الصورة (Image)
- 🎬 زر الفيديو (Video)  
- 📎 زر الملف (File)

### 2. التحقق من الملف
يتم التحقق من:
- ✅ نوع الملف (صورة، فيديو، مستند)
- ✅ حجم الملف (حد أقصى 10MB)
- ✅ امتداد الملف

### 3. رفع الملف إلى S3
```typescript
const attachment = await uploadFileToS3(file)
```

**API Endpoint:**
```
POST /api/v1/messages/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "image",
    "url": "https://...../chat-attachments/uuid.png",
    "name": "image.png",
    "size": 12345
  }
}
```

### 4. إرسال الرسالة مع المرفق
بعد نجاح الرفع، يتم إرسال الرسالة عبر WebSocket أو REST API:

```typescript
sendMessage(text, attachment)
```

---

## 📝 التغييرات في ChatWidget.tsx

### 1. إضافة حالة رفع الملف
```typescript
const [uploadingFile, setUploadingFile] = useState(false)
```

### 2. دالة رفع الملف
```typescript
const uploadFileToS3 = useCallback(async (file: File): Promise<MessageAttachment | null> => {
  try {
    setUploadingFile(true)
    setFileError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    
    const response = await fetch(`${API_URL}/messages/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('فشل رفع الملف')
    }
    
    const result = await response.json()
    return result.data as MessageAttachment
  } catch (error: any) {
    setFileError(error.message)
    return null
  } finally {
    setUploadingFile(false)
  }
}, [language])
```

### 3. تحديث handleFileSelect
```typescript
const handleFileSelect = useCallback(async (file: File, forcedType?: MessageAttachment['type']) => {
  // ... التحقق من نوع وحجم الملف

  // رفع الملف إلى S3
  const attachment = await uploadFileToS3(file)
  
  if (!attachment) {
    return // فشل الرفع
  }
  
  // إرسال الرسالة مع المرفق
  sendMessage(inputValue, attachment)
}, [inputValue, language, sendMessage, uploadFileToS3])
```

### 4. مؤشر التحميل في UI
```tsx
{uploadingFile && (
  <p className={styles.uploadingIndicator} role="status">
    {language === 'ar' ? '📤 جاري رفع الملف...' : '📤 Uploading file...'}
  </p>
)}
```

### 5. تعطيل الأزرار أثناء الرفع
```tsx
<button 
  onClick={() => imageInputRef.current?.click()}
  disabled={uploadingFile}
>
  {/* زر الصورة */}
</button>
```

---

## 🎨 الأنماط (ChatWidget.module.css)

### مؤشر التحميل
```css
.uploadingIndicator {
  margin: 0;
  padding: 8px 24px 0;
  font-size: 0.78rem;
  color: #7042f8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

## 🔐 الأمان

### 1. المصادقة
يتم إرسال JWT token مع كل طلب رفع:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 2. التحقق من نوع الملف
```typescript
const isImage = file.type.startsWith('image/')
const isVideo = file.type.startsWith('video/')
```

### 3. التحقق من حجم الملف
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
if (file.size > maxSize) {
  setFileError('حجم الملف كبير جداً')
  return
}
```

---

## 📊 تجربة المستخدم

### الحالات المختلفة

#### 1. بدء الرفع
```
[يختار المستخدم ملف]
  ↓
[يظهر: "📤 جاري رفع الملف..."]
  ↓
[تعطيل جميع أزرار المرفقات]
```

#### 2. نجاح الرفع
```
[رفع ناجح]
  ↓
[إخفاء المؤشر]
  ↓
[إرسال الرسالة تلقائياً]
  ↓
[مسح حقل الإدخال]
```

#### 3. فشل الرفع
```
[فشل الرفع]
  ↓
[عرض رسالة خطأ باللون الأحمر]
  ↓
[إعادة تفعيل الأزرار]
  ↓
[المستخدم يمكنه المحاولة مرة أخرى]
```

---

## 🧪 الاختبار

### 1. اختبار رفع صورة
```typescript
// 1. انقر على زر الصورة 📷
// 2. اختر صورة (< 10MB)
// 3. تأكد من ظهور مؤشر "جاري رفع الملف..."
// 4. انتظر حتى يتم الرفع
// 5. تأكد من إرسال الرسالة تلقائياً
// 6. تأكد من ظهور الصورة في الدردشة
```

### 2. اختبار حجم كبير
```typescript
// 1. انقر على زر الصورة
// 2. اختر صورة > 10MB
// 3. تأكد من ظهور رسالة خطأ: "حجم الملف كبير جداً"
// 4. تأكد من عدم رفع الملف
```

### 3. اختبار نوع خاطئ
```typescript
// 1. انقر على زر الصورة (Image)
// 2. اختر ملف PDF
// 3. تأكد من ظهور رسالة: "يرجى اختيار صورة صالحة"
```

---

## 🌐 متغيرات البيئة (.env.local)

تأكد من وجود:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

## 🔍 استكشاف الأخطاء

### مشكلة: "فشل رفع الملف"
✅ تحقق من:
- اتصال الإنترنت
- صحة API_URL في .env.local
- وجود token في localStorage
- تشغيل Backend

### مشكلة: "لا يوجد token"
✅ تأكد من تسجيل الدخول
✅ تحقق من localStorage.getItem('auth_token')

### مشكلة: الملف لا يظهر في الدردشة
✅ تحقق من:
- نجاح الرفع في Console
- استجابة API تحتوي على `data.url`
- عدم وجود أخطاء JavaScript

---

## 📋 قائمة التحقق

- [x] إضافة حالة `uploadingFile`
- [x] تطبيق دالة `uploadFileToS3`
- [x] تحديث `handleFileSelect` للرفع قبل الإرسال
- [x] إضافة مؤشر التحميل في UI
- [x] تعطيل الأزرار أثناء الرفع
- [x] إضافة الأنماط للمؤشر
- [x] التحقق من نوع وحجم الملف
- [x] معالجة الأخطاء

---

## 🎯 الخلاصة

الآن نظام رفع الملفات في Frontend:
- ✅ يرفع الملفات تلقائياً إلى S3
- ✅ يعرض مؤشر تحميل للمستخدم
- ✅ يعطل الأزرار أثناء الرفع
- ✅ يتحقق من نوع وحجم الملف
- ✅ يعالج الأخطاء بشكل صحيح
- ✅ يرسل الرسالة تلقائياً بعد الرفع

---

## 📚 للمزيد

راجع:
- Backend Guide: `NixtBackend/docs/S3-FILE-UPLOAD-GUIDE.md`
- Example Code: `docs/file-upload-example.tsx`
- WebSocket Guide: `docs/websocket-frontend-guide.md`
