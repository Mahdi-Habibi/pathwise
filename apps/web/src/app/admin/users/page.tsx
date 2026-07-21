'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserRole } from '@pathwise/shared';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError } from '@/lib/api';
import type { AdminUser } from '@pathwise/shared';

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
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'success' | 'error'>>({});

  useEffect(() => {
    api
      .adminListUsers()
      .then((list) => {
        setUsers(list);
        setDraftRoles(Object.fromEntries(list.map((u) => [u.id, u.role])));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t('admin.users.loadError'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const saveRole = async (user: AdminUser) => {
    const nextRole = draftRoles[user.id];
    if (!nextRole || nextRole === user.role) return;

    if (nextRole === 'SUPER_ADMIN' && !isSuper) {
      setError(t('admin.users.onlySuper'));
      setDraftRoles((prev) => ({ ...prev, [user.id]: user.role }));
      return;
    }

    setUpdatingId(user.id);
    setError('');
    setFeedback((prev) => {
      const next = { ...prev };
      delete next[user.id];
      return next;
    });

    try {
      const updated = await api.adminUpdateUserRole(user.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setDraftRoles((prev) => ({ ...prev, [user.id]: updated.role }));
      setFeedback((prev) => ({ ...prev, [user.id]: 'success' }));
    } catch (err) {
      setDraftRoles((prev) => ({ ...prev, [user.id]: user.role }));
      setFeedback((prev) => ({ ...prev, [user.id]: 'error' }));
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
            {users.map((user) => {
              const draft = draftRoles[user.id] ?? user.role;
              const dirty = draft !== user.role;
              const rowFeedback = feedback[user.id];

              return (
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
                    <div className="admin-role-save-row">
                      <label className="admin-role-picker">
                        <span className="sr-only">{t('admin.users.changeRole')}</span>
                        <select
                          value={draft}
                          disabled={
                            updatingId === user.id || (!isSuper && user.role === 'SUPER_ADMIN')
                          }
                          onChange={(e) =>
                            setDraftRoles((prev) => ({
                              ...prev,
                              [user.id]: e.target.value as UserRole,
                            }))
                          }
                        >
                          <option value="LEARNER">{t('domain.roles.learner')}</option>
                          <option value="ADMIN">{t('domain.roles.admin')}</option>
                          {isSuper && (
                            <option value="SUPER_ADMIN">{t('domain.roles.superAdmin')}</option>
                          )}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="btn-next admin-btn"
                        disabled={!dirty || updatingId === user.id}
                        onClick={() => void saveRole(user)}
                      >
                        {updatingId === user.id ? (
                          <>
                            <Loader2 size={14} className="spin" /> {t('admin.users.updating')}
                          </>
                        ) : (
                          t('admin.users.saveRole')
                        )}
                      </button>
                      {rowFeedback === 'success' && (
                        <span className="form-success admin-inline-status">
                          <Check size={14} /> {t('admin.users.roleUpdated')}
                        </span>
                      )}
                      {rowFeedback === 'error' && (
                        <span className="form-error admin-inline-status">
                          <X size={14} /> {t('admin.users.roleError')}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
