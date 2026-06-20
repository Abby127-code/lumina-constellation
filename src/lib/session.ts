/**
 * 简易用户 Session Store (Zustand)
 * MVP 阶段：使用本地匿名用户（首次访问自动创建一个 DB User）
 * 后续可接入 NextAuth / Stripe Customer
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  avatar?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
  plan: 'free' | 'pro' | 'premium';
  trialEndsAt?: string;
}

interface SessionState {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
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
      logout: () => set({ user: null }),
    }),
    { name: 'mystic-ai-session' }
  )
);
