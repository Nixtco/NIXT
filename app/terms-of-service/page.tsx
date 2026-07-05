'use client'

import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function TermsOfService() {
  const { language, dir } = useLanguage()
  const { scrollToSection } = useSmoothScroll()

  const content = {
    ar: {
      title: 'شروط الخدمة',
      lastUpdated: 'آخر تحديث: 5 يوليو 2026',
      intro: 'تنظم هذه الشروط استخدامك لموقع وخدمات NIXT، بما في ذلك المنصات البرمجية SaaS، لوحات التحكم، حلول التجارة الإلكترونية، تطوير الأنظمة، البنية السحابية، وأي خدمات رقمية أو استشارية نقدمها. باستخدامك للموقع أو بإنشاء حساب أو بطلب خدمة، فإنك توافق على هذه الشروط.',
      sections: [
        {
          title: 'قبول الشروط',
          content: [
            'استخدامك للموقع أو أي صفحة مرتبطة بالحسابات أو الدفع أو التواصل يعني موافقتك على هذه الشروط.',
            'إذا كنت تستخدم خدماتنا نيابة عن شركة أو جهة، فأنت تقر بأن لديك الصلاحية القانونية لإلزام تلك الجهة بهذه الشروط.',
            'يجوز لنا تحديث الشروط عند الحاجة التشغيلية أو القانونية، ويصبح الإصدار المحدث نافذاً عند نشره على الموقع.'
          ]
        },
        {
          title: 'وصف الخدمة',
          content: [
            'تقدم NIXT حلولاً رقمية تشمل تطوير أنظمة الأعمال، لوحات التحكم، تطبيقات الويب، حلول SaaS، البنية السحابية، وتجارب المستخدم الحديثة.',
            'قد تكون بعض الخدمات قياسية على شكل اشتراك، بينما تكون خدمات أخرى مخصصة حسب نطاق المشروع والعرض الفني المعتمد.',
            'نحتفظ بحق تطوير أو تعديل أو إيقاف أي ميزة أو خدمة بما يدعم الاستقرار والأمن وتحسين المنتج.'
          ]
        },
        {
          title: 'حساب المستخدم',
          content: [
            'يجب تقديم معلومات صحيحة ومحدثة عند التسجيل أو استخدام تسجيل الدخول الخارجي مثل Google.',
            'أنت مسؤول عن سرية بيانات الدخول وعن جميع الأنشطة التي تتم عبر حسابك.',
            'يجب إبلاغنا فوراً عند الاشتباه في أي وصول غير مصرح به أو إساءة استخدام للحساب.',
            'يجوز لنا تعليق الحساب أو تقييد الوصول إذا تبين وجود خطر أمني أو مخالفة لهذه الشروط.'
          ]
        },
        {
          title: 'الاشتراكات والمشاريع والمدفوعات',
          content: [
            'تخضع الخطط والأسعار ونطاقات العمل لما هو موضح في صفحة التسعير أو في العرض التجاري أو العقد المبرم مع العميل.',
            'قد تتم معالجة المدفوعات عبر مزودي دفع خارجيين مثل Stripe، وتخضع عملية الدفع أيضاً لشروطهم وسياساتهم.',
            'في الخدمات القائمة على الاشتراك، قد يتجدد الاشتراك دورياً ما لم يتم إلغاؤه وفق آلية الإلغاء المعلنة أو المتفق عليها.',
            'الدفعات الخاصة بالمشاريع المخصصة أو الأعمال المنجزة أو الخدمات المفعلة لا تكون قابلة للاسترداد إلا إذا نص العقد أو العرض على خلاف ذلك.'
          ]
        },
        {
          title: 'الاستخدام المقبول',
          content: [
            'يجب استخدام الموقع والخدمات بشكل قانوني ومهني وبما لا يضر بنا أو بعملائنا أو بالمستخدمين الآخرين.',
            'يُحظر رفع أو إرسال شيفرات ضارة أو محاولة تجاوز الحماية أو فحص الثغرات أو إساءة استخدام الواجهات البرمجية.',
            'يُحظر استخدام خدماتنا في الاحتيال أو الرسائل المزعجة أو انتهاك الخصوصية أو التعدي على الحقوق الفكرية أو التعاقدية للغير.',
            'يجوز لنا إزالة المحتوى أو تقييد الوصول عندما نرى بشكل معقول أن الاستخدام مخالف أو يهدد سلامة الخدمة.'
          ]
        },
        {
          title: 'محتوى العميل والملكية الفكرية',
          content: [
            'جميع الحقوق المتعلقة بالموقع، الهوية البصرية، المحتوى البرمجي العام، والتصاميم والأدوات المملوكة لـ NIXT تبقى ملكاً لنا أو للجهات المرخصة لنا.',
            'يحتفظ العميل بملكية المحتوى والبيانات والمواد التي يرفعها أو يزودنا بها، ويمنحنا ترخيصاً لازماً لمعالجتها واستضافتها وتقديم الخدمة المتفق عليها.',
            'ما لم ينص العقد على غير ذلك، تبقى الأجزاء العامة القابلة لإعادة الاستخدام مثل الأطر الداخلية والمكتبات والأدوات التشغيلية ملكاً لـ NIXT.'
          ]
        },
        {
          title: 'التوافر والدعم',
          content: [
            'نعمل على توفير الخدمة بجودة معقولة وبأعلى قدر ممكن من الاستقرار، لكننا لا نضمن عدم الانقطاع أو خلو الخدمة من جميع الأخطاء.',
            'قد نقوم بأعمال صيانة أو تحديثات أو تحسينات أمنية تؤثر مؤقتاً على التوفر.',
            'أي مدد دعم أو تسليم أو استجابة تخضع لما هو موضح في الخطة أو العقد أو العرض المعتمد.'
          ]
        },
        {
          title: 'إخلاء المسؤولية وحدود المسؤولية',
          content: [
            'تُقدم الخدمات بالقدر الذي يسمح به النظام "كما هي" و"حسب التوفر"، ما لم نلتزم صراحة بضمانات محددة في عقد مستقل.',
            'لا نتحمل المسؤولية عن الخسائر غير المباشرة أو التبعية أو فقد الأرباح أو فقد البيانات الناتج عن استخدام الخدمة أو تعطلها، بالقدر المسموح به نظاماً.',
            'في جميع الأحوال، تقتصر مسؤوليتنا الإجمالية المتعلقة بالخدمة محل النزاع على المبالغ التي دفعها العميل لنا عن تلك الخدمة خلال آخر 12 شهراً السابقة مباشرة للمطالبة، ما لم يقتض النظام خلاف ذلك.'
          ]
        },
        {
          title: 'الإنهاء والإلغاء',
          content: [
            'يجوز لك التوقف عن استخدام الخدمة في أي وقت، كما يجوز لنا إنهاء أو تعليق الوصول عند المخالفة أو عدم السداد أو وجود مخاطر تشغيلية أو أمنية.',
            'عند انتهاء الخدمة، قد نفقدك الوصول إلى بعض البيانات أو الوظائف ما لم يكن هناك ترتيب تعاقدي مختلف لتسليم البيانات أو فترة احتفاظ محددة.',
            'تظل البنود المتعلقة بالمدفوعات والسرية والملكية الفكرية والمسؤولية وتسوية النزاعات سارية بعد الإنهاء.'
          ]
        },
        {
          title: 'القانون الواجب التطبيق',
          content: [
            'تخضع هذه الشروط وتفسر وفق الأنظمة المعمول بها في المملكة العربية السعودية، ما لم يتفق كتابياً على خلاف ذلك في عقد منفصل.',
            'نسعى أولاً إلى معالجة أي نزاع أو مطالبة بشكل ودي ومن خلال التواصل المباشر.',
            'إذا تعذر الحل الودي، فيكون الاختصاص للجهات القضائية أو النظامية المختصة في المملكة العربية السعودية ما لم ينص العقد على ترتيب مختلف.'
          ]
        },
        {
          title: 'التواصل',
          content: [
            'للاستفسارات القانونية أو التعاقدية أو المتعلقة بهذه الشروط، يمكن التواصل معنا عبر البريد: nixtwork@outlook.com.',
            'يمكنك أيضاً استخدام نماذج التواصل المتاحة على الموقع لطلبات المشاريع والاستفسارات العامة.'
          ]
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: July 5, 2026',
      intro: 'These Terms govern your use of NIXT websites and services, including our SaaS products, dashboards, e-commerce solutions, systems development, cloud infrastructure, and related digital or consulting services. By accessing the site, creating an account, or ordering a service, you agree to these Terms.',
      sections: [
        {
          title: 'Acceptance of Terms',
          content: [
            'Your use of the site or any account, payment, or contact workflow means you accept these Terms.',
            'If you use our services on behalf of a company or organization, you represent that you have authority to bind that entity.',
            'We may update these Terms when required for operational, legal, or product reasons, and the updated version becomes effective when posted.'
          ]
        },
        {
          title: 'Service Description',
          content: [
            'NIXT provides digital solutions including business systems, dashboards, web applications, SaaS platforms, cloud infrastructure, and modern user experiences.',
            'Some offerings are standardized subscription services, while others are delivered as custom scoped projects under a proposal or contract.',
            'We may improve, modify, suspend, or discontinue features where necessary to maintain security, stability, and product quality.'
          ]
        },
        {
          title: 'User Account',
          content: [
            'You must provide accurate and current information when registering or using third-party sign-in such as Google.',
            'You are responsible for maintaining the confidentiality of your credentials and for activity under your account.',
            'You must promptly notify us of suspected unauthorized access or misuse.',
            'We may suspend, restrict, or terminate accounts that create security, payment, or compliance risks.'
          ]
        },
        {
          title: 'Subscriptions, Projects, and Payments',
          content: [
            'Plans, pricing, and project scope are governed by our pricing page, proposal, order form, or signed agreement, as applicable.',
            'Payments may be processed through third-party providers such as Stripe and are also subject to those providers’ terms.',
            'Subscription services may renew on a recurring basis unless cancelled through the applicable cancellation method or contract terms.',
            'Fees for custom project work, completed milestones, or activated services are generally non-refundable unless a written agreement states otherwise.'
          ]
        },
        {
          title: 'Acceptable Use',
          content: [
            'You must use the site and services lawfully and in a way that does not harm us, our clients, or other users.',
            'You may not upload malicious code, bypass security, probe vulnerabilities, abuse APIs, or interfere with service operation.',
            'You may not use our services for fraud, spam, privacy violations, or infringement of third-party intellectual property or contractual rights.',
            'We may remove content or restrict access where we reasonably believe usage is unlawful, unsafe, or inconsistent with these Terms.'
          ]
        },
        {
          title: 'Client Content and Intellectual Property',
          content: [
            'All rights in the site, branding, general platform code, design assets, and proprietary tooling belong to NIXT or its licensors.',
            'You retain ownership of the content, data, and materials you submit, and grant us the rights needed to host, process, and deliver the agreed services.',
            'Unless otherwise stated in a written agreement, reusable frameworks, internal libraries, operational tools, and general know-how remain the property of NIXT.'
          ]
        },
        {
          title: 'Availability and Support',
          content: [
            'We aim to provide reliable services, but we do not guarantee uninterrupted operation or that every defect will be prevented.',
            'Maintenance, updates, security work, or third-party dependencies may affect availability from time to time.',
            'Any support response times, delivery timelines, or service commitments are governed by the applicable plan, proposal, or contract.'
          ]
        },
        {
          title: 'Disclaimers and Limitation of Liability',
          content: [
            'To the extent permitted by law, services are provided on an "as is" and "as available" basis unless we expressly agree otherwise in writing.',
            'We are not liable for indirect, incidental, special, consequential, or lost-profit damages arising from use of or inability to use the services, to the extent permitted by law.',
            'Our aggregate liability for the specific service giving rise to a claim will not exceed the amounts paid to us for that service during the 12 months immediately preceding the claim, unless applicable law requires otherwise.'
          ]
        },
        {
          title: 'Termination and Cancellation',
          content: [
            'You may stop using the service at any time, and we may suspend or terminate access for breach, non-payment, security concerns, or operational risk.',
            'When services end, access to certain features or data may stop unless a separate data export or retention arrangement applies.',
            'Payment, confidentiality, intellectual property, liability, and dispute-related provisions survive termination.'
          ]
        },
        {
          title: 'Governing Law',
          content: [
            'These Terms are governed by the laws and regulations applicable in the Kingdom of Saudi Arabia unless a separate written agreement states otherwise.',
            'We will first try to resolve disputes or claims through direct good-faith communication.',
            'If informal resolution is not possible, disputes will be handled by the competent courts or authorities in the Kingdom of Saudi Arabia unless a contract provides another forum.'
          ]
        },
        {
          title: 'Contact Us',
          content: [
            'For legal, contractual, or terms-related questions, contact us at: nixtwork@outlook.com.',
            'You may also use the contact workflows on our website for project requests and general inquiries.'
          ]
        }
      ]
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-background">
      <Header onSmoothScroll={scrollToSection} />

      <main className="container mx-auto px-4 pt-36 pb-16 max-w-4xl">
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