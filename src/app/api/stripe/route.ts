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
    dailyLimit: 3,
    features: ['每日 3 次 AI 生成', '基础赛道访问'],
    stripePriceId: null,
  },
  pro: {
    name: 'Pro',
    price: 19,
    dailyLimit: Infinity,
    features: ['无限 AI 生成', '全部 8 赛道', '历史记录', '无广告'],
    // 在 Stripe Dashboard 创建产品后填入 price_id
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  },
  premium: {
    name: 'Premium',
    price: 39,
    dailyLimit: Infinity,
    features: ['Pro 全部权益', '商业授权', 'API 访问', '优先客服', '白标定制'],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
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
      const planInfo = PLANS[plan];
      const stripe = await getStripe();

      // Mock 模式：直接升级
      if (!stripe) {
        await db.user.update({
          where: { id: userId },
          data: {
            plan,
            subStatus: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
          },
        });
        return NextResponse.json({
          success: true,
          mock: true,
          message: `已升级到 ${planInfo.name}（测试模式，无真实扣费）`,
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

      const today = new Date().toISOString().slice(0, 10);
      if (user.dailyUsageDate !== today) {
        await db.user.update({
          where: { id: userId },
          data: { dailyUsageDate: today, dailyUsageCount: 0 },
        });
        return NextResponse.json({
          plan: user.plan,
          used: 0,
          limit: PLANS[user.plan as PlanId].dailyLimit,
          remaining: PLANS[user.plan as PlanId].dailyLimit === Infinity ? Infinity : PLANS[user.plan as PlanId].dailyLimit,
        });
      }
      const limit = PLANS[user.plan as PlanId].dailyLimit;
      const remaining = limit === Infinity ? Infinity : Math.max(0, limit - user.dailyUsageCount);
      return NextResponse.json({
        plan: user.plan,
        used: user.dailyUsageCount,
        limit,
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
