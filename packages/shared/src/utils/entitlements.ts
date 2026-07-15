/** Build the canonical entitlement key stored in LearnerState. */
export function entitlementKey(resourceType: string, resourceId: string): string {
  return `${resourceType}:${resourceId}`;
}

export function hasReadinessEntitlement(entitlements: string[]): boolean {
  return entitlements.includes(entitlementKey('readiness', 'test'));
}

export function hasRoadmapEntitlement(entitlements: string[], roadmapId?: string | null): boolean {
  if (roadmapId) {
    return entitlements.includes(entitlementKey('roadmap', roadmapId));
  }
  return entitlements.some((entry) => entry.startsWith('roadmap:'));
}

export function hasCourseEntitlement(entitlements: string[], courseIdOrSlug: string): boolean {
  return entitlements.includes(entitlementKey('course', courseIdOrSlug));
}
