import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/standalone-product';
import type { ProductId } from '@/lib/product-types';

export const metadata: Metadata = {
  title: 'Lumina Spiritual · Astrology · Tarot · Numerology · Daily Energy',
  description: 'Your personal spiritual companion. Birth chart readings, tarot spreads, Bazi numerology, and personalized daily energy reports. Deep, insightful, warm.',
  keywords: ['astrology', 'tarot', 'numerology', 'bazi', 'daily energy', 'birth chart', 'spiritual'],
  openGraph: { title: 'Lumina Spiritual', description: 'Astrology · Tarot · Numerology · Daily Energy', type: 'website' },
  alternates: { canonical: '/spiritual' },
};

export default function Page() {
  return <StandaloneProduct productId="mystic" />;
}
