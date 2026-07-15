'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError, type AdminUser } from '@/lib/api';
import type { UserRole } from '@pathwise/shared';

export default function AdminUsersPage() {
  const { t, format } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .adminListUsers()
      .then(setUsers)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t('admin.users.loadError'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const toggleRole = async (user: AdminUser) => {
    const nextRole: UserRole = user.role === 'ADMIN' ? 'LEARNER' : 'ADMIN';
    setUpdatingId(user.id);
    setError('');
    try {
      const updated = await api.adminUpdateUserRole(user.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('admin.users.roleError'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-content auth-loading">
        <Loader2 size={24} className="spin" /> {t('admin.users.loading')}
      </div>
    );
  }

  return (
    <div className="admin-content">
      <h1>{t('admin.users.title')}</h1>
      <p className="admin-sub">{t('admin.users.sub')}</p>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.users.col.name')}</th>
              <th>{t('admin.users.col.email')}</th>
              <th>{t('admin.users.col.role')}</th>
              <th>{t('admin.users.col.joined')}</th>
              <th>{t('admin.users.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-badge${user.role === 'ADMIN' ? ' ok' : ''}`}>
                    {user.role === 'ADMIN' ? t('domain.roles.admin') : t('domain.roles.learner')}
                  </span>
                </td>
                <td>{format.date(user.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="admin-link"
                    disabled={updatingId === user.id}
                    onClick={() => toggleRole(user)}
                  >
                    {updatingId === user.id
                      ? t('admin.users.updating')
                      : user.role === 'ADMIN'
                        ? t('admin.users.makeLearner')
                        : t('admin.users.makeAdmin')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
