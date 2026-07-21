'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageProvider';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="page-content auth-loading" />}>
      <RegisterRedirect />
    </Suspense>
  );
}

/** Learner registration is phone-first via /education. */
function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    const next = searchParams.get('next');
    const target = next ? `/education?next=${encodeURIComponent(next)}` : '/education';
    router.replace(target);
  }, [router, searchParams]);

  return <div className="page-content auth-loading">{t('common.loading')}</div>;
}
