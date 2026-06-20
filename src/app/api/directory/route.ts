/**
 * 目录站 + Prompt 库的 CRUD API
 * GET  /api/directory?type=directory|prompts&category=...
 * POST /api/directory { type, action: 'create'|'upvote', payload }
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'directory';
  const category = searchParams.get('category');
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

  try {
    if (type === 'prompts') {
      const where: any = { isPublic: true };
      if (category && category !== 'all') where.category = category;
      const items = await db.promptItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return NextResponse.json({ items });
    }

    // directory
    const where: any = { isApproved: true };
    if (category && category !== 'all') where.category = category;
    const items = await db.directoryItem.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { upvotes: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('Directory GET error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, action, payload } = body as {
      type: 'directory' | 'prompts';
      action: 'create' | 'upvote' | 'favorite';
      payload: any;
    };

    if (action === 'create') {
      if (type === 'directory') {
        const item = await db.directoryItem.create({
          data: {
            userId: payload.userId || null,
            name: payload.name,
            url: payload.url,
            description: payload.description || '',
            category: payload.category || 'ai-tool',
            tags: payload.tags ? JSON.stringify(payload.tags) : null,
            pricing: payload.pricing || null,
            logoUrl: payload.logoUrl || null,
          },
        });
        return NextResponse.json({ item });
      }
      // prompts
      const item = await db.promptItem.create({
        data: {
          userId: payload.userId,
          title: payload.title,
          category: payload.category || 'writing',
          model: payload.model || 'ChatGPT',
          promptText: payload.promptText,
          description: payload.description || null,
          isPublic: payload.isPublic ?? true,
        },
      });
      return NextResponse.json({ item });
    }

    if (action === 'upvote') {
      if (type === 'directory') {
        const item = await db.directoryItem.update({
          where: { id: payload.id },
          data: { upvotes: { increment: 1 } },
        });
        return NextResponse.json({ item });
      }
      const item = await db.promptItem.update({
        where: { id: payload.id },
        data: { usageCount: { increment: 1 } },
      });
      return NextResponse.json({ item });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Directory POST error:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
