import { describe, expect, it } from 'vitest';
import {
  entitlementKey,
  hasCourseEntitlement,
  hasReadinessEntitlement,
  hasRoadmapEntitlement,
} from './utils/entitlements';

describe('entitlements', () => {
  it('builds canonical entitlement keys', () => {
    expect(entitlementKey('roadmap', 'abc')).toBe('roadmap:abc');
    expect(entitlementKey('readiness', 'test')).toBe('readiness:test');
  });

  it('detects readiness entitlement', () => {
    expect(hasReadinessEntitlement(['readiness:test'])).toBe(true);
    expect(hasReadinessEntitlement(['roadmap:abc'])).toBe(false);
  });

  it('detects roadmap entitlement for a specific id or any roadmap', () => {
    expect(hasRoadmapEntitlement(['roadmap:rm-1'], 'rm-1')).toBe(true);
    expect(hasRoadmapEntitlement(['roadmap:rm-1'], 'rm-2')).toBe(false);
    expect(hasRoadmapEntitlement(['roadmap:rm-1'])).toBe(true);
    expect(hasRoadmapEntitlement(['course:js'])).toBe(false);
  });

  it('detects course entitlement', () => {
    expect(hasCourseEntitlement(['course:javascript-core'], 'javascript-core')).toBe(true);
  });
});
