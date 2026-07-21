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
            <span className="landing-path-title">{t('landing.ctaMaterial')}</span>
            <span className="landing-path-badge">{t('landing.materialBadge')}</span>
          </Link>
          <Link href="/education" className="landing-path-card landing-path-card--accent">
            <span className="landing-path-title">{t('landing.ctaEducation')}</span>
          </Link>
        </div>

        <footer className="landing-guest-footer" aria-label={t('nav.footer.legal')}>
          <Link href="/contact">{t('landing.ctaContact')}</Link>
          <Link href="/privacy">{t('nav.footer.privacy')}</Link>
          <Link href="/terms">{t('nav.footer.terms')}</Link>
        </footer>
      </section>
    </div>
  );
}
