import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'AI Toolkit · AI Tools Directory + Prompt Library',
  description: 'Discover the best AI tools and prompts in one place. Browse curated AI tools, agents, and SaaS products. Generate, save, and share powerful prompts.',
  keywords: ['AI tools', 'AI directory', 'prompt library', 'AI agents', 'SaaS directory', 'prompt generator'],
  openGraph: { title: 'AI Toolkit', description: 'AI Tools Directory + Prompt Library', type: 'website' },
  alternates: { canonical: '/toolkit' },
};

export default function Page() {
  return <StandaloneProduct productId="directory" />;
}
