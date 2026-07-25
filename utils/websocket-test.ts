/**
 * أداة بسيطة لاختبار اتصال WebSocket يدوياً
 * Simple utility to test WebSocket connection manually
 * 
 * استخدام / Usage:
 * 1. افتح Developer Console
 * 2. استورد هذا الملف أو انسخ الكود
 * 3. قم بتشغيل testWebSocketConnection()
 */

export async function testWebSocketConnection() {
  console.log('🔍 بدء اختبار WebSocket...')
  
  // 1. التحقق من وجود Token
  const token = localStorage.getItem('auth_token')
  if (!token) {
    console.error('❌ لا يوجد auth_token في localStorage')
    console.log('💡 قم بتسجيل الدخول أولاً')
    return false
  }
  console.log('✅ تم العثور على Token')
  
  // 2. إنشاء اتصال WebSocket
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}/ws/chat?token=${token}`
  console.log('🔌 محاولة الاتصال بـ:', wsUrl)
  
  const ws = new WebSocket(wsUrl)
  
  return new Promise<boolean>((resolve) => {
    let authReceived = false
    let timeout: NodeJS.Timeout
    
    ws.onopen = () => {
      console.log('✅ تم فتح الاتصال')
      
      // إرسال ping للاختبار
      const pingMsg = {
        type: 'ping',
        timestamp: Date.now()
      }
      ws.send(JSON.stringify(pingMsg))
      console.log('📤 تم إرسال ping')
      
      // timeout للتحقق من الاستجابة
      timeout = setTimeout(() => {
        if (!authReceived) {
          console.error('❌ لم يتم استقبال رد المصادقة')
          ws.close()
          resolve(false)
        }
      }, 5000)
    }
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('📨 رسالة واردة:', message)
        
        if (message.type === 'auth:success') {
          console.log('✅ تمت المصادقة بنجاح!')
          authReceived = true
          clearTimeout(timeout)
          
          // إغلاق الاتصال بعد النجاح
          setTimeout(() => {
            ws.close()
            console.log('✅ الاختبار نجح! يمكنك استخدام الدردشة الآن.')
            resolve(true)
          }, 1000)
        } else if (message.type === 'auth:failed') {
          console.error('❌ فشلت المصادقة:', message.error)
          clearTimeout(timeout)
          ws.close()
          resolve(false)
        } else if (message.type === 'pong') {
          console.log('✅ تم استقبال pong - الاتصال يعمل')
        }
      } catch (err) {
        console.error('❌ خطأ في تحليل الرسالة:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('❌ خطأ في WebSocket:', error)
      clearTimeout(timeout)
      resolve(false)
    }
    
    ws.onclose = (event) => {
      console.log('🔌 تم إغلاق الاتصال', event.code, event.reason)
      clearTimeout(timeout)
      
      if (!authReceived) {
        console.error('❌ الاختبار فشل')
        resolve(false)
      }
    }
  })
}

/**
 * اختبار إرسال واستقبال رسالة
 * Test sending and receiving a message
 */
export async function testSendMessage(conversationId: string, text: string = 'اختبار') {
  console.log('🔍 بدء اختبار إرسال رسالة...')
  
  const token = localStorage.getItem('auth_token')
  if (!token) {
    console.error('❌ لا يوجد auth_token')
    return false
  }
  
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}/ws/chat?token=${token}`
  const ws = new WebSocket(wsUrl)
  
  return new Promise<boolean>((resolve) => {
    let messageSent = false
    
    ws.onopen = () => {
      console.log('✅ تم فتح الاتصال')
      
      // الانضمام للمحادثة أولاً
      const joinMsg = {
        type: 'conversation:join',
        data: {
          conversationId: conversationId
        }
      }
      ws.send(JSON.stringify(joinMsg))
      console.log('📤 طلب الانضمام للمحادثة')
      
      // إرسال الرسالة بعد ثانية
      setTimeout(() => {
        const msg = {
          type: 'message:send',
          data: {
            conversation_id: conversationId,
            text: text
          }
        }
        ws.send(JSON.stringify(msg))
        console.log('📤 تم إرسال الرسالة:', text)
      }, 1000)
    }
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('📨 رسالة واردة:', message)
        
        if (message.type === 'conversation:joined') {
          console.log('✅ تم الانضمام للمحادثة')
        } else if (message.type === 'message:sent') {
          console.log('✅ تم إرسال الرسالة بنجاح!')
          messageSent = true
          
          setTimeout(() => {
            ws.close()
            resolve(true)
          }, 1000)
        }
      } catch (err) {
        console.error('❌ خطأ:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('❌ خطأ في WebSocket:', error)
      resolve(false)
    }
    
    ws.onclose = () => {
      console.log('🔌 تم إغلاق الاتصال')
      
      if (messageSent) {
        console.log('✅ الاختبار نجح!')
      } else {
        console.error('❌ الاختبار فشل')
      }
      
      resolve(messageSent)
    }
  })
}

/**
 * فحص سريع للمتطلبات
 * Quick requirements check
 */
export function checkRequirements() {
  console.log('🔍 فحص المتطلبات...')
  
  const checks = {
    webSocketSupport: typeof WebSocket !== 'undefined',
    token: !!localStorage.getItem('auth_token'),
    wsUrl: !!process.env.NEXT_PUBLIC_WS_URL
  }
  
  console.table(checks)
  
  if (!checks.webSocketSupport) {
    console.error('❌ المتصفح لا يدعم WebSocket')
  }
  
  if (!checks.token) {
    console.warn('⚠️ لا يوجد auth_token - قم بتسجيل الدخول')
  }
  
  if (!checks.wsUrl) {
    console.warn('⚠️ NEXT_PUBLIC_WS_URL غير محدد - سيتم استخدام القيمة الافتراضية')
  }
  
  return Object.values(checks).every(v => v)
}

// تصدير للاستخدام في console
if (typeof window !== 'undefined') {
  (window as any).testWS = {
    checkRequirements,
    testConnection: testWebSocketConnection,
    testSendMessage
  }
  
  console.log(`
💬 أدوات اختبار WebSocket متاحة!
WebSocket test utilities available!

الأوامر المتاحة / Available commands:
  testWS.checkRequirements()              - فحص المتطلبات
  testWS.testConnection()                 - اختبار الاتصال
  testWS.testSendMessage(conversationId)  - اختبار إرسال رسالة

مثال / Example:
  await testWS.testConnection()
  `)
}
