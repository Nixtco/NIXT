# 📡 دليل استخدام WebSocket للفرونت اند

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الاتصال بالسيرفر](#الاتصال-بالسيرفر)
3. [المصادقة (Authentication)](#المصادقة-authentication)
4. [أنواع الرسائل والأحداث](#أنواع-الرسائل-والأحداث)
5. [إرسال الرسائل](#إرسال-الرسائل)
6. [استقبال الأحداث](#استقبال-الأحداث)
7. [إدارة المحادثات](#إدارة-المحادثات)
8. [حالة الكتابة](#حالة-الكتابة)
9. [حالة المستخدم (Online/Offline)](#حالة-المستخدم-onlineoffline)
10. [معالجة الأخطاء](#معالجة-الأخطاء)

---

## نظرة عامة

يوفر نظام WebSocket الخاص بالباك اند اتصال ثنائي الاتجاه في الوقت الفعلي لميزة الدردشة. يتم استخدام مكتبة `uWebSockets.js` لتوفير أداء عالي وموثوقية.

### المميزات الرئيسية

- ✅ مصادقة آمنة باستخدام JWT
- ✅ إرسال واستقبال الرسائل الفورية
- ✅ حالة الكتابة (Typing indicators)
- ✅ حالة الاتصال (Online/Offline status)
- ✅ إدارة المحادثات المتعددة
- ✅ تحديث حالة الرسائل (تم الإرسال، التوصيل، القراءة)
- ✅ حذف الرسائل
- ✅ Ping/Pong للحفاظ على الاتصال

### معلومات الاتصال

```
WebSocket URL: ws://localhost:8080/ws/chat
Production URL: wss://localhost:8080/ws/chat (آمن مع SSL)
API_URL: http://localhost:3003/api/v1
```

---

## الاتصال بالسيرفر

### 1. إنشاء الاتصال

```javascript
// الحصول على JWT Token (من تسجيل الدخول)
const token = localStorage.getItem('auth_token');

// إنشاء اتصال WebSocket مع Token في Query String
const wsUrl = `ws://localhost:8080/ws/chat?token=${token}`;
const socket = new WebSocket(wsUrl);

// أو يمكن إرسال Token عبر Headers (في بعض المكتبات)
// لكن في الويب الأصلي، Query String هو الطريقة المفضلة
```

### 2. التعامل مع أحداث الاتصال

```javascript
// عند نجاح الاتصال
socket.onopen = () => {
  console.log('✅ تم الاتصال بنجاح');
  updateUIConnectionStatus('connected');
};

// عند استقبال رسالة
socket.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    handleIncomingMessage(message);
  } catch (error) {
    console.error('خطأ في تحليل الرسالة:', error);
  }
};

// عند إغلاق الاتصال
socket.onclose = (event) => {
  console.log('❌ تم قطع الاتصال', event.code, event.reason);
  updateUIConnectionStatus('disconnected');
  
  // محاولة إعادة الاتصال بعد 3 ثواني
  setTimeout(() => reconnect(), 3000);
};

// عند حدوث خطأ
socket.onerror = (error) => {
  console.error('❌ خطأ في الاتصال:', error);
  showErrorNotification('حدث خطأ في الاتصال');
};
```

### 3. إعادة الاتصال التلقائي

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function reconnect() {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('فشل إعادة الاتصال بعد عدة محاولات');
    showErrorNotification('فشل الاتصال، يرجى تحديث الصفحة');
    return;
  }
  
  reconnectAttempts++;
  console.log(`محاولة إعادة الاتصال ${reconnectAttempts}/${maxReconnectAttempts}`);
  
  // إنشاء اتصال جديد
  createWebSocketConnection();
}
```

---

## المصادقة (Authentication)

### تدفق المصادقة

1. المستخدم يقوم بتسجيل الدخول عبر REST API
2. يحصل على JWT Token
3. يرسل Token عند الاتصال بـ WebSocket
4. السيرفر يتحقق من صحة Token
5. السيرفر يرسل رسالة `auth:success` عند نجاح المصادقة

### رسالة نجاح المصادقة

```json
{
  "type": "auth:success",
  "data": {
    "userId": "user-uuid-here",
    "role": "user|admin|owner",
    "message": "تم الاتصال بنجاح"
  },
  "timestamp": 1234567890123
}
```

### رسالة فشل المصادقة

```json
{
  "type": "auth:failed",
  "error": "Invalid authentication token",
  "timestamp": 1234567890123
}
```

---

## أنواع الرسائل والأحداث

### جدول أنواع الرسائل الكامل

| النوع | الاتجاه | الوصف |
|------|---------|-------|
| `auth:success` | ← Server | تم المصادقة بنجاح |
| `auth:failed` | ← Server | فشلت المصادقة |
| `message:send` | → Server | إرسال رسالة جديدة |
| `message:sent` | ← Server | تم إرسال رسالة (للجميع) |
| `message:update-status` | → Server | تحديث حالة رسالة |
| `message:delivered` | ← Server | تم توصيل الرسالة |
| `message:read` | ← Server | تم قراءة الرسالة |
| `message:delete` | → Server | حذف رسالة |
| `message:deleted` | ← Server | تم حذف رسالة |
| `typing:start` | → Server | بدأ المستخدم بالكتابة |
| `typing:start` | ← Server | مستخدم آخر يكتب |
| `typing:stop` | → Server | توقف المستخدم عن الكتابة |
| `typing:stop` | ← Server | مستخدم آخر توقف عن الكتابة |
| `user:online` | ← Server | مستخدم اتصل |
| `user:offline` | ← Server | مستخدم قطع الاتصال |
| `conversation:join` | → Server | الانضمام لمحادثة |
| `conversation:joined` | ← Server | تم الانضمام للمحادثة |
| `conversation:leave` | → Server | مغادرة محادثة |
| `conversation:left` | ← Server | تم مغادرة المحادثة |
| `ping` | → Server | فحص الاتصال |
| `pong` | ← Server | رد على Ping |
| `error` | ← Server | رسالة خطأ |

---

## إرسال الرسائل

### 1. إرسال رسالة دردشة جديدة

```javascript
function sendChatMessage(conversationId, messageText) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket غير متصل');
    return;
  }
  
  const message = {
    type: 'message:send',
    data: {
      conversation_id: conversationId,
      text: messageText,
      // اختياري: إرفاق ملف
      // attachment: { url: '...', type: 'image', name: 'photo.jpg' }
    }
  };
  
  socket.send(JSON.stringify(message));
}

// مثال الاستخدام
sendChatMessage('conversation-uuid-123', 'مرحباً! كيف حالك؟');
```

### 2. تحديث حالة الرسالة (قراءة/توصيل)

```javascript
function markMessageAsRead(messageId, conversationId) {
  const message = {
    type: 'message:update-status',
    data: {
      messageId: messageId,
      conversationId: conversationId,
      status: 'read' // أو 'delivered'
    }
  };
  
  socket.send(JSON.stringify(message));
}
```

### 3. حذف رسالة

```javascript
function deleteMessage(messageId, conversationId) {
  const message = {
    type: 'message:delete',
    data: {
      messageId: messageId,
      conversationId: conversationId
    }
  };
  
  socket.send(JSON.stringify(message));
}
```

---

## استقبال الأحداث

### معالج الأحداث الرئيسي

```javascript
function handleIncomingMessage(message) {
  console.log('📨 رسالة واردة:', message);
  
  switch (message.type) {
    // === المصادقة ===
    case 'auth:success':
      handleAuthSuccess(message.data);
      break;
    
    case 'auth:failed':
      handleAuthFailed(message.error);
      break;
    
    // === رسائل الدردشة ===
    case 'message:sent':
      handleNewMessage(message.data, message.conversationId);
      break;
    
    case 'message:delivered':
      handleMessageDelivered(message.data);
      break;
    
    case 'message:read':
      handleMessageRead(message.data);
      break;
    
    case 'message:deleted':
      handleMessageDeleted(message.data);
      break;
    
    // === حالة الكتابة ===
    case 'typing:start':
      handleTypingStart(message.data);
      break;
    
    case 'typing:stop':
      handleTypingStop(message.data);
      break;
    
    // === حالة المستخدم ===
    case 'user:online':
      handleUserOnline(message.data);
      break;
    
    case 'user:offline':
      handleUserOffline(message.data);
      break;
    
    // === المحادثات ===
    case 'conversation:joined':
      handleConversationJoined(message.data, message.conversationId);
      break;
    
    case 'conversation:left':
      handleConversationLeft(message.data, message.conversationId);
      break;
    
    // === أخرى ===
    case 'pong':
      handlePong(message.timestamp);
      break;
    
    case 'error':
      handleError(message.error);
      break;
    
    default:
      console.warn('⚠️ نوع رسالة غير معروف:', message.type);
  }
}
```

### 1. معالجة رسالة جديدة

```javascript
function handleNewMessage(messageData, conversationId) {
  console.log('💬 رسالة جديدة:', messageData);
  
  // هيكل البيانات المستقبلة
  const {
    id,                    // UUID للرسالة
    conversation_id,       // UUID للمحادثة
    sender_id,            // UUID للمرسل
    sender_type,          // 'CLIENT' أو 'ADMIN'
    text,                 // نص الرسالة
    attachment,           // مرفق (إن وجد)
    status,               // 'sent', 'delivered', 'read'
    created_at,           // تاريخ الإنشاء
    sender                // معلومات المرسل
  } = messageData;
  
  // معلومات المرسل (إن وجدت)
  if (sender) {
    const {
      id,
      email,
      display_name,
      first_name,
      last_name,
      avatar_url
    } = sender;
  }
  
  // إضافة الرسالة للواجهة
  addMessageToUI({
    id: id,
    text: text,
    senderName: sender?.display_name || sender?.email || 'مستخدم',
    senderAvatar: sender?.avatar_url,
    timestamp: new Date(created_at),
    isOwnMessage: sender_id === currentUserId,
    status: status
  });
  
  // تحديث قائمة المحادثات
  updateConversationLastMessage(conversation_id, text, created_at);
  
  // إظهار إشعار (إذا لم تكن المحادثة مفتوحة)
  if (currentConversationId !== conversation_id) {
    showNotification('رسالة جديدة', text, sender?.display_name);
  }
  
  // تشغيل صوت الإشعار
  playNotificationSound();
}
```

### 2. معالجة حالة الرسالة

```javascript
function handleMessageDelivered(data) {
  const { messageId, conversationId, status } = data;
  
  // تحديث أيقونة الحالة في UI
  updateMessageStatus(messageId, 'delivered'); // ✓
}

function handleMessageRead(data) {
  const { messageId, conversationId, status, read_at } = data;
  
  // تحديث أيقونة الحالة في UI
  updateMessageStatus(messageId, 'read'); // ✓✓
}
```

### 3. معالجة حذف الرسالة

```javascript
function handleMessageDeleted(data) {
  const { messageId, conversationId } = data;
  
  // إزالة الرسالة من UI
  removeMessageFromUI(messageId);
  
  // أو استبدالها برسالة "تم حذف هذه الرسالة"
  replaceMessageWithDeletedPlaceholder(messageId);
}
```

---

## إدارة المحادثات

### 1. الانضمام لمحادثة

**مهم جداً**: يجب الانضمام لمحادثة قبل إرسال أو استقبال رسائل منها.

```javascript
function joinConversation(conversationId) {
  const message = {
    type: 'conversation:join',
    data: {
      conversationId: conversationId
    }
  };
  
  socket.send(JSON.stringify(message));
}

// معالجة تأكيد الانضمام
function handleConversationJoined(data, conversationId) {
  console.log(`✅ تم الانضمام للمحادثة: ${conversationId}`);
  
  // تحديث حالة UI
  currentConversationId = conversationId;
  
  // تحميل الرسائل السابقة عبر REST API
  loadPreviousMessages(conversationId);
}
```

### 2. مغادرة محادثة

```javascript
function leaveConversation(conversationId) {
  const message = {
    type: 'conversation:leave',
    data: {
      conversationId: conversationId
    }
  };
  
  socket.send(JSON.stringify(message));
}

// معالجة تأكيد المغادرة
function handleConversationLeft(data, conversationId) {
  console.log(`👋 تم مغادرة المحادثة: ${conversationId}`);
  
  // تحديث حالة UI
  if (currentConversationId === conversationId) {
    currentConversationId = null;
  }
}
```

### 3. إنشاء أو جلب محادثة (عبر REST API ثم WebSocket)

```javascript
async function startConversationWithUser(otherUserId) {
  try {
    // 1. إنشاء أو جلب المحادثة عبر REST API
    const response = await fetch(`${API_URL}/conversations/get-or-create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        other_user_id: otherUserId,
        type: 'general'
      })
    });
    
    const result = await response.json();
    const conversationId = result.data.id;
    
    // 2. الانضمام للمحادثة عبر WebSocket
    joinConversation(conversationId);
    
    return conversationId;
    
  } catch (error) {
    console.error('خطأ في إنشاء المحادثة:', error);
    throw error;
  }
}
```

---

## حالة الكتابة

### 1. إرسال حالة "يكتب الآن"

```javascript
let typingTimeout = null;

function onUserTyping(conversationId, displayName) {
  // إرسال حدث بدء الكتابة
  socket.send(JSON.stringify({
    type: 'typing:start',
    data: {
      conversationId: conversationId,
      displayName: displayName
    }
  }));
  
  // إلغاء المؤقت السابق
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  
  // إرسال حدث إيقاف الكتابة بعد 3 ثواني من عدم الكتابة
  typingTimeout = setTimeout(() => {
    socket.send(JSON.stringify({
      type: 'typing:stop',
      data: {
        conversationId: conversationId
      }
    }));
  }, 3000);
}

// مثال الاستخدام مع input field
const messageInput = document.getElementById('messageInput');
messageInput.addEventListener('input', () => {
  if (currentConversationId) {
    onUserTyping(currentConversationId, currentUserDisplayName);
  }
});
```

### 2. استقبال حالة الكتابة

```javascript
function handleTypingStart(data) {
  const { conversationId, userId, displayName } = data;
  
  // إظهار مؤشر الكتابة في UI
  showTypingIndicator(conversationId, displayName || userId);
}

function handleTypingStop(data) {
  const { conversationId, userId } = data;
  
  // إخفاء مؤشر الكتابة
  hideTypingIndicator(conversationId, userId);
}

// مثال UI للمؤشر
function showTypingIndicator(conversationId, userName) {
  const indicator = document.getElementById('typingIndicator');
  if (indicator && currentConversationId === conversationId) {
    indicator.textContent = `${userName} يكتب...`;
    indicator.style.display = 'block';
  }
}

function hideTypingIndicator(conversationId, userId) {
  const indicator = document.getElementById('typingIndicator');
  if (indicator && currentConversationId === conversationId) {
    indicator.style.display = 'none';
  }
}
```

---

## حالة المستخدم (Online/Offline)

### استقبال أحداث الاتصال

```javascript
function handleUserOnline(data) {
  const { userId, status, timestamp } = data;
  
  console.log(`🟢 المستخدم ${userId} متصل الآن`);
  
  // تحديث حالة المستخدم في قائمة المحادثات
  updateUserOnlineStatus(userId, true);
  
  // إظهار نقطة خضراء بجانب اسم المستخدم
  const userElement = document.querySelector(`[data-user-id="${userId}"]`);
  if (userElement) {
    userElement.classList.add('online');
    userElement.classList.remove('offline');
  }
}

function handleUserOffline(data) {
  const { userId, status, timestamp } = data;
  
  console.log(`🔴 المستخدم ${userId} غير متصل`);
  
  // تحديث حالة المستخدم في قائمة المحادثات
  updateUserOnlineStatus(userId, false);
  
  // إظهار نقطة رمادية بجانب اسم المستخدم
  const userElement = document.querySelector(`[data-user-id="${userId}"]`);
  if (userElement) {
    userElement.classList.add('offline');
    userElement.classList.remove('online');
  }
}
```

---

## معالجة الأخطاء

### استقبال رسائل الخطأ

```javascript
function handleError(errorMessage) {
  console.error('❌ خطأ من السيرفر:', errorMessage);
  
  // إظهار رسالة خطأ للمستخدم
  showErrorNotification(errorMessage);
  
  // معالجة أنواع محددة من الأخطاء
  if (errorMessage.includes('غير مصرح')) {
    // إعادة توجيه لصفحة تسجيل الدخول
    handleUnauthorized();
  }
}

function handleUnauthorized() {
  // إغلاق الاتصال
  if (socket) {
    socket.close();
  }
  
  // مسح البيانات المحلية
  localStorage.removeItem('auth_token');
  
  // إعادة التوجيه
  window.location.href = '/login';
}
```