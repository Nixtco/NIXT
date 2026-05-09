'use client'

import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function TermsOfService() {
  const { t, language, dir } = useLanguage()
  const { scrollToSection } = useSmoothScroll()

  const content = {
    ar: {
      title: 'شروط الخدمة',
      lastUpdated: 'آخر تحديث: 9 مايو 2026',
      intro: 'مرحباً بك في موقع NIXT Group. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بشروط الخدمة هذه. يرجى قراءتها بعناية قبل استخدام خدماتنا.',
      sections: [
        {
          title: 'قبول الشروط',
          content: [
            'باستخدامك لموقعنا، فإنك توافق على الالتزام بهذه الشروط',
            'إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع',
            'نحتفظ بالحق في تحديث هذه الشروط في أي وقت'
          ]
        },
        {
          title: 'وصف الخدمة',
          content: [
            'نقدم خدمات تطوير البرمجيات والحلول الرقمية',
            'تشمل خدماتنا تطوير المواقع، التطبيقات، والأنظمة المتكاملة',
            'قد تتطلب بعض الخدمات اشتراكاً مدفوعاً'
          ]
        },
        {
          title: 'حساب المستخدم',
          content: [
            'يجب تقديم معلومات دقيقة عند التسجيل',
            'أنت مسؤول عن الحفاظ على سرية كلمة المرور',
            'يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك',
            'نحتفظ بالحق في تعليق أو إنهاء الحسابات المخالفة'
          ]
        },
        {
          title: 'المدفوعات والاشتراكات',
          content: [
            'تتم معالجة المدفوعات عبر Stripe',
            'الأسعار والخطط عرضة للتغيير',
            'الاشتراكات تتجدد تلقائياً إلا إذا تم إلغاؤها',
            'المبالغ المدفوعة غير قابلة للاسترداد إلا في حالات محددة'
          ]
        },
        {
          title: 'استخدام الموقع',
          content: [
            'يجب استخدام الموقع للأغراض القانونية فقط',
            'ممنوع انتهاك حقوق الملكية الفكرية',
            'ممنوع إرسال محتوى ضار أو غير قانوني',
            'نحتفظ بالحق في مراقبة وإزالة المحتوى المخالف'
          ]
        },
        {
          title: 'الملكية الفكرية',
          content: [
            'جميع المحتويات محمية بحقوق الطبع والنشر',
            'لا يجوز نسخ أو توزيع المحتوى بدون إذن',
            'نمنح ترخيصاً محدوداً لاستخدام الموقع للأغراض الشخصية'
          ]
        },
        {
          title: 'إخلاء المسؤولية',
          content: [
            'الخدمات مقدمة "كما هي" بدون ضمانات',
            'لا نتحمل مسؤولية الأضرار غير المباشرة',
            'قد يحدث انقطاع في الخدمة لأسباب فنية'
          ]
        },
        {
          title: 'الإنهاء',
          content: [
            'يمكن إنهاء الخدمة في أي وقت من الجانبين',
            'نحتفظ بالحق في إنهاء الخدمة لأي سبب',
            'يبقى بعض الشروط سارية حتى بعد الإنهاء'
          ]
        },
        {
          title: 'القانون المطبق',
          content: [
            'تخضع هذه الشروط لقوانين المملكة العربية السعودية',
            'أي نزاع يحل في محاكم المملكة العربية السعودية',
            'نحاول حل النزاعات ودياً أولاً'
          ]
        },
        {
          title: 'اتصل بنا',
          content: [
            'للاستفسارات حول الشروط: legal@nixtgroup.com',
            'الهاتف: +966 XX XXX XXXX'
          ]
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: May 9, 2026',
      intro: 'Welcome to NIXT Group website. By using our website and services, you agree to be bound by these Terms of Service. Please read them carefully before using our services.',
      sections: [
        {
          title: 'Acceptance of Terms',
          content: [
            'By using our website, you agree to be bound by these terms',
            'If you do not agree to any of these terms, please do not use the site',
            'We reserve the right to update these terms at any time'
          ]
        },
        {
          title: 'Service Description',
          content: [
            'We provide software development and digital solutions services',
            'Our services include website development, applications, and integrated systems',
            'Some services may require a paid subscription'
          ]
        },
        {
          title: 'User Account',
          content: [
            'You must provide accurate information when registering',
            'You are responsible for maintaining password confidentiality',
            'You must notify us immediately of any unauthorized use of your account',
            'We reserve the right to suspend or terminate violating accounts'
          ]
        },
        {
          title: 'Payments and Subscriptions',
          content: [
            'Payments are processed through Stripe',
            'Prices and plans are subject to change',
            'Subscriptions renew automatically unless canceled',
            'Paid amounts are non-refundable except in specific cases'
          ]
        },
        {
          title: 'Website Usage',
          content: [
            'The website must be used for legal purposes only',
            'Intellectual property rights must not be violated',
            'Sending harmful or illegal content is prohibited',
            'We reserve the right to monitor and remove violating content'
          ]
        },
        {
          title: 'Intellectual Property',
          content: [
            'All content is protected by copyright',
            'Content may not be copied or distributed without permission',
            'We grant a limited license to use the site for personal purposes'
          ]
        },
        {
          title: 'Disclaimer',
          content: [
            'Services are provided "as is" without warranties',
            'We are not liable for indirect damages',
            'Service interruption may occur for technical reasons'
          ]
        },
        {
          title: 'Termination',
          content: [
            'Service can be terminated at any time by either party',
            'We reserve the right to terminate service for any reason',
            'Some terms remain in effect even after termination'
          ]
        },
        {
          title: 'Applicable Law',
          content: [
            'These terms are subject to Saudi Arabian laws',
            'Any dispute is resolved in Saudi Arabian courts',
            'We try to resolve disputes amicably first'
          ]
        },
        {
          title: 'Contact Us',
          content: [
            'For inquiries about terms: nixtwork@outlook.com',
            'Email: nixtwork@outlook.com'
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