export type FinanceTransactionType = 'income' | 'withdrawal' | 'expense' | 'refund'

export type ExpenseCategory =
  | 'server'
  | 'domain'
  | 'hosting'
  | 'software'
  | 'marketing'
  | 'salaries'
  | 'other'

export interface FinanceTransaction {
  id: string
  type: FinanceTransactionType
  amount: number
  date: string
  notes?: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
  projectId?: string
  projectName?: string
  adminUserId?: string
  adminName?: string
  expenseCategory?: ExpenseCategory
  expenseCategoryCustom?: string
}

export const FINANCE_STORAGE_KEY = 'nixt_financial_transactions'

export const EXPENSE_CATEGORIES: {
  key: ExpenseCategory
  labelAr: string
  labelEn: string
}[] = [
  { key: 'server', labelAr: 'خادم', labelEn: 'Server' },
  { key: 'domain', labelAr: 'دومين', labelEn: 'Domain' },
  { key: 'hosting', labelAr: 'استضافة', labelEn: 'Hosting' },
  { key: 'software', labelAr: 'برمجيات', labelEn: 'Software' },
  { key: 'marketing', labelAr: 'تسويق', labelEn: 'Marketing' },
  { key: 'salaries', labelAr: 'رواتب', labelEn: 'Salaries' },
  { key: 'other', labelAr: 'أخرى', labelEn: 'Other' },
]

export const FINANCE_TYPE_META: Record<
  FinanceTransactionType,
  { color: string; sign: '+' | '-' }
