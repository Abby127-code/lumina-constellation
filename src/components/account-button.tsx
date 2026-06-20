'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/lib/session';
import { useLocale } from '@/components/locale-provider';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Lock, User, LogOut, Crown, Zap, Infinity as InfIcon } from 'lucide-react';
import { PLANS } from '@/app/api/stripe/route';

export function AccountButton() {
  const { user, setUser, logout } = useSession();
  const { t } = useLocale();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.user) {
        setUser({
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
          plan: data.user.plan,
          locale: 'zh',
          isAuthed: true,
          subStatus: data.user.subStatus,
        });
        toast({ title: `✅ ${t('auth.welcome')}`, description: data.user.email });
        setOpen(false);
        setForm({ email: '', password: '', name: '' });
      }
    } catch (e: any) {
      toast({ title: '❌ ' + (e?.message || 'Failed'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    logout();
    toast({ title: '已退出' });
  };

  if (user?.isAuthed) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${
          user.plan === 'premium' ? 'border-amber-400 text-amber-300' :
          user.plan === 'pro' ? 'border-sky-400 text-sky-300' :
          'border-purple-400/50 text-purple-200'
        }`}>
          {user.plan === 'premium' && <Crown className="w-2.5 h-2.5 mr-1" />}
          {user.plan === 'pro' && <Zap className="w-2.5 h-2.5 mr-1" />}
          {user.plan === 'free' && <InfIcon className="w-2.5 h-2.5 mr-1" />}
          {(PLANS as any)[user.plan]?.name || user.plan.toUpperCase()}
        </Badge>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-purple-200/70 hover:text-rose-300 text-xs px-2">
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-purple-200/80 hover:text-gold hover:bg-gold/10 text-xs">
          <Mail className="w-3.5 h-3.5 mr-1.5" />
          {t('auth.login')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-gold/30 max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-gold text-xl">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {mode === 'register' && (
            <div>
              <Label className="text-purple-200/80 text-xs mb-1.5 block">{t('auth.name')}</Label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-300/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Lumina"
                  className="bg-white/5 border-gold/30 text-white pl-10"
                />
              </div>
            </div>
          )}
          <div>
            <Label className="text-purple-200/80 text-xs mb-1.5 block">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-300/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="bg-white/5 border-gold/30 text-white pl-10"
              />
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-1.5 block">{t('auth.password')}</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-300/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="••••••••"
                className="bg-white/5 border-gold/30 text-white pl-10"
              />
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={loading || !form.email || !form.password}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500"
          >
            {loading ? '...' : (mode === 'login' ? t('auth.login') : t('auth.register'))}
          </Button>
          <div className="text-center text-xs text-purple-200/60">
            {mode === 'login' ? (
              <>
                {t('auth.register')}?
                <button onClick={() => setMode('register')} className="text-gold hover:underline ml-1">
                  {t('auth.register')}
                </button>
              </>
            ) : (
              <>
                {t('auth.login')}?
                <button onClick={() => setMode('login')} className="text-gold hover:underline ml-1">
                  {t('auth.login')}
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
