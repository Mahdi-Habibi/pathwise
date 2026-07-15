'use client';

import Link from 'next/link';
import { BookOpen, Map, Shield, Trophy } from 'lucide-react';
import { useLanguage } from '@/context/LanguageProvider';

export default function HomePage() {
  const { t, format } = useLanguage();

  return (
    <div className="page-content">
      <div className="app hero">
        <span className="eyebrow">{t('landing.eyebrow', { minutes: format.number(6) })}</span>
        <h1>{t('landing.heroTitle')}</h1>
        <p>{t('landing.heroBody')}</p>
        <div className="hero-actions">
          <Link href="/assessment" className="cta-primary hero-cta">
            {t('landing.ctaAssessment')}
          </Link>
          <Link href="/login" className="cta-secondary hero-cta">
            {t('landing.ctaSignIn')}
          </Link>
        </div>
        <div className="hero-note">
          {t('landing.heroNote', { minutes: format.number(6), count: format.number(12400) })}
        </div>
        <div className="proof-row">
          <div className="proof-item">
            <b>{format.percent(94)}</b>
            <span>{t('landing.proof.match')}</span>
          </div>
          <div className="proof-item">
            <b>{format.number(6)}</b>
            <span>{t('landing.proof.stages')}</span>
          </div>
          <div className="proof-item">
            <b>{format.percent(20)}</b>
            <span>{t('landing.proof.savings')}</span>
          </div>
        </div>
      </div>

      <section className="app features-section">
        <h2 className="section-heading">{t('landing.howHeading')}</h2>
        <p className="section-sub">{t('landing.howSub')}</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Map size={22} />
            </div>
            <h3>{t('landing.feature.goal.title')}</h3>
            <p>{t('landing.feature.goal.body')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={22} />
            </div>
            <h3>{t('landing.feature.readiness.title')}</h3>
            <p>{t('landing.feature.readiness.body')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <BookOpen size={22} />
            </div>
            <h3>{t('landing.feature.courses.title')}</h3>
            <p>{t('landing.feature.courses.body')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Trophy size={22} />
            </div>
            <h3>{t('landing.feature.bootcamp.title')}</h3>
            <p>{t('landing.feature.bootcamp.body')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
