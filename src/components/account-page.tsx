'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/session';
import { useLocale } from '@/components/locale-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  History, Heart, CreditCard, Settings, Loader2, Sparkles, Crown, LogOut, Mail, Calendar,
} from 'lucide-react';

export function AccountPage() {
  const { user, logout } = useSession();
  const { t } = useLocale();
  const { toast } = useToast();
  const [tab, setTab] = useState('history');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 聚合所有历史记录类型
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
      setItems(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'history' || tab === 'favorites') loadHistory();
  }, [tab, user]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    logout();
    toast({ title: '已退出登录' });
  };

  if (!user) return null;

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
      {/* 用户卡片 */}
      <Card className="glass-card-dark border-gold/40">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
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
              {user.trialEndsAt && user.plan === 'free' && (
                <p className="text-purple-200/60 text-xs flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> 试用至 {new Date(user.trialEndsAt).toLocaleDateString('zh-CN')}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-rose-400/40 text-rose-300 hover:bg-rose-500/10">
              <LogOut className="w-3 h-3 mr-1" /> 退出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-gold/20 p-1 rounded-xl">
          <TabsTrigger value="history" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            <History className="w-3 h-3 mr-1" />历史
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            <Heart className="w-3 h-3 mr-1" />收藏
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            <CreditCard className="w-3 h-3 mr-1" />账单
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">
            <Settings className="w-3 h-3 mr-1" />设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-purple-300/50 mx-auto mb-3" />
              <p className="text-purple-200/70 text-sm">还没有历史记录，去试试生成第一个吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
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
                      <Button size="sm" variant="ghost" className="text-purple-300/70 hover:text-rose-300 shrink-0 p-1">
                        <Heart className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <div className="text-center py-12">
            <Heart className="w-10 h-10 text-purple-300/50 mx-auto mb-3" />
            <p className="text-purple-200/70 text-sm">收藏夹功能正在开发中</p>
            <p className="text-purple-300/40 text-xs mt-1">在历史记录中点 ♥ 即可收藏</p>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="glass-card-dark border-gold/30">
            <CardHeader><CardTitle className="text-base text-gold">当前订阅</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">当前方案</span>
                <Badge className={user.plan === 'premium' ? 'bg-amber-500 text-black' : user.plan === 'pro' ? 'bg-sky-500 text-white' : 'bg-purple-500/30 text-purple-200'}>
                  {user.plan === 'premium' ? 'PREMIUM' : user.plan === 'pro' ? 'PRO' : 'FREE'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-200/80 text-sm">状态</span>
                <span className="text-emerald-300 text-xs">{user.subStatus || '活跃'}</span>
              </div>
              {user.currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-purple-200/80 text-sm">下次续费</span>
                  <span className="text-purple-100 text-xs">{new Date(user.currentPeriodEnd).toLocaleDateString('zh-CN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gold/20 text-center">
                <p className="text-purple-300/60 text-xs">
                  {user.plan === 'free' ? '升级解锁无限 AI 生成 + 全部 8 赛道' : '感谢你的支持 ❤️'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-4">
          <Card className="glass-card-dark border-gold/30">
            <CardHeader><CardTitle className="text-base text-gold">偏好设置</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">语言 / Language</p>
                  <p className="text-xs text-purple-300/60">{user.locale || 'zh'}</p>
                </div>
                <span className="text-xs text-gold">在顶部导航栏切换</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gold/20">
                <div>
                  <p className="text-sm text-purple-100">账户类型</p>
                  <p className="text-xs text-purple-300/60">{user.isAuthed ? '邮箱注册用户' : '匿名用户'}</p>
                </div>
                {!user.isAuthed && (
                  <Button size="sm" variant="outline" className="border-gold/40 text-gold text-xs">
                    <Mail className="w-3 h-3 mr-1" /> 注册保存数据
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
