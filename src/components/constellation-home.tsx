'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles, BookOpen, Moon, Ghost, Users, Heart,
  LayoutGrid, MessageSquareCode, ArrowRight, Star, TrendingUp, Trophy, Zap,
} from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import type { ProductId } from '@/app/page';

interface ProductMeta {
  id: ProductId;
  star: string;
  starSymbol: string;
  starMeaning: string;
  name: string;
  tagline: string;
  description: string;
  market: string;
  badge: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  features: string[];
}

const PRODUCTS: ProductMeta[] = [
  {
    id: 'mystic',
    star: 'Vega', starSymbol: '✦',
    starMeaning: 'The Weaver of Fate',
    name: 'AI Spiritual Companion',
    tagline: 'Astrology · Tarot · Bazi · Daily Energy',
    description: 'All-in-one AI spiritual super app. Western astrology birth chart, tarot reading, Bazi numerology, and personalized daily energy reports. AI-native deep dialogue interpretation across mystical traditions.',
    market: 'CAGR 19.8% · $5.69B → $11.71B',
    badge: 'TOP 1 PICK',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-amber-500/20 to-purple-700/20',
    border: 'border-amber-400/40',
    features: ['Birth Chart Reading', 'Tarot Spread (3/5/7 cards)', 'Bazi Numerology', 'Daily Energy Report', 'Multi-framework Dream Analysis'],
  },
  {
    id: 'storybook',
    star: 'Andromeda', starSymbol: '★',
    starMeaning: 'Liberator of Imagination',
    name: 'AI Kids Storybook',
    tagline: 'Personalized · Educational · Printable',
    description: 'Personalized AI children\'s storybooks. Input child\'s name + theme, AI generates a complete illustrated story with per-page image prompts. DreamStories.ai reached $6M ARR validating this model.',
    market: 'CAGR 21.8% · $3.2B → $18.7B',
    badge: 'HIGH TICKET',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-rose-400/20 to-orange-500/20',
    border: 'border-rose-400/40',
    features: ['Personalized protagonist', '5 illustration styles', 'Moral + parent questions', 'Print-ready format', 'Multi-language output'],
  },
  {
    id: 'dream',
    star: 'Selene', starSymbol: '🌙',
    starMeaning: 'Goddess of the Moon · Keeper of Dreams',
    name: 'AI Dream Interpretation',
    tagline: 'Record · Analyze · Track Subconscious',
    description: 'AI dream journal with multi-framework interpretation: Jungian archetypes, Freudian psychoanalysis, Gestalt therapy, and spiritual perspective. Long-term subconscious theme tracking across months.',
    market: '$2.99B · CAGR 16.3%',
    badge: 'HIGH FREQUENCY',
    icon: <Moon className="w-6 h-6" />,
    color: 'from-blue-500/20 to-indigo-700/20',
    border: 'border-blue-400/40',
    features: ['4 interpretation frameworks', 'Dream mood tracking', 'Recurring theme analysis', 'Dream journal history', 'AI-powered insights'],
  },
  {
    id: 'memorial',
    star: 'Pleiades', starSymbol: '✧',
    starMeaning: 'Memory Across Time',
    name: 'AI Digital Memorial',
    tagline: 'Tribute biographies · Healing letters',
    description: 'AI-powered tribute biographies for departed loved ones. AI simulates the departed\'s voice to write a farewell letter. Pre-Need Death Care market is $120B with 6.5% CAGR.',
    market: 'Pre-Need Death Care $120B · CAGR 6.5%',
    badge: 'BLUE OCEAN',
    icon: <Ghost className="w-6 h-6" />,
    color: 'from-purple-400/20 to-indigo-700/20',
    border: 'border-purple-400/40',
    features: ['Memorial biography (500-800 words)', 'AI letter from the departed', 'Photo + memory preservation', 'Relationship templates', 'Shareable tribute page'],
  },
  {
    id: 'genealogy',
    star: 'Cassiopeia', starSymbol: '✦',
    starMeaning: 'The Bloodline Queen',
    name: 'AI Genealogy Research',
    tagline: 'Photo Restore · OCR · Family Narratives',
    description: 'AI-enhanced genealogy research: old photo restoration, historical document OCR, AI-written family narratives. r/Genealogy has 500K+ subscribers proving strong long-tail demand.',
    market: 'r/Genealogy 500K+ · Long-tail high-paying',
    badge: 'LONG TAIL',
    icon: <Users className="w-6 h-6" />,
    color: 'from-yellow-400/20 to-amber-700/20',
    border: 'border-yellow-400/40',
    features: ['Family story generation', 'Member profiles', 'Origin + tradition weaving', 'AI narrative (1000+ words)', 'Genealogy search assistance'],
  },
  {
    id: 'caregiver',
    star: 'Lyra', starSymbol: '★',
    starMeaning: 'The Healing Song',
    name: 'AI Caregiver Support',
    tagline: '24/7 Family Caregiver AI Assistant',
    description: 'AI assistant for family caregivers: symptom interpretation, emotional support, medication reminders, care logging. AARP reports 63M Americans are family caregivers. Market CAGR 16%.',
    market: 'CAGR 16% · $1.71B → $7.5B',
    badge: 'ESSENTIAL',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-400/20 to-rose-600/20',
    border: 'border-pink-400/40',
    features: ['Symptom analysis (non-diagnostic)', 'Emotional support dialogue', 'Care log with AI advice', 'Emergency red flags', 'Self-care reminders'],
  },
  {
    id: 'directory',
    star: 'Polaris', starSymbol: '✧',
    starMeaning: 'The Eternal Guide',
    name: 'AI Tools Directory',
    tagline: 'Verified · Passive Income · SEO',
    description: 'AI tools directory with programmatic SEO. Curated AI tools, AI agents, SaaS products. Verified model: $34K MRR with only 3 hours/month maintenance. Submit, vote, categorize.',
    market: '$34K MRR case · 3 hrs/month maintenance',
    badge: 'LIGHTWEIGHT',
    icon: <LayoutGrid className="w-6 h-6" />,
    color: 'from-emerald-400/20 to-teal-600/20',
    border: 'border-emerald-400/40',
    features: ['6 categories (AI Tool/Agent/SaaS/Newsletter/Resource)', 'Submit + upvote system', 'Pricing filter (free/freemium/paid)', 'SEO-optimized pages', 'Admin dashboard'],
  },
  {
    id: 'prompts',
    star: 'Mercury', starSymbol: '☿',
    starMeaning: 'The Messenger of Language',
    name: 'AI Prompt Library',
    tagline: 'Create · Save · Share · Sell',
    description: 'AI Prompt marketplace and library. Generate, collect, share, and sell prompt templates. Covers writing, marketing, coding, design, personal growth. PromptBase validated $1.3B → $12.1B market.',
    market: 'CAGR 23.3% · $1.3B → $12.1B',
    badge: 'HIGH FREQUENCY',
    icon: <MessageSquareCode className="w-6 h-6" />,
    color: 'from-sky-400/20 to-indigo-600/20',
    border: 'border-sky-400/40',
    features: ['AI prompt generator (ChatGPT/Claude/Gemini/MJ)', '7 categories', 'Public + private prompts', 'Usage tracking', 'Copy-to-clipboard'],
  },
];

