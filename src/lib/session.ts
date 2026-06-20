/**
 * Lumina Studio Session Store
 * 支持匿名用户 + 邮箱注册用户
 * 支持多语言切换
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n';

export interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  avatar?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
  plan: 'free' | 'pro' | 'premium';
  trialEndsAt?: string;
  locale: Locale; // default: 'en'
  isAuthed: boolean;
  subStatus?: string;
  currentPeriodEnd?: string;
}

interface SessionState {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setLocale: (locale: Locale) => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      updateProfile: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        })),
      setLocale: (locale) =>
        set((state) => ({
          user: state.user ? { ...state.user, locale } : state.user,
        })),
      logout: () => set({ user: null }),
    }),
    { name: 'lumina-studio-session' }
  )
);

/** 配额检查 hook（客户端） */
export function useQuota() {
  const { user } = useSession();
  return {
    canUse: async (): Promise<boolean> => {
      if (!user) return false;
      try {
        const res = await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check-quota', userId: user.userId }),
        });
        const data = await res.json();
        return data.remaining > 0;
      } catch {
        return true; // 失败时允许使用，避免阻塞
      }
    },
    increment: async (): Promise<void> => {
      if (!user) return;
      try {
        await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'increment-usage', userId: user.userId }),
        });
      } catch {}
    },
  };
}
