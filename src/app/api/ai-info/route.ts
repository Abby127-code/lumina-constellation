/**
 * AI Provider 信息查询
 * GET /api/ai-info
 * 返回当前使用的 AI provider、模型、是否免费、是否配置等
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
    isFree: info.free,
    costNote: info.free
      ? '当前使用免费 AI 后端，零成本运营'
      : `当前使用 ${info.provider}，会产生 API 调用费用`,
    docs: info.provider === 'deepseek'
      ? 'https://platform.deepseek.com/api-docs/'
      : info.provider === 'openai'
      ? 'https://platform.openai.com/docs'
      : 'https://z.ai',
  });
}
