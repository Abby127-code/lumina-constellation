/**
 * 独立赛道路由页（SEO 优化）
 * /mystic, /storybook, /directory, /prompts, /memorial, /caregiver, /genealogy, /microsaas, /account
 *
 * 这些路由只是渲染同一个客户端组件，但 Next.js 会为每个路由生成独立的 HTML，
 * 让搜索引擎索引到每个赛道的独立 URL。
 */
import { Metadata } from 'next';

const TRACK_META: Record<string, { title: string; description: string }> = {
  mystic: {
    title: 'AI 灵性陪伴 · 占星 · 塔罗 · 解梦 · 命理 | Lumina Studio',
    description: 'AI 原生灵性陪伴 App — 占星本命盘、塔罗占卜、解梦日记、命理八字、每日能量报告。AI 深度对话式解读，跨文化玄学体系。',
  },
  storybook: {
    title: 'AI 个性化儿童故事书 | Lumina Studio',
    description: '输入孩子名字+主题，AI 生成专属故事书，每页配插图 Prompt。DreamStories.ai 验证 $6M 营收模式。',
  },
  directory: {
    title: 'AI 工具目录站 · 优质 AI 工具收录 | Lumina Studio',
    description: '收录 AI 工具、AI Agent、SaaS 产品，构建程序化 SEO 目录站。已验证 $34K MRR 模式。',
  },
  prompts: {
    title: 'AI Prompt 库 · 创作 · 收藏 · 分享 · 变现 | Lumina Studio',
    description: 'AI Prompt 交易与收藏平台，覆盖写作、营销、编程、设计、个人成长等场景。PromptBase 验证模式。',
  },
  memorial: {
    title: 'AI 数字纪念 · 为逝者撰写传记 | Lumina Studio',
    description: '为逝去的亲人、朋友或宠物撰写纪念传记，AI 模拟逝者口吻写一封信。疗愈告别仪式。',
  },
  caregiver: {
    title: 'AI 照护者支持 · 24/7 家庭照护助手 | Lumina Studio',
    description: '面向家庭照护者的 AI 助手：症状解读、情绪支持、用药提醒、照护日志自动生成。',
  },
  genealogy: {
    title: 'AI 家谱研究 · 老照片修复 · 家族叙事 | Lumina Studio',
    description: 'AI 增强家谱研究：老照片修复与人物识别、历史文档 OCR、家族故事 AI 撰写。',
  },
  microsaas: {
    title: 'AI 微 SaaS 创意生成器 · 从 0 到 $10K MRR | Lumina Studio',
    description: '基于已验证模式快速孵化微 SaaS：Chrome 扩展、Notion 插件、Slack Bot、Zapier 集成等。',
  },
  account: {
    title: '个人中心 · 历史记录 · 收藏 · 账单 | Lumina Studio',
    description: '查看你的 AI 生成历史、收藏内容、订阅账单与偏好设置。',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params;
  const meta = TRACK_META[track] || { title: 'Lumina Studio', description: 'AI 原生蓝海产品矩阵' };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/?track=${track}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/?track=${track}`,
    },
  };
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  // 服务端渲染一个轻量级 SEO 友好占位，实际内容由客户端 hydrate 后接管
  const meta = TRACK_META[track];
  return (
    <div className="min-h-screen bg-mystic-gradient">
      <div className="absolute inset-0 starfield opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {meta && (
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gold mb-2">{meta.title.split(' | ')[0]}</h1>
            <p className="text-purple-200/70 text-sm">{meta.description}</p>
          </header>
        )}
        <div className="glass-card-dark border-gold/30 rounded-xl p-6 text-center">
          <p className="text-purple-200/70 text-sm">Loading interactive experience...</p>
          <a href={`/?track=${track}`} className="inline-block mt-4 text-gold underline text-sm">
            Click here if not redirected
          </a>
        </div>
      </div>
    </div>
  );
}
