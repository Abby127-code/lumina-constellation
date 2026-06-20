'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationBell() {
  const { user } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-notifications', userId: user.userId, limit: 20 }),
      });
      const data = await res.json();
      setItems(data.items || []);
      setUnread((data.items || []).filter((i: any) => !i.isRead).length);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      const t = setTimeout(() => load(), 0);
      const interval = setInterval(load, 30000);
      return () => { clearTimeout(t); clearInterval(interval); };
    }
  }, [user]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    if (!user) return;
    await fetch('/api/engage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read', userId: user.userId }),
    });
    setItems(items.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
    toast({ title: '✅ 全部已读' });
  };

  const markRead = async (id: string) => {
    await fetch('/api/engage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-notification-read', notificationId: id }),
    });
    setItems(items.map((i) => i.id === id ? { ...i, isRead: true } : i));
    setUnread(Math.max(0, unread - 1));
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="text-purple-200/80 hover:text-gold hover:bg-gold/10 relative p-2"
      >
        <Bell className="w-3.5 h-3.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 bg-zinc-900/95 backdrop-blur-md border border-gold/30 rounded-lg shadow-2xl py-1 min-w-[300px] max-w-[340px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gold/20">
            <span className="text-gold text-xs font-semibold">通知中心</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-emerald-300 text-[10px] hover:underline">
                全部已读
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto custom-scroll">
            {items.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-6 h-6 text-purple-300/40 mx-auto mb-2" />
                <p className="text-purple-200/60 text-xs">暂无通知</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2 border-b border-white/5 hover:bg-gold/5 cursor-pointer ${!n.isRead ? 'bg-gold/5' : ''}`}
                  onClick={() => !n.isRead && markRead(n.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">{n.icon || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-100 text-xs font-medium">{n.title}</p>
                      <p className="text-purple-200/70 text-[10px] mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-purple-300/40 text-[9px] mt-1">
                        {new Date(n.createdAt).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
