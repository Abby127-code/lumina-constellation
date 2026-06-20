'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, Moon, Star, Sun, Gem, BookOpen, Heart, Users,
  Loader2, Calendar, Clock, MapPin, Send,
  TrendingUp, Brain, Palette, Hash, Crown, Ghost, Activity,
  LayoutGrid, MessageSquareCode, ArrowRight, Rocket, Zap,
  Trophy, Eye, ThumbsUp, ExternalLink, Search, Filter,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Module =
  | 'daily' | 'astrology' | 'tarot' | 'dream' | 'bazi' | 'memorial' | 'genealogy'
  | 'storybook' | 'promptGenerator' | 'directoryDescribe';

type Track = 'home' | 'mystic' | 'storybook' | 'directory' | 'prompts';

// ─────────────────────────────────────────────
// 主入口组件
// ─────────────────────────────────────────────
export default function Home() {
  const { user, setUser } = useSession();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track>('home');

  useEffect(() => {
    let cancelled = false;
    if (user) {
      // Defer to avoid synchronous setState within effect
      const t = setTimeout(() => !cancelled && setBootstrapped(true), 0);
      return () => { cancelled = true; clearTimeout(t); };
    }
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.user) {
          setUser({
            userId: data.user.id,
            name: data.user.name || undefined,
            email: data.user.email || undefined,
            birthDate: data.user.birthDate || undefined,
            birthTime: data.user.birthTime || undefined,
            birthPlace: data.user.birthPlace || undefined,
            gender: data.user.gender || undefined,
            plan: data.user.plan || 'free',
            trialEndsAt: data.user.trialEndsAt || undefined,
          });
        }
      })
      .catch((e) => console.error('user init error:', e))
      .finally(() => !cancelled && setBootstrapped(true));
    return () => { cancelled = true; };
  }, [user, setUser]);

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
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}

