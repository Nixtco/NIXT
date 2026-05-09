'use client'

import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function CookiePolicy() {
  const { t, language, dir } = useLanguage()
  const { scrollToSection } = useSmoothScroll()

  const content = {
    ar: {
      title: 'سياسة ملفات تعريف الارتباط',
      lastUpdated: 'آخر تحديث: 9 مايو 2026',
      intro: 'نستخدم ملفات تعريف الارتباط (Cookies) وتقنيات مشابهة لتحسين تجربتك على موقعنا. توضح هذه السياسة كيف نستخدم ملفات تعريف الارتباط وكيف يمكنك التحكم فيها.',
      sections: [
        {
          title: 'ما هي ملفات تعريف الارتباط؟',
          content: [
            'ملفات تعريف الارتباط هي ملفات نصية صغيرة تحفظ على جهازك',
            'تساعد في تذكر تفضيلاتك وتحسين أداء الموقع',
            'يمكن أن تكون مؤقتة (جلسة واحدة) أو دائمة'
          ]
        },
        {
          title: 'أنواع ملفات تعريف الارتباط التي نستخدمها',
          content: [
            'ملفات تعريف الارتباط الأساسية: ضرورية لعمل الموقع',
            'ملفات تعريف الارتباط الوظيفية: تحفظ تفضيلاتك (اللغة، الثيم)',
            'ملفات تعريف الارتباط التحليلية: تساعدنا في فهم كيفية استخدام الموقع',
            'ملفات تعريف الارتباط التسويقية: لعرض إعلانات مخصصة'
          ]
        },
        {
          title: 'كيف نستخدم ملفات تعريف الارتباط',
          content: [
            'الحفاظ على جلسة تسجيل الدخول',
            'تذكر تفضيلات اللغة والمظهر',
            'تحليل حركة الموقع وأدائه',
            'تحسين تجربة المستخدم',
            'عرض محتوى مخصص'
          ]
        },
        {
          title: 'ملفات تعريف الارتباط من أطراف ثالثة',
          content: [
            'Google Analytics: لتحليل استخدام الموقع',
            'Stripe: لمعالجة المدفوعات',
            'Google OAuth: لتسجيل الدخول',
            'Tawk.to: للدردشة المباشرة'
          ]
        },
        {
          title: 'إدارة ملفات تعريف الارتباط',
          content: [
            'يمكنك تعطيل ملفات تعريف الارتباط من إعدادات المتصفح',
            'تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف الموقع',
            'نحن نحترم اختياراتك ونلتزم بالقوانين المعمول بها'
          ]
        },
        {
          title: 'موافقتك',
          content: [
            'باستمرار استخدامك للموقع، فإنك توافق على استخدام ملفات تعريف الارتباط',
            'يمكنك سحب موافقتك في أي وقت',
            'سنخطرك بأي تغييرات على سياسة ملفات تعريف الارتباط'
          ]
        },
        {
          title: 'الاحتفاظ بملفات تعريف الارتباط',
          content: [
            'ملفات تعريف الارتباط المؤقتة تحذف عند إغلاق المتصفح',
            'ملفات تعريف الارتباط الدائمة تبقى لفترة محددة',
            'يمكن حذف جميع ملفات تعريف الارتباط يدوياً'
          ]
        },
        {
          title: 'الخصوصية والأمان',
          content: [
            'ملفات تعريف الارتباط لا تحتوي على معلومات شخصية حساسة',
            'نستخدم تشفير SSL لحماية البيانات المرسلة',
            'نتبع أفضل الممارسات لأمان البيانات'
          ]
        },
        {
          title: 'التحديثات',
          content: [
            'قد نحدث سياسة ملفات تعريف الارتباط',
            'سننشر التغييرات على هذه الصفحة',
            'التحديثات تصبح سارية فور نشرها'
          ]
        },
        {
          title: 'اتصل بنا',
          content: [
            'للاستفسارات حول ملفات تعريف الارتباط: nixtwork@outlook.com',
 
          ]
        }
      ]
    },
    en: {
      title: 'Cookie Policy',
      lastUpdated: 'Last Updated: May 9, 2026',
      intro: 'We use cookies and similar technologies to improve your experience on our website. This policy explains how we use cookies and how you can control them.',
      sections: [
        {
          title: 'What are Cookies?',
          content: [
            'Cookies are small text files saved on your device',
            'They help remember your preferences and improve site performance',
            'They can be temporary (one session) or permanent'
          ]
        },
        {
          title: 'Types of Cookies We Use',
          content: [
            'Essential cookies: Necessary for the website to function',
            'Functional cookies: Save your preferences (language, theme)',
            'Analytics cookies: Help us understand how the site is used',
            'Marketing cookies: For displaying personalized ads'
          ]
        },
        {
          title: 'How We Use Cookies',
          content: [
            'Maintain login sessions',
            'Remember language and appearance preferences',
            'Analyze site traffic and performance',
            'Improve user experience',
            'Display personalized content'
          ]
        },
        {
          title: 'Third-Party Cookies',
          content: [
            'Google Analytics: For site usage analysis',
            'Stripe: For payment processing',
            'Google OAuth: For login',
            'Tawk.to: For live chat'
          ]
        },
        {
          title: 'Managing Cookies',
          content: [
            'You can disable cookies from your browser settings',
            'Disabling some cookies may affect site functionality',
            'We respect your choices and comply with applicable laws'
          ]
        },
        {
          title: 'Your Consent',
          content: [
            'By continuing to use the site, you consent to cookie use',
            'You can withdraw consent at any time',
            'We will notify you of any changes to cookie policy'
          ]
        },
        {
          title: 'Cookie Retention',
          content: [
            'Temporary cookies are deleted when browser is closed',
            'Permanent cookies remain for a specified period',
            'All cookies can be manually deleted'
          ]
        },
        {
          title: 'Privacy and Security',
          content: [
            'Cookies do not contain sensitive personal information',
            'We use SSL encryption to protect transmitted data',
            'We follow best practices for data security'
          ]
        },
        {
          title: 'Updates',
          content: [
            'We may update the cookie policy',
            'Changes will be posted on this page',
            'Updates become effective upon posting'
          ]
        },
        {
          title: 'Contact Us',
          content: [
            'For cookie inquiries: nixtwork@outlook.com',
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