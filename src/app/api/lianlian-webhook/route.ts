/**
 * LianLian Payment Webhook (连连支付回调)
 * POST /api/lianlian-webhook
 *
 * LianLian sends payment notifications to this endpoint.
 * Configure in LianLian merchant dashboard:
 * URL: https://yoursite.com/api/lianlian-webhook
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // In production, verify the signature from LianLian
    // LianLian uses RSA signature verification
    // const verified = verifyLianLianSignature(body, process.env.LIANLIAN_PUBLIC_KEY);
    // if (!verified) return NextResponse.json({ code: 'FAIL', msg: 'Invalid signature' }, { status: 400 });

    const { merchant_order_id, order_status, amount, buyer_id } = body;

    // Payment success
    if (order_status === 'SUCCESS' || order_status === 'PAID') {
      const userId = buyer_id || merchant_order_id?.split('-')?.[1];

      if (userId) {
        // Determine plan from order ID
        const isYearly = amount >= 40;
        const periodDays = isYearly ? 365 : 30;

        await db.user.update({
          where: { id: userId },
          data: {
            plan: 'pro',
            subStatus: 'active',
            currentPeriodEnd: new Date(Date.now() + periodDays * 86400 * 1000),
          },
        });

        console.log(`✅ LianLian payment success: ${userId} → pro (${isYearly ? 'yearly' : 'monthly'})`);
      }

      return NextResponse.json({ code: 'SUCCESS', msg: 'OK' });
    }

    // Payment failed
    if (order_status === 'FAIL' || order_status === 'FAILED') {
      console.log(`❌ LianLian payment failed: ${merchant_order_id}`);
      return NextResponse.json({ code: 'SUCCESS', msg: 'Noted' });
    }

    // Refund
    if (order_status === 'REFUND' || order_status === 'REFUNDED') {
      const userId = buyer_id || merchant_order_id?.split('-')?.[1];
      if (userId) {
        await db.user.update({
          where: { id: userId },
          data: { plan: 'free', subStatus: 'canceled' },
        });
      }
      return NextResponse.json({ code: 'SUCCESS', msg: 'Refund processed' });
    }

    return NextResponse.json({ code: 'SUCCESS', msg: 'Unknown status noted' });
  } catch (err: any) {
    console.error('LianLian webhook error:', err);
    return NextResponse.json({ code: 'FAIL', msg: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'LianLian Payment Webhook',
    status: 'online',
    note: 'Configure this URL in LianLian merchant dashboard',
  });
}
