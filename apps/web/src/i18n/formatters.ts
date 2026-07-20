import type { Locale } from './locales';

export interface Formatters {
  number: (value: number) => string;
  currency: (value: number) => string;
  percent: (value: number) => string;
  date: (value: Date | string | number) => string;
  durationMinutes: (minutes: number) => string;
  durationHours: (hours: number) => string;
  points: (value: number) => string;
}

export function createFormatters(locale: Locale): Formatters {
  const numberFmt = new Intl.NumberFormat(locale);
  const useIrr = locale === 'fa';
  const currencyFmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: useIrr ? 'IRR' : 'USD',
    maximumFractionDigits: 0,
  });
  const percentFmt = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    number: (value) => numberFmt.format(value),
    currency: (value) => {
      if (useIrr) {
        // Show Toman-friendly label: amounts are stored in Rials.
        return `${numberFmt.format(value)} ریال`;
      }
      return currencyFmt.format(value);
    },
    percent: (value) => percentFmt.format(value / 100),
    date: (value) => dateFmt.format(new Date(value)),
    durationMinutes: (minutes) =>
      useIrr ? `${numberFmt.format(minutes)} دقیقه` : `${numberFmt.format(minutes)} min`,
    durationHours: (hours) =>
      useIrr ? `${numberFmt.format(hours)} ساعت` : `${numberFmt.format(hours)}h`,
    points: (value) =>
      useIrr ? `${numberFmt.format(value)} امتیاز` : `${numberFmt.format(value)} pts`,
  };
}
