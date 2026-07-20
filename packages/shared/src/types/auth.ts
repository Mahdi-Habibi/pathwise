export type UserRole = 'LEARNER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  profileComplete: boolean;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface RequestOtpDto {
  phone: string;
}

export interface RequestOtpResponse {
  phone: string;
  expiresInSeconds: number;
  /** Present only when OTP_DEV_EXPOSE is enabled (local development). */
  devCode?: string;
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
}

export interface CompleteProfileDto {
  firstName: string;
  lastName: string;
  city: string;
  email: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface LearnerState {
  user: AuthUser;
  hasRoadmap: boolean;
  roadmapEnrolled: boolean;
  readinessPaid: boolean;
  testCompleted: boolean;
  profileComplete: boolean;
  entitlements: string[];
  enrollments: string[];
}

/** Normalize Iranian mobile numbers to `09xxxxxxxxx`. Returns null if invalid. */
export function normalizeIranianPhone(input: string): string | null {
  const digits = String(input || '')
    .trim()
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s\-()]/g, '');

  let normalized = digits;
  if (normalized.startsWith('+98')) normalized = `0${normalized.slice(3)}`;
  else if (normalized.startsWith('98')) normalized = `0${normalized.slice(2)}`;
  else if (normalized.startsWith('9') && normalized.length === 10) normalized = `0${normalized}`;

  if (!/^09\d{9}$/.test(normalized)) return null;
  return normalized;
}

const UNSAFE_PATTERN =
  /<|>|javascript:|data:text\/html|on\w+\s*=|https?:\/\/|\b(viagra|casino|crypto\s*giveaway)\b/i;

export function containsUnsafeText(value: string): boolean {
  return UNSAFE_PATTERN.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function sanitizeProfileText(value: string, maxLength = 80): string {
  return Array.from(String(value || ''))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .trim()
    .slice(0, maxLength);
}
