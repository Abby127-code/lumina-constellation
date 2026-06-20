'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/lib/session';
import { useLocale } from '@/components/locale-provider';
import { useToast } from '@/hooks/use-toast';
import { Crown, Zap, Infinity as InfIcon, Check, Sparkles, Loader2 } from 'lucide-react';
import { PLANS, type PlanId } from '@/app/api/stripe/route';

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
        body: JSON.stringify({ action: 'create-checkout', plan, userId: user.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs">
          <Crown className="w-3.5 h-3.5 mr-1" />
          {t('nav.upgrade')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-gold/30 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <DialogTitle className="text-gold text-xl">选择你的订阅方案</DialogTitle>
          </div>
          <p className="text-purple-200/70 text-xs">解锁全部 8 大赛道 · 无限 AI 生成 · 商业授权</p>
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
                  <Button
                    onClick={() => upgrade(planId)}
                    disabled={isCurrent || loading === planId || planId === 'free'}
                    className={`w-full text-xs ${
                      isCurrent ? 'bg-zinc-700 text-zinc-400' :
                      planId === 'premium' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black' :
                      planId === 'pro' ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white' :
                      'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {loading === planId ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> :
                     isCurrent ? '当前方案' :
                     planId === 'free' ? '当前方案' :
                     `升级 ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-purple-300/40 text-[10px] text-center mt-2">
          🔒 测试模式：无真实扣费。生产环境接入真实 Stripe。
        </p>
      </DialogContent>
    </Dialog>
  );
}
