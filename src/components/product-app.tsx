'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Cpu } from 'lucide-react';
import { useSession } from '@/lib/session';
import type { ProductId } from '@/app/page';
import { PRODUCTS } from '@/components/constellation-home';
import { MysticApp } from '@/components/apps/mystic-app';
import { StorybookApp } from '@/components/apps/storybook-app';
import { DreamApp } from '@/components/apps/dream-app';
import { MemorialApp } from '@/components/apps/memorial-app';
import { GenealogyApp } from '@/components/apps/genealogy-app';
import { CaregiverApp } from '@/components/apps/caregiver-app';
import { DirectoryApp } from '@/components/apps/directory-app';

// Map product ID to theme class
const THEME_MAP: Record<ProductId, string> = {
  mystic: 'theme-mystic',
  storybook: 'theme-storybook',
  dream: 'theme-dream',
  memorial: 'theme-memorial',
  genealogy: 'theme-genealogy',
  caregiver: 'theme-caregiver',
  directory: 'theme-directory',
};

interface ProductAppProps {
  productId: ProductId;
  onBack: () => void;
  aiProvider: string;
  aiFree: boolean;
}

export function ProductApp({ productId, onBack, aiProvider, aiFree }: ProductAppProps) {
  const { user } = useSession();
  const product = PRODUCTS.find((p) => p.id === productId);
  const themeClass = THEME_MAP[productId] || 'theme-mystic';

  if (!product) {
    return (
      <div className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <p className="text-purple-200">Product not found</p>
        <Button onClick={onBack} className="ml-4">Back</Button>
      </div>
    );
  }

  const renderApp = () => {
    switch (productId) {
      case 'mystic': return <MysticApp />;
      case 'storybook': return <StorybookApp />;
      case 'dream': return <DreamApp />;
      case 'memorial': return <MemorialApp />;
      case 'genealogy': return <GenealogyApp />;
      case 'caregiver': return <CaregiverApp />;
      case 'directory': return <DirectoryApp />;
      default: return null;
    }
  };

  return (
    <div className={`product-app-root ${themeClass} relative overflow-hidden flex flex-col`}>
      {/* Independent Product Header */}
      <header className="relative z-10 border-b border-[var(--p-border)] bg-black/20 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="product-app-muted hover:product-app-accent text-xs shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1" /> Sky
            </Button>
            <div className="w-px h-6 bg-[var(--p-border)]" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[var(--p-card)] border border-[var(--p-border)] flex items-center justify-center product-app-accent shrink-0">
                {product.icon}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold product-app-header truncate" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                  {product.name}
                </h1>
                <p className="product-app-muted text-[10px] hidden sm:block">{product.tagline}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            {user?.isAuthed && <NotificationBell />}
            <AccountButton />
            <UpgradeButton />
          </div>
        </div>
      </header>

      {/* Product Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {renderApp()}
      </div>

      {/* Product Footer */}
      <footer className="relative z-10 mt-8 pt-4 border-t border-[var(--p-border)] text-center">
        <div className="flex items-center justify-center gap-2 product-app-muted text-[10px] flex-wrap">
          <span>{product.name} · Part of Lumina Constellation</span>
          {aiProvider && (
            <Badge variant="outline" className={`text-[8px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : 'border-amber-400/30 text-amber-300/70'}`}>
              <Cpu className="w-2 h-2 mr-0.5" /> {aiProvider}{aiFree && ' · Free'}
            </Badge>
          )}
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
