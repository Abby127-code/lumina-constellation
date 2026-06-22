import type { Metadata } from 'next';
import { ProductPage } from '@/components/product-page';

export const metadata: Metadata = {
  title: "Storybook Studio · Personalized Children's Stories",
  description: "Create beautiful personalized storybooks for children. Input your child's name and theme, get a complete illustrated story with moral lessons.",
  openGraph: { title: 'Storybook Studio', description: "Personalized children's stories", type: 'website', url: '/storybook' },
  twitter: { card: 'summary_large_image', title: 'Storybook Studio', description: "Personalized children's stories" },
  alternates: { canonical: '/storybook' },
};

export default function Page() {
  return <ProductPage productId="storybook" />;
}
