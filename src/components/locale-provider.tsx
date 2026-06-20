'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LOCALES, t as translate, type Locale, getDir } from '@/lib/i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'zh',
  setLocale: () => {},
  t: (k) => k,
  dir: 'ltr',
});

export function LocaleProvider({ children, initialLocale = 'zh' }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('lumina-locale', l);
    document.documentElement.lang = l;
    document.documentElement.dir = getDir(l);
    // 后端同步（已登录用户）
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateLocale', locale: l }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('lumina-locale') as Locale | null;
    if (saved && LOCALES.find((l) => l.code === saved)) {
      // defer to next tick to avoid synchronous setState in effect
      const t = setTimeout(() => {
        setLocaleState(saved);
        document.documentElement.lang = saved;
        document.documentElement.dir = getDir(saved);
      }, 0);
      return () => clearTimeout(t);
    }
  }, []);

  const t = useCallback((key: string) => translate(key, locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir: getDir(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export { LOCALES };
export type { Locale };
