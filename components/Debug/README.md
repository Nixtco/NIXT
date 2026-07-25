# Debug Components

## 🎯 المكونات المتاحة

### 1. QuickAuthFix
مكون إصلاح تلقائي يظهر عندما يكتشف مشكلة في التوكن

**الاستخدام:**
```tsx
import { QuickAuthFix } from '@/components/Debug'

export default function YourPage() {
  return (
    <>
      {/* Your content */}
      
      {/* فقط في Development */}
      {process.env.NODE_ENV === 'development' && <QuickAuthFix />}
    </>
  )
}
```

**الميزات:**
- ✅ اكتشاف تلقائي للمشكلة
- ✅ إصلاح بنقرة واحدة
- ✅ إعادة تحميل تلقائية
- ✅ تصميم جميل ومتحرك
- ✅ لا يظهر إذا لم تكن هناك مشكلة

---

### 2. AuthStatus
مكون عرض حالة المصادقة الكاملة مع اختبارات

**الاستخدام البسيط:**
```tsx
import { AuthStatus } from '@/components/Debug'

export default function YourPage() {
  return (
    <>
      {/* Your content */}
      <AuthStatus />
    </>
  )
}
```

**الاستخدام المتقدم:**
```tsx
<AuthStatus 
  showDetails={true}   // عرض التفاصيل مباشرة
  autoTest={true}      // تشغيل الاختبارات تلقائياً
/>
```

**الميزات:**
- ✅ عرض مبسط أو مفصل
- ✅ معلومات المستخدم والدور
- ✅ صلاحية التوكن
- ✅ اختبار API و WebSocket
- ✅ عرض الصلاحيات
- ✅ Dark mode support

---

## 🚀 الاستخدام الموصى به

### في Development Mode

#### في Layout (جميع الصفحات):
```tsx
// app/layout.tsx
import { QuickAuthFix } from '@/components/Debug'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        
        {/* إصلاح تلقائي في Development فقط */}
        {process.env.NODE_ENV === 'development' && <QuickAuthFix />}
      </body>
    </html>
  )
}
```

#### في صفحات محددة:
```tsx
// app/dashboard/page.tsx
import { AuthStatus } from '@/components/Debug'

export default function DashboardPage() {
  return (
    <div>
      {/* Your dashboard */}
      
      {/* Debug في Development فقط */}
      {process.env.NODE_ENV === 'development' && (
        <AuthStatus showDetails={false} />
      )}
    </div>
  )
}
```

---

## 🎨 التخصيص

### QuickAuthFix
تعديل الألوان والأنماط:
```tsx
// يمكنك نسخ الكود وتعديل inline styles في:
// components/Debug/QuickAuthFix.tsx
```

### AuthStatus
تعديل CSS:
```css
/* components/Debug/AuthStatus.module.css */
.container {
  /* Your custom styles */
}
```

---

## 🔌 API Reference

### QuickAuthFix Props
لا يوجد props - يعمل تلقائياً

### AuthStatus Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showDetails` | `boolean` | `false` | عرض التفاصيل مباشرة |
| `autoTest` | `boolean` | `false` | تشغيل الاختبارات تلقائياً |

---

## 📦 Dependencies

لا يوجد dependencies إضافية - يستخدم:
- React hooks (built-in)
- `@/utils/authDebug` (included)
- `@/lib/auth-context` (existing)

---

## 🧪 Testing

### Manual Testing

1. **Test QuickAuthFix:**
```javascript
// في Console
localStorage.removeItem('auth_token')
// يجب أن يظهر المكون تلقائياً
```

2. **Test AuthStatus:**
```javascript
// في Console
localStorage.removeItem('token')
// يجب أن يظهر "Not Authenticated"
```

### Unit Tests (Optional)

```typescript
// __tests__/QuickAuthFix.test.tsx
import { render, screen } from '@testing-library/react'
import QuickAuthFix from '@/components/Debug/QuickAuthFix'

describe('QuickAuthFix', () => {
  it('shows when token mismatch detected', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.removeItem('auth_token')
    
    render(<QuickAuthFix />)
    expect(screen.getByText(/Authentication Issue/i)).toBeInTheDocument()
  })
  
  it('hides when no issue', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('auth_token', 'test-token')
    
    const { container } = render(<QuickAuthFix />)
    expect(container.firstChild).toBeNull()
  })
})
```

---

## 💡 Tips & Tricks

### 1. استخدام مع Feature Flags
```tsx
const ENABLE_DEBUG = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'

{ENABLE_DEBUG && <QuickAuthFix />}
```

### 2. استخدام مع Keyboard Shortcuts
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl + Shift + D = Toggle Debug
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      setShowDebug(prev => !prev)
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

### 3. استخدام مع URL Parameters
```tsx
const searchParams = useSearchParams()
const showDebug = searchParams.get('debug') === 'true'

{showDebug && <AuthStatus showDetails={true} autoTest={true} />}
// Usage: http://localhost:3000?debug=true
```

---

## 🐛 Troubleshooting

### المكون لا يظهر

**Problem:** QuickAuthFix لا يظهر رغم وجود مشكلة

**Solution:**
```javascript
// تحقق من Console
console.log('token:', localStorage.getItem('token'))
console.log('auth_token:', localStorage.getItem('auth_token'))

// إذا كانا موجودين ومتطابقين، لا توجد مشكلة
```

---

### Styling Issues

**Problem:** الـ styles لا تظهر بشكل صحيح

**Solution:**
```tsx
// تأكد من import CSS Module
import styles from './AuthStatus.module.css'

// أو استخدام inline styles (كما في QuickAuthFix)
```

---

## 📚 Resources

- [Auth Debug Utils Documentation](../../utils/authDebug.ts)
- [Debug Auth Page](../../app/debug-auth/page.tsx)
- [Quick Fix Guide](../../QUICK-FIX-GUIDE.md)
- [Troubleshooting Guide](../../TROUBLESHOOTING.md)

---

## 🎉 Next Steps

بعد إضافة هذه المكونات:

1. ✅ اختبر في Development
2. ✅ تأكد من عدم ظهورها في Production
3. ✅ راجع Console للأخطاء
4. ✅ شارك مع الفريق

---

**Last Updated:** 2026-07-24  
**Version:** 1.0.0
