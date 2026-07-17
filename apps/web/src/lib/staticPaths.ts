/** Seed course/lesson slugs used for static export (GitHub Pages). */
export const STATIC_COURSE_LESSONS = [
  { courseSlug: 'javascript-core', lessonSlug: 'variables-and-types' },
  { courseSlug: 'javascript-core', lessonSlug: 'functions-and-scope' },
  { courseSlug: 'javascript-core', lessonSlug: 'async-await' },
  { courseSlug: 'interview-branding', lessonSlug: 'portfolio-story' },
  { courseSlug: 'interview-branding', lessonSlug: 'interview-framework' },
] as const;

export const STATIC_COURSE_SLUGS = ['javascript-core', 'interview-branding'] as const;
