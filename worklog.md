---
Task ID: 2
Agent: main-agent (Super Z)
Task: 将 TOP 8 蓝海赛道全部做成产品（统一平台 Lumina Studio）

Work Log:
- 与用户确认 5 个关键决策（架构/首批赛道/品牌/计费/范围），用户回复"继续"
- 加载 fullstack-dev skill 并初始化 Next.js 16 项目环境
- 评估现有项目（已有 Mystic AI 灵性陪伴 App 第一版，含 7 个子模块）
- 决策：升级为统一平台 Lumina Studio，8 赛道卡片首页 + 4 个可上线赛道 + 4 个 roadmap
- 升级 Prisma schema 添加 Storybook / PromptItem / DirectoryItem 三个新数据模型
- 推送 schema 到 SQLite 数据库（db:push）
- 升级 src/lib/mystic.ts：保留原有 7 个 PROMPTS，新增 storybook / promptGenerator / directoryDescription / landingCopy 4 个 Prompt
- 升级 src/app/api/mystic/route.ts：保留原 7 个 module，新增 storybook / promptGenerator / directoryDescribe 3 个 module
- 新建 src/app/api/directory/route.ts：处理目录站 + Prompt 库的 GET/POST/CRUD
- 重写 src/app/page.tsx（约 1700 行）：
  * 平台首页：8 赛道卡片网格（4 个 ONLINE + 4 个 ROADMAP）
  * 灵性陪伴赛道（保留已有 7 个子模块）
  * 新增 StorybookTrack：儿童故事书生成
  * 新增 DirectoryTrack：AI 工具目录站（含分类/提交/投票）
  * 新增 PromptsTrack：AI Prompt 库（含 AI 生成器）
- 更新 layout.tsx metadata 反映新品牌 Lumina Studio
- 修复 React useEffect setState lint 错误（使用 setTimeout 0 避免同步 setState）
- 通过 bun run lint（零错误零警告）
- 重启 dev server 解决 Prisma client 缓存问题
- Agent Browser 端到端验证：
  * 首页 8 赛道卡片完整渲染 ✓
  * 灵性陪伴赛道切换成功，7 个 tab 显示 ✓
  * 儿童故事书：填写"小米"→ 生成"小米的勇敢大冒险"故事 ✓
  * 目录站：提交"ChatGPT"工具 → 列表显示 ✓
  * Prompt 库：AI 生成"小红书种草笔记 Prompt 模板" → 完整渲染含 5 个章节 ✓
  * Prisma INSERT 语句执行成功（PromptItem / DirectoryItem / Storybook）✓

Stage Summary:
- 项目品牌：Lumina Studio · 8 大蓝海赛道 AI 原生产品矩阵
- 已上线 4 个赛道：
  1. AI 灵性陪伴（占星/塔罗/解梦/命理/纪念/家谱/每日能量，7 模块）
  2. AI 个性化儿童故事书（输入孩子信息 → 生成完整故事含插图 Prompt）
  3. AI 目录站（提交/投票/分类/SEO 友好）
  4. AI Prompt 库（AI 生成器 + 收藏 + 分享 + 变现）
- 路线图 4 个赛道：AI 数字纪念 / AI 照护者支持 / AI 家谱研究 / 垂直 AI 微 SaaS
- 技术栈：Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Prisma + z-ai-web-dev-sdk
- 代码量：约 1700 行前端 + 380 行后端
- 数据库模型：User / Reading / Dream / Memorial / Genealogy / DailyReport / Storybook / PromptItem / DirectoryItem
- 设计风格：神秘奢华美学（深紫罗兰 + 香槟金 + 灵光蓝），玻璃拟态卡片
- 完整可运行，所有核心交互经 Agent Browser 验证
- 截图证据：
  * /home/z/my-project/download/homepage.png（首页）
  * /home/z/my-project/download/prompt-success.png（Prompt 生成成功）
  * /home/z/my-project/download/directory-submit.png（目录站提交）
  * /home/z/my-project/download/storybook.png（故事书生成）
