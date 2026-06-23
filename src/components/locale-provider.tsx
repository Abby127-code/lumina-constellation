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
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
  dir: 'ltr',
});

export function LocaleProvider({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: Locale }) {
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
      const t = setTimeout(() => {
        setLocaleState(saved);
        document.documentElement.lang = saved;
        document.documentElement.dir = getDir(saved);
      }, 0);
      return () => clearTimeout(t);
    }

    // Auto-detect: Chinese browser → zh, others → en (already default)
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.toLowerCase().split('-')[0];
    if (langCode === 'zh') {
      const t = setTimeout(() => {
        setLocaleState('zh');
        document.documentElement.lang = 'zh';
        document.documentElement.dir = 'ltr';
      }, 0);
      return () => clearTimeout(t);
    }
    // Spanish
    if (langCode === 'es') {
      const t = setTimeout(() => { setLocaleState('es'); document.documentElement.lang = 'es'; }, 0);
      return () => clearTimeout(t);
    }
    // Portuguese
    if (langCode === 'pt') {
      const t = setTimeout(() => { setLocaleState('pt'); document.documentElement.lang = 'pt'; }, 0);
      return () => clearTimeout(t);
    }
    // Japanese
    if (langCode === 'ja') {
      const t = setTimeout(() => { setLocaleState('ja'); document.documentElement.lang = 'ja'; }, 0);
      return () => clearTimeout(t);
    }
    // Hindi
    if (langCode === 'hi') {
      const t = setTimeout(() => { setLocaleState('hi'); document.documentElement.lang = 'hi'; }, 0);
      return () => clearTimeout(t);
    }
    // Arabic
    if (langCode === 'ar') {
      const t = setTimeout(() => { setLocaleState('ar'); document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl'; }, 0);
      return () => clearTimeout(t);
    }
    // Default: English
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
