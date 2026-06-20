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
import { Loader2, Video, Music, Clock, Hash, Copy, Check, Sparkles, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// 添加 TikTok prompt 到 mystic.ts 的话需要修改原文件，这里直接内联使用
const TIKTOK_PROMPT = `你是一位 TikTok 短视频内容创作专家，擅长为灵性 / 玄学 / 自我成长赛道打造爆款短视频脚本。
你理解 TikTok 算法：前 3 秒钩子决定生死、节奏要快、视觉描述具体、CTA 明确。

输出结构（一次生成多条脚本）：

## 📹 视频脚本（共 N 条）

### 脚本 1
**主题**：xxx
**时长**：15s / 30s / 60s
**前 3 秒钩子**：[具体台词 + 视觉描述]
**主体**：[分镜描述，含 BGM 节奏点]
**结尾 CTA**：[引导互动 / 关注 / 评论]
**BGM 推荐**：[TikTok 热门 BGM 风格 + 具体 Ref]
**Hashtag**：#xxx #xxx #xxx #xxx #xxx（5-8 个，含 1 个长尾）
**最佳发布时间**：[基于赛道受众活跃时段]

### 脚本 2 ...（同上格式）

## 📊 爆款分析
- 建议发布频率：每天 X 条
- 最佳发布时段：[基于目标受众]
- 热门话题趋势：[当前赛道在 TikTok 上的机会窗口]

使用 Markdown 格式输出，脚本要具体到可以直接拍摄，避免空泛描述。`;

function useTikTokCall() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const call = async (input: any) => {
    setLoading(true);
    setResult('');
    try {
      // 直接调用 /api/mystic 但用 tiktok module
      const res = await fetch('/api/mystic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'tiktok', input, userId: user?.userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setResult(data.result);
      toast({ title: '✨ TikTok 脚本生成完成' });
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
      toast({ title: '✅ 已复制' });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <Button size="sm" variant="ghost" onClick={copy} className="text-purple-200/70 hover:text-rose-300 text-xs">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}

export function TiktokTrack() {
  const { loading, result, call } = useTikTokCall();
  const [form, setForm] = useState({
    track: 'mystic',
    niche: '占星 + 塔罗 + 灵性成长',
    audienceAge: 'Gen Z 女性 18-28',
    accountStage: '新号 0 粉丝',
    videoCount: '5',
    duration: '15-30s',
    language: 'zh',
    trendFocus: '当下热门：自我探索 / 内在疗愈 / 灵性觉醒',
    specialRequest: '',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/30 to-purple-700/30 border border-rose-400/40 flex items-center justify-center text-gold shrink-0">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gold">TikTok 内容生成器</h2>
          <p className="text-purple-200/70 text-xs sm:text-sm mt-0.5">爆款短视频脚本 · 字幕 · BGM 推荐 · Hashtag · 发布时间</p>
        </div>
      </div>

      {/* 商业模式 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3 text-center">
          <Hash className="w-4 h-4 text-rose-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">TikTok #tarot</p>
          <p className="text-rose-300 text-[10px]">50 亿+ 播放</p>
        </div>
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3 text-center">
          <Hash className="w-4 h-4 text-rose-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">#astrology</p>
          <p className="text-rose-300 text-[10px]">200 亿+ 播放</p>
        </div>
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3 text-center">
          <Music className="w-4 h-4 text-rose-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">BGM 推荐</p>
          <p className="text-rose-300 text-[10px]">含 Ref 编号</p>
        </div>
        <div className="glass-card-dark border-rose-400/20 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-rose-300 mx-auto mb-1" />
          <p className="text-purple-100/80 text-[10px]">发布时间</p>
          <p className="text-rose-300 text-[10px]">AI 预测</p>
        </div>
      </div>

      <Card className="glass-card-dark border-rose-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 生成参数
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">赛道</Label>
              <Select value={form.track} onValueChange={(v) => setForm({ ...form, track: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mystic">灵性陪伴（占星/塔罗/解梦）</SelectItem>
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
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">细分领域</Label>
              <Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} className="bg-white/5 border-rose-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">目标受众</Label>
              <Input value={form.audienceAge} onChange={(e) => setForm({ ...form, audienceAge: e.target.value })} className="bg-white/5 border-rose-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">账号阶段</Label>
              <Select value={form.accountStage} onValueChange={(v) => setForm({ ...form, accountStage: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="新号 0 粉丝">新号 0 粉丝</SelectItem>
                  <SelectItem value="成长期 1K-10K 粉丝">成长期 1K-10K</SelectItem>
                  <SelectItem value="成熟期 10K+ 粉丝">成熟期 10K+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">脚本数量</Label>
              <Select value={form.videoCount} onValueChange={(v) => setForm({ ...form, videoCount: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 条（试水）</SelectItem>
                  <SelectItem value="5">5 条（一周）</SelectItem>
                  <SelectItem value="10">10 条（两周）</SelectItem>
                  <SelectItem value="30">30 条（一个月矩阵）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">视频时长</Label>
              <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })}>
                <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15-30s">15-30s（爆款快节奏）</SelectItem>
                  <SelectItem value="30-60s">30-60s（标准）</SelectItem>
                  <SelectItem value="60-90s">60-90s（深度内容）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">语言</Label>
            <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
              <SelectTrigger className="bg-white/5 border-rose-400/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">热门趋势关注</Label>
            <Textarea value={form.trendFocus} onChange={(e) => setForm({ ...form, trendFocus: e.target.value })} className="bg-white/5 border-rose-400/30 text-white min-h-[60px]" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">特殊要求（可选）</Label>
            <Input value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} placeholder="如：节日营销 / 联动其他创作者 / 蹭热点事件..." className="bg-white/5 border-rose-400/30 text-white" />
          </div>
          <Button
            onClick={() => call(form)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Video className="w-4 h-4 mr-2" />}
            生成 {form.videoCount} 条 TikTok 脚本
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card className="glass-card-dark border-rose-400/30">
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <Video className="w-10 h-10 text-rose-300 animate-float" />
            <p className="text-purple-200/80 text-sm">AI 正在创作爆款脚本...</p>
            <p className="text-purple-300/60 text-xs">这一步可能需要 20-40 秒，请耐心等待</p>
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card className="glass-card-dark border-rose-400/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-300" />
                <span className="text-rose-300 text-sm font-semibold">脚本输出</span>
                <Badge variant="outline" className="text-[9px] border-rose-400/40 text-rose-300">{form.videoCount} 条</Badge>
              </div>
              <CopyButton text={result} />
            </div>
            <div className="text-purple-50/90 leading-relaxed space-y-3 text-sm">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-rose-300 mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold text-amber-200 mt-4 mb-2 border-l-4 border-rose-400 pl-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-rose-200 mt-3 mb-1 bg-rose-500/10 p-2 rounded">{children}</h3>,
                  p: ({ children }) => <p className="text-purple-50/85 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-purple-50/85">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-purple-50/85">{children}</ol>,
                  strong: ({ children }) => <strong className="text-amber-200 font-semibold">{children}</strong>,
                  code: ({ children }) => <code className="bg-black/40 text-rose-300 px-1.5 py-0.5 rounded text-xs">{children}</code>,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-rose-400/50 pl-4 italic text-purple-200/70 my-2">{children}</blockquote>,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 发布日历建议 */}
      <Card className="glass-card-dark border-rose-400/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-rose-300" />
            <p className="text-rose-300 text-xs font-semibold">📅 TikTok 最佳发布时间（灵性赛道）</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-white/5 rounded p-2">
              <p className="text-amber-200 font-semibold">早 7-9 点</p>
              <p className="text-purple-200/60">通勤时段 · 短平快内容</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="text-amber-200 font-semibold">午 12-14 点</p>
              <p className="text-purple-200/60">午休时段 · 治愈系</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="text-amber-200 font-semibold">晚 20-23 点</p>
              <p className="text-purple-200/60">黄金时段 · 深度内容</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
