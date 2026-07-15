'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError, type AdminStats } from '@/lib/api';

export default function AdminStatsPage() {
  const { t, format } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .adminStats()
      .then(setStats)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t('admin.stats.error'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <div className="admin-content auth-loading">
        <Loader2 size={24} className="spin" /> {t('admin.stats.loading')}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-content">
        <p className="form-error">{error || t('admin.stats.none')}</p>
      </div>
    );
  }

  const revenue = stats.revenueCents / 100;

  return (
    <div className="admin-content">
      <h1>{t('admin.stats.title')}</h1>
      <p className="admin-sub">{t('admin.stats.sub')}</p>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.users')}</span>
          <b>{format.number(stats.users)}</b>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.courses')}</span>
          <b>{format.number(stats.courses)}</b>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.lessons')}</span>
          <b>{format.number(stats.lessons)}</b>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.enrollments')}</span>
          <b>{format.number(stats.enrollments)}</b>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.payments')}</span>
          <b>{format.number(stats.payments)}</b>
        </div>
        <div className="admin-stat-card highlight">
          <span className="admin-stat-label">{t('admin.stats.revenue')}</span>
          <b>{format.currency(revenue)}</b>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.challenges')}</span>
          <b>{format.number(stats.challenges)}</b>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{t('admin.stats.activeChallenges')}</span>
          <b>{format.number(stats.activeChallenges)}</b>
        </div>
      </div>
    </div>
  );
}
