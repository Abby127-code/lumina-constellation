import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'Lumina Spiritual · Astrology · Tarot · Numerology · Daily Energy',
  description: 'Your personal spiritual companion. Birth chart readings, tarot spreads, Bazi numerology, and personalized daily energy reports. Deep, insightful, warm.',
  keywords: ['astrology', 'tarot', 'numerology', 'bazi', 'daily energy', 'birth chart', 'spiritual'],
  openGraph: { title: 'Lumina Spiritual', description: 'Astrology · Tarot · Numerology · Daily Energy', type: 'website', url: '/spiritual' },
  twitter: { card: 'summary_large_image', title: 'Lumina Spiritual', description: 'Astrology · Tarot · Numerology · Daily Energy' },
  alternates: { canonical: '/spiritual' },
};

export default function Page() {
  return <ProductPage productId="mystic" />;
}
