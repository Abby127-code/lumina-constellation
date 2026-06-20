'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

/**
 * AI 流式调用 hook
 * 通过 SSE 接收 chunk，实时更新 UI
 */
export function useStreamCall() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  const call = useCallback(async (module: string, input: any) => {
    setLoading(true);
    setResult('');
    setMetadata(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/mystic-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, input, userId: user?.userId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error('Stream failed');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'metadata') {
                setMetadata(data.metadata);
              } else if (data.type === 'chunk') {
                setResult((prev) => prev + data.chunk);
              } else if (data.type === 'done') {
                setResult(data.full);
                toast({ title: '✨ 生成完成' });
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch {}
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        toast({
          title: '调用失败',
          description: e?.message || '请稍后再试',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [user, toast]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { loading, result, metadata, call, abort, setResult };
}
