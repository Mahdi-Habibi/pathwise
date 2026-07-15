'use client';

import { WIZARD_STAGES, type AssessmentAnswers } from '@pathwise/shared';
import { useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { isWizardStageValid } from './wizardOptions';
import { GoalStage } from './stages/GoalStage';
import { SkillsStage } from './stages/SkillsStage';
import { PersonalityStage } from './stages/PersonalityStage';
import { InterestsStage } from './stages/InterestsStage';
import { StyleStage } from './stages/StyleStage';
import { HoursStage } from './stages/HoursStage';

interface WizardStageProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function WizardStage({ onComplete, onBack }: WizardStageProps) {
  const { t } = useLanguage();
  const { answers, stageIndex, setAnswers, setStageIndex } = useApp();

  const patchAnswers = useCallback(
    (partial: Partial<AssessmentAnswers>) => {
      setAnswers({ ...answers, ...partial });
    },
    [answers, setAnswers],
  );

  const isValid = useMemo(() => isWizardStageValid(stageIndex, answers), [stageIndex, answers]);

  const handleNext = () => {
    if (stageIndex < WIZARD_STAGES.length - 1) {
      setStageIndex(stageIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (stageIndex > 0) {
      setStageIndex(stageIndex - 1);
    } else {
      onBack?.();
    }
  };

  const stageKey = WIZARD_STAGES[stageIndex]!;

  return (
    <div className="wizard-shell">
      <ProgressTrack total={WIZARD_STAGES.length} current={stageIndex} />
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
          onClick={handlePrev}
          style={{ visibility: stageIndex === 0 ? 'hidden' : 'visible' }}
        >
          {t('wizard.back')}
        </button>
        <button type="button" className="btn-next" onClick={handleNext} disabled={!isValid}>
          {stageIndex === WIZARD_STAGES.length - 1 ? t('wizard.seeRoadmap') : t('wizard.continue')}
        </button>
      </div>
    </div>
  );
}
