'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { buildRoadmapFromAnswers } from '@pathwise/shared';
import { PurchaseSection } from '@/components/roadmap/PurchaseSection';
import { RoadmapTree } from '@/components/roadmap/RoadmapTree';
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { goalMessageKey, levelMessageKey, styleMessageKey, trackMessageKey } from '@/i18n/domain';

export default function RoadmapPage() {
  const router = useRouter();
  const { answers, roadmap, enrollBundle, openPurchaseModal, hydrated } = useApp();
  const { isAuthenticated, learnerState } = useAuth();
  const { t, format } = useLanguage();

  const data = roadmap ?? buildRoadmapFromAnswers(answers);
  const trackName = t(trackMessageKey(data.trackKey));

  useEffect(() => {
    if (hydrated && !answers.goal) {
      router.replace('/assessment');
    }
  }, [hydrated, answers.goal, router]);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/roadmap');
      return;
    }
    if (!learnerState?.roadmapEnrolled) {
      const hasBundle =
        learnerState?.entitlements.includes('ROADMAP_BUNDLE') ||
        learnerState?.entitlements.some((e) => e.includes('bundle'));
      if (!hasBundle) {
        router.push('/checkout?product=ROADMAP_BUNDLE');
        return;
      }
    }
    enrollBundle(() => router.push('/dashboard'));
  };

  const handleBrowseCourses = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/courses');
      return;
    }
    openPurchaseModal('a la carte course');
  };

  return (
    <div className="page-content">
      <div className="app result-shell">
        <div className="aha">{t('roadmap.aha')}</div>
        <h2>{t('roadmap.title', { trackName })}</h2>
        <div className="profile-strip">
          <div className="profile-chip">
            {t('roadmap.chip.goal')} <b>{t(goalMessageKey(data.profile.goal))}</b>
          </div>
          <div className="profile-chip">
            {t('roadmap.chip.level')} <b>{t(levelMessageKey(data.profile.level))}</b>
          </div>
          <div className="profile-chip">
            {t('roadmap.chip.style')} <b>{t(styleMessageKey(data.profile.style))}</b>
          </div>
          <div className="profile-chip">
            {t('roadmap.chip.pace')}{' '}
            <b>{t('roadmap.chip.hours', { hours: format.number(data.profile.hours) })}</b>
          </div>
        </div>

        <RoadmapTree modules={data.modules} />

        <PurchaseSection
          roadmap={data}
          onBrowseCourses={handleBrowseCourses}
          onEnrollBundle={handleEnroll}
        />

        <div className="teaser">
          <div className="teaser-left">
            <div className="teaser-icon">🔒</div>
            <div>
              <h5>{t('roadmap.teaser.title')}</h5>
              <p>{t('roadmap.teaser.body')}</p>
            </div>
          </div>
          <Link href="/readiness" className="teaser-btn" style={{ textDecoration: 'none' }}>
            {t('roadmap.teaser.cta', { price: format.currency(19) })}
          </Link>
        </div>
      </div>
    </div>
  );
}
