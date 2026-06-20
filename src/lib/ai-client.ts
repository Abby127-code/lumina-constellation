/**
 * Lumina Studio - 统一 AI 客户端
 *
 * 默认使用 z-ai-web-dev-sdk（Z.ai 平台内置，完全免费，不扣任何账户余额）
 *
 * 可选 provider（仅在用户主动配置 API key 时启用，会产生费用）：
 * - DEEPSEEK_API_KEY=sk-xxx        → 切换到 DeepSeek（会扣 DeepSeek 账户余额）
 * - OPENAI_API_KEY=sk-xxx          → 切换到 OpenAI（会扣 OpenAI 账户余额）
 *
 * 未配置任何 key 时，默认走 z-ai-web-dev-sdk，零成本运营
 */

import ZAI from 'z-ai-web-dev-sdk';
import OpenAI from 'openai';

export type AIProvider = 'deepseek' | 'openai' | 'zai';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  baseURL?: string;
  free: boolean; // 是否免费
}

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
let _openai: OpenAI | null = null;

export function getAIConfig(): AIConfig {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: 'deepseek',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseURL: 'https://api.deepseek.com/v1',
      free: false,
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      free: false,
    };
  }
  // 默认：z-ai-web-dev-sdk（免费）
  return { provider: 'zai', model: 'glm-4.6', free: true };
}

async function getOpenAIClient(baseURL?: string): Promise<OpenAI> {
  if (_openai) return _openai;
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('No API key configured');
  _openai = new OpenAI({
    apiKey,
    baseURL: baseURL || 'https://api.deepseek.com/v1',
  });
  return _openai;
}

async function getZai() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

export type AIStreamCallback = (chunk: string, full: string) => void;

/**
 * 统一 AI 调用入口
 * 自动根据环境变量选择 provider
 * 默认走免费 z-ai-web-dev-sdk
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    onChunk?: AIStreamCallback;
    preferReasoning?: boolean;
  } = {}
): Promise<string> {
  const { temperature = 0.8, maxTokens = 2048, onChunk, preferReasoning } = options;
  const config = getAIConfig();

  // DeepSeek 路径（需配置 DEEPSEEK_API_KEY，会产生费用）
  if (config.provider === 'deepseek') {
    const client = await getOpenAIClient(config.baseURL);
    const model = preferReasoning
      ? (process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner')
      : config.model;

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: preferReasoning ? undefined : temperature,
      max_tokens: maxTokens,
      stream: !!onChunk,
    });

    if (onChunk && (completion as any)[Symbol.asyncIterator]) {
      let full = '';
      for await (const chunk of completion as any) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          full += delta;
          onChunk(delta, full);
        }
      }
      return full;
    }

    return (completion as any).choices?.[0]?.message?.content || '';
  }

  // OpenAI 路径（需配置 OPENAI_API_KEY，会产生费用）
  if (config.provider === 'openai') {
    const client = await getOpenAIClient(config.baseURL);
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: !!onChunk,
    });

    if (onChunk && (completion as any)[Symbol.asyncIterator]) {
      let full = '';
      for await (const chunk of completion as any) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          full += delta;
          onChunk(delta, full);
        }
      }
      return full;
    }

    return (completion as any).choices?.[0]?.message?.content || '';
  }

  // 默认路径：z-ai-web-dev-sdk（免费）
  const zai = await getZai();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  const content = completion.choices?.[0]?.message?.content || '';
  if (onChunk) {
    // 模拟流式：将完整内容按段切分回调
    const chunks = content.match(/[^。！？\n]+[。！？\n]?/g) || [content];
    let acc = '';
    for (const chunk of chunks) {
      acc += chunk;
      onChunk(chunk, acc);
    }
  }
  return content;
}

/**
 * 健康检查 / 模型信息
 */
export function getAIInfo() {
  const config = getAIConfig();
  return {
    provider: config.provider,
    model: config.model,
    configured: config.provider !== 'zai',
    free: config.free,
    reasoningModel: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
  };
}
