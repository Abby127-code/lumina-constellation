'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  History, Heart, CreditCard, Settings, Loader2, Sparkles, Crown, LogOut, Mail, Calendar,
  Flame, Trophy, Gift, Copy, Check, Share2,
} from 'lucide-react';

interface UserStats {
  streak: { current: number; max: number; totalDays: number };
  achievements: number;
  achievementList: any[];
  unreadNotifications: number;
  favorites: number;
  totalReadings: number;
  plan: string;
  theme: string;
  referralCode?: string;
}

export function AccountPage() {
  const { user, logout } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-stats', userId: user.userId }),
      });
      const data = await res.json();
      setStats(data);
    } catch {}
  }, [user]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const [readings, dreams, storybooks, prompts, memorials, genealogies, caregivers] = await Promise.all([
        fetch(`/api/user/data?type=readings&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/api/user/data?type=dreams&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/api/user/data?type=storybooks&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/api/user/data?type=prompts&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/api/user/data?type=memorials&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/api/user/data?type=genealogies&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch(`/api/user/data?type=caregivers&userId=${user.userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
      ]);
      const all = [
        ...(readings.items || []).map((r: any) => ({ ...r, kind: 'reading', title: r.question || r.type, content: r.result, date: r.createdAt })),
        ...(dreams.items || []).map((r: any) => ({ ...r, kind: 'dream', title: r.title, content: r.interpretation, date: r.createdAt })),
        ...(storybooks.items || []).map((r: any) => ({ ...r, kind: 'storybook', title: r.storyTitle || `${r.childName}的故事`, content: r.storyText, date: r.createdAt })),
        ...(prompts.items || []).map((r: any) => ({ ...r, kind: 'prompt', title: r.title, content: r.promptText, date: r.createdAt })),
        ...(memorials.items || []).map((r: any) => ({ ...r, kind: 'memorial', title: r.personName, content: r.biography, date: r.createdAt })),
        ...(genealogies.items || []).map((r: any) => ({ ...r, kind: 'genealogy', title: r.familyName, content: r.narrative, date: r.createdAt })),
        ...(caregivers.items || []).map((r: any) => ({ ...r, kind: 'caregiver', title: r.title, content: r.aiAdvice, date: r.createdAt })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(all);
    } catch (e) { console.error(e); }
  }, [user]);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-favorites', userId: user.userId }),
      });
      const data = await res.json();
      setFavorites(data.items || []);
    } catch {}
  }, [user]);

  const loadReferral = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-referral', userId: user.userId }),
      });
      const data = await res.json();
      setReferral(data);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
      const t = setTimeout(() => {
        setLoading(true);
        Promise.all([loadStats(), loadHistory(), loadFavorites(), loadReferral()]).finally(() => setLoading(false));
      }, 0);
      return () => clearTimeout(t);
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    logout();
    toast({ title: '已退出登录' });
  };

  const toggleFavorite = async (item: any) => {
    if (!user) return;
    try {
      const res = await fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-favorite',
          userId: user.userId,
          itemType: item.kind,
          itemId: item.id,
          title: item.title,
          preview: item.content,
        }),
      });
      const data = await res.json();
      toast({ title: data.favorited ? '✅ 已收藏' : '已取消收藏' });
      loadFavorites();
      loadStats();
    } catch {}
  };

  if (!user) return null;
  if (loading || !stats) return (
    <div className="text-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" /></div>
  );

  const kindLabel: Record<string, { label: string; color: string }> = {
    reading: { label: '占卜', color: 'bg-amber-500/20 text-amber-300' },
    dream: { label: '解梦', color: 'bg-purple-500/20 text-purple-300' },
    storybook: { label: '故事书', color: 'bg-rose-500/20 text-rose-300' },
    prompt: { label: 'Prompt', color: 'bg-sky-500/20 text-sky-300' },
    memorial: { label: '纪念', color: 'bg-indigo-500/20 text-indigo-300' },
    genealogy: { label: '家谱', color: 'bg-yellow-500/20 text-yellow-300' },
    caregiver: { label: '照护', color: 'bg-pink-500/20 text-pink-300' },
  };

  return (
    <div className="space-y-6">
      {/* 用户卡片 + Stats */}
      <Card className="glass-card-dark border-gold/40">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {(user.name || user.email || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gold flex items-center gap-2">
                {user.name || user.email?.split('@')[0] || 'Lumina 旅人'}
                {user.plan !== 'free' && (
                  <Badge className={user.plan === 'premium' ? 'bg-amber-500 text-black' : 'bg-sky-500 text-white'}>
                    <Crown className="w-3 h-3 mr-1" /> {user.plan.toUpperCase()}
                  </Badge>
                )}
              </h2>
              {user.email && (
                <p className="text-purple-200/70 text-sm flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" /> {user.email}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-rose-400/40 text-rose-300 hover:bg-rose-500/10">
              <LogOut className="w-3 h-3 mr-1" /> 退出
            </Button>
          </div>
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Flame className="w-4 h-4 text-orange-400 mx-auto" />
              <p className="text-amber-200 text-base font-bold mt-1">{stats.streak.current}</p>
              <p className="text-purple-300/60 text-[9px]">连续天数</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Trophy className="w-4 h-4 text-amber-300 mx-auto" />
              <p className="text-amber-200 text-base font-bold mt-1">{stats.achievements}</p>
              <p className="text-purple-300/60 text-[9px]">成就</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Sparkles className="w-4 h-4 text-purple-300 mx-auto" />
              <p className="text-amber-200 text-base font-bold mt-1">{stats.totalReadings}</p>
              <p className="text-purple-300/60 text-[9px]">总生成</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Heart className="w-4 h-4 text-rose-300 mx-auto" />
              <p className="text-amber-200 text-base font-bold mt-1">{stats.favorites}</p>
              <p className="text-purple-300/60 text-[9px]">收藏</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-gold/20 p-1 rounded-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            概览
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            历史
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            成就
          </TabsTrigger>
          <TabsTrigger value="referral" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            推荐
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            设置
          </TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="glass-card-dark border-orange-400/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-xs font-semibold">连续打卡</span>
                </div>
                <p className="text-2xl font-bold text-amber-200">{stats.streak.current} 天</p>
                <p className="text-purple-200/60 text-[10px] mt-1">最长 {stats.streak.max} 天 · 累计 {stats.streak.totalDays} 天</p>
              </CardContent>
            </Card>
            <Card className="glass-card-dark border-amber-400/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-300 text-xs font-semibold">成就解锁</span>
                </div>
                <p className="text-2xl font-bold text-amber-200">{stats.achievements} / 10</p>
                <p className="text-purple-200/60 text-[10px] mt-1">继续使用解锁更多</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 历史 */}
        <TabsContent value="history" className="mt-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-purple-300/50 mx-auto mb-3" />
              <p className="text-purple-200/70 text-sm">还没有历史记录，去试试生成第一个吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id} className="glass-card-dark border-gold/20 hover:border-gold/40 transition-all">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[9px] ${kindLabel[item.kind]?.color || 'bg-purple-500/20 text-purple-300'}`}>
                            {kindLabel[item.kind]?.label || item.kind}
                          </Badge>
                          <span className="text-[10px] text-purple-300/60">
                            {new Date(item.date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="text-sm text-gold truncate">{item.title || '(无标题)'}</h4>
                        <p className="text-purple-100/70 text-xs line-clamp-2 mt-1">
                          {item.content?.slice(0, 150)?.replace(/[#*`]/g, '')}...
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(item)}
                        className="text-purple-300/70 hover:text-rose-300 shrink-0 p-1"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 成就 */}
        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { type: 'first_reading', title: '初次探索', desc: '第一次 AI 生成', icon: '🌟' },
              { type: 'streak_7', title: '一周坚持', desc: '连续 7 天', icon: '🔥' },
              { type: 'streak_30', title: '月度修行', desc: '连续 30 天', icon: '🌙' },
              { type: 'pro_upgrade', title: '支持者', desc: '升级付费', icon: '👑' },
              { type: 'readings_100', title: '资深旅人', desc: '100 次生成', icon: '✨' },
              { type: 'shared_content', title: '传播者', desc: '分享内容', icon: '💫' },
              { type: 'early_adopter', title: '早期用户', desc: '首月注册', icon: '🚀' },
              { type: 'referral_first', title: '布道者', desc: '推荐首位好友', icon: '🎁' },
              { type: 'polyglot', title: '多语言者', desc: '3+ 种语言', icon: '🌍' },
              { type: 'all_tracks', title: '全能探索', desc: '体验 10 赛道', icon: '🌈' },
            ].map((a) => {
              const unlocked = stats.achievementList.find((x: any) => x.type === a.type);
              return (
                <Card key={a.type} className={`glass-card-dark ${unlocked ? 'border-amber-400/50' : 'border-purple-400/10 opacity-50'} text-center`}>
                  <CardContent className="pt-4 pb-3">
                    <div className={`text-3xl mb-1 ${unlocked ? '' : 'grayscale'}`}>{a.icon}</div>
                    <p className={`text-xs font-semibold ${unlocked ? 'text-amber-300' : 'text-purple-300/60'}`}>{a.title}</p>
                    <p className="text-[9px] text-purple-300/50 mt-0.5">{a.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 推荐返佣 */}
        <TabsContent value="referral" className="mt-6 space-y-4">
          {referral && (
            <>
              <Card className="glass-card-dark border-emerald-400/30">
                <CardHeader><CardTitle className="text-base text-emerald-300 flex items-center gap-2">
                  <Gift className="w-4 h-4" /> 推荐计划 · 30% 返佣
                </CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-purple-100/80 text-xs">分享你的专属推荐链接，好友升级付费后你将获得 30% 返佣（永久有效）</p>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-purple-300/60 text-[10px] mb-1">推荐码</p>
                    <div className="flex items-center gap-2">
                      <code className="text-emerald-300 text-sm flex-1">{referral.code}</code>
                      <CopyButton text={referral.code} />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-purple-300/60 text-[10px] mb-1">推荐链接</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sky-300 text-xs flex-1 truncate">{referral.link}</code>
                      <CopyButton text={referral.link} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card-dark border-emerald-400/20 rounded-lg p-3 text-center">
                  <p className="text-emerald-300 text-2xl font-bold">{referral.totalReferrals}</p>
                  <p className="text-purple-300/60 text-[10px]">总推荐</p>
                </div>
                <div className="glass-card-dark border-emerald-400/20 rounded-lg p-3 text-center">
                  <p className="text-emerald-300 text-2xl font-bold">{referral.completedReferrals}</p>
                  <p className="text-purple-300/60 text-[10px]">已完成</p>
                </div>
                <div className="glass-card-dark border-amber-400/20 rounded-lg p-3 text-center">
                  <p className="text-amber-300 text-2xl font-bold">${referral.totalReward.toFixed(2)}</p>
                  <p className="text-purple-300/60 text-[10px]">返佣收入</p>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* 设置 */}
        <TabsContent value="settings" className="mt-6 space-y-4">
          <Card className="glass-card-dark border-gold/30">
            <CardHeader><CardTitle className="text-base text-gold">账户信息</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">邮箱</span>
                <span className="text-purple-100 text-xs">{user.email || '未绑定'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">语言</span>
                <span className="text-gold text-xs">{user.locale || 'zh'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">订阅</span>
                <Badge className={user.plan === 'premium' ? 'bg-amber-500 text-black' : user.plan === 'pro' ? 'bg-sky-500 text-white' : 'bg-purple-500/30 text-purple-200'}>
                  {user.plan === 'premium' ? 'PREMIUM' : user.plan === 'pro' ? 'PRO' : 'FREE'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">总使用次数</span>
                <span className="text-purple-100 text-xs">{stats.totalReadings}</span>
              </div>
              {user.trialEndsAt && user.plan === 'free' && (
                <div className="flex items-center justify-between">
                  <span className="text-purple-200/80 text-sm">试用至</span>
                  <span className="text-purple-100 text-xs">{new Date(user.trialEndsAt).toLocaleDateString('zh-CN')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
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
    <Button size="sm" variant="ghost" onClick={copy} className="text-purple-200/70 hover:text-gold text-xs p-1.5">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}
