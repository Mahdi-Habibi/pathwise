'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpen, Shield, Trophy, Users } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  const nav = [
    { href: '/admin', label: t('admin.nav.stats'), icon: BarChart3, exact: true },
    { href: '/admin/courses', label: t('admin.nav.courses'), icon: BookOpen },
    { href: '/admin/challenges', label: t('admin.nav.challenges'), icon: Trophy },
    { href: '/admin/users', label: t('admin.nav.users'), icon: Users },
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/login?next=/admin');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="page-content auth-loading">{t('admin.checking')}</div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Shield size={18} />
          <span>{t('admin.sidebar')}</span>
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
