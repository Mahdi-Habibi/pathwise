'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { WizardStage } from '@/components/wizard/WizardStage';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageBackButton } from '@/components/layout/PageBackButton';
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';

export default function AssessmentPage() {
  return (
    <RequireAuth nextPath="/assessment">
      <AssessmentContent />
    </RequireAuth>
  );
}

function AssessmentContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { completeWizard, resetReadinessTest, hydrated } = useApp();
  const { user, learnerState, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user?.profileComplete && !learnerState?.profileComplete) {
      router.replace('/education');
    }
  }, [loading, user, learnerState, router]);

  const handleComplete = async () => {
    await completeWizard();
    resetReadinessTest();
    // First assessment → free preparations (readiness) test → then roadmap.
    router.push('/readiness/test');
  };

  if (!hydrated || loading) {
    return (
      <div className="page-content">
        <div className="app">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user?.profileComplete && !learnerState?.profileComplete) {
    return null;
  }

  return (
    <div className="page-content">
      <div className="app">
        <PageBackButton href="/education" />
        <WizardStage onComplete={handleComplete} onBack={() => router.push('/education')} />
      </div>
    </div>
  );
}
