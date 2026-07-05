import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { marketingContent } from '@/lib/marketingContent';
import styles from './ProductDirection.module.css';

const ProductDirection: React.FC = () => {
  const { language } = useLanguage();
  const content = marketingContent[language].productDirection;

  return (
    <section className={styles.section} dir="ltr">
      <div className={styles.container}>
        <div className={`${styles.header} ${language === 'ar' ? styles.headerArabic : ''}`}>
          <div className={styles.label}>
            {content.label}
          </div>
          <h2 className={styles.title}>
            {content.title}
          </h2>
          <p className={styles.description}>
            <strong>
              {content.strong}
            </strong>{' '}
            {content.description}
          </p>
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelinePlane}>
            <div className={styles.gridLine} style={{ left: '10%' }} data-date="30" />
            <div className={styles.gridLine} style={{ left: '25%' }} data-date="AUG 3" />
            <div className={`${styles.gridLine} ${styles.highlight}`} style={{ left: '40%' }} data-date="10" />
            <div className={styles.gridLine} style={{ left: '55%' }} data-date="17" />
            <div className={`${styles.gridLine} ${styles.highlight}`} style={{ left: '70%' }} data-date="AUG 22" />
            <div className={styles.gridLine} style={{ left: '85%' }} data-date="24" />
            <div className={styles.gridLine} style={{ left: '100%' }} data-date="SEP" />

            <div className={styles.verticalGuide} style={{ left: '25%', height: '300px' }} />
            <div className={styles.verticalGuide} style={{ left: '70%', height: '300px' }} />

            <div className={styles.itemsContainer}>
              <div className={`${styles.itemBar} ${styles.itemPrototype}`}>
                <div className={styles.icon}>
                  <div className={styles.diamond} />
                </div>
                <span>{content.systemDesign}</span>
                <span style={{ position: 'absolute', top: '-30px', left: '0', color: '#888' }}>{content.planningPhase}</span>
              </div>

              <div className={`${styles.itemBar} ${styles.itemBeta}`}>
                <div className={styles.icon}>
                  <div className={styles.diamondGreen} />
                </div>
                <span>{content.development}</span>
              </div>

              <div className={`${styles.itemBar} ${styles.itemRLHF}`}>
                 <span style={{ marginRight: '10px' }}>{content.deployment}</span>
                <div className={styles.icon}>
                   <div className={styles.diamond} />
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'#444' }}></div>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'#555' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDirection;
