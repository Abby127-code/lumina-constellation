import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/standalone-product';

export const metadata: Metadata = {
  title: 'Storybook Studio · Personalized Children\'s Stories',
  description: 'Create beautiful personalized storybooks for children. Input child\'s name and theme, get a complete illustrated story with moral lessons. Print-ready format.',
  keywords: ['children stories', 'personalized books', 'kids storybook', 'illustrated stories'],
  openGraph: { title: 'Storybook Studio', description: 'Personalized children\'s stories', type: 'website' },
  alternates: { canonical: '/storybook' },
};

export default function Page() {
  return <StandaloneProduct productId="storybook" />;
}