> = {
  income: { color: '#00C781', sign: '+' },
  withdrawal: { color: '#7042F8', sign: '-' },
  expense: { color: '#FF4444', sign: '-' },
  refund: { color: '#FF8C00', sign: '-' },
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function loadFinancialTransactions(): FinanceTransaction[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(FINANCE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFinancialTransactions(transactions: FinanceTransaction[]) {
  if (!isBrowser()) return
  localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(transactions))
}

export function addFinancialTransaction(
  transaction: Omit<FinanceTransaction, 'id' | 'createdAt'>
): FinanceTransaction {
  const newTx: FinanceTransaction = {
    ...transaction,
    id: `fin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  const all = loadFinancialTransactions()
  all.unshift(newTx)
  saveFinancialTransactions(all)
  return newTx
}

export function deleteFinancialTransaction(id: string) {
  const all = loadFinancialTransactions().filter(t => t.id !== id)
  saveFinancialTransactions(all)
}

export function getExpenseCategoryLabel(
  category: ExpenseCategory,
  custom?: string,
  isRTL = false
): string {
  if (category === 'other' && custom?.trim()) return custom.trim()
  const found = EXPENSE_CATEGORIES.find(c => c.key === category)
  if (!found) return category
  return isRTL ? found.labelAr : found.labelEn
}

export function getTransactionReference(
  tx: FinanceTransaction,
  isRTL = false
): string {
  switch (tx.type) {
    case 'income':
    case 'refund':
      return tx.projectName || (isRTL ? 'مشروع غير محدد' : 'Unassigned project')
    case 'withdrawal':
      return tx.adminName || (isRTL ? 'مسؤول غير محدد' : 'Unassigned admin')
    case 'expense':
      return tx.expenseCategory
        ? getExpenseCategoryLabel(tx.expenseCategory, tx.expenseCategoryCustom, isRTL)
        : isRTL ? 'غير محدد' : 'Unassigned'
    default:
      return '-'
  }
}
// just for upload in github
export function getTransactionDescription(tx: FinanceTransaction, isRTL = false): string {
  const typeLabels: Record<FinanceTransactionType, { ar: string; en: string }> = {
    income: { ar: 'إيراد', en: 'Income' },
    withdrawal: { ar: 'سحب', en: 'Withdrawal' },
    expense: { ar: 'مصروف', en: 'Expense' },
    refund: { ar: 'إرجاع', en: 'Refund' },
  }
  const ref = getTransactionReference(tx, isRTL)
  const label = isRTL ? typeLabels[tx.type].ar : typeLabels[tx.type].en
  if (tx.notes?.trim()) return tx.notes.trim()
  return isRTL ? `${label}: ${ref}` : `${label}: ${ref}`
}

export interface FinanceProjectLike {
  id: string
  name?: string
  price?: number
  spent?: number
  status?: string
  user_id?: string
  created_at?: string
  start_date?: string | null
}

export function buildFinanceTransactionsFromProjects(
  projects: FinanceProjectLike[] = [],
  isRTL = false
): FinanceTransaction[] {
  return projects.flatMap((project) => {
    const projectName = project.name?.trim() || (isRTL ? 'مشروع غير محدد' : 'Untitled project')
    const revenueAmount = Number(project.price) || 0
    const expenseAmount = Number(project.spent) || 0
    const createdAt = project.created_at || project.start_date || new Date().toISOString()
    const isCompleted = String(project.status || '').toLowerCase() === 'completed'

    const transactions: FinanceTransaction[] = []

    if (revenueAmount > 0) {
      transactions.push({
        id: `project-${project.id}-income`,
        type: 'income',
        amount: revenueAmount,
        date: createdAt,
        status: isCompleted ? 'completed' : 'pending',
        createdAt,
        projectId: project.id,
        projectName,
      })
    }

    if (expenseAmount > 0) {
      transactions.push({
        id: `project-${project.id}-expense`,
        type: 'expense',
        amount: expenseAmount,
        date: createdAt,
        status: isCompleted ? 'completed' : 'pending',
        createdAt,
        projectId: project.id,
        projectName,
      })
    }

    return transactions
  })
}

export function computeFinanceStats(transactions: FinanceTransaction[]) {
  const completed = transactions.filter(t => t.status === 'completed')
  const pending = transactions.filter(t => t.status === 'pending')

  const sumByType = (type: FinanceTransactionType, list = completed) =>
    list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0)

  const totalIncome = sumByType('income')
  const totalWithdrawals = sumByType('withdrawal')
  const totalExpenses = sumByType('expense')
  const totalRefunds = sumByType('refund')
  const pendingIncome = sumByType('income', pending)

  const totalOutflow = totalWithdrawals + totalExpenses + totalRefunds
  const netBalance = totalIncome - totalOutflow

  return {
    totalIncome,
    totalWithdrawals,
    totalExpenses,
    totalRefunds,
    totalOutflow,
    netBalance,
    pendingIncome,
    totalRevenue: totalIncome,
    pendingRevenue: pendingIncome,
    netProfit: netBalance,
  }
}

export function exportTransactionsToCsv(
  transactions: FinanceTransaction[],
  isRTL = false
): string {
  const headers = isRTL
    ? ['النوع', 'المرجع', 'المبلغ', 'التاريخ', 'الحالة', 'ملاحظات']
    : ['Type', 'Reference', 'Amount', 'Date', 'Status', 'Notes']

  const typeLabels: Record<FinanceTransactionType, { ar: string; en: string }> = {
    income: { ar: 'إيراد', en: 'Income' },
    withdrawal: { ar: 'سحب', en: 'Withdrawal' },
    expense: { ar: 'مصروف', en: 'Expense' },
    refund: { ar: 'إرجاع', en: 'Refund' },
  }

  const rows = transactions.map(tx => {
    const typeLabel = isRTL ? typeLabels[tx.type].ar : typeLabels[tx.type].en
    const sign = FINANCE_TYPE_META[tx.type].sign
    return [
      typeLabel,
      getTransactionReference(tx, isRTL),
      `${sign}${tx.amount}`,
      tx.date.slice(0, 10),
      tx.status,
      tx.notes || '',
    ]
  })

  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
  return [headers, ...rows].map(row => row.map(escape).join(',')).join('\n')
}
