'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { InstallPrompt } from '@/components/install-prompt';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Cpu, Sparkles } from 'lucide-react';
import { useSession } from '@/lib/session';
import type { ProductId } from '@/lib/product-types';
import { MysticApp } from '@/components/apps/mystic-app';
import { StorybookApp } from '@/components/apps/storybook-app';
import { DreamApp } from '@/components/apps/dream-app';
import { MemorialApp } from '@/components/apps/memorial-app';
import { GenealogyApp } from '@/components/apps/genealogy-app';
import { CaregiverApp } from '@/components/apps/caregiver-app';
import { DirectoryApp } from '@/components/apps/directory-app';
import { LocaleProvider } from '@/components/locale-provider';

// Product metadata (duplicated from constellation-home for independence)
const PRODUCT_META: Record<ProductId, {
  name: string; tagline: string; icon: string; theme: string;
}> = {
  mystic: { name: 'Lumina Spiritual', tagline: 'Astrology · Tarot · Numerology · Daily Energy', icon: '✦', theme: 'theme-mystic' },
  storybook: { name: 'Storybook Studio', tagline: 'Personalized children\'s stories', icon: '★', theme: 'theme-storybook' },
  dream: { name: 'Dream Journal', tagline: 'Record · Interpret · Track', icon: '🌙', theme: 'theme-dream' },
  memorial: { name: 'Memorial', tagline: 'Tribute biographies · Healing letters', icon: '✧', theme: 'theme-memorial' },
  genealogy: { name: 'Family Atlas', tagline: 'Family stories · Heritage', icon: '✦', theme: 'theme-genealogy' },
  caregiver: { name: 'AI Caregiver Support', tagline: '24/7 assistant for caregivers', icon: '★', theme: 'theme-caregiver' },
  directory: { name: 'AI Toolkit', tagline: 'AI Tools Directory + Prompt Library', icon: '✧', theme: 'theme-directory' },
};

interface Props { productId: ProductId; }

export function StandaloneProduct({ productId }: Props) {
  const { user, setUser } = useSession();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [aiProvider, setAiProvider] = useState('');
  const [aiFree, setAiFree] = useState(true);
  const meta = PRODUCT_META[productId];

  // Bootstrap user (same as main page)
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const authRes = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'me' }) });
        const authData = await authRes.json();
        if (authData.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || authData.user.locale || 'en';
          setUser({
            userId: authData.user.id, email: authData.user.email, name: authData.user.name,
            plan: authData.user.plan, locale: savedLocale, isAuthed: true,
            subStatus: authData.user.subStatus, currentPeriodEnd: authData.user.currentPeriodEnd,
            birthDate: authData.user.birthDate, birthTime: authData.user.birthTime,
            birthPlace: authData.user.birthPlace, gender: authData.user.gender,
          });
          if (!cancelled) setBootstrapped(true);
          return;
        }
      } catch {}
      try {
        const res = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        const data = await res.json();
        if (!cancelled && data.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || 'en';
          setUser({
            userId: data.user.id, name: data.user.name || undefined,
            birthDate: data.user.birthDate || undefined, birthTime: data.user.birthTime || undefined,
            birthPlace: data.user.birthPlace || undefined, gender: data.user.gender || undefined,
            plan: data.user.plan || 'free', trialEndsAt: data.user.trialEndsAt || undefined,
            locale: savedLocale, isAuthed: false,
          });
        }
      } catch (e) { console.error('init error:', e); }
      finally { if (!cancelled) setBootstrapped(true); }
    };
    init();
    return () => { cancelled = true; };
  }, [setUser]);

  // Load AI info
  useEffect(() => {
    fetch('/api/ai-info').then(r => r.json()).then(d => {
      setAiProvider(d.provider === 'deepseek' ? 'DeepSeek' : d.provider === 'openai' ? 'OpenAI' : 'GLM');
      setAiFree(d.isFree !== false);
    }).catch(() => {});
  }, []);

  const renderApp = () => {
    switch (productId) {
      case 'mystic': return <MysticApp />;
      case 'storybook': return <StorybookApp />;
      case 'dream': return <DreamApp />;
      case 'memorial': return <MemorialApp />;
      case 'genealogy': return <GenealogyApp />;
      case 'caregiver': return <CaregiverApp />;
      case 'directory': return <DirectoryApp />;
      default: return null;
    }
  };

  if (!bootstrapped) {
    return (
      <div className={`product-app-root ${meta.theme} flex items-center justify-center`}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-float" />
          <p className="text-amber-200 mt-4 text-sm tracking-widest">LOADING {meta.name.toUpperCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <LocaleProvider>
      <div className={`product-app-root ${meta.theme} relative overflow-hidden flex flex-col min-h-screen`}>
        {/* Independent Product Header */}
        <header className="relative z-10 border-b border-[var(--p-border)] bg-black/20 backdrop-blur-md sticky top-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-1 product-app-muted hover:product-app-accent text-xs shrink-0">
                <ArrowLeft className="w-4 h-4" /> Sky
              </a>
              <div className="w-px h-6 bg-[var(--p-border)]" />
              <div className="flex items-center gap-2">
                <span className="text-lg">{meta.icon}</span>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold product-app-header truncate" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {meta.name}
                  </h1>
                  <p className="product-app-muted text-[10px] hidden sm:block">{meta.tagline}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <LanguageSwitcher />
              <ThemeToggle />
              {user?.isAuthed && <NotificationBell />}
              <AccountButton />
              <UpgradeButton />
            </div>
          </div>
        </header>

        {/* Product Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
          {renderApp()}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-8 pt-4 border-t border-[var(--p-border)] text-center">
          <div className="flex items-center justify-center gap-2 product-app-muted text-[10px] flex-wrap">
            <span>{meta.icon} {meta.name}</span>
            <span>·</span>
            <a href="/" className="hover:text-amber-300">Lumina Constellation</a>
            {aiProvider && (
              <Badge variant="outline" className={`text-[8px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : 'border-amber-400/30 text-amber-300/70'}`}>
                <Cpu className="w-2 h-2 mr-0.5" /> {aiProvider}{aiFree && ' · Free'}
              </Badge>
            )}
          </div>
        </footer>
        <Toaster />
        <InstallPrompt />
      </div>
    </LocaleProvider>
  );
}
