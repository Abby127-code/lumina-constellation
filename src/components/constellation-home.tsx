'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles, BookOpen, Moon, Ghost, Users, Heart,
  LayoutGrid, ArrowRight, TrendingUp, Trophy,
} from 'lucide-react';

const PRODUCTS = [
  { id: 'mystic', url: '/spiritual', name: 'Lumina Spiritual', tagline: 'Astrology · Tarot · Numerology · Daily Energy', icon: <Sparkles className="w-6 h-6" />, badge: 'TOP PICK', market: 'CAGR 19.8%', border: 'border-amber-400/40', color: 'from-amber-500/20 to-purple-700/20', desc: 'Birth chart readings, tarot spreads, Bazi numerology, and personalized daily energy reports.' },
  { id: 'storybook', url: '/storybook', name: 'Storybook Studio', tagline: 'Personalized children\'s stories · Illustrated', icon: <BookOpen className="w-6 h-6" />, badge: 'HIGH VALUE', market: 'CAGR 21.8%', border: 'border-rose-400/40', color: 'from-rose-400/20 to-orange-500/20', desc: 'Create personalized storybooks for children with illustrations and moral lessons.' },
  { id: 'dream', url: '/dream', name: 'Dream Journal', tagline: 'Record · Interpret · Track subconscious', icon: <Moon className="w-6 h-6" />, badge: 'DAILY USE', market: 'CAGR 16.3%', border: 'border-blue-400/40', color: 'from-blue-500/20 to-indigo-700/20', desc: 'Dream journal with multi-perspective interpretations and recurring theme tracking.' },
  { id: 'memorial', url: '/memorial', name: 'Memorial', tagline: 'Tribute biographies · Healing letters', icon: <Ghost className="w-6 h-6" />, badge: 'BLUE OCEAN', market: 'CAGR 6.5%', border: 'border-purple-400/40', color: 'from-purple-400/20 to-indigo-700/20', desc: 'Honor loved ones with tribute biographies and AI letters in their voice.' },
  { id: 'genealogy', url: '/family-atlas', name: 'Family Atlas', tagline: 'Family stories · Origins · Heritage', icon: <Users className="w-6 h-6" />, badge: 'LONG TAIL', market: '500K+ community', border: 'border-yellow-400/40', color: 'from-yellow-400/20 to-amber-700/20', desc: 'Weave family history into beautiful narratives. Preserve your bloodline story.' },
  { id: 'caregiver', url: '/caregiver', name: 'AI Caregiver Support', tagline: '24/7 assistant for family caregivers', icon: <Heart className="w-6 h-6" />, badge: 'ESSENTIAL', market: 'CAGR 16%', border: 'border-pink-400/40', color: 'from-pink-400/20 to-rose-600/20', desc: 'Symptom guidance, emotional support, medication tracking for 63M family caregivers.' },
  { id: 'directory', url: '/toolkit', name: 'AI Toolkit', tagline: 'AI Tools Directory + Prompt Library', icon: <LayoutGrid className="w-6 h-6" />, badge: 'AI TOOL', market: '$34K MRR', border: 'border-emerald-400/40', color: 'from-emerald-400/20 to-teal-600/20', desc: 'Discover AI tools, generate and share powerful prompts. All in one place.' },
];

export function ConstellationHome() {
  return (
    <div className="space-y-8">
      <section className="text-center py-8 sm:py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-dark text-xs tracking-widest text-gold mb-5">
          <Sparkles className="w-3 h-3" /><span>7 INDEPENDENT PRODUCTS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-shadow-gold mb-4" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
          Lumina Constellation
        </h2>
        <p className="text-purple-100/80 text-sm sm:text-base max-w-2xl mx-auto">
          Seven standalone products. Seven unique experiences. Each on its own page.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs"><Trophy className="w-3 h-3 text-gold" /> 7 products online</div>
          <div className="flex items-center gap-1.5 text-purple-200/70 text-xs"><TrendingUp className="w-3 h-3 text-gold" /> Combined CAGR 19.8%+</div>
        </div>
      </section>

      <section className="glass-card-dark border-gold/20 rounded-xl p-4 text-center">
        <p className="text-purple-200/70 text-xs">
          <span className="text-emerald-300 font-semibold">Free</span> 3 trial uses ·{' '}
          <span className="text-sky-300 font-semibold">$4.99/mo</span> per product ·{' '}
          <span className="text-amber-300 font-semibold">$47.90/yr</span> (save 20%)
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRODUCTS.map((p) => (
          <Card key={p.id} className={`glass-card-dark ${p.border} hover:border-gold/60 transition-all hover:scale-[1.01] cursor-pointer group`} onClick={() => window.location.href = p.url}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} border ${p.border} flex items-center justify-center text-gold`}>{p.icon}</div>
                <Badge className={`text-[10px] px-2 py-0.5 ${
                  p.badge === 'TOP PICK' ? 'bg-amber-500 text-black' :
                  p.badge === 'HIGH VALUE' ? 'bg-rose-500 text-white' :
                  p.badge === 'DAILY USE' ? 'bg-sky-600 text-white' :
                  p.badge === 'BLUE OCEAN' ? 'bg-purple-600 text-white' :
                  p.badge === 'ESSENTIAL' ? 'bg-pink-600 text-white' :
                  p.badge === 'LONG TAIL' ? 'bg-yellow-700 text-white' : 'bg-emerald-600 text-white'
                }`}>{p.badge}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-gold flex items-center gap-2">{p.name}<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-purple-200/60 text-xs mt-0.5">{p.tagline}</p>
              <p className="text-purple-100/70 text-xs leading-relaxed mt-2">{p.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-purple-200/40 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {p.market}</span>
              </div>
              <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs">Open {p.name} <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
