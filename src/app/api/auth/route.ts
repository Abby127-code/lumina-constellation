/**
 * 认证 API：邮箱注册 / 登录 / 退出 / 获取当前用户
 * POST /api/auth  { action: 'register'|'login'|'logout'|'me', ... }
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + ':lumina-salt').digest('hex');
}

function genToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function setCookie(name: string, value: string, days: number = 30): string {
  const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  return `${name}=${value}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax`;
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'register') {
      const { email, password, name } = body as { email: string; password: string; name?: string };
      if (!email || !password) {
        return NextResponse.json({ error: '邮箱和密码必填' }, { status: 400 });
      }
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 });
      }
      const user = await db.user.create({
        data: {
          email,
          passwordHash: hashPassword(password),
          name: name || email.split('@')[0],
          plan: 'free',
          trialEndsAt: new Date(Date.now() + 7 * 86400 * 1000),
        },
      });
      const token = genToken();
      await db.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
        },
      });
      const res = NextResponse.json({
        success: true, user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      });
      res.headers.set('Set-Cookie', setCookie('lumina_token', token));
      return res;
    }

    if (action === 'login') {
      const { email, password } = body as { email: string; password: string };
      const user = await db.user.findUnique({ where: { email } });
      if (!user || user.passwordHash !== hashPassword(password)) {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
      }
      const token = genToken();
      await db.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
        },
      });
      const res = NextResponse.json({
        success: true, user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      });
      res.headers.set('Set-Cookie', setCookie('lumina_token', token));
      return res;
    }

    if (action === 'logout') {
      const token = req.cookies.get('lumina_token')?.value;
      if (token) {
        await db.userSession.deleteMany({ where: { token } }).catch(() => {});
      }
      const res = NextResponse.json({ success: true });
      res.headers.set('Set-Cookie', clearCookie('lumina_token'));
      return res;
    }

    if (action === 'me') {
      const token = req.cookies.get('lumina_token')?.value;
      if (!token) {
        return NextResponse.json({ user: null });
      }
      const session = await db.userSession.findUnique({
        where: { token },
        include: { user: true },
      });
      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json({ user: null });
      }
      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          plan: session.user.plan,
          locale: session.user.locale,
          avatar: session.user.avatar,
          birthDate: session.user.birthDate,
          birthTime: session.user.birthTime,
          birthPlace: session.user.birthPlace,
          gender: session.user.gender,
          trialEndsAt: session.user.trialEndsAt,
          stripeSubId: session.user.stripeSubId,
          subStatus: session.user.subStatus,
          currentPeriodEnd: session.user.currentPeriodEnd,
        },
      });
    }

    if (action === 'updateLocale') {
      const token = req.cookies.get('lumina_token')?.value;
      const { locale } = body as { locale: string };
      if (!token) {
        return NextResponse.json({ success: true, locale }); // 匿名用户：仅前端记忆
      }
      const session = await db.userSession.findUnique({ where: { token } });
      if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      await db.user.update({ where: { id: session.userId }, data: { locale } });
      return NextResponse.json({ success: true, locale });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ service: 'Lumina Auth API', status: 'online' });
}
