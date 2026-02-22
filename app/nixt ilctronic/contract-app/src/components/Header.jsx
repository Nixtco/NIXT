import { motion } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';
import styles from './Header.module.css';

const Header = () => {
  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className={styles.headerGlow} />
      <div className={styles.headerInner}>
        <motion.div
          className={styles.logo}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className={styles.logoIcon}>
            <div className={styles.logoIconInner}>
              <span>N</span>
            </div>
          </div>
          <div className={styles.logoText}>
            <h1>NIXT</h1>
            <span>Digital Solutions</span>
          </div>
        </motion.div>

        <motion.nav
          className={styles.headerNav}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className={styles.navStatus}>
            <span className={styles.statusDot} />
            <span>نشط</span>
          </div>
          <div className={styles.navDivider} />
          <ThemeSwitcher />
          <div className={styles.navDivider} />
          <div className={styles.headerBadge}>
            <span className={styles.badgeGlow} />
            <span className={styles.badgeText}>📋 عقد اتفاق رسمي</span>
          </div>
        </motion.nav>
      </div>

      <motion.div
        className={styles.headerLine}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 1, ease: 'easeInOut' }}
      />
    </motion.header>
  );
};

export default Header;
