'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/session';
import { LocaleProvider, useLocale } from '@/components/locale-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Moon } from 'lucide-react';
import { HomePage } from '@/components/tracks/home';
import { MemorialTrack, CaregiverTrack, GenealogyTrack, MicrosaasTrack } from '@/components/tracks/new-tracks';
import { MysticTrack, StorybookTrack, DirectoryTrack, PromptsTrack } from '@/components/tracks/legacy-tracks';

type Track = 'home' | 'mystic' | 'storybook' | 'directory' | 'prompts' | 'memorial' | 'caregiver' | 'genealogy' | 'microsaas';

export default function Home() {
  return (
    <LocaleProvider>
      <App />
    </LocaleProvider>
  );
}

function App() {
  const { user, setUser } = useSession();
  const { t, locale } = useLocale();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track>('home');

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // 先尝试 cookie 登录
      try {
        const authRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'me' }),
        });
        const authData = await authRes.json();
        if (authData.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || authData.user.locale || 'zh';
          setUser({
            userId: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            plan: authData.user.plan,
            locale: savedLocale,
            isAuthed: true,
            subStatus: authData.user.subStatus,
            currentPeriodEnd: authData.user.currentPeriodEnd,
            birthDate: authData.user.birthDate,
            birthTime: authData.user.birthTime,
            birthPlace: authData.user.birthPlace,
            gender: authData.user.gender,
          });
          if (!cancelled) setBootstrapped(true);
          return;
        }
      } catch {}

      // 匿名用户：自动创建
      try {
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!cancelled && data.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || 'zh';
          setUser({
            userId: data.user.id,
            name: data.user.name || undefined,
            birthDate: data.user.birthDate || undefined,
            birthTime: data.user.birthTime || undefined,
            birthPlace: data.user.birthPlace || undefined,
            gender: data.user.gender || undefined,
            plan: data.user.plan || 'free',
            trialEndsAt: data.user.trialEndsAt || undefined,
            locale: savedLocale,
            isAuthed: false,
          });
        }
      } catch (e) {
        console.error('user init error:', e);
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [setUser]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <div className="text-center">
          <Moon className="w-12 h-12 text-gold mx-auto animate-float" />
          <p className="text-gold mt-4 text-sm tracking-widest">CONNECTING TO COSMOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        <Header activeTrack={activeTrack} onNavigate={setActiveTrack} />
        {activeTrack === 'home' && <HomePage onNavigate={setActiveTrack} />}
        {activeTrack === 'mystic' && <MysticTrack />}
        {activeTrack === 'storybook' && <StorybookTrack />}
        {activeTrack === 'directory' && <DirectoryTrack />}
        {activeTrack === 'prompts' && <PromptsTrack />}
        {activeTrack === 'memorial' && <MemorialTrack />}
        {activeTrack === 'caregiver' && <CaregiverTrack />}
        {activeTrack === 'genealogy' && <GenealogyTrack />}
        {activeTrack === 'microsaas' && <MicrosaasTrack />}
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}

function Header({ activeTrack, onNavigate }: { activeTrack: Track; onNavigate: (t: Track) => void }) {
  const { t: tr } = useLocale();
  const navItems: { id: Track; label: string }[] = [
    { id: 'home', label: tr('nav.home') },
    { id: 'mystic', label: tr('nav.mystic') },
    { id: 'storybook', label: tr('nav.storybook') },
    { id: 'directory', label: tr('nav.directory') },
    { id: 'prompts', label: tr('nav.prompts') },
    { id: 'memorial', label: tr('nav.memorial') },
    { id: 'caregiver', label: tr('nav.caregiver') },
    { id: 'genealogy', label: tr('nav.genealogy') },
    { id: 'microsaas', label: tr('nav.microsaas') },
  ];
  return (
    <header className="mb-6 sm:mb-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300"
              style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '0.02em' }}
            >
              Lumina Studio
            </h1>
            <p className="text-purple-200/60 text-xs tracking-wider">{tr('app.tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <AccountButton />
          <UpgradeButton />
        </div>
      </div>
      <nav className="flex flex-wrap gap-1.5 bg-white/5 border border-gold/20 p-1.5 rounded-xl overflow-x-auto">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
              activeTrack === n.id
                ? 'bg-gold/20 text-gold'
                : 'text-purple-200/70 hover:text-gold hover:bg-gold/10'
            }`}
          >
            {n.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-gold/20 text-center">
      <div className="flex items-center justify-center gap-2 text-purple-200/60 text-xs">
        <Sparkles className="w-3 h-3 text-gold" />
        <span>Lumina Studio · AI 原生蓝海产品矩阵 · 7 种语言 · PWA</span>
        <Sparkles className="w-3 h-3 text-gold" />
      </div>
      <p className="text-purple-300/40 text-xs mt-2 max-w-md mx-auto leading-relaxed">
        本产品提供的所有内容仅供娱乐与灵性探索参考，不构成医疗、心理、法律或投资建议。
      </p>
    </footer>
  );
}
