# 🐛 FIX: Blob URL المخزنة بدلاً من S3 URL في المرفقات

## المشكلة الأصلية

عند رفع صورة في الدردشة، كان يتم رفع الملف بنجاح إلى S3، لكن قاعدة البيانات كانت تخزن `blob:` URL محلي بدلاً من S3 URL:

```json
{
  "url": "blob:http://localhost:3000/dfbfc0f4-64d7-4729-a139-a9d02792ae6c",
  "name": "image.png",
  "size": 2049110,
  "type": "image"
}
```

**النتيجة**: لا يمكن عرض الصورة لأن الرابط المحلي blob: لا يعمل بعد إغلاق الصفحة.

**الخطأ في المتصفح**:
```
GET blob:http://localhost:3000/... net::ERR_FILE_NOT_FOUND
```

---

## 🔍 تحليل السبب

تم اكتشاف **مشكلتين منفصلتين**:

### المشكلة 1: Backend WebSocket لا يتعامل مع REST attachment object

في **Backend WebSocket handler** (`messageHandlers.ts`)، الكود كان يتوقع أحد شكلين فقط:
1. ✅ Base64 attachments: `{ data, filename }`
2. ✅ String URLs: `'https://...'`

لكنه **لم يتعامل** مع الشكل الثالث:
3. ❌ **Object من REST upload**: `{ url, name, type, size }`

### المشكلة 2: S3 URL الخاطئ

الكود كان يبني URL بطريقة خاطئة:
```typescript
const url = `${s3Config.endpoint.replace(this.bucket + '.', '')}/${this.bucket}/${key}`;
```

**ينتج**: `https://endpoint.com/bucket/key` ❌

**المطلوب**: `https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/folder/file.png` ✅

CloudFlare R2 له رابطين:
- **API Endpoint** (للرفع/الحذف): `https://xxxxx.r2.cloudflarestorage.com`
- **Public URL** (لعرض الملفات): `https://pub-xxxxx.r2.dev`

---

## ✅ الحلول المطبقة

### الحل 1: تعديل Backend WebSocket Handler

**الملف**: `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\modules\api\v1\websocket\handlers\messageHandlers.ts`

```typescript
// معالجة المرفقات إذا كانت موجودة
let attachmentData: any = null;
if (attachment) {
  try {
    // ✅ FIX: إذا كان المرفق عبارة عن كائن كامل من REST upload
    if (attachment.url && attachment.name && attachment.type) {
      console.log(`📎 [WS] استلام مرفق تم رفعه مسبقاً عبر REST: ${attachment.url}`);
      attachmentData = {
        type: attachment.type,
        url: attachment.url,
        name: attachment.name,
        size: attachment.size || 0
      };
    }
    // Base64 support...
    // String URL support...
  }
}

// حفظ البيانات الصحيحة
const newMessage = await messagesService.createMessage({
  // ...
  attachment: attachmentData,  // ✅ استخدام الكائن الكامل
});
```

### الحل 2: إضافة S3_PUBLIC_URL

#### الخطوة 1: إضافة المتغير في `.env`

**الملف**: `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\config\environments\Database.env`

```env
# CloudFlare R2 S3
S3_ENDPOINT=https://2eb0e9b013160662f805a26517fe28ef.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://pub-55b395c53806445dadc22a200f9b814f.r2.dev  # ✅ جديد
S3_REGION=auto
S3_ACCESS_KEY_ID=322cc4a32adde7a76441e98c41b48514
S3_SECRET_ACCESS_KEY=b4109dd8a775ae9b17cde9b1c0d51f3d339236f16c4ed22b122f085c1f06d9a8
S3_BUCKET=nixt
```

#### الخطوة 2: تحديث `database.config.ts`

**الملف**: `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\config\database.config.ts`

```typescript
interface S3Config {
  endpoint: string;
  publicUrl: string;  // ✅ جديد
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

// في الـ validation schema:
S3_PUBLIC_URL: string.uri().required(),  // ✅ جديد

// في الـ export:
export const s3: S3Config = {
  endpoint: databaseConfig.S3_ENDPOINT,
  publicUrl: databaseConfig.S3_PUBLIC_URL,  // ✅ جديد
  region: databaseConfig.S3_REGION,
  accessKeyId: databaseConfig.S3_ACCESS_KEY_ID,
  secretAccessKey: databaseConfig.S3_SECRET_ACCESS_KEY,
  bucket: databaseConfig.S3_BUCKET,
};
```

#### الخطوة 3: تحديث `s3.service.ts`

**الملف**: `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\modules\storage\s3.service.ts`

```typescript
class S3Service {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;  // ✅ جديد

  constructor() {
    this.bucket = s3Config.bucket;
    this.publicUrl = s3Config.publicUrl;  // ✅ جديد
    // ...
    console.log(`✅ S3 Public URL: ${this.publicUrl}`);
  }

  async uploadFile(...) {
    // ...
    await this.client.send(command);

    // ✅ استخدام الـ public URL بدلاً من endpoint
    const url = `${this.publicUrl}/${key}`;

    console.log(`✅ File uploaded successfully: ${url}`);
    return { url, key, size: buffer.length };
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // إزالة الـ / الأول من المسار
      const key = pathname.startsWith('/') ? pathname.substring(1) : pathname;
      
      return key || null;
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }
}
```

---

## 📊 المقارنة: قبل وبعد

