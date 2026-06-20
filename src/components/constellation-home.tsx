'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles, BookOpen, Moon, Ghost, Users, Heart,
  LayoutGrid, ArrowRight, TrendingUp, Trophy,
} from 'lucide-react';
import type { ProductId } from '@/app/page';

export interface ProductMeta {
  id: ProductId;
  name: string;
  tagline: string;
  description: string;
  market: string;
  badge: string;
  icon: React.ReactNode;
  // Independent design style per product
  theme: {
    bg: string;       // page background gradient
    card: string;     // card class
    border: string;   // card border
    accent: string;   // accent color class
    button: string;   // button gradient
    header: string;   // header text color
  };
  features: string[];
}

// 7 Independent Products — each with unique branding & design style
// Products 1-5: NO "AI" in name (consumers shouldn't feel it's AI-generated)
// Products 6-7: AI tools, "AI" is fine
export const PRODUCTS: ProductMeta[] = [
  // 1. Spiritual (mystical luxury — deep purple + gold)
  {
    id: 'mystic',
    name: 'Lumina Spiritual',
    tagline: 'Astrology · Tarot · Numerology · Daily Energy',
    description: 'Your personal spiritual companion. Birth chart readings, tarot spreads, Bazi numerology, and personalized daily energy reports. Deep, insightful, warm.',
    market: 'CAGR 19.8% · $5.69B → $11.71B',
    badge: 'TOP PICK',
    icon: <Sparkles className="w-6 h-6" />,
    theme: {
      bg: 'from-purple-950 via-indigo-950 to-slate-950',
      card: 'bg-purple-900/30',
      border: 'border-amber-400/30',
      accent: 'text-amber-300',
      button: 'from-amber-500 to-amber-600',
      header: 'text-amber-200',
    },
    features: ['Birth Chart Reading', 'Tarot Spread (3/5/7 cards)', 'Bazi Numerology', 'Daily Energy Report'],
  },
  // 2. Storybook (warm playful — rose + cream)
  {
    id: 'storybook',
    name: 'Storybook Studio',
    tagline: 'Personalized children\'s stories · Illustrated · Printable',
    description: 'Create beautiful personalized storybooks for children. Input child\'s name and theme, get a complete illustrated story with moral lessons. Print-ready format.',
    market: 'CAGR 21.8% · $3.2B → $18.7B',
    badge: 'HIGH VALUE',
    icon: <BookOpen className="w-6 h-6" />,
    theme: {
      bg: 'from-rose-50 via-orange-50 to-amber-50',
      card: 'bg-white/80',
      border: 'border-rose-300',
      accent: 'text-rose-600',
      button: 'from-rose-400 to-orange-400',
      header: 'text-rose-700',
    },
    features: ['Personalized protagonist', '5 illustration styles', 'Moral + parent questions', 'Print-ready'],
  },
  // 3. Dream (dreamy soft — deep blue + lavender)
  {
    id: 'dream',
    name: 'Dream Journal',
    tagline: 'Record · Interpret · Track your subconscious',
    description: 'A dream journal that helps you understand your subconscious. Record dreams, get multi-perspective interpretations, track recurring themes over time.',
    market: '$2.99B · CAGR 16.3%',
    badge: 'DAILY USE',
    icon: <Moon className="w-6 h-6" />,
    theme: {
      bg: 'from-slate-900 via-blue-950 to-indigo-950',
      card: 'bg-blue-900/30',
      border: 'border-indigo-400/30',
      accent: 'text-indigo-300',
      button: 'from-indigo-500 to-blue-600',
      header: 'text-indigo-200',
    },
    features: ['4 interpretation frameworks', 'Dream mood tracking', 'Recurring theme analysis', 'Dream history'],
  },
  // 4. Memorial (respectful serene — muted purple + silver)
  {
    id: 'memorial',
    name: 'Memorial',
    tagline: 'Tribute biographies · Healing letters · Forever memories',
    description: 'Honor your loved ones with beautiful tribute biographies. Capture their personality, memories, and legacy. Receive a letter in their voice — a gentle farewell.',
    market: 'Pre-Need Death Care $120B · CAGR 6.5%',
    badge: 'BLUE OCEAN',
    icon: <Ghost className="w-6 h-6" />,
    theme: {
      bg: 'from-slate-900 via-purple-950 to-slate-900',
      card: 'bg-purple-900/20',
      border: 'border-purple-300/30',
      accent: 'text-purple-300',
      button: 'from-purple-500 to-indigo-600',
      header: 'text-purple-200',
    },
    features: ['Memorial biography', 'Letter from the departed', 'Photo + memory preservation', 'Shareable tribute'],
  },
  // 5. Genealogy (vintage heritage — sepia + warm brown)
  {
    id: 'genealogy',
    name: 'Family Atlas',
    tagline: 'Family stories · Origins · Heritage narratives',
    description: 'Weave your family\'s history into a beautiful narrative. Document members, origins, traditions. Preserve your bloodline story for future generations.',
    market: 'r/Genealogy 500K+ · Long-tail high-paying',
    badge: 'LONG TAIL',
    icon: <Users className="w-6 h-6" />,
    theme: {
      bg: 'from-amber-950 via-stone-900 to-amber-950',
      card: 'bg-amber-900/20',
      border: 'border-amber-600/30',
      accent: 'text-amber-500',
      button: 'from-amber-600 to-amber-700',
      header: 'text-amber-400',
    },
    features: ['Family story generation', 'Member profiles', 'Origin + tradition weaving', 'Herage narrative'],
  },
  // 6. Caregiver (warm supportive — soft coral + cream)
  {
    id: 'caregiver',
    name: 'AI Caregiver Support',
    tagline: '24/7 assistant for family caregivers',
    description: 'An AI assistant for the 63 million Americans caring for sick or elderly family members. Symptom guidance, emotional support, medication tracking, care logging.',
    market: 'CAGR 16% · $1.71B → $7.5B',
    badge: 'ESSENTIAL',
    icon: <Heart className="w-6 h-6" />,
    theme: {
      bg: 'from-rose-950 via-pink-950 to-slate-950',
      card: 'bg-rose-900/20',
      border: 'border-pink-400/30',
      accent: 'text-pink-300',
      button: 'from-pink-500 to-rose-600',
      header: 'text-pink-200',
    },
    features: ['Symptom analysis (non-diagnostic)', 'Emotional support dialogue', 'Care log with advice', 'Emergency red flags'],
  },
  // 7. AI Toolkit (tech modern — emerald + sky, combined Directory + Prompts)
  {
    id: 'directory',
    name: 'AI Toolkit',
    tagline: 'AI Tools Directory + Prompt Library',
    description: 'Discover the best AI tools and prompts in one place. Browse curated AI tools, agents, and SaaS products. Generate, save, and share powerful prompts for any task.',
    market: '$34K MRR directory + $1.3B prompts market',
    badge: 'AI TOOL',
    icon: <LayoutGrid className="w-6 h-6" />,
    theme: {
      bg: 'from-emerald-950 via-teal-950 to-slate-950',
      card: 'bg-emerald-900/20',
      border: 'border-emerald-400/30',
      accent: 'text-emerald-300',
      button: 'from-emerald-500 to-teal-600',
      header: 'text-emerald-200',
    },
    features: ['AI tools directory (6 categories)', 'Prompt generator + library', 'Submit + upvote', '7 prompt categories'],
  },
];

