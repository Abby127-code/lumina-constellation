/**
 * AI Provider 信息查询
 * GET /api/ai-info
 * 返回当前使用的 AI provider、模型、是否配置等
 */
import { NextResponse } from 'next/server';
import { getAIInfo } from '@/lib/ai-client';

export const runtime = 'nodejs';

export async function GET() {
  const info = getAIInfo();
  return NextResponse.json({
    ...info,
    hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
    hasOpenaiKey: !!process.env.OPENAI_API_KEY,
    usingZaiFallback: info.provider === 'zai',
    docs: info.provider === 'deepseek'
      ? 'https://platform.deepseek.com/api-docs/'
      : info.provider === 'openai'
      ? 'https://platform.openai.com/docs'
      : 'https://z.ai',
  });
}
