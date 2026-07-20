'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageProvider';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="page-content landing-minimal">
      <section className="app landing-hero">
        <header className="landing-header">
          <span className="landing-brand">{t('common.brand')}</span>
          <p className="landing-eyebrow">{t('landing.eyebrow')}</p>
        </header>

        <h1 className="landing-title">{t('landing.heroTitle')}</h1>
        <p className="landing-body">{t('landing.heroBody')}</p>

        <div className="landing-actions">
          <Link href="/material" className="cta-primary hero-cta">
            {t('landing.ctaMaterial')}
          </Link>
          <Link href="/education" className="cta-secondary hero-cta">
            {t('landing.ctaEducation')}
          </Link>
        </div>

        <p className="landing-note">{t('landing.heroNote')}</p>
      </section>
    </div>
  );
}
