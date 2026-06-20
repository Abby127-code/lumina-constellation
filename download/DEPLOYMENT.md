# Lumina Studio 部署指南

## 一、本地开发

### 1. 环境准备
```bash
# 安装依赖
bun install

# 复制环境变量模板
cp .env.example .env

# 编辑 .env，至少配置 DEEPSEEK_API_KEY
# DeepSeek API key 申请：https://platform.deepseek.com/api_keys
```

### 2. 数据库初始化
```bash
bun run db:push    # 创建 SQLite 数据库
bun run db:generate  # 生成 Prisma Client
```

### 3. 启动开发服务器
```bash
bun run dev
# 访问 http://localhost:3000
```

### 4. 代码质量检查
```bash
bun run lint       # ESLint
```

---

## 二、生产部署到 Vercel

### 1. 准备 Git 仓库
```bash
git init
git add .
git commit -m "Initial commit: Lumina Studio"
git branch -M main
git remote add origin https://github.com/你的用户名/lumina-studio.git
git push -u origin main
```

### 2. 在 Vercel 部署
1. 访问 https://vercel.com/new
2. 选择你的 GitHub 仓库
3. Framework Preset: **Next.js**
4. Root Directory: `./`
5. Build Command: `next build`（Vercel 自动识别）
6. Install Command: `bun install`
7. 点击 **Deploy**

### 3. 配置环境变量
在 Vercel 项目设置 → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `file:/tmp/lumina.db` | Vercel 用临时文件系统 |
| `DEEPSEEK_API_KEY` | `sk-xxx` | DeepSeek API key |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 默认模型 |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` | （可选）真实 Stripe |
| `RESEND_API_KEY` | `re_xxx` | （可选）邮件服务 |

> ⚠️ **重要**：Vercel Serverless 函数是无状态的，SQLite 文件系统不适合生产。建议改用：
> - **Supabase**（免费 PostgreSQL）— 推荐方案
> - **PlanetScale**（MySQL）
> - **Neon**（PostgreSQL）

### 4. 切换到 Supabase 数据库（推荐）

```bash
# 1. 在 https://supabase.com 创建项目
# 2. 在 Settings → Database 获取 connection string

# 3. 修改 prisma/schema.prisma
# provider = "postgresql"  # 改为 postgresql
# url = env("DATABASE_URL")

# 4. 设置环境变量
# DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# 5. 推送 schema
bun run db:push
```

### 5. 自定义域名
1. 在 Vercel 项目 → Settings → Domains
2. 添加你的域名（如 `lumina.studio`）
3. 按提示配置 DNS：
   - 添加 `A` 记录指向 `76.76.21.21`
   - 或 `CNAME` 记录指向 `cname.vercel-dns.com`
4. Vercel 自动签发 SSL 证书（Let's Encrypt）

---

## 三、Stripe 真实支付配置

### 1. 申请 Stripe 账户
- 访问 https://dashboard.stripe.com/register
- 完成邮箱验证 + 业务信息

### 2. 创建产品与价格
```
Stripe Dashboard → Products → Add product

产品 1：Lumina Pro
- 价格：$19.00 USD / month
- 类型：Recurring
- 记下 price_id：price_xxxxx

产品 2：Lumina Premium
- 价格：$39.00 USD / month
- 类型：Recurring
- 记下 price_id：price_yyyyy
```

### 3. 获取 API Keys
```
Dashboard → Developers → API keys
- Publishable key: pk_live_xxx
- Secret key: sk_live_xxx
```

### 4. 配置 Webhook
```
Dashboard → Developers → Webhooks → Add endpoint
- URL: https://你的域名/api/stripe-webhook
- 事件：
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
- 记下 signing secret：whsec_xxx
```

### 5. 更新环境变量
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_yyyyy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 6. 升级 stripe API 路由
打开 `src/app/api/stripe/route.ts`，替换 mock 模式为真实 Stripe Checkout：
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// create-checkout action
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?track=account&status=success`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?track=account&status=cancel`,
  client_reference_id: userId,
  customer_email: user.email,
});
return NextResponse.json({ url: session.url });
```

---

## 四、邮件服务配置（Resend）

### 1. 申请 Resend
- 访问 https://resend.com
- 注册 + 验证域名（如 lumina.studio）

### 2. 获取 API Key
```
Dashboard → API Keys → Create API Key
- 权限：Sending access
- 记下 key：re_xxx
```

### 3. 配置环境变量
```env
RESEND_API_KEY=re_xxx
MAIL_FROM=Lumina Studio <noreply@lumina.studio>
```

### 4. 安装 SDK
```bash
bun add resend
```

邮箱验证 API 已支持 Resend，配置后自动从测试模式切换到真实邮件发送。

---

## 五、性能优化清单

### 1. 构建生产版本
```bash
bun run build
# 输出在 .next/standalone/
```

### 2. 启用 Next.js 实验性功能
在 `next.config.ts` 中：
```typescript
const config = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### 3. 图片优化
```bash
bun add sharp
```
使用 `next/image` 组件自动优化图片。

### 4. 数据库索引
确认 Prisma schema 中高频查询字段已有 `@@index`（本项目中已配置）。

---

## 六、监控与分析

### 1. Sentry 错误监控
```bash
bun add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 2. PostHog 产品分析
```bash
bun add posthog-js
```

### 3. Plausible 网站分析
- 注册 https://plausible.io
- 在 layout.tsx 添加 script 标签

---

## 七、SEO 优化

### 1. 提交 sitemap 到 Google
- 访问 https://search.google.com/search-console
- 添加你的域名
- 提交 sitemap：`https://你的域名/sitemap.xml`

### 2. 提交到 Bing
- 访问 https://www.bing.com/webmasters
- 提交 sitemap

### 3. 检查结构化数据
- 访问 https://search.google.com/test/rich-results
- 输入你的 URL，验证 WebApplication schema

---

## 八、常见问题

### Q: Vercel 部署后 SQLite 数据丢失？
**A**: Vercel Serverless 是无状态的，文件系统不持久。请改用 Supabase 或 Neon 等托管 PostgreSQL。

### Q: DeepSeek API 调用失败？
**A**: 检查：
1. API key 是否正确（sk- 开头）
2. 账户余额是否充足（https://platform.deepseek.com/usage）
3. 网络是否能访问 `https://api.deepseek.com`

### Q: PWA 安装提示不出现？
**A**: PWA 要求 HTTPS 环境。localhost 可能不显示安装提示，部署到 Vercel 后再测试。

### Q: 流式输出（SSE）在生产环境不工作？
**A**: 检查：
1. Vercel 函数超时设置（Hobby plan 10s，Pro plan 60s）
2. 启用 Edge Runtime：在 route.ts 中 `export const runtime = 'edge'`
3. 反向代理（如 Cloudflare）需关闭缓冲

### Q: 多语言切换后部分文案仍是中文？
**A**: 字典覆盖不全，请在 `src/lib/i18n/index.ts` 中补充缺失的 key。

---

## 九、下一步建议

1. **第 1 周**：完成本地测试 + Vercel 部署 + 域名解析
2. **第 2 周**：切换到 Supabase + 配置 Stripe 真实支付
3. **第 3 周**：提交 Google Search Console + 启动 SEO 内容
4. **第 4 周**：在 Product Hunt 发布 + TikTok 内容运营
5. **第 5-12 周**：根据用户反馈迭代，重点优化付费转化漏斗

祝创业顺利！🚀
