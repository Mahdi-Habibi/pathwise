'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronDown, LogOut, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { useApp } from '@/context/AppProvider';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function TopBar() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toggleTheme } = useTheme();
  const { hasRoadmap } = useApp();
  const { user, logout, loading } = useAuth();
  const { settings } = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    router.push(hasRoadmap ? '/dashboard' : '/education');
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <div className="topbar app">
      <button type="button" className="logo" onClick={handleLogoClick}>
        <span className="logo-mark" aria-hidden="true" />
        <span className="logo-text">{settings.general.siteName || t('common.brand')}</span>
      </button>

      <nav className="top-nav">
        <Link href="/material" className="top-nav-link">
          {t('landing.ctaMaterial')}
        </Link>
        <Link href="/education" className="top-nav-link">
          {t('landing.ctaEducation')}
        </Link>
        <Link href="/courses" className="top-nav-link">
          <BookOpen size={14} /> {t('nav.courses')}
        </Link>
        {user?.role === 'ADMIN' && (
          <Link href="/admin" className="top-nav-link">
            <Shield size={14} /> {t('nav.admin')}
          </Link>
        )}
        <Link href="/dashboard" className="top-nav-link">
          {t('nav.dashboard')}
        </Link>
      </nav>

      <div className="top-right">
        <LanguageSelector />

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={t('nav.toggleColorMode')}
        >
          <span aria-hidden="true">◐</span>
          <span className="theme-toggle-label">{t('nav.mode')}</span>
        </button>

        {loading || !user ? null : (
          <div className="user-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="user-chip"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              <span className="avatar" aria-hidden="true" />
              <span className="user-chip-name">{user.name.split(' ')[0]}</span>
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-head">
                  <b>{user.name}</b>
                  <span className="ltr-isolate">{user.email || user.phone}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/courses"
                  className="user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.myCourses')}
                </Link>
                <Link
                  href="/rewards"
                  className="user-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.rewards')}
                </Link>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin"
                    className="user-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Shield size={14} /> {t('nav.admin')}
                  </Link>
                )}
                <button type="button" className="user-dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={14} /> {t('nav.signOut')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
