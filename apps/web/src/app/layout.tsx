import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Inter, JetBrains_Mono, Vazirmatn } from 'next/font/google';
import { ClientProviders } from '@/components/layout/ClientProviders';
import { Footer } from '@/components/layout/Footer';
import { TopBar } from '@/components/layout/TopBar';
import { LOCALE_COOKIE, dirForLocale, parseLocale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const locale = parseLocale(jar.get(LOCALE_COOKIE)?.value);
  const m = messages[locale];
  return {
    title: m.meta.title,
    description: m.meta.description,
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0e1a' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const locale = parseLocale(jar.get(LOCALE_COOKIE)?.value);
  const dir = dirForLocale(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${jetbrainsMono.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ClientProviders initialLocale={locale}>
          <TopBar />
          <main className="site-main">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
