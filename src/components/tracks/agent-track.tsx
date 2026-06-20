'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, Sparkles, FileText, Share2, Mail, Bot, Copy, Check,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function useAICall() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const call = async (module: string, input: any) => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/mystic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, input, userId: user?.userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setResult(data.result);
      toast({ title: '✨ 生成完成' });
    } catch (e: any) {
      toast({ title: '调用失败', description: e?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, call, setResult };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: '✅ 已复制到剪贴板' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: '复制失败', variant: 'destructive' });
    }
  };
  return (
    <Button size="sm" variant="ghost" onClick={copy} className="text-purple-200/70 hover:text-gold text-xs">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}

function ResultPanel({ result, loading }: { result: string; loading: boolean }) {
  if (loading) {
    return (
      <Card className="glass-card-dark border-gold/30 mt-4">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <Sparkles className="w-10 h-10 text-gold animate-float" />
          <p className="text-purple-200/80 text-sm">AI Agent 正在创作...</p>
        </CardContent>
      </Card>
    );
  }
  if (!result) return null;
  return (
    <Card className="glass-card-dark border-gold/30 mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-end mb-3">
          <CopyButton text={result} />
        </div>
        <div className="text-purple-50/90 leading-relaxed space-y-3 text-sm">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold text-gold mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold text-amber-200 mt-4 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-amber-100 mt-3 mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-purple-50/85 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-purple-50/85">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-purple-50/85">{children}</ol>,
              strong: ({ children }) => <strong className="text-amber-200 font-semibold">{children}</strong>,
              code: ({ children }) => <code className="bg-black/40 text-emerald-300 px-1.5 py-0.5 rounded text-xs">{children}</code>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/50 pl-4 italic text-purple-200/70 my-2">{children}</blockquote>,
            }}
          >
            {result}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentTrack() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-700/30 border border-emerald-400/40 flex items-center justify-center text-gold shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gold">AI Agent 自动化运营</h2>
          <p className="text-purple-200/70 text-xs sm:text-sm mt-0.5">SEO 内容生成 · 社交媒体批量 · Newsletter 个性化 · 用户跟进自动化</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card-dark border-emerald-400/20 rounded-lg p-3 text-center">
          <FileText className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">SEO 内容</p>
          <p className="text-emerald-300 text-[10px]">每周 5-10 篇</p>
        </div>
        <div className="glass-card-dark border-sky-400/20 rounded-lg p-3 text-center">
          <Share2 className="w-4 h-4 text-sky-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">社交内容</p>
          <p className="text-sky-300 text-[10px]">每月 100+ 条</p>
        </div>
        <div className="glass-card-dark border-amber-400/20 rounded-lg p-3 text-center">
          <Mail className="w-4 h-4 text-amber-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">Newsletter</p>
          <p className="text-amber-300 text-[10px]">每日个性化</p>
        </div>
      </div>

      <Tabs defaultValue="seo">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-gold/20 p-1 rounded-xl">
          <TabsTrigger value="seo" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-purple-200/70 text-xs py-2">
            <FileText className="w-3 h-3 mr-1" />SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300 text-purple-200/70 text-xs py-2">
            <Share2 className="w-3 h-3 mr-1" />社交
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 text-purple-200/70 text-xs py-2">
            <Mail className="w-3 h-3 mr-1" />邮件
          </TabsTrigger>
          <TabsTrigger value="followup" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-purple-200/70 text-xs py-2">
            <Bot className="w-3 h-3 mr-1" />跟进
          </TabsTrigger>
        </TabsList>
        <TabsContent value="seo" className="mt-6"><SeoModule /></TabsContent>
        <TabsContent value="social" className="mt-6"><SocialModule /></TabsContent>
        <TabsContent value="newsletter" className="mt-6"><NewsletterModule /></TabsContent>
        <TabsContent value="followup" className="mt-6"><FollowupModule /></TabsContent>
      </Tabs>
    </div>
  );
}

