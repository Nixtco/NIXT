/**
 * Generates a formal, print-ready HTML contract document
 * and opens it in a new window for PDF export
 */

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

export function generateContractPDF({ clientName, clientEmail, projectDesc, contractNumber, formattedDate }) {
  const clausesHTML = contractClausesData
    .map(
      (clause, i) => `
      <div class="clause">
        <div class="clause-header">
          <span class="clause-num">البند ${i + 1}</span>
          <span class="clause-title">${clause.title}</span>
        </div>
        <p class="clause-text">${clause.content}</p>
      </div>
    `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>عقد اتفاق - ${contractNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Cairo', 'Amiri', sans-serif;
      direction: rtl;
      background: #fff;
      color: #1a1a2e;
      line-height: 1.8;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
      background: #fff;
      position: relative;
    }

    /* ===== Page Border Frame ===== */
    .page-frame {
      position: absolute;
      top: 12mm;
      left: 12mm;
      right: 12mm;
      bottom: 12mm;
      border: 2px solid #14b8a6;
      pointer-events: none;
    }

    .page-frame::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      border: 1px solid rgba(20, 184, 166, 0.4);
    }

    .corner-ornament {
      position: absolute;
      width: 25px;
      height: 25px;
      border-color: #14b8a6;
    }
    .corner-tl { top: -1px; right: -1px; border-top: 3px solid; border-right: 3px solid; }
    .corner-tr { top: -1px; left: -1px; border-top: 3px solid; border-left: 3px solid; }
    .corner-bl { bottom: -1px; right: -1px; border-bottom: 3px solid; border-right: 3px solid; }
    .corner-br { bottom: -1px; left: -1px; border-bottom: 3px solid; border-left: 3px solid; }

    .content {
      position: relative;
      padding: 18mm 20mm;
      z-index: 1;
    }

    /* ===== Header ===== */
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #14b8a6;
      margin-bottom: 25px;
    }

    .logo-area {
      margin-bottom: 10px;
    }

    .logo-text {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #14b8a6;
      text-shadow: 1px 1px 0 rgba(201,168,76,0.2);
    }

    .logo-sub {
      font-size: 10px;
      letter-spacing: 4px;
      color: #888;
      text-transform: uppercase;
      margin-top: -2px;
    }

    .ornament {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 15px 0;
    }

    .ornament-line {
      width: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #14b8a6, transparent);
    }

    .ornament-diamond {
      color: #14b8a6;
      font-size: 10px;
    }

    .contract-title {
      font-size: 22px;
      font-weight: 800;
      color: #1a1a2e;
      margin: 8px 0 4px;
    }

    .contract-subtitle {
      font-size: 15px;
      font-weight: 600;
      color: #14b8a6;
      margin-bottom: 5px;
    }

    /* ===== Meta Info ===== */
    .meta-bar {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .meta-item {
      text-align: center;
    }

    .meta-label {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 2px;
    }

    .meta-value {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .meta-value.gold {
      color: #14b8a6;
      font-size: 16px;
    }

    /* ===== Section Title ===== */
    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: #1a1a2e;
      padding: 10px 15px;
      background: linear-gradient(135deg, #fdf6e3 0%, #fff9ed 100%);
      border-right: 4px solid #14b8a6;
      border-radius: 0 8px 8px 0;
      margin: 25px 0 15px;
    }

    /* ===== Parties ===== */
    .parties-grid {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
    }

    .party-box {
      flex: 1;
      border: 1px solid #e8e0cc;
      border-radius: 10px;
      overflow: hidden;
      background: #fefdfb;
    }

    .party-header {
      background: linear-gradient(135deg, #1a1a2e, #2d2d4e);
      color: #14b8a6;
      padding: 8px 15px;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .party-role {
      font-size: 10px;
      color: rgba(255,255,255,0.5);
    }

    .party-body {
      padding: 15px;
    }

    .party-name {
      font-size: 16px;
      font-weight: 800;
      color: #14b8a6;
      margin-bottom: 3px;
    }

    .party-desc {
      font-size: 11px;
      color: #888;
      margin-bottom: 8px;
    }

    .party-detail {
      font-size: 11px;
      color: #555;
      padding: 4px 0;
      border-bottom: 1px solid #f0ebe0;
      display: flex;
      justify-content: space-between;
    }

    .party-detail:last-child {
      border-bottom: none;
    }

    .party-detail-label {
      color: #999;
    }

    /* ===== Clauses ===== */
    .clauses-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .clause {
      padding: 12px 15px;
      border: 1px solid #f0ebe0;
      border-radius: 8px;
      background: #fefdfb;
      page-break-inside: avoid;
    }

    .clause-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .clause-num {
      font-size: 9px;
      font-weight: 700;
      color: #14b8a6;
      border: 1px solid #14b8a6;
      padding: 2px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }

    .clause-title {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .clause-text {
      font-size: 12px;
      line-height: 2;
      color: #444;
      padding-right: 5px;
    }

    /* ===== Financial Summary ===== */
    .finance-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e8e0cc;
    }

    .finance-table th {
      background: linear-gradient(135deg, #1a1a2e, #2d2d4e);
      color: #14b8a6;
      padding: 10px 15px;
      font-size: 11px;
      font-weight: 700;
      text-align: right;
    }

    .finance-table td {
      padding: 10px 15px;
      font-size: 12px;
      border-bottom: 1px solid #f0ebe0;
      background: #fefdfb;
    }

    .finance-table tr:last-child td {
      border-bottom: none;
    }

    .finance-table .total-row td {
      background: linear-gradient(135deg, #fdf6e3, #fff9ed);
      font-weight: 800;
      font-size: 14px;
      color: #1a1a2e;
      border-top: 2px solid #14b8a6;
    }

    .amount {
      text-align: left;
      font-weight: 600;
      direction: ltr;
    }

    .amount.gold {
      color: #14b8a6;
      font-size: 15px;
      font-weight: 800;
    }

    /* ===== Signatures ===== */
    .signatures {
      display: flex;
      gap: 30px;
      margin-top: 20px;
      page-break-inside: avoid;
    }

    .sig-box {
      flex: 1;
      text-align: center;
    }

    .sig-label {
      font-size: 10px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .sig-area {
      height: 80px;
      border: 2px dashed #d4c8a0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background: #fefcf6;
    }

    .sig-stamp {
      border: 2px solid #14b8a6;
      padding: 8px 25px;
      border-radius: 8px;
      background: rgba(20, 184, 166, 0.08);
    }

    .stamp-name {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #14b8a6;
    }

    .stamp-sub {
      font-size: 8px;
      letter-spacing: 2px;
      color: #b8953d;
      text-transform: uppercase;
    }

    .sig-client-name {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      font-style: italic;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }

    .sig-date {
      font-size: 10px;
      color: #999;
      margin-top: 3px;
    }

    /* ===== Footer ===== */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #14b8a6;
      text-align: center;
    }

    .footer-text {
      font-size: 9px;
      color: #999;
      line-height: 1.8;
    }

    .footer-brand {
      font-size: 11px;
      font-weight: 700;
      color: #14b8a6;
      letter-spacing: 3px;
      margin-bottom: 3px;
    }

    /* ===== Print Specific ===== */
    @media print {
      body { background: #fff; }
      .page {
        margin: 0;
        box-shadow: none;
        width: 100%;
      }
      .no-print { display: none !important; }
    }

    /* ===== Screen Preview ===== */
    @media screen {
      body {
        background: #f0ece4;
        padding: 20px;
      }
      .page {
        box-shadow: 0 4px 30px rgba(0,0,0,0.15);
        margin: 20px auto;
        border-radius: 4px;
      }
      .print-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #1a1a2e, #2d2d4e);
        padding: 12px 30px;
        display: flex;
        justify-content: center;
        gap: 15px;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .print-btn {
        padding: 10px 30px;
        border: none;
        border-radius: 8px;
        background: #14b8a6;
        color: #1a1a2e;
        font-family: 'Cairo', sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
      }
      .print-btn:hover {
        background: #2dd4bf;
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(201,168,76,0.4);
      }
      .print-btn.secondary {
        background: transparent;
        border: 2px solid #14b8a6;
        color: #14b8a6;
      }
      .print-btn.secondary:hover {
        background: rgba(201,168,76,0.1);
      }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <button class="print-btn" onclick="window.print()">🖨️ طباعة / حفظ كـ PDF</button>
    <button class="print-btn secondary" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="page">
    <div class="page-frame">
      <div class="corner-ornament corner-tl"></div>
      <div class="corner-ornament corner-tr"></div>
      <div class="corner-ornament corner-bl"></div>
      <div class="corner-ornament corner-br"></div>
    </div>

    <div class="content">
      <!-- Header -->
      <div class="header">
        <div class="logo-area">
          <div class="logo-text">NIXT</div>
          <div class="logo-sub">Digital Solutions</div>
        </div>
        <div class="ornament">
          <span class="ornament-line"></span>
          <span class="ornament-diamond">◆</span>
          <span class="ornament-line"></span>
        </div>
        <div class="contract-title">عقد اتفاق لتقديم خدمات</div>
        <div class="contract-subtitle">تصميم وتطوير موقع إلكتروني</div>
        <div class="ornament">
          <span class="ornament-line"></span>
          <span class="ornament-diamond">◆</span>
          <span class="ornament-line"></span>
        </div>
        <div class="meta-bar">
          <div class="meta-item">
            <span class="meta-label">رقم العقد</span>
            <span class="meta-value">${contractNumber}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">تاريخ التحرير</span>
            <span class="meta-value">${formattedDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">قيمة العقد</span>
            <span class="meta-value gold">$450</span>
          </div>
        </div>
      </div>

      <!-- Parties -->
      <div class="section-title">أطراف العقد</div>
      <div class="parties-grid">
        <div class="party-box">
          <div class="party-header">
            <span>الطرف الأول</span>
            <span class="party-role">مقدم الخدمة</span>
          </div>
          <div class="party-body">
            <div class="party-name">شركة NIXT</div>
            <div class="party-desc">للحلول الرقمية والتقنية</div>
            <div class="party-detail">
              <span class="party-detail-label">النشاط:</span>
              <span>تصميم وتطوير مواقع الويب</span>
            </div>
            <div class="party-detail">
              <span class="party-detail-label">التخصص:</span>
              <span>حلول رقمية متكاملة</span>
            </div>
          </div>
        </div>
        <div class="party-box">
          <div class="party-header">
            <span>الطرف الثاني</span>
            <span class="party-role">العميل</span>
          </div>
          <div class="party-body">
            <div class="party-name" style="color:#1a1a2e">${clientName || '—'}</div>
            ${clientEmail ? `<div class="party-detail"><span class="party-detail-label">البريد:</span><span style="direction:ltr">${clientEmail}</span></div>` : ''}
            ${projectDesc ? `<div class="party-detail" style="flex-direction:column;gap:3px"><span class="party-detail-label">وصف المشروع:</span><span>${projectDesc}</span></div>` : ''}
          </div>
        </div>
      </div>

      <!-- Introduction -->
      <p style="font-size:12px; color:#444; line-height:2; margin:15px 0; padding:12px 15px; background:#fefdfb; border-radius:8px; border:1px solid #f0ebe0;">
        تم الاتفاق بين الطرفين المذكورين أعلاه على البنود والشروط التالية، وذلك بناءً على رغبة الطرف الثاني في الحصول على خدمة تصميم وتطوير موقع إلكتروني من الطرف الأول (شركة NIXT)، وقد تراضى الطرفان على ما يلي:
      </p>

      <!-- Clauses -->
      <div class="section-title">بنود وشروط العقد</div>
      <div class="clauses-list">
        ${clausesHTML}
      </div>

      <!-- Financial Summary -->
      <div class="section-title">الملخص المالي</div>
      <table class="finance-table">
        <thead>
          <tr>
            <th>البيان</th>
            <th style="text-align:left; width:120px">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>خدمة تصميم وتطوير الموقع الإلكتروني</td>
            <td class="amount">$450.00</td>
          </tr>
          <tr>
            <td style="padding-right:30px; color:#888">↩ الدفعة الأولى (عند التوقيع - 50%)</td>
            <td class="amount" style="color:#888">$225.00</td>
          </tr>
          <tr>
            <td style="padding-right:30px; color:#888">↩ الدفعة الثانية (عند التسليم - 50%)</td>
            <td class="amount" style="color:#888">$225.00</td>
          </tr>
          <tr class="total-row">
            <td>الإجمالي المستحق</td>
            <td class="amount gold">$450.00</td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="section-title">التوقيع والإقرار</div>
      <p style="font-size:11px; color:#666; margin-bottom:15px; line-height:2;">
        بالتوقيع أدناه، يقر كلا الطرفين بأنهما قد قرأا وفهما جميع بنود وشروط هذا العقد، ويوافقان عليها بالكامل، ويلتزمان بتنفيذها وفقاً لما هو منصوص عليه.
      </p>
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-label">توقيع الطرف الأول</div>
          <div class="sig-area">
            <div class="sig-stamp">
              <div class="stamp-name">NIXT</div>
              <div class="stamp-sub">Digital Solutions</div>
            </div>
          </div>
          <div class="sig-name">شركة NIXT</div>
          <div class="sig-date">التاريخ: ${formattedDate}</div>
        </div>
        <div class="sig-box">
          <div class="sig-label">توقيع الطرف الثاني</div>
          <div class="sig-area">
            <div class="sig-client-name">${clientName || ''}</div>
          </div>
          <div class="sig-name">${clientName || '—'}</div>
          <div class="sig-date">التاريخ: ${formattedDate}</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">NIXT | Digital Solutions</div>
        <div class="footer-text">
          هذا العقد محرر من نسختين أصليتين، لكل طرف نسخة للعمل بموجبها.
          <br>
          © ${new Date().getFullYear()} NIXT - جميع الحقوق محفوظة. هذا المستند سري وملزم قانونياً.
        </div>
      </div>
    </div>
  </div>

  <script>
    // Auto-trigger print after fonts load
    document.fonts.ready.then(() => {
      setTimeout(() => {
        // Only auto-print, don't auto-close
      }, 500);
    });
  </script>
</body>
</html>
  `;

  return html;
}

export function openContractPDF(data) {
  const html = generateContractPDF(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
