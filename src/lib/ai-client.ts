/**
 * Lumina - Unified AI Client
 * Uses z-ai-web-dev-sdk with Z_AI_CONFIG env var (works on Vercel)
 * Falls back to direct fetch if SDK constructor fails
 */
import ZAI from 'z-ai-web-dev-sdk';
import OpenAI from 'openai';

export type AIProvider = 'deepseek' | 'openai' | 'zai';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  baseURL?: string;
  free: boolean;
}

let _zai: any | null = null;
let _openai: OpenAI | null = null;
let _zaiConfig: any | null = null;

function loadZaiConfig(): any | null {
  if (_zaiConfig) return _zaiConfig;
  
  // Try environment variable (for Vercel)
  if (process.env.Z_AI_CONFIG) {
    try { _zaiConfig = JSON.parse(process.env.Z_AI_CONFIG); return _zaiConfig; } catch {}
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
  
  // Try using SDK with config from env var
  const config = loadZaiConfig();
  if (config) {
    try {
      // Use SDK constructor directly
      _zai = new (ZAI as any)(config);
      return _zai;
    } catch (e) {
      console.error('ZAI constructor failed, using direct fetch:', e);
    }
  }
  
  // Fallback to standard create (local dev with /etc/.z-ai-config)
  _zai = await ZAI.create();
  return _zai;
}

// Direct fetch fallback for Vercel (bypasses SDK file system requirement)
async function callZaiDirect(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; } = {}
): Promise<string> {
  const config = loadZaiConfig();
  if (!config) throw new Error('No Z.AI config available');
  
  const { temperature = 0.8, maxTokens = 2048 } = options;
  const url = `${config.baseUrl}/chat/completions`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'X-Z-AI-From': 'Z',
  };
  if (config.token) {
    headers['X-Token'] = config.token;
  }
  
  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    model: 'glm-4.6',
    thinking: { type: 'disabled' },
    ...(config.chatId ? { chatId: config.chatId } : {}),
    ...(config.userId ? { userId: config.userId } : {}),
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Z.AI API error ${response.status}: ${errText}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export type AIStreamCallback = (chunk: string, full: string) => void;

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; onChunk?: AIStreamCallback; preferReasoning?: boolean; } = {}
): Promise<string> {
  const { temperature = 0.8, maxTokens = 2048, onChunk, preferReasoning } = options;
  const config = getAIConfig();

  // DeepSeek path
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

  // OpenAI path
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

  // Z.AI path - try SDK first, fallback to direct fetch
  const envConfig = loadZaiConfig();
  if (envConfig) {
    // On Vercel: use direct fetch (bypasses SDK file system requirement)
    const content = await callZaiDirect(systemPrompt, userPrompt, { temperature, maxTokens });
    if (onChunk) {
      const chunks = content.match(/[^。！？\n]+[。！？\n]?/g) || [content];
      let acc = '';
      for (const chunk of chunks) { acc += chunk; onChunk(chunk, acc); }
    }
    return content;
  }
  
  // Local dev: use SDK normally
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
  return {
    provider: config.provider,
    model: config.model,
    configured: config.provider !== 'zai' || hasEnvConfig,
    free: config.free,
    reasoningModel: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
  };
}
