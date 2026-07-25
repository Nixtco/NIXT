# 🔌 تكامل الدردشة مع WebSocket

## نظرة عامة

تم ربط نظام الدردشة بالباك اند بنجاح باستخدام WebSocket للاتصال في الوقت الفعلي.

## الملفات المحدثة

### 1. `hooks/useWebSocket.ts` (جديد)
Hook مخصص لإدارة اتصال WebSocket:
- ✅ إدارة الاتصال التلقائي وإعادة الاتصال
- ✅ إرسال واستقبال الرسائل
- ✅ إدارة حالة الكتابة (typing indicators)
- ✅ الانضمام/مغادرة المحادثات
- ✅ Ping/Pong للحفاظ على الاتصال
- ✅ معالجة الأخطاء والأحداث

### 2. `components/UI/ChatWidget.tsx` (محدث)
تم تحديث مكون الدردشة:
- ✅ استخدام `useWebSocket` hook
- ✅ إرسال الرسائل عبر WebSocket
- ✅ استقبال الرسائل في الوقت الفعلي
- ✅ إشارات الكتابة (typing indicators)
- ✅ الانضمام التلقائي للمحادثات
- ✅ مؤشر حالة الاتصال (connection status)
- ✅ Fallback إلى REST API عند انقطاع الاتصال

### 3. `.env.local` (محدث)
تمت إضافة متغير البيئة:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## كيفية عمل النظام

### 1. الاتصال الأولي
```typescript
// عند تحميل ChatWidget، يتم الاتصال تلقائياً
const { isConnected, sendMessage, joinConversation } = useWebSocket({
  enabled: true,
  handlers: { /* event handlers */ }
})
```

### 2. إرسال رسالة
```typescript
// عند كتابة رسالة والضغط على إرسال
sendMessage(conversationId, text, attachment)

// يتم:
// 1. إرسال الرسالة عبر WebSocket
// 2. إضافة الرسالة محلياً للواجهة
// 3. استقبال تأكيد من السيرفر (message:sent)
```

### 3. استقبال رسالة جديدة
```typescript
// عند استقبال حدث message:sent من WebSocket
onMessageSent: (message) => {
  // تحويل الرسالة إلى صيغة UI
  // إضافتها للمحادثة النشطة
  // تحديث عداد الرسائل غير المقروءة
}
```

### 4. حالة الكتابة
```typescript
// عند الكتابة في حقل الإدخال
handleInputChange: (value) => {
  setInputValue(value)
  wsSendTypingStart(conversationId, displayName)
  
  // بعد 3 ثواني من عدم الكتابة
  setTimeout(() => {
    wsSendTypingStop(conversationId)
  }, 3000)
}
```

### 5. الانضمام للمحادثة
```typescript
// عند تحديد محادثة
handleSelectChat: (chatId) => {
  // مغادرة المحادثة السابقة
  wsLeaveConversation(previousConversationId)
  
  // الانضمام للمحادثة الجديدة
  wsJoinConversation(newConversationId)
  
  // تحميل الرسائل السابقة من REST API
  loadMessages(newConversationId)
}
```

## المميزات المدعومة

### ✅ مدعومة بالكامل
- [x] إرسال واستقبال الرسائل الفورية
- [x] حالة الكتابة (typing indicators)
- [x] الانضمام/مغادرة المحادثات
- [x] إعادة الاتصال التلقائي
- [x] مؤشر حالة الاتصال
- [x] دعم المرفقات (صور، فيديو، ملفات)
- [x] Ping/Pong للحفاظ على الاتصال
- [x] Fallback إلى REST API

### 🚧 قيد التطوير
- [ ] تحديث حالة الرسائل (delivered/read) - UI
- [ ] حذف الرسائل عبر WebSocket
- [ ] حالة المستخدم (online/offline) - UI
- [ ] إشعارات الصوت والإشعارات المرئية

## هيكل الرسائل

### إرسال رسالة
```json
{
  "type": "message:send",
  "data": {
    "conversation_id": "uuid",
    "text": "نص الرسالة",
    "attachment": {
      "type": "image",
      "url": "blob:...",
      "name": "photo.jpg"
    }
  }
}
```

### استقبال رسالة
```json
{
  "type": "message:sent",
  "data": {
    "id": "uuid",
    "conversation_id": "uuid",
    "sender_id": "uuid",
    "sender_type": "CLIENT",
    "text": "نص الرسالة",
    "status": "sent",
    "created_at": "2024-01-01T12:00:00Z",
    "sender": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "اسم المستخدم"
    }
  },
  "conversationId": "uuid"
}
```

## معالجة الأخطاء

### 1. انقطاع الاتصال
```typescript
// إعادة الاتصال التلقائي (حتى 5 محاولات)
autoReconnect: true
maxReconnectAttempts: 5
reconnectInterval: 3000 // 3 ثواني
```

