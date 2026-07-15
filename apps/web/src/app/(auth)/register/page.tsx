'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useT } from '@/context/LanguageProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ name, email, password });
      router.push('/dashboard');
    } catch {
      setError(t('auth.register.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="app auth-shell">
        <div className="auth-card">
          <span className="eyebrow">
            <UserPlus size={14} className="inline-leading-icon" />
            {t('auth.register.eyebrow')}
          </span>
          <h1>{t('auth.register.title')}</h1>
          <p className="auth-sub">{t('auth.register.sub')}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>{t('auth.register.fullName')}</span>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.register.namePlaceholder')}
              />
            </label>
            <label className="form-field">
              <span>{t('auth.register.email')}</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.register.emailPlaceholder')}
                dir="ltr"
                className="ltr-isolate"
              />
            </label>
            <label className="form-field">
              <span>{t('auth.register.password')}</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.register.passwordPlaceholder')}
              />
              <span className="form-hint">{t('auth.register.passwordHint')}</span>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="cta-primary auth-submit" disabled={submitting}>
              {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </button>
          </form>

          <p className="auth-footer">
            {t('auth.register.footer')} <Link href="/login">{t('auth.register.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
