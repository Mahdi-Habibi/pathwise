'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { computeReadinessResult, READINESS_MODULES, type ReadinessResult } from '@pathwise/shared';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageBackButton } from '@/components/layout/PageBackButton';
import { RadarChart } from '@/components/readiness/RadarChart';
import { useApp } from '@/context/AppProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { readinessModuleMessageKey } from '@/i18n/domain';
import { api, ApiError } from '@/lib/api';

function ReadinessResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');
  const { t } = useLanguage();
  const { readinessScores, readinessResult, testCompleted, hydrated, roadmap } = useApp();
  const [historicalResult, setHistoricalResult] = useState<
    (ReadinessResult & { id: string; createdAt: string }) | null
  >(null);
  const [loadError, setLoadError] = useState('');

  const hasScores = Object.keys(readinessScores).length > 0;
  const localResult = useMemo(
    () => readinessResult ?? (hasScores ? computeReadinessResult(readinessScores) : null),
    [readinessResult, readinessScores, hasScores],
  );

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;
    api
      .getReadinessTest(testId)
      .then((res) => {
        if (!cancelled) setHistoricalResult(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : t('common.errorFallback'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [testId, t]);

  useEffect(() => {
    if (!hydrated || testId) return;
    if (!testCompleted && !hasScores && !readinessResult) {
      router.replace('/readiness');
    }
  }, [hydrated, testCompleted, hasScores, readinessResult, router, testId]);

  const result = testId ? historicalResult : localResult;

  if (testId && loadError) {
    return (
      <div className="page-content">
        <div className="app results">
          <p className="form-error">{loadError}</p>
          <button type="button" className="cta-secondary" onClick={() => router.push('/dashboard')}>
            {t('readiness.results.backDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="page-content">
        <div className="app results">
          <p className="sub">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const verdictKey = result.passed ? 'pass' : 'warn';
  const verdictStyle = result.passed
    ? {
        borderColor: 'var(--emerald)',
        background: 'var(--emerald-dim)',
        border: '1px solid var(--emerald)',
      }
    : {
        borderColor: 'var(--amber)',
        background: 'var(--amber-dim)',
        border: '1px solid var(--amber)',
      };

  const roadmapHref = roadmap?.id ? `/roadmap?roadmapId=${encodeURIComponent(roadmap.id)}` : '/roadmap';

  return (
    <div className="page-content">
      <div className="app results">
        <PageBackButton
          href={testId ? '/dashboard' : '/readiness'}
          label={testId ? t('readiness.results.backDashboard') : t('readiness.results.backTest')}
        />
        <div className="results-tag">{t('readiness.results.tag')}</div>
        <h2>{t('readiness.results.title')}</h2>
        <p className="sub">{t('readiness.results.sub')}</p>

        <div className="results-summary-card">
          <div className="results-avg">
            <span className="results-avg-label">{t('readiness.results.average')}</span>
            <strong className="results-avg-value">{result.average}%</strong>
          </div>
          <div className="results-pass-chip" data-passed={result.passed ? 'true' : 'false'}>
            {result.passed ? t('readiness.results.passed') : t('readiness.results.needsWork')}
          </div>
        </div>

        <div className="results-grid">
          <RadarChart percentages={result.percentages} />
          <div className="score-list">
            {READINESS_MODULES.map((m) => (
              <div key={m} className="score-row">
                <div className="score-label">{t(readinessModuleMessageKey(m))}</div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${result.percentages[m] ?? 0}%` }}
                  />
                </div>
                <div className="score-pct">{result.percentages[m] ?? 0}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="verdict-card" style={verdictStyle}>
          <div className="vi">{result.verdict.icon}</div>
          <h4>{t(`readiness.verdict.${verdictKey}.title`)}</h4>
          <p>{t(`readiness.verdict.${verdictKey}.message`, { avg: result.average })}</p>
        </div>
        <div className="unlock-cta">
          <div>
            <h5>{t(`readiness.verdict.${verdictKey}.unlockTitle`)}</h5>
            <p>{t(`readiness.verdict.${verdictKey}.unlockSub`)}</p>
          </div>
          <div className="results-actions">
            <button type="button" className="cta-primary" onClick={() => router.push(roadmapHref)}>
              {t('readiness.results.viewRoadmap')}
            </button>
            <button type="button" className="cta-secondary" onClick={() => router.push('/dashboard')}>
              {t('readiness.results.backDashboard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReadinessResultsPage() {
  return (
    <RequireAuth nextPath="/readiness/results" learnerFlow>
      <Suspense
        fallback={
          <div className="page-content auth-loading">
            {/* loading text filled by inner content */}
          </div>
        }
      >
        <ReadinessResultsContent />
      </Suspense>
    </RequireAuth>
  );
}
