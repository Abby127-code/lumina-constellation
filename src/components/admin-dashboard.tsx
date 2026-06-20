'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, DollarSign, FileText, TrendingUp, Loader2, Crown, Sparkles, Gift,
} from 'lucide-react';

export function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin?type=overview').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin?type=users&limit=20').then((r) => r.json()).catch(() => ({ users: [] })),
      fetch('/api/admin?type=content&limit=10').then((r) => r.json()).catch(() => ({ readings: [], storybooks: [] })),
    ]).then(([s, u, c]) => {
      setStats(s);
      setUsers(u.users || []);
      setContent(c);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-rose-700/30 border border-amber-400/40 flex items-center justify-center text-gold shrink-0">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gold">后台仪表盘</h2>
          <p className="text-purple-200/70 text-xs sm:text-sm mt-0.5">用户 · 收入 · 内容 · 增长</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-gold/20 p-1 rounded-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">概览</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">用户</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2">内容</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Users className="w-4 h-4" />} label="总用户" value={stats.totalUsers || 0} sub={`+${stats.newUsers7d || 0} 7日内`} color="text-sky-300" />
            <StatCard icon={<Crown className="w-4 h-4" />} label="付费用户" value={stats.payingUsers || 0} sub={`转化 ${stats.conversionRate || 0}%`} color="text-amber-300" />
            <StatCard icon={<DollarSign className="w-4 h-4" />} label="预估 MRR" value={`$${stats.estimatedMRR || 0}`} sub={`Pro ${stats.proUsers || 0} · Prem ${stats.premiumUsers || 0}`} color="text-emerald-300" />
            <StatCard icon={<FileText className="w-4 h-4" />} label="总生成" value={stats.totalReadings || 0} sub={`+${stats.newReadings7d || 0} 7日内`} color="text-purple-300" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Sparkles className="w-4 h-4" />} label="故事书" value={stats.totalStorybooks || 0} color="text-rose-300" />
            <StatCard icon={<FileText className="w-4 h-4" />} label="Prompts" value={stats.totalPrompts || 0} color="text-sky-300" />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="目录条目" value={stats.totalDirectoryItems || 0} color="text-emerald-300" />
            <StatCard icon={<Gift className="w-4 h-4" />} label="推荐完成" value={stats.totalReferrals || 0} color="text-amber-300" />
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-center text-purple-200/60 text-sm py-8">暂无用户</p>
            ) : users.map((u) => (
              <Card key={u.id} className="glass-card-dark border-gold/20">
                <CardContent className="pt-3 pb-2 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gold truncate">{u.name || u.email || '匿名用户'}</p>
                    <p className="text-[10px] text-purple-300/60">{u.email || '无邮箱'} · {u.locale || 'zh'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-purple-300/60">{u.totalReadings} 次</span>
                    <Badge className={`text-[9px] ${u.plan === 'premium' ? 'bg-amber-500 text-black' : u.plan === 'pro' ? 'bg-sky-500 text-white' : 'bg-purple-500/30 text-purple-200'}`}>
                      {u.plan?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gold mb-2">最近 AI 生成</h3>
              <div className="space-y-2">
                {(content?.readings || []).slice(0, 10).map((r: any) => (
                  <Card key={r.id} className="glass-card-dark border-gold/20">
                    <CardContent className="pt-3 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-purple-100 truncate">{r.question || r.type}</p>
                          <p className="text-[10px] text-purple-300/60">{r.user?.name || '匿名'} · {new Date(r.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-gold/40 text-gold">{r.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm text-rose-300 mb-2">最近故事书</h3>
              <div className="space-y-2">
                {(content?.storybooks || []).slice(0, 5).map((s: any) => (
                  <Card key={s.id} className="glass-card-dark border-rose-400/20">
                    <CardContent className="pt-3 pb-2">
                      <p className="text-sm text-purple-100 truncate">{s.storyTitle || `${s.childName}的故事`}</p>
                      <p className="text-[10px] text-purple-300/60">{s.user?.name || '匿名'} · {s.theme}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: any; sub?: string; color: string }) {
  return (
    <Card className="glass-card-dark border-gold/20">
      <CardContent className="pt-3 pb-3">
        <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
          {icon}
          <span className="text-[10px]">{label}</span>
        </div>
        <p className="text-xl font-bold text-amber-200">{value}</p>
        {sub && <p className="text-[9px] text-purple-300/50 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
