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

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['10 total generations', 'All 7 products accessible'],
  },
  module: {
    name: 'Single Product',
    price: 4.99,
    features: ['Unlimited in ONE product', 'Full feature unlock', 'History & favorites', 'No ads'],
  },
  allaccess: {
    name: 'All-Access',
    price: 14.99,
    features: ['Unlimited ALL 7 products', 'Commercial license', 'Priority support', 'Early access'],
  },
} as const;

type PlanId = keyof typeof PLANS;

export function UpgradeButton() {
  const { user, setUser } = useSession();
  const { t } = useLocale();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<PlanId | null>(null);

  const isProOrAbove = user?.plan === 'pro' || user?.plan === 'premium';

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

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      const newPlan = plan === 'module' ? 'pro' : plan === 'allaccess' ? 'premium' : 'free';
      setUser({ ...user, plan: newPlan as any, subStatus: 'active' });
      toast({
        title: `🎉 Upgraded to ${PLANS[plan].name}`,
        description: data.mock ? 'Test mode — no real charge' : 'Subscription activated',
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
      toast({ title: 'Subscription canceled', description: 'Downgraded to Free' });
      setOpen(false);
    } catch (e: any) {
      toast({ title: '❌ ' + (e?.message || 'Failed'), variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  if (user?.plan === 'premium') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs">
          <Crown className="w-3.5 h-3.5 mr-1" />
          {isProOrAbove ? 'Upgrade All-Access' : 'Upgrade'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-gold/30 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <DialogTitle className="text-gold text-xl">Choose Your Plan</DialogTitle>
          </div>
          <p className="text-purple-200/70 text-xs">
            3 tiers: Free · Single Module $9/mo · All-Access $39/mo
            <span className="ml-2 text-emerald-300">· AI is free (zero cost)</span>
          </p>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
          {(['free', 'module', 'allaccess'] as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = (planId === 'free' && !isProOrAbove) ||
              (planId === 'module' && user?.plan === 'pro') ||
              (planId === 'allaccess' && user?.plan === 'premium');
            const isPopular = planId === 'allaccess';
            return (
              <Card
                key={planId}
                className={`glass-card-dark border-2 ${
                  planId === 'allaccess' ? 'border-amber-400/60' :
                  planId === 'module' ? 'border-sky-400/60' :
                  'border-purple-400/30'
                } relative`}
              >
                {isPopular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-black text-[9px]">BEST VALUE</Badge>
                  </div>
                )}
                <CardContent className="pt-5 pb-4 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    planId === 'allaccess' ? 'bg-amber-500/20' :
                    planId === 'module' ? 'bg-sky-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    {planId === 'allaccess' ? <Crown className="w-5 h-5 text-amber-300" /> :
                     planId === 'module' ? <Zap className="w-5 h-5 text-sky-300" /> :
                     <InfIcon className="w-5 h-5 text-purple-300" />}
                  </div>
                  <h3 className="text-base font-semibold text-gold">{plan.name}</h3>
                  <div className="my-2">
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    <span className="text-purple-200/60 text-xs">/mo</span>
                  </div>
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
                      Current Plan
                    </Button>
                  ) : planId === 'free' ? (
                    <Button
                      onClick={cancelSub}
                      disabled={loading === ('free' as PlanId)}
                      variant="outline"
                      className="w-full text-xs border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                    >
                      {loading === ('free' as PlanId) ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      onClick={() => upgrade(planId)}
                      disabled={loading === planId}
                      className={`w-full text-xs ${
                        planId === 'allaccess' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black' :
                        'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
                      }`}
                    >
                      {loading === planId ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      Upgrade {plan.name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-purple-300/40 text-[10px] text-center mt-2">
          🔒 {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
            ? 'Real Stripe payment · Secure'
            : 'Test mode: no real charge. Configure STRIPE_SECRET_KEY to enable real payments'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
