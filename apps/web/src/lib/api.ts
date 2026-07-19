import type {
  AssessmentAnswers,
  AssessmentResponse,
  AuthResponse,
  AuthTokens,
  AuthUser,
  ChallengeScoreResult,
  ChallengeSubmissionDto,
  CheckoutDto,
  CourseSummary,
  CreateChallengeDto,
  CreateCourseDto,
  CreateLessonDto,
  LearnerState,
  LessonDetail,
  LessonSummary,
  LoginDto,
  PaymentResponse,
  ReadinessResult,
  ReadinessScores,
  ReadinessTestDto,
  RegisterDto,
  RoadmapResponse,
  SiteSettings,
  UpdateChallengeDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateSiteSettingsDto,
  UserRole,
  AdminStats,
  AdminCourse,
  AdminLesson,
  AdminChallenge,
  AdminUser,
} from '@pathwise/shared';
import { clearTokens, getAccessToken, setAccessToken } from '@/lib/auth';
import { ApiError } from '@/lib/apiError';
import { demoApi } from '@/lib/demoApi';
import { isDemoMode } from '@/lib/demoMode';

export type {
  AdminStats,
  AdminCourse,
  AdminLesson,
  AdminChallenge,
  AdminUser,
  CreateCourseDto,
  UpdateCourseDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateChallengeDto,
  UpdateChallengeDto,
  SiteSettings,
  UpdateSiteSettingsDto,
  AuthUser,
};

export { ApiError };

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function apiBase(): string {
  // Empty NEXT_PUBLIC_API_URL uses same-origin /api (Next.js rewrite → Nest in local/Docker).
  // GitHub Pages demo mode uses in-browser mocks when NEXT_PUBLIC_DEMO_MODE=true.
  // Absolute URL keeps direct browser→API calls for hosted Nest backends.
  return API_URL || '';
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
}

let refreshPromise: Promise<AuthTokens> | null = null;

