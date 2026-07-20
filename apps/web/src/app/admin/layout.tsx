'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpen, Settings, Shield, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SiteAdminAccessSettings } from '@pathwise/shared';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { api } from '@/lib/api';

type AdminSection = keyof SiteAdminAccessSettings;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const [access, setAccess] = useState<SiteAdminAccessSettings | null>(null);

  const isSuper = user?.role === 'SUPER_ADMIN';
  const isStaff = user?.role === 'ADMIN' || isSuper;

  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      router.replace('/login?next=/admin');
    }
  }, [user, loading, router, isStaff]);

  useEffect(() => {
    if (!isStaff) return;
    api
      .getSettings()
      .then((settings) => setAccess(settings.adminAccess))
      .catch(() =>
        setAccess({
          stats: true,
          settings: isSuper,
          courses: true,
          challenges: true,
          users: isSuper,
        }),
      );
  }, [isStaff, isSuper]);

  const nav = useMemo(() => {
    const items: Array<{
      href: string;
      label: string;
      icon: typeof BarChart3;
      exact?: boolean;
      key: AdminSection | 'all';
    }> = [
      { href: '/admin', label: t('admin.nav.stats'), icon: BarChart3, exact: true, key: 'stats' },
      { href: '/admin/settings', label: t('admin.nav.settings'), icon: Settings, key: 'settings' },
      { href: '/admin/courses', label: t('admin.nav.courses'), icon: BookOpen, key: 'courses' },
      {
        href: '/admin/challenges',
        label: t('admin.nav.challenges'),
        icon: Trophy,
        key: 'challenges',
      },
      { href: '/admin/users', label: t('admin.nav.users'), icon: Users, key: 'users' },
    ];

    return items.filter((item) => {
      if (isSuper) return true;
      if (!access) return item.key === 'stats' || item.key === 'courses' || item.key === 'challenges';
      return access[item.key as AdminSection];
    });
  }, [t, isSuper, access]);

  useEffect(() => {
    if (!access || isSuper || loading || !user) return;
    const path = pathname || '/admin';
    const allowed = nav.some((item) =>
      item.exact ? path === item.href : path === item.href || path.startsWith(`${item.href}/`),
    );
    if (!allowed && path.startsWith('/admin')) {
      router.replace(nav[0]?.href ?? '/');
    }
  }, [access, isSuper, loading, user, pathname, nav, router]);

  if (loading || !user || !isStaff) {
    return <div className="page-content auth-loading">{t('admin.checking')}</div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Shield size={18} />
          <span>
            {t('admin.sidebar')}
            {isSuper ? ` · ${t('domain.roles.superAdmin')}` : ''}
          </span>
        </div>
        <nav className="admin-nav">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`admin-nav-link${active ? ' active' : ''}`}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
