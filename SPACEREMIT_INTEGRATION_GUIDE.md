# دليل تكامل SpaceRemit - الدفع الإلكتروني

## 📋 نظرة عامة

تم تكامل نظام الدفع **SpaceRemit** بالكامل في المشروع (Frontend + Backend) مع جميع ميزات الأمان والتحقق المطلوبة.

---

## 🔧 الإعداد الأولي

### 1. الحصول على مفاتيح SpaceRemit

1. سجّل حسابك في [SpaceRemit Dashboard](https://spaceremit.com/dashboard)
2. انتقل إلى **Websites And Keys**
3. أضف موقعك واحصل على:
   - **Public Key** (للاستخدام في Frontend)
   - **Secret Key** (للاستخدام في Backend فقط)
   - **Test Keys** (للاختبار والتطوير)

### 2. إعداد متغيرات البيئة

#### Frontend (`.env.local`)

```env
# SpaceRemit Payment Gateway
NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_SPACEREMIT_TEST_PUBLIC_KEY=your_test_public_key_here
```

#### Backend (`.env`)

```env
# SpaceRemit Payment Gateway
SPACEREMIT_SECRET_KEY=your_secret_key_here
SPACEREMIT_PUBLIC_KEY=your_public_key_here
SPACEREMIT_TEST_SECRET_KEY=your_test_secret_key_here
SPACEREMIT_TEST_PUBLIC_KEY=your_test_public_key_here
SPACEREMIT_ENVIRONMENT=development  # أو production
```

**⚠️ تحذير أمني مهم:**
- **لا تضع Secret Key أبداً في Frontend**
- لا تشارك المفاتيح السرية على GitHub
- استخدم Test Keys أثناء التطوير

### 3. إعداد قاعدة البيانات

قم بتشغيل migration لإنشاء جدول `payments`:

```bash
# من مجلد Backend
psql -U postgres -d your_database_name -f migrations/2026-07-25-create-payments-table.sql
```

أو إذا كنت تستخدم migration system:

```bash
npm run migrate
```

### 4. إعداد Callback URL في SpaceRemit Dashboard

1. افتح [SpaceRemit Dashboard](https://spaceremit.com/dashboard)
2. انتقل إلى إعدادات الموقع
3. أضف Callback URL:

```
https://yourdomain.com/api/v1/payments/spaceremit/webhook
```

للتطوير المحلي (استخدم ngrok أو localhost.run):
```
https://your-ngrok-url.ngrok.io/api/v1/payments/spaceremit/webhook
```

---

## 🏗️ البنية المعمارية

### Frontend Structure

```
app/
├── payment/
│   ├── page.tsx                    # صفحة الدفع الرئيسية
│   ├── Payment.module.css
│   └── success/
│       └── page.tsx                # صفحة نجاح الدفع
│
components/
└── Payment/
    ├── SpaceremitCheckout.tsx      # مكون الدفع الرئيسي
    └── SpaceremitCheckout.module.css
```

### Backend Structure

```
src/
├── modules/
│   ├── api/v1/restful/
│   │   ├── routes/
│   │   │   └── payments.routes.ts         # Routes للدفع
│   │   ├── controllers/
│   │   │   └── payments.controller.ts     # Controllers
│   │   └── validators/
│   │       └── payments.validator.ts      # Validation
│   │
│   ├── spaceremit/
│   │   ├── services/
│   │   │   └── payment.service.ts         # منطق التعامل مع API
│   │   └── types.ts                       # TypeScript types
│   │
│   └── database/postgreSQL/
│       ├── models/
│       │   └── Payment.model.ts           # نموذج قاعدة البيانات
│       └── services/
│           └── payments.service.ts        # Database operations
│
└── config/
    └── spaceremit.config.ts               # الإعدادات
```

---

## 🚀 كيفية الاستخدام

### 1. صفحة الدفع للمستخدمين

المستخدم يدخل على:
```
https://yourdomain.com/payment?plan=landing&amount=100
```

**معاملات URL المتاحة:**
- `plan`: اسم الخطة (landing, dashboard, ecommerce, custom)
- `amount`: المبلغ (اختياري، يتم استخدام السعر الافتراضي إذا لم يُحدد)

### 2. التدفق الكامل

```
1. المستخدم → صفحة الدفع
                ↓
2. يختار طريقة الدفع (Local methods أو Card)
                ↓
3. يملأ البيانات ويضغط "ادفع الآن"
                ↓
4. SpaceRemit JS يعالج الدفع
                ↓
5. عند النجاح → يُرجع payment_code
                ↓
6. Frontend → يرسل للـ Backend (/verify)
                ↓
7. Backend → يتحقق من SpaceRemit API
                ↓
8. Backend → يحفظ في قاعدة البيانات
                ↓
9. Frontend → يوجّه للصفحة النجاح
                ↓
10. SpaceRemit → يرسل Webhook للتأكيد النهائي
```

---

## 🔌 API Endpoints

### 1. الحصول على الإعدادات (Public)

```http
GET /api/v1/payments/spaceremit/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "publicKey": "pk_live_...",
    "isConfigured": true,
    "isTestMode": false,
    "jsUrl": "https://spaceremit.com/api/v2/js_script/spaceremit.js",
    "callbackUrl": "https://yourdomain.com/api/v1/payments/spaceremit/webhook"
  },
  "message": "Spaceremit configuration loaded"
}
```

### 2. التحقق من الدفع (Protected)

```http
POST /api/v1/payments/spaceremit/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentId": "SP_12345678",
  "planName": "landing",
  "expectedAmount": 100,
  "expectedCurrency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "spaceremit_payment_id": "SP_12345678",
    "amount": "100.00",
    "currency": "USD",
    "status": "completed",
    "isSuccessful": true,
    "spaceremit_status": "Success",
    "status_tag": "A"
  },
  "message": "Payment verified successfully"
}
```

### 3. Webhook (Public - No Auth)

```http
POST /api/v1/payments/spaceremit/webhook
Content-Type: application/json

{
  "response_status": "success",
  "data": {
    "id": "SP_12345678",
    "amount": "100.00",
    "currency": "USD",
    "status": "Success",
    "status_tag": "A",
    ...
  }
}
```

### 4. قائمة دفعاتي (Protected)

```http
GET /api/v1/payments/spaceremit/my-payments
Authorization: Bearer {token}
```

### 5. معلومات دفعة محددة (Protected)

```http
GET /api/v1/payments/spaceremit/{paymentId}
Authorization: Bearer {token}
```

---

## 🔒 الأمان

### ميزات الأمان المطبقة:

1. **Secret Key Protection**
   - لا تُستخدم إلا في Backend
   - غير موجودة في Frontend أبداً
   - محفوظة في `.env` (غير مرفوع على Git)

2. **Double Verification**
   - التحقق الأول: عند استلام payment_code من Frontend
   - التحقق الثاني: عبر Webhook من SpaceRemit

3. **Amount Validation**
   - التحقق من المبلغ المتوقع مع المبلغ الفعلي
   - التحقق من العملة

4. **Status Tag Verification**
   - قبول الحالات الناجحة فقط: `A`, `B`, `D`, `E`
   - رفض: `C`, `G`, `H` (فشل، إلغاء، استرداد)

5. **User Association**
   - ربط الدفع بالمستخدم (إذا كان مسجل دخول)
   - دعم Guest payments

6. **Audit Trail**
   - حفظ البيانات الكاملة من SpaceRemit في `raw_data`
   - تتبع وقت التحقق في `verified_at`
   - Timestamps للإنشاء والتحديث

---

## 📊 حالات الدفع (Status Tags)

### الحالات المقبولة:
- **A**: Success (نجح)
- **B**: Waiting for payment (في انتظار الدفع)
- **D**: Wait for seller Approval (في انتظار موافقة البائع)
- **E**: Wait for release payment (في انتظار صرف الدفع)

### الحالات المرفوضة:
- **C**: Failed/Refused (فشل/مرفوض)
- **G**: Canceled (ملغي)
- **H**: Refunded (مسترد)

---

## 🧪 الاختبار

### 1. الاختبار المحلي

```bash
# Frontend
cd c:\Users\moham\OneDrive\Desktop\NIXT
npm run dev

# Backend
cd c:\Users\moham\OneDrive\Desktop\NixtBackend
npm run dev
```

### 2. استخدام Test Keys

في وضع التطوير، استخدم Test Keys:
- لن يتم خصم أموال حقيقية
- يمكن محاكاة جميع الحالات

### 3. اختبار Webhook محلياً

استخدم `ngrok` لعمل tunnel:

```bash
ngrok http 3003
```

ثم ضع URL الناتج في SpaceRemit Dashboard:
```
https://your-ngrok-id.ngrok.io/api/v1/payments/spaceremit/webhook
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Payment gateway is not configured"

**الحل:**
- تأكد من إضافة المفاتيح في `.env`
- أعد تشغيل Backend بعد تعديل `.env`

### المشكلة: "Payment verification failed"

**الحل:**
- تحقق من أن Secret Key صحيح
- تحقق من أن paymentId صحيح
- راجع logs في Backend Console

### المشكلة: Webhook لا يعمل

**الحل:**
- تأكد من أن Callback URL صحيح في SpaceRemit Dashboard
- تأكد من أن الـ endpoint public (بدون JWT)
- استخدم ngrok للاختبار المحلي

### المشكلة: "Failed to load Spaceremit payment script"

**الحل:**
- تحقق من اتصالك بالإنترنت
- تحقق من أن URL الخاص بـ JS script صحيح
- افحص Browser Console للأخطاء

---

## 📝 ملاحظات إضافية

### طرق الدفع المدعومة:

1. **Local Payment Methods** (مفعّل)
   - تحويلات بنكية
   - محافظ إلكترونية
   - طرق دفع محلية

2. **Card Payment** (قادم قريباً)
   - Visa
   - Mastercard
   - وغيرها

### البيانات المحفوظة في قاعدة البيانات:

```sql
payments
├── id (UUID)
├── user_id (UUID, nullable)
├── provider (enum: 'spaceremit')
├── spaceremit_payment_id (string, unique)
├── amount (decimal)
├── currency (string)
├── status (enum: pending|completed|failed|refunded|canceled)
├── spaceremit_status (string)
├── status_tag (string)
├── plan_name (string)
├── buyer_email (string)
├── buyer_name (string)
├── notes (text)
├── raw_data (jsonb) -- البيانات الكاملة من API
├── verified_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## 🔄 التحديثات المستقبلية

- [ ] إضافة دعم الاشتراكات الدورية
- [ ] إضافة Refund API
- [ ] لوحة تحكم للمدفوعات في Dashboard
- [ ] تقارير مالية
- [ ] إشعارات البريد الإلكتروني للدفعات

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع [SpaceRemit Documentation](https://spaceremit.com/api/documentation)
2. افحص Backend logs
3. افحص Browser Console في Frontend
4. تحقق من Webhook logs في SpaceRemit Dashboard

---

## 🎉 انتهى التكامل!

الآن يمكنك:
1. إضافة المفاتيح الفعلية في `.env` files
2. تشغيل Migration لإنشاء جدول payments
3. إضافة Callback URL في SpaceRemit Dashboard
4. البدء باستقبال الدفعات!

**Good luck! 🚀**
