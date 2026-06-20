'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

export function useMysticCall(defaultModule?: string) {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);

  const call = useCallback(async (module: string, input: any) => {
    setLoading(true);
    setResult('');
    setMetadata(null);
    try {
      const res = await fetch('/api/mystic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, input, userId: user?.userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI 调用失败');
      }
      setResult(data.result);
      setMetadata(data.metadata);
      toast({ title: '✨ 生成完成' });
    } catch (e: any) {
      toast({
        title: '调用失败',
        description: e?.message || '请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return { loading, result, metadata, call, setResult };
}
