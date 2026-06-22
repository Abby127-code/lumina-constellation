import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: 'AI Caregiver Support',
  description: '24/7 AI assistant for family caregivers. Symptom guidance and emotional support.',
  openGraph: { title: 'AI Caregiver Support', description: '24/7 AI assistant for family caregivers. Symptom guidance and emotional support.', type: 'website', url: '/caregiver' },
  twitter: { card: 'summary_large_image', title: 'AI Caregiver Support', description: '24/7 AI assistant for family caregivers. Symptom guidance and emotional support.' },
  alternates: { canonical: '/caregiver' },
};

export default function Page() {
  return <ProductPage productId="caregiver" />;
}
