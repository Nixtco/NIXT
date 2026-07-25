# 🚀 البدء السريع - نظام الدردشة
# Quick Start - Chat System

## ⚡ 3 خطوات للبدء

### 1️⃣ تأكد من الإعدادات
```bash
# نسخ ملف البيئة
cp .env.example .env.local

# تحرير القيم
# NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### 2️⃣ شغل التطبيق
```bash
# تثبيت التبعيات (إذا لم تكن مثبتة)
npm install

# تشغيل
npm run dev
```

### 3️⃣ اختبر الدردشة
1. افتح http://localhost:3000
2. سجل الدخول
3. افتح الدردشة
4. تحقق من المؤشر الأخضر 🟢

---

## 🧪 اختبار سريع

افتح **Browser Console** واكتب:

```javascript
// اختبار الاتصال
await testWS.testConnection()

// النتيجة المتوقعة:
// ✅ تم الاتصال بـ WebSocket بنجاح
// ✅ تمت المصادقة بنجاح
```

---

## 🟢 المؤشرات

| المؤشر | المعنى |
|--------|---------|
| 🟢 | متصل - كل شيء يعمل! |
| 🟡 | جاري الاتصال... |
| 🟠 | إعادة الاتصال... |
| 🔴 | غير متصل |

---

## 📚 التوثيق الكامل

- **[README-CHAT.md](README-CHAT.md)** - دليل سريع
- **[INSTALLATION-CHECKLIST.md](INSTALLATION-CHECKLIST.md)** - قائمة تحقق شاملة
- **[docs/chat-integration.md](docs/chat-integration.md)** - شرح تفصيلي
- **[WEBSOCKET-INTEGRATION-SUMMARY.md](WEBSOCKET-INTEGRATION-SUMMARY.md)** - ملخص كامل

---

## ❓ المشاكل الشائعة

### المؤشر أحمر 🔴
```bash
# تحقق من تشغيل الباك اند
curl http://localhost:8080/health

# تحقق من Token
# في Browser Console:
localStorage.getItem('auth_token')
```

### لا توجد رسائل
1. أعد تحميل الصفحة
2. تحقق من Console للأخطاء
3. راجع [README-CHAT.md](README-CHAT.md) → استكشاف الأخطاء

---

## 💡 نصائح

✅ **افتح Developer Console دائماً** - لمتابعة الأحداث  
✅ **استخدم `testWS`** - للاختبار السريع  
✅ **راجع Network Tab → WS** - لمراقبة الاتصال  

---

**جاهز؟** ابدأ باستخدام الدردشة الآن! 🎉
