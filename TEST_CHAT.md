# 🧪 اختبار ميزة الدردشة - Chat Testing Guide

## ✅ قائمة الاختبار السريع

### 1. التحقق من التشغيل
- [ ] Backend يعمل على `http://localhost:3003`
- [ ] WebSocket يعمل على `ws://localhost:8080`
- [ ] Frontend يعمل على `http://localhost:3000`
- [ ] لا توجد أخطاء في console

### 2. اختبار الاتصال
- [ ] مؤشر WebSocket أخضر (●) في header المحادثة
- [ ] رسالة "WebSocket متصل" في console
- [ ] لا توجد أخطاء "WebSocket غير متصل"

### 3. اختبار إرسال الرسائل
- [ ] فتح المحادثة من حساب Admin
- [ ] فتح نفس المحادثة من حساب Client (نافذة تصفح خفي)
- [ ] إرسال رسالة من Admin
- [ ] ✅ تظهر الرسالة فوراً عند Client
- [ ] إرسال رسالة من Client
- [ ] ✅ تظهر الرسالة فوراً عند Admin

### 4. اختبار تحديث الصفحة
- [ ] إرسال 3-5 رسائل في المحادثة
- [ ] الضغط على F5 (تحديث الصفحة)
- [ ] ✅ جميع الرسائل القديمة تظهر
- [ ] ✅ ترتيب الرسائل صحيح (الأحدث في الأسفل)

### 5. اختبار REST API Fallback
- [ ] الضغط على زر "🧪 اختبار REST API" أسفل الشاشة
- [ ] ✅ تظهر رسالة نجاح
- [ ] ✅ الرسالة موجودة في قاعدة البيانات
- [ ] ✅ الرسالة تظهر في المحادثة بعد التحديث

## 🐛 استكشاف الأخطاء

### المشكلة: الرسالة لا تظهر للمستلم

#### تحقق من Console المتصفح:
```
✅ يجب أن تظهر:
📤 [SEND] إرسال الرسالة عبر WebSocket
💬 [RECEIVE] رسالة جديدة عبر WebSocket
💬 [RECEIVE] إضافة الرسالة إلى [chatId]

❌ إذا ظهر:
⚠️ WebSocket غير متصل، استخدام REST API
```

#### تحقق من Backend Terminal:
```
✅ يجب أن تظهر:
📨 Message sent in conversation [id] by user [userId]
📢 Broadcasting to subscribers: [userId1, userId2]
📊 Message broadcast to 2 connections

❌ إذا ظهر:
⚠️ No subscribers found for conversation [id]
📊 Message broadcast to 0 connections
```

**الحل:**
1. تأكد من أن كلا المستخدمين فتحوا المحادثة
2. تحقق من أن WebSocket متصل (مؤشر أخضر)
3. حاول إغلاق وإعادة فتح المحادثة

---

### المشكلة: الرسائل القديمة لا تظهر عند التحديث

#### تحقق من Console:
```
✅ يجب أن تظهر:
📥 بدء تحميل الرسائل للمحادثة: [id]
✅ تم تحميل X رسالة
💾 حفظ الرسائل في activeChatId: [chatId]

❌ إذا ظهر:
⚠️ لا يوجد activeConversationId
⚠️ لا توجد رسائل في الاستجابة
```

**الحل:**
1. تحقق من أن `activeChatId` و `activeConversationId` ليسا null
2. افتح Network tab وتحقق من طلب `/api/v1/messages/[conversationId]`
3. تحقق من استجابة API - يجب أن تحتوي على `data` array

---

### المشكلة: WebSocket غير متصل

#### تحقق من:
```
❌ في Console:
Failed to construct 'WebSocket': The URL 'ws://localhost:8080/ws/chat' is invalid

❌ في Network tab:
WebSocket connection to 'ws://localhost:8080/ws/chat' failed
```

**الحل:**
1. تأكد من أن Backend WebSocket يعمل:
   ```bash
   # في terminal Backend
   🔌 WebSocket server is running!
   🔗 WebSocket URL: ws://localhost:8080/ws/chat
   ```

