'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  containsUnsafeText,
  isValidEmail,
  normalizeIranianPhone,
  sanitizeProfileText,
} from '@pathwise/shared';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { api, ApiError } from '@/lib/api';

type Step = 'phone' | 'otp' | 'profile' | 'start';

export default function EducationPage() {
  return (
    <div className="page-content">
      <EducationFlow />
    </div>
  );
}

function EducationFlow() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, learnerState, refreshSession, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user?.profileComplete || learnerState?.profileComplete) {
      setStep('start');
      if (user?.phone) setPhone(user.phone);
      return;
    }
    if (user && !user.profileComplete) {
      setStep('profile');
      if (user.phone) setPhone(user.phone);
    }
  }, [authLoading, user, learnerState]);

  const clearErrors = () => {
    setErrors({});
    setFormError('');
  };

  const onRequestOtp = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();
    const normalized = normalizeIranianPhone(phone);
    if (!normalized) {
      setErrors({ phone: t('education.phone.invalid') });
      return;
    }
    setBusy(true);
    try {
      const res = await api.requestOtp({ phone: normalized });
      setPhone(res.phone);
      setDevCode(res.devCode);
      setStep('otp');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('common.errorFallback'));
    } finally {
      setBusy(false);
    }
  };

  const onVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();
    if (!/^\d{6}$/.test(code.trim())) {
      setErrors({ code: t('education.otp.invalid') });
      return;
    }
    setBusy(true);
    try {
      const res = await api.verifyOtp({ phone, code: code.trim() });
      await refreshSession();
      if (res.user.profileComplete) {
        setStep('start');
      } else {
        setStep('profile');
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('common.errorFallback'));
    } finally {
      setBusy(false);
    }
  };

  const onCompleteProfile = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();
    const nextErrors: Record<string, string> = {};
    const cleanFirst = sanitizeProfileText(firstName);
    const cleanLast = sanitizeProfileText(lastName);
    const cleanCity = sanitizeProfileText(city);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirst) nextErrors.firstName = t('education.profile.required');
    else if (containsUnsafeText(cleanFirst)) nextErrors.firstName = t('education.profile.unsafe');

    if (!cleanLast) nextErrors.lastName = t('education.profile.required');
    else if (containsUnsafeText(cleanLast)) nextErrors.lastName = t('education.profile.unsafe');

    if (!cleanCity) nextErrors.city = t('education.profile.required');
    else if (containsUnsafeText(cleanCity)) nextErrors.city = t('education.profile.unsafe');

    if (!cleanEmail) nextErrors.email = t('education.profile.required');
    else if (!isValidEmail(cleanEmail) || containsUnsafeText(cleanEmail)) {
      nextErrors.email = t('education.profile.emailInvalid');
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    try {
      await api.completeProfile({
        firstName: cleanFirst,
        lastName: cleanLast,
        city: cleanCity,
        email: cleanEmail,
      });
      await refreshSession();
      setStep('start');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('common.errorFallback'));
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <div className="app auth-card">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (step === 'start') {
    return (
      <RequireAuth nextPath="/education">
        <div className="app auth-card education-card">
          <h1>{t('education.start.title')}</h1>
          <p className="auth-sub">{t('education.start.body')}</p>
          <button
            type="button"
            className="cta-primary"
            onClick={() => router.push('/assessment')}
          >
            {t('education.start.cta')}
          </button>
          <Link href="/" className="back-link">
            {t('common.back')}
          </Link>
        </div>
      </RequireAuth>
    );
  }

  if (step === 'profile') {
    return (
      <RequireAuth nextPath="/education">
        <div className="app auth-card education-card">
          <h1>{t('education.profile.title')}</h1>
          <p className="auth-sub">{t('education.profile.sub')}</p>
          <form className="auth-form" onSubmit={onCompleteProfile} noValidate>
            <label>
              {t('education.profile.phone')}
              <input type="tel" value={phone || user?.phone || ''} disabled />
            </label>
            <label>
              {t('education.profile.firstName')}
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </label>
            <label>
              {t('education.profile.lastName')}
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </label>
            <label>
              {t('education.profile.city')}
              <input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </label>
            <label>
              {t('education.profile.email')}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </label>
            {formError && <p className="form-error">{formError}</p>}
            <button type="submit" className="cta-primary" disabled={busy}>
              {busy ? t('education.profile.submitting') : t('education.profile.submit')}
            </button>
          </form>
        </div>
      </RequireAuth>
    );
  }

  if (step === 'otp') {
    return (
      <div className="app auth-card education-card">
        <h1>{t('education.otp.title')}</h1>
        <p className="auth-sub">{t('education.otp.sub', { phone })}</p>
        {devCode && (
          <p className="form-hint">{t('education.otp.devHint', { code: devCode })}</p>
        )}
        <form className="auth-form" onSubmit={onVerifyOtp} noValidate>
          <label>
            {t('education.otp.label')}
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('education.otp.placeholder')}
            />
            {errors.code && <span className="form-error">{errors.code}</span>}
          </label>
          {formError && <p className="form-error">{formError}</p>}
          <button type="submit" className="cta-primary" disabled={busy}>
            {busy ? t('education.otp.submitting') : t('education.otp.submit')}
          </button>
        </form>
        <div className="auth-footer-row">
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setStep('phone');
              setCode('');
              setDevCode(undefined);
            }}
          >
            {t('education.otp.changePhone')}
          </button>
          <button
            type="button"
            className="text-btn"
            disabled={busy}
            onClick={async () => {
              clearErrors();
              setBusy(true);
              try {
                const res = await api.requestOtp({ phone });
                setDevCode(res.devCode);
              } catch (err) {
                setFormError(err instanceof ApiError ? err.message : t('common.errorFallback'));
              } finally {
                setBusy(false);
              }
            }}
          >
            {t('education.otp.resend')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app auth-card education-card">
      <h1>{t('education.phone.title')}</h1>
      <p className="auth-sub">{t('education.phone.sub')}</p>
      <form className="auth-form" onSubmit={onRequestOtp} noValidate>
        <label>
          {t('education.phone.label')}
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('education.phone.placeholder')}
            autoComplete="tel"
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </label>
        {formError && <p className="form-error">{formError}</p>}
        <button type="submit" className="cta-primary" disabled={busy}>
          {busy ? t('education.phone.submitting') : t('education.phone.submit')}
        </button>
      </form>
      <Link href="/" className="back-link">
        {t('common.back')}
      </Link>
    </div>
  );
}
