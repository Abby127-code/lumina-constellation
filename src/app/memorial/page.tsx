import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'Memorial',
  description: 'Tribute biographies and healing letters for departed loved ones.',
  openGraph: { title: 'Memorial', description: 'Tribute biographies and healing letters for departed loved ones.', type: 'website', url: '/memorial' },
  twitter: { card: 'summary_large_image', title: 'Memorial', description: 'Tribute biographies and healing letters for departed loved ones.' },
  alternates: { canonical: '/memorial' },
};

export default function Page() {
  return <ProductPage productId="memorial" />;
}
