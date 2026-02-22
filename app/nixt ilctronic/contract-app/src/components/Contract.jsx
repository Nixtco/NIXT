import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useTheme } from '../context/ThemeContext';
import PrintableContract from './PrintableContract';
import styles from './Contract.module.css';

const contractClauses = [
  {
    title: 'نطاق العمل',
    icon: '🎯',
    content:
      'يلتزم الطرف الأول (شركة NIXT) بتقديم خدمة تصميم وتطوير موقع إلكتروني احترافي وفقاً للمواصفات المتفق عليها بين الطرفين، ويشمل ذلك التصميم الجذاب، البرمجة، والتجربة المتكاملة على جميع الأجهزة.',
  },
  {
    title: 'قيمة العقد',
    icon: '💰',
    content:
      'يلتزم الطرف الثاني بدفع مبلغ قدره 450 دولار أمريكي (أربعمائة وخمسون دولاراً) مقابل الخدمات المذكورة أعلاه. يتم الدفع وفقاً لجدول الدفع المحدد في هذا العقد.',
  },
  {
    title: 'جدول الدفع',
    icon: '📅',
    content:
      'يتم الدفع على دفعتين: الدفعة الأولى بنسبة 50% (225$) عند توقيع العقد والبدء بالعمل، والدفعة الثانية بنسبة 50% (225$) عند تسليم المشروع بشكل نهائي واعتماده من الطرف الثاني.',
  },
  {
    title: 'مدة التنفيذ',
    icon: '⏱️',
    content:
      'يلتزم الطرف الأول بإنجاز المشروع خلال مدة متفق عليها بين الطرفين تبدأ من تاريخ استلام الدفعة الأولى واعتماد متطلبات المشروع النهائية.',
  },
  {
    title: 'حقوق الملكية',
    icon: '🔐',
    content:
      'تنتقل جميع حقوق الملكية الفكرية للموقع إلى الطرف الثاني بعد استكمال الدفع الكامل. قبل ذلك، تبقى جميع الحقوق محفوظة لشركة NIXT.',
  },
  {
    title: 'التعديلات',
    icon: '✏️',
    content:
      'يحق للطرف الثاني طلب تعديلات على التصميم بحد أقصى جولتين من التعديلات مجاناً. أي تعديلات إضافية بعد ذلك ستكون بتكلفة إضافية يتم الاتفاق عليها.',
  },
  {
    title: 'الدعم الفني',
    icon: '🛡️',
    content:
      'يقدم الطرف الأول دعماً فنياً مجانياً لمدة 30 يوماً بعد تسليم المشروع، يشمل إصلاح الأخطاء البرمجية. لا يشمل الدعم إضافة ميزات جديدة.',
  },
  {
    title: 'السرية',
    icon: '🔒',
    content:
      'يلتزم كلا الطرفين بالحفاظ على سرية جميع المعلومات والبيانات المتبادلة خلال فترة تنفيذ المشروع وبعدها، ولا يجوز لأي طرف إفشاء معلومات الطرف الآخر دون موافقة خطية.',
  },
  {
    title: 'إنهاء العقد',
    icon: '⚖️',
    content:
      'يحق لأي طرف إنهاء هذا العقد بإشعار خطي مدته 7 أيام. في حال الإنهاء، يستحق الطرف الأول أتعاباً عن الأعمال المنجزة حتى تاريخ الإنهاء.',
  },
  {
    title: 'حل النزاعات',
    icon: '🤝',
    content:
      'في حال نشوء أي خلاف بين الطرفين، يتم حله ودياً أولاً. وفي حال تعذر ذلك، يتم اللجوء إلى التحكيم وفقاً للقوانين والأنظمة المعمول بها.',
  },
];