### 2. فشل الاتصال
```typescript
// عند فشل الاتصال، يتم:
// 1. عرض مؤشر "غير متصل" في الواجهة
// 2. استخدام REST API كبديل
// 3. محاولة إعادة الاتصال تلقائياً
```

### 3. خطأ في المصادقة
```typescript
onAuthFailed: (error) => {
  console.error('فشلت المصادقة:', error)
  // يمكن إعادة توجيه المستخدم لتسجيل الدخول
}
```

## مؤشرات حالة الاتصال

| الحالة | اللون | الوصف |
|--------|------|-------|
| `connected` | 🟢 أخضر | متصل بنجاح |
| `connecting` | 🟡 أصفر | جاري الاتصال |
| `reconnecting` | 🟠 برتقالي | إعادة الاتصال |
| `disconnected` | 🔴 أحمر | غير متصل |
| `failed` | 🔴 أحمر | فشل الاتصال |

## الاختبار

### 1. اختبار الاتصال الأساسي
```bash
# تشغيل الباك اند
npm run dev:backend

# تشغيل الفرونت اند
npm run dev

# الدخول إلى صفحة الدردشة
# التحقق من ظهور مؤشر أخضر (متصل)
```

### 2. اختبار إرسال الرسائل
1. افتح محادثة
2. اكتب رسالة وأرسلها
3. تحقق من ظهور الرسالة في الواجهة
4. افتح نفس المحادثة من حساب آخر
5. تحقق من استقبال الرسالة فوراً

### 3. اختبار حالة الكتابة
1. افتح محادثة من حسابين مختلفين
2. ابدأ الكتابة من أحد الحسابات
3. تحقق من ظهور "يكتب الآن..." في الحساب الآخر
4. توقف عن الكتابة
5. تحقق من اختفاء المؤشر بعد 3 ثواني

### 4. اختبار إعادة الاتصال
1. قطع اتصال الإنترنت
2. تحقق من تحول المؤشر للون الأحمر
3. أعد الاتصال بالإنترنت
4. تحقق من إعادة الاتصال تلقائياً

## التكوين

### تغيير عنوان WebSocket
في ملف `.env.local`:
```env
# للتطوير المحلي
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# للإنتاج
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

### تخصيص إعدادات الاتصال
في `ChatWidget.tsx`:
```typescript
const { ... } = useWebSocket({
  enabled: true,
  autoReconnect: true,
  maxReconnectAttempts: 5,  // عدد المحاولات
  reconnectInterval: 3000,   // المدة بين المحاولات (ms)
  pingInterval: 30000,       // فترة إرسال ping (ms)
  handlers: { /* ... */ }
})
```

## الأمان

### المصادقة
- يتم إرسال JWT Token مع كل اتصال WebSocket
- Token يتم جلبه من `localStorage.getItem('auth_token')`
- السيرفر يتحقق من صحة Token قبل السماح بالاتصال

### التشفير
- استخدم `wss://` (WebSocket Secure) في الإنتاج
- تأكد من تفعيل SSL/TLS على السيرفر

## الأداء

### تحسينات مطبقة
- ✅ إعادة استخدام اتصال WebSocket الواحد
- ✅ Debouncing لإشارات الكتابة (3 ثواني)
- ✅ تحديث محلي فوري للواجهة (optimistic updates)
- ✅ تحميل الرسائل بشكل paginated

### توصيات
- استخدم CDN لتحميل الصور والملفات المرفقة
- قم بضغط الرسائل الكبيرة قبل الإرسال
- استخدم lazy loading لقائمة المحادثات

## استكشاف الأخطاء

### المشكلة: لا يتصل WebSocket
**الحل:**
1. تحقق من تشغيل الباك اند
2. تحقق من صحة `NEXT_PUBLIC_WS_URL`
3. تحقق من وجود Token في localStorage
4. راجع console للأخطاء

### المشكلة: لا تصل الرسائل
**الحل:**
1. تحقق من حالة الاتصال (المؤشر الأخضر)
2. تحقق من الانضمام للمحادثة
3. راجع network tab في Developer Tools
4. تحقق من logs الباك اند

### المشكلة: الرسائل تظهر مكررة
**الحل:**
1. تحقق من عدم وجود اشتراكات متعددة
2. تأكد من cleanup في useEffect
3. تحقق من فلترة الرسائل المكررة في `onMessageSent`

## المراجع

- [WebSocket Frontend Guide](./websocket-frontend-guide.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [React Hooks Documentation](https://react.dev/reference/react)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## الدعم

إذا واجهت أي مشاكل:
1. راجع console في المتصفح
2. راجع logs الباك اند
3. تحقق من network tab
4. راجع هذا التوثيق والـ WebSocket guide
