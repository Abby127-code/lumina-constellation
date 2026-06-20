/**
 * 后台仪表盘 API（管理界面数据汇总）
 * GET /api/admin?type=overview|users|content|revenue
 *
 * 注：生产环境需要鉴权（管理员角色检查），MVP 阶段先开放
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'overview';

  try {
    if (type === 'overview') {
      const [
        totalUsers, payingUsers, totalReadings, totalStorybooks,
        totalPrompts, totalDirectoryItems, totalReferrals, totalFavorites,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { plan: { in: ['pro', 'premium'] } } }),
        db.reading.count(),
        db.storybook.count(),
        db.promptItem.count(),
        db.directoryItem.count(),
        db.referral.count({ where: { status: 'completed' } }),
        db.favorite.count(),
      ]);

      // 最近 7 天用户增长
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const newUsers7d = await db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });

      // 最近 7 天 AI 调用
      const newReadings7d = await db.reading.count({ where: { createdAt: { gte: sevenDaysAgo } } });

      // 收入估算（mock 模式：基于 paying users × 平均月费）
      const proUsers = await db.user.count({ where: { plan: 'pro' } });
      const premiumUsers = await db.user.count({ where: { plan: 'premium' } });
      const estimatedMRR = proUsers * 19 + premiumUsers * 39;

      return NextResponse.json({
        totalUsers,
        payingUsers,
        freeUsers: totalUsers - payingUsers,
        newUsers7d,
        conversionRate: totalUsers > 0 ? (payingUsers / totalUsers * 100).toFixed(1) : '0',
        totalReadings,
        newReadings7d,
        totalContent: totalReadings + totalStorybooks + totalPrompts,
        totalStorybooks,
        totalPrompts,
        totalDirectoryItems,
        totalReferrals,
        totalFavorites,
        estimatedMRR,
        proUsers,
        premiumUsers,
      });
    }

    if (type === 'users') {
      const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
      const users = await db.user.findMany({
        select: {
          id: true, email: true, name: true, plan: true, subStatus: true,
          totalReadings: true, locale: true, createdAt: true, currentPeriodEnd: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return NextResponse.json({ users });
    }

    if (type === 'content') {
      const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
      const [readings, storybooks] = await Promise.all([
        db.reading.findMany({
          select: { id: true, type: true, question: true, createdAt: true, user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        db.storybook.findMany({
          select: { id: true, childName: true, theme: true, storyTitle: true, createdAt: true, user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
      ]);
      return NextResponse.json({ readings, storybooks });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
