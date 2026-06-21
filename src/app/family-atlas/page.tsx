import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/standalone-product';

export const metadata: Metadata = {
  title: 'Family Atlas · Family Stories · Origins · Heritage Narratives',
  description: 'Weave your family\'s history into a beautiful narrative. Document members, origins, traditions. Preserve your bloodline story for future generations.',
  keywords: ['genealogy', 'family tree', 'family history', 'heritage', 'ancestry', 'family stories'],
  openGraph: { title: 'Family Atlas', description: 'Family stories · Origins · Heritage', type: 'website' },
  alternates: { canonical: '/family-atlas' },
};

export default function Page() {
  return <StandaloneProduct productId="genealogy" />;
}
