import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/standalone-product';

export const metadata: Metadata = {
  title: 'Dream Journal · Record · Interpret · Track Your Subconscious',
  description: 'A dream journal that helps you understand your subconscious. Record dreams, get multi-perspective interpretations, track recurring themes over time.',
  keywords: ['dream journal', 'dream interpretation', 'dream analysis', 'subconscious', 'jungian', 'freudian'],
  openGraph: { title: 'Dream Journal', description: 'Record · Interpret · Track your subconscious', type: 'website' },
  alternates: { canonical: '/dream' },
};

export default function Page() {
  return <StandaloneProduct productId="dream" />;
}
