'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { marketingContent } from '@/lib/marketingContent';
import styles from './Pricing.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// A mock function for smooth scroll since we might be on a diff page
const noOpScroll = (id: string) => {
  // If we wanted to support navigation back to home anchors, we'd do it here.
  // For now, it's just to satisfy the prop requirement.
  console.log(`Navigate to ${id}`);
  window.location.href = `/#${id}`; 
};

// Simple check icon component
const CheckIcon = () => (
  <span className={styles.checkIcon}>
    ✓
  </span>
);

export default function PricingPage() {
  const router = useRouter();
  const cardsRef = useRef<HTMLDivElement>(null);
  const { language, dir } = useLanguage();
  const content = marketingContent[language].pricing;

  const goToLogin = () => {
    router.push('/login');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardsRef.current) return;
      
      const cards = cardsRef.current.getElementsByClassName(styles.card);
      for (const card of cards as HTMLCollectionOf<HTMLElement>) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    const container = cardsRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <main>
      <Header onSmoothScroll={noOpScroll} />
      
      <div className={styles.container} dir={dir}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.subtitle}>
            {content.subtitle}
          </p>
        </div>

        <div className={styles.cardsContainer} ref={cardsRef} onMouseMove={(e) => {
             // Fallback inline handler if needed, though useEffect is cleaner for multiple elements
             // Logic mainly handled in useEffect
        }}>
          {content.cards.map((card, index) => (
            <div key={card.title} className={`${styles.card} ${index === 1 ? styles.popular : ''}`}>
              {index === 1 && <div className={styles.badge}>{content.mostPopular}</div>}
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <div className={styles.priceWrapper}>
                <div className={styles.priceLine}>
                  <span className={styles.currency}>{content.startingFrom}</span>
                  <span className={styles.priceRange}>{card.price}</span>
                </div>
                <p className={styles.bottomText} style={{ marginTop: '0.75rem' }}>
                  {card.summary}
                </p>
              </div>
              <div className={styles.divider}></div>
              <ul className={styles.features}>
                {card.features.map((feature) => (
                  <li key={feature}><CheckIcon /> {feature}</li>
                ))}
              </ul>
              <button className={styles.placeholderBtn} onClick={goToLogin}>
                {card.cta}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.bottomCard}>
          <div className={styles.bottomContent}>
            <h3 className={styles.bottomTitle}>{content.customTitle}</h3>
            <p className={styles.bottomText}>
              {content.customDescription1}
            </p>
            <p className={styles.bottomText} style={{ marginTop: '0.75rem' }}>
              {content.customDescription2}
            </p>
          </div>
           <Link href="/login" className={styles.makeOfferBtn}>
             {content.customCta}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
