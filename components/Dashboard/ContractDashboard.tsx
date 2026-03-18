'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import PrintableContractView from './PrintableContractView'
import styles from './ContractDashboard.module.css'
import {
  type Contract,
  getMyContracts,
  getContractByNumber,
  getContractsByProjectId,
  signContract,
} from '@/app/dashboard/contract/[contractNumber]/apiFunctions'
import { isMandatoryClause } from '@/utils/mandatoryClauses'

const theme = {
  accent: '#14b8a6',
  accentLight: '#2dd4bf',
  accentDark: '#0d9488',
  accentLighter: '#5eead4',
  accentRgb: '20, 184, 166',
}

const defaultClauseIcons = ['🎯', '💰', '📅', '⏱️', '🔐', '✏️', '🛡️', '🔒', '⚖️', '🤝']

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

const ContractDashboard = ({ contractNumber: contractNumberProp }: { contractNumber?: string }) => {
  // Contract data from backend
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [agreedFirst, setAgreedFirst] = useState(false)
  const [agreedSecond, setAgreedSecond] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)
  const [signingLoading, setSigningLoading] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [displayPrice, setDisplayPrice] = useState(0)
  const [priceAnimated, setPriceAnimated] = useState(false)
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({})

  // Signature Canvas state
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch user's contracts from backend
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (contractNumberProp) {
        // Try to fetch by contract number first
        // try {
        //   const res = await getContractByNumber(contractNumberProp)
        //   if (res.success && res.data) {
        //     setContracts([res.data])
        //     setSelectedContract(res.data)
        //     return
        //   }
        // } catch {
        //   // Not a contract number, try as project ID
        // }
        // Fallback: fetch by project ID
        try {
          const res = await getContractsByProjectId(contractNumberProp)
          if (res.success && res.data.length > 0) {
            setContracts([res.data[0]])
            setSelectedContract(res.data[0])
            return
          }
        } catch {
          // ignore
        }
        setContracts([])
        setSelectedContract(null)
      } else {
        const res = await getMyContracts({ limit: 50 })
        if (res.success && res.data.length > 0) {
          setContracts(res.data)
          if (!selectedContract) {
            setSelectedContract(res.data[0])
          }
        } else if (res.success && res.data.length === 0) {
          setContracts([])
        }
      }
    } catch (err) {
      setError('فشل في تحميل العقود')
      console.error('Error fetching contracts:', err)
    } finally {
      setLoading(false)
    }
  }, [contractNumberProp, selectedContract])

  useEffect(() => {
    fetchContracts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Derived data from selected contract
  const signed = selectedContract?.status === 'active' || selectedContract?.status === 'completed'
  const clientName = selectedContract?.client_name || ''
  const clientEmail = selectedContract?.client_email || ''
  const projectDesc = selectedContract?.description || ''
  const contractNumber = selectedContract?.contract_number || ''
  const contractPrice = parseFloat(selectedContract?.price.toString() || '0') || 0
  const payNumber = selectedContract?.pay_number || 2
  const clauses = selectedContract?.clauses || []
  const projectDetails = selectedContract?.project_details || []
  const projectDuration = selectedContract?.project_duration ?? null
  const projectDurationUnit = selectedContract?.project_duration_unit ?? null
  const revisionsAllowed = selectedContract?.revisions_allowed ?? null
  const warrantyPeriod = selectedContract?.warranty_period ?? null
  const autoCancelDays = selectedContract?.auto_cancel_days ?? null
  const progressTolerance = selectedContract?.progress_tolerance ?? null
  const delayCompensation = selectedContract?.delay_compensation ?? null
  const clientFaultRefund = selectedContract?.client_fault_refund ?? null
  const progressTimelineLink = selectedContract?.progress_timeline_link ?? null
  console.log('Selected Contract:', selectedContract)

  const contractDate = selectedContract?.created_at ? new Date(selectedContract.created_at) : new Date()
  const formattedDate = format(contractDate, 'dd MMMM yyyy', { locale: ar })

  // Animated price counter
  useEffect(() => {
    if (priceAnimated || !selectedContract) return
    const target = contractPrice
    const duration = 1800
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayPrice(Math.round(target * eased))
      if (progress >= 1) {
        clearInterval(timer)
        setPriceAnimated(true)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [priceAnimated, contractPrice, selectedContract])

  // Reset price animation when contract changes
  useEffect(() => {
    setPriceAnimated(false)
    setDisplayPrice(0)
  }, [selectedContract?.id])

  const handleCopyContract = useCallback(() => {
    navigator.clipboard.writeText(contractNumber).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [contractNumber])

  const toggleClause = useCallback((index: number) => {
    setExpandedClauses(prev => ({ ...prev, [index]: !prev[index] }))
  }, [])

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY
    
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureImage(null)
  }

  const confirmSignatureAndSign = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setSignatureImage(dataUrl)
    setShowSignatureDialog(false)
    await handleSign(dataUrl)
  }

  const handleSign = async (signatureStr?: string) => {
    const finalSignature = signatureStr || signatureImage
    if (!selectedContract || !agreedFirst || !agreedSecond || !finalSignature) return
    try {
      setSigningLoading(true)
      const res = await signContract(selectedContract.id, finalSignature)
      if (res.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 4000)
        // Refresh contracts
        await fetchContracts()
        // Update selected contract
        setSelectedContract(prev => prev ? { ...prev, status: 'active', signed_at: new Date().toISOString() } : null)
      }
    } catch (err) {
      setError('فشل في توقيع العقد')
      console.error('Error signing contract:', err)
    } finally {
      setSigningLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    setShowPrintView(true)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'بانتظار التوقيع',
      active: 'نشط ✓',
      completed: 'مكتمل ✓',
      cancelled: 'ملغي',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FF8C00',
      active: '#00C781',
      completed: '#14b8a6',
      cancelled: '#FF4444',
    }
    return colors[status] || '#666'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  }

  const paymentPerInstallment = payNumber > 0 ? contractPrice / payNumber : contractPrice
  const paymentPercent = payNumber > 0 ? Math.round(100 / payNumber) : 100

  // Loading state
  if (loading) {
    return (
      <div className={styles.contractWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid rgba(20, 184, 166, 0.2)',
            borderTopColor: '#14b8a6', borderRadius: '50%', margin: '0 auto 1rem',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p>جاري تحميل العقود...</p>
        </div>
      </div>
    )
  }

  // No contracts state
  if (!loading && contracts.length === 0) {
    return (
      <div className={styles.contractWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>📄</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>لا توجد عقود حالياً</h3>
          <p>لم يتم إنشاء أي عقد لمشاريعك بعد</p>
          {error && <p style={{ color: '#FF4444', marginTop: '1rem' }}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.contractWrapper}>
      {/* Contract Selector (if multiple contracts) */}
      {contracts.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          overflowX: 'auto',
          flexWrap: 'wrap',
        }}>
          {contracts.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedContract(c); setAgreedFirst(false); setAgreedSecond(false); }}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: `1px solid ${selectedContract?.id === c.id ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                background: selectedContract?.id === c.id ? `rgba(${theme.accentRgb}, 0.15)` : 'rgba(255,255,255,0.03)',
                color: selectedContract?.id === c.id ? theme.accent : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: selectedContract?.id === c.id ? 600 : 400,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ marginLeft: '6px' }}>📋</span>
              {c.project_name} - {c.contract_number}
              <span style={{
                display: 'inline-block',
                marginRight: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getStatusColor(c.status),
              }} />
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '1rem',
          background: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid rgba(255, 68, 68, 0.2)',
          borderRadius: '10px',
          color: '#ff6b6b',
          fontSize: '0.9rem',
          cursor: 'pointer',
        }} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {selectedContract && (
        <>
          <div ref={contractRef}>
            {/* Contract Header Section */}
            <motion.div
              className={styles.contractHeader}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className={styles.contractHeaderBg}>
                <div className={styles.cornerDecor1} />
                <div className={styles.cornerDecor2} />
                <div className={styles.cornerDecor3} />
                <div className={styles.cornerDecor4} />
              </div>

              <div className={styles.headerGlowLine} />
              <div className={styles.scanLine} />

              <div className={`${styles.headerParticle} ${styles.headerParticle1}`} />
              <div className={`${styles.headerParticle} ${styles.headerParticle2}`} />
              <div className={`${styles.headerParticle} ${styles.headerParticle3}`} />
              <div className={`${styles.headerParticle} ${styles.headerParticle4}`} />
              <div className={`${styles.headerParticle} ${styles.headerParticle5}`} />

              <motion.div
                className={styles.headerSeal}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 100 }}
              >
                <span className={styles.sealIcon}>📜</span>
              </motion.div>

              <motion.div
                className={styles.contractTitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.contractTitleDecor}>
                  <span className={styles.decorLine} />
                  <span className={styles.decorDiamond}>◆</span>
                  <span className={styles.decorLine} />
                </div>
                <h2>عقد اتفاق لتقديم خدمات</h2>
                <h3>{selectedContract.project_name}</h3>
                <div className={styles.contractTitleDecor}>
                  <span className={styles.decorLine} />
                  <span className={styles.decorDiamond}>◆</span>
                  <span className={styles.decorLine} />
                </div>
              </motion.div>

              <motion.div
                className={styles.headerStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <span className={`${styles.statusDot} ${!signed ? styles.statusDotPending : ''}`} />
                <span className={styles.statusText}>
                  {getStatusLabel(selectedContract.status)}
                </span>
              </motion.div>

              <motion.div
                className={styles.headerOrnament}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className={styles.ornamentLine} />
                <span className={styles.ornamentDot} />
                <span className={styles.ornamentStar}>✦</span>
                <span className={styles.ornamentDot} />
                <span className={styles.ornamentLine} />
              </motion.div>

              <motion.div
                className={styles.contractMeta}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className={styles.metaItem}
                  onClick={handleCopyContract}
                  whileTap={{ scale: 0.97 }}
                  title="انقر للنسخ"
                >
                  <span className={styles.metaIcon}>📋</span>
                  <span className={styles.metaLabel}>رقم العقد</span>
                  <span className={styles.metaValue}>{contractNumber}</span>
                  <AnimatePresence>
                    {copied && (
                      <motion.span
                        className={styles.copiedTooltip}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        تم النسخ ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className={styles.metaDivider} />

                <motion.div className={styles.metaItem} whileHover={{ scale: 1.02 }}>
                  <span className={styles.metaIcon}>📅</span>
                  <span className={styles.metaLabel}>تاريخ التحرير</span>
                  <span className={styles.metaValue}>{formattedDate}</span>
                </motion.div>

                <div className={styles.metaDivider} />

                <motion.div className={styles.metaItem} whileHover={{ scale: 1.02 }}>
                  <span className={styles.metaIcon}>💎</span>
                  <span className={styles.metaLabel}>قيمة العقد</span>
                  <div className={styles.priceCounter}>
                    <span className={styles.priceCurrency}>$</span>
                    <span className={styles.priceAmount}>{displayPrice}</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Parties Section */}
            <motion.div
              className={styles.partiesSection}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h3 className={styles.sectionTitle} variants={itemVariants}>
                <span className={styles.sectionIcon}>👥</span>
                أطراف العقد
              </motion.h3>

              <div className={styles.partiesGrid}>
                <motion.div className={styles.partyCard} variants={itemVariants}>
                  <div className={styles.partyCardHeader}>
                    <div className={styles.partyBadge}>الطرف الأول</div>
                    <div className={styles.partyRole}>مقدم الخدمة</div>
                  </div>
                  <div className={styles.partyCardBody}>
                    <div className={styles.partyLogo}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentLighter})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>N</span>
                    </div>
                    <h4 className={styles.partyName}>شركة NIXT</h4>
                    <p className={styles.partyDesc}>للحلول الرقمية والتقنية</p>
                    <div className={styles.partyInfo}>
                      <div className={styles.partyInfoItem}>
                        <span className={styles.partyInfoIcon}>🌐</span>
                        <span>تصميم وتطوير مواقع الويب</span>
                      </div>
                      <div className={styles.partyInfoItem}>
                        <span className={styles.partyInfoIcon}>💼</span>
                        <span>حلول رقمية متكاملة</span>
                      </div>
                      <div className={styles.partyInfoItem}>
                        <span className={styles.partyInfoIcon}>⚡</span>
                        <span>تقنيات حديثة وأداء متميز</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div className={styles.partiesConnector} variants={itemVariants}>
                  <div className={styles.connectorLine} />
                  <div className={styles.connectorIcon}>🤝</div>
                  <div className={styles.connectorLine} />
                </motion.div>

                <motion.div className={styles.partyCard} variants={itemVariants}>
                  <div className={styles.partyCardHeader}>
                    <div className={styles.partyBadge}>الطرف الثاني</div>
                    <div className={styles.partyRole}>العميل</div>
                  </div>
                  <div className={styles.partyCardBody}>
                    <div className={styles.clientForm}>
                      <div className={styles.inputGroup}>
                        <label><span className={styles.inputIcon}>👤</span> الاسم الكامل</label>
                        <input
                          type="text"
                          value={clientName}
                          readOnly
                          className={styles.input}
                          style={{ opacity: 0.8 }}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label><span className={styles.inputIcon}>📧</span> البريد الإلكتروني</label>
                        <input
                          type="email"
                          value={clientEmail}
                          readOnly
                          className={styles.input}
                          dir="ltr"
                          style={{ opacity: 0.8 }}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label><span className={styles.inputIcon}>📝</span> وصف المشروع</label>
                        <textarea
                          value={projectDesc}
                          readOnly
                          className={styles.textarea}
                          rows={3}
                          style={{ opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Contract Clauses */}
            {clauses.length > 0 && (
              <motion.div
                className={styles.clausesSection}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                <motion.h3 className={styles.sectionTitle} variants={itemVariants}>
                  <span className={styles.sectionIcon}>📜</span>
                  بنود وشروط العقد
                </motion.h3>

                <div className={styles.clausesGrid}>
                  {clauses.map((clause, index) => (
                    <motion.div
                      key={index}
                      className={`${styles.clauseCard} ${expandedClauses[index] ? styles.clauseCardExpanded : ''}`}
                      variants={itemVariants}
                      onClick={() => toggleClause(index)}
                    >
                      <div className={styles.clauseNumber}>
                        {index + 1}
                      </div>
                      <div className={styles.clauseHeader}>
                        <span className={styles.clauseIcon}>{defaultClauseIcons[index % defaultClauseIcons.length]}</span>
                        <h4>{clause.title}</h4>
                        {isMandatoryClause(clause.title) && (
                          <span style={{
                            fontSize: '0.6rem',
                            padding: '2px 8px',
                            background: `rgba(${theme.accentRgb}, 0.15)`,
                            border: `1px solid rgba(${theme.accentRgb}, 0.3)`,
                            borderRadius: '20px',
                            color: theme.accent,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            marginRight: '4px',
                          }}>
                            🔒 إلزامي
                          </span>
                        )}
                      </div>
                      <p className={styles.clauseContent}>{clause.description}</p>
                      <button className={styles.clauseToggle}>
                        <span>{expandedClauses[index] ? 'عرض أقل' : 'عرض المزيد'}</span>
                        <span className={styles.clauseToggleArrow}>▼</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Project Details */}
            {projectDetails.length > 0 && (
              <motion.div
                className={styles.clausesSection}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                <motion.h3 className={styles.sectionTitle} variants={itemVariants}>
                  <span className={styles.sectionIcon}>📋</span>
                  تفاصيل المشروع
                </motion.h3>

                <div className={styles.clausesGrid}>
                  {projectDetails.map((detail, index) => (
                    <motion.div
                      key={index}
                      className={styles.clauseCard}
                      variants={itemVariants}
                    >
                      <div className={styles.clauseNumber}>
                        {index + 1}
                      </div>
                      <div className={styles.clauseHeader}>
                        <span className={styles.clauseIcon}>🛠️</span>
                        <h4>{detail.title}</h4>
                      </div>
                      <p className={styles.clauseContent}>{detail.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Contract Extra Details */}
            {(projectDuration || revisionsAllowed || warrantyPeriod || autoCancelDays || progressTolerance !== null || delayCompensation !== null || clientFaultRefund !== null || progressTimelineLink) && (
              <motion.div
                className={styles.clausesSection}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                <motion.h3 className={styles.sectionTitle} variants={itemVariants}>
                  <span className={styles.sectionIcon}>⚙️</span>
                  تفاصيل إضافية للعقد
                </motion.h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '12px',
                  marginTop: '12px',
                }}>
                  {projectDuration != null && (
                    <motion.div variants={itemVariants} style={{
                      padding: '16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>⏱️ مدة التنفيذ</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                        {projectDuration} {projectDurationUnit === 'days' ? 'يوم' : projectDurationUnit === 'weeks' ? 'أسبوع' : projectDurationUnit === 'months' ? 'شهر' : projectDurationUnit || 'يوم'}
                      </div>
                    </motion.div>
                  )}
                  {revisionsAllowed != null && (
                    <motion.div variants={itemVariants} style={{
                      padding: '16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>✏️ عدد التعديلات المسموحة</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{revisionsAllowed} تعديلات</div>
                    </motion.div>
                  )}
                  {warrantyPeriod != null && (
                    <motion.div variants={itemVariants} style={{
                      padding: '16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>🛡️ فترة الضمان</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{warrantyPeriod} أشهر</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Price Summary */}
            <motion.div
              className={styles.priceSection}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💎</span>
                ملخص مالي
              </h3>
              <div className={styles.priceCard}>
                <div className={styles.priceCardHeader}>
                  <div className={styles.priceCardTitle}>
                    <span className={styles.priceCardIcon}>🧾</span>
                    <span>تفاصيل المبلغ</span>
                  </div>
                  <span className={styles.priceCardBadge}>USD</span>
                </div>
                <div className={styles.priceCardBody}>

                  <div className={styles.priceRow}>
                    <div className={styles.priceRowLabel}>
                      <span className={styles.priceRowIcon}>🎨</span>
                      <span>{selectedContract.project_name}</span>
                    </div>
                    <span className={styles.priceAmount}>${contractPrice.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceDivider} />
                  {Array.from({ length: payNumber }, (_, i) => (
                    <div key={i} className={styles.priceRow}>
                      <div className={styles.priceRowLabel}>
                        <span className={styles.priceRowIcon}>{i === 0 ? '📥' : '📤'}</span>
                        <span>الدفعة {i + 1} ({i === 0 ? 'عند التوقيع' : i === payNumber - 1 ? 'عند التسليم' : `الدفعة ${i + 1}`})</span>
                      </div>
                      <span className={styles.priceAmountSub}>${paymentPerInstallment.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className={styles.priceDivider} />
                  <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                    <span>الإجمالي</span>
                    <span className={styles.priceTotalAmount}>${contractPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Signature Section */}
          <motion.div
            className={styles.signatureSection}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>✍️</span>
              التوقيع والموافقة
            </h3>

            <div className={styles.signSteps}>
              <div className={`${styles.signStep} ${clientName.trim() ? styles.signStepDone : styles.signStepActive}`}>
                <span className={styles.signStepNum}>{clientName.trim() ? '✓' : '1'}</span>
                <span className={styles.signStepText}>بيانات العميل</span>
              </div>
              <div className={styles.signStepLine} />
              <div className={`${styles.signStep} ${agreedFirst && agreedSecond ? styles.signStepDone : (clientName.trim() ? styles.signStepActive : '')}`}>
                <span className={styles.signStepNum}>{agreedFirst && agreedSecond ? '✓' : '2'}</span>
                <span className={styles.signStepText}>الموافقة على الشروط</span>
              </div>
              <div className={styles.signStepLine} />
              <div className={`${styles.signStep} ${signed ? styles.signStepDone : (agreedFirst && agreedSecond ? styles.signStepActive : '')}`}>
                <span className={styles.signStepNum}>{signed ? '✓' : '3'}</span>
                <span className={styles.signStepText}>التوقيع</span>
              </div>
            </div>

            <div className={styles.agreementChecks}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreedFirst}
                  onChange={(e) => setAgreedFirst(e.target.checked)}
                  disabled={signed}
                />
                <span className={styles.checkmark} />
                <span>أقر بأنني قرأت جميع بنود وشروط هذا العقد وأوافق عليها بالكامل</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreedSecond}
                  onChange={(e) => setAgreedSecond(e.target.checked)}
                  disabled={signed}
                />
                <span className={styles.checkmark} />
                <span>أوافق على قيمة العقد البالغة ${contractPrice} دولار أمريكي وجدول الدفع المحدد</span>
              </label>
            </div>

            <div className={styles.signatureGrid}>
              <div className={styles.signatureBox}>
                <div className={styles.signatureLabel}>توقيع الطرف الأول</div>
                <div className={styles.signatureArea}>
                  {signed && (
                    <motion.div
                      className={styles.signatureStamp}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <span className={styles.stampText}>NIXT</span>
                      <span className={styles.stampSub}>Digital Solutions</span>
                    </motion.div>
                  )}
                </div>
                <div className={styles.signatureName}>شركة NIXT</div>
              </div>

              <div className={styles.signatureBox}>
                <div className={styles.signatureLabel}>توقيع الطرف الثاني</div>
                <div className={styles.signatureArea}>
                  {signed && clientName && (
                    <motion.div
                      className={styles.clientSignature}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                    >
                      {(() => {
                        const displayImg = 
                          bufferToDataUrl(selectedContract?.signature_black) || 
                          bufferToDataUrl(selectedContract?.signature_blue) || 
                          bufferToDataUrl(selectedContract?.signature_white);
                        return displayImg ? (
                          <img src={displayImg} alt="Client Signature" style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{clientName}</span>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>
                <div className={styles.signatureName}>
                  {clientName || 'اسم العميل'}
                </div>
              </div>
            </div>

            {!signed ? (
              <motion.button
                className={styles.signButton}
                onClick={() => setShowSignatureDialog(true)}
                disabled={!agreedFirst || !agreedSecond || signingLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>✍️</span>
                {signingLoading ? 'جاري التوقيع...' : 'توقيع العقد'}
              </motion.button>
            ) : (
              <motion.div
                className={styles.actionButtons}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.button
                  className={styles.downloadButton}
                  onClick={handleDownloadPDF}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>📥</span>
                  فتح العقد الرسمي للطباعة
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Signature Canvas Modal */}
          <AnimatePresence>
            {showSignatureDialog && (
              <motion.div
                className={styles.successOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ zIndex: 1000 }} // Ensure it's above other elements
              >
                <motion.div
                  className={styles.successModal}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                  <h3 style={{ margin: 0, color: '#fff' }}>رسم التوقيع</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>يرجى رسم توقيعك في المساحة المخصصة أدناه:</p>
                  
                  <div style={{
                    border: '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    touchAction: 'none' // Prevent scrolling while passing events
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      style={{ width: '100%', height: '200px', cursor: 'crosshair', display: 'block' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button
                      onClick={clearSignature}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', 
                        background: 'rgba(255, 68, 68, 0.1)', color: '#ff6b6b',
                        border: '1px solid rgba(255, 68, 68, 0.2)', cursor: 'pointer'
                      }}
                    >
                      مسح التوقيع
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setShowSignatureDialog(false)}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', 
                          background: 'rgba(255,255,255,0.05)', color: '#fff',
                          border: 'none', cursor: 'pointer'
                        }}
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={confirmSignatureAndSign}
                        disabled={signingLoading}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', 
                          background: theme.accent, color: '#000', fontWeight: 'bold',
                          border: 'none', cursor: 'pointer'
                        }}
                      >
                        تأكيد وتوقيع
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className={styles.successOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={styles.successModal}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={styles.successIcon}>✅</div>
                  <div className={styles.successBadge}>
                    <span className={styles.successBadgeDot} />
                    <span className={styles.successBadgeText}>مكتمل</span>
                  </div>
                  <h3>تم توقيع العقد بنجاح!</h3>
                  <p>تم تسجيل موافقتك على عقد الاتفاق بشكل رسمي</p>
                  <p className={styles.successDate}>📅 {formattedDate}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Printable Contract View */}
          {showPrintView && (
            <PrintableContractView
              clientName={clientName}
              clientEmail={clientEmail}
              projectDesc={projectDesc}
              project={selectedContract}
              projectName={selectedContract?.project_name}
              contractNumber={contractNumber}
              formattedDate={formattedDate}
              price={contractPrice}
              payNumber={payNumber}
              clauses={clauses}
              projectDetails={projectDetails}
              projectDuration={projectDuration}
              projectDurationUnit={projectDurationUnit}
              revisionsAllowed={revisionsAllowed}
              warrantyPeriod={warrantyPeriod}
              autoCancelDays={autoCancelDays}
              progressTolerance={progressTolerance}
              delayCompensation={delayCompensation}
              clientFaultRefund={clientFaultRefund}
              progressTimelineLink={progressTimelineLink}
              theme={theme}
              clientSignatureImage={bufferToDataUrl(selectedContract?.signature_black) || bufferToDataUrl(selectedContract?.signature_blue) || bufferToDataUrl(selectedContract?.signature_white)}
              onClose={() => setShowPrintView(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ContractDashboard
