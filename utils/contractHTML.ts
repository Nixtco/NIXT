interface ContractHTMLParams {
  clientName: string
  clientEmail: string
  projectDesc: string
  contractNumber: string
  formattedDate: string
  year: number
  theme?: {
    accent?: string
    accentDark?: string
    accentRgb?: string
    [key: string]: string | undefined
  }
}

export function generateContractHTML({
  clientName,
  clientEmail,
  projectDesc,
  contractNumber,
  formattedDate,
  year,
  theme,
}: ContractHTMLParams): string {
  const accent = theme?.accent || '#14b8a6'
  const accentDark = theme?.accentDark || '#0d9488'
  const accentRgb = theme?.accentRgb || '20, 184, 166'

  const clauses = [
    { title: 'نطاق العمل', content: 'يلتزم الطرف الأول (شركة NIXT) بتقديم خدمة تصميم وتطوير موقع إلكتروني احترافي وفقاً للمواصفات المتفق عليها بين الطرفين، ويشمل ذلك التصميم الجذاب، البرمجة، والتجربة المتكاملة على جميع الأجهزة.' },
    { title: 'قيمة العقد', content: 'يلتزم الطرف الثاني بدفع مبلغ قدره 450 دولار أمريكي (أربعمائة وخمسون دولاراً) مقابل الخدمات المذكورة أعلاه. يتم الدفع وفقاً لجدول الدفع المحدد في هذا العقد.' },
    { title: 'جدول الدفع', content: 'يتم الدفع على دفعتين: الدفعة الأولى بنسبة 50% (225$) عند توقيع العقد والبدء بالعمل، والدفعة الثانية بنسبة 50% (225$) عند تسليم المشروع بشكل نهائي واعتماده من الطرف الثاني.' },
    { title: 'مدة التنفيذ', content: 'يلتزم الطرف الأول بإنجاز المشروع خلال مدة متفق عليها بين الطرفين تبدأ من تاريخ استلام الدفعة الأولى واعتماد متطلبات المشروع النهائية.' },
    { title: 'حقوق الملكية', content: 'تنتقل جميع حقوق الملكية الفكرية للموقع إلى الطرف الثاني بعد استكمال الدفع الكامل. قبل ذلك، تبقى جميع الحقوق محفوظة لشركة NIXT.' },
    { title: 'التعديلات', content: 'يحق للطرف الثاني طلب تعديلات على التصميم بحد أقصى جولتين من التعديلات مجاناً. أي تعديلات إضافية بعد ذلك ستكون بتكلفة إضافية يتم الاتفاق عليها.' },
    { title: 'الدعم الفني', content: 'يقدم الطرف الأول دعماً فنياً مجانياً لمدة 30 يوماً بعد تسليم المشروع، يشمل إصلاح الأخطاء البرمجية. لا يشمل الدعم إضافة ميزات جديدة.' },
    { title: 'السرية', content: 'يلتزم كلا الطرفين بالحفاظ على سرية جميع المعلومات والبيانات المتبادلة خلال فترة تنفيذ المشروع وبعدها، ولا يجوز لأي طرف إفشاء معلومات الطرف الآخر دون موافقة خطية.' },
    { title: 'إنهاء العقد', content: 'يحق لأي طرف إنهاء هذا العقد بإشعار خطي مدته 7 أيام. في حال الإنهاء، يستحق الطرف الأول أتعاباً عن الأعمال المنجزة حتى تاريخ الإنهاء.' },
    { title: 'حل النزاعات', content: 'في حال نشوء أي خلاف بين الطرفين، يتم حله ودياً أولاً. وفي حال تعذر ذلك، يتم اللجوء إلى التحكيم وفقاً للقوانين والأنظمة المعمول بها.' },
  ]

  const clausesHTML = clauses.map((c, i) => `
    <div style="padding:12px 15px;border:1px solid #f0ebe0;border-radius:8px;background:#fefdfb;margin-bottom:8px;break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="font-size:9px;font-weight:700;color:${accent};border:1px solid ${accent};padding:2px 10px;border-radius:20px;white-space:nowrap;">البند ${i + 1}</span>
        <span style="font-size:13px;font-weight:700;color:#1a1a2e;">${c.title}</span>
      </div>
      <p style="margin:0;padding-right:5px;font-size:12px;line-height:2;color:#444;">${c.content}</p>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>عقد اتفاق - NIXT - ${contractNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 10mm; }
    body {
      font-family: 'Cairo', 'Tajawal', sans-serif;
      background: #fff; color: #1a1a2e; direction: rtl; line-height: 1.8;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .page { width: 190mm; margin: 0 auto; padding: 18mm 20mm; position: relative; }
    .frame { position: absolute; top: 12mm; left: 12mm; right: 12mm; bottom: 12mm; border: 2px solid ${accent}; pointer-events: none; }
    .frame::after { content: ''; position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px; border: 1px solid rgba(${accentRgb},0.35); }
    .corner { position: absolute; width: 25px; height: 25px; }
    .corner-tl { top: -1px; right: -1px; border-top: 3px solid ${accent}; border-right: 3px solid ${accent}; }
    .corner-tr { top: -1px; left: -1px; border-top: 3px solid ${accent}; border-left: 3px solid ${accent}; }
    .corner-bl { bottom: -1px; right: -1px; border-bottom: 3px solid ${accent}; border-right: 3px solid ${accent}; }
    .corner-br { bottom: -1px; left: -1px; border-bottom: 3px solid ${accent}; border-left: 3px solid ${accent}; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid ${accent}; margin-bottom: 25px; }
    .logo { font-size: 34px; font-weight: 900; letter-spacing: 8px; color: ${accent}; }
    .logo-sub { font-size: 10px; letter-spacing: 4px; color: #888; text-transform: uppercase; margin-top: -4px; }
    .ornament { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 14px 0; }
    .ornament-line { display: block; width: 80px; height: 1px; background: linear-gradient(90deg, transparent, ${accent}, transparent); }
    .ornament-diamond { color: ${accent}; font-size: 10px; }
    .title { font-size: 22px; font-weight: 800; color: #1a1a2e; margin: 6px 0 4px; }
    .subtitle { font-size: 15px; font-weight: 600; color: ${accent}; margin-bottom: 4px; }
    .meta-bar { display: flex; justify-content: center; gap: 40px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
    .meta-item { text-align: center; }
    .meta-label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 3px; }
    .meta-value { font-size: 13px; font-weight: 700; color: #1a1a2e; }
    .meta-gold { color: ${accent} !important; font-size: 17px !important; }
    .section-title { font-size: 15px; font-weight: 800; color: #1a1a2e; padding: 10px 15px; background: linear-gradient(135deg, #fdf6e3 0%, #fff9ed 100%); border-right: 4px solid ${accent}; border-radius: 0 8px 8px 0; margin: 25px 0 15px; }
    .parties { display: flex; gap: 18px; margin-bottom: 15px; }
    .party-box { flex: 1; border: 1px solid #e8e0cc; border-radius: 10px; overflow: hidden; background: #fefdfb; }
    .party-header { background: linear-gradient(135deg, #1a1a2e, #2d2d4e); color: ${accent}; padding: 8px 15px; font-size: 12px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
    .party-role { font-size: 10px; color: rgba(255,255,255,0.5); }
    .party-body { padding: 15px; }
    .party-name { font-size: 16px; font-weight: 800; color: ${accent}; margin-bottom: 4px; }
    .party-desc { font-size: 11px; color: #888; margin-bottom: 8px; }
    .party-detail { font-size: 11px; color: #555; padding: 5px 0; border-bottom: 1px solid #f0ebe0; display: flex; justify-content: space-between; }
    .party-detail:last-child { border-bottom: none; }
    .party-detail-label { color: #999; }
    .party-detail-col { flex-direction: column; gap: 3px; }
    .intro-text { font-size: 12px; color: #444; line-height: 2.1; margin: 15px 0; padding: 14px 16px; background: #fefdfb; border-radius: 8px; border: 1px solid #f0ebe0; }
    .finance-table { width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden; border: 1px solid #e8e0cc; }
    .finance-table th { background: linear-gradient(135deg, #1a1a2e, #2d2d4e); color: ${accent}; padding: 10px 15px; font-size: 11px; font-weight: 700; text-align: right; }
    .finance-table th.amount-col { text-align: left !important; width: 120px; }
    .finance-table td { padding: 10px 15px; font-size: 12px; border-bottom: 1px solid #f0ebe0; background: #fefdfb; }
    .finance-table tbody tr:last-child td { border-bottom: none; }
    .amount { text-align: left; font-weight: 600; direction: ltr; }
    .sub-item { padding-right: 30px !important; color: #888; }
    .sub-amount { color: #888; }
    .total-row td { background: linear-gradient(135deg, #fdf6e3, #fff9ed) !important; font-weight: 800 !important; font-size: 14px !important; color: #1a1a2e; border-top: 2px solid ${accent} !important; }
    .total-amount { color: ${accent} !important; font-size: 16px !important; font-weight: 800 !important; }
    .sig-intro { font-size: 11px; color: #666; margin-bottom: 18px; line-height: 2; }
    .signatures { display: flex; gap: 30px; margin-bottom: 15px; break-inside: avoid; }
    .sig-box { flex: 1; text-align: center; }
    .sig-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .sig-area { height: 85px; border: 2px dashed #d4c8a0; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; background: #fefcf6; }
    .stamp { border: 2px solid ${accent}; padding: 8px 25px; border-radius: 8px; background: rgba(${accentRgb},0.06); text-align: center; }
    .stamp-name { font-size: 20px; font-weight: 900; letter-spacing: 4px; color: ${accent}; }
    .stamp-sub { font-size: 8px; letter-spacing: 2px; color: ${accentDark}; text-transform: uppercase; }
    .sig-client { font-size: 17px; font-weight: 700; color: #1a1a2e; font-style: italic; }
    .sig-name { font-size: 12px; font-weight: 600; color: #555; }
    .sig-date { font-size: 10px; color: #999; margin-top: 3px; }
    .footer-section { margin-top: 35px; padding-top: 15px; border-top: 2px solid ${accent}; text-align: center; }
    .footer-brand { font-size: 11px; font-weight: 700; color: ${accent}; letter-spacing: 3px; margin-bottom: 4px; }
    .footer-text { font-size: 9px; color: #999; line-height: 1.8; }
    @media print { body { background: #fff; } .page { width: 100%; padding: 14mm 16mm; } .frame { top: 8mm; left: 8mm; right: 8mm; bottom: 8mm; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="frame">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
    </div>
    <div class="header">
      <div class="logo">NIXT</div>
      <div class="logo-sub">Digital Solutions</div>
      <div class="ornament"><span class="ornament-line"></span><span class="ornament-diamond">◆</span><span class="ornament-line"></span></div>
      <div class="title">عقد اتفاق لتقديم خدمات</div>
      <div class="subtitle">تصميم وتطوير موقع إلكتروني</div>
      <div class="ornament"><span class="ornament-line"></span><span class="ornament-diamond">◆</span><span class="ornament-line"></span></div>
      <div class="meta-bar">
        <div class="meta-item"><span class="meta-label">رقم العقد</span><span class="meta-value">${contractNumber}</span></div>
        <div class="meta-item"><span class="meta-label">تاريخ التحرير</span><span class="meta-value">${formattedDate}</span></div>
        <div class="meta-item"><span class="meta-label">قيمة العقد</span><span class="meta-value meta-gold">$450</span></div>
      </div>
    </div>
    <div class="section-title">أطراف العقد</div>
    <div class="parties">
      <div class="party-box">
        <div class="party-header"><span>الطرف الأول</span><span class="party-role">مقدم الخدمة</span></div>
        <div class="party-body">
          <div class="party-name">شركة NIXT</div>
          <div class="party-desc">للحلول الرقمية والتقنية</div>
          <div class="party-detail"><span class="party-detail-label">النشاط:</span><span>تصميم وتطوير مواقع الويب</span></div>
          <div class="party-detail"><span class="party-detail-label">التخصص:</span><span>حلول رقمية متكاملة</span></div>
        </div>
      </div>
      <div class="party-box">
        <div class="party-header"><span>الطرف الثاني</span><span class="party-role">العميل</span></div>
        <div class="party-body">
          <div class="party-name" style="color:#1a1a2e">${clientName || '—'}</div>
          ${clientEmail ? `<div class="party-detail"><span class="party-detail-label">البريد:</span><span dir="ltr">${clientEmail}</span></div>` : ''}
          ${projectDesc ? `<div class="party-detail party-detail-col"><span class="party-detail-label">وصف المشروع:</span><span>${projectDesc}</span></div>` : ''}
        </div>
      </div>
    </div>
    <div class="intro-text">تم الاتفاق بين الطرفين المذكورين أعلاه على البنود والشروط التالية، وذلك بناءً على رغبة الطرف الثاني في الحصول على خدمة تصميم وتطوير موقع إلكتروني من الطرف الأول (شركة NIXT)، وقد تراضى الطرفان على ما يلي:</div>
    <div class="section-title">بنود وشروط العقد</div>
    ${clausesHTML}
    <div class="section-title">الملخص المالي</div>
    <table class="finance-table">
      <thead><tr><th>البيان</th><th class="amount-col">المبلغ</th></tr></thead>
      <tbody>
        <tr><td>خدمة تصميم وتطوير الموقع الإلكتروني</td><td class="amount">$450.00</td></tr>
        <tr><td class="sub-item">↩ الدفعة الأولى (عند التوقيع - 50%)</td><td class="amount sub-amount">$225.00</td></tr>
        <tr><td class="sub-item">↩ الدفعة الثانية (عند التسليم - 50%)</td><td class="amount sub-amount">$225.00</td></tr>
        <tr class="total-row"><td>الإجمالي المستحق</td><td class="amount total-amount">$450.00</td></tr>
      </tbody>
    </table>
    <div class="section-title">التوقيع والإقرار</div>
    <p class="sig-intro">بالتوقيع أدناه، يقر كلا الطرفين بأنهما قد قرأا وفهما جميع بنود وشروط هذا العقد، ويوافقان عليها بالكامل، ويلتزمان بتنفيذها وفقاً لما هو منصوص عليه.</p>
    <div class="signatures">
      <div class="sig-box">
        <div class="sig-label">توقيع الطرف الأول</div>
        <div class="sig-area"><div class="stamp"><div class="stamp-name">NIXT</div><div class="stamp-sub">Digital Solutions</div></div></div>
        <div class="sig-name">شركة NIXT</div>
        <div class="sig-date">التاريخ: ${formattedDate}</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">توقيع الطرف الثاني</div>
        <div class="sig-area"><div class="sig-client">${clientName || ''}</div></div>
        <div class="sig-name">${clientName || '—'}</div>
        <div class="sig-date">التاريخ: ${formattedDate}</div>
      </div>
    </div>
    <div class="footer-section">
      <div class="footer-brand">NIXT | Digital Solutions</div>
      <div class="footer-text">هذا العقد محرر من نسختين أصليتين، لكل طرف نسخة للعمل بموجبها.<br>© ${year} NIXT - جميع الحقوق محفوظة. هذا المستند سري وملزم قانونياً.</div>
    </div>
  </div>
</body>
</html>`
}