const Contract = () => {
  const { theme } = useTheme();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [agreedFirst, setAgreedFirst] = useState(false);
  const [agreedSecond, setAgreedSecond] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const contractRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [priceAnimated, setPriceAnimated] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState({});

  const today = new Date();
  const formattedDate = format(today, 'dd MMMM yyyy', { locale: ar });
  const contractNumber = `NIXT-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  // Animated price counter
  useEffect(() => {
    if (priceAnimated) return;
    const target = 450;
    const duration = 1800;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(Math.round(target * eased));
      if (progress >= 1) {
        clearInterval(timer);
        setPriceAnimated(true);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [priceAnimated]);

  // Copy contract number
  const handleCopyContract = useCallback(() => {
    navigator.clipboard.writeText(contractNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [contractNumber]);

  // Toggle clause expand
  const toggleClause = useCallback((index) => {
    setExpandedClauses(prev => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleSign = () => {
    if (!clientName.trim() || !agreedFirst || !agreedSecond) return;
    setSigned(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleDownloadPDF = () => {
    setShowPrintView(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className={styles.contractWrapper}>
      <div ref={contractRef}>
        {/* Contract Header Section */}
        <motion.div
          className={styles.contractHeader}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Background layers */}
          <div className={styles.contractHeaderBg}>
            <div className={styles.cornerDecor1} />
            <div className={styles.cornerDecor2} />
            <div className={styles.cornerDecor3} />
            <div className={styles.cornerDecor4} />
          </div>

          {/* Animated glow line at top */}
          <div className={styles.headerGlowLine} />

          {/* Scan line effect */}
          <div className={styles.scanLine} />

          {/* Floating particles */}
          <div className={`${styles.headerParticle} ${styles.headerParticle1}`} />
          <div className={`${styles.headerParticle} ${styles.headerParticle2}`} />
          <div className={`${styles.headerParticle} ${styles.headerParticle3}`} />
          <div className={`${styles.headerParticle} ${styles.headerParticle4}`} />
          <div className={`${styles.headerParticle} ${styles.headerParticle5}`} />

          {/* Official Seal */}
          <motion.div
            className={styles.headerSeal}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 100 }}
          >
            <span className={styles.sealIcon}>📜</span>
          </motion.div>

          {/* Title */}
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
            <h3>تصميم وتطوير موقع إلكتروني</h3>
            <div className={styles.contractTitleDecor}>
              <span className={styles.decorLine} />
              <span className={styles.decorDiamond}>◆</span>
              <span className={styles.decorLine} />
            </div>
          </motion.div>

          {/* Status badge */}
          <motion.div
            className={styles.headerStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <span className={`${styles.statusDot} ${!signed ? styles.statusDotPending : ''}`} />
            <span className={styles.statusText}>
              {signed ? 'تم التوقيع ✓' : 'بانتظار التوقيع'}
            </span>
          </motion.div>

          {/* Ornament separator */}
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

          {/* Meta bar - interactive */}
          <motion.div
            className={styles.contractMeta}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Contract number - clickable to copy */}
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

            {/* Date */}
            <motion.div className={styles.metaItem} whileHover={{ scale: 1.02 }}>
              <span className={styles.metaIcon}>📅</span>
              <span className={styles.metaLabel}>تاريخ التحرير</span>
              <span className={styles.metaValue}>{formattedDate}</span>
            </motion.div>

            <div className={styles.metaDivider} />

            {/* Price - animated counter */}
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
                    <label><span className={styles.inputIcon}>👤</span> الاسم الكامل *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="أدخل الاسم الكامل"
                      disabled={signed}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label><span className={styles.inputIcon}>📧</span> البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="example@email.com"
                      disabled={signed}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label><span className={styles.inputIcon}>📝</span> وصف المشروع</label>
                    <textarea
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="وصف مختصر للمشروع المطلوب..."
                      disabled={signed}
                      className={styles.textarea}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Contract Clauses */}
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
            {contractClauses.map((clause, index) => (
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
                  <span className={styles.clauseIcon}>{clause.icon}</span>
                  <h4>{clause.title}</h4>
                </div>
                <p className={styles.clauseContent}>{clause.content}</p>
                <button className={styles.clauseToggle}>
                  <span>{expandedClauses[index] ? 'عرض أقل' : 'عرض المزيد'}</span>
                  <span className={styles.clauseToggleArrow}>▼</span>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

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
              <div className={styles.paymentProgress}>
                <span className={styles.progressLabel}>{signed ? '50%' : '0%'}</span>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: signed ? '50%' : '0%' }} />
                </div>
                <span className={styles.progressLabel}>100%</span>
              </div>

              <div className={styles.priceRow}>
                <div className={styles.priceRowLabel}>
                  <span className={styles.priceRowIcon}>🎨</span>
                  <span>خدمة تصميم وتطوير الموقع الإلكتروني</span>
                </div>
                <span className={styles.priceAmount}>$450.00</span>
              </div>
              <div className={styles.priceDivider} />
              <div className={styles.priceRow}>
                <div className={styles.priceRowLabel}>
                  <span className={styles.priceRowIcon}>📥</span>
                  <span>الدفعة الأولى (عند التوقيع)</span>
                </div>
                <span className={styles.priceAmountSub}>$225.00</span>
              </div>
              <div className={styles.priceRow}>
                <div className={styles.priceRowLabel}>
                  <span className={styles.priceRowIcon}>📤</span>
                  <span>الدفعة الثانية (عند التسليم)</span>
                </div>
                <span className={styles.priceAmountSub}>$225.00</span>
              </div>
              <div className={styles.priceDivider} />
              <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                <span>الإجمالي</span>
                <span className={styles.priceTotalAmount}>$450.00</span>
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

        {/* Signing steps indicator */}
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
            <span>
              أقر بأنني قرأت جميع بنود وشروط هذا العقد وأوافق عليها بالكامل
            </span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={agreedSecond}
              onChange={(e) => setAgreedSecond(e.target.checked)}
              disabled={signed}
            />
            <span className={styles.checkmark} />
            <span>
              أوافق على قيمة العقد البالغة 450 دولار أمريكي وجدول الدفع المحدد
            </span>
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
                >
                  {clientName}
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
            onClick={handleSign}
            disabled={!clientName.trim() || !agreedFirst || !agreedSecond}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>✍️</span>
            توقيع العقد والموافقة
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
              <span>�</span>
              فتح العقد الرسمي للطباعة
            </motion.button>
          </motion.div>
        )}
      </motion.div>

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
        <PrintableContract
          clientName={clientName}
          clientEmail={clientEmail}
          projectDesc={projectDesc}
          contractNumber={contractNumber}
          formattedDate={formattedDate}
          theme={theme}
          onClose={() => setShowPrintView(false)}
        />
      )}
    </div>
  );
};

export default Contract;
