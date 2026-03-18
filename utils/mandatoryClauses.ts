import type { ContractClause } from '@/app/dashboard/contract/[contractNumber]/apiFunctions'

// Titles of all mandatory clauses - used to identify them
export const MANDATORY_CLAUSE_TITLES = [
  'نطاق العمل',
  'قيمة العقد',
  'جدول الدفع',
  'مدة التنفيذ',
  'حقوق الملكية الفكرية',
  'عملية التسليم والقبول',
  'آلية الدفع المرتبطة بنسبة التقدم',
  'الإنهاء التلقائي للعقد',
  'حالات تأخير التسليم والتعويض',
  'حق التقاضي',
  'الضمان والصيانة',
  'سرية المعلومات',
  'القوة القاهرة',
  'عدد المراجعات والتعديلات',
  'مخالفة العميل للعقد',
]

/**
 * Check if a clause is mandatory (by its title)
 */
export function isMandatoryClause(title: string): boolean {
  return MANDATORY_CLAUSE_TITLES.includes(title.trim())
}

/**
 * Number of mandatory clauses
 */
export const MANDATORY_CLAUSES_COUNT = MANDATORY_CLAUSE_TITLES.length

interface MandatoryClausesParams {
  price: number
  payNumber: number
  projectDuration?: number | null
  projectDurationUnit?: string | null
  progressTolerance?: number | null
  autoCancelDays?: number | null
  delayCompensation?: number | null
  clientFaultRefund?: number | null
  warrantyPeriod?: number | null
  revisionsAllowed?: number | null
}

/**
 * Generate the 15 mandatory contract clauses with dynamic values.
 * These clauses are required in every contract and cannot be edited or deleted.
 */
