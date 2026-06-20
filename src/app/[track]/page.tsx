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
    title: '✦ Vega · AI Spiritual Companion | Lumina Constellation',
    description: 'Vega, the Weaver of Fate. AI astrology, tarot, dream interpretation, Bazi, daily energy reports. One of 8 stars in the Lumina constellation.',
  },
  storybook: {
    title: '★ Andromeda · AI Kids Storybook | Lumina Constellation',
    description: 'Andromeda, Liberator of Imagination. Personalized AI children storybooks with illustrations. DreamStories.ai reached $6M ARR.',
  },
  directory: {
    title: '✧ Polaris · AI Directory | Lumina Constellation',
    description: 'Polaris, the Eternal Guide. AI tools directory with programmatic SEO. Verified $34K MRR model.',
  },
  prompts: {
    title: '✦ Sirius · AI Prompt Library | Lumina Constellation',
    description: 'Sirius, Illuminator of Language. AI Prompt marketplace for writing, marketing, coding, design.',
  },
  memorial: {
    title: '✧ Pleiades · AI Digital Memorial | Lumina Constellation',
    description: 'Pleiades, Memory Across Time. Tribute biographies for loved ones. AI-generated letters from the departed.',
  },
  caregiver: {
    title: '★ Lyra · AI Caregiver Support | Lumina Constellation',
    description: 'Lyra, the Healing Song. 24/7 AI assistant for family caregivers: symptoms, mood, medication, logs.',
  },
  genealogy: {
    title: '✦ Cassiopeia · AI Genealogy | Lumina Constellation',
    description: 'Cassiopeia, the Bloodline Queen. AI genealogy: photo restoration, OCR, family narratives.',
  },
  microsaas: {
    title: '✧ Orion · AI Micro SaaS Generator | Lumina Constellation',
    description: 'Orion, the Opportunity Hunter. Generate Micro SaaS ideas: Chrome extensions, Notion plugins, Slack bots.',
  },
  account: {
    title: 'Account · History · Favorites · Billing | Lumina Constellation',
    description: 'View your AI generation history, favorites, subscription billing, and preferences.',
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
