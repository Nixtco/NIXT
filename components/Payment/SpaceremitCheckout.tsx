'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalAuth } from '@/lib/auth-context';
import styles from './SpaceremitCheckout.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
const SPACEREMIT_CONFIG_SCRIPT_ID = 'spaceremit-config-script';
const SPACEREMIT_LIBRARY_SCRIPT_ID = 'spaceremit-library-script';

interface SpaceremitConfig {
  publicKey: string;
  isConfigured: boolean;
  isTestMode: boolean;
  jsUrl: string;
  callbackUrl: string;
}

interface SpaceremitCheckoutProps {
  amount: number;
  currency?: string;
  planName: string;
  planLabel: string;
}

function injectSpaceremitConfigScript(publicKey: string): void {
  if (document.getElementById(SPACEREMIT_CONFIG_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement('script');
  script.id = SPACEREMIT_CONFIG_SCRIPT_ID;
  script.textContent = `
    const SP_PUBLIC_KEY = ${JSON.stringify(publicKey)};
    const SP_FORM_ID = "#spaceremit-form";
    const SP_SELECT_RADIO_NAME = "sp-pay-type-radio";
    const LOCAL_METHODS_BOX_STATUS = true;
    const LOCAL_METHODS_PARENT_ID = "#spaceremit-local-methods-pay";
    const CARD_BOX_STATUS = true;
    const CARD_BOX_PARENT_ID = "#spaceremit-card-pay";
    const SP_FORM_AUTO_SUBMIT_WHEN_GET_CODE = true;

    function SP_SUCCESSFUL_PAYMENT(spaceremit_code) {
      window.dispatchEvent(new CustomEvent("spaceremit:success", { detail: spaceremit_code }));
    }

    function SP_FAILD_PAYMENT() {
      window.dispatchEvent(new CustomEvent("spaceremit:fail"));
    }

    function SP_RECIVED_MESSAGE(message) {
      window.dispatchEvent(new CustomEvent("spaceremit:message", { detail: message }));
    }

    function SP_NEED_AUTH(target_auth_link) {
      window.dispatchEvent(new CustomEvent("spaceremit:auth", { detail: target_auth_link }));
    }
  `;

  document.body.appendChild(script);
}

function loadSpaceremitLibraryScript(jsUrl: string): Promise<void> {
  const existingScript = document.getElementById(SPACEREMIT_LIBRARY_SCRIPT_ID);
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SPACEREMIT_LIBRARY_SCRIPT_ID;
    script.src = jsUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Spaceremit payment script'));
    document.body.appendChild(script);
  });
}

