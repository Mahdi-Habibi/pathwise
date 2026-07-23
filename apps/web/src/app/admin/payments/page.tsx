'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AdminPayment } from '@pathwise/shared';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError } from '@/lib/api';

export default function AdminPaymentsPage() {
  const { t, format } = useLanguage();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .adminListPayments()
      .then(setPayments)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t('admin.payments.loadError'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <div className="admin-content auth-loading">
        <Loader2 size={24} className="spin" /> {t('admin.payments.loading')}
      </div>
    );
  }

  return (
    <div className="admin-content">
      <h1>{t('admin.payments.title')}</h1>
      <p className="admin-sub">{t('admin.payments.sub')}</p>
      {error && <p className="form-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.payments.col.date')}</th>
              <th>{t('admin.payments.col.user')}</th>
              <th>{t('admin.payments.col.product')}</th>
              <th>{t('admin.payments.col.amount')}</th>
              <th>{t('admin.payments.col.status')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5}>{t('admin.payments.empty')}</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>{format.date(p.createdAt)}</td>
                  <td>
                    <div>{p.userName}</div>
                    <div className="ltr-isolate" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                      {p.userEmail}
                    </div>
                  </td>
                  <td>
                    <code>{p.productType}</code>
                  </td>
                  <td>{format.currency(p.amountCents)}</td>
                  <td>
                    <span className={`admin-badge${p.status === 'COMPLETED' ? ' ok' : ''}`}>
                      {t(`domain.payments.${p.status.toLowerCase()}` as 'domain.payments.completed')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
