import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'Dream Journal',
  description: 'Record, interpret and track your dreams. Multi-framework analysis.',
  openGraph: { title: 'Dream Journal', description: 'Record, interpret and track your dreams. Multi-framework analysis.', type: 'website', url: '/dream' },
  twitter: { card: 'summary_large_image', title: 'Dream Journal', description: 'Record, interpret and track your dreams. Multi-framework analysis.' },
  alternates: { canonical: '/dream' },
};

export default function Page() {
  return <ProductPage productId="dream" />;
}
