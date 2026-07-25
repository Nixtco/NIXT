# 🧪 اختبار REST API للرسائل

## الهدف
اختبار إرسال الرسائل مباشرة عبر REST API لتحديد ما إذا كانت المشكلة في:
1. WebSocket فقط
2. حفظ الرسائل بقاعدة البيانات بشكل عام

---

## الطريقة 1: استخدام Console المتصفح

### خطوة 1: افتح Console في متصفح kimo
اضغط F12 → Console

### خطوة 2: نسخ والصق الكود التالي:

```javascript
// الحصول على التوكن
const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
console.log('🔑 Token:', token ? 'موجود' : 'غير موجود');

// معلومات المحادثة
const conversationId = '97a44e10-84a1-4248-8fe4-3d3db19369db';
const messageText = 'اختبار REST API - ' + new Date().toLocaleTimeString('ar-SA');

console.log('📤 إرسال رسالة عبر REST API...');
console.log('Conversation ID:', conversationId);
console.log('Message:', messageText);

// إرسال الرسالة
fetch('http://localhost:3003/api/v1/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversation_id: conversationId,
    text: messageText
  })
})
.then(response => {
  console.log('📥 Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Response Data:', data);
  if (data.success) {
    console.log('✅✅ تم حفظ الرسالة بنجاح!');
    console.log('Message ID:', data.data?.id);
    console.log('Created At:', data.data?.created_at);
  } else {
    console.error('❌ فشل حفظ الرسالة:', data);
  }
})
.catch(error => {
  console.error('❌ خطأ في الطلب:', error);
});
```

### خطوة 3: فحص النتائج

#### ✅ إذا نجح الطلب:
```
✅ Response Status: 200
✅ Response Data: {success: true, data: {...}}
✅✅ تم حفظ الرسالة بنجاح!
```
**التشخيص:** المشكلة في WebSocket فقط، قاعدة البيانات تعمل

#### ❌ إذا فشل الطلب (403):
```
❌ Response Status: 403
❌ Response Data: {success: false, error: "Unauthorized"}
```
**التشخيص:** مشكلة صلاحيات - المستخدم kimo لا يملك صلاحية للمحادثة

#### ❌ إذا فشل الطلب (500):
```
❌ Response Status: 500
❌ Response Data: {success: false, error: "..."}
```
**التشخيص:** خطأ في الباك اند

---

## الطريقة 2: استخدام مكون اختبار React

### إنشاء زر اختبار في ChatWidget

أضف هذا الكود مؤقتاً في `components/UI/ChatWidget.tsx`:

```typescript
// في نهاية المكون، قبل return
const testRestAPI = async () => {
  if (!activeConversationId) {
    console.error('❌ لا يوجد محادثة نشطة');
    return;
  }

  const testMessage = 'اختبار REST API - ' + new Date().toLocaleTimeString('ar-SA');
  
  console.log('🧪 [TEST] إرسال رسالة عبر REST API...');
  console.log('Conversation ID:', activeConversationId);
  console.log('Message:', testMessage);

  try {
    const result = await createMessage({
      conversation_id: activeConversationId,
      text: testMessage
    });

    console.log('✅ [TEST] نجح الطلب:', result);
    
    if (result.success) {
      alert('✅ تم حفظ الرسالة بنجاح عبر REST API!\nMessage ID: ' + result.data?.id);
      
      // إعادة تحميل الرسائل
      loadMessages();
    } else {
      alert('❌ فشل حفظ الرسالة: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error('❌ [TEST] خطأ في الطلب:', error);
    alert('❌ خطأ: ' + error);
  }
};
```

### أضف الزر في الـ JSX:

```jsx
{/* زر اختبار REST API - للتشخيص فقط */}
<button
  onClick={testRestAPI}
  style={{
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    padding: '10px 20px',
    background: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 9999
  }}
>
  🧪 اختبار REST API
</button>
```

---

## الطريقة 3: استخدام cURL (Terminal)

### الحصول على التوكن أولاً:
1. افتح Console في متصفح kimo
2. نفذ: `console.log(localStorage.getItem('auth_token') || localStorage.getItem('token'))`
3. انسخ التوكن

### تنفيذ الطلب:
```bash
# استبدل YOUR_TOKEN بالتوكن الفعلي
curl -X POST http://localhost:3003/api/v1/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "97a44e10-84a1-4248-8fe4-3d3db19369db",
    "text": "اختبار REST API من cURL"
  }' \
  -v
```

---

## الطريقة 4: استخدام Postman

1. افتح Postman
2. أنشئ طلب جديد:
   - **Method:** POST
   - **URL:** `http://localhost:3003/api/v1/messages`
   - **Headers:**
     - `Authorization`: `Bearer YOUR_TOKEN`
     - `Content-Type`: `application/json`
   - **Body (raw JSON):**
     ```json
     {
       "conversation_id": "97a44e10-84a1-4248-8fe4-3d3db19369db",
       "text": "اختبار من Postman"
     }
     ```
3. اضغط Send

---

## التحليل بناءً على النتائج

### ✅ السيناريو 1: REST API يعمل بنجاح
**المشكلة:** WebSocket Handler في الباك اند لا يعمل بشكل صحيح

**الحل:**
1. فحص معالج `message:send` في Backend
2. التأكد من استدعاء `createMessage` function
3. التأكد من بث `message:sent` event

### ❌ السيناريو 2: REST API يعيد 403
**المشكلة:** صلاحيات المحادثة

**الحل:**
1. التحقق من جدول `conversations`:
   ```sql
   SELECT * FROM conversations 
   WHERE id = '97a44e10-84a1-4248-8fe4-3d3db19369db';
   ```
2. التأكد من:
   - `client_id` = `9795a2cb-f56e-4538-9f50-b4687aad508f` (dfhfgnfg)
   - `admin_id` = `1136a741-f5a6-45e0-93c9-972008cfe928` (kimo)
3. إذا كانت القيم خاطئة، تحديثها:
   ```sql
   UPDATE conversations 
   SET admin_id = '1136a741-f5a6-45e0-93c9-972008cfe928'
   WHERE id = '97a44e10-84a1-4248-8fe4-3d3db19369db';
   ```

### ❌ السيناريو 3: REST API يعيد 500
**المشكلة:** خطأ في الباك اند

**الحل:**
1. فحص سجلات الباك اند
2. التحقق من اتصال قاعدة البيانات
3. التحقق من صحة schema للرسائل

---

## بعد الاختبار

### إذا نجح REST API:
1. ✅ قاعدة البيانات تعمل
2. ✅ الصلاحيات صحيحة
3. ❌ المشكلة في WebSocket فقط

**الخطوة التالية:** فحص Backend WebSocket Handler

### إذا فشل REST API:
1. ❌ المشكلة أعمق من WebSocket
2. يجب حل مشكلة REST API أولاً
3. بعدها نعود لاختبار WebSocket

---

## 📝 تسجيل النتائج

بعد تشغيل الاختبار، سجل النتائج هنا:

```
تاريخ الاختبار: _______________
الطريقة المستخدمة: _______________

Response Status: _______________
Success: ☐ نعم  ☐ لا
Message ID: _______________
Error (if any): _______________

الملاحظات:
_________________________________
_________________________________
```