function SeoModule() {
  const { loading, result, call } = useAICall();
  const [form, setForm] = useState({
    keyword: 'AI 占星本命盘解读',
    track: 'mystic',
    audience: '对灵性探索感兴趣的 25-40 岁女性',
    wordCount: '1500-2000 字',
    locale: 'zh',
    specialRequest: '',
  });
  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-emerald-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">主关键词</Label>
              <Input value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} className="bg-white/5 border-emerald-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">赛道</Label>
              <Select value={form.track} onValueChange={(v) => setForm({ ...form, track: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mystic">灵性陪伴</SelectItem>
                  <SelectItem value="storybook">儿童故事书</SelectItem>
                  <SelectItem value="directory">AI 目录站</SelectItem>
                  <SelectItem value="prompts">Prompt 库</SelectItem>
                  <SelectItem value="memorial">数字纪念</SelectItem>
                  <SelectItem value="caregiver">照护者</SelectItem>
                  <SelectItem value="genealogy">家谱</SelectItem>
                  <SelectItem value="microsaas">微 SaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">目标受众</Label>
            <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="bg-white/5 border-emerald-400/30 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">字数</Label>
              <Select value={form.wordCount} onValueChange={(v) => setForm({ ...form, wordCount: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="800-1200 字">短文 800-1200 字</SelectItem>
                  <SelectItem value="1500-2000 字">标准 1500-2000 字</SelectItem>
                  <SelectItem value="2500-3500 字">长文 2500-3500 字</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">语言</Label>
              <Select value={form.locale} onValueChange={(v) => setForm({ ...form, locale: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => call('seoBlog', form)} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            生成 SEO 博客
          </Button>
        </CardContent>
      </Card>
      <ResultPanel result={result} loading={loading} />
    </div>
  );
}

function SocialModule() {
  const { loading, result, call } = useAICall();
  const [form, setForm] = useState({
    track: 'mystic',
    theme: '今日运势 + 占星科普',
    audience: 'Gen Z 灵性爱好者',
    locale: 'zh',
    tone: '神秘奢华 · 温暖 · 富有洞察',
    notes: '',
  });
  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-sky-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">赛道</Label>
              <Select value={form.track} onValueChange={(v) => setForm({ ...form, track: v })}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mystic">灵性陪伴</SelectItem>
                  <SelectItem value="storybook">儿童故事书</SelectItem>
                  <SelectItem value="directory">AI 目录站</SelectItem>
                  <SelectItem value="prompts">Prompt 库</SelectItem>
                  <SelectItem value="caregiver">照护者</SelectItem>
                  <SelectItem value="microsaas">微 SaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">主题</Label>
              <Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className="bg-white/5 border-sky-400/30 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">目标受众</Label>
            <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="bg-white/5 border-sky-400/30 text-white" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">品牌调性</Label>
            <Input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className="bg-white/5 border-sky-400/30 text-white" />
          </div>
          <Button onClick={() => call('socialContent', form)} disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
            批量生成 30 天内容
          </Button>
          <p className="text-purple-300/60 text-[10px] text-center">将生成 TikTok×10 + Instagram×5 + Twitter×10 + LinkedIn×3 = 28 条内容</p>
        </CardContent>
      </Card>
      <ResultPanel result={result} loading={loading} />
    </div>
  );
}

function NewsletterModule() {
  const { user } = useSession();
  const { loading, result, call } = useAICall();
  const [focus, setFocus] = useState('');
  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-amber-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-purple-200/70">
            <Mail className="w-3 h-3 text-amber-300" />
            <span>用户：{user?.name || 'Lumina 旅人'} · {user?.birthDate || '未填出生信息'}</span>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">今日关注（可选）</Label>
            <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="如：工作压力 / 关系问题 / 灵性成长" className="bg-white/5 border-amber-400/30 text-white" />
          </div>
          <Button
            onClick={() => call('newsletter', {
              name: user?.name || 'Lumina 旅人',
              birthDate: user?.birthDate,
              focus,
            })}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            生成个性化 Newsletter
          </Button>
        </CardContent>
      </Card>
      <ResultPanel result={result} loading={loading} />
    </div>
  );
}

function FollowupModule() {
  const { loading, result, call } = useAICall();
  const [form, setForm] = useState({
    name: '小美',
    daysSinceSignup: '14',
    lastActiveDays: '3',
    totalUsage: '5',
    plan: 'free',
    lastAction: '生成塔罗占卜',
    riskSignals: '注册 14 天但仅使用 5 次，最近 3 天未活跃',
  });
  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-purple-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">用户姓名</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">注册天数</Label>
              <Input value={form.daysSinceSignup} onChange={(e) => setForm({ ...form, daysSinceSignup: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">最后活跃（天前）</Label>
              <Input value={form.lastActiveDays} onChange={(e) => setForm({ ...form, lastActiveDays: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">使用次数</Label>
              <Input value={form.totalUsage} onChange={(e) => setForm({ ...form, totalUsage: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">付费状态</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger className="bg-white/5 border-purple-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">上次行为</Label>
              <Input value={form.lastAction} onChange={(e) => setForm({ ...form, lastAction: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">风险信号</Label>
            <Textarea value={form.riskSignals} onChange={(e) => setForm({ ...form, riskSignals: e.target.value })} className="bg-white/5 border-purple-400/30 text-white min-h-[60px]" />
          </div>
          <Button onClick={() => call('agentFollowup', form)} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            生成跟进建议
          </Button>
        </CardContent>
      </Card>
      <ResultPanel result={result} loading={loading} />
    </div>
  );
}