2. تحقق من `.env.local`:
   ```
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

3. أعد تشغيل Frontend بعد تغيير `.env.local`:
   ```bash
   # أوقف Frontend (Ctrl+C)
   npm run dev
   ```

---

### المشكلة: خطأ "No authentication token"

#### في Console:
```
❌ WebSocket auth failed: No authentication token found
❌ لا يوجد token للمصادقة
```

**الحل:**
1. تسجيل الدخول مرة أخرى
2. تحقق من localStorage:
   ```javascript
   // في Console المتصفح
   console.log(localStorage.getItem('auth_token'))
   console.log(localStorage.getItem('token'))
   ```
3. يجب أن يكون هناك token صالح

---

## 📊 معلومات قاعدة البيانات

### للتحقق من الرسائل في قاعدة البيانات:

```sql
-- جميع الرسائل
SELECT 
  id, 
  conversation_id, 
  sender_type, 
  text, 
  status, 
  created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 20;

-- عدد الرسائل لكل محادثة
SELECT 
  conversation_id, 
  COUNT(*) as message_count 
FROM messages 
GROUP BY conversation_id;

-- آخر 5 رسائل في محادثة معينة
SELECT 
  id, 
  sender_type, 
  text, 
  status, 
  created_at 
FROM messages 
WHERE conversation_id = 'YOUR_CONVERSATION_ID' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🎯 سيناريو الاختبار الكامل

### الإعداد:
1. افتح Chrome في الوضع العادي
2. سجل دخول كـ **Admin**
3. افتح نافذة تصفح خفي (Incognito)
4. سجل دخول كـ **Client**

### الخطوات:
1. **من Admin**: افتح المحادثة مع Client معين
2. **من Client**: افتح نفس المحادثة
3. **من Admin**: أرسل "مرحباً، كيف يمكنني مساعدتك؟"
   - ✅ يجب أن تظهر فوراً عند Client
4. **من Client**: أرد "أحتاج مساعدة في مشروعي"
   - ✅ يجب أن تظهر فوراً عند Admin
5. **من Admin**: أرسل رسالة مع إيموجي "👍 سأساعدك الآن"
   - ✅ يجب أن تظهر الإيموجي بشكل صحيح
6. **من Client**: حدث الصفحة (F5)
   - ✅ جميع الرسائل الثلاث تظهر
7. **من Admin**: حدث الصفحة (F5)
   - ✅ جميع الرسائل الثلاث تظهر

### النتيجة المتوقعة:
✅ جميع الرسائل تظهر في الوقت الفعلي
✅ الرسائل لا تختفي عند التحديث
✅ الترتيب الزمني صحيح
✅ الحالة (sent/received) صحيحة

---

## 🔍 معلومات التشخيص المتقدم

### في ChatWidget Component:

أضف هذا الكود مؤقتاً للتشخيص:
```typescript
useEffect(() => {
  console.log('═══ Debug Info ═══')
  console.log('activeChatId:', activeChatId)
  console.log('activeConversationId:', activeConversationId)
  console.log('chatMessages keys:', Object.keys(chatMessages))
  console.log('activeMessages count:', activeMessages.length)
  console.log('wsConnected:', wsConnected)
  console.log('conversations count:', conversations.length)
  console.log('═════════════════')
}, [activeChatId, activeConversationId, chatMessages, activeMessages, wsConnected, conversations])
```

### في Backend:

راقب terminal للتأكد من:
```
✅ User [userId] connected
✅ User [userId] subscribed to conversation [conversationId]
✅ Message sent in conversation [conversationId]
✅ Broadcasting to subscribers: [userIds]
✅ Message broadcast to X connections
```

---

## 📞 الدعم

إذا استمرت المشكلة بعد اتباع جميع الخطوات:

1. أعد تشغيل Backend و Frontend
2. امسح cache المتصفح
3. استخدم زر "🧪 اختبار REST API" للتأكد من عمل قاعدة البيانات
4. راجع ملف `CHAT_MESSAGE_FIX.md` للمزيد من التفاصيل

---

**آخر تحديث:** 2026-07-24
**الحالة:** ✅ جاهز للاختبار
