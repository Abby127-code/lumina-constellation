/**
 * Stripe 订阅 API（V5：支持真实 Checkout Session + mock 自动切换）
 * POST /api/stripe { action, ... }
 *
 * 三层订阅：
 * - Free: 3 次/日，免费
 * - Pro: $19/月，无限访问全部 8 赛道
 * - Premium: $39/月，无限 + 商业授权 + API
 *
 * 模式自动切换：
 * - 配置了 STRIPE_SECRET_KEY → 真实 Stripe Checkout
 * - 未配置 → Mock 模式（直接升级，无扣费，用于测试）
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 30;

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    dailyLimit: 3, // 3 free trial uses (lifetime)
    features: ['3 free trial generations', 'No credit card needed'],
    stripePriceId: null,
  },
  monthly: {
    name: 'Monthly',
    price: 4.99,
    dailyLimit: Infinity,
    features: ['Unlimited generations', 'Full feature unlock', 'History & favorites', 'Cancel anytime'],
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
  },
  yearly: {
    name: 'Yearly',
    price: 47.90, // $4.99 × 12 × 0.8 (20% off)
    dailyLimit: Infinity,
    features: ['Everything in Monthly', '20% off (save $11.98/yr)', 'Priority support', 'Early access to new features'],
    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',
  },
} as const;

export type PlanId = keyof typeof PLANS;

let _stripe: any = null;
let _stripeChecked = false;
async function getStripe() {
  if (_stripeChecked) return _stripe;
  _stripeChecked = true;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const stripeModule = await import('stripe' as any).catch(() => null);
    if (!stripeModule) {
      console.warn('Stripe SDK not installed. Run: bun add stripe');
      return null;
    }
    const { default: Stripe } = stripeModule;
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
    });
    return _stripe;
  } catch (e: any) {
    console.warn('Stripe init failed:', e?.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    // ─── 创建 Checkout Session ───
    if (action === 'create-checkout') {
      const { plan, userId, email } = body as { plan: PlanId; userId: string; email?: string };
      if (!PLANS[plan] || plan === 'free') {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      // Module plan requires specifying which product
      const { productId } = body as { productId?: string };
      const planInfo = PLANS[plan];
      const stripe = await getStripe();

      // Mock 模式：直接升级
      if (!stripe) {
        const periodDays = plan === 'yearly' ? 365 : 30;
        await db.user.update({
          where: { id: userId },
          data: {
            plan: plan === 'free' ? 'free' : 'pro', // pro = paid (monthly or yearly)
            subStatus: 'active',
            currentPeriodEnd: new Date(Date.now() + periodDays * 86400 * 1000),
          },
        });
        return NextResponse.json({
          success: true,
          mock: true,
          message: `Upgraded to ${planInfo.name} ($${planInfo.price}${plan === 'yearly' ? '/yr' : '/mo'}) — test mode, no real charge`,
          plan,
        });
      }

      // 真实 Stripe 模式
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: planInfo.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/?track=account&status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?track=account&status=cancel`,
        client_reference_id: userId,
        customer_email: email,
        metadata: {
          userId,
          plan,
        },
        subscription_data: {
          metadata: { userId, plan },
        },
        allow_promotion_codes: true,
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    }

    // ─── 取消订阅 ───
    if (action === 'cancel') {
      const { userId } = body as { userId: string };
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const stripe = await getStripe();
      if (stripe && user.stripeSubId) {
        // 真实 Stripe：标记订阅在周期结束时取消
        await stripe.subscriptions.update(user.stripeSubId, {
          cancel_at_period_end: true,
        });
        await db.user.update({
          where: { id: userId },
          data: { subStatus: 'canceled' },
        });
      } else {
        // Mock 模式：立即降级
        await db.user.update({
          where: { id: userId },
          data: {
            plan: 'free',
            subStatus: 'canceled',
            stripeSubId: null,
          },
        });
      }
      return NextResponse.json({ success: true, plan: 'free' });
    }

    // ─── 创建 Customer Portal（管理订阅） ───
    if (action === 'create-portal') {
      const { userId } = body as { userId: string };
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user?.stripeCustomerId) {
        return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 });
      }
      const stripe = await getStripe();
      if (!stripe) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
      }
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${appUrl}/?track=account`,
      });
      return NextResponse.json({ url: session.url });
    }

    // ─── 检查配额 ───
    if (action === 'check-quota') {
      const { userId } = body as { userId: string };
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      // Map DB plan to pricing tier: free→free, pro→monthly/yearly (both unlimited)
      const isPaid = user.plan === 'pro' || user.plan === 'premium';
      const tier: PlanId = isPaid ? 'monthly' : 'free';
      const limit = PLANS[tier].dailyLimit;

      const today = new Date().toISOString().slice(0, 10);
      if (user.dailyUsageDate !== today) {
        await db.user.update({
          where: { id: userId },
          data: { dailyUsageDate: today, dailyUsageCount: 0 },
        });
        return NextResponse.json({
          plan: user.plan,
          tier,
          used: 0,
          limit: limit === Infinity ? 'unlimited' : limit,
          remaining: limit === Infinity ? 'unlimited' : limit,
        });
      }
      const remaining = limit === Infinity ? 'unlimited' : Math.max(0, limit - user.dailyUsageCount);
      return NextResponse.json({
        plan: user.plan,
        tier,
        used: user.dailyUsageCount,
        limit: limit === Infinity ? 'unlimited' : limit,
        remaining,
      });
    }

    // ─── 增加使用计数 ───
    if (action === 'increment-usage') {
      const { userId } = body as { userId: string };
      await db.user.update({
        where: { id: userId },
        data: { dailyUsageCount: { increment: 1 } },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Stripe API error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Lumina Stripe API V5',
    plans: PLANS,
    mode: process.env.STRIPE_SECRET_KEY ? 'live' : 'mock',
    features: [
      'create-checkout (real Stripe Checkout Session)',
      'cancel (subscription cancel)',
      'create-portal (Stripe Customer Portal)',
      'check-quota (daily quota)',
      'increment-usage',
    ],
  });
}
