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
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, Moon, Star, Sun, Gem, BookOpen, Heart, Users,
  Loader2, Calendar, Hash, Ghost,
  LayoutGrid, MessageSquareCode, ArrowRight, ThumbsUp, ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLocale } from '@/components/locale-provider';

type Module =
  | 'daily' | 'astrology' | 'tarot' | 'dream' | 'bazi' | 'memorial' | 'genealogy'
  | 'storybook' | 'promptGenerator' | 'directoryDescribe';

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
      toast({ title: '✨ 生成完成' });
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
// AI 结果渲染
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

// 用户档案（出生信息）
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
    toast({ title: '档案已保存' });
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, profile: form }),
    }).catch(() => {});
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
                {user.birthDate ? `出生 ${user.birthDate} ${user.birthTime || ''}` : '未填写出生信息'}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10" onClick={() => setEditing(!editing)}>
            {editing ? '取消' : '编辑档案'}
          </Button>
        </div>
      </CardHeader>
      {editing && (
        <CardContent className="space-y-3 pt-2 border-t border-gold/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs">姓名</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">出生日期</Label>
              <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">出生时间</Label>
              <Input type="time" value={form.birthTime} onChange={(e) => setForm({ ...form, birthTime: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">出生地点</Label>
              <Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">性别</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="bg-white/5 border-gold/30 text-white"><SelectValue placeholder="选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            <Sparkles className="w-4 h-4 mr-2" /> 保存档案
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────
// 赛道 1：灵性陪伴（7 子模块）
// ─────────────────────────────────────────────
export function MysticTrack() {
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

function DailyModule() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [focus, setFocus] = useState('');
  const today = new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Sun className="w-5 h-5" />} title="今日能量报告" subtitle={`今天是 ${today}`} />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="今日关注（可选）" className="bg-white/5 border-gold/30 text-white" />
          <Button onClick={() => call('daily', { birthDate: user?.birthDate, sunSign: user?.birthDate, focus })} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
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

function AstrologyModule() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Star className="w-5 h-5" />} title="AI 占星本命盘解读" subtitle="输入出生信息 · AI 深度解读" />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          {user?.birthDate ? (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-purple-100">{user.birthDate} {user.birthTime || ''} {user.birthPlace || ''}</span>
              <Badge variant="outline" className="border-gold/40 text-gold">{metadata?.sunSign || '太阳星座待计算'}</Badge>
            </div>
          ) : <p className="text-purple-200/70 text-sm">请先编辑档案填写出生日期</p>}
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="想了解的问题（可选）" className="bg-white/5 border-gold/30 text-white min-h-[80px]" />
          <Button onClick={() => call('astrology', { birthDate: user?.birthDate || '1995-01-01', birthTime: user?.birthTime || '', birthPlace: user?.birthPlace || '', gender: user?.gender || '', question })} disabled={loading || !user?.birthDate} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />} 解读本命盘
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

function TarotModule() {
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState(3);
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Gem className="w-5 h-5" />} title="AI 塔罗占卜" subtitle="抽牌 · AI 深度解读" />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="你的问题" className="bg-white/5 border-gold/30 text-white min-h-[80px]" />
          <Select value={String(cardCount)} onValueChange={(v) => setCardCount(Number(v))}>
            <SelectTrigger className="bg-white/5 border-gold/30 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 张</SelectItem>
              <SelectItem value="5">5 张</SelectItem>
              <SelectItem value="7">7 张</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => call('tarot', { question, cardCount })} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} 抽牌占卜
          </Button>
        </CardContent>
      </Card>
      {metadata?.cards && (
        <Card className="glass-card-dark border-gold/30">
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metadata.cards.map((c: any, i: number) => (
                <div key={i} className="bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border border-gold/30 rounded-lg p-3 animate-card-flip" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-gold border-gold/40 text-xs">{c.position}</Badge>
                    {c.reversed && <Badge variant="outline" className="text-red-300 border-red-300/40 text-xs">逆位</Badge>}
                  </div>
                  <div className="text-2xl text-center my-2 text-gold font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>{c.card.symbol}</div>
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

function DreamModule() {
  const { loading, result, call } = useMysticCall();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [framework, setFramework] = useState('jungian');
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Moon className="w-5 h-5" />} title="AI 解梦日记" subtitle="记录梦境 · AI 多框架解读" />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="梦境标题" className="bg-white/5 border-gold/30 text-white" />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="梦境内容" className="bg-white/5 border-gold/30 text-white min-h-[120px]" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-white/5 border-gold/30 text-white"><SelectValue placeholder="情绪" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">平静</SelectItem>
                <SelectItem value="joy">喜悦</SelectItem>
                <SelectItem value="fear">恐惧</SelectItem>
                <SelectItem value="anxious">焦虑</SelectItem>
                <SelectItem value="sad">悲伤</SelectItem>
              </SelectContent>
            </Select>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger className="bg-white/5 border-gold/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jungian">荣格原型</SelectItem>
                <SelectItem value="freudian">弗洛伊德</SelectItem>
                <SelectItem value="gestalt">格式塔</SelectItem>
                <SelectItem value="spiritual">灵性视角</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => call('dream', { title, content, mood, framework })} disabled={loading || !title || !content} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Moon className="w-4 h-4 mr-2" />} 解读梦境
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

function BaziModule() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Hash className="w-5 h-5" />} title="AI 命理八字" subtitle="天干地支 · 五行生克" />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          {user?.birthDate ? (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-purple-100">{user.birthDate} {user.birthTime || ''}</span>
              {metadata?.dayMaster && <Badge variant="outline" className="border-gold/40 text-gold">日主：{metadata.dayMaster}</Badge>}
            </div>
          ) : <p className="text-purple-200/70 text-sm">请先编辑档案填写出生日期</p>}
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="想了解（可选）" className="bg-white/5 border-gold/30 text-white" />
          <Button onClick={() => call('bazi', { birthDate: user?.birthDate || '1995-01-01', birthTime: user?.birthTime || '', gender: user?.gender || '', question })} disabled={loading || !user?.birthDate} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />} 解读命盘
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

function MemorialModule() {
  const { loading, result, call } = useMysticCall();
  const [form, setForm] = useState({ personName: '', relationship: '', personality: '', memories: '', userFeeling: '' });
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Ghost className="w-5 h-5" />} title="AI 数字纪念" subtitle="为逝者撰写传记" />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} placeholder="纪念对象姓名" className="bg-white/5 border-gold/30 text-white" />
            <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
              <SelectTrigger className="bg-white/5 border-gold/30 text-white"><SelectValue placeholder="关系" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="grandparent">祖父母</SelectItem>
                <SelectItem value="parent">父母</SelectItem>
                <SelectItem value="spouse">配偶</SelectItem>
                <SelectItem value="friend">朋友</SelectItem>
                <SelectItem value="pet">宠物</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} placeholder="性格特点" className="bg-white/5 border-gold/30 text-white min-h-[80px]" />
          <Textarea value={form.memories} onChange={(e) => setForm({ ...form, memories: e.target.value })} placeholder="美好回忆" className="bg-white/5 border-gold/30 text-white min-h-[100px]" />
          <Input value={form.userFeeling} onChange={(e) => setForm({ ...form, userFeeling: e.target.value })} placeholder="你想对TA说的话" className="bg-white/5 border-gold/30 text-white" />
          <Button onClick={() => call('memorial', form)} disabled={loading || !form.personName} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />} 撰写纪念
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

