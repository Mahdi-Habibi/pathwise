'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError, type AdminCourse, type AdminLesson } from '@/lib/api';

export default function AdminEditCoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t, format } = useLanguage();

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const [lessonSlug, setLessonSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);

  const loadCourse = useCallback(async () => {
    const courses = await api.adminListCourses();
    const found = courses.find((c) => c.slug === slug);
    if (!found) throw new ApiError(t('admin.courses.notFound'), 404);
    setCourse(found);
    setTitle(found.title);
    setDescription(found.description);
    setIcon(found.icon);
    setTrackKey(found.trackKey ?? '');
    setPublished(found.published);
  }, [slug, t]);

  useEffect(() => {
    loadCourse()
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t('admin.courses.loadCourseError'));
      })
      .finally(() => setLoading(false));
  }, [loadCourse, t]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved('');
    try {
      const updated = await api.adminUpdateCourse(slug, {
        title,
        description,
        icon,
        trackKey: trackKey || undefined,
        published,
      });
      setCourse(updated);
      setSaved(t('admin.courses.saved'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.courses.saveError'));
    }
  };

  const handleAddLesson = async (e: FormEvent) => {
    e.preventDefault();
    setLessonSubmitting(true);
    setError('');
    try {
      await api.adminCreateLesson(slug, {
        slug: lessonSlug,
        title: lessonTitle,
        content: lessonContent,
        durationMin: lessonDuration,
      });
      setLessonSlug('');
      setLessonTitle('');
      setLessonContent('');
      setLessonDuration(10);
      await loadCourse();
      setSaved(t('admin.courses.lessonAdded'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.courses.addLessonError'));
    } finally {
      setLessonSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-content auth-loading">
        <Loader2 size={24} className="spin" /> {t('admin.courses.loadingCourse')}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="admin-content">
        <p className="form-error">{error || t('admin.courses.notFound')}</p>
      </div>
    );
  }

  const lessons: AdminLesson[] = course.lessons ?? [];

  return (
    <div className="admin-content">
      <Link href="/admin/courses" className="admin-back">
        {t('admin.courses.back')}
      </Link>
      <h1>{t('admin.courses.editTitle', { title: course.title })}</h1>
      <p className="admin-sub">
        {t('admin.courses.slugLabel')} <code>{slug}</code>
      </p>

      <form className="admin-form" onSubmit={handleSave}>
        <label className="form-field">
          <span>{t('admin.courses.field.title')}</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="form-field">
          <span>{t('admin.courses.field.description')}</span>
          <textarea
            className="admin-textarea"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="admin-form-row">
          <label className="form-field">
            <span>{t('admin.courses.field.iconShort')}</span>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </label>
          <label className="form-field">
            <span>{t('admin.courses.field.trackKey')}</span>
            <input value={trackKey} onChange={(e) => setTrackKey(e.target.value)} />
          </label>
        </div>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          {t('common.published')}
        </label>
        {error && <p className="form-error">{error}</p>}
        {saved && <p className="form-success">{saved}</p>}
        <button type="submit" className="cta-primary">
          {t('admin.courses.save')}
        </button>
      </form>

      <section className="admin-section">
        <h2>{t('admin.courses.lessonsHeading', { count: lessons.length })}</h2>
        {lessons.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.courses.col.title')}</th>
                  <th>{t('admin.courses.col.slug')}</th>
                  <th>{t('admin.courses.colDuration')}</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>{lesson.title}</td>
                    <td>
                      <code>{lesson.slug}</code>
                    </td>
                    <td>{format.durationMinutes(lesson.durationMin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3>{t('admin.courses.addLesson')}</h3>
        <form className="admin-form" onSubmit={handleAddLesson}>
          <div className="admin-form-row">
            <label className="form-field">
              <span>{t('admin.courses.lessonSlug')}</span>
              <input
                required
                value={lessonSlug}
                onChange={(e) => setLessonSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
            </label>
            <label className="form-field">
              <span>{t('admin.courses.field.title')}</span>
              <input
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>{t('admin.courses.duration')}</span>
              <input
                type="number"
                min={1}
                value={lessonDuration}
                onChange={(e) => setLessonDuration(Number(e.target.value))}
              />
            </label>
          </div>
          <label className="form-field">
            <span>{t('admin.courses.contentMarkdown')}</span>
            <textarea
              className="admin-textarea"
              required
              rows={8}
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-next" disabled={lessonSubmitting}>
            {lessonSubmitting ? t('admin.courses.adding') : t('admin.courses.addLesson')}
          </button>
        </form>
      </section>
    </div>
  );
}
