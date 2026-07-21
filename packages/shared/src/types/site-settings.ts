/** Site-wide settings editable from the admin panel. */

export interface SiteGeneralSettings {
  siteName: string;
  tagline: string;
  heroMinutes: number;
  heroRoadmapsCount: number;
  heroMatchPercent: number;
  supportEmail: string;
}

export interface SitePricingSettings {
  readinessTestCents: number;
  courseCents: number;
  /** Per-module prices in dollars (used for roadmap pricing). */
  modulePrices: number[];
  /** Bundle discount as percent, e.g. 20 = 20% off. */
  bundleDiscountPercent: number;
}

export interface SiteTrackSettings {
  key: string;
  name: string;
  icon: string;
  description: string;
  modules: string[];
}

export interface SiteReadinessSettings {
  passThreshold: number;
  passTitle: string;
  passMessage: string;
  failTitle: string;
  failMessage: string;
}

export interface SiteBootcampSettings {
  unlockScoreThreshold: number;
  unlockCourseSlug: string;
  defaultRank: number;
  defaultPoints: number;
}

/** Granular permission flags for a single admin panel section. */
export interface AdminSectionPermission {
  view: boolean;
  manage: boolean;
  edit: boolean;
}

export type AdminAccessSection = 'stats' | 'settings' | 'courses' | 'challenges' | 'users';

/** What regular ADMIN users may access. SUPER_ADMIN always has full access. */
export type SiteAdminAccessSettings = Record<AdminAccessSection, AdminSectionPermission>;

export function createSectionPermission(
  view = false,
  manage = false,
  edit = false,
): AdminSectionPermission {
  return { view, manage, edit };
}

/** Normalize legacy boolean flags or partial objects from persisted settings. */
export function normalizeAdminSectionPermission(value: unknown): AdminSectionPermission {
  if (typeof value === 'boolean') {
    return createSectionPermission(value, value, value);
  }
  if (value && typeof value === 'object') {
    const v = value as Partial<AdminSectionPermission>;
    return {
      view: Boolean(v.view),
      manage: Boolean(v.manage),
      edit: Boolean(v.edit),
    };
  }
  return createSectionPermission(false, false, false);
}

export function normalizeAdminAccess(raw: unknown): SiteAdminAccessSettings {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    stats: normalizeAdminSectionPermission(source.stats),
    settings: normalizeAdminSectionPermission(source.settings),
    courses: normalizeAdminSectionPermission(source.courses),
    challenges: normalizeAdminSectionPermission(source.challenges),
    users: normalizeAdminSectionPermission(source.users),
  };
}

export function adminSectionAllowed(
  access: SiteAdminAccessSettings,
  section: AdminAccessSection,
  level: keyof AdminSectionPermission = 'view',
): boolean {
  return Boolean(access[section]?.[level]);
}

export interface SiteSettings {
  general: SiteGeneralSettings;
  pricing: SitePricingSettings;
  tracks: SiteTrackSettings[];
  readiness: SiteReadinessSettings;
  bootcamp: SiteBootcampSettings;
  adminAccess: SiteAdminAccessSettings;
}

export type SiteSettingsSection = keyof SiteSettings;

export interface UpdateSiteSettingsDto {
  general?: Partial<SiteGeneralSettings>;
  pricing?: Partial<SitePricingSettings>;
  tracks?: SiteTrackSettings[];
  readiness?: Partial<SiteReadinessSettings>;
  bootcamp?: Partial<SiteBootcampSettings>;
  adminAccess?: Partial<SiteAdminAccessSettings>;
}
