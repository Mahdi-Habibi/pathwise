'use client';

import { useRouter } from 'next/navigation';
import { WizardStage } from '@/components/wizard/WizardStage';
import { useApp } from '@/context/AppProvider';
import { useLanguage } from '@/context/LanguageProvider';

export default function AssessmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { completeWizard, hydrated } = useApp();

  const handleComplete = async () => {
    await completeWizard();
    router.push('/roadmap');
  };

  if (!hydrated) {
    return (
      <div className="page-content">
        <div className="app">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="app">
        <WizardStage onComplete={handleComplete} onBack={() => router.push('/')} />
      </div>
    </div>
  );
}
