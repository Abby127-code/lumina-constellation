import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'Family Atlas · Family Stories · Origins · Heritage Narratives',
  description: "Weave your family's history into a beautiful narrative. Document members, origins, traditions. Preserve your bloodline story.",
  openGraph: { title: 'Family Atlas', description: "Family stories, origins, and heritage narratives", type: 'website', url: '/family-atlas' },
  twitter: { card: 'summary_large_image', title: 'Family Atlas', description: 'Family stories and heritage' },
  alternates: { canonical: '/family-atlas' },
};

export default function Page() {
  return <ProductPage productId="genealogy" />;
}
