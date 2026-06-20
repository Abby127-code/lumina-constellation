/**
 * Lumina Studio - 统一 AI 客户端
 * 默认使用 z-ai-web-dev-sdk（内置）
 * 当配置了 DEEPSEEK_API_KEY 时，自动切换到 DeepSeek API
 * 当配置了 OPENAI_API_KEY 时，可切换到 OpenAI
 *
 * 环境变量（在 .env 中配置）：
 * - DEEPSEEK_API_KEY=sk-xxx              → 使用 DeepSeek
 * - DEEPSEEK_MODEL=deepseek-chat         → 默认 deepseek-chat（V3）
 * - DEEPSEEK_REASONING_MODEL=deepseek-reasoner → 推理模型（R1）
 * - OPENAI_API_KEY=sk-xxx                → 使用 OpenAI
 * - OPENAI_MODEL=gpt-4o
 *
 * 未配置任何 key 时，自动回退到 z-ai-web-dev-sdk
 */

import ZAI from 'z-ai-web-dev-sdk';
import OpenAI from 'openai';

export type AIProvider = 'deepseek' | 'openai' | 'zai';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  baseURL?: string;
}

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
let _openai: OpenAI | null = null;

export function getAIConfig(): AIConfig {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: 'deepseek',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseURL: 'https://api.deepseek.com/v1',
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    };
  }
  return { provider: 'zai', model: 'glm-4.6' };
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
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    onChunk?: AIStreamCallback;
    preferReasoning?: boolean; // 推理任务用 R1 / o1
  } = {}
): Promise<string> {
  const { temperature = 0.8, maxTokens = 2048, onChunk, preferReasoning } = options;
  const config = getAIConfig();

  // DeepSeek 路径
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

  // OpenAI 路径
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

  // 默认 z-ai-web-dev-sdk 路径
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
    reasoningModel: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
  };
}
