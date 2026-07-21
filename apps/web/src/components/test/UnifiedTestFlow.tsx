'use client';

import {
  READINESS_MODULES,
  WIZARD_STAGES,
  type AssessmentAnswers,
} from '@pathwise/shared';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CodeFillTask } from '@/components/readiness/CodeFillTask';
import { EnglishReadinessTask } from '@/components/readiness/EnglishReadinessTask';
import { FileExplorerTask } from '@/components/readiness/FileExplorerTask';
import { FlowchartTask } from '@/components/readiness/FlowchartTask';
import { ReorderTask } from '@/components/readiness/ReorderTask';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { GoalStage } from '@/components/wizard/stages/GoalStage';
import { HoursStage } from '@/components/wizard/stages/HoursStage';
import { InterestsStage } from '@/components/wizard/stages/InterestsStage';
import { PersonalityStage } from '@/components/wizard/stages/PersonalityStage';
import { SkillsStage } from '@/components/wizard/stages/SkillsStage';
import { StyleStage } from '@/components/wizard/stages/StyleStage';
import { isWizardStageValid } from '@/components/wizard/wizardOptions';
import { useApp } from '@/context/AppProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { readinessModuleMessageKey } from '@/i18n/domain';

type FlowPhase = 'wizard' | 'readiness';

interface UnifiedTestFlowProps {
  /** When true, starts at readiness modules (retake / gate entry). */
  readinessOnly?: boolean;
  backHref?: string;
}

