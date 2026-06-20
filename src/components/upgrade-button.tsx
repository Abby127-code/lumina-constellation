'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/lib/session';
import { useLocale } from '@/components/locale-provider';
import { useToast } from '@/hooks/use-toast';
import { Crown, Zap, Infinity as InfIcon, Check, Sparkles, Loader2, ExternalLink } from 'lucide-react';

// 客户端版本的计划配置（避免从 server-only 的 API route 导入）
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['每日 3 次 AI 生成', '基础赛道访问'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    features: ['无限 AI 生成', '全部 8 赛道', '历史记录', '无广告'],
  },
  premium: {
    name: 'Premium',
    price: 39,
    features: ['Pro 全部权益', '商业授权', 'API 访问', '优先客服', '白标定制'],
  },
} as const;

type PlanId = keyof typeof PLANS;

export function UpgradeButton() {
  const { user, setUser } = useSession();
  const { t } = useLocale();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<PlanId | null>(null);

  if (user?.plan === 'premium') return null;

  const upgrade = async (plan: PlanId) => {
    if (plan === 'free' || !user) return;
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-checkout',
          plan,
          userId: user.userId,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 真实 Stripe：跳转支付页
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // Mock 模式：直接升级
      setUser({ ...user, plan, subStatus: 'active' });
      toast({
        title: `🎉 已升级到 ${PLANS[plan].name}`,
        description: data.mock ? '测试模式，无真实扣费' : '订阅激活成功',
      });
      setOpen(false);
    } catch (e: any) {
      toast({ title: '❌ ' + (e?.message || 'Failed'), variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const cancelSub = async () => {
    if (!user) return;
    setLoading('free' as PlanId);
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', userId: user.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser({ ...user, plan: 'free', subStatus: 'canceled' });
      toast({ title: '已取消订阅', description: '已降级为 Free 计划' });
      setOpen(false);
    } catch (e: any) {
      toast({ title: '❌ ' + (e?.message || 'Failed'), variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const manageSub = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-portal', userId: user.userId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Stripe Customer Portal 未配置', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: '❌ ' + (e?.message || 'Failed'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs">
          <Crown className="w-3.5 h-3.5 mr-1" />
          {user?.plan === 'pro' ? '升级 Premium' : t('nav.upgrade')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-gold/30 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <DialogTitle className="text-gold text-xl">选择你的订阅方案</DialogTitle>
          </div>
          <p className="text-purple-200/70 text-xs">
            解锁全部 8 大赛道 · 无限 AI 生成 · 商业授权
            <span className="ml-2 text-emerald-300">· 当前零成本运营（AI 免费）</span>
          </p>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
          {(['free', 'pro', 'premium'] as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = user?.plan === planId;
            const isPopular = planId === 'pro';
            return (
              <Card
                key={planId}
                className={`glass-card-dark border-2 ${
                  planId === 'premium' ? 'border-amber-400/60' :
                  planId === 'pro' ? 'border-sky-400/60' :
                  'border-purple-400/30'
                } relative`}
              >
                {isPopular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-sky-500 text-white text-[9px]">POPULAR</Badge>
                  </div>
                )}
                <CardContent className="pt-5 pb-4 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    planId === 'premium' ? 'bg-amber-500/20' :
                    planId === 'pro' ? 'bg-sky-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {planId === 'premium' ? <Crown className="w-5 h-5 text-amber-300" /> :
                     planId === 'pro' ? <Zap className="w-5 h-5 text-sky-300" /> :
                     <InfIcon className="w-5 h-5 text-purple-300" />}
                  </div>
                  <h3 className="text-base font-semibold text-gold">{plan.name}</h3>
                  <div className="my-2">
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    <span className="text-purple-200/60 text-xs">/月</span>
                  </div>
                  <p className="text-purple-200/70 text-[10px] mb-3">
                    {planId === 'free' ? t('plan.freeDesc') :
                     planId === 'pro' ? t('plan.proDesc') :
                     t('plan.premiumDesc')}
                  </p>
                  <ul className="text-left text-[10px] text-purple-100/80 space-y-1 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button disabled className="w-full text-xs bg-zinc-700 text-zinc-400">
                      当前方案
                    </Button>
                  ) : planId === 'free' ? (
                    <Button
                      onClick={cancelSub}
                      disabled={loading === ('free' as PlanId)}
                      variant="outline"
                      className="w-full text-xs border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                    >
                      {loading === ('free' as PlanId) ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      降级为 Free
                    </Button>
                  ) : (
                    <Button
                      onClick={() => upgrade(planId)}
                      disabled={loading === planId}
                      className={`w-full text-xs ${
                        planId === 'premium' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black' :
                        'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
                      }`}
                    >
                      {loading === planId ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      升级 {plan.name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 管理订阅入口 */}
        {user?.plan !== 'free' && (
          <div className="pt-3 border-t border-gold/20 text-center">
            <Button size="sm" variant="ghost" onClick={manageSub} className="text-purple-200/70 hover:text-gold text-xs">
              管理 Stripe 订阅 <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        <p className="text-purple-300/40 text-[10px] text-center mt-2">
          🔒 {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
            ? '真实 Stripe 支付，安全加密'
            : '测试模式：无真实扣费。配置 STRIPE_SECRET_KEY 启用真实支付'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