export function generateMandatoryClauses(params: MandatoryClausesParams): ContractClause[] {
  const {
    price,
    payNumber,
    projectDuration,
    projectDurationUnit,
    progressTolerance,
    autoCancelDays,
    delayCompensation,
    clientFaultRefund,
    warrantyPeriod,
    revisionsAllowed,
  } = params

  const installmentAmount = payNumber > 0 ? (price / payNumber).toFixed(2) : price.toFixed(2)
  const durationText = projectDuration
    ? `${projectDuration} ${projectDurationUnit === 'weeks' ? 'أسبوع' : projectDurationUnit === 'months' ? 'شهر' : 'يوم عمل'}`
    : '[يتم تحديدها]'
  const toleranceText = progressTolerance != null ? `${progressTolerance}%` : '[يتم تحديدها]%'
  const cancelDaysText = autoCancelDays != null ? `${autoCancelDays}` : '[يتم تحديدها]'
  const delayCompText = delayCompensation != null ? `${delayCompensation}%` : '[يتم تحديدها]%'
  const clientRefundText = clientFaultRefund != null ? `${clientFaultRefund}%` : '70%'
  const clientRefundRemaining = clientFaultRefund != null ? `${100 - clientFaultRefund}%` : '30%'
  const warrantyText = warrantyPeriod != null ? `${warrantyPeriod}` : '[يتم تحديدها]'
  const revisionsText = revisionsAllowed != null ? `${revisionsAllowed}` : '[يتم تحديدها]'

  return [
    {
      title: 'نطاق العمل',
      description: 'يلتزم الطرف الأول بتنفيذ المشروع وفقاً للمواصفات المفصلة في قسم Project Details المرفق بهذا العقد، والذي يُعتبر جزءاً لا يتجزأ منه.',
    },
    {
      title: 'قيمة العقد',
      description: `تبلغ قيمة هذا العقد ${price} دولار أمريكي شاملة ضريبة القيمة المضافة (إن وجدت).`,
    },
    {
      title: 'جدول الدفع',
      description: `يتم سداد قيمة العقد على ${payNumber} دفعات كالتالي:\n\nالدفعة الأولى: ${installmentAmount} دولار عند التوقيع.\nالدفعات المتبقية: ${installmentAmount} دولار لكل دفعة عند إنجاز كل مرحلة (يتم تحديد المراحل في Project Details).`,
    },
    {
      title: 'مدة التنفيذ',
      description: `يلتزم الطرف الأول بإنجاز المشروع وتسليمه خلال ${durationText} تبدأ من تاريخ استلام الدفعة الأولى وكامل المحتويات من الطرف الثاني.`,
    },
    {
      title: 'حقوق الملكية الفكرية',
      description: 'تنتقل كامل حقوق الملكية الفكرية للمشروع إلى الطرف الثاني فور سداد كامل قيمة العقد وتسليم المشروع النهائي.',
    },
    {
      title: 'عملية التسليم والقبول',
      description: 'يتم التسليم على مراحل. يحق للعميل مراجعة كل مرحلة خلال 5 أيام عمل. في حال عدم الرد يُعتبر المرحلة مقبولة تلقائياً. التسليم النهائي يكون بعد سداد آخر دفعة.',
    },
    {
      title: 'آلية الدفع المرتبطة بنسبة التقدم',
      description: `يرتبط كل دفعة بنسبة إنجاز محددة في Progress Timeline.\nيحق للطرف الأول الاستمرار في العمل حتى ${toleranceText} فوق النسبة المدفوعة.\nفي حال تأخر الدفع، يتوقف العمل عند أقرب نقطة إنجاز بعد هذه النسبة حتى يتم الدفع. يُحدث الـ Progress Timeline تلقائياً.`,
    },
    {
      title: 'الإنهاء التلقائي للعقد',
      description: `في حال عدم سداد أي دفعة لمدة ${cancelDaysText} يوماً تقويمياً متتالية، يُلغى العقد تلقائياً.\nتحتفظ شركة NIXT بكامل المبالغ المدفوعة، ولا يحق للعميل الحصول على المشروع أو أي ملفات تم إنجازها.`,
    },
    {
      title: 'حالات تأخير التسليم والتعويض',
      description: `إذا تأخرت الشركة عن التسليم:\n- يتم التفاوض على تعويض (إطالة ضمان، إضافة ميزات...).\n- إذا رفض العميل → يسترد كامل أمواله + ${delayCompText} من قيمة العقد.\n\nإذا كان التأخير بسبب العميل:\n- تحتفظ الشركة بـ ${clientRefundText} من المبالغ المدفوعة.\n- يسترد العميل ${clientRefundRemaining} فقط.\n- لا يحق له استلام المشروع أو أي جزء منه.`,
    },
    {
      title: 'حق التقاضي',
      description: 'يحق للعميل رفع دعوى قضائية في حال مخالفة الشركة لأي بند. في هذه الحالة تتحمل شركة NIXT كامل تكاليف الدعوى والمحاماة.',
    },
    {
      title: 'الضمان والصيانة',
      description: `تقدم شركة NIXT ضماناً مجانياً لمدة ${warrantyText} أشهر من تاريخ التسليم النهائي على إصلاح أي أخطاء تقنية أو برمجية. أي صيانة إضافية بعد هذه المدة تكون بمقابل مالي باتفاق جديد.`,
    },
    {
      title: 'سرية المعلومات',
      description: 'يتعهد كلا الطرفين بعدم إفشاء أي معلومات أو أكواد أو تصميمات حصل عليها أثناء التعاقد لأي طرف ثالث، ويظل هذا الالتزام سارياً لمدة 3 سنوات بعد انتهاء العقد.',
    },
    {
      title: 'القوة القاهرة',
      description: `في حال وقوع حدث قوة قاهرة (حرب، كارثة طبيعية، حظر حكومي، جائحة، أو أي حدث خارج عن إرادة الطرفين ومعترف به قانوناً):\n\nإذا أثر الحدث على الطرف الثاني (العميل) ومنعه من سداد الدفعات: يتم تمديد مهلة سداد الدفعات المتأخرة إلى ضعف مدة ${cancelDaysText} يوم تقويمي. فإذا انقضت المهلة دون سداد، يحق للشركة إلغاء العقد، مع الاحتفاظ بالمبالغ المدفوعة مقابل نسبة التقدم الفعلية الموثقة في Progress Timeline، ورد الباقي للعميل خلال 14 يوم عمل.\n\nإذا أثر الحدث على الطرف الأول (الشركة) ومنعها من إكمال المشروع: تقوم الشركة بإخطار العميل كتابياً خلال 48 ساعة، وترد كامل المبالغ المدفوعة خلال 14 يوم عمل دون تسليم المشروع أو أي جزء منه.`,
    },
    {
      title: 'عدد المراجعات والتعديلات',
      description: `يحق للعميل ${revisionsText} مراجعات مجانية فقط. لا يتم قبول أي ميزات أو طلبات إضافية خارج ما هو مكتوب بدقة في قسم Project Details. أي طلب إضافي يتطلب عقد أو ملحق جديد مدفوع.`,
    },
    {
      title: 'مخالفة العميل للعقد',
      description: `إذا ارتكب الطرف الثاني (العميل) مخالفة جوهرية لأي بند من بنود هذا العقد (مثل تأخير الدفع لأكثر من ${cancelDaysText} يوم، أو عدم تقديم المحتوى المطلوب، أو طلبات خارج نطاق Project Details)، يحق للطرف الأول (الشركة) إلغاء العقد بعد إرسال إنذار كتابي مدته 7 أيام.\nفي حال الإلغاء:\n- تحتفظ الشركة بالمبالغ المدفوعة مقابل نسبة التقدم الفعلية الموثقة في Progress Timeline.\n- يتم رد الباقي للعميل خلال 14 يوم عمل.\n- لا يحق للعميل استلام المشروع أو أي ملفات أو أكواد تم إنجازها حتى تاريخ الإلغاء.`,
    },
  ]
}
