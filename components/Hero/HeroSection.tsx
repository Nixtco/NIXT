import { FC } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { marketingContent } from '@/lib/marketingContent'
import styles from './Hero.module.css'

const HeroSection: FC = () => {
  const { language } = useLanguage()
  const content = marketingContent[language].hero

  return (
    <div id="hero" className={styles.introContainer} dir="ltr">
      <div className={styles.topInfo} dir="ltr">
        {content.topInfo}
      </div>

      <div className={styles.centerLogo}>
        <h1 dir="ltr">Nixt</h1>
        <span
          className={`${styles.tagline} ${language === 'ar' ? styles.taglineArabic : ''}`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {content.brandTagline}
        </span>
        
        <div className={styles.ctaContainer}>
          <a href="#projects" className="vercel-btn vercel-btn-primary">
            {content.primaryCta}
          </a>
          <a href="#contact" className="vercel-btn vercel-btn-secondary">
            {content.secondaryCta}
          </a>
        </div>
      </div>

      <div className={styles.bottomSections}>
        <div className={styles.bottomItem}>
          <h4>{content.techTitle}</h4>
          <p>
            {content.techLine1}
            <br />{content.techLine2}
          </p>
        </div>
        <div className={`${styles.bottomItem} ${styles.center}`}>
          <h4>{content.servicesTitle}</h4>
          <p>
            {content.servicesLine1}
            <br />
            {content.servicesLine2}
          </p>
        </div>
        <div className={`${styles.bottomItem} ${styles.right}`}>
          <h4>{content.brandingTitle}</h4>
          <p>
            {content.brandingLine1}
            <br />
            {content.brandingLine2}
          </p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
