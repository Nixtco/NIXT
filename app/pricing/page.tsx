'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  const goToCheckout = (plan: string, amount: number) => {
    router.push(`/payment?plan=${plan}&amount=${amount}`);
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
      
      <div className={styles.container}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Transparent Pricing</h1>
          <p className={styles.subtitle}>
            Choose the perfect plan for your business needs. No hidden fees, just quality service.
          </p>
        </div>

        <div className={styles.cardsContainer} ref={cardsRef} onMouseMove={(e) => {
             // Fallback inline handler if needed, though useEffect is cleaner for multiple elements
             // Logic mainly handled in useEffect
        }}>
          {/* Card 1: Landing Page (Entry Level) */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Landing Page</h2>
            <div className={styles.priceWrapper}>
              <span className={styles.currency}>$</span>
              <span className={styles.priceRange}>100 - 500</span>
            </div>
            <div className={styles.divider}></div>
            <ul className={styles.features}>
              <li><CheckIcon /> High Conversion Design</li>
              <li><CheckIcon /> Fully Responsive</li>
              <li><CheckIcon /> SEO Optimization</li>
              <li><CheckIcon /> Fast Loading Speed</li>
              <li><CheckIcon /> Contact Form Integration</li>
            </ul>
            <button className={styles.placeholderBtn} onClick={() => goToCheckout('landing', 100)}>
              Pay Now
            </button>
          </div>

          {/* Card 2: Dashboard (Mid Level / Popular) */}
          <div className={`${styles.card} ${styles.popular}`}>
            <div className={styles.badge}>Most Popular</div>
            <h2 className={styles.cardTitle}>Dashboard</h2>
            <div className={styles.priceWrapper}>
              <span className={styles.currency}>$</span>
              <span className={styles.priceRange}>200 - 1500</span>
            </div>
            <div className={styles.divider}></div>
            <ul className={styles.features}>
              <li><CheckIcon /> Real-time Data Visualization</li>
              <li><CheckIcon /> Comprehensive Analytics</li>
              <li><CheckIcon /> User Roles & Management</li>
              <li><CheckIcon /> Exportable Reports</li>
              <li><CheckIcon /> Dark/Light Mode Support</li>
              <li><CheckIcon /> API Integration</li>
            </ul>
            <button className={styles.placeholderBtn} onClick={() => goToCheckout('dashboard', 200)}>
              Pay Now
            </button>
          </div>

          {/* Card 3: E-commerce / Financial (Premium) */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>E-Commerce & Finance</h2>
            <div className={styles.priceWrapper}>
              <span className={styles.currency}>$</span>
              <span className={styles.priceRange}>500 - 2500</span>
            </div>
            <div className={styles.divider}></div>
            <ul className={styles.features}>
              <li><CheckIcon /> Secure Payment Gateway</li>
              <li><CheckIcon /> Inventory Management</li>
              <li><CheckIcon /> Order Tracking System</li>
              <li><CheckIcon /> Financial Reporting</li>
              <li><CheckIcon /> Customer Database</li>
              <li><CheckIcon /> Multi-currency Support</li>
            </ul>
            <button className={styles.placeholderBtn} onClick={() => goToCheckout('ecommerce', 500)}>
              Pay Now
            </button>
          </div>
        </div>

        {/* Bottom Card */}
        <div className={styles.bottomCard}>
          <div className={styles.bottomContent}>
            <h3 className={styles.bottomTitle}>Need something custom?</h3>
            <p className={styles.bottomText}>
              If your request doesn&apos;t fit these categories or you have specific budget constraints, we&apos;re here to help. Let&apos;s discuss a custom solution.
            </p>
          </div>
          <Link href="/payment?plan=custom&amount=250" className={styles.makeOfferBtn}>
             Make an Offer
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
