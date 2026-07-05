'use client'

import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function PrivacyPolicy() {
  const { language, dir } = useLanguage()
  const { scrollToSection } = useSmoothScroll()

  const content = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: 5 يوليو 2026',
      intro: 'توضح هذه السياسة كيف تجمع NIXT البيانات الشخصية وبيانات الاستخدام وتستخدمها وتحميها عند تصفحك لموقعنا أو استخدامك لخدماتنا، بما في ذلك خدمات SaaS، لوحات التحكم، نماذج التواصل، أنظمة تسجيل الدخول، وعمليات الدفع أو طلبات المشاريع.',
      sections: [
        {
          title: 'المعلومات التي نجمعها',
          content: [
            'بيانات تقدمها مباشرة مثل الاسم، البريد الإلكتروني، رقم الهاتف، اسم الشركة، ونص الرسالة أو تفاصيل المشروع عند التواصل معنا.',
            'بيانات الحساب والمصادقة عند التسجيل أو تسجيل الدخول، بما في ذلك المعلومات المرتبطة بمزودي الهوية الخارجيين مثل Google عند استخدامهم.',
            'بيانات المعاملات والفوترة اللازمة لتفعيل الاشتراكات أو سداد الخدمات، مع ملاحظة أن بيانات البطاقة الحساسة تتم معالجتها عادة عبر مزود الدفع الخارجي وليس عبرنا مباشرة.',
            'بيانات الاستخدام والسجل الفني مثل الصفحات التي تزورها، وقت التفاعل، نوع المتصفح، نظام التشغيل، عنوان IP، والمعرّفات التقنية ذات الصلة بالأمن والتشغيل.',
            'بيانات المشروع أو الملفات أو المدخلات التي يرفعها العميل عند استخدام خدماتنا أو التعاون معنا على تنفيذ مشروع.'
          ]
        },
        {
          title: 'كيف نستخدم معلوماتك',
          content: [
            'إنشاء الحسابات وتقديم الخدمات وتشغيل المنصات البرمجية وإدارة المشاريع أو الطلبات المرتبطة بك.',
            'التواصل معك بخصوص العروض، الدعم، التحديثات التشغيلية، الأمان، الفواتير، أو الرد على طلباتك ورسائلك.',
            'معالجة المدفوعات والاشتراكات والتحقق من العمليات المالية ومنع إساءة الاستخدام أو الاحتيال.',
            'تحسين الأداء وتجربة المستخدم وتطوير الخدمات والخصائص الجديدة وتحليل كيفية استخدام الموقع أو المنتج.',
            'الالتزام بالمتطلبات النظامية، وإنفاذ حقوقنا التعاقدية، وحماية المنصة والمستخدمين.'
          ]
        },
        {
          title: 'الأساس النظامي والمعالجة التعاقدية',
          content: [
            'نعالج بياناتك لأن ذلك ضروري لتقديم الخدمة أو الرد على طلباتك أو تنفيذ عقد أو عرض أو اشتراك تطلبه منا.',
            'قد نعالج بعض البيانات بناءً على مصلحتنا المشروعة في تأمين الخدمة، تحسين الأداء، ومنع الإساءة.',
            'في حالات محددة، قد نعتمد على موافقتك عندما يكون ذلك مطلوباً، ويمكنك سحبها وفق حدود ما يسمح به النظام وطبيعة الخدمة.'
          ]
        },
        {
          title: 'مشاركة البيانات مع الغير',
          content: [
            'لا نبيع بياناتك الشخصية ولا نؤجرها للغير.',
            'قد نشارك البيانات مع مزودي خدمات موثوقين يساعدوننا على تشغيل الموقع أو المصادقة أو الدفع أو الاستضافة أو التواصل، مثل مزودي الدفع أو البريد أو الهوية.',
            'قد نكشف عن المعلومات إذا كان ذلك مطلوباً بموجب القانون أو لحماية حقوقنا أو منع الاحتيال أو معالجة تهديد أمني أو تعاقدي.',
            'إذا شاركنا بيانات عميل مع مقاولين أو مزودين تقنيين، فسيكون ذلك في حدود الحاجة التشغيلية وبضوابط تعاقدية معقولة.'
          ]
        },
        {
          title: 'ملفات تعريف الارتباط والتقنيات المشابهة',
          content: [
            'قد نستخدم ملفات تعريف الارتباط أو التخزين المحلي أو التقنيات المشابهة لتذكر الجلسات وتفضيلات الواجهة مثل اللغة أو النمط وتحسين تجربة الاستخدام.',
            'بعض هذه التقنيات ضروري لتسجيل الدخول، الأمان، واستمرارية الجلسة، وبعضها قد يُستخدم للتحليلات أو تحسين الأداء.',
            'يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح، لكن تعطيل بعض الأنواع قد يؤثر على عمل أجزاء من الخدمة.'
          ]
        },
        {
          title: 'أمان البيانات',
          content: [
            'نطبق إجراءات تقنية وتنظيمية معقولة لحماية البيانات من الوصول غير المصرح به أو الفقد أو التعديل أو الإفصاح غير المشروع.',
            'قد تشمل هذه الإجراءات التشفير أثناء النقل، حماية بيانات الاعتماد، تقييد الوصول، ومراجعات تشغيلية وأمنية دورية.',
            'ورغم ذلك، لا يمكن ضمان أمان أي نظام بنسبة 100%، لذا نطلب من المستخدمين حماية أجهزتهم وبيانات دخولهم أيضاً.'
          ]
        },
        {
          title: 'الاحتفاظ بالبيانات',
          content: [
            'نحتفظ بالبيانات طالما كانت لازمة لتقديم الخدمة أو إدارة العلاقة التعاقدية أو الاستجابة لطلباتك.',
            'قد نحتفظ بسجلات محددة لأغراض الفوترة، الأمان، الامتثال، حل النزاعات، أو تنفيذ الالتزامات القانونية والتنظيمية.',
            'عندما لا تعود البيانات ضرورية، نحذفها أو نجهلها وفق ما يكون مناسباً تقنياً وتشغيلياً.'
          ]
        },
        {
          title: 'حقوقك وخياراتك',
          content: [
            'يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو تحديثها أو طلب حذفها، بما يخضع للالتزامات النظامية والتعاقدية القائمة.',
            'يمكنك طلب إلغاء بعض الرسائل غير الضرورية أو التسويقية، بينما قد نستمر في إرسال الرسائل التشغيلية أو الأمنية أو التعاقدية عند الحاجة.',
            'قد تكون بعض الحقوق محدودة عندما تكون المعالجة لازمة لتنفيذ عقد، إثبات حق، الامتثال للنظام، أو حماية أمن الخدمة.'
          ]
        },
        {
          title: 'نقل البيانات والتعامل الدولي',
          content: [
            'قد تتم استضافة بعض البيانات أو معالجتها عبر مزودين تقنيين يعملون داخل المملكة العربية السعودية أو خارجها بحسب بنية الخدمة ومقدميها.',
            'عند حدوث نقل أو معالجة عبر حدود مختلفة، نعمل على اعتماد تدابير تعاقدية وتشغيلية معقولة لحماية البيانات بما يتناسب مع طبيعة الخدمة.'
          ]
        },
        {
          title: 'تحديثات هذه السياسة',
          content: [
            'قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس تغييرات في خدماتنا أو ممارساتنا أو التزاماتنا النظامية.',
            'إذا كانت التغييرات جوهرية، فقد ننشر تنبيهاً أو نستخدم وسيلة تواصل مناسبة بحسب طبيعة الخدمة.',
            'استمرارك في استخدام الموقع أو الخدمات بعد سريان التحديثات يعني إقرارك بالنسخة المحدثة.'
          ]
        },
        {
          title: 'اتصل بنا',
          content: [
            'إذا كان لديك أي سؤال أو طلب متعلق بالخصوصية أو البيانات الشخصية، يمكنك التواصل معنا عبر: nixtwork@outlook.com.',
            'كما يمكنك استخدام قنوات التواصل المتاحة على الموقع لطلبات المشاريع أو الاستفسارات العامة.'
          ]
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: July 5, 2026',
      intro: 'This Privacy Policy explains how NIXT collects, uses, stores, and protects personal data and usage data when you browse our website or use our services, including SaaS products, dashboards, contact workflows, authentication systems, payments, and project requests.',
      sections: [
        {
          title: 'Information We Collect',
          content: [
            'Information you provide directly, such as your name, email address, phone number, company name, message content, or project details when contacting us.',
            'Account and authentication data when you register or sign in, including information associated with third-party identity providers such as Google where used.',
            'Transaction and billing data needed to activate subscriptions or pay for services, while sensitive card data is typically handled by the external payment processor rather than stored directly by us.',
            'Usage and technical log data such as pages visited, interaction times, browser type, operating system, IP address, and related technical identifiers used for operations and security.',
            'Project materials, files, or customer inputs submitted while using our services or collaborating with us on a custom engagement.'
          ]
        },
        {
          title: 'How We Use Your Information',
          content: [
            'To create accounts, deliver services, operate software platforms, and manage related projects or requests.',
            'To communicate with you about proposals, support, operational updates, security notices, billing, and responses to your inquiries.',
            'To process subscriptions and payments, verify financial activity, and prevent misuse or fraud.',
            'To improve performance, user experience, new features, and understand how the website or product is being used.',
            'To comply with applicable legal obligations, enforce our contractual rights, and protect the platform and its users.'
          ]
        },
        {
          title: 'Legal Basis and Service Delivery',
          content: [
            'We process data where necessary to provide services, respond to your requests, or perform a contract, proposal, or subscription you ask us to deliver.',
            'We may also process data based on our legitimate interests in securing the service, improving operations, and preventing abuse.',
            'Where required, we may rely on your consent for specific processing activities, and you may withdraw that consent subject to legal and operational limits.'
          ]
        },
        {
          title: 'Sharing Information with Third Parties',
          content: [
            'We do not sell or rent your personal information to third parties.',
            'We may share data with trusted service providers who help us run the website, authentication, payments, hosting, email, analytics, or communication workflows.',
            'We may disclose information when required by law, to protect our rights, to prevent fraud, or to address a security or contractual threat.',
            'If we use contractors or technical vendors, they receive only the data reasonably necessary to perform their role, subject to appropriate safeguards.'
          ]
        },
        {
          title: 'Cookies and Similar Technologies',
          content: [
            'We may use cookies, local storage, and similar technologies to remember sessions, interface preferences such as language or theme, and improve usability.',
            'Some technologies are necessary for sign-in, security, and session continuity, while others may support analytics or performance improvements.',
            'You can control cookies through your browser settings, but disabling certain technologies may affect parts of the service.'
          ]
        },
        {
          title: 'Data Security',
          content: [
            'We implement reasonable technical and organizational safeguards designed to protect data from unauthorized access, loss, alteration, or unlawful disclosure.',
            'These measures may include encryption in transit, credential protection, access controls, and periodic operational or security review processes.',
            'No system can be guaranteed to be 100% secure, so users should also protect their devices, passwords, and account access.'
          ]
        },
        {
          title: 'Data Retention',
          content: [
            'We keep data for as long as necessary to provide services, manage the contractual relationship, or respond to your requests.',
            'Certain records may be retained for billing, security, compliance, dispute resolution, or legal enforcement purposes.',
            'When data is no longer needed, we delete or anonymize it where technically and operationally appropriate.'
          ]
        },
        {
          title: 'Your Rights and Choices',
          content: [
            'You may request access to, correction of, update of, or deletion of your personal data, subject to applicable legal, security, and contractual limitations.',
            'You may opt out of non-essential or marketing communications, while we may still send service, billing, legal, or security-related messages when necessary.',
            'Some rights may be limited where processing is required to perform a contract, establish or defend rights, comply with law, or preserve service security.'
          ]
        },
        {
          title: 'International Processing and Transfers',
          content: [
            'Some data may be hosted or processed by technical providers inside or outside the Kingdom of Saudi Arabia depending on our infrastructure and service providers.',
            'Where cross-border processing occurs, we aim to use reasonable contractual and operational safeguards appropriate to the nature of the service.'
          ]
        },
        {
          title: 'Policy Updates',
          content: [
            'We may update this Privacy Policy from time to time to reflect changes in our services, practices, or legal obligations.',
            'If the changes are material, we may post a notice or use another appropriate communication method depending on the service context.',
            'Your continued use of the site or services after an update takes effect means you acknowledge the revised policy.'
          ]
        },
        {
          title: 'Contact Us',
          content: [
            'If you have any privacy or personal data questions or requests, contact us at: nixtwork@outlook.com.',
            'You may also use the contact channels on the website for project requests and general inquiries.'
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