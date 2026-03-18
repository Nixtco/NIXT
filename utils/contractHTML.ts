import { generateMandatoryClauses } from './mandatoryClauses'

interface ContractClause {
  title: string
  description: string
}

interface ContractHTMLParams {
  clientName: string
  clientEmail: string
  projectDesc: string
  projectName?: string
  contractNumber: string
  formattedDate: string
  year: number
  price?: number
  payNumber?: number
  clauses?: ContractClause[]
  projectDetails?: ContractClause[]
  projectDuration?: number | null
  projectDurationUnit?: string | null
  revisionsAllowed?: number | null
  warrantyPeriod?: number | null
  autoCancelDays?: number | null
  progressTolerance?: number | null
  delayCompensation?: number | null
  clientFaultRefund?: number | null
  progressTimelineLink?: string | null
  clientSignatureImage?: string | null
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
  projectName,
  contractNumber,
  formattedDate,
  year,
  price: priceParam,
  payNumber: payNumberParam,
  clauses: clausesParam,
  projectDetails: projectDetailsParam,
  projectDuration,
  projectDurationUnit,
  revisionsAllowed,
  warrantyPeriod,
  autoCancelDays,
  progressTolerance,
  delayCompensation,
  clientFaultRefund,
  progressTimelineLink,
  clientSignatureImage,
  theme,
}: ContractHTMLParams): string {
  const accent = theme?.accent || '#14b8a6'
  const accentDark = theme?.accentDark || '#0d9488'
  const accentRgb = theme?.accentRgb || '20, 184, 166'
  const contractPrice = priceParam ?? 450
  const payNumber = payNumberParam ?? 2
  const paymentPerInstallment = payNumber > 0 ? contractPrice / payNumber : contractPrice
  const displayProjectName = projectName || 'تصميم وتطوير موقع إلكتروني'

  const defaultClauses = generateMandatoryClauses({
    price: contractPrice,
    payNumber,
    projectDuration,
    projectDurationUnit,
    progressTolerance,
    autoCancelDays,
    delayCompensation,
    clientFaultRefund,
    warrantyPeriod,
    revisionsAllowed,
  }).map(c => ({ title: c.title, content: c.description }))

  const clauses = (clausesParam && clausesParam.length > 0)
    ? clausesParam.map(c => ({ title: c.title, content: c.description }))
    : defaultClauses

  const clausesHTML = clauses.map((c, i) => `
    <div style="padding:12px 15px;border:1px solid #f0ebe0;border-radius:8px;background:#fefdfb;margin-bottom:8px;break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="font-size:9px;font-weight:700;color:${accent};border:1px solid ${accent};padding:2px 10px;border-radius:20px;white-space:nowrap;">البند ${i + 1}</span>
        <span style="font-size:13px;font-weight:700;color:#1a1a2e;">${c.title}</span>
      </div>
      <p style="margin:0;padding-right:5px;font-size:12px;line-height:2;color:#444;">${c.content}</p>
    </div>
  `).join('')

  const projectDetailsHTML = (projectDetailsParam && projectDetailsParam.length > 0)
    ? `<div class="section-title">تفاصيل المشروع</div>
    ${projectDetailsParam.map((d, i) => `
    <div style="padding:12px 15px;border:1px solid #f0ebe0;border-radius:8px;background:#fefdfb;margin-bottom:8px;break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="font-size:9px;font-weight:700;color:${accent};border:1px solid ${accent};padding:2px 10px;border-radius:20px;white-space:nowrap;">${i + 1}</span>
        <span style="font-size:13px;font-weight:700;color:#1a1a2e;">${d.title}</span>
      </div>
      <p style="margin:0;padding-right:5px;font-size:12px;line-height:2;color:#444;">${d.description}</p>
    </div>
  `).join('')}`
    : ''

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
    .stamp { border: 2px solid ${accent}; padding: 0px 40px; border-radius: 8px; background: rgba(${accentRgb},0.06); text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 90%; opacity: .3; line-height: 1; }
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
      <div class="subtitle">${displayProjectName}</div>
      <div class="ornament"><span class="ornament-line"></span><span class="ornament-diamond">◆</span><span class="ornament-line"></span></div>
      <div class="meta-bar">
        <div class="meta-item"><span class="meta-label">رقم العقد</span><span class="meta-value">${contractNumber}</span></div>
        <div class="meta-item"><span class="meta-label">تاريخ التحرير</span><span class="meta-value">${formattedDate}</span></div>
        <div class="meta-item"><span class="meta-label">قيمة العقد</span><span class="meta-value meta-gold">$${contractPrice}</span></div>
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
    ${projectDetailsHTML}
    ${(() => {
      const rows: string[] = []
      if (projectDuration != null) {
        const unitLabel = projectDurationUnit === 'days' ? 'يوم' : projectDurationUnit === 'weeks' ? 'أسبوع' : projectDurationUnit === 'months' ? 'شهر' : projectDurationUnit || 'يوم'
        rows.push(`<tr><td>⏱️ مدة التنفيذ</td><td class="amount">${projectDuration} ${unitLabel}</td></tr>`)
      }
      if (revisionsAllowed != null) rows.push(`<tr><td>✏️ عدد التعديلات المسموحة</td><td class="amount">${revisionsAllowed} تعديلات</td></tr>`)
      if (warrantyPeriod != null) rows.push(`<tr><td>🛡️ فترة الضمان</td><td class="amount">${warrantyPeriod} أشهر</td></tr>`)
      if (autoCancelDays != null) rows.push(`<tr><td>🚫 الإلغاء التلقائي بعد</td><td class="amount">${autoCancelDays} يوم</td></tr>`)
      if (progressTolerance != null) rows.push(`<tr><td>📊 نسبة التسامح في التقدم</td><td class="amount">${progressTolerance}%</td></tr>`)
      if (delayCompensation != null) rows.push(`<tr><td>⚖️ تعويض التأخير</td><td class="amount">${delayCompensation}%</td></tr>`)
      if (clientFaultRefund != null) rows.push(`<tr><td>💸 نسبة الاسترداد (خطأ العميل)</td><td class="amount">${clientFaultRefund}%</td></tr>`)
      if (progressTimelineLink) rows.push(`<tr><td>🔗 رابط متابعة سير المشروع</td><td class="amount"><a href="${progressTimelineLink}" target="_blank" style="color:${accent};text-decoration:underline;">فتح الرابط</a></td></tr>`)
      if (rows.length === 0) return ''
      return `<div class="section-title">تفاصيل إضافية للعقد</div>
      <table class="finance-table">
        <thead><tr><th>البيان</th><th class="amount-col">القيمة</th></tr></thead>
        <tbody>${rows.join('\n        ')}</tbody>
      </table>`
    })()}
    <div class="section-title">الملخص المالي</div>
    <table class="finance-table">
      <thead><tr><th>البيان</th><th class="amount-col">المبلغ</th></tr></thead>
      <tbody>
        <tr><td>${displayProjectName}</td><td class="amount">$${contractPrice.toFixed(2)}</td></tr>
        ${Array.from({ length: payNumber }, (_, i) => `<tr><td class="sub-item">↩ الدفعة ${i + 1} ${i === 0 ? '(عند التوقيع)' : i === payNumber - 1 ? '(عند التسليم)' : ''}</td><td class="amount sub-amount">$${paymentPerInstallment.toFixed(2)}</td></tr>`).join('\n        ')}
        <tr class="total-row"><td>الإجمالي المستحق</td><td class="amount total-amount">$${contractPrice.toFixed(2)}</td></tr>
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
        <div class="sig-area">
          ${clientSignatureImage ? `<img src="${clientSignatureImage}" alt="Client Signature" style="max-width: 100%; max-height: 50px; object-fit: contain;" />` : `<div class="sig-client">${clientName || ''}</div>`}
        </div>
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
