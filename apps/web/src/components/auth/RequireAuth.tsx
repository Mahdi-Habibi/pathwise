'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';

interface RequireAuthProps {
  children: ReactNode;
  nextPath: string;
}

/** Client-side auth gate (replaces Next.js middleware for static / GitHub Pages builds). */
export function RequireAuth({ children, nextPath }: RequireAuthProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [loading, isAuthenticated, router, nextPath]);

  if (loading || !isAuthenticated) {
    return <div className="page-content auth-loading">{t('common.loading')}</div>;
  }

  return <>{children}</>;
}
