import type { Metadata } from 'next';
import { StandaloneProduct } from '@/components/standalone-product';

export const metadata: Metadata = {
  title: 'AI Caregiver Support · 24/7 Assistant for Family Caregivers',
  description: 'An AI assistant for family caregivers. Symptom guidance, emotional support, medication tracking, care logging. For the 63 million Americans caring for loved ones.',
  keywords: ['caregiver', 'elderly care', 'family caregiving', 'AI assistant', 'care support'],
  openGraph: { title: 'AI Caregiver Support', description: '24/7 assistant for family caregivers', type: 'website' },
  alternates: { canonical: '/caregiver' },
};

export default function Page() {
  return <StandaloneProduct productId="caregiver" />;
}
