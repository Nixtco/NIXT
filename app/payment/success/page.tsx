'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './Success.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const plan = searchParams.get('plan');

  return (
    <div className={styles.card}>
      <div className={styles.icon}>✓</div>
      <h1>Payment received</h1>
      <p>
        Your payment has been verified and recorded successfully.
        {plan ? ` Plan: ${plan}.` : ''}
      </p>

      {paymentId && (
        <div className={styles.reference}>
          <span>Reference</span>
          <code>{paymentId}</code>
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/dashboard" className={styles.primaryBtn}>Go to dashboard</Link>
        <Link href="/account" className={styles.secondaryBtn}>View account</Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main>
      <Header onSmoothScroll={() => {}} />
      <section className={styles.container}>
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
