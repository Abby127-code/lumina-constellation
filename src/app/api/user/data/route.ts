/**
 * 用户数据查询 API
 * GET /api/user/data?type=readings|dreams|storybooks|prompts|memorials|genealogies|caregivers&userId=xxx
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'readings';
  const userId = searchParams.get('userId');
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    let items: any[] = [];
    switch (type) {
      case 'readings':
        items = await db.reading.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      case 'dreams':
        items = await db.dream.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      case 'storybooks':
        items = await db.storybook.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      case 'prompts':
        items = await db.promptItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      case 'memorials':
        items = await db.memorial.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      case 'genealogies':
        items = await db.genealogy.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      case 'caregivers':
        items = await db.caregiverLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('User data error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
