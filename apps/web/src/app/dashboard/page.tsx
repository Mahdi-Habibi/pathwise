'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { buildRoadmapFromAnswers } from '@pathwise/shared';
import { PageBackButton } from '@/components/layout/PageBackButton';
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useT } from '@/context/LanguageProvider';
import { moduleMessageKey } from '@/i18n/domain';

export default function DashboardPage() {
  const router = useRouter();
  const { hasRoadmap, roadmap, answers, testCompleted, hydrated } = useApp();
  const { user, learnerState, loading: authLoading, isAuthenticated } = useAuth();
  const t = useT();

  const ownsRoadmap = hasRoadmap || Boolean(learnerState?.hasRoadmap);
  const ready = hydrated && !authLoading;

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace('/login?next=/dashboard');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return <div className="page-content auth-loading">{t('dashboard.loading')}</div>;
  }

  if (!ownsRoadmap) {
    return (
      <div className="page-content">
        <div className="app hub">
          <PageBackButton href="/" />
          <h2>
            {user?.name
              ? t('dashboard.welcomeNamed', { name: user.name.split(' ')[0] })
              : t('dashboard.welcome')}
          </h2>
          <p className="sub">{t('dashboard.empty.sub')}</p>
          <div className="tile-grid">
            <Link href="/assessment" className="tile">
              <span className="t-icon">🧭</span>
              <b>{t('dashboard.empty.startAssessment.title')}</b>
              <span>{t('dashboard.empty.startAssessment.desc')}</span>
              <span className="t-status">{t('dashboard.empty.startAssessment.status')}</span>
            </Link>
            <Link href="/courses" className="tile">
              <span className="t-icon">📘</span>
              <b>{t('dashboard.empty.browseCourses.title')}</b>
              <span>{t('dashboard.empty.browseCourses.desc')}</span>
              <span className="t-status">{t('dashboard.empty.browseCourses.status')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const data = roadmap ?? buildRoadmapFromAnswers(answers);
  const nextCourse = data.modules[1]
    ? t(moduleMessageKey(data.modules[1]))
    : t('dashboard.fallbackNextCourse');
  const firstName = user?.name?.split(' ')[0] ?? t('dashboard.fallbackName');
  const courseSlug = 'javascript-core';

  return (
    <div className="page-content">
      <div className="app hub">
        <PageBackButton href="/" />
        <h2>{t('dashboard.welcomeBack', { name: firstName })}</h2>
        <p className="sub">{t('dashboard.hub.sub')}</p>
        <div className="tile-grid">
          <button type="button" className="tile" onClick={() => router.push('/roadmap')}>
            <span className="t-icon">🗺️</span>
            <b>{t('dashboard.tile.roadmap.title')}</b>
            <span>{t('dashboard.tile.roadmap.desc')}</span>
            <span className="t-status">{t('dashboard.tile.roadmap.status')}</span>
          </button>
          <button type="button" className="tile" onClick={() => router.push('/readiness')}>
            <span className="t-icon">{testCompleted ? '✅' : '🔒'}</span>
            <b>{t('dashboard.tile.test.title')}</b>
            <span>{t('dashboard.tile.test.desc')}</span>
            <span className="t-status">
              {testCompleted
                ? t('dashboard.tile.test.completed')
                : t('dashboard.tile.test.notStarted')}
            </span>
          </button>
          <button type="button" className="tile" onClick={() => router.push('/bootcamp')}>
            <span className="t-icon">🏆</span>
            <b>{t('dashboard.tile.bootcamp.title')}</b>
            <span>{t('dashboard.tile.bootcamp.desc')}</span>
            <span className="t-status">{t('dashboard.tile.bootcamp.status')}</span>
          </button>
          <button type="button" className="tile" onClick={() => router.push('/courses')}>
            <span className="t-icon">📘</span>
            <b>{t('dashboard.tile.courses.title')}</b>
            <span>{t('dashboard.tile.courses.desc')}</span>
            <span className="t-status">{t('dashboard.tile.courses.status')}</span>
          </button>
          <button
            type="button"
            className="tile"
            onClick={() => router.push(`/learn/${courseSlug}/variables-and-types`)}
          >
            <span className="t-icon">▶️</span>
            <b>{t('dashboard.tile.next.title')}</b>
            <span>{nextCourse}</span>
            <span className="t-status">{t('dashboard.tile.next.status')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
