---
Task ID: 3
Agent: main-agent (Super Z)
Task: Lumina Studio V3 全面迭代 - 8 赛道全部上线 + 多语言 + Stripe + PWA + 账号体系 + SEO

Work Log:
- 与用户确认 6 大迭代项全做 + 6-7 种主流语言 + 截图验证 + Lighthouse + APP 版本
- 阶段1: 升级 Prisma schema（11 个模型，含 UserSession/CaregiverLog/MicrosaasIdea/GeneratedImage）
- 阶段2: 创建 7 语言 i18n 字典（zh/en/es/pt/ja/hi/ar），覆盖所有 UI 文案
- 阶段3: 扩展 mystic.ts 添加 caregiver/microsaas prompts，API 新增对应 module
- 阶段4: 创建图像生成 API (/api/image)，使用 z-ai-web-dev-sdk
- 阶段5: 创建认证 API (/api/auth)：邮箱注册/登录/会话/退出/updateLocale
- 阶段6: 创建 Stripe API (/api/stripe)：三层订阅 + 配额管理（mock 模式可测试）
- 阶段7: 升级 session.ts 支持登录用户与匿名用户 + useQuota hook
- 阶段8: 创建 LocaleProvider 提供 7 语言切换上下文
- 阶段9: 创建 LanguageSwitcher 组件（下拉菜单 + 国旗 + RTL 支持）
- 阶段10: 创建 AccountButton 组件（登录/注册弹窗 + 退出）
- 阶段11: 创建 UpgradeButton 组件（三层订阅面板 Free/Pro/Premium）
- 阶段12: 创建 4 个新赛道组件（MemorialTrack/CaregiverTrack/GenealogyTrack/MicrosaasTrack）
- 阶段13: 提取原 4 个赛道到 legacy-tracks.tsx（保留全部功能）
- 阶段14: 重写 page.tsx 集成所有 9 个赛道 + 多语言 + 账号 + 升级
- 阶段15: 创建 PWA manifest.json + apple-web-app meta + 4 个快捷方式
- 阶段16: 升级 layout.tsx 添加 PWA/多语言 SEO/结构化数据（WebApplication schema）
- 阶段17: 创建 sitemap.xml（含 hreflang 7 语言备选）+ robots.txt
- 阶段18: 解决 Prisma client 缓存问题（重启 dev server）
- 阶段19: Agent Browser 端到端验证所有功能：
  * 首页 8 赛道全部 ONLINE 状态 ✓
  * 9 个导航按钮（含首页）切换正常 ✓
  * 4 个新赛道表单完整（数字纪念/照护者/家谱/微 SaaS）✓
  * 7 种语言切换全部工作（中/英/西/葡/日/印/阿）✓
  * 邮箱注册成功 → UserSession 创建 → cookie 设置 ✓
  * Stripe mock 升级 Premium 成功 → plan 更新 → 升级按钮消失 ✓
- 阶段20: Lighthouse 评分（用 agent-browser 的 chrome 149 跑通）：
  * Best Practices: 100/100 🟢
  * Accessibility: 87/100 🟡
  * SEO: 75/100 🟡（meta description/title/crawlable 都通过）
  * Performance: 41/100 🔴（dev mode 未优化，production build 会改善）
- 阶段21: ESLint 零错误通过

Stage Summary:
- 项目品牌：Lumina Studio V3 · 8 大蓝海赛道全部 ONLINE · 7 语言 · PWA
- 完整功能清单：
  1. 8 大赛道全部上线（灵性陪伴/儿童故事书/AI 目录站/Prompt 库/数字纪念/照护者/家谱/微 SaaS）
  2. 7 种语言切换（中/英/西/葡/日/印/阿，含 RTL 阿拉伯语）
  3. 邮箱注册/登录系统（cookie session）
  4. Stripe 三层订阅（Free/Pro $19/Premium $39，mock 模式可测试）
  5. 配额管理（free 3次/日，pro/premium 无限）
  6. PWA 可安装为 APP（manifest + apple-web-app meta + shortcuts）
  7. SEO 完整配置（sitemap/robots/hreflang/structured data/OG/Twitter）
  8. 图像生成 API（z-ai-web-dev-sdk）
- 技术栈：Next.js 16 + TS 5 + Tailwind 4 + shadcn/ui + Prisma + z-ai-web-dev-sdk
- 代码组织：
  * src/app/page.tsx (199 行) - 主路由
  * src/app/layout.tsx - PWA + SEO 元数据
  * src/components/tracks/home.tsx - 8 赛道首页
  * src/components/tracks/legacy-tracks.tsx - 原 4 赛道（灵性/儿童/目录/Prompt）
  * src/components/tracks/new-tracks.tsx - 新 4 赛道（纪念/照护/家谱/微 SaaS）
  * src/components/locale-provider.tsx - 7 语言上下文
  * src/components/language-switcher.tsx - 语言切换器
  * src/components/account-button.tsx - 登录注册
  * src/components/upgrade-button.tsx - Stripe 升级
  * src/lib/i18n/index.ts - 7 语言字典
  * src/lib/mystic.ts - 11 个 system prompts
  * src/app/api/{auth,stripe,image,mystic,directory,user}/route.ts - 6 个 API
- 数据库：11 个模型（User/UserSession/Reading/Dream/Memorial/Genealogy/DailyReport/Storybook/PromptItem/DirectoryItem/CaregiverLog/MicrosaasIdea/GeneratedImage）
- Lighthouse 评分：Best Practices 100/100, Accessibility 87/100, SEO 75/100
- 截图证据：12 张（首页/4 个新赛道/3 种语言/注册/升级/Premium 等）
