'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/session';
import { LocaleProvider, useLocale } from '@/components/locale-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Moon, UserCircle, Cpu, Crown, ArrowLeft } from 'lucide-react';
import { ConstellationHome } from '@/components/constellation-home';
import { ProductApp } from '@/components/product-app';
import { AccountPage } from '@/components/account-page';
import { AdminDashboard } from '@/components/admin-dashboard';

export type ProductId =
  | 'mystic' | 'storybook' | 'dream' | 'memorial'
  | 'genealogy' | 'caregiver' | 'directory';

type View = { type: 'constellation' } | { type: 'product'; id: ProductId } | { type: 'account' } | { type: 'admin' };

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
  const [view, setView] = useState<View>({ type: 'constellation' });
  const [aiProvider, setAiProvider] = useState<string>('');
  const [aiFree, setAiFree] = useState<boolean>(true);

  // URL deep-link support: ?product=mystic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product') as ProductId | null;
    if (productParam) setView({ type: 'product', id: productParam });
  }, []);

  useEffect(() => {
    fetch('/api/ai-info').then((r) => r.json()).then((data) => {
      setAiProvider(data.provider === 'deepseek' ? 'DeepSeek' : data.provider === 'openai' ? 'OpenAI' : 'GLM');
      setAiFree(data.isFree !== false);
    }).catch(() => {});
  }, []);

  // Referral auto-apply
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && user?.userId) {
      fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply-referral', userId: user.userId, code: ref }),
      }).then((r) => r.json()).then((data) => {
        if (data.success) window.history.replaceState({}, '', window.location.pathname);
      }).catch(() => {});
    }
  }, [user?.userId]);

  // Bootstrap user
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const authRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'me' }),
        });
        const authData = await authRes.json();
        if (authData.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || authData.user.locale || 'en';
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

      try {
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!cancelled && data.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || 'en';
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

  // ─── Product App Mode (full-screen takeover) ───
  if (view.type === 'product') {
    return (
      <ProductApp
        productId={view.id}
        onBack={() => setView({ type: 'constellation' })}
        aiProvider={aiProvider}
        aiFree={aiFree}
      />
    );
  }

  // ─── Account Page ───
  if (view.type === 'account') {
    return (
      <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
          <TopBar onNavigateHome={() => setView({ type: 'constellation' })} onAccount={() => setView({ type: 'account' })} onAdmin={() => setView({ type: 'admin' })} activeView="account" />
          <AccountPage />
          <Footer aiProvider={aiProvider} aiFree={aiFree} />
        </div>
        <Toaster />
      </div>
    );
  }

  // ─── Admin Dashboard ───
  if (view.type === 'admin') {
    return (
      <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
          <TopBar onNavigateHome={() => setView({ type: 'constellation' })} onAccount={() => setView({ type: 'account' })} onAdmin={() => setView({ type: 'admin' })} activeView="admin" />
          <AdminDashboard />
          <Footer aiProvider={aiProvider} aiFree={aiFree} />
        </div>
        <Toaster />
      </div>
    );
  }

  // ─── Constellation Home (default) ───
  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        <TopBar
          onNavigateHome={() => setView({ type: 'constellation' })}
          onAccount={() => setView({ type: 'account' })}
          onAdmin={() => setView({ type: 'admin' })}
          activeView="constellation"
        />
        <ConstellationHome onLaunchProduct={(id) => setView({ type: 'product', id })} />
        <Footer aiProvider={aiProvider} aiFree={aiFree} />
      </div>
      <Toaster />
    </div>
  );
}

// ─── Top Bar (shared) ───
function TopBar({
  onNavigateHome, onAccount, onAdmin, activeView,
}: {
  onNavigateHome: () => void;
  onAccount: () => void;
  onAdmin: () => void;
  activeView: string;
}) {
  const { user } = useSession();
  return (
    <header className="mb-6 sm:mb-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center relative">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 text-xs text-amber-300">✦</span>
          </div>
          <div>
            <h1
              className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300"
              style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '0.02em' }}
            >
              Lumina Constellation
            </h1>
            <p className="text-purple-200/60 text-xs tracking-wider">✦ Eight Stars · One Sky ✦</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          {user?.isAuthed && <NotificationBell />}
          <AccountButton />
          <UpgradeButton />
          {user?.isAuthed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAccount}
              className={`text-purple-200/80 hover:text-gold hover:bg-gold/10 text-xs ${activeView === 'account' ? 'text-gold bg-gold/10' : ''}`}
            >
              <UserCircle className="w-3.5 h-3.5" />
            </Button>
          )}
          {user?.isAuthed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAdmin}
              className={`text-purple-200/60 hover:text-amber-300 hover:bg-amber-500/10 text-xs ${activeView === 'admin' ? 'text-amber-300 bg-amber-500/10' : ''}`}
              title="Admin Dashboard"
            >
              <Crown className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Footer ───
function Footer({ aiProvider, aiFree }: { aiProvider?: string; aiFree?: boolean }) {
  return (
    <footer className="mt-12 pt-6 border-t border-gold/20 text-center">
      <div className="flex items-center justify-center gap-2 text-purple-200/60 text-xs flex-wrap">
        <span className="text-amber-300">✦</span>
        <span>Lumina Constellation · Eight Stars · One Sky</span>
        {aiProvider && (
          <Badge variant="outline" className={`text-[9px] ml-1 ${aiFree ? 'border-emerald-400/40 text-emerald-300' : 'border-amber-400/40 text-amber-300'}`}>
            <Cpu className="w-2.5 h-2.5 mr-1" /> {aiProvider}
            {aiFree && <span className="ml-1">· Free</span>}
          </Badge>
        )}
        <span className="text-amber-300">✦</span>
      </div>
      <p className="text-purple-300/40 text-xs mt-2 max-w-md mx-auto leading-relaxed">
        ✦ Vega · Andromeda · Selene · Vesta · Aurora · Polaris · Mercury · Pleiades · Lyra · Cassiopeia · Orion ✦
      </p>
    </footer>
  );
}
