export type UserRole = 'LEARNER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface LearnerState {
  user: AuthUser;
  hasRoadmap: boolean;
  roadmapEnrolled: boolean;
  readinessPaid: boolean;
  testCompleted: boolean;
  entitlements: string[];
  enrollments: string[];
}
