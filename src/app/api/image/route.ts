/**
 * AI 图像生成 API
 * POST /api/image
 * Body: { prompt, style?, width?, height?, userId, source?, sourceId? }
 *
 * 使用 z-ai-web-dev-sdk 的 image generation 能力
 */
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZai() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt, style, width = 1024, height = 1024,
      userId, source = 'standalone', sourceId,
    } = body as {
      prompt: string; style?: string; width?: number; height?: number;
      userId?: string; source?: string; sourceId?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // 增强 prompt：注入风格
    const styleMap: Record<string, string> = {
      watercolor: 'watercolor painting style, soft colors, artistic',
      cartoon: 'cartoon style, vibrant colors, playful',
      pixar: 'Pixar 3D animation style, high quality render',
      anime: 'anime style, Japanese animation, detailed',
      picturebook: 'classic children picture book illustration, warm',
      realistic: 'photorealistic, high detail, 4k',
      fantasy: 'fantasy art, magical, ethereal lighting',
      minimalist: 'minimalist, clean lines, modern',
    };
    const styleSuffix = style ? ` · ${styleMap[style] || style}` : '';
    const fullPrompt = `${prompt}${styleSuffix}`;

    const zai = await getZai();
    let imageUrl: string | null = null;

    try {
      // z-ai-web-dev-sdk 图像生成 API
      const result = await (zai as any).images.generations.create({
        prompt: fullPrompt,
        size: `${width}x${height}`,
        n: 1,
      });
      imageUrl = result?.data?.[0]?.url || result?.data?.[0]?.b64_json || null;
    } catch (genErr: any) {
      console.error('Image gen error:', genErr?.message);
      // 失败时返回提示而非崩溃
      return NextResponse.json({
        success: false,
        error: 'Image generation failed: ' + (genErr?.message || 'unknown'),
        prompt: fullPrompt,
      }, { status: 500 });
    }

    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'No image returned',
      }, { status: 500 });
    }

    // 持久化
    let saved = null;
    if (userId) {
      try {
        saved = await db.generatedImage.create({
          data: {
            userId,
            source,
            sourceId: sourceId || null,
            prompt: fullPrompt,
            imageUrl,
            style: style || null,
            width,
            height,
          },
        });
      } catch (dbErr) {
        console.error('DB save error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: fullPrompt,
      saved: saved ? { id: saved.id } : null,
    });
  } catch (err: any) {
    console.error('Image API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Lumina Studio Image API',
    status: 'online',
    note: 'Powered by z-ai-web-dev-sdk',
  });
}
