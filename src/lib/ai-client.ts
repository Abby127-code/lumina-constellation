/**
 * Lumina - Unified AI Client
 * Default: z-ai-web-dev-sdk (free, built-in)
 * Supports Vercel deployment via Z_AI_CONFIG environment variable
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
let _initialized = false;

// Ensure z-ai config is available (write to file if env var is set)
function ensureZaiConfig(): void {
  if (_initialized) return;
  _initialized = true;

  // If Z_AI_CONFIG env var is set, write it to a file that SDK can find
  if (process.env.Z_AI_CONFIG) {
    try {
      // Try writing to /tmp (works on Vercel)
      fs.writeFileSync('/tmp/.z-ai-config', process.env.Z_AI_CONFIG, 'utf-8');
      // Also try home directory
      const homeConfig = path.join(process.env.HOME || '/tmp', '.z-ai-config');
      fs.writeFileSync(homeConfig, process.env.Z_AI_CONFIG, 'utf-8');
    } catch (e) {
      console.error('Failed to write z-ai config:', e);
    }
  }
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
  ensureZaiConfig();
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
  const hasEnvConfig = !!process.env.Z_AI_CONFIG;
  const hasFileConfig = fs.existsSync('/etc/.z-ai-config') || fs.existsSync(path.join(process.env.HOME || '', '.z-ai-config')) || fs.existsSync('/tmp/.z-ai-config');
  return {
    provider: config.provider,
    model: config.model,
    configured: config.provider !== 'zai' || hasEnvConfig || hasFileConfig,
    free: config.free,
    reasoningModel: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
  };
}
