'use client';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PageBackButton } from '@/components/layout/PageBackButton';
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';

export default function ReadinessGatePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { resetReadinessTest, testCompleted } = useApp();
  const { loading, isAuthenticated } = useAuth();

  const startTest = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/readiness');
      return;
    }
    // Preparations test is free after assessment — no purchase gate.
    resetReadinessTest();
    router.push('/readiness/test');
  };

  const goResults = () => router.push('/readiness/results');
  const goRoadmap = () => router.push('/roadmap');

  return (
    <div className="page-content">
      <div className="app gate">
        <PageBackButton href="/assessment" label={t('readiness.gate.backAssessment')} />
        <span className="eyebrow amber">🔓 {t('readiness.gate.eyebrowFree')}</span>
        <h1>{t('readiness.gate.title')}</h1>
        <p className="desc">{t('readiness.gate.descFree')}</p>
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
            {t('readiness.gate.priceFree')}
            <span>{t('readiness.gate.priceMeta')}</span>
          </div>
          {loading ? (
            <button type="button" className="cta-primary" disabled>
              <Loader2 size={18} className="spin" /> {t('readiness.gate.loading')}
            </button>
          ) : testCompleted ? (
            <div className="gate-actions">
              <button type="button" className="cta-primary" onClick={goResults}>
                {t('readiness.gate.viewResults')}
              </button>
              <button type="button" className="cta-secondary" onClick={goRoadmap}>
                {t('readiness.gate.viewRoadmap')}
              </button>
            </div>
          ) : (
            <div className="gate-actions">
              <button type="button" className="cta-primary" onClick={startTest}>
                {t('readiness.gate.start')}
              </button>
              <button type="button" className="cta-secondary" onClick={() => router.push('/courses')}>
                {t('readiness.gate.viewCourses')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
