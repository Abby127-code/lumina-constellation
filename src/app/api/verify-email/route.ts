/**
 * 邮箱验证 API（简化版）
 * POST /api/verify-email { action: 'send'|'verify', email, code? }
 *
 * 生成 6 位验证码，存数据库（复用 UserSession 临时记录）
 * 实际邮件发送需要配置 RESEND_API_KEY 或类似服务
 * 未配置邮件服务时，验证码会返回在 response 中（仅供测试）
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// 简化：内存存储验证码 { email: { code, expires } }
const codeStore = new Map<string, { code: string; expires: number }>();

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'send') {
      const { email } = body as { email: string };
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

      const code = genCode();
      codeStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000 }); // 10 分钟有效

      // 尝试发送邮件（如果配置了 RESEND_API_KEY）
      const hasMailer = !!process.env.RESEND_API_KEY;
      if (hasMailer) {
        try {
          // 动态 import 避免 build 时模块未安装报错
          const resendModule = await import('resend' as any).catch(() => null);
          if (resendModule) {
            const { Resend } = resendModule;
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: process.env.MAIL_FROM || 'Lumina Constellation <support@dealcanny.com>',
              to: email,
              subject: '[Lumina Studio] 邮箱验证码',
              html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                  <h2 style="color: #E8B14F;">Lumina Studio 邮箱验证</h2>
                  <p>你的验证码是：</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0A2540; background: #FAF6EC; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
                    ${code}
                  </div>
                  <p style="color: #666; font-size: 12px;">验证码 10 分钟内有效。如非本人操作请忽略此邮件。</p>
                </div>
              `,
            });
            return NextResponse.json({ success: true, sent: true });
          }
        } catch (e: any) {
          console.error('Mail send error:', e);
          // 邮件发送失败，回退到返回验证码（测试模式）
        }
      }

      // 测试模式：直接返回验证码
      return NextResponse.json({
        success: true,
        sent: false,
        code, // ⚠️ 仅测试模式返回，生产环境移除
        message: '邮件服务未配置，验证码已直接返回（测试模式）',
      });
    }

    if (action === 'verify') {
      const { email, code } = body as { email: string; code: string };
      const stored = codeStore.get(email);
      if (!stored) return NextResponse.json({ error: '请先发送验证码' }, { status: 400 });
      if (Date.now() > stored.expires) {
        codeStore.delete(email);
        return NextResponse.json({ error: '验证码已过期，请重新发送' }, { status: 400 });
      }
      if (stored.code !== code) {
        return NextResponse.json({ error: '验证码错误' }, { status: 400 });
      }
      codeStore.delete(email);
      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
