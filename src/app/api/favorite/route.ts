/**
 * 收藏夹 API
 * POST /api/favorite { action: 'toggle'|'list', userId, itemType, itemId }
 *
 * 简化实现：使用 User 表的 metadata 字段存 JSON 数组
 * 后续可迁移到独立 Favorite 表
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// 内存缓存（生产环境应使用 Redis 或 DB）
const favoritesCache = new Map<string, Set<string>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, itemKey } = body as {
      action: 'toggle' | 'list'; userId: string; itemKey?: string;
    };

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    if (!favoritesCache.has(userId)) {
      favoritesCache.set(userId, new Set());
    }
    const favs = favoritesCache.get(userId)!;

    if (action === 'toggle' && itemKey) {
      if (favs.has(itemKey)) {
        favs.delete(itemKey);
      } else {
        favs.add(itemKey);
      }
      return NextResponse.json({ success: true, favorited: favs.has(itemKey), count: favs.size });
    }

    if (action === 'list') {
      return NextResponse.json({ items: Array.from(favs) });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
