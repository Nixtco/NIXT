import { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './PrintableContract.module.css';
import { generateContractHTML } from '../utils/contractHTML';

const contractClausesData = [
  {
    title: 'نطاق العمل',
    content:
      'يلتزم الطرف الأول (شركة NIXT) بتقديم خدمة تصميم وتطوير موقع إلكتروني احترافي وفقاً للمواصفات المتفق عليها بين الطرفين، ويشمل ذلك التصميم الجذاب، البرمجة، والتجربة المتكاملة على جميع الأجهزة.',
  },
  {
    title: 'قيمة العقد',
    content:
      'يلتزم الطرف الثاني بدفع مبلغ قدره 450 دولار أمريكي (أربعمائة وخمسون دولاراً) مقابل الخدمات المذكورة أعلاه. يتم الدفع وفقاً لجدول الدفع المحدد في هذا العقد.',
  },
  {
    title: 'جدول الدفع',
    content:
      'يتم الدفع على دفعتين: الدفعة الأولى بنسبة 50% (225$) عند توقيع العقد والبدء بالعمل، والدفعة الثانية بنسبة 50% (225$) عند تسليم المشروع بشكل نهائي واعتماده من الطرف الثاني.',
  },
  {
    title: 'مدة التنفيذ',
    content:
      'يلتزم الطرف الأول بإنجاز المشروع خلال مدة متفق عليها بين الطرفين تبدأ من تاريخ استلام الدفعة الأولى واعتماد متطلبات المشروع النهائية.',
  },
  {
    title: 'حقوق الملكية',
    content:
      'تنتقل جميع حقوق الملكية الفكرية للموقع إلى الطرف الثاني بعد استكمال الدفع الكامل. قبل ذلك، تبقى جميع الحقوق محفوظة لشركة NIXT.',
  },
  {
    title: 'التعديلات',
    content:
      'يحق للطرف الثاني طلب تعديلات على التصميم بحد أقصى جولتين من التعديلات مجاناً. أي تعديلات إضافية بعد ذلك ستكون بتكلفة إضافية يتم الاتفاق عليها.',
  },
  {
    title: 'الدعم الفني',
    content:
      'يقدم الطرف الأول دعماً فنياً مجانياً لمدة 30 يوماً بعد تسليم المشروع، يشمل إصلاح الأخطاء البرمجية. لا يشمل الدعم إضافة ميزات جديدة.',
  },
  {
    title: 'السرية',
    content:
      'يلتزم كلا الطرفين بالحفاظ على سرية جميع المعلومات والبيانات المتبادلة خلال فترة تنفيذ المشروع وبعدها، ولا يجوز لأي طرف إفشاء معلومات الطرف الآخر دون موافقة خطية.',
  },
  {
    title: 'إنهاء العقد',
    content:
      'يحق لأي طرف إنهاء هذا العقد بإشعار خطي مدته 7 أيام. في حال الإنهاء، يستحق الطرف الأول أتعاباً عن الأعمال المنجزة حتى تاريخ الإنهاء.',
  },
  {
    title: 'حل النزاعات',
    content:
      'في حال نشوء أي خلاف بين الطرفين، يتم حله ودياً أولاً. وفي حال تعذر ذلك، يتم اللجوء إلى التحكيم وفقاً للقوانين والأنظمة المعمول بها.',
  },
];

const PrintableContract = forwardRef(({ clientName, clientEmail, projectDesc, contractNumber, formattedDate, theme, onClose }, ref) => {
  const year = new Date().getFullYear();

  const handleSavePDF = () => {
    const htmlContent = generateContractHTML({
      clientName,
      clientEmail,
      projectDesc,
      contractNumber,
      formattedDate,
      year,
      theme,
    });

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for fonts to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove iframe after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  return createPortal(
    <div className={styles.overlay} ref={ref}>
      {/* Top Action Bar */}
      <div className={styles.actionBar}>
        <button className={styles.printBtn} onClick={handleSavePDF}>
          📥 حفظ العقد كـ PDF
        </button>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕ العودة للعقد
        </button>
      </div>

      {/* Preview Document */}
      <div className={styles.page}>
        <div className={styles.pageFrame}>
          <div className={`${styles.corner} ${styles.cornerTL}`} />
          <div className={`${styles.corner} ${styles.cornerTR}`} />
          <div className={`${styles.corner} ${styles.cornerBL}`} />
          <div className={`${styles.corner} ${styles.cornerBR}`} />
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.logoText}>NIXT</div>
            <div className={styles.logoSub}>Digital Solutions</div>

            <div className={styles.ornament}>
              <span className={styles.ornamentLine} />
              <span className={styles.ornamentDiamond}>◆</span>
              <span className={styles.ornamentLine} />
            </div>

            <h1 className={styles.contractTitle}>عقد اتفاق لتقديم خدمات</h1>
            <h2 className={styles.contractSubtitle}>تصميم وتطوير موقع إلكتروني</h2>

            <div className={styles.ornament}>
              <span className={styles.ornamentLine} />
              <span className={styles.ornamentDiamond}>◆</span>
              <span className={styles.ornamentLine} />
            </div>

            <div className={styles.metaBar}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>رقم العقد</span>
                <span className={styles.metaValue}>{contractNumber}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>تاريخ التحرير</span>
                <span className={styles.metaValue}>{formattedDate}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>قيمة العقد</span>
                <span className={`${styles.metaValue} ${styles.gold}`}>$450</span>
              </div>
            </div>
          </div>

          <div className={styles.sectionTitle}>أطراف العقد</div>
          <div className={styles.partiesGrid}>
            <div className={styles.partyBox}>
              <div className={styles.partyHeader}>
                <span>الطرف الأول</span>
                <span className={styles.partyRole}>مقدم الخدمة</span>
              </div>
              <div className={styles.partyBody}>
                <div className={styles.partyName}>شركة NIXT</div>
                <div className={styles.partyDesc}>للحلول الرقمية والتقنية</div>
                <div className={styles.partyDetail}>
                  <span className={styles.partyDetailLabel}>النشاط:</span>
                  <span>تصميم وتطوير مواقع الويب</span>
                </div>
                <div className={styles.partyDetail}>
                  <span className={styles.partyDetailLabel}>التخصص:</span>
                  <span>حلول رقمية متكاملة</span>
                </div>
              </div>
            </div>

            <div className={styles.partyBox}>
              <div className={styles.partyHeader}>
                <span>الطرف الثاني</span>
                <span className={styles.partyRole}>العميل</span>
              </div>
              <div className={styles.partyBody}>
                <div className={`${styles.partyName} ${styles.clientNamePrint}`}>{clientName || '—'}</div>
                {clientEmail && (
                  <div className={styles.partyDetail}>
                    <span className={styles.partyDetailLabel}>البريد:</span>
                    <span dir="ltr">{clientEmail}</span>
                  </div>
                )}
                {projectDesc && (
                  <div className={`${styles.partyDetail} ${styles.partyDetailCol}`}>
                    <span className={styles.partyDetailLabel}>وصف المشروع:</span>
                    <span>{projectDesc}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.introText}>
            تم الاتفاق بين الطرفين المذكورين أعلاه على البنود والشروط التالية، وذلك بناءً على رغبة الطرف الثاني في الحصول على خدمة تصميم وتطوير موقع إلكتروني من الطرف الأول (شركة NIXT)، وقد تراضى الطرفان على ما يلي:
          </div>

          <div className={styles.sectionTitle}>بنود وشروط العقد</div>
          <div className={styles.clausesList}>
            {contractClausesData.map((clause, i) => (
              <div key={i} className={styles.clause}>
                <div className={styles.clauseHeader}>
                  <span className={styles.clauseNum}>البند {i + 1}</span>
                  <span className={styles.clauseTitleText}>{clause.title}</span>
                </div>
                <p className={styles.clauseText}>{clause.content}</p>
              </div>
            ))}
          </div>

          <div className={styles.sectionTitle}>الملخص المالي</div>
          <table className={styles.financeTable}>
            <thead>
              <tr>
                <th>البيان</th>
                <th className={styles.amountCol}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>خدمة تصميم وتطوير الموقع الإلكتروني</td>
                <td className={styles.amount}>$450.00</td>
              </tr>
              <tr>
                <td className={styles.subItem}>↩ الدفعة الأولى (عند التوقيع - 50%)</td>
                <td className={`${styles.amount} ${styles.subAmount}`}>$225.00</td>
              </tr>
              <tr>
                <td className={styles.subItem}>↩ الدفعة الثانية (عند التسليم - 50%)</td>
                <td className={`${styles.amount} ${styles.subAmount}`}>$225.00</td>
              </tr>
              <tr className={styles.totalRow}>
                <td>الإجمالي المستحق</td>
                <td className={`${styles.amount} ${styles.totalAmount}`}>$450.00</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.sectionTitle}>التوقيع والإقرار</div>
          <p className={styles.sigIntro}>
            بالتوقيع أدناه، يقر كلا الطرفين بأنهما قد قرأا وفهما جميع بنود وشروط هذا العقد، ويوافقان عليها بالكامل، ويلتزمان بتنفيذها وفقاً لما هو منصوص عليه.
          </p>

          <div className={styles.signatures}>
            <div className={styles.sigBox}>
              <div className={styles.sigLabel}>توقيع الطرف الأول</div>
              <div className={styles.sigArea}>
                <div className={styles.sigStamp}>
                  <div className={styles.stampName}>NIXT</div>
                  <div className={styles.stampSub}>Digital Solutions</div>
                </div>
              </div>
              <div className={styles.sigName}>شركة NIXT</div>
              <div className={styles.sigDate}>التاريخ: {formattedDate}</div>
            </div>

            <div className={styles.sigBox}>
              <div className={styles.sigLabel}>توقيع الطرف الثاني</div>
              <div className={styles.sigArea}>
                <div className={styles.sigClientName}>{clientName}</div>
              </div>
              <div className={styles.sigName}>{clientName || '—'}</div>
              <div className={styles.sigDate}>التاريخ: {formattedDate}</div>
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.footerBrand}>NIXT | Digital Solutions</div>
            <div className={styles.footerText}>
              هذا العقد محرر من نسختين أصليتين، لكل طرف نسخة للعمل بموجبها.
              <br />
              © {year} NIXT - جميع الحقوق محفوظة. هذا المستند سري وملزم قانونياً.
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

PrintableContract.displayName = 'PrintableContract';

export default PrintableContract;