function GenealogyModule() {
  const { loading, result, call } = useMysticCall();
  const [form, setForm] = useState({ familyName: '', members: '', origins: '', traditions: '', focus: '' });
  return (
    <div className="space-y-4">
      <ModuleHeader icon={<Users className="w-5 h-5" />} title="AI 家谱故事" subtitle="家族叙事" />
      <Card className="glass-card-dark border-gold/30">
        <CardContent className="pt-6 space-y-4">
          <Input value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })} placeholder="家族姓氏" className="bg-white/5 border-gold/30 text-white" />
          <Textarea value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} placeholder="已知家族成员" className="bg-white/5 border-gold/30 text-white min-h-[100px]" />
          <Textarea value={form.origins} onChange={(e) => setForm({ ...form, origins: e.target.value })} placeholder="家族起源" className="bg-white/5 border-gold/30 text-white min-h-[80px]" />
          <Textarea value={form.traditions} onChange={(e) => setForm({ ...form, traditions: e.target.value })} placeholder="家族传统" className="bg-white/5 border-gold/30 text-white min-h-[80px]" />
          <Button onClick={() => call('genealogy', form)} disabled={loading || !form.familyName} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />} 撰写家族故事
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 赛道 2：AI 儿童故事书
// ─────────────────────────────────────────────
export function StorybookTrack() {
  const { loading, result, call } = useMysticCall();
  const [form, setForm] = useState({ childName: '', childAge: '5', theme: 'brave', artStyle: 'watercolor', specialRequest: '' });
  return (
    <div className="space-y-6">
      <ModuleHeader icon={<BookOpen className="w-5 h-5" />} title="AI 个性化儿童故事书" subtitle="输入孩子信息 · AI 生成专属故事" />
      <Card className="glass-card-dark border-rose-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} placeholder="主角名字" className="bg-white/5 border-rose-400/30 text-white" />
            <Select value={form.childAge} onValueChange={(v) => setForm({ ...form, childAge: v })}>
              <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => <SelectItem key={age} value={String(age)}>{age} 岁</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={form.theme} onValueChange={(v) => setForm({ ...form, theme: v })}>
              <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brave">勇敢面对困难</SelectItem>
                <SelectItem value="friendship">友谊与分享</SelectItem>
                <SelectItem value="sleep">温馨睡前故事</SelectItem>
                <SelectItem value="explore">探索未知世界</SelectItem>
                <SelectItem value="growth">成长与独立</SelectItem>
                <SelectItem value="magic">奇幻冒险</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.artStyle} onValueChange={(v) => setForm({ ...form, artStyle: v })}>
              <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="watercolor">水彩画风</SelectItem>
                <SelectItem value="cartoon">卡通风格</SelectItem>
                <SelectItem value="pixar">皮克斯 3D</SelectItem>
                <SelectItem value="anime">日系动漫</SelectItem>
                <SelectItem value="picturebook">经典绘本</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} placeholder="特殊要求（可选）" className="bg-white/5 border-rose-400/30 text-white" />
          <Button onClick={() => call('storybook', form)} disabled={loading || !form.childName} className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />} 为 {form.childName || '孩子'} 创作
          </Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3">
          <p className="text-rose-300 text-xs font-semibold mb-1">💰 客单价</p>
          <p className="text-purple-100/80 text-xs">电子版 $25-40 / 实体书 $50-80</p>
        </div>
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3">
          <p className="text-rose-300 text-xs font-semibold mb-1">📊 验证案例</p>
          <p className="text-purple-100/80 text-xs">DreamStories.ai $6M ARR</p>
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
export function DirectoryTrack() {
  const { user } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'free' });
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?type=directory&category=${category}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {} finally { setLoading(false); }
  }, [category]);
  useEffect(() => { loadItems(); }, [loadItems]);
  const upvote = async (id: string) => {
    await fetch('/api/directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'directory', action: 'upvote', payload: { id } }) });
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, upvotes: it.upvotes + 1 } : it));
  };
  const submit = async () => {
    if (!submitForm.name || !submitForm.url) { toast({ title: '请填写完整', variant: 'destructive' }); return; }
    const res = await fetch('/api/directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'directory', action: 'create', payload: { ...submitForm, userId: user?.userId } }) });
    if (res.ok) {
      toast({ title: '✅ 提交成功' });
      setSubmitForm({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'free' });
      setShowSubmit(false); loadItems();
    }
  };
  const categories = [
    { id: 'all', name: '全部' }, { id: 'ai-tool', name: 'AI 工具' },
    { id: 'ai-agent', name: 'AI Agent' }, { id: 'saas', name: 'SaaS' },
    { id: 'newsletter', name: 'Newsletter' }, { id: 'resource', name: '资源' },
  ];
  return (
    <div className="space-y-6">
      <ModuleHeader icon={<LayoutGrid className="w-5 h-5" />} title="AI 工具目录站" subtitle="收录优质 AI 工具 · 程序化 SEO · 被动收入" />
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${category === c.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-purple-200/70 hover:bg-emerald-600/20 hover:text-emerald-300'}`}>
            {c.name}
          </button>
        ))}
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setShowSubmit(!showSubmit)} className="border-emerald-400/40 text-emerald-300 hover:bg-emerald-600/20 text-xs">+ 提交工具</Button>
      </div>
      {showSubmit && (
        <Card className="glass-card-dark border-emerald-400/30">
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input value={submitForm.name} onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })} placeholder="工具名" className="bg-white/5 border-emerald-400/30 text-white" />
              <Input value={submitForm.url} onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })} placeholder="https://..." className="bg-white/5 border-emerald-400/30 text-white" />
            </div>
            <Input value={submitForm.description} onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })} placeholder="一句话描述" className="bg-white/5 border-emerald-400/30 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={submitForm.category} onValueChange={(v) => setSubmitForm({ ...submitForm, category: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-tool">AI 工具</SelectItem>
                  <SelectItem value="ai-agent">AI Agent</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="resource">资源</SelectItem>
                </SelectContent>
              </Select>
              <Select value={submitForm.pricing} onValueChange={(v) => setSubmitForm({ ...submitForm, pricing: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">免费</SelectItem>
                  <SelectItem value="freemium">免费+付费</SelectItem>
                  <SelectItem value="paid">付费</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submit} className="w-full bg-emerald-600 text-white hover:bg-emerald-500">提交</Button>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-full text-center py-12"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-purple-200/70 text-sm">暂无工具，欢迎提交第一个！</div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="glass-card-dark border-emerald-400/20 hover:border-emerald-400/50 transition-all">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-emerald-200 flex items-center gap-1">{item.name}<ExternalLink className="w-3 h-3 opacity-50" /></h3>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-purple-300/50 text-[10px] hover:text-emerald-300 truncate block">{item.url}</a>
                  </div>
                  {item.isFeatured && <Badge className="bg-amber-500 text-black text-[9px] px-1.5">置顶</Badge>}
                </div>
                <p className="text-purple-100/75 text-xs leading-relaxed mb-3 line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-300">{item.category}</Badge>
                    {item.pricing && <Badge variant="outline" className="text-[9px] border-purple-400/40 text-purple-300">{item.pricing}</Badge>}
                  </div>
                  <button onClick={() => upvote(item.id)} className="flex items-center gap-1 text-[10px] text-purple-200/70 hover:text-emerald-300">
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
          收入来源：赞助位、高级筛选、API 访问、Newsletter 推广。
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 赛道 4：AI Prompt 库
// ─────────────────────────────────────────────
export function PromptsTrack() {
  const { user } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [genForm, setGenForm] = useState({ purpose: '', model: 'ChatGPT', scene: '', style: '专业' });
  const { loading: aiLoading, result: aiResult, call } = useMysticCall();
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?type=prompts&category=${category}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {} finally { setLoading(false); }
  }, [category]);
  useEffect(() => { loadItems(); }, [loadItems]);
  const categories = [
    { id: 'all', name: '全部' }, { id: 'writing', name: '写作' },
    { id: 'image', name: '绘图' }, { id: 'business', name: '商业' },
    { id: 'coding', name: '编程' }, { id: 'marketing', name: '营销' },
    { id: 'personal', name: '个人成长' },
  ];
  const handleGenerate = () => {
    if (!genForm.purpose) { toast({ title: '请填写 Prompt 用途', variant: 'destructive' }); return; }
    call('promptGenerator' as Module, genForm);
  };
  return (
    <div className="space-y-6">
      <ModuleHeader icon={<MessageSquareCode className="w-5 h-5" />} title="AI Prompt 库" subtitle="生成 · 收藏 · 分享 · 变现" />
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${category === c.id ? 'bg-sky-600 text-white' : 'bg-white/5 text-purple-200/70 hover:bg-sky-600/20 hover:text-sky-300'}`}>
            {c.name}
          </button>
        ))}
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowGenerator(!showGenerator)} className="bg-sky-600 text-white hover:bg-sky-500 text-xs">
          <Sparkles className="w-3 h-3 mr-1" /> AI 生成 Prompt
        </Button>
      </div>
      {showGenerator && (
        <Card className="glass-card-dark border-sky-400/30">
          <CardContent className="space-y-3 pt-4">
            <Input value={genForm.purpose} onChange={(e) => setGenForm({ ...genForm, purpose: e.target.value })} placeholder="Prompt 用途：如撰写小红书种草笔记" className="bg-white/5 border-sky-400/30 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={genForm.model} onValueChange={(v) => setGenForm({ ...genForm, model: v })}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                  <SelectItem value="Claude">Claude</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                  <SelectItem value="Midjourney">Midjourney</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genForm.style} onValueChange={(v) => setGenForm({ ...genForm, style: v })}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="专业">专业</SelectItem>
                  <SelectItem value="简洁">简洁</SelectItem>
                  <SelectItem value="详细">详细</SelectItem>
                  <SelectItem value="创意">创意</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input value={genForm.scene} onChange={(e) => setGenForm({ ...genForm, scene: e.target.value })} placeholder="具体场景（可选）" className="bg-white/5 border-sky-400/30 text-white" />
            <Button onClick={handleGenerate} disabled={aiLoading} className="w-full bg-sky-600 text-white hover:bg-sky-500">
              {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} 生成 Prompt
            </Button>
          </CardContent>
        </Card>
      )}
      {aiResult && <AIResult result={aiResult} loading={false} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-full text-center py-12"><Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-purple-200/70 text-sm">暂无公开 Prompt，点击"AI 生成 Prompt"创建第一个！</div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="glass-card-dark border-sky-400/20 hover:border-sky-400/50 transition-all">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-sky-200">{item.title}</h3>
                  <Badge variant="outline" className="text-[9px] border-sky-400/40 text-sky-300">{item.model}</Badge>
                </div>
                {item.description && <p className="text-purple-100/70 text-xs mb-2">{item.description}</p>}
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
          PromptBase 验证模式：单个 Prompt 售价 $2-10，创作者得 80% 分成，顶级卖家月入 $500-3000。
          本平台支持：免费分享 + 付费精品 + 订阅会员。
        </p>
      </div>
    </div>
  );
}
