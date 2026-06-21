import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'Memorial · Tribute Biographies · Healing Letters',
  description: 'Honor your loved ones with beautiful tribute biographies. Capture their personality, memories, and legacy. Receive a letter in their voice.',
  keywords: ['memorial', 'tribute', 'biography', 'grief', 'remembrance', 'digital memorial'],
  openGraph: { title: 'Memorial', description: 'Tribute biographies · Healing letters', type: 'website' },
  alternates: { canonical: '/memorial' },
};

export default function Page() {
  return <StandaloneProduct productId="memorial" />;
}
