'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpaceremitCheckout from '@/components/Payment/SpaceremitCheckout';
import styles from './Payment.module.css';

const PLAN_CATALOG: Record<string, { label: string; defaultAmount: number }> = {
  landing: { label: 'Landing Page', defaultAmount: 100 },
  dashboard: { label: 'Dashboard', defaultAmount: 200 },
  ecommerce: { label: 'E-Commerce & Finance', defaultAmount: 500 },
  custom: { label: 'Custom Project', defaultAmount: 250 },
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const planKey = (searchParams.get('plan') || 'landing').toLowerCase();
  const amountParam = searchParams.get('amount');
  const plan = PLAN_CATALOG[planKey] || PLAN_CATALOG.landing;
  const amount = amountParam ? Number(amountParam) : plan.defaultAmount;

  if (Number.isNaN(amount) || amount <= 0) {
    return (
      <div className={styles.messageBox}>
        <h1>Invalid payment amount</h1>
        <p>Please choose a valid plan from the pricing page.</p>
        <Link href="/pricing" className={styles.backLink}>Back to pricing</Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Secure checkout</p>
        <h1 className={styles.title}>Complete your payment</h1>
        <p className={styles.subtitle}>
          Pay securely with local methods or card through Spaceremit.
        </p>
      </div>

      <SpaceremitCheckout
        amount={amount}
        planName={planKey}
        planLabel={plan.label}
      />
    </>
  );
}

export default function PaymentPage() {
  return (
    <main>
      <Header onSmoothScroll={() => {}} />
      <section className={styles.container}>
        <Suspense fallback={<div className={styles.loading}>Loading checkout...</div>}>
          <PaymentContent />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
