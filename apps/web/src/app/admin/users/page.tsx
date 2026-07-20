'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserRole } from '@pathwise/shared';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError, type AdminUser } from '@/lib/api';

function roleLabel(role: UserRole, t: (key: string) => string): string {
  if (role === 'SUPER_ADMIN') return t('domain.roles.superAdmin');
  if (role === 'ADMIN') return t('domain.roles.admin');
  return t('domain.roles.learner');
}

export default function AdminUsersPage() {
  const { t, format } = useLanguage();
  const { user: me } = useAuth();
  const isSuper = me?.role === 'SUPER_ADMIN';
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

  const changeRole = async (user: AdminUser, nextRole: UserRole) => {
    if (user.role === nextRole) return;
    if (nextRole === 'SUPER_ADMIN' && !isSuper) {
      setError(t('admin.users.onlySuper'));
      return;
    }
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
                  <span
                    className={`admin-badge${
                      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? ' ok' : ''
                    }`}
                  >
                    {roleLabel(user.role, t)}
                  </span>
                </td>
                <td>{format.date(user.createdAt)}</td>
                <td>
                  <label className="admin-role-picker">
                    <span className="sr-only">{t('admin.users.changeRole')}</span>
                    <select
                      value={user.role}
                      disabled={updatingId === user.id || (!isSuper && user.role === 'SUPER_ADMIN')}
                      onChange={(e) => changeRole(user, e.target.value as UserRole)}
                    >
                      <option value="LEARNER">{t('domain.roles.learner')}</option>
                      <option value="ADMIN">{t('domain.roles.admin')}</option>
                      {isSuper && (
                        <option value="SUPER_ADMIN">{t('domain.roles.superAdmin')}</option>
                      )}
                    </select>
                  </label>
                  {updatingId === user.id && (
                    <span className="admin-inline-status">{t('admin.users.updating')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
