'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { user } = useSession();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('lumina-theme') as 'dark' | 'light' | null;
    if (saved) {
      const t = setTimeout(() => setTheme(saved), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const toggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lumina-theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    // 同步到 DB
    if (user) {
      try {
        await fetch('/api/engage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update-theme', userId: user.userId, theme: newTheme }),
        });
      } catch {}
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="text-purple-200/80 hover:text-gold hover:bg-gold/10 p-2"
      title={theme === 'dark' ? '切换到浅色' : '切换到深色'}
    >
      {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
    </Button>
  );
}
