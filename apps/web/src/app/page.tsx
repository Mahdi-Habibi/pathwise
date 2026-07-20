'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageProvider';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="page-content landing-minimal">
      <div className="landing-orbs" aria-hidden="true">
        <span className="landing-orb landing-orb-a" />
        <span className="landing-orb landing-orb-b" />
      </div>

      <section className="app landing-hero">
        <header className="landing-header">
          <span className="landing-brand">{t('common.brand')}</span>
          <p className="landing-eyebrow">{t('landing.eyebrow')}</p>
        </header>

        <h1 className="landing-title">{t('landing.heroTitle')}</h1>
        <p className="landing-body">{t('landing.heroBody')}</p>

        <div className="landing-actions">
          <Link href="/material" className="landing-path-card">
            <span className="landing-path-icon" aria-hidden="true">
              ◈
            </span>
            <span className="landing-path-title">{t('landing.ctaMaterial')}</span>
            <span className="landing-path-desc">{t('landing.materialHint')}</span>
          </Link>
          <Link href="/education" className="landing-path-card landing-path-card--accent">
            <span className="landing-path-icon" aria-hidden="true">
              ✦
            </span>
            <span className="landing-path-title">{t('landing.ctaEducation')}</span>
            <span className="landing-path-desc">{t('landing.educationHint')}</span>
          </Link>
        </div>

        <p className="landing-note">{t('landing.heroNote')}</p>
      </section>
    </div>
  );
}
