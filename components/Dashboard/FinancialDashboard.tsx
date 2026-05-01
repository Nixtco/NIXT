'use client'

import { FC, useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import { useLanguage } from '@/hooks/useLanguage'
import { apiCall } from '@/hooks/useApi'

interface FinancialReport {
  sales: {
    today: number
    thisMonth: number
    lastMonth: number
    change: number
  }
  revenue: {
    total: number
    thisMonth: number
    pending: number
  }
  invoices: {
    paid: number
    pending: number
    overdue: number
  }
  recentTransactions: Array<{
    id: string
    description: string
    descriptionEn: string
    amount: number
    date: string
    status: 'paid' | 'pending' | 'failed'
  }>
}

const FinancialDashboard: FC = () => {
  const { t, language } = useLanguage()
  const isRTL = language === 'ar'

  const [financial, setFinancial] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await apiCall<{ success: boolean; data: any[] }>('/api/v1/projects?limit=1000')
        const projects = (res && res.data) || []

        // Helper to parse decimal string/number
        const toNum = (v: any) => {
          if (v === null || v === undefined) return 0
          if (typeof v === 'number') return v
          const n = parseFloat(String(v))
          return Number.isNaN(n) ? 0 : n
        }

        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        let salesToday = 0
        let salesThisMonth = 0
        let salesLastMonth = 0

        let revenueTotal = 0
        let revenueThisMonth = 0
        let revenuePending = 0

        let invoicesPaid = 0
        let invoicesPending = 0
        let invoicesOverdue = 0

        const recentTransactions: FinancialReport['recentTransactions'] = []

        projects.forEach(p => {
          const price = toNum(p.price)
          const spent = toNum(p.spent)
          const created = p.created_at ? new Date(p.created_at) : (p.start_date ? new Date(p.start_date) : null)

          revenueTotal += price
          const remaining = Math.max(0, price - spent)
          revenuePending += remaining

          if (spent >= price) invoicesPaid += 1
          else invoicesPending += 1

          if (p.status === 'onhold' || p.status === 'cancelled') invoicesOverdue += 1

          if (created) {
            if (created >= thisMonthStart) {
              salesThisMonth += price
              revenueThisMonth += price
            }
            if (created >= lastMonthStart && created < thisMonthStart) {
              salesLastMonth += price
            }
            const today = new Date()
            if (created.toDateString() === today.toDateString()) {
              salesToday += price
            }
          }

          recentTransactions.push({
            id: p.id,
            description: p.name || p.title || 'Project',
            descriptionEn: p.name || p.title || 'Project',
            amount: spent || price,
            date: (p.created_at || p.start_date) || new Date().toISOString(),
            status: spent >= price ? 'paid' : 'pending'
          })
        })

        const change = salesLastMonth === 0 ? 0 : ((salesThisMonth - salesLastMonth) / Math.max(1, salesLastMonth)) * 100

        setFinancial({
          sales: {
            today: Math.round(salesToday),
            thisMonth: Math.round(salesThisMonth),
            lastMonth: Math.round(salesLastMonth),
            change: Math.round(change * 10) / 10
          },
          revenue: {
            total: Math.round(revenueTotal),
            thisMonth: Math.round(revenueThisMonth),
            pending: Math.round(revenuePending)
          },
          invoices: {
            paid: invoicesPaid,
            pending: invoicesPending,
            overdue: invoicesOverdue
          },
          recentTransactions: recentTransactions.slice(0, 10)
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#00C781'
      case 'pending': return '#FF8C00'
      case 'failed': return '#FF4444'
      default: return '#666'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return t.financial.paid
      case 'pending': return t.financial.pending
      case 'failed': return t.financial.failed
      default: return status
    }
  }

  if (loading) return <div className={styles.section}>{t.loading || 'جارٍ التحميل...'}</div>
  if (error) return <div className={styles.section}>Error: {error}</div>
  if (!financial) return <div className={styles.section}>{t.financial.noData || 'لا توجد بيانات'}</div>
  const f = financial

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle} style={{ textAlign: isRTL ? 'right' : 'start' }}>{t.financial.title}</h2>
      
      <div className={styles.financialGrid}>
        {/* Sales Overview */}
        <div className={styles.statCard}>
          <h4 style={{ textAlign: isRTL ? 'right' : 'start' }}>{t.financial.salesOverview}</h4>
          <div className={styles.statNumbers}>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.today}</span>
              <span>${f.sales.today.toLocaleString()}</span>
            </div>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.thisMonth}</span>
              <span>${f.sales.thisMonth.toLocaleString()}</span>
            </div>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.lastMonth}</span>
              <span>${f.sales.lastMonth.toLocaleString()}</span>
            </div>
          </div>
          <div className={`${styles.changeIndicator} ${f.sales.change >= 0 ? styles.positive : styles.negative}`}>
            {f.sales.change >= 0 ? '↗' : '↘'} {Math.abs(f.sales.change)}%
          </div>
        </div>

        {/* Revenue */}
        <div className={styles.statCard}>
          <h4 style={{ textAlign: isRTL ? 'right' : 'start' }}>{t.financial.revenue}</h4>
          <div className={styles.bigStat}>
            ${f.revenue.total.toLocaleString()}
          </div>
          <div className={styles.statNumbers}>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.thisMonth}</span>
              <span>${f.revenue.thisMonth.toLocaleString()}</span>
            </div>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.pending}</span>
              <span>${f.revenue.pending.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className={styles.statCard}>
          <h4 style={{ textAlign: isRTL ? 'right' : 'start' }}>{t.financial.invoices}</h4>
          <div className={styles.statNumbers}>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.paid}</span>
              <span>{f.invoices.paid}</span>
            </div>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.pending}</span>
              <span>{f.invoices.pending}</span>
            </div>
            <div className={styles.statItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <span>{t.financial.overdue}</span>
              <span>{f.invoices.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.transactionsSection}>
        <h3 style={{ textAlign: isRTL ? 'right' : 'start' }}>{t.financial.recentTransactions}</h3>
        <div className={styles.transactionsList}>
          {f.recentTransactions.map((transaction) => (
            <div key={transaction.id} className={styles.transactionItem} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <div className={styles.transactionInfo} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <span className={styles.transactionDesc}>
                  {isRTL ? transaction.description : transaction.descriptionEn}
                </span>
                <span className={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString(language)}
                </span>
              </div>
              <div className={styles.transactionAmount}>
                ${transaction.amount.toLocaleString()}
              </div>
              <span 
                className={styles.transactionStatus}
                style={{ color: getStatusColor(transaction.status) }}
              >
                {getStatusText(transaction.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinancialDashboard