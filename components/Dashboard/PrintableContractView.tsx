'use client'

import { forwardRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import styles from './PrintableContractView.module.css'
import { generateContractHTML } from '@/utils/contractHTML'
import { generateMandatoryClauses } from '@/utils/mandatoryClauses'
import { type Contract } from '@/app/dashboard/contract/[contractNumber]/apiFunctions'

interface Theme {
  accent: string
  accentDark: string
  accentRgb: string
  [key: string]: string
}

interface ContractClauseData {
  title: string
  description: string
}

interface PrintableContractViewProps {
  clientName: string
  clientEmail: string
  projectDesc: string
  project?: Contract
  projectName?: string
  contractNumber: string
  formattedDate: string
  price?: number
  payNumber?: number
  clauses?: ContractClauseData[]
  projectDetails?: ContractClauseData[]
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
  theme: Theme
  onClose: () => void
}

const bufferToDataUrl = (bufferObj?: { type: string, data: number[] } | null): string | null => {
  if (!bufferObj?.data) return null;
  try {
    const bytes = new Uint8Array(bufferObj.data);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + chunkSize)));
    }
    return `data:image/png;base64,${btoa(binary)}`;
  } catch (err) {
    console.error('Error converting buffer to image', err);
    return null;
  }
}

const PrintableContractView = forwardRef<HTMLDivElement, PrintableContractViewProps>(
  ({ clientName, clientEmail, projectDesc, project, projectName, contractNumber, formattedDate, price: priceParam, payNumber: payNumberParam, clauses: clausesParam, projectDetails: projectDetailsParam, projectDuration, projectDurationUnit, revisionsAllowed, warrantyPeriod, autoCancelDays, progressTolerance, delayCompensation, clientFaultRefund, progressTimelineLink, clientSignatureImage, theme, onClose }, ref) => {
    const year = new Date().getFullYear()
    const contractPrice = priceParam ?? 450
    const payNumber = payNumberParam ?? 2
    const paymentPerInstallment = payNumber > 0 ? contractPrice / payNumber : contractPrice
    const displayProjectName = projectName || 'تصميم وتطوير موقع إلكتروني'

    console.log('Rendering PrintableContractView with props:', project)

    clientSignatureImage = bufferToDataUrl(project?.signature_white || project?.signature_blue || project?.signature_black) || clientSignatureImage

    // Use dynamic clauses from props or fall back to mandatory defaults
    const displayClauses = (clausesParam && clausesParam.length > 0)
      ? clausesParam.map(c => ({ title: c.title, content: c.description }))
      : generateMandatoryClauses({
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

    const handleSavePDF = () => {
      const htmlContent = generateContractHTML({
        clientName,
        clientEmail,
        projectDesc,
        projectName,
        contractNumber,
        formattedDate,
        year,
        price: contractPrice,
        payNumber,
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
      })

      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '-9999px'
      iframe.style.top = '-9999px'
      iframe.style.width = '210mm'
      iframe.style.height = '297mm'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || (iframe.contentWindow as Window).document
      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      iframe.onload = () => {
        setTimeout(() => {
          (iframe.contentWindow as Window).focus();
          (iframe.contentWindow as Window).print()
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 1000)
        }, 500)
      }
    }

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
              <h2 className={styles.contractSubtitle}>{displayProjectName}</h2>

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
                  <span className={`${styles.metaValue} ${styles.gold}`}>${contractPrice}$</span>
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
              {displayClauses.map((clause, i) => (
                <div key={i} className={styles.clause}>
                  <div className={styles.clauseHeader}>
                    <span className={styles.clauseNum}>البند {i + 1}</span>
                    <span className={styles.clauseTitleText}>{clause.title}</span>
                  </div>
                  <p className={styles.clauseText}>{clause.content}</p>
                </div>
              ))}
            </div>

            {projectDetailsParam && projectDetailsParam.length > 0 && (
              <>
                <div className={styles.sectionTitle}>تفاصيل المشروع</div>
                <div className={styles.clausesList}>
                  {projectDetailsParam.map((detail, i) => (
                    <div key={i} className={styles.clause}>
                      <div className={styles.clauseHeader}>
                        <span className={styles.clauseNum}>{i + 1}</span>
                        <span className={styles.clauseTitleText}>{detail.title}</span>
                      </div>
                      <p className={styles.clauseText}>{detail.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Contract Extra Details */}
            {(projectDuration || revisionsAllowed || warrantyPeriod || autoCancelDays || progressTolerance != null || delayCompensation != null || clientFaultRefund != null || progressTimelineLink) && (
              <>
                <div className={styles.sectionTitle}>تفاصيل إضافية للعقد</div>
                <table className={styles.financeTable}>
                  <thead>
                    <tr>
                      <th>البيان</th>
                      <th className={styles.amountCol}>القيمة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDuration != null && (
                      <tr>
                        <td>⏱️ مدة التنفيذ</td>
                        <td className={styles.amount}>{projectDuration} {projectDurationUnit === 'days' ? 'يوم' : projectDurationUnit === 'weeks' ? 'أسبوع' : projectDurationUnit === 'months' ? 'شهر' : projectDurationUnit || 'يوم'}</td>
                      </tr>
                    )}
                    {revisionsAllowed != null && (
                      <tr>
                        <td>✏️ عدد التعديلات المسموحة</td>
                        <td className={styles.amount}>{revisionsAllowed} تعديلات</td>
                      </tr>
                    )}
                    {warrantyPeriod != null && (
                      <tr>
                        <td>🛡️ فترة الضمان</td>
                        <td className={styles.amount}>{warrantyPeriod} أشهر</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

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
                  <td>خدمة {displayProjectName}</td>
                  <td className={styles.amount}>${contractPrice.toFixed(2)}</td>
                </tr>
                {Array.from({ length: payNumber }, (_, i) => {
                  const percent = Math.round(100 / payNumber)
                  return (
                    <tr key={i}>
                      <td className={styles.subItem}>↩ الدفعة {i + 1} ({percent}%)</td>
                      <td className={`${styles.amount} ${styles.subAmount}`}>${paymentPerInstallment.toFixed(2)}</td>
                    </tr>
                  )
                })}
                <tr className={styles.totalRow}>
                  <td>الإجمالي المستحق</td>
                  <td className={`${styles.amount} ${styles.totalAmount}`}>${contractPrice.toFixed(2)}</td>
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
                  {clientSignatureImage ? (
                    <Image
                      src={clientSignatureImage || bufferToDataUrl(project?.signature_white || project?.signature_blue || project?.signature_black) || ''}
                      alt="Client Signature"
                      width={200}
                      height={50}
                      style={{ maxWidth: '100%', maxHeight: '50px', objectFit: 'contain', height: 'auto', width: 'auto' }}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.sigClientName}>{clientName}</div>
                  )}
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
    )
  }
)

PrintableContractView.displayName = 'PrintableContractView'

export default PrintableContractView
