import { motion } from 'framer-motion';
import styles from './Footer.module.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div className={styles.footerLine} />
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>NIXT</span>
            <span className={styles.footerSep}>|</span>
            <span className={styles.footerSlogan}>Digital Solutions</span>
          </div>
          <div className={styles.footerBadge}>
            <span className={styles.badgeDot} />
            مستند قانوني موثّق
          </div>
        </div>
        <div className={styles.footerDivider} />
        <p className={styles.footerCopy}>
          © {year} NIXT. جميع الحقوق محفوظة. هذا المستند سري وملزم قانونياً.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