export default function SpaceremitCheckout({
  amount,
  currency = 'USD',
  planName,
  planLabel,
}: SpaceremitCheckoutProps) {
  const router = useRouter();
  const { user, token } = useGlobalAuth();
  const [config, setConfig] = useState<SpaceremitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gatewayReady, setGatewayReady] = useState(false);
  const initializedRef = useRef(false);

  const verifyPaymentRef = useRef<(paymentId: string) => Promise<void>>(async () => {});

  const buyerName = user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Nixt Customer';
  const buyerEmail = user?.email || '';
  const buyerPhone = '';
  const orderNotes = `plan=${planName};source=nixt-website`;

  const verifyPayment = useCallback(async (paymentId: string) => {
    setIsProcessing(true);
    setStatusMessage('Verifying payment...');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/payments/spaceremit/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentId,
          planName,
          expectedAmount: amount,
          expectedCurrency: currency,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      setStatusMessage('Payment verified successfully. Redirecting...');
      router.push(`/payment/success?paymentId=${encodeURIComponent(paymentId)}&plan=${encodeURIComponent(planName)}`);
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Payment verification failed';
      setError(message);
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  }, [amount, currency, planName, router, token]);

  verifyPaymentRef.current = verifyPayment;

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payments/spaceremit/config`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load payment configuration');
        }

        setConfig(data.data);
      } catch (configError) {
        const message = configError instanceof Error ? configError.message : 'Failed to load payment configuration';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();

    // Handle URL hash from SpaceRemit authorization redirect
    if (window.location.hash) {
      // Clean up the hash without reloading the page
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const onSuccess = (event: Event) => {
      const paymentId = (event as CustomEvent<string>).detail;
      if (paymentId) {
        void verifyPaymentRef.current(paymentId);
      }
    };

    const onFail = () => {
      setError('Payment failed. Please try again.');
      setStatusMessage(null);
    };

    const onMessage = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (message) {
        setStatusMessage(message);
      }
    };

    const onAuth = (event: Event) => {
      const authLink = (event as CustomEvent<string>).detail;
      if (authLink) {
        window.open(authLink, '_blank', 'noopener,noreferrer');
      }
    };

    window.addEventListener('spaceremit:success', onSuccess);
    window.addEventListener('spaceremit:fail', onFail);
    window.addEventListener('spaceremit:message', onMessage);
    window.addEventListener('spaceremit:auth', onAuth);

    return () => {
      window.removeEventListener('spaceremit:success', onSuccess);
      window.removeEventListener('spaceremit:fail', onFail);
      window.removeEventListener('spaceremit:message', onMessage);
      window.removeEventListener('spaceremit:auth', onAuth);
    };
  }, []);

  useEffect(() => {
    if (!config?.publicKey || !config?.jsUrl || initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const initGateway = async () => {
      try {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        if (!document.getElementById('spaceremit-form')) {
          throw new Error('Payment form is not ready yet');
        }

        injectSpaceremitConfigScript(config.publicKey);
        await loadSpaceremitLibraryScript(config.jsUrl);
        setGatewayReady(true);
      } catch (scriptError) {
        const message = scriptError instanceof Error ? scriptError.message : 'Failed to load Spaceremit payment script';
        setError(message);
      }
    };

    void initGateway();
  }, [config]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Always prevent default form submission
    
    if (!gatewayReady) {
      setError('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }
    
    // SpaceRemit handles everything via JavaScript, no actual form submission needed
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <p>Loading payment gateway...</p>
      </div>
    );
  }

  if (error && !config?.isConfigured) {
    return (
      <div className={styles.errorBox}>
        <h3>Payment gateway is not configured</h3>
        <p>Add your Spaceremit keys in the backend environment, then set the callback URL in your Spaceremit dashboard:</p>
        {config?.callbackUrl && <code className={styles.callbackUrl}>{config.callbackUrl}</code>}
      </div>
    );
  }

  return (
    <div className={styles.checkoutWrapper}>
      <div className={styles.summaryCard}>
        <p className={styles.summaryLabel}>Selected plan</p>
        <h2 className={styles.summaryTitle}>{planLabel}</h2>
        <div className={styles.summaryAmount}>
          <span>${amount.toFixed(2)}</span>
          <small>{currency}</small>
        </div>
        {config?.isTestMode && <span className={styles.testBadge}>Secure Payment</span>}
      </div>

      {!buyerEmail && (
        <div className={styles.statusMessage}>
          Tip: log in before paying so your email is attached to the transaction.
        </div>
      )}

      {error && <div className={styles.inlineError}>{error}</div>}
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}
      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.spinner} />
          <p>Processing payment...</p>
        </div>
      )}

      <form
        id="spaceremit-form"
        className={styles.paymentForm}
        onSubmit={handleFormSubmit}
      >
        <input type="hidden" name="amount" value={amount.toFixed(2)} readOnly />
        <input type="hidden" name="currency" value={currency} readOnly />
        <input type="hidden" name="fullname" value={buyerName} readOnly />
        <input type="hidden" name="email" value={buyerEmail} readOnly />
        <input type="hidden" name="phone" value={buyerPhone} readOnly />
        <input type="hidden" name="notes" value={orderNotes} readOnly />

        <div className={styles.paymentOption}>
          <input
            type="radio"
            name="sp-pay-type-radio"
            value="local-methods-pay"
            id="sp_local_methods_radio"
            defaultChecked
          />
          <label htmlFor="sp_local_methods_radio">
            <span>Local payment methods</span>
            <small>Bank transfers, e-wallets, and regional options</small>
          </label>
          <div id="spaceremit-local-methods-pay" className={styles.methodContainer} />
        </div>

        <div className={styles.paymentOption}>
          <input
            type="radio"
            name="sp-pay-type-radio"
            value="card-pay"
            id="sp_card_radio"
          />
          <label htmlFor="sp_card_radio">
            <span>Card payment (Coming soon)</span>
            <small>Visa, Mastercard, and more</small>
          </label>
          {/* <div id="spaceremit-card-pay" className={styles.methodContainer} /> */}
        </div>

        <button type="submit" className={styles.payButton} disabled={isProcessing || !gatewayReady}>
          {gatewayReady ? `Pay $${amount.toFixed(2)}` : 'Loading gateway...'}
        </button>
      </form>

      <div className={styles.footerNote}>
        <p>Secure payment powered by Spaceremit</p>
        {/* {config?.callbackUrl && (
          <p className={styles.callbackHint}>
            Callback URL for dashboard setup: <code>{config.callbackUrl}</code>
          </p>
        )} */}
      </div>
    </div>
  );
}
