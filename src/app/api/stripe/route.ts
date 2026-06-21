/**
 * LianLian Payment API (连连支付)
 * POST /api/stripe { action, plan, userId, email }
 *
 * LianLian Global (连连国际) supports cross-border subscriptions.
 * API docs: https://developer.lianlianpay.com/
 *
 * 三层定价:
 * - Free: 3 次免费试用
 * - Monthly: $4.99/月
 * - Yearly: $47.90/年 (8折)
 *
 * 未配置 LIANLIAN_API_KEY 时自动使用 mock 模式（无真实扣费）
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 30;

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limit: 3,
    features: ['3 free trial generations', 'No credit card needed'],
  },
  monthly: {
    name: 'Monthly',
    price: 4.99,
    limit: Infinity,
    features: ['Unlimited generations', 'Full feature unlock', 'History & favorites', 'Cancel anytime'],
  },
  yearly: {
    name: 'Yearly',
    price: 47.90,
    limit: Infinity,
    features: ['Everything in Monthly', '20% off (save $11.98)', 'Priority support', 'Early access'],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ─── Create payment order ───
    if (action === 'create-checkout') {
      const { plan, userId, email, productId } = body as { plan: PlanId; userId: string; email?: string; productId?: string };
      if (!PLANS[plan] || plan === 'free') {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      const planInfo = PLANS[plan];

      // Mock mode: no real charge
      if (!process.env.LIANLIAN_API_KEY) {
        const periodDays = plan === 'yearly' ? 365 : 30;
        await db.user.update({
          where: { id: userId },
          data: {
            plan: 'pro',
            subStatus: 'active',
            currentPeriodEnd: new Date(Date.now() + periodDays * 86400 * 1000),
          },
        });
        return NextResponse.json({
          success: true,
          mock: true,
          message: `Upgraded to ${planInfo.name} ($${planInfo.price}${plan === 'yearly' ? '/yr' : '/mo'}) — test mode`,
          plan,
        });
      }

      // Real LianLian payment mode
      // In production, create a LianLian payment order and return checkout URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const orderId = `LUMINA-${userId.slice(-8)}-${Date.now()}`;
      const returnUrl = `${appUrl}/?payment=success&order=${orderId}`;
      const notifyUrl = `${appUrl}/api/lianlian-webhook`;

      // LianLian Global Checkout API call
      const paymentData = {
        merchant_id: process.env.LIANLIAN_MERCHANT_ID,
        merchant_order_id: orderId,
        amount: planInfo.price,
        currency: 'USD',
        product_name: `${planInfo.name} Subscription - Lumina ${productId || 'Product'}`,
        return_url: returnUrl,
        notify_url: notifyUrl,
        buyer_id: userId,
        buyer_email: email,
        // LianLian will generate a hosted checkout page
      };

      try {
        const response = await fetch('https://api.lianlianpay.com/v1/checkout/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LIANLIAN_API_KEY}`,
          },
          body: JSON.stringify(paymentData),
        });
        const result = await response.json();
        if (result.checkout_url) {
          return NextResponse.json({ success: true, url: result.checkout_url, orderId });
        }
        throw new Error(result.message || 'LianLian API error');
      } catch (e: any) {
        console.error('LianLian payment error:', e);
        return NextResponse.json({ error: e?.message || 'Payment failed' }, { status: 500 });
      }
    }

    // ─── Cancel subscription ───
    if (action === 'cancel') {
      const { userId } = body as { userId: string };
      await db.user.update({
        where: { id: userId },
        data: { plan: 'free', subStatus: 'canceled', stripeSubId: null },
      });
      return NextResponse.json({ success: true, plan: 'free' });
    }

    // ─── Check quota ───
    if (action === 'check-quota') {
      const { userId } = body as { userId: string };
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const isPaid = user.plan === 'pro' || user.plan === 'premium';
      const tier: PlanId = isPaid ? 'monthly' : 'free';
      const limit = PLANS[tier].limit;
      const used = user.dailyUsageCount || 0;

      return NextResponse.json({
        plan: user.plan,
        tier,
        used,
        limit: limit === Infinity ? 'unlimited' : limit,
        remaining: limit === Infinity ? 'unlimited' : Math.max(0, limit - used),
      });
    }

    // ─── Increment usage ───
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
    console.error('Payment API error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Lumina Payment API (LianLian)',
    plans: PLANS,
    mode: process.env.LIANLIAN_API_KEY ? 'live' : 'mock',
    provider: 'LianLian Global (连连国际)',
  });
}
