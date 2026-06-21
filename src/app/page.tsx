'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/session';
import { LocaleProvider } from '@/components/locale-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { InstallPrompt } from '@/components/install-prompt';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Sparkles, Moon, UserCircle, Cpu, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConstellationHome } from '@/components/constellation-home';

export default function Home() {
  return (
    <LocaleProvider>
      <App />
    </LocaleProvider>
  );
}

function App() {
  const { user, setUser } = useSession();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const authRes = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'me' }) });
        const authData = await authRes.json();
        if (authData.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || authData.user.locale || 'en';
          setUser({ userId: authData.user.id, email: authData.user.email, name: authData.user.name, plan: authData.user.plan, locale: savedLocale, isAuthed: true, subStatus: authData.user.subStatus, birthDate: authData.user.birthDate, birthTime: authData.user.birthTime, birthPlace: authData.user.birthPlace, gender: authData.user.gender });
          if (!cancelled) setBootstrapped(true);
          return;
        }
      } catch {}
      try {
        const res = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        const data = await res.json();
        if (!cancelled && data.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || 'en';
          setUser({ userId: data.user.id, name: data.user.name || undefined, birthDate: data.user.birthDate || undefined, birthTime: data.user.birthTime || undefined, birthPlace: data.user.birthPlace || undefined, gender: data.user.gender || undefined, plan: data.user.plan || 'free', trialEndsAt: data.user.trialEndsAt || undefined, locale: savedLocale, isAuthed: false });
        }
      } catch (e) { console.error('init error:', e); }
      finally { if (!cancelled) setBootstrapped(true); }
    };
    init();
    return () => { cancelled = true; };
  }, [setUser]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <div className="text-center"><Moon className="w-12 h-12 text-gold mx-auto animate-float" /><p className="text-gold mt-4 text-sm tracking-widest">CONNECTING TO COSMOS...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {/* Portal Header */}
        <header className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center relative">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 text-xs text-amber-300">✦</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Lumina Constellation</h1>
                <p className="text-purple-200/60 text-xs tracking-wider">✦ 7 Independent Products ✦</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitcher /><ThemeToggle />
              {user?.isAuthed && (
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/?track=account'} className="text-purple-200/80 hover:text-gold text-xs">
                  <UserCircle className="w-3.5 h-3.5" />
                </Button>
              )}
              <AccountButton /><UpgradeButton />
            </div>
          </div>
        </header>

        <ConstellationHome />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gold/20 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-200/60 text-xs flex-wrap">
            <span className="text-amber-300">✦</span>
            <span>Lumina Constellation · 7 Independent Products</span>
            <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-300">
              <Cpu className="w-2.5 h-2.5 mr-1" /> GLM · Free
            </Badge>
            <span className="text-amber-300">✦</span>
          </div>
          <p className="text-purple-300/40 text-xs mt-2">
            ✦ Spiritual · Storybook · Dream · Memorial · Family Atlas · Caregiver · Toolkit ✦
          </p>
          {/* Legal links */}
          <div className="flex items-center justify-center gap-3 mt-4 text-[10px] text-purple-300/40">
            <a href="/privacy" className="hover:text-amber-300">Privacy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-amber-300">Terms</a>
            <span>·</span>
            <a href="/disclaimer" className="hover:text-amber-300">Disclaimer</a>
            <span>·</span>
            <a href="/cookie-policy" className="hover:text-amber-300">Cookies</a>
            <span>·</span>
            <a href="/about" className="hover:text-amber-300">About</a>
            <span>·</span>
            <a href="/contact" className="hover:text-amber-300">Contact</a>
          </div>
        </footer>
      </div>
      <Toaster />
      <InstallPrompt />
    </div>
  );
}