export function UnifiedTestFlow({
  readinessOnly = false,
  backHref,
}: UnifiedTestFlowProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    answers,
    stageIndex,
    setAnswers,
    setStageIndex,
    completeWizard,
    readinessModuleIndex: modIndex,
    setReadinessModuleIndex,
    updateReadinessScore,
    readinessScores,
    completeReadinessTest,
    resetReadinessTest,
  } = useApp();

  const [phase, setPhase] = useState<FlowPhase>(readinessOnly ? 'readiness' : 'wizard');
  const [transitioning, setTransitioning] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const wizardTotal = WIZARD_STAGES.length;
  const readinessTotal = READINESS_MODULES.length;
  const unifiedTotal = wizardTotal + readinessTotal;
  const unifiedCurrent =
    phase === 'wizard' ? stageIndex : wizardTotal + modIndex;

  const moduleName = READINESS_MODULES[modIndex]!;
  const isLastReadinessModule = modIndex >= READINESS_MODULES.length - 1;
  const isLastWizardStage = stageIndex >= WIZARD_STAGES.length - 1;

  const patchAnswers = useCallback(
    (partial: Partial<AssessmentAnswers>) => {
      setAnswers({ ...answers, ...partial });
    },
    [answers, setAnswers],
  );

  const wizardValid = useMemo(
    () => isWizardStageValid(stageIndex, answers),
    [stageIndex, answers],
  );

  useEffect(() => {
    if (phase === 'readiness') {
      setCanContinue(!!readinessScores[moduleName]);
    }
  }, [phase, modIndex, moduleName, readinessScores]);

  const enterReadinessPhase = useCallback(async () => {
    setTransitioning(true);
    await completeWizard();
    resetReadinessTest();
    setPhase('readiness');
    setReadinessModuleIndex(0);
    setTransitioning(false);
  }, [completeWizard, resetReadinessTest, setReadinessModuleIndex]);

  const handleWizardNext = () => {
    if (!isLastWizardStage) {
      setStageIndex(stageIndex + 1);
      return;
    }
    void enterReadinessPhase();
  };

  const skipModule = () => {
    if (!readinessScores[moduleName]) {
      updateReadinessScore(moduleName, 0, 1);
    }
    void goNextReadiness();
  };

  const goNextReadiness = async () => {
    if (finishing) return;
    if (!isLastReadinessModule) {
      setReadinessModuleIndex(modIndex + 1);
      setCanContinue(!!readinessScores[READINESS_MODULES[modIndex + 1]!]);
      return;
    }
    setFinishing(true);
    try {
      await completeReadinessTest();
    } catch {
      /* local scores remain available */
    }
    router.replace('/roadmap');
  };

  const stageKey = WIZARD_STAGES[stageIndex]!;

  return (
    <div className={`unified-test-flow${transitioning ? ' unified-test-flow--transition' : ''}`}>
      <ProgressTrack
        total={readinessOnly ? readinessTotal : unifiedTotal}
        current={readinessOnly ? modIndex : unifiedCurrent}
        doneClass="test-seg"
        segClass="test-progress"
      />

      {phase === 'wizard' && !readinessOnly && (
        <div className="unified-test-panel" key={`wizard-${stageIndex}`}>
          <div className="stage-label">
            {t('wizard.stageLabel', {
              current: stageIndex + 1,
              name: t(`domain.wizardStages.${stageKey}`),
            })}
          </div>

          {stageIndex === 0 && <GoalStage answers={answers} onChange={patchAnswers} />}
          {stageIndex === 1 && <SkillsStage answers={answers} onChange={patchAnswers} />}
          {stageIndex === 2 && <PersonalityStage answers={answers} onChange={patchAnswers} />}
          {stageIndex === 3 && <InterestsStage answers={answers} onChange={patchAnswers} />}
          {stageIndex === 4 && <StyleStage answers={answers} onChange={patchAnswers} />}
          {stageIndex === 5 && <HoursStage answers={answers} onChange={patchAnswers} />}

          <div className="wizard-nav">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => (stageIndex > 0 ? setStageIndex(stageIndex - 1) : router.push(backHref ?? '/education'))}
              style={{ visibility: stageIndex === 0 && !backHref ? 'hidden' : 'visible' }}
            >
              {t('wizard.backPlain')}
            </button>
            <button
              type="button"
              className="btn-next"
              onClick={handleWizardNext}
              disabled={!wizardValid || transitioning}
            >
              {transitioning
                ? t('readiness.test.finishing')
                : isLastWizardStage
                  ? t('readiness.test.continue')
                  : t('wizard.continue')}
            </button>
          </div>
        </div>
      )}

      {phase === 'readiness' && (
        <div className="unified-test-panel" key={`readiness-${modIndex}`}>
          <div className="test-top">
            <span className="module-tag">{t(readinessModuleMessageKey(moduleName))}</span>
            <span className="module-tag">
              {t('readiness.test.progress', {
                current: modIndex + 1,
                total: READINESS_MODULES.length,
              })}
            </span>
          </div>

          {modIndex === 0 && <FileExplorerTask onComplete={(c, tot) => { updateReadinessScore(moduleName, c, tot); setCanContinue(true); }} />}
          {modIndex === 1 && (
            <EnglishReadinessTask
              onComplete={(c, tot) => {
                updateReadinessScore(moduleName, c, tot);
                setCanContinue(true);
              }}
              onAdvanceToNextModule={() => void goNextReadiness()}
            />
          )}
          {modIndex === 2 && <ReorderTask onComplete={(c, tot) => { updateReadinessScore(moduleName, c, tot); setCanContinue(true); }} />}
          {modIndex === 3 && <FlowchartTask onComplete={(c, tot) => { updateReadinessScore(moduleName, c, tot); setCanContinue(true); }} />}
          {modIndex === 4 && <CodeFillTask onComplete={(c, tot) => { updateReadinessScore(moduleName, c, tot); setCanContinue(true); }} />}

          <div className="test-nav">
            <button type="button" className="btn-ghost" onClick={skipModule} disabled={finishing}>
              {t('readiness.test.skip')}
            </button>
            {modIndex !== 1 && (
              <button
                type="button"
                className="btn-next"
                onClick={() => void goNextReadiness()}
                disabled={finishing || (!canContinue && !readinessScores[moduleName])}
              >
                {finishing
                  ? t('readiness.test.finishing')
                  : isLastReadinessModule
                    ? t('readiness.test.finish')
                    : t('readiness.test.continue')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