// ─────────────────────────────────────────────
// 顶部 Header
// ─────────────────────────────────────────────
function Header({ activeTrack, onNavigate }: { activeTrack: Track; onNavigate: (t: Track) => void }) {
  const navItems: { id: Track; label: string }[] = [
    { id: 'home', label: '首页' },
    { id: 'mystic', label: '灵性陪伴' },
    { id: 'storybook', label: '儿童故事书' },
    { id: 'directory', label: 'AI 目录站' },
    { id: 'prompts', label: 'Prompt 库' },
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
            <p className="text-purple-200/60 text-xs tracking-wider">8 大蓝海赛道 · AI 原生产品矩阵</p>
          </div>
        </div>
        <Badge variant="outline" className="border-gold/40 text-gold text-xs px-3 py-1">
          <Sparkles className="w-3 h-3 mr-1" /> BETA · 4 个赛道已上线
        </Badge>
      </div>
      <nav className="flex flex-wrap gap-1.5 bg-white/5 border border-gold/20 p-1.5 rounded-xl">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
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

// ─────────────────────────────────────────────
// 首页：8 大赛道展示
// ─────────────────────────────────────────────
function HomePage({ onNavigate }: { onNavigate: (t: Track) => void }) {
  const tracks = [
    {
      id: 'mystic' as const,
      name: 'AI 灵性陪伴',
      tagline: '占星 · 塔罗 · 解梦 · 命理 · 能量',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-amber-500/20 to-purple-700/20',
      border: 'border-amber-400/40',
      badge: 'TOP 1 推荐',
      badgeColor: 'bg-amber-500 text-black',
      market: 'CAGR 19.8% · $5.69B → $11.71B',
      description: '一体化 AI 玄学超级 App，整合西方占星、塔罗、解梦、八字、每日能量报告。AI 原生对话式深度解读，跨文化玄学体系。',
      status: 'online',
      cta: '开启灵性之旅',
    },
    {
      id: 'storybook' as const,
      name: 'AI 儿童故事书',
      tagline: '个性化 · 教育性 · 可印刷',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-rose-400/20 to-orange-500/20',
      border: 'border-rose-400/40',
      badge: '高客单价',
      badgeColor: 'bg-rose-500 text-white',
      market: 'CAGR 21.8% · $3.2B → $18.7B',
      description: '输入孩子名字+主题，AI 生成专属故事书，每页配插图 Prompt，可下载电子版或印刷成实体书。DreamStories.ai 已验证 $6M 营收模式。',
      status: 'online',
      cta: '为孩子创作',
    },
    {
      id: 'directory' as const,
      name: 'AI 目录站',
      tagline: '已验证 · 被动收入 · SEO 复利',
      icon: <LayoutGrid className="w-6 h-6" />,
      color: 'from-emerald-400/20 to-teal-600/20',
      border: 'border-emerald-400/40',
      badge: '轻量启动',
      badgeColor: 'bg-emerald-600 text-white',
      market: '$34K MRR 案例 · 3 小时/月维护',
      description: '收录 AI 工具、AI Agent、SaaS 产品，构建程序化 SEO 目录站。已验证模式：3.4 万美元 MRR，毛利率近 100%。可提交、可投票、可分类筛选。',
      status: 'online',
      cta: '探索工具',
    },
    {
      id: 'prompts' as const,
      name: 'AI Prompt 库',
      tagline: '创作 · 收藏 · 分享 · 变现',
      icon: <MessageSquareCode className="w-6 h-6" />,
      color: 'from-sky-400/20 to-indigo-600/20',
      border: 'border-sky-400/40',
      badge: '高频使用',
      badgeColor: 'bg-sky-600 text-white',
      market: 'CAGR 23.3% · $1.3B → $12.1B',
      description: 'AI Prompt 交易与收藏平台。可生成、收藏、分享、售卖 Prompt 模板。覆盖写作、营销、编程、设计、个人成长等场景。',
      status: 'online',
      cta: '管理 Prompt',
    },
    // 以下为路线图中的赛道（暂未上线）
    {
      id: 'memorial' as const,
      name: 'AI 数字纪念',
      tagline: '为逝者撰写传记 · 疗愈告别',
      icon: <Ghost className="w-6 h-6" />,
      color: 'from-purple-400/20 to-indigo-700/20',
      border: 'border-purple-400/40',
      badge: '新兴蓝海',
      badgeColor: 'bg-purple-600 text-white',
      market: 'Pre-Need Death Care $120B · CAGR 6.5%',
      description: '为逝去的亲人、朋友或宠物撰写纪念传记，AI 模拟逝者口吻写一封信。 PlotBox 等已开始布局殡葬 AI。',
      status: 'roadmap',
      cta: '即将上线',
    },
    {
      id: 'caregiver' as const,
      name: 'AI 照护者支持',
      tagline: '为家庭照护者提供 24/7 后盾',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-pink-400/20 to-rose-600/20',
      border: 'border-pink-400/40',
      badge: '刚需市场',
      badgeColor: 'bg-pink-600 text-white',
      market: 'CAGR 16% · $1.71B → $7.5B',
      description: '面向家庭照护者的 AI 助手：症状解读、情绪支持、用药提醒、照护日志自动生成。AARP 报告：美国 6300 万人担任家庭照护者。',
      status: 'roadmap',
      cta: '即将上线',
    },
    {
      id: 'genealogy' as const,
      name: 'AI 家谱研究',
      tagline: '老照片修复 · 文档 OCR · 家族叙事',
      icon: <Users className="w-6 h-6" />,
      color: 'from-yellow-400/20 to-amber-700/20',
      border: 'border-yellow-400/40',
      badge: '长尾蓝海',
      badgeColor: 'bg-yellow-700 text-white',
      market: 'r/Genealogy 50 万订阅 · 长尾高付费',
      description: 'AI 增强家谱研究：老照片修复与人物识别、历史文档 OCR、家族故事 AI 撰写。Steve Little 已开源 80+ 工具证明需求。',
      status: 'roadmap',
      cta: '即将上线',
    },
    {
      id: 'microsaas' as const,
      name: '垂直 AI 微 SaaS',
      tagline: 'Chrome 扩展 · Notion 插件 · Slack Bot',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-cyan-400/20 to-blue-700/20',
      border: 'border-cyan-400/40',
      badge: '快速验证',
      badgeColor: 'bg-cyan-600 text-white',
      market: '70% MRR<$1K · 中位 $4.2K',
      description: '基于已验证模式快速孵化微 SaaS：AI Chrome 扩展、Notion 插件、Stripe 计费工具、Slack Bot、Zapier 集成等。',
      status: 'roadmap',
      cta: '即将上线',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero 区 */}
      <section className="text-center py-8 sm:py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-dark text-xs tracking-widest text-gold mb-5">
          <Rocket className="w-3 h-3" />
          <span>BLUE OCEAN · 8 TRACKS · ONE PLATFORM</span>
        </div>
        <h2
          className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-shadow-gold mb-4"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          一个平台，八个蓝海
        </h2>
        <p className="text-purple-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          基于 24 个赛道方向、240 条实时市场数据深度扫描，<br className="hidden sm:block" />
          为独立创业者打造的 AI 原生产品矩阵。轻量启动，复利增长。
        </p>
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
            <Trophy className="w-3 h-3 text-gold" /> 4 赛道已上线
          </div>
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
            <TrendingUp className="w-3 h-3 text-gold" /> 综合 CAGR 19.8%+
          </div>
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
            <Zap className="w-3 h-3 text-gold" /> AI 原生架构
          </div>
        </div>
      </section>

      {/* 8 赛道卡片网格 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((t) => (
          <Card
            key={t.id}
            className={`glass-card-dark ${t.border} hover:border-gold/60 transition-all hover:scale-[1.01] cursor-pointer group`}
            onClick={() => t.status === 'online' && onNavigate(t.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} border ${t.border} flex items-center justify-center text-gold`}>
                  {t.icon}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${t.badgeColor} text-[10px] px-2 py-0.5`}>{t.badge}</Badge>
                  {t.status === 'online' ? (
                    <Badge variant="outline" className="border-emerald-400/50 text-emerald-300 text-[10px] px-2 py-0.5">
                      ● ONLINE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-purple-400/40 text-purple-300/70 text-[10px] px-2 py-0.5">
                      ROADMAP
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg text-gold mt-3 flex items-center gap-2">
                {t.name}
                {t.status === 'online' && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </CardTitle>
              <CardDescription className="text-purple-200/70 text-xs">{t.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-purple-100/80 text-xs leading-relaxed mb-3">{t.description}</p>
              <div className="flex items-center justify-between text-[10px] text-purple-200/60 mb-3">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {t.market}
                </span>
              </div>
              {t.status === 'online' ? (
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs"
                >
                  {t.cta} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="w-full text-xs border-purple-400/30 text-purple-300/50">
                  {t.cta}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// 用户档案（出生信息设置）
// ─────────────────────────────────────────────
function ProfileSection() {
  const { user, updateProfile } = useSession();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    birthDate: user?.birthDate || '',
    birthTime: user?.birthTime || '',
    birthPlace: user?.birthPlace || '',
    gender: user?.gender || '',
  });

  const save = async () => {
    if (!user) return;
    updateProfile(form);
    setEditing(false);
    toast({ title: '档案已保存', description: '你的出生信息已更新' });
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, profile: form }),
    }).catch((e) => console.error('profile sync error:', e));
  };

  if (!user) return null;

  return (
    <Card className="glass-card-dark mb-6 border-gold/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {(user.name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base text-gold flex items-center gap-2">
                {user.name || '匿名旅人'}
                <Badge variant="outline" className="text-xs border-gold/50 text-gold">
                  {user.plan === 'free' ? '体验版' : user.plan === 'pro' ? 'PRO' : 'PREMIUM'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-purple-200/70 text-xs mt-0.5">
                {user.birthDate ? `出生 ${user.birthDate} ${user.birthTime || ''}` : '未填写出生信息（影响占星/命理精度）'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gold hover:text-amber-200 hover:bg-gold/10"
            onClick={() => setEditing(!editing)}
          >
            {editing ? '取消' : '编辑档案'}
          </Button>
        </div>
      </CardHeader>
      {editing && (
        <CardContent className="space-y-3 pt-2 border-t border-gold/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs">姓名/昵称</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="你的称呼"
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">出生日期</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">出生时间（可选）</Label>
              <Input
                type="time"
                value={form.birthTime}
                onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">出生地点（可选）</Label>
              <Input
                value={form.birthPlace}
                onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                placeholder="如：北京 / New York"
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">性别</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="bg-white/5 border-gold/30 text-white">
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500">
            <Sparkles className="w-4 h-4 mr-2" /> 保存档案
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────
// 通用调用 hook
// ─────────────────────────────────────────────
function useMysticCall() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);

  const call = useCallback(async (module: Module, input: any) => {
    setLoading(true);
    setResult('');
    setMetadata(null);
    try {
      const res = await fetch('/api/mystic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, input, userId: user?.userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI 调用失败');
      }
      setResult(data.result);
      setMetadata(data.metadata);
      toast({ title: '✨ 生成完成', description: 'AI 已为你生成内容' });
    } catch (e: any) {
      toast({
        title: '调用失败',
        description: e?.message || '请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return { loading, result, metadata, call, setResult };
}

// ─────────────────────────────────────────────
// AI 结果渲染组件
// ─────────────────────────────────────────────
function AIResult({ result, loading }: { result: string; loading: boolean }) {
  if (loading) {
    return (
      <Card className="glass-card-dark border-gold/30 mt-4">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <div className="relative">
            <Moon className="w-12 h-12 text-gold animate-float" />
            <Sparkles className="w-4 h-4 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-purple-200/80 text-sm tracking-widest">AI 正在生成内容...</p>
          <Progress value={66} className="w-48 h-1 bg-white/10" />
        </CardContent>
      </Card>
    );
  }
  if (!result) return null;
  return (
    <Card className="glass-card-dark border-gold/30 mt-4 animate-glow-pulse">
      <CardContent className="pt-6">
        <div className="prose prose-invert max-w-none">
          <div className="text-purple-50/90 leading-relaxed space-y-3 text-sm sm:text-base">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-gold mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-amber-200 mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold text-amber-100 mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-purple-50/85 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-purple-50/85">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-purple-50/85">{children}</ol>,
                strong: ({ children }) => <strong className="text-amber-200 font-semibold">{children}</strong>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/50 pl-4 italic text-purple-200/70 my-2">{children}</blockquote>,
                code: ({ children }) => <code className="bg-black/40 text-emerald-300 px-1.5 py-0.5 rounded text-xs">{children}</code>,
                pre: ({ children }) => <pre className="bg-black/40 border border-gold/20 p-3 rounded-lg overflow-x-auto text-xs text-emerald-300 my-2">{children}</pre>,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// 通用模块头部
// ─────────────────────────────────────────────
function ModuleHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-purple-700/30 border border-gold/40 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gold">{title}</h2>
        <p className="text-purple-200/70 text-xs sm:text-sm mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 灵性陪伴赛道（含 7 个子模块）
// ─────────────────────────────────────────────
function MysticTrack() {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto bg-white/5 border border-gold/20 p-1 rounded-xl gap-1">
          <TabsTrigger value="daily" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />每日
          </TabsTrigger>
          <TabsTrigger value="astrology" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />占星
          </TabsTrigger>
          <TabsTrigger value="tarot" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Gem className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />塔罗
          </TabsTrigger>
          <TabsTrigger value="dream" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Moon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />解梦
          </TabsTrigger>
          <TabsTrigger value="bazi" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />命理
          </TabsTrigger>
          <TabsTrigger value="memorial" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Ghost className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />纪念
          </TabsTrigger>
          <TabsTrigger value="genealogy" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs sm:text-sm py-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />家谱
          </TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6"><DailyModule /></TabsContent>
        <TabsContent value="astrology" className="mt-6"><AstrologyModule /></TabsContent>
        <TabsContent value="tarot" className="mt-6"><TarotModule /></TabsContent>
        <TabsContent value="dream" className="mt-6"><DreamModule /></TabsContent>
        <TabsContent value="bazi" className="mt-6"><BaziModule /></TabsContent>
        <TabsContent value="memorial" className="mt-6"><MemorialModule /></TabsContent>
        <TabsContent value="genealogy" className="mt-6"><GenealogyModule /></TabsContent>
      </Tabs>
    </div>
  );
}

// 模块 1：每日能量报告
function DailyModule() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [focus, setFocus] = useState('');
  const today = new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Sun className="w-5 h-5" />}
        title="今日能量报告"
        subtitle={`今天是 ${today} · AI 融合占星·塔罗·月相·数字能量学`}
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">今日关注（可选）</Label>
            <Input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="如：今天的面试 / 与TA的关系 / 工作压力..."
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <Button
            onClick={() => call('daily', { birthDate: user?.birthDate, sunSign: user?.birthDate, focus })}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            生成今日能量报告
          </Button>
        </CardContent>
      </Card>
      {metadata?.moonPhase && (
        <div className="flex items-center justify-center gap-3 text-purple-200/80 text-sm">
          <span className="text-2xl">{metadata.moonPhase.emoji}</span>
          <span>今日月相：<span className="text-gold">{metadata.moonPhase.phase}</span> · {metadata.moonPhase.meaning}</span>
        </div>
      )}
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 模块 2：占星本命盘
function AstrologyModule() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Star className="w-5 h-5" />}
        title="AI 占星本命盘解读"
        subtitle="输入出生信息 · AI 深度解读太阳/月亮/上升星座的协同"
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          {user?.birthDate ? (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-purple-100">已记录：{user.birthDate} {user.birthTime || ''} {user.birthPlace || ''}</span>
              <Badge variant="outline" className="border-gold/40 text-gold">
                {metadata?.sunSign || '太阳星座待计算'}
              </Badge>
            </div>
          ) : (
            <p className="text-purple-200/70 text-sm">请先在顶部"编辑档案"中填写出生日期</p>
          )}
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">想了解的问题（可选）</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="如：我的人生主题是什么？我的灵魂使命？我的爱情会如何发展？"
              className="bg-white/5 border-gold/30 text-white min-h-[80px]"
            />
          </div>
          <Button
            onClick={() => call('astrology', {
              birthDate: user?.birthDate || '1995-01-01',
              birthTime: user?.birthTime || '',
              birthPlace: user?.birthPlace || '',
              gender: user?.gender || '',
              question,
            })}
            disabled={loading || !user?.birthDate}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
            解读本命盘
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 模块 3：塔罗占卜
function TarotModule() {
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState(3);
  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Gem className="w-5 h-5" />}
        title="AI 塔罗占卜"
        subtitle="抽牌 · AI 深度解读牌阵 · 多框架启示"
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">你的问题</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="如：我的事业会顺利吗？我应该接受这份工作吗？我和TA的关系未来？"
              className="bg-white/5 border-gold/30 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">牌阵大小</Label>
            <Select value={String(cardCount)} onValueChange={(v) => setCardCount(Number(v))}>
              <SelectTrigger className="bg-white/5 border-gold/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 张（过去·现在·未来）</SelectItem>
                <SelectItem value="5">5 张（扩展牌阵）</SelectItem>
                <SelectItem value="7">7 张（深度牌阵）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => call('tarot', { question, cardCount })}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            抽牌占卜
          </Button>
        </CardContent>
      </Card>
      {metadata?.cards && (
        <Card className="glass-card-dark border-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gold flex items-center gap-2">
              <Gem className="w-4 h-4" /> 抽到的牌
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metadata.cards.map((c: any, i: number) => (
                <div key={i} className="bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border border-gold/30 rounded-lg p-3 animate-card-flip" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-gold border-gold/40 text-xs">{c.position}</Badge>
                    {c.reversed && <Badge variant="outline" className="text-red-300 border-red-300/40 text-xs">逆位</Badge>}
                  </div>
                  <div className="text-2xl text-center my-2 text-gold font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {c.card.symbol}
                  </div>
                  <p className="text-amber-100 font-medium text-sm text-center">{c.card.name}</p>
                  <p className="text-purple-200/60 text-xs text-center mt-1">{c.card.keywords}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 模块 4：解梦日记
function DreamModule() {
  const { loading, result, call } = useMysticCall();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [framework, setFramework] = useState('jungian');
  const [context, setContext] = useState('');
  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Moon className="w-5 h-5" />}
        title="AI 解梦日记"
        subtitle="记录梦境 · AI 多框架解读 · 长期潜意识追踪"
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">梦境标题</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：飞翔在大海上空"
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">梦境内容（详细描述）</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="尽量详细地记录梦境：人物、场景、情节、感受..."
              className="bg-white/5 border-gold/30 text-white min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">梦境情绪</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-white/5 border-gold/30 text-white">
                  <SelectValue placeholder="选择主要情绪" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">平静</SelectItem>
                  <SelectItem value="joy">喜悦</SelectItem>
                  <SelectItem value="fear">恐惧</SelectItem>
                  <SelectItem value="anxious">焦虑</SelectItem>
                  <SelectItem value="sad">悲伤</SelectItem>
                  <SelectItem value="confused">困惑</SelectItem>
                  <SelectItem value="mysterious">神秘</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">解读框架</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-white/5 border-gold/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jungian">荣格原型</SelectItem>
                  <SelectItem value="freudian">弗洛伊德精神分析</SelectItem>
                  <SelectItem value="gestalt">格式塔投射</SelectItem>
                  <SelectItem value="spiritual">灵性视角</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">现实背景（可选）</Label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="如：最近工作压力大 / 刚分手 / 准备考试..."
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <Button
            onClick={() => call('dream', { title, content, mood, framework, context })}
            disabled={loading || !title || !content}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Moon className="w-4 h-4 mr-2" />}
            解读梦境
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 模块 5：命理八字
function BaziModule() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Hash className="w-5 h-5" />}
        title="AI 命理八字解读"
        subtitle="天干地支 · 五行生克 · 十神关系 · 大运流年"
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          {user?.birthDate ? (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-purple-100">已记录：{user.birthDate} {user.birthTime || ''}</span>
              {metadata?.dayMaster && (
                <Badge variant="outline" className="border-gold/40 text-gold">
                  日主：{metadata.dayMaster}
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-purple-200/70 text-sm">请先在顶部"编辑档案"中填写出生日期</p>
          )}
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">想了解（可选）</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="如：事业财运 / 感情婚姻 / 健康 / 大运"
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <Button
            onClick={() => call('bazi', {
              birthDate: user?.birthDate || '1995-01-01',
              birthTime: user?.birthTime || '',
              gender: user?.gender || '',
              question,
            })}
            disabled={loading || !user?.birthDate}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}
            解读命盘
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 模块 6：AI 数字纪念
function MemorialModule() {
  const { loading, result, call } = useMysticCall();
  const [form, setForm] = useState({
    personName: '', relationship: '', birthYear: '', deathYear: '',
    personality: '', memories: '', userFeeling: '',
  });
  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Ghost className="w-5 h-5" />}
        title="AI 数字纪念"
        subtitle="为逝去的亲人/朋友/宠物撰写纪念传记 · 收到一封来自TA的信"
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">纪念对象姓名</Label>
              <Input
                value={form.personName}
                onChange={(e) => setForm({ ...form, personName: e.target.value })}
                placeholder="如：外婆 / 小白 / 老张"
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">与你的关系</Label>
              <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                <SelectTrigger className="bg-white/5 border-gold/30 text-white">
                  <SelectValue placeholder="选择关系" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grandparent">祖父母</SelectItem>
                  <SelectItem value="parent">父母</SelectItem>
                  <SelectItem value="spouse">配偶</SelectItem>
                  <SelectItem value="sibling">兄弟姐妹</SelectItem>
                  <SelectItem value="friend">朋友</SelectItem>
                  <SelectItem value="pet">宠物</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">出生年份</Label>
              <Input
                value={form.birthYear}
                onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                placeholder="如：1945"
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">离世年份</Label>
              <Input
                value={form.deathYear}
                onChange={(e) => setForm({ ...form, deathYear: e.target.value })}
                placeholder="如：2023"
                className="bg-white/5 border-gold/30 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">TA的性格特点</Label>
            <Textarea
              value={form.personality}
              onChange={(e) => setForm({ ...form, personality: e.target.value })}
              placeholder="如：温柔、爱笑、做菜很好吃、爱讲过去的故事..."
              className="bg-white/5 border-gold/30 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">美好回忆</Label>
            <Textarea
              value={form.memories}
              onChange={(e) => setForm({ ...form, memories: e.target.value })}
              placeholder="你最想留住的、关于TA的画面和瞬间..."
              className="bg-white/5 border-gold/30 text-white min-h-[100px]"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">你想对TA说的话</Label>
            <Input
              value={form.userFeeling}
              onChange={(e) => setForm({ ...form, userFeeling: e.target.value })}
              placeholder="如：好想你 / 谢谢你 / 对不起..."
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <Button
            onClick={() => call('memorial', form)}
            disabled={loading || !form.personName}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}
            撰写纪念
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 模块 7：AI 家谱故事
function GenealogyModule() {
  const { loading, result, call } = useMysticCall();
  const [form, setForm] = useState({
    familyName: '', members: '', origins: '', traditions: '', focus: '',
  });
  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={<Users className="w-5 h-5" />}
        title="AI 家谱故事"
        subtitle="将家族成员、起源、传统编织成动人的家族叙事"
      />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">家族姓氏</Label>
            <Input
              value={form.familyName}
              onChange={(e) => setForm({ ...form, familyName: e.target.value })}
              placeholder="如：王家 / Smith 家族"
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">已知家族成员</Label>
            <Textarea
              value={form.members}
              onChange={(e) => setForm({ ...form, members: e.target.value })}
              placeholder="如：祖父王大山（铁匠）、祖母李秀英、父亲王建国（教师）..."
              className="bg-white/5 border-gold/30 text-white min-h-[100px]"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">家族起源（传说或史实）</Label>
            <Textarea
              value={form.origins}
              onChange={(e) => setForm({ ...form, origins: e.target.value })}
              placeholder="如：祖上从山西洪洞大槐树迁来 / 19世纪从爱尔兰移民美国..."
              className="bg-white/5 border-gold/30 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">家族传统与精神</Label>
            <Textarea
              value={form.traditions}
              onChange={(e) => setForm({ ...form, traditions: e.target.value })}
              placeholder="如：每年春节必回老家 / 家训：耕读传家 / 重教育..."
              className="bg-white/5 border-gold/30 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">希望突出的主题</Label>
            <Input
              value={form.focus}
              onChange={(e) => setForm({ ...form, focus: e.target.value })}
              placeholder="如：传承 / 迁徙故事 / 家族精神"
              className="bg-white/5 border-gold/30 text-white"
            />
          </div>
          <Button
            onClick={() => call('genealogy', form)}
            disabled={loading || !form.familyName}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
            撰写家族故事
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 页脚
// ─────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-gold/20 text-center">
      <div className="flex items-center justify-center gap-2 text-purple-200/60 text-xs">
        <Sparkles className="w-3 h-3 text-gold" />
        <span>Lumina Studio · AI 原生蓝海产品矩阵</span>
        <Sparkles className="w-3 h-3 text-gold" />
      </div>
      <p className="text-purple-300/40 text-xs mt-2 max-w-md mx-auto leading-relaxed">
        本产品提供的所有内容仅供娱乐与灵性探索参考，不构成医疗、心理、法律或投资建议。
        请以理性态度使用，必要时请寻求专业人士帮助。
      </p>
    </footer>
  );
}

// ─────────────────────────────────────────────
// 赛道 2：AI 儿童故事书
// ─────────────────────────────────────────────
function StorybookTrack() {
  const { user } = useSession();
  const { loading, result, call } = useMysticCall();
  const [form, setForm] = useState({
    childName: '',
    childAge: '5',
    theme: 'brave',
    artStyle: 'watercolor',
    specialRequest: '',
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={<BookOpen className="w-5 h-5" />}
        title="AI 个性化儿童故事书"
        subtitle="输入孩子信息 · AI 生成专属故事 · 每页配插图 Prompt"
      />

      <Card className="glass-card-dark border-rose-400/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-rose-500 text-white text-[10px]">市场 $3.2B → $18.7B</Badge>
            <Badge variant="outline" className="border-rose-400/40 text-rose-300 text-[10px]">CAGR 21.8%</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">主角名字（孩子姓名）</Label>
              <Input
                value={form.childName}
                onChange={(e) => setForm({ ...form, childName: e.target.value })}
                placeholder="如：小米 / Emma"
                className="bg-white/5 border-rose-400/30 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">孩子年龄</Label>
              <Select value={form.childAge} onValueChange={(v) => setForm({ ...form, childAge: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 岁</SelectItem>
                  <SelectItem value="4">4 岁</SelectItem>
                  <SelectItem value="5">5 岁</SelectItem>
                  <SelectItem value="6">6 岁</SelectItem>
                  <SelectItem value="7">7 岁</SelectItem>
                  <SelectItem value="8">8 岁</SelectItem>
                  <SelectItem value="9">9 岁</SelectItem>
                  <SelectItem value="10">10 岁</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">故事主题</Label>
              <Select value={form.theme} onValueChange={(v) => setForm({ ...form, theme: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brave">勇敢面对困难</SelectItem>
                  <SelectItem value="friendship">友谊与分享</SelectItem>
                  <SelectItem value="sleep">温馨睡前故事</SelectItem>
                  <SelectItem value="explore">探索未知世界</SelectItem>
                  <SelectItem value="share">学会分享</SelectItem>
                  <SelectItem value="kind">善良与同理心</SelectItem>
                  <SelectItem value="growth">成长与独立</SelectItem>
                  <SelectItem value="magic">奇幻冒险</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">插画风格</Label>
              <Select value={form.artStyle} onValueChange={(v) => setForm({ ...form, artStyle: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="watercolor">水彩画风</SelectItem>
                  <SelectItem value="cartoon">卡通风格</SelectItem>
                  <SelectItem value="pixar">皮克斯 3D 风</SelectItem>
                  <SelectItem value="anime">日系动漫风</SelectItem>
                  <SelectItem value="picturebook">经典绘本风</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">特殊要求（可选）</Label>
            <Input
              value={form.specialRequest}
              onChange={(e) => setForm({ ...form, specialRequest: e.target.value })}
              placeholder="如：主角喜欢恐龙 / 加入一只叫豆豆的小狗..."
              className="bg-white/5 border-rose-400/30 text-white"
            />
          </div>
          <Button
            onClick={() => call('storybook', form)}
            disabled={loading || !form.childName}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-400 hover:to-orange-400"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
            为 {form.childName || '孩子'} 创作专属故事
          </Button>
        </CardContent>
      </Card>

      {/* 商业模式提示 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3">
          <p className="text-rose-300 text-xs font-semibold mb-1">💰 客单价</p>
          <p className="text-purple-100/80 text-xs">电子版 $25-40 / 实体书 $50-80</p>
        </div>
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3">
          <p className="text-rose-300 text-xs font-semibold mb-1">📊 验证案例</p>
          <p className="text-purple-100/80 text-xs">DreamStories.ai 年营收 $6M</p>
        </div>
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3">
          <p className="text-rose-300 text-xs font-semibold mb-1">🎯 销售渠道</p>
          <p className="text-purple-100/80 text-xs">Gumroad / Etsy / Shopify POD</p>
        </div>
      </div>

      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 赛道 3：AI 目录站
// ─────────────────────────────────────────────
function DirectoryTrack() {
  const { user } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    name: '', url: '', description: '', category: 'ai-tool', pricing: 'free',
  });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?type=directory&category=${category}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const upvote = async (id: string) => {
    try {
      await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'directory', action: 'upvote', payload: { id } }),
      });
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, upvotes: it.upvotes + 1 } : it));
    } catch (e) { console.error(e); }
  };

  const submit = async () => {
    if (!submitForm.name || !submitForm.url) {
      toast({ title: '请填写工具名和 URL', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'directory', action: 'create',
          payload: { ...submitForm, userId: user?.userId },
        }),
      });
      if (res.ok) {
        toast({ title: '✅ 提交成功', description: '已加入目录' });
        setSubmitForm({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'free' });
        setShowSubmit(false);
        loadItems();
      }
    } catch (e: any) {
      toast({ title: '提交失败', description: e?.message, variant: 'destructive' });
    }
  };

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'ai-tool', name: 'AI 工具' },
    { id: 'ai-agent', name: 'AI Agent' },
    { id: 'saas', name: 'SaaS 产品' },
    { id: 'newsletter', name: 'Newsletter' },
    { id: 'resource', name: '学习资源' },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={<LayoutGrid className="w-5 h-5" />}
        title="AI 工具目录站"
        subtitle="收录优质 AI 工具 · 程序化 SEO · 被动收入"
      />

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              category === c.id
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-purple-200/70 hover:bg-emerald-600/20 hover:text-emerald-300'
            }`}
          >
            {c.name}
          </button>
        ))}
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSubmit(!showSubmit)}
          className="border-emerald-400/40 text-emerald-300 hover:bg-emerald-600/20 text-xs"
        >
          + 提交工具
        </Button>
      </div>

      {showSubmit && (
        <Card className="glass-card-dark border-emerald-400/30">
          <CardHeader><CardTitle className="text-base text-emerald-300">提交新工具到目录</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                value={submitForm.name} placeholder="工具名"
                onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                className="bg-white/5 border-emerald-400/30 text-white"
              />
              <Input
                value={submitForm.url} placeholder="https://..."
                onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                className="bg-white/5 border-emerald-400/30 text-white"
              />
            </div>
            <Input
              value={submitForm.description} placeholder="一句话描述"
              onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
              className="bg-white/5 border-emerald-400/30 text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={submitForm.category} onValueChange={(v) => setSubmitForm({ ...submitForm, category: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-tool">AI 工具</SelectItem>
                  <SelectItem value="ai-agent">AI Agent</SelectItem>
                  <SelectItem value="saas">SaaS 产品</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="resource">学习资源</SelectItem>
                </SelectContent>
              </Select>
              <Select value={submitForm.pricing} onValueChange={(v) => setSubmitForm({ ...submitForm, pricing: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">免费</SelectItem>
                  <SelectItem value="freemium">免费+付费</SelectItem>
                  <SelectItem value="paid">付费</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submit} className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
              提交
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-purple-200/70 text-sm mt-2">加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-purple-200/70 text-sm">暂无工具，欢迎提交第一个！</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="glass-card-dark border-emerald-400/20 hover:border-emerald-400/50 transition-all">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-emerald-200 flex items-center gap-1">
                      {item.name}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </h3>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-purple-300/50 text-[10px] hover:text-emerald-300 truncate block">
                      {item.url}
                    </a>
                  </div>
                  {item.isFeatured && <Badge className="bg-amber-500 text-black text-[9px] px-1.5">置顶</Badge>}
                </div>
                <p className="text-purple-100/75 text-xs leading-relaxed mb-3 line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-300">{item.category}</Badge>
                    {item.pricing && <Badge variant="outline" className="text-[9px] border-purple-400/40 text-purple-300">{item.pricing}</Badge>}
                  </div>
                  <button
                    onClick={() => upvote(item.id)}
                    className="flex items-center gap-1 text-[10px] text-purple-200/70 hover:text-emerald-300"
                  >
                    <ThumbsUp className="w-3 h-3" /> {item.upvotes || 0}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="glass-card-dark border-emerald-400/20 rounded-lg p-4">
        <p className="text-emerald-300 text-xs font-semibold mb-2">📈 商业模式</p>
        <p className="text-purple-100/75 text-xs leading-relaxed">
          已验证模式：单赛道目录站可达 $34K MRR，毛利率近 100%，维护工时仅 3 小时/月。
          收入来源：赞助位（$50-500/月）、高级筛选、API 访问、Newsletter 推广。
          程序化 SEO 是核心——每个工具独立页面、每个分类聚合页都是搜索引擎入口。
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 赛道 4：AI Prompt 库
// ─────────────────────────────────────────────
function PromptsTrack() {
  const { user } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [genForm, setGenForm] = useState({
    purpose: '', model: 'ChatGPT', scene: '', style: '专业',
  });

  const { loading: aiLoading, result: aiResult, call } = useMysticCall();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?type=prompts&category=${category}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'writing', name: '写作' },
    { id: 'image', name: '绘图' },
    { id: 'business', name: '商业' },
    { id: 'coding', name: '编程' },
    { id: 'marketing', name: '营销' },
    { id: 'personal', name: '个人成长' },
  ];

  const handleGenerate = () => {
    if (!genForm.purpose) {
      toast({ title: '请填写 Prompt 用途', variant: 'destructive' });
      return;
    }
    call('promptGenerator', genForm);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={<MessageSquareCode className="w-5 h-5" />}
        title="AI Prompt 库"
        subtitle="生成 · 收藏 · 分享 · 变现 Prompt 模板"
      />

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              category === c.id
                ? 'bg-sky-600 text-white'
                : 'bg-white/5 text-purple-200/70 hover:bg-sky-600/20 hover:text-sky-300'
            }`}
          >
            {c.name}
          </button>
        ))}
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={() => setShowGenerator(!showGenerator)}
          className="bg-sky-600 text-white hover:bg-sky-500 text-xs"
        >
          <Sparkles className="w-3 h-3 mr-1" /> AI 生成 Prompt
        </Button>
      </div>

      {showGenerator && (
        <Card className="glass-card-dark border-sky-400/30">
          <CardHeader><CardTitle className="text-base text-sky-300">AI Prompt 生成器</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">Prompt 用途</Label>
              <Input
                value={genForm.purpose}
                onChange={(e) => setGenForm({ ...genForm, purpose: e.target.value })}
                placeholder="如：撰写小红书种草笔记 / 生成产品需求文档 / 编写 SQL 查询"
                className="bg-white/5 border-sky-400/30 text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={genForm.model} onValueChange={(v) => setGenForm({ ...genForm, model: v })}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                  <SelectItem value="Claude">Claude</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                  <SelectItem value="Midjourney">Midjourney</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genForm.style} onValueChange={(v) => setGenForm({ ...genForm, style: v })}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="专业">专业</SelectItem>
                  <SelectItem value="简洁">简洁</SelectItem>
                  <SelectItem value="详细">详细</SelectItem>
                  <SelectItem value="创意">创意</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={genForm.scene}
              onChange={(e) => setGenForm({ ...genForm, scene: e.target.value })}
              placeholder="具体场景描述（可选）"
              className="bg-white/5 border-sky-400/30 text-white"
            />
            <Button onClick={handleGenerate} disabled={aiLoading} className="w-full bg-sky-600 text-white hover:bg-sky-500">
              {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              生成 Prompt 模板
            </Button>
          </CardContent>
        </Card>
      )}

      {aiResult && <AIResult result={aiResult} loading={false} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
            <p className="text-purple-200/70 text-sm mt-2">加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-purple-200/70 text-sm">暂无公开 Prompt，点击"AI 生成 Prompt"创建第一个！</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="glass-card-dark border-sky-400/20 hover:border-sky-400/50 transition-all">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-sky-200">{item.title}</h3>
                  <Badge variant="outline" className="text-[9px] border-sky-400/40 text-sky-300">{item.model}</Badge>
                </div>
                {item.description && (
                  <p className="text-purple-100/70 text-xs mb-2">{item.description}</p>
                )}
                <pre className="bg-black/40 border border-sky-400/20 p-2 rounded text-[10px] text-emerald-300 max-h-32 overflow-y-auto custom-scroll">
                  {item.promptText?.slice(0, 500)}{item.promptText?.length > 500 ? '...' : ''}
                </pre>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[9px] border-purple-400/40 text-purple-300">{item.category}</Badge>
                  <span className="text-[10px] text-purple-200/60">{item.usageCount || 0} 次使用</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="glass-card-dark border-sky-400/20 rounded-lg p-4">
        <p className="text-sky-300 text-xs font-semibold mb-2">💰 变现模式</p>
        <p className="text-purple-100/75 text-xs leading-relaxed">
          PromptBase 验证模式：单个 Prompt 售价 $2-10，创作者得 80% 分成，顶级卖家月收入 $500-3000。
          本平台支持：免费分享（引流）+ 付费精品（$5-20）+ 订阅会员（$19/月无限下载）。
          内容创作成本极低，关键在场景覆盖度与质量。
        </p>
      </div>
    </div>
  );
}
