'use client'

import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function PrivacyPolicy() {
  const { t, language, dir } = useLanguage()
  const { scrollToSection } = useSmoothScroll()

  const content = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: 9 مايو 2026',
      intro: 'نحن في شركة NIXT Group ("نحن" أو "الشركة") نقدر خصوصيتك ونلتزم بحماية معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقعنا الإلكتروني وخدماتنا.',
      sections: [
        {
          title: 'المعلومات التي نجمعها',
          content: [
            'المعلومات التي تقدمها طوعاً: الاسم، البريد الإلكتروني، رقم الهاتف، معلومات الاتصال الأخرى.',
            'معلومات الحساب: عند التسجيل أو تسجيل الدخول عبر Google OAuth.',
            'معلومات الدفع: من خلال Stripe للاشتراكات والمدفوعات.',
            'معلومات الاستخدام: كيفية تفاعلك مع موقعنا، الصفحات التي تزورها، الوقت المقضي.',
            'معلومات الجهاز: نوع المتصفح، نظام التشغيل، عنوان IP.'
          ]
        },
        {
          title: 'كيف نستخدم معلوماتك',
          content: [
            'تقديم وتحسين خدماتنا',
            'معالجة المدفوعات والاشتراكات',
            'إرسال تحديثات وإشعارات مهمة',
            'تحليل استخدام الموقع لتحسين الخدمة',
            'الامتثال للمتطلبات القانونية'
          ]
        },
        {
          title: 'مشاركة المعلومات',
          content: [
            'لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة.',
            'نشارك المعلومات مع مقدمي الخدمات الموثوقين (مثل Stripe، Google) فقط لتقديم الخدمات.',
            'قد نكشف المعلومات عند الحاجة للامتثال للقوانين أو حماية حقوقنا.'
          ]
        },
        {
          title: 'أمان البيانات',
          content: [
            'نستخدم تشفير SSL لنقل البيانات',
            'نخزن البيانات بشكل آمن مع تشفير كلمات المرور',
            'نحد من الوصول إلى البيانات للموظفين المصرح لهم فقط',
            'نراجع أنظمة الأمان بانتظام'
          ]
        },
        {
          title: 'حقوقك',
          content: [
            'الوصول إلى معلوماتك الشخصية',
            'تصحيح أو تحديث معلوماتك',
            'حذف حسابك ومعلوماتك',
            'إلغاء الاشتراك من الرسائل الترويجية',
            'تقديم شكوى إذا كنت تعتقد أن خصوصيتك انتهكت'
          ]
        },
        {
          title: 'ملفات تعريف الارتباط (Cookies)',
          content: [
            'نستخدم ملفات تعريف الارتباط لتحسين تجربتك',
            'تخزين تفضيلات اللغة والثيم',
            'تتبع الجلسات للمصادقة',
            'تحليل استخدام الموقع (اختياري)'
          ]
        },
        {
          title: 'الاحتفاظ بالبيانات',
          content: [
            'نحتفظ بمعلوماتك طالما كان حسابك نشطاً',
            'قد نحتفظ ببعض البيانات للامتثال للقوانين',
            'نحذف البيانات غير الضرورية بانتظام'
          ]
        },
        {
          title: 'التحديثات',
          content: [
            'قد نحدث سياسة الخصوصية هذه',
            'سنخطرك بالتغييرات المهمة',
            'استمرار استخدامك للموقع يعني موافقتك على التحديثات'
          ]
        },
        {
          title: 'اتصل بنا',
          content: [
            'إذا كان لديك أسئلة حول سياسة الخصوصية، يرجى التواصل معنا:',
            'البريد الإلكتروني: nixtwork@outlook.com',

          ]
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: May 9, 2026',
      intro: 'At NIXT Group ("we" or "the Company"), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.',
      sections: [
        {
          title: 'Information We Collect',
          content: [
            'Information you voluntarily provide: Name, email, phone number, other contact details.',
            'Account information: When registering or logging in via Google OAuth.',
            'Payment information: Through Stripe for subscriptions and payments.',
            'Usage information: How you interact with our site, pages visited, time spent.',
            'Device information: Browser type, operating system, IP address.'
          ]
        },
        {
          title: 'How We Use Your Information',
          content: [
            'Provide and improve our services',
            'Process payments and subscriptions',
            'Send important updates and notifications',
            'Analyze site usage to improve service',
            'Comply with legal requirements'
          ]
        },
        {
          title: 'Information Sharing',
          content: [
            'We do not sell or rent your personal information to third parties.',
            'We share information with trusted service providers (like Stripe, Google) only to provide services.',
            'We may disclose information when required to comply with laws or protect our rights.'
          ]
        },
        {
          title: 'Data Security',
          content: [
            'We use SSL encryption for data transmission',
            'We store data securely with password encryption',
            'We limit access to data to authorized personnel only',
            'We regularly review security systems'
          ]
        },
        {
          title: 'Your Rights',
          content: [
            'Access your personal information',
            'Correct or update your information',
            'Delete your account and information',
            'Unsubscribe from promotional messages',
            'File a complaint if you believe your privacy has been violated'
          ]
        },
        {
          title: 'Cookies',
          content: [
            'We use cookies to improve your experience',
            'Store language and theme preferences',
            'Track sessions for authentication',
            'Analyze site usage (optional)'
          ]
        },
        {
          title: 'Data Retention',
          content: [
            'We retain your information as long as your account is active',
            'We may retain some data for legal compliance',
            'We regularly delete unnecessary data'
          ]
        },
        {
          title: 'Updates',
          content: [
            'We may update this Privacy Policy',
            'We will notify you of important changes',
            'Continued use of the site means you agree to updates'
          ]
        },
        {
          title: 'Contact Us',
          content: [
            'If you have questions about this Privacy Policy, please contact us:',
            'Email: nixtwork@outlook.com',
          ]
        }
      ]
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-background">
      <Header onSmoothScroll={scrollToSection} />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className={`prose prose-lg max-w-none ${dir === 'rtl' ? 'prose-rtl' : ''}`}>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {currentContent.title}
          </h1>
          <p className="text-muted-foreground mb-8">
            {currentContent.lastUpdated}
          </p>

          <div className="mb-8">
            <p className="text-lg leading-relaxed">
              {currentContent.intro}
            </p>
          </div>

          {currentContent.sections.map((section, index) => (
            <section key={index} className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-muted-foreground leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}