export function ConstellationHome({ onLaunchProduct }: { onLaunchProduct: (id: ProductId) => void }) {
  const { t, locale } = useLocale();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8 sm:py-12 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
          <div className="text-7xl sm:text-9xl tracking-widest text-gold animate-float">
            ✦ ✧ ★ ✦ ✧
          </div>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-dark text-xs tracking-widest text-gold mb-5">
            <Star className="w-3 h-3" />
            <span>EIGHT STARS · ONE SKY</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-shadow-gold mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Lumina Constellation
          </h2>
          <p className="text-amber-200/90 text-base sm:text-lg mb-2 italic" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Eight stars, one sky
          </p>
          <p className="text-purple-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Eight independent AI products. Each a standalone brand, each installable as an app. Pick your star.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
              <Trophy className="w-3 h-3 text-gold" /> 8 products online
            </div>
            <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
              <TrendingUp className="w-3 h-3 text-gold" /> Combined CAGR 19.8%+
            </div>
            <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
              <Zap className="w-3 h-3 text-gold" /> AI-native · Free
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="glass-card-dark border-gold/30 rounded-xl p-5 sm:p-6 text-center">
        <p className="text-purple-100/80 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
          In ancient times, sailors lost at sea looked up and found eight stars that always pointed them home. Lumina brings those stars down to earth — each one a guide for a different journey of your life.
        </p>
        <p className="text-amber-200/70 text-xs mt-3 italic">
          ✦ Vega · ★ Andromeda · 🌙 Selene · ✧ Pleiades · ✦ Cassiopeia · ★ Lyra · ✧ Polaris · ☿ Mercury ✦
        </p>
      </section>

      {/* Pricing Hint */}
      <section className="glass-card-dark border-gold/20 rounded-xl p-4 text-center">
        <p className="text-purple-200/70 text-xs">
          <span className="text-emerald-300 font-semibold">Free</span> 3/day per product ·{' '}
          <span className="text-sky-300 font-semibold">$9/mo</span> single product unlimited ·{' '}
          <span className="text-amber-300 font-semibold">$39/mo</span> all-access pass
        </p>
      </section>

      {/* 8 Product Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRODUCTS.map((product) => (
          <Card
            key={product.id}
            className={`glass-card-dark ${product.border} hover:border-gold/60 transition-all hover:scale-[1.01] cursor-pointer group relative overflow-hidden`}
            onClick={() => onLaunchProduct(product.id)}
          >
            {/* Star watermark */}
            <div className="absolute top-2 right-3 text-5xl opacity-15 group-hover:opacity-30 transition-opacity">
              {product.starSymbol}
            </div>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} border ${product.border} flex items-center justify-center text-gold`}>
                  {product.icon}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] px-2 py-0.5 ${
                    product.badge === 'TOP 1 PICK' ? 'bg-amber-500 text-black' :
                    product.badge === 'HIGH TICKET' ? 'bg-rose-500 text-white' :
                    product.badge === 'LIGHTWEIGHT' ? 'bg-emerald-600 text-white' :
                    product.badge === 'HIGH FREQUENCY' ? 'bg-sky-600 text-white' :
                    product.badge === 'BLUE OCEAN' ? 'bg-purple-600 text-white' :
                    product.badge === 'ESSENTIAL' ? 'bg-pink-600 text-white' :
                    product.badge === 'LONG TAIL' ? 'bg-yellow-700 text-white' :
                    'bg-cyan-600 text-white'
                  }`}>
                    {product.badge}
                  </Badge>
                  <Badge variant="outline" className="border-emerald-400/50 text-emerald-300 text-[10px] px-2 py-0.5">
                    ● ONLINE
                  </Badge>
                </div>
              </div>
              {/* Star identity */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-300 text-lg">{product.starSymbol}</span>
                <span className="text-amber-200/90 text-xs font-semibold tracking-wider" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                  {product.star}
                </span>
                <span className="text-purple-300/40 text-[10px]">· {product.starMeaning}</span>
              </div>
              <h3 className="text-lg text-gold font-semibold flex items-center gap-2">
                {product.name}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-purple-200/70 text-xs mt-0.5">{product.tagline}</p>
              <p className="text-purple-100/80 text-xs leading-relaxed mt-2">{product.description}</p>
              {/* Features */}
              <div className="flex flex-wrap gap-1 mt-3">
                {product.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="text-[9px] text-purple-200/60 bg-white/5 rounded-full px-2 py-0.5">
                    {f}
                  </span>
                ))}
                {product.features.length > 4 && (
                  <span className="text-[9px] text-amber-300/60 bg-white/5 rounded-full px-2 py-0.5">
                    +{product.features.length - 4} more
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-purple-200/50 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {product.market}
                </span>
              </div>
              <Button
                size="sm"
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs"
              >
                Launch App <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export { PRODUCTS };
