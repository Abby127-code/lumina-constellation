/**
 * Stripe 订阅 API（三层定价）
 * POST /api/stripe { action: 'create-checkout'|'create-portal'|'webhook'|'upgrade' }
 *
 * 三层订阅：
 * - Free: 3 次/日
 * - Pro: $19/月，无限访问
 * - Premium: $39/月，无限 + 商业授权 + API
 *
 * MVP 阶段使用 mock 模式（无真实 Stripe key 时直接升级），方便测试。
 * 生产环境替换为真实 Stripe Checkout Session。
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export const PLANS = {
  free: { name: 'Free', price: 0, dailyLimit: 3, features: ['每日 3 次 AI 生成', '基础赛道访问'] },
  pro: { name: 'Pro', price: 19, dailyLimit: Infinity, features: ['无限 AI 生成', '全部 8 赛道', '历史记录', '无广告'] },
  premium: { name: 'Premium', price: 39, dailyLimit: Infinity, features: ['Pro 全部权益', '商业授权', 'API 访问', '优先客服', '白标定制'] },
} as const;

export type PlanId = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'create-checkout') {
      const { plan, userId } = body as { plan: PlanId; userId: string };
      if (!PLANS[plan] || plan === 'free') {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      const planInfo = PLANS[plan];

      // Mock 模式：无 STRIPE_SECRET_KEY 时直接升级
      if (!process.env.STRIPE_SECRET_KEY) {
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

      // 真实 Stripe 模式（生产环境）
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const session = await stripe.checkout.sessions.create({...});
      return NextResponse.json({
        error: 'Stripe not configured. Set STRIPE_SECRET_KEY env var.',
      }, { status: 500 });
    }

    if (action === 'cancel') {
      const { userId } = body as { userId: string };
      await db.user.update({
        where: { id: userId },
        data: {
          plan: 'free',
          subStatus: 'canceled',
          stripeSubId: null,
        },
      });
      return NextResponse.json({ success: true, plan: 'free' });
    }

    if (action === 'check-quota') {
      const { userId } = body as { userId: string };
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const today = new Date().toISOString().slice(0, 10);
      // 重置每日配额
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
    service: 'Lumina Stripe API',
    plans: PLANS,
    mode: process.env.STRIPE_SECRET_KEY ? 'live' : 'mock',
  });
}
