/**
 * Stripe Webhook 处理
 * POST /api/stripe-webhook
 *
 * 监听事件：
 * - checkout.session.completed → 升级用户 plan
 * - customer.subscription.updated → 更新订阅状态
 * - customer.subscription.deleted → 降级为 free
 * - invoice.paid → 续费成功
 * - invoice.payment_failed → 标记支付失败
 *
 * 配置：
 * 1. 在 Stripe Dashboard → Webhooks 添加端点
 * 2. URL: https://你的域名/api/stripe-webhook
 * 3. 设置 STRIPE_WEBHOOK_SECRET 环境变量
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLANS, type PlanId } from '@/app/api/stripe/route';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  // 未配置 Stripe：跳过 webhook 处理
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true, note: 'Stripe not configured' });
  }

  let event: any;
  try {
    const stripeModule = await import('stripe' as any).catch(() => null);
    if (!stripeModule) {
      return NextResponse.json({ received: true, note: 'Stripe SDK not installed' });
    }
    const { default: Stripe } = stripeModule;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
    });
    event = stripe.webhooks.constructEvent(
      body,
      sig || '',
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message);
    return NextResponse.json({ error: `Webhook Error: ${err?.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = session.metadata?.plan as PlanId;
        if (userId && plan && PLANS[plan]) {
          await db.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeCustomerId: session.customer,
              stripeSubId: session.subscription,
              subStatus: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
            },
          });
          console.log(`✅ User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: {
              subStatus: sub.status,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: {
              plan: 'free',
              subStatus: 'canceled',
              stripeSubId: null,
            },
          });
          console.log(`⚠️ User ${userId} subscription canceled`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const userId = invoice.metadata?.userId;
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: {
              subStatus: 'active',
              currentPeriodEnd: new Date(invoice.period_end * 1000),
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const userId = invoice.metadata?.userId;
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: { subStatus: 'past_due' },
          });
        }
        break;
      }

      default:
        // 未处理的事件类型
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