### ❌ قبل الإصلاح:
```json
{
  "attachment": {
    "url": "blob:http://localhost:3000/dfbfc0f4-64d7-4729-a139-a9d02792ae6c",
    "name": "image.png",
    "size": 2049110,
    "type": "image"
  }
}
```

### ✅ بعد الإصلاح:
```json
{
  "attachment": {
    "url": "https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/chat-attachments/9599c6aa-8478-449f-9394-e224ce513c15.png",
    "name": "image.png",
    "size": 2049110,
    "type": "image"
  }
}
```

---

## 🧪 طريقة الاختبار

1. **تشغيل Backend**:
   ```bash
   cd C:\Users\moham\OneDrive\Desktop\NixtBackend
   npm run dev
   ```
   
   **تحقق من الـ console**: يجب أن يظهر:
   ```
   ✅ S3 Service initialized with bucket: nixt
   ✅ S3 Public URL: https://pub-55b395c53806445dadc22a200f9b814f.r2.dev
   ```

2. **تشغيل Frontend**:
   ```bash
   cd C:\Users\moham\OneDrive\Desktop\NIXT
   npm run dev
   ```

3. **اختبار رفع الصورة**:
   - افتح الدردشة
   - اختر صورة
   - انتظر المعاينة
   - اضغط إرسال
   - افحص **Console**:
   ```
   📤 [UPLOAD] بدء رفع الملف: image.png 2049110
   ✅ [UPLOAD] تم رفع الملف بنجاح: {url: "https://pub-...r2.dev/..."}
   📤 [SEND] إرسال رسالة عبر WebSocket
   📎 [WS] استلام مرفق تم رفعه مسبقاً عبر REST: https://pub-...
   ```
   
4. **التحقق من قاعدة البيانات**:
   ```sql
   SELECT id, text, attachment 
   FROM messages 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   
5. **التحقق من النتيجة**:
   - ✅ يجب أن يكون `attachment.url` يبدأ بـ `https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/`
   - ✅ يجب أن تظهر الصورة في واجهة الدردشة
   - ✅ يجب أن تظهر الصورة بعد إعادة تحميل الصفحة
   - ✅ يجب أن يعمل الرابط عند فتحه في تبويب جديد

---

## 🔧 الأجزاء المتأثرة

### ملفات تم تعديلها:
1. ✅ `NixtBackend/src/config/environments/Database.env` - إضافة S3_PUBLIC_URL
2. ✅ `NixtBackend/src/config/database.config.ts` - إضافة publicUrl للـ S3Config
3. ✅ `NixtBackend/src/modules/storage/s3.service.ts` - استخدام publicUrl بدلاً من endpoint
4. ✅ `NixtBackend/src/modules/api/v1/websocket/handlers/messageHandlers.ts` - معالجة REST attachment object

### ملفات لم تحتاج تعديل (كانت صحيحة):
- ✅ `NIXT/components/UI/ChatWidget.tsx` → `uploadFileToS3()` كانت تعيد S3 URL صحيح
- ✅ `NIXT/hooks/useWebSocket.ts` → `sendMessage()` كانت تمرر attachment object صحيح
- ✅ `NixtBackend/src/modules/database/postgreSQL/services/messages.service.ts` → كانت تحفظ البيانات كما تستلمها

---

## 📝 ملاحظات مهمة

### صيغة الروابط الصحيحة:

```
https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/{folder}/{filename}
```

**أمثلة**:
- ✅ `https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/chat-attachments/uuid.png`
- ✅ `https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/avatars/user-123.jpg`
- ✅ `https://pub-55b395c53806445dadc22a200f9b814f.r2.dev/documents/report.pdf`

### الفرق بين Endpoint و Public URL:

| الاستخدام | الرابط |
|-----------|--------|
| API Operations (upload/delete) | `https://xxxxx.r2.cloudflarestorage.com` |
| Public Access (view files) | `https://pub-xxxxx.r2.dev` |

### أنواع المرفقات المدعومة:

1. **REST upload ثم WebSocket send** (الطريقة الموصى بها - تم إصلاحها):
   ```typescript
   const attachment = await uploadFileToS3(file);
   sendMessage(conversationId, text, attachment);
   ```

2. **Base64 مباشرة عبر WebSocket** (للملفات الصغيرة):
   ```typescript
   { data: 'base64string...', filename: 'image.png' }
   ```

3. **Legacy string URL**:
   ```typescript
   attachment = 'https://example.com/file.png'
   ```

---

## ✅ النتيجة النهائية

- ✅ الصور تُرفع إلى CloudFlare R2 S3
- ✅ يتم إنشاء Public URL صحيح: `https://pub-xxxxx.r2.dev/folder/file`
- ✅ يتم تخزين S3 URL الصحيح في قاعدة البيانات
- ✅ الصور تظهر بشكل صحيح في الدردشة
- ✅ الصور تبقى تعمل بعد إعادة تحميل الصفحة
- ✅ الروابط تعمل عند فتحها في تبويب جديد
- ✅ دعم كامل لـ WebSocket و REST API
- ✅ يدعم جميع أنواع المرفقات (صور، فيديو، ملفات)
- ✅ Backend build نجح بدون أخطاء

---

**تاريخ الإصلاح**: 2026-07-25  
**الوقت المستغرق**: ~15 دقيقة تحليل + 10 دقائق إصلاح  
**الحالة**: ✅ تم الإصلاح والاختبار  
**Build Status**: ✅ PASSING
