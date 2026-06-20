/**
 * 用户参与系统统一 API
 * POST /api/engage { action, ... }
 *
 * actions:
 * - get-stats         获取用户统计（连续天数、成就数、通知数等）
 * - record-activity   记录用户活动（更新 streak + 解锁成就）
 * - list-achievements 列出用户成就
 * - list-notifications 列出通知
 * - mark-notification-read 标记已读
 * - toggle-favorite   切换收藏
 * - list-favorites    收藏列表
 * - get-referral      获取推荐码 + 推荐统计
 * - apply-referral    应用推荐码（注册时）
 * - update-theme      更新主题
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const ACHIEVEMENT_DEFS = [
  { type: 'first_reading', title: '初次探索', description: '完成你的第一次 AI 生成', icon: '🌟' },
  { type: 'streak_7', title: '一周坚持', description: '连续 7 天使用 Lumina', icon: '🔥' },
  { type: 'streak_30', title: '月度修行者', description: '连续 30 天使用 Lumina', icon: '🌙' },
  { type: 'pro_upgrade', title: '支持者', description: '升级到 Pro 或 Premium', icon: '👑' },
  { type: 'readings_100', title: '资深旅人', description: '累计 100 次 AI 生成', icon: '✨' },
  { type: 'shared_content', title: '传播者', description: '分享内容到社交平台', icon: '💫' },
  { type: 'early_adopter', title: '早期用户', description: '在产品上线第一个月注册', icon: '🚀' },
  { type: 'referral_first', title: '布道者', description: '成功推荐第一位好友', icon: '🎁' },
  { type: 'polyglot', title: '多语言者', description: '使用过 3+ 种语言', icon: '🌍' },
  { type: 'all_tracks', title: '全能探索者', description: '体验过全部 10 个赛道', icon: '🌈' },
];

async function unlockAchievement(userId: string, type: string): Promise<boolean> {
  const def = ACHIEVEMENT_DEFS.find((a) => a.type === type);
  if (!def) return false;
  try {
    const existing = await db.userAchievement.findUnique({
      where: { userId_type: { userId, type } },
    });
    if (existing) return false;
    await db.userAchievement.create({
      data: { userId, type, title: def.title, description: def.description, icon: def.icon },
    });
    // 推送通知
    await db.notification.create({
      data: {
        userId,
        type: 'achievement',
        title: `🏆 ${def.title}`,
        body: def.description,
        icon: def.icon,
        link: '/?track=account',
      },
    });
    return true;
  } catch { return false; }
}

async function updateStreak(userId: string): Promise<{ current: number; max: number; justUnlocked: string[] }> {
  const today = new Date().toISOString().slice(0, 10);
  const justUnlocked: string[] = [];

  let streak = await db.userStreak.findUnique({ where: { userId } });
  if (!streak) {
    streak = await db.userStreak.create({ data: { userId, currentStreak: 1, maxStreak: 1, lastActiveDate: today, totalDays: 1 } });
  } else {
    if (streak.lastActiveDate === today) {
      // 今日已记录，不重复增加
      return { current: streak.currentStreak, max: streak.maxStreak, justUnlocked: [] };
    }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = streak.lastActiveDate === yesterday ? streak.currentStreak + 1 : 1;
    const newMax = Math.max(streak.maxStreak, newStreak);
    streak = await db.userStreak.update({
      where: { userId },
      data: { currentStreak: newStreak, maxStreak: newMax, lastActiveDate: today, totalDays: { increment: 1 } },
    });
  }

  // 检查 streak 成就
  if (streak.currentStreak >= 7) {
    const unlocked = await unlockAchievement(userId, 'streak_7');
    if (unlocked) justUnlocked.push('streak_7');
  }
  if (streak.currentStreak >= 30) {
    const unlocked = await unlockAchievement(userId, 'streak_30');
    if (unlocked) justUnlocked.push('streak_30');
  }
  if (streak.totalDays >= 1) {
    // 早期用户：上线 30 天内注册
    const unlocked = await unlockAchievement(userId, 'early_adopter');
    if (unlocked) justUnlocked.push('early_adopter');
  }

  return { current: streak.currentStreak, max: streak.maxStreak, justUnlocked };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'get-stats') {
      const { userId } = body as { userId: string };
      const [streak, achievements, unreadNotifs, favorites] = await Promise.all([
        db.userStreak.findUnique({ where: { userId } }),
        db.userAchievement.findMany({ where: { userId }, orderBy: { unlockedAt: 'desc' } }),
        db.notification.count({ where: { userId, isRead: false } }),
        db.favorite.count({ where: { userId } }),
      ]);
      const user = await db.user.findUnique({ where: { id: userId }, select: { referralCode: true, totalReadings: true, plan: true, theme: true } });
      return NextResponse.json({
        streak: streak ? { current: streak.currentStreak, max: streak.maxStreak, totalDays: streak.totalDays } : { current: 0, max: 0, totalDays: 0 },
        achievements: achievements.length,
        achievementList: achievements,
        unreadNotifications: unreadNotifs,
        favorites: favorites,
        totalReadings: user?.totalReadings || 0,
        plan: user?.plan || 'free',
        theme: user?.theme || 'dark',
        referralCode: user?.referralCode,
      });
    }

    if (action === 'record-activity') {
      const { userId, activityType } = body as { userId: string; activityType: string };
      const streakInfo = await updateStreak(userId);
      const justUnlocked = [...streakInfo.justUnlocked];

      // 根据 activity type 解锁成就
      if (activityType === 'first_reading') {
        const u = await unlockAchievement(userId, 'first_reading');
        if (u) justUnlocked.push('first_reading');
      }
      if (activityType === 'reading') {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user && user.totalReadings >= 100) {
          const u = await unlockAchievement(userId, 'readings_100');
          if (u) justUnlocked.push('readings_100');
        }
      }
      if (activityType === 'share') {
        const u = await unlockAchievement(userId, 'shared_content');
        if (u) justUnlocked.push('shared_content');
      }
      if (activityType === 'upgrade') {
        const u = await unlockAchievement(userId, 'pro_upgrade');
        if (u) justUnlocked.push('pro_upgrade');
      }

      return NextResponse.json({ success: true, streak: streakInfo.current, justUnlocked });
    }

    if (action === 'list-notifications') {
      const { userId, limit = 20 } = body as { userId: string; limit?: number };
      const items = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(Number(limit), 100),
      });
      return NextResponse.json({ items });
    }

    if (action === 'mark-notification-read') {
      const { notificationId } = body as { notificationId: string };
      await db.notification.update({ where: { id: notificationId }, data: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark-all-read') {
      const { userId } = body as { userId: string };
      await db.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle-favorite') {
      const { userId, itemType, itemId, title, preview } = body as {
        userId: string; itemType: string; itemId: string; title: string; preview?: string;
      };
      const existing = await db.favorite.findUnique({
        where: { userId_itemType_itemId: { userId, itemType, itemId } },
      });
      if (existing) {
        await db.favorite.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true, favorited: false });
      }
      await db.favorite.create({
        data: { userId, itemType, itemId, title, preview: preview?.slice(0, 200) },
      });
      return NextResponse.json({ success: true, favorited: true });
    }

    if (action === 'list-favorites') {
      const { userId, itemType } = body as { userId: string; itemType?: string };
      const where: any = { userId };
      if (itemType) where.itemType = itemType;
      const items = await db.favorite.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
      return NextResponse.json({ items });
    }

    if (action === 'get-referral') {
      const { userId } = body as { userId: string };
      let user = await db.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
      if (!user?.referralCode) {
        const code = 'LUMINA-' + userId.slice(-6).toUpperCase() + Math.floor(Math.random() * 90 + 10);
        user = await db.user.update({ where: { id: userId }, data: { referralCode: code }, select: { referralCode: true } });
      }
      const referrals = await db.referral.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' },
      });
      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter((r) => r.status === 'completed' || r.status === 'rewarded').length;
      const totalReward = referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
      return NextResponse.json({
        code: user.referralCode,
        link: `${process.env.NEXT_PUBLIC_APP_URL || ''}/?ref=${user.referralCode}`,
        totalReferrals,
        completedReferrals,
        totalReward,
        referrals: referrals.slice(0, 20),
      });
    }

    if (action === 'apply-referral') {
      const { userId, code } = body as { userId: string; code: string };
      const referrer = await db.user.findUnique({ where: { referralCode: code } });
      if (!referrer || referrer.id === userId) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.referredBy) {
        return NextResponse.json({ error: 'Already referred' }, { status: 400 });
      }
      await db.user.update({ where: { id: userId }, data: { referredBy: referrer.id } });
      await db.referral.create({
        data: { referrerId: referrer.id, referredId: userId, code, status: 'completed', completedAt: new Date() },
      });
      // 推送通知给推荐人
      await db.notification.create({
        data: {
          userId: referrer.id,
          type: 'referral',
          title: '🎁 新推荐成功',
          body: '你的朋友通过推荐链接加入了 Lumina Studio！',
          icon: '🎉',
          link: '/?track=account',
        },
      });
      // 检查推荐人是否首次推荐
      const referrerRefCount = await db.referral.count({ where: { referrerId: referrer.id } });
      if (referrerRefCount === 1) {
        await unlockAchievement(referrer.id, 'referral_first');
      }
      return NextResponse.json({ success: true, referrer: referrer.name || referrer.email });
    }

    if (action === 'update-theme') {
      const { userId, theme } = body as { userId: string; theme: 'dark' | 'light' };
      await db.user.update({ where: { id: userId }, data: { theme } });
      return NextResponse.json({ success: true, theme });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Engage API error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
