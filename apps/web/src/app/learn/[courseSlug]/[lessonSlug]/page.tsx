'use client';

import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { LessonDetail } from '@pathwise/shared';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError } from '@/lib/api';
import { markdownToHtml } from '@/lib/markdown';

export default function LessonPlayerPage() {
  const params = useParams<{ courseSlug: string; lessonSlug: string }>();
  const courseSlug = params.courseSlug;
  const lessonSlug = params.lessonSlug;
  const nextPath =
    courseSlug && lessonSlug ? `/learn/${courseSlug}/${lessonSlug}` : '/courses';

  return (
    <RequireAuth nextPath={nextPath}>
      <LessonPlayerContent courseSlug={courseSlug} lessonSlug={lessonSlug} />
    </RequireAuth>
  );
}

function LessonPlayerContent({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const router = useRouter();
  const { t, format } = useLanguage();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!courseSlug || !lessonSlug) return;
    setLoading(true);
    api
      .getLesson(courseSlug, lessonSlug)
      .then(setLesson)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t('lesson.loadError'));
      })
      .finally(() => setLoading(false));
  }, [courseSlug, lessonSlug, t]);

  const markComplete = async () => {
    if (!courseSlug || !lessonSlug) return;
    setCompleting(true);
    try {
      await api.completeLesson(courseSlug, lessonSlug);
      setLesson((prev) => (prev ? { ...prev, completed: true } : prev));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('lesson.completeError'));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content auth-loading">
        <Loader2 size={24} className="spin" /> {t('lesson.loading')}
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="page-content">
        <div className="app lesson-shell">
          <p className="form-error">{error || t('lesson.notFound')}</p>
          <Link href="/courses" className="back-link">
            {t('lesson.backToCourses')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="app lesson-shell">
        <Link href="/courses" className="back-link">
          <ArrowLeft size={16} className="nav-arrow" aria-hidden /> {lesson.courseTitle}
        </Link>
        <div className="lesson-header">
          <h1>{lesson.title}</h1>
          <span className="module-tag">{format.durationMinutes(lesson.durationMin)}</span>
          {lesson.completed && (
            <span className="lesson-done">
              <CheckCircle size={16} /> {t('lesson.completed')}
            </span>
          )}
        </div>

        <div
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content) }}
        />

        <div className="lesson-footer">
          {lesson.prevSlug ? (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.push(`/learn/${courseSlug}/${lesson.prevSlug}`)}
            >
              <ArrowLeft size={16} className="nav-arrow" aria-hidden /> {t('lesson.previous')}
            </button>
          ) : (
            <span />
          )}
          <div className="lesson-footer-center">
            {!lesson.completed && (
              <button
                type="button"
                className="btn-next"
                onClick={markComplete}
                disabled={completing}
              >
                {completing ? t('lesson.saving') : t('lesson.markComplete')}
              </button>
            )}
          </div>
          {lesson.nextSlug ? (
            <button
              type="button"
              className="btn-next"
              onClick={() => router.push(`/learn/${courseSlug}/${lesson.nextSlug}`)}
            >
              {t('lesson.next')} <ArrowRight size={16} className="nav-arrow" aria-hidden />
            </button>
          ) : (
            <Link href="/courses" className="btn-ghost">
              {t('lesson.allLessons')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
