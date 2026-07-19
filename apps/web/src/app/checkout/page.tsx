'use client';

import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { useSiteSettings } from '@/hooks/useSiteSettings';

type ProductChoice = 'READINESS_TEST' | 'ROADMAP_BUNDLE';

const stripeEnabled = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, format } = useLanguage();
  const { refreshSession, learnerState } = useAuth();
  const { settings } = useSiteSettings();
  const initialProduct = (searchParams.get('product') as ProductChoice) ?? 'READINESS_TEST';
  const roadmapId = searchParams.get('roadmapId');
  const [product, setProduct] = useState<ProductChoice>(
    initialProduct === 'ROADMAP_BUNDLE' ? 'ROADMAP_BUNDLE' : 'READINESS_TEST',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returnProcessing, setReturnProcessing] = useState(false);

  const readinessPrice = settings.pricing.readinessTestCents / 100;
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    (async () => {
      setReturnProcessing(true);
      setError('');
      try {
        try {
          await api.confirmPayment(sessionId);
        } catch {
          // Stripe webhook may have already completed the payment.
        }
        await refreshSession();
        if (!cancelled) {
          setSuccess(t('checkout.confirmedInline'));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : t('checkout.confirmFailed'));
        }
      } finally {
        if (!cancelled) setReturnProcessing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshSession, t]);

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (product === 'ROADMAP_BUNDLE' && !roadmapId) {
        setError(t('checkout.missingRoadmap'));
        return;
      }

      const payment = await api.checkout({
        productType: product,
        productRef: product === 'ROADMAP_BUNDLE' ? (roadmapId ?? undefined) : undefined,
      });
      if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
        return;
      }
      const confirmed = await api.confirmPayment(payment.id);
      if (confirmed.status === 'COMPLETED') {
        await refreshSession();
        setSuccess(t('checkout.successInline'));
        setTimeout(() => {
          if (product === 'READINESS_TEST') {
            router.push('/readiness');
          } else {
            router.push('/roadmap');
          }
        }, 1500);
      } else {
        setError(t('checkout.incomplete'));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('checkout.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="app checkout-shell">
        <span className="eyebrow amber">
          <CreditCard size={14} className="inline-leading-icon" />
          {t('checkout.eyebrow')}
        </span>
        <h1>{t('checkout.title')}</h1>
        <p className="auth-sub">{t('checkout.sub')}</p>

        <div className={`checkout-mode-note${stripeEnabled ? ' stripe' : ' dev'}`}>
          {stripeEnabled ? t('checkout.stripeMode') : t('checkout.devMode')}
        </div>

        {returnProcessing && (
          <p className="auth-sub">
            <Loader2 size={14} className="spin" style={{ display: 'inline' }} />{' '}
            {t('checkout.confirming')}
          </p>
        )}

        <div className="checkout-grid">
          <button
            type="button"
            className={`checkout-card${product === 'READINESS_TEST' ? ' selected' : ''}`}
            onClick={() => setProduct('READINESS_TEST')}
          >
            <div className="checkout-card-head">
              <span className="ci">📝</span>
              <div>
                <b>{t('checkout.readiness.title')}</b>
                <span>{t('checkout.readiness.meta')}</span>
              </div>
              <span className="checkout-price">{format.currency(readinessPrice)}</span>
            </div>
            <ul className="checkout-features">
              <li>
                <Check size={14} /> {t('checkout.readiness.feature1')}
              </li>
              <li>
                <Check size={14} /> {t('checkout.readiness.feature2')}
              </li>
              <li>
                <Check size={14} /> {t('checkout.readiness.feature3')}
              </li>
            </ul>
            {learnerState?.readinessPaid && (
              <span className="checkout-owned">{t('checkout.readiness.owned')}</span>
            )}
          </button>

          <button
            type="button"
            className={`checkout-card highlight${product === 'ROADMAP_BUNDLE' ? ' selected' : ''}`}
            onClick={() => setProduct('ROADMAP_BUNDLE')}
          >
            <span className="badge-rec">{t('checkout.bundle.badge')}</span>
            <div className="checkout-card-head">
              <span className="ci">🗺️</span>
              <div>
                <b>{t('checkout.bundle.title')}</b>
                <span>{t('checkout.bundle.meta')}</span>
              </div>
              <span className="checkout-price">{t('checkout.bundle.price')}</span>
            </div>
            <ul className="checkout-features">
              <li>
                <Check size={14} /> {t('checkout.bundle.feature1')}
              </li>
              <li>
                <Check size={14} /> {t('checkout.bundle.feature2')}
              </li>
              <li>
                <Check size={14} /> {t('checkout.bundle.feature3')}
              </li>
            </ul>
            {learnerState?.roadmapEnrolled && (
              <span className="checkout-owned">{t('checkout.bundle.owned')}</span>
            )}
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button
          type="button"
          className="cta-primary checkout-pay"
          onClick={handleCheckout}
          disabled={loading || returnProcessing}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" /> {t('checkout.processing')}
            </>
          ) : (
            <>{t('checkout.pay')}</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth nextPath="/checkout">
      <Suspense fallback={<CheckoutFallback />}>
        <CheckoutContent />
      </Suspense>
    </RequireAuth>
  );
}

function CheckoutFallback() {
  const { t } = useLanguage();
  return <div className="page-content auth-loading">{t('common.loading')}</div>;
}
