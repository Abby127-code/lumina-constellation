/**
 * Lumina - Unified AI Client
 * Default: z-ai-web-dev-sdk (free, built-in)
 * Falls back to environment variable config on Vercel
 */
import ZAI from 'z-ai-web-dev-sdk';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export type AIProvider = 'deepseek' | 'openai' | 'zai';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  baseURL?: string;
  free: boolean;
}

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
let _openai: OpenAI | null = null;

// Try to load z-ai config from file or environment
function loadZaiConfig(): any | null {
  // Try file paths
  const paths = ['/etc/.z-ai-config', path.join(process.env.HOME || '', '.z-ai-config'), '.z-ai-config'];
  for (const p of paths) {
    try {
      const content = fs.readFileSync(p, 'utf-8');
      return JSON.parse(content);
    } catch {}
  }
  // Try environment variable
  if (process.env.Z_AI_CONFIG) {
    try { return JSON.parse(process.env.Z_AI_CONFIG); } catch {}
  }
  return null;
}

export function getAIConfig(): AIConfig {
  if (process.env.DEEPSEEK_API_KEY) {
    return { provider: 'deepseek', model: process.env.DEEPSEEK_MODEL || 'deepseek-chat', baseURL: 'https://api.deepseek.com/v1', free: false };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o', baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', free: false };
  }
  return { provider: 'zai', model: 'glm-4.6', free: true };
}

async function getOpenAIClient(baseURL?: string): Promise<OpenAI> {
  if (_openai) return _openai;
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('No API key configured');
  _openai = new OpenAI({ apiKey, baseURL: baseURL || 'https://api.deepseek.com/v1' });
  return _openai;
}

async function getZai() {
  if (_zai) return _zai;
  _zai = await ZAI.create();
  return _zai;
}

export type AIStreamCallback = (chunk: string, full: string) => void;

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; onChunk?: AIStreamCallback; preferReasoning?: boolean; } = {}
): Promise<string> {
  const { temperature = 0.8, maxTokens = 2048, onChunk, preferReasoning } = options;
  const config = getAIConfig();

  if (config.provider === 'deepseek') {
    const client = await getOpenAIClient(config.baseURL);
    const model = preferReasoning ? (process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner') : config.model;
    const completion = await client.chat.completions.create({
      model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: preferReasoning ? undefined : temperature, max_tokens: maxTokens, stream: !!onChunk,
    });
    if (onChunk && (completion as any)[Symbol.asyncIterator]) {
      let full = '';
      for await (const chunk of completion as any) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) { full += delta; onChunk(delta, full); }
      }
      return full;
    }
    return (completion as any).choices?.[0]?.message?.content || '';
  }

  if (config.provider === 'openai') {
    const client = await getOpenAIClient(config.baseURL);
    const completion = await client.chat.completions.create({
      model: config.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature, max_tokens: maxTokens, stream: !!onChunk,
    });
    if (onChunk && (completion as any)[Symbol.asyncIterator]) {
      let full = '';
      for await (const chunk of completion as any) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) { full += delta; onChunk(delta, full); }
      }
      return full;
    }
    return (completion as any).choices?.[0]?.message?.content || '';
  }

  // Default: z-ai-web-dev-sdk (free)
  const zai = await getZai();
  const completion = await zai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    temperature, max_tokens: maxTokens,
  });
  const content = completion.choices?.[0]?.message?.content || '';
  if (onChunk) {
    const chunks = content.match(/[^。！？\n]+[。！？\n]?/g) || [content];
    let acc = '';
    for (const chunk of chunks) { acc += chunk; onChunk(chunk, acc); }
  }
  return content;
}

export function getAIInfo() {
  const config = getAIConfig();
  const hasConfig = loadZaiConfig() !== null || process.env.Z_AI_CONFIG;
  return {
    provider: config.provider,
    model: config.model,
    configured: config.provider !== 'zai' || hasConfig,
    free: config.free,
    reasoningModel: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
  };
}
