'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Share2, Twitter, Facebook, Link2, Check, MessageCircle, Send, Mail, X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ data, size = 'sm' }: { data: ShareData; size?: 'sm' | 'default' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const shareUrl = data.url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(data.title);
  const encodedText = encodeURIComponent(data.text);

  const platforms = [
    {
      name: 'Twitter / X',
      icon: <Twitter className="w-4 h-4" />,
      color: 'hover:bg-black hover:text-white',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      color: 'hover:bg-blue-600 hover:text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'hover:bg-green-500 hover:text-white',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: <Send className="w-4 h-4" />,
      color: 'hover:bg-sky-500 hover:text-white',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      color: 'hover:bg-amber-500 hover:text-white',
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: '✅ 链接已复制', description: shareUrl });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: '复制失败', variant: 'destructive' });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, text: data.text, url: shareUrl });
      } catch {}
    } else {
      setOpen(!open);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        size={size}
        variant="outline"
        onClick={nativeShare}
        className="border-gold/40 text-gold hover:bg-gold/10 text-xs"
      >
        <Share2 className="w-3 h-3 mr-1" /> 分享
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 bg-zinc-900/95 backdrop-blur-md border border-gold/30 rounded-lg shadow-2xl py-2 min-w-[200px]">
          <div className="px-3 py-1 text-[10px] text-purple-300/60 uppercase tracking-wider">分享到</div>
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 text-xs text-purple-100 hover:text-white transition-colors ${p.color}`}
            >
              {p.icon}
              <span className="flex-1">{p.name}</span>
            </a>
          ))}
          <div className="border-t border-gold/20 my-1" />
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-100 hover:bg-gold/10"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
            <span className="flex-1 text-left">{copied ? '已复制' : '复制链接'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
