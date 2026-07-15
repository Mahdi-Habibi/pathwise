'use client';

import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';

export default function ReadinessGatePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { resetReadinessTest, testCompleted } = useApp();
  const { learnerState, loading, isAuthenticated } = useAuth();

  const readinessPaid = learnerState?.readinessPaid ?? false;

  const startTest = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/readiness');
      return;
    }
    if (!readinessPaid) {
      router.push('/checkout?product=READINESS_TEST');
      return;
    }
    resetReadinessTest();
    router.push('/readiness/test');
  };

  const goResults = () => router.push('/readiness/results');

  return (
    <div className="page-content">
      <div className="app gate">
        <span className="eyebrow amber">
          {readinessPaid
            ? `🔓 ${t('readiness.gate.eyebrowPaid')}`
            : `🔒 ${t('readiness.gate.eyebrowUnpaid')}`}
        </span>
        <h1>{t('readiness.gate.title')}</h1>
        <p className="desc">{t('readiness.gate.desc')}</p>
        <div className="cover-grid">
          <div className="cover-card">
            <span className="ci">🗂️</span>
            <b>{t('readiness.gate.computer.title')}</b>
            <span>{t('readiness.gate.computer.desc')}</span>
          </div>
          <div className="cover-card">
            <span className="ci">🇬🇧</span>
            <b>{t('readiness.gate.english.title')}</b>
            <span>{t('readiness.gate.english.desc')}</span>
          </div>
          <div className="cover-card">
            <span className="ci">🧠</span>
            <b>{t('readiness.gate.algo.title')}</b>
            <span>{t('readiness.gate.algo.desc')}</span>
          </div>
          <div className="cover-card">
            <span className="ci">🔀</span>
            <b>{t('readiness.gate.flow.title')}</b>
            <span>{t('readiness.gate.flow.desc')}</span>
          </div>
          <div className="cover-card">
            <span className="ci">💻</span>
            <b>{t('readiness.gate.code.title')}</b>
            <span>{t('readiness.gate.code.desc')}</span>
          </div>
        </div>
        <div className="gate-footer">
          <div className="price-tag">
            {t('readiness.gate.priceTag')}
            <span>{t('readiness.gate.priceMeta')}</span>
          </div>
          {loading ? (
            <button type="button" className="cta-primary" disabled>
              <Loader2 size={18} className="spin" /> {t('readiness.gate.loading')}
            </button>
          ) : testCompleted ? (
            <button type="button" className="cta-primary" onClick={goResults}>
              {t('readiness.gate.viewResults')}
            </button>
          ) : readinessPaid ? (
            <button type="button" className="cta-primary" onClick={startTest}>
              {t('readiness.gate.start')}
            </button>
          ) : (
            <button type="button" className="cta-primary" onClick={startTest}>
              <Lock size={16} className="inline-leading-icon inline-leading-icon--spacious" />
              {t('readiness.gate.unlock')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
