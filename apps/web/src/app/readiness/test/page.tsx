'use client';

import { PageBackButton } from '@/components/layout/PageBackButton';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { UnifiedTestFlow } from '@/components/test/UnifiedTestFlow';

export default function ReadinessTestPage() {
  return (
    <RequireAuth nextPath="/readiness/test" learnerFlow>
      <div className="page-content">
        <div className="app test-shell">
          <PageBackButton href="/readiness" />
          <UnifiedTestFlow readinessOnly backHref="/readiness" />
        </div>
      </div>
    </RequireAuth>
  );
}
