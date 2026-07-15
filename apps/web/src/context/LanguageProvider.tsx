'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { writeLocaleCookie } from '@/i18n/cookie';
import { createFormatters, type Formatters } from '@/i18n/formatters';
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  dirForLocale,
  LOCALE_COOKIE,
  parseLocale,
  type Locale,
} from '@/i18n/locales';
import { en, messages } from '@/i18n/messages';
import { createTranslator, type MessageKey, type MessageParams } from '@/i18n/translate';

interface LanguageContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
  format: Formatters;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

function hasLocaleCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${LOCALE_COOKIE}=`));
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LanguageProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(parseLocale(initialLocale));

  useEffect(() => {
    if (!hasLocaleCookie()) {
      const detected = detectBrowserLocale();
      if (detected !== locale) {
        setLocaleState(detected);
        writeLocaleCookie(detected);
        return;
      }
      writeLocaleCookie(locale);
    }

    const html = document.documentElement;
    html.lang = locale;
    html.dir = dirForLocale(locale);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = dirForLocale(locale);
    writeLocaleCookie(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      const parsed = parseLocale(next);
      setLocaleState(parsed);
      writeLocaleCookie(parsed);
      const html = document.documentElement;
      html.lang = parsed;
      html.dir = dirForLocale(parsed);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LanguageContextValue>(() => {
    const catalog = messages[locale] ?? en;
    return {
      locale,
      dir: dirForLocale(locale),
      setLocale,
      t: createTranslator(catalog, en),
      format: createFormatters(locale),
    };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
