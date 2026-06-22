'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  title: string;
  description: string;
}

export function ShareButtons({ title, description }: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: '✅ Link copied' });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {}
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button size="sm" variant="outline" onClick={nativeShare} className="text-xs gap-1.5 border-[var(--p-border)] product-app-muted">
        <Share2 className="w-3 h-3" /> Share
      </Button>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs product-app-muted hover:opacity-80 border border-[var(--p-border)]">
        <Twitter className="w-3 h-3" />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs product-app-muted hover:opacity-80 border border-[var(--p-border)]">
        <Facebook className="w-3 h-3" />
      </a>
      <Button size="sm" variant="ghost" onClick={copyLink} className="text-xs product-app-muted p-1.5">
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Link2 className="w-3 h-3" />}
      </Button>
    </div>
  );
}
