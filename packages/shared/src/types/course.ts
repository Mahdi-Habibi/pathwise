export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  durationMin: number;
  completed: boolean;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  trackKey: string | null;
  lessonCount: number;
  enrolled: boolean;
  progressPct: number;
}

export interface LessonDetail extends LessonSummary {
  content: string;
  courseSlug: string;
  courseTitle: string;
  prevSlug: string | null;
  nextSlug: string | null;
}
