'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { computeReadinessResult, READINESS_MODULES } from '@pathwise/shared';
import { RadarChart } from '@/components/readiness/RadarChart';
import { useApp } from '@/context/AppProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { readinessModuleMessageKey } from '@/i18n/domain';

export default function ReadinessResultsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { readinessScores, readinessResult, testCompleted, hydrated } = useApp();

  const result = useMemo(
    () => readinessResult ?? computeReadinessResult(readinessScores),
    [readinessResult, readinessScores],
  );

  useEffect(() => {
    if (hydrated && !testCompleted && Object.keys(readinessScores).length === 0) {
      router.replace('/readiness');
    }
  }, [hydrated, testCompleted, readinessScores, router]);

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

  return (
    <div className="page-content">
      <div className="app results">
        <div className="results-tag">{t('readiness.results.tag')}</div>
        <h2>{t('readiness.results.title')}</h2>
        <p className="sub">{t('readiness.results.sub')}</p>
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
          <button type="button" className="cta-primary" onClick={() => router.push('/dashboard')}>
            {t('readiness.results.backDashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
