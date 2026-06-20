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
import { Sparkles, Moon, UserCircle, Cpu, Crown } from 'lucide-react';
import { HomePage } from '@/components/tracks/home';
import { MemorialTrack, CaregiverTrack, GenealogyTrack, MicrosaasTrack } from '@/components/tracks/new-tracks';
import { MysticTrack, StorybookTrack, DirectoryTrack, PromptsTrack } from '@/components/tracks/legacy-tracks';
import { AccountPage } from '@/components/account-page';
import { AgentTrack } from '@/components/tracks/agent-track';
import { TiktokTrack } from '@/components/tracks/tiktok-track';
import { AdminDashboard } from '@/components/admin-dashboard';

type Track = 'home' | 'mystic' | 'storybook' | 'directory' | 'prompts' | 'memorial' | 'caregiver' | 'genealogy' | 'microsaas' | 'agent' | 'tiktok' | 'account' | 'admin';

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
  const [aiProvider, setAiProvider] = useState<string>('');
  const [aiFree, setAiFree] = useState<boolean>(true);

  // 从 URL 读取 track 参数（支持深链接）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('track') as Track | null;
    if (trackParam) setActiveTrack(trackParam);
  }, []);

  // 加载 AI provider 信息
  useEffect(() => {
    fetch('/api/ai-info').then((r) => r.json()).then((data) => {
      setAiProvider(data.provider === 'deepseek' ? 'DeepSeek' : data.provider === 'openai' ? 'OpenAI' : 'GLM');
      setAiFree(data.isFree !== false);
    }).catch(() => {});
  }, []);

  // 自动应用推荐码（URL ?ref=xxx）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && user?.userId) {
      fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply-referral', userId: user.userId, code: ref }),
      }).then((r) => r.json()).then((data) => {
        if (data.success) {
          // 推荐码应用成功，清理 URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }).catch(() => {});
    }
  }, [user?.userId]);

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

      // 匿名用户：自动创建
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
        {activeTrack === 'agent' && <AgentTrack />}
        {activeTrack === 'tiktok' && <TiktokTrack />}
        {activeTrack === 'account' && <AccountPage />}
        {activeTrack === 'admin' && <AdminDashboard />}
        <Footer aiProvider={aiProvider} aiFree={aiFree} />
      </div>
      <Toaster />
    </div>
  );
}

function Header({ activeTrack, onNavigate }: { activeTrack: Track; onNavigate: (t: Track) => void }) {
  const { t: tr } = useLocale();
  const { user } = useSession();
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
    { id: 'agent', label: 'AI Agent' },
    { id: 'tiktok', label: 'TikTok' },
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
              onClick={() => onNavigate('account')}
              className={`text-purple-200/80 hover:text-gold hover:bg-gold/10 text-xs ${activeTrack === 'account' ? 'text-gold bg-gold/10' : ''}`}
            >
              <UserCircle className="w-3.5 h-3.5" />
            </Button>
          )}
          {user?.isAuthed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('admin')}
              className={`text-purple-200/60 hover:text-amber-300 hover:bg-amber-500/10 text-xs ${activeTrack === 'admin' ? 'text-amber-300 bg-amber-500/10' : ''}`}
              title="后台仪表盘"
            >
              <Crown className="w-3.5 h-3.5" />
            </Button>
          )}
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

function Footer({ aiProvider, aiFree }: { aiProvider?: string; aiFree?: boolean }) {
  return (
    <footer className="mt-12 pt-6 border-t border-gold/20 text-center">
      <div className="flex items-center justify-center gap-2 text-purple-200/60 text-xs flex-wrap">
        <Sparkles className="w-3 h-3 text-gold" />
        <span>Lumina Studio · AI 原生蓝海产品矩阵 · 7 种语言 · PWA</span>
        {aiProvider && (
          <Badge variant="outline" className={`text-[9px] ml-1 ${aiFree ? 'border-emerald-400/40 text-emerald-300' : 'border-amber-400/40 text-amber-300'}`}>
            <Cpu className="w-2.5 h-2.5 mr-1" /> {aiProvider}
            {aiFree && <span className="ml-1">· 免费</span>}
          </Badge>
        )}
        <Sparkles className="w-3 h-3 text-gold" />
      </div>
      <p className="text-purple-300/40 text-xs mt-2 max-w-md mx-auto leading-relaxed">
        本产品提供的所有内容仅供娱乐与灵性探索参考，不构成医疗、心理、法律或投资建议。
      </p>
    </footer>
  );
}
