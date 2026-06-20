'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, Sparkles, Cpu, Moon } from 'lucide-react';
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

interface ProductAppProps {
  productId: ProductId;
  onBack: () => void;
  aiProvider: string;
  aiFree: boolean;
}

export function ProductApp({ productId, onBack, aiProvider, aiFree }: ProductAppProps) {
  const { user } = useSession();
  const product = PRODUCTS.find((p) => p.id === productId);

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
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 starfield opacity-20 pointer-events-none" />

      {/* Independent Product Header */}
      <header className="relative z-10 border-b border-gold/20 bg-night/60 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Back to Constellation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-purple-200/70 hover:text-gold hover:bg-gold/10 text-xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Sky
            </Button>
            <div className="w-px h-6 bg-gold/20" />
            {/* Product Brand */}
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${product.color} border ${product.border} flex items-center justify-center text-gold relative shrink-0`}>
                {product.icon}
                <span className="absolute -top-1 -right-1 text-xs">{product.starSymbol}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-gold truncate" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                  {product.name}
                </h1>
                <p className="text-purple-300/50 text-[10px] hidden sm:block">
                  {product.starSymbol} {product.star} · {product.starMeaning}
                </p>
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
      <footer className="relative z-10 mt-8 pt-4 border-t border-gold/20 text-center">
        <div className="flex items-center justify-center gap-2 text-purple-200/50 text-[10px] flex-wrap">
          <span className="text-amber-300/60">{product.starSymbol}</span>
          <span>{product.name} · Part of Lumina Constellation</span>
          {aiProvider && (
            <Badge variant="outline" className={`text-[8px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : 'border-amber-400/30 text-amber-300/70'}`}>
              <Cpu className="w-2 h-2 mr-0.5" /> {aiProvider}{aiFree && ' · Free'}
            </Badge>
          )}
          <span className="text-amber-300/60">{product.starSymbol}</span>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
