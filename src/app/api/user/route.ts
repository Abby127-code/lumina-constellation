/**
 * 用户初始化 API
 * POST /api/user/init
 * 首次访问自动创建匿名用户；已存在则返回现有用户
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, profile } = body as { userId?: string; profile?: any };

    // 已有 userId - 更新 profile
    if (userId) {
      try {
        const existing = await db.user.findUnique({ where: { id: userId } });
        if (existing) {
          if (profile) {
            const updated = await db.user.update({
              where: { id: userId },
              data: {
                name: profile.name ?? existing.name,
                email: profile.email ?? existing.email,
                birthDate: profile.birthDate ?? existing.birthDate,
                birthTime: profile.birthTime ?? existing.birthTime,
                birthPlace: profile.birthPlace ?? existing.birthPlace,
                gender: profile.gender ?? existing.gender,
              },
            });
            return NextResponse.json({ user: updated });
          }
          return NextResponse.json({ user: existing });
        }
      } catch (e) {
        // fallthrough to create
      }
    }

    // 创建新用户
    const newUser = await db.user.create({
      data: {
        name: profile?.name || null,
        email: profile?.email || null,
        birthDate: profile?.birthDate || null,
        birthTime: profile?.birthTime || null,
        birthPlace: profile?.birthPlace || null,
        gender: profile?.gender || null,
        plan: 'free',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天免费试用
      },
    });

    return NextResponse.json({ user: newUser });
  } catch (err: any) {
    console.error('User init error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ service: 'User API', status: 'online' });
}