async function parseErrorBody(res: Response): Promise<{ message?: string }> {
  try {
    return (await res.json()) as { message?: string };
  } catch {
    return {};
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, skipRefreshRetry, headers: customHeaders, ...fetchOptions } = options;
  const token = skipAuth ? null : getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase()}/api${path}`, {
    credentials: 'include',
    ...fetchOptions,
    headers,
  });

  if (
    res.status === 401 &&
    !skipRefreshRetry &&
    !skipAuth &&
    path !== '/auth/refresh' &&
    path !== '/auth/login' &&
    path !== '/auth/register'
  ) {
    try {
      if (!refreshPromise) {
        refreshPromise = liveApi.refresh().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      return request<T>(path, { ...options, skipRefreshRetry: true });
    } catch {
      clearTokens();
    }
  }

  if (!res.ok) {
    const body = await parseErrorBody(res);
    const message = body.message ?? res.statusText ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

const liveApi = {
  register(dto: RegisterDto): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
      skipAuth: true,
    }).then((res) => {
      setAccessToken(res.accessToken);
      return res;
    });
  },

  login(dto: LoginDto): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
      skipAuth: true,
    }).then((res) => {
      setAccessToken(res.accessToken);
      return res;
    });
  },

  async logout(): Promise<void> {
    try {
      await request<void>('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  refresh(): Promise<AuthTokens> {
    return request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
      skipRefreshRetry: true,
    }).then((tokens) => {
      setAccessToken(tokens.accessToken);
      return tokens;
    });
  },

  me(): Promise<LearnerState> {
    return request('/auth/me');
  },

  checkout(dto: CheckoutDto): Promise<PaymentResponse> {
    return request<PaymentResponse>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  confirmPayment(id: string): Promise<PaymentResponse> {
    return request<PaymentResponse>(`/payments/confirm/${id}`, {
      method: 'POST',
    });
  },

  myPayments(): Promise<PaymentResponse[]> {
    return request<PaymentResponse[]>('/payments/my');
  },

  listCourses(): Promise<CourseSummary[]> {
    return request<CourseSummary[]>('/courses');
  },

  getCourse(slug: string): Promise<CourseSummary & { lessons: LessonSummary[] }> {
    return request(`/courses/${slug}`);
  },

  getLesson(courseSlug: string, lessonSlug: string): Promise<LessonDetail> {
    return request(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  },

  enrollCourse(slug: string): Promise<void> {
    return request<void>(`/courses/${slug}/enroll`, { method: 'POST' });
  },

  completeLesson(courseSlug: string, lessonSlug: string): Promise<void> {
    return request<void>(`/courses/${courseSlug}/lessons/${lessonSlug}/complete`, {
      method: 'POST',
    });
  },

  saveAssessment(answers: AssessmentAnswers): Promise<AssessmentResponse> {
    return request<AssessmentResponse>('/assessments', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  saveRoadmap(answers: AssessmentAnswers): Promise<RoadmapResponse> {
    return request<RoadmapResponse>('/roadmaps', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  enrollRoadmap(roadmapId: string): Promise<RoadmapResponse> {
    return request<RoadmapResponse>(`/roadmaps/${roadmapId}/enroll`, {
      method: 'POST',
    });
  },

  saveReadinessTest(scores: ReadinessScores): Promise<ReadinessResult> {
    const dto: ReadinessTestDto = { scores };
    return request<ReadinessResult>('/readiness', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  submitChallenge(code: string): Promise<ChallengeScoreResult> {
    const dto: ChallengeSubmissionDto = { code };
    return request<ChallengeScoreResult>('/challenges', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  adminStats(): Promise<AdminStats> {
    return request<AdminStats>('/admin/stats');
  },

  adminListCourses(): Promise<AdminCourse[]> {
    return request<AdminCourse[]>('/admin/courses');
  },

  adminCreateCourse(dto: CreateCourseDto): Promise<AdminCourse> {
    return request<AdminCourse>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  adminUpdateCourse(slug: string, dto: UpdateCourseDto): Promise<AdminCourse> {
    return request<AdminCourse>(`/admin/courses/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  adminDeleteCourse(slug: string): Promise<void> {
    return request<void>(`/admin/courses/${slug}`, { method: 'DELETE' });
  },

  adminCreateLesson(courseSlug: string, dto: CreateLessonDto): Promise<AdminLesson> {
    return request<AdminLesson>(`/admin/courses/${courseSlug}/lessons`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  adminUpdateLesson(
    courseSlug: string,
    lessonSlug: string,
    dto: UpdateLessonDto,
  ): Promise<AdminLesson> {
    return request<AdminLesson>(`/admin/courses/${courseSlug}/lessons/${lessonSlug}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  adminDeleteLesson(courseSlug: string, lessonSlug: string): Promise<void> {
    return request<void>(`/admin/courses/${courseSlug}/lessons/${lessonSlug}`, {
      method: 'DELETE',
    });
  },

  adminListChallenges(): Promise<AdminChallenge[]> {
    return request<AdminChallenge[]>('/admin/challenges');
  },

  adminCreateChallenge(dto: CreateChallengeDto): Promise<AdminChallenge> {
    return request<AdminChallenge>('/admin/challenges', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  adminUpdateChallenge(slug: string, dto: UpdateChallengeDto): Promise<AdminChallenge> {
    return request<AdminChallenge>(`/admin/challenges/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  adminDeleteChallenge(slug: string): Promise<void> {
    return request<void>(`/admin/challenges/${slug}`, { method: 'DELETE' });
  },

  adminListUsers(): Promise<AdminUser[]> {
    return request<AdminUser[]>('/admin/users');
  },

  adminUpdateUserRole(userId: string, role: UserRole): Promise<AdminUser> {
    return request<AdminUser>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  getSettings(): Promise<SiteSettings> {
    return request<SiteSettings>('/settings');
  },

  adminGetSettings(): Promise<SiteSettings> {
    return request<SiteSettings>('/admin/settings');
  },

  adminUpdateSettings(dto: UpdateSiteSettingsDto): Promise<SiteSettings> {
    return request<SiteSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },
};

export const api = isDemoMode() ? demoApi : liveApi;
