import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import styles from './ThemeSwitcher.module.css';

const ThemeSwitcher = () => {
  const { theme, themeKey, toggleTheme } = useTheme();

  const isGold = themeKey === 'gold';

  return (
    <motion.div
      className={styles.themeSwitcher}
      onClick={toggleTheme}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      title={`التبديل إلى الثيم ${isGold ? 'التركوازي' : 'الذهبي'}`}
    >
      <span className={`${styles.switchIcon} ${isGold ? styles.switchIconGold : ''}`}>
        {isGold ? '✨' : '🌊'}
      </span>
      <div className={styles.switchTrack}>
        <motion.div
          className={`${styles.switchThumb} ${isGold ? styles.switchThumbGold : ''}`}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className={styles.switchLabel}>{theme.name}</span>
    </motion.div>
  );
};

export default ThemeSwitcher;
