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

/** What regular ADMIN users may access. SUPER_ADMIN always has full access. */
export interface SiteAdminAccessSettings {
  stats: boolean;
  settings: boolean;
  courses: boolean;
  challenges: boolean;
  users: boolean;
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