export function ConstellationHome({ onLaunchProduct }: { onLaunchProduct: (id: ProductId) => void }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8 sm:py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-dark text-xs tracking-widest text-gold mb-5">
          <Sparkles className="w-3 h-3" />
          <span>7 INDEPENDENT PRODUCTS</span>
        </div>
        <h2
          className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-shadow-gold mb-4"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Lumina Constellation
        </h2>
        <p className="text-purple-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Seven standalone products. Seven unique experiences. Pick your star.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
            <Trophy className="w-3 h-3 text-gold" /> 7 products online
          </div>
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
            <TrendingUp className="w-3 h-3 text-gold" /> Combined CAGR 19.8%+
          </div>
        </div>
      </section>

      {/* Pricing Hint */}
      <section className="glass-card-dark border-gold/20 rounded-xl p-4 text-center">
        <p className="text-purple-200/70 text-xs">
          <span className="text-emerald-300 font-semibold">Free</span> 3 trial uses ·{' '}
          <span className="text-sky-300 font-semibold">$4.99/mo</span> per product ·{' '}
          <span className="text-amber-300 font-semibold">$47.90/yr</span> (save 20%)
        </p>
      </section>

      {/* 7 Product Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRODUCTS.map((product) => (
          <Card
            key={product.id}
            className={`glass-card-dark ${product.theme.border} hover:border-gold/60 transition-all hover:scale-[1.01] cursor-pointer group`}
            onClick={() => onLaunchProduct(product.id)}
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${product.theme.card} border ${product.theme.border} flex items-center justify-center ${product.theme.accent}`}>
                  {product.icon}
                </div>
                <Badge className={`text-[10px] px-2 py-0.5 ${
                  product.badge === 'TOP PICK' ? 'bg-amber-500 text-black' :
                  product.badge === 'HIGH VALUE' ? 'bg-rose-500 text-white' :
                  product.badge === 'DAILY USE' ? 'bg-sky-600 text-white' :
                  product.badge === 'BLUE OCEAN' ? 'bg-purple-600 text-white' :
                  product.badge === 'ESSENTIAL' ? 'bg-pink-600 text-white' :
                  product.badge === 'LONG TAIL' ? 'bg-yellow-700 text-white' :
                  'bg-emerald-600 text-white'
                }`}>
                  {product.badge}
                </Badge>
              </div>
              <h3 className={`text-lg font-semibold ${product.theme.header} flex items-center gap-2`}>
                {product.name}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-purple-200/60 text-xs mt-0.5">{product.tagline}</p>
              <p className="text-purple-100/70 text-xs leading-relaxed mt-2">{product.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {product.features.map((f, i) => (
                  <span key={i} className="text-[9px] text-purple-200/50 bg-white/5 rounded-full px-2 py-0.5">
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-purple-200/40 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {product.market}
                </span>
              </div>
              <Button
                size="sm"
                className={`w-full mt-3 bg-gradient-to-r ${product.theme.button} text-white text-xs`}
              >
                Open {product.name} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
