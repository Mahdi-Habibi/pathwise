import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Vazirmatn } from 'next/font/google';
import { ClientProviders } from '@/components/layout/ClientProviders';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Footer } from '@/components/layout/Footer';
import { TopBar } from '@/components/layout/TopBar';
import { DEFAULT_LOCALE, dirForLocale } from '@/i18n/locales';
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

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: messages[DEFAULT_LOCALE].meta.title,
  description: messages[DEFAULT_LOCALE].meta.description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0e1a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = DEFAULT_LOCALE;
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
          <DemoBanner />
          <TopBar />
          <main className="site-main">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
