'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LOCALES, useLocale } from '@/components/locale-provider';
import { Globe, Check, ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="text-purple-200/80 hover:text-gold hover:bg-gold/10 text-xs gap-1.5 px-2.5"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden md:inline">{current.name}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 bg-zinc-900/95 backdrop-blur-md border border-gold/30 rounded-lg shadow-2xl py-1 min-w-[160px]">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gold/10 transition-colors ${
                l.code === locale ? 'text-gold' : 'text-purple-100/80'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1 text-left">{l.name}</span>
              {l.code === locale && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
