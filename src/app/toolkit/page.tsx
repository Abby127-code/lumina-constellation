import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'AI Toolkit',
  description: 'AI tools directory and prompt library. Find the right AI tool every time.',
  openGraph: { title: 'AI Toolkit', description: 'AI tools directory and prompt library. Find the right AI tool every time.', type: 'website', url: '/toolkit' },
  twitter: { card: 'summary_large_image', title: 'AI Toolkit', description: 'AI tools directory and prompt library. Find the right AI tool every time.' },
  alternates: { canonical: '/toolkit' },
};

export default function Page() {
  return <ProductPage productId="directory" />;
}
