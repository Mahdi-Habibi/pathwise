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
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { readinessModuleMessageKey } from '@/i18n/domain';

export default function ReadinessTestPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { learnerState } = useAuth();
  const {
    readinessModuleIndex: modIndex,
    setReadinessModuleIndex,
    updateReadinessScore,
    readinessScores,
    completeReadinessTest,
  } = useApp();
  const [canContinue, setCanContinue] = useState(false);

  const moduleName = READINESS_MODULES[modIndex]!;

  useEffect(() => {
    if (learnerState && !learnerState.readinessPaid) {
      router.replace('/checkout?product=READINESS_TEST');
    }
  }, [learnerState, router]);

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
    if (modIndex < READINESS_MODULES.length - 1) {
      setReadinessModuleIndex(modIndex + 1);
      setCanContinue(!!readinessScores[READINESS_MODULES[modIndex + 1]!]);
    } else {
      await completeReadinessTest();
      router.push('/readiness/results');
    }
  };

  return (
    <div className="page-content">
      <div className="app test-shell">
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
          <button type="button" className="btn-ghost" onClick={skipModule}>
            {t('readiness.test.skip')}
          </button>
          <button
            type="button"
            className="btn-next"
            onClick={() => void goNext()}
            disabled={!canContinue && !readinessScores[moduleName]}
          >
            {t('readiness.test.continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
