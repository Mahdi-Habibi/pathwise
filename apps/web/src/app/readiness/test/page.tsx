'use client';

import { PageBackButton } from '@/components/layout/PageBackButton';
import { UnifiedTestFlow } from '@/components/test/UnifiedTestFlow';

export default function ReadinessTestPage() {
  return (
    <div className="page-content">
      <div className="app test-shell">
        <PageBackButton href="/readiness" />
        <UnifiedTestFlow readinessOnly backHref="/readiness" />
      </div>
    </div>
  );
}
