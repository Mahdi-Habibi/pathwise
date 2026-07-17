import { STATIC_COURSE_LESSONS } from '@/lib/staticPaths';

export function generateStaticParams() {
  return STATIC_COURSE_LESSONS.map(({ courseSlug, lessonSlug }) => ({
    courseSlug,
    lessonSlug,
  }));
}

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
