'use client';

import type { AssessmentAnswers, Interest } from '@pathwise/shared';
import { useLanguage } from '@/context/LanguageProvider';
import { OptCard } from '../OptCard';
import { INTEREST_OPTIONS } from '../wizardOptions';

interface Props {
  answers: AssessmentAnswers;
  onChange: (partial: Partial<AssessmentAnswers>) => void;
}

export function InterestsStage({ answers, onChange }: Props) {
  const { t } = useLanguage();

  const toggleInterest = (val: Interest) => {
    const interests = [...answers.interests];
    const idx = interests.indexOf(val);
    if (idx > -1) {
      interests.splice(idx, 1);
    } else {
      if (interests.length >= 2) interests.shift();
      interests.push(val);
    }
    onChange({ interests });
  };

  return (
    <>
      <div className="q-title">{t('wizard.interests.title')}</div>
      <div className="q-sub">{t('wizard.interests.sub')}</div>
      <div className="option-grid">
        {INTEREST_OPTIONS.map(([val, icon]) => (
          <OptCard
            key={val}
            icon={icon}
            title={t(`wizard.interests.${val}.title`)}
            desc={t(`wizard.interests.${val}.desc`)}
            selected={answers.interests.includes(val)}
            onSelect={() => toggleInterest(val)}
          />
        ))}
      </div>
    </>
  );
}
