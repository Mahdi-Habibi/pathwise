'use client';

import type { ReactNode } from 'react';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Footer } from '@/components/layout/Footer';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/context/AuthProvider';

/**
 * Site chrome (header + footer) only after successful registration
 * (profileComplete). Guests see a clean start page / funnel without nav
 * shortcuts into the dashboard.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const { user, learnerState, loading } = useAuth();
  const registered = Boolean(user?.profileComplete || learnerState?.profileComplete);
  const showChrome = !loading && registered;

  return (
    <>
      <DemoBanner />
      {showChrome ? <TopBar /> : null}
      <main className={`site-main${showChrome ? '' : ' site-main--guest'}`}>{children}</main>
      {showChrome ? <Footer /> : null}
    </>
  );
}
