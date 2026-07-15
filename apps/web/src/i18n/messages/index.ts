import type { Locale } from '../locales';
import { en } from './en';
import { de } from './de';
import { es } from './es';
import { fa } from './fa';

/** Recursive string tree shaped like the English catalog. */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type Messages = DeepStringify<typeof en>;

export { en } from './en';
export { de } from './de';
export { es } from './es';
export { fa } from './fa';

export const messages: Record<Locale, Messages> = {
  en: en as Messages,
  de: de as Messages,
  es: es as Messages,
  fa: fa as Messages,
};
