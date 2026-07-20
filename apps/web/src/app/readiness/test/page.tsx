'use client';

import { READINESS_MODULES } from '@pathwise/shared';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CodeFillTask } from '@/components/readiness/CodeFillTask';
import { EnglishReadinessTask } from '@/components/readiness/EnglishReadinessTask';
import { FileExplorerTask } from '@/components/readiness/FileExplorerTask';
import { FlowchartTask } from '@/components/readiness/FlowchartTask';
import { ReorderTask } from '@/components/readiness/ReorderTask';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { PageBackButton } from '@/components/layout/PageBackButton';
import { useApp } from '@/context/AppProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { readinessModuleMessageKey } from '@/i18n/domain';

export default function ReadinessTestPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    readinessModuleIndex: modIndex,
    setReadinessModuleIndex,
    updateReadinessScore,
    readinessScores,
    completeReadinessTest,
  } = useApp();
  const [canContinue, setCanContinue] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const moduleName = READINESS_MODULES[modIndex]!;
  const isLastModule = modIndex >= READINESS_MODULES.length - 1;

  useEffect(() => {
    setCanContinue(!!readinessScores[moduleName]);
  }, [modIndex, moduleName, readinessScores]);

  const handleComplete = useCallback(
    (correct: number, total: number) => {
      updateReadinessScore(moduleName, correct, total);
      setCanContinue(true);
    },
    [moduleName, updateReadinessScore],
  );

  const skipModule = () => {
    if (!readinessScores[moduleName]) {
      updateReadinessScore(moduleName, 0, 1);
    }
    void goNext();
  };

  const goNext = async () => {
    if (finishing) return;
    if (!isLastModule) {
      setReadinessModuleIndex(modIndex + 1);
      setCanContinue(!!readinessScores[READINESS_MODULES[modIndex + 1]!]);
      return;
    }
    setFinishing(true);
    try {
      await completeReadinessTest();
      router.replace('/readiness/results');
    } catch {
      // Still open results — local scores remain available for the scorecard.
      router.replace('/readiness/results');
    }
  };

  return (
    <div className="page-content">
      <div className="app test-shell">
        <PageBackButton href="/readiness" />
        <div className="test-top">
          <span className="module-tag">{t(readinessModuleMessageKey(moduleName))}</span>
          <span className="module-tag">
            {t('readiness.test.progress', {
              current: modIndex + 1,
              total: READINESS_MODULES.length,
            })}
          </span>
        </div>
        <ProgressTrack
          total={READINESS_MODULES.length}
          current={modIndex}
          doneClass="test-seg"
          segClass="test-progress"
        />

        {modIndex === 0 && <FileExplorerTask onComplete={handleComplete} />}
        {modIndex === 1 && <EnglishReadinessTask onComplete={handleComplete} />}
        {modIndex === 2 && <ReorderTask onComplete={handleComplete} />}
        {modIndex === 3 && <FlowchartTask onComplete={handleComplete} />}
        {modIndex === 4 && <CodeFillTask onComplete={handleComplete} />}

        <div className="test-nav">
          <button type="button" className="btn-ghost" onClick={skipModule} disabled={finishing}>
            {t('readiness.test.skip')}
          </button>
          <button
            type="button"
            className="btn-next"
            onClick={() => void goNext()}
            disabled={finishing || (!canContinue && !readinessScores[moduleName])}
          >
            {finishing
              ? t('readiness.test.finishing')
              : isLastModule
                ? t('readiness.test.seeResults')
                : t('readiness.test.continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
