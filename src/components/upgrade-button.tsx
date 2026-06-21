'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';
import { Crown, Check, Sparkles, Loader2, ExternalLink, Zap, Calendar } from 'lucide-react';

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    period: '',
    features: ['3 free trial generations', 'No credit card needed'],
  },
  monthly: {
    name: 'Monthly',
    price: 4.99,
    period: '/mo',
    features: ['Unlimited generations', 'Full feature unlock', 'History & favorites', 'Cancel anytime'],
  },
  yearly: {
    name: 'Yearly',
    price: 47.90,
    period: '/yr',
    features: ['Everything in Monthly', '20% off (save $11.98)', 'Priority support', 'Early access'],
  },
} as const;

type PlanId = keyof typeof PLANS;

export function UpgradeButton() {
  const { user, setUser } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<PlanId | null>(null);

  const isPaid = user?.plan === 'pro' || user?.plan === 'premium';

  const upgrade = async (plan: PlanId) => {
    if (plan === 'free' || !user) return;
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-checkout', plan, userId: user.userId, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setUser({ ...user, plan: 'pro', subStatus: 'active' });
      toast({ title: `🎉 Upgraded to ${PLANS[plan].name}`, description: data.mock ? 'Test mode — no real charge' : 'Activated' });
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
      const res = await fetch('/api/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', userId: user.userId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser({ ...user, plan: 'free', subStatus: 'canceled' });
      toast({ title: 'Canceled', description: 'Downgraded to Free' });
      setOpen(false);
    } catch (e: any) {
      toast({ title: '❌ ' + (e?.message || 'Failed'), variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  if (isPaid) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs">
          <Crown className="w-3.5 h-3.5 mr-1" /> Upgrade
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-gold/30 max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <DialogTitle className="text-gold text-xl">Choose Your Plan</DialogTitle>
          </div>
          <p className="text-purple-200/60 text-xs">Simple pricing. No bundles. Per product.</p>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
          {(['free', 'monthly', 'yearly'] as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = (planId === 'free' && !isPaid);
            const isPopular = planId === 'yearly';
            return (
              <Card key={planId} className={`glass-card-dark border-2 ${planId === 'yearly' ? 'border-amber-400/60' : planId === 'monthly' ? 'border-sky-400/60' : 'border-purple-400/30'} relative`}>
                {isPopular && <div className="absolute -top-2 left-1/2 -translate-x-1/2"><Badge className="bg-amber-500 text-black text-[9px]">SAVE 20%</Badge></div>}
                <CardContent className="pt-5 pb-4 text-center">
                  <div className="w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center ${planId === 'yearly' ? 'bg-amber-500/20' : planId === 'monthly' ? 'bg-sky-500/20' : 'bg-purple-500/20'}">
                    {planId === 'yearly' ? <Calendar className="w-4 h-4 text-amber-300" /> : planId === 'monthly' ? <Zap className="w-4 h-4 text-sky-300" /> : <Sparkles className="w-4 h-4 text-purple-300" />}
                  </div>
                  <h3 className="text-sm font-semibold text-gold">{plan.name}</h3>
                  <div className="my-2">
                    <span className="text-xl font-bold text-white">${plan.price}</span>
                    <span className="text-purple-200/50 text-[10px]">{plan.period}</span>
                  </div>
                  <ul className="text-left text-[9px] text-purple-100/70 space-y-1 mb-3">
                    {plan.features.map((f, i) => <li key={i} className="flex items-start gap-1"><Check className="w-2.5 h-2.5 text-emerald-400 mt-0.5 shrink-0" /><span>{f}</span></li>)}
                  </ul>
                  {isCurrent ? (
                    <Button disabled className="w-full text-[10px] bg-zinc-700 text-zinc-400">Current</Button>
                  ) : planId === 'free' ? (
                    <Button onClick={cancelSub} disabled={loading === ('free' as PlanId)} variant="outline" className="w-full text-[10px] border-rose-400/40 text-rose-300">
                      {loading === ('free' as PlanId) ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null} Downgrade
                    </Button>
                  ) : (
                    <Button onClick={() => upgrade(planId)} disabled={loading === planId} className={`w-full text-[10px] ${planId === 'yearly' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black' : 'bg-gradient-to-r from-sky-500 to-sky-600 text-white'}`}>
                      {loading === planId ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      ${plan.price}{plan.period}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-purple-300/30 text-[9px] text-center">
          {process.env.LIANLIAN_API_KEY ? '🔒 Secure payment via LianLian' : 'Test mode — no real charge. Set LIANLIAN_API_KEY for live payments.'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
