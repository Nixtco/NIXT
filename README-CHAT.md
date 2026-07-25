# 💬 دليل الدردشة السريع

## التشغيل السريع

### 1. تشغيل الباك اند
```bash
# تأكد من أن الباك اند يعمل على المنفذ 8080
# راجع توثيق الباك اند للتفاصيل
```

### 2. تشغيل الفرونت اند
```bash
npm install
npm run dev
```

### 3. الوصول للدردشة
- **للعملاء:** `/dashboard` → افتح أي مشروع → أيقونة الدردشة
- **للمديرين:** `/controllers` → تبويب الرسائل

## حالة الاتصال

| المؤشر | المعنى |
|--------|---------|
| 🟢 | متصل بـ WebSocket |
| 🟡 | جاري الاتصال... |
| 🟠 | إعادة الاتصال... |
| 🔴 | غير متصل (يستخدم REST API) |

## المميزات المدعومة

✅ **متوفرة:**
- إرسال واستقبال الرسائل فوراً
- حالة الكتابة "يكتب الآن..."
- مؤشرات الحالة (✓ مرسل، ✓✓ مقروء)
- دعم الصور والفيديو والملفات
- إعادة الاتصال التلقائي
- Fallback إلى REST API عند الانقطاع

🚧 **قريباً:**
- حالة الاتصال (Online/Offline)
- الإشعارات الصوتية
- حذف الرسائل عبر WebSocket

## التكوين

### ملف `.env.local`
```env
# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# للإنتاج (مع SSL)
# NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## استكشاف الأخطاء

### لا يتصل WebSocket؟
1. تحقق من تشغيل الباك اند على المنفذ 8080
2. تحقق من وجود Token في localStorage
3. افتح Developer Tools → Console للأخطاء

### لا تصل الرسائل؟
1. تحقق من المؤشر الأخضر (متصل)
2. أعد تحميل الصفحة
3. تحقق من Network tab → WS

### الرسائل مكررة؟
1. أعد تحميل الصفحة
2. افحص console للأخطاء
3. تحقق من عدم وجود جلسات متعددة

## الملفات الرئيسية

```
hooks/
  └── useWebSocket.ts          # Hook إدارة WebSocket

components/UI/
  └── ChatWidget.tsx           # مكون الدردشة

app/messages/
  └── apiFunctions.ts          # REST API للدردشة

docs/
  ├── websocket-frontend-guide.md  # التوثيق الكامل
  └── chat-integration.md          # شرح التكامل
```

## التوثيق الكامل

- [دليل WebSocket الشامل](docs/websocket-frontend-guide.md)
- [شرح التكامل](docs/chat-integration.md)
- [API Documentation](API_DOCUMENTATION.md)

## الدعم

للمشاكل أو الأسئلة، راجع:
1. Console في المتصفح
2. Network tab → WS
3. logs الباك اند
4. التوثيق في مجلد `docs/`
