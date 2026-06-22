'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { AccountButton } from '@/components/account-button';
import { UpgradeButton } from '@/components/upgrade-button';
import { InstallPrompt } from '@/components/install-prompt';
import { ShareButtons } from '@/components/share-buttons';
import { Toaster } from '@/components/ui/toaster';
import { Cpu, Check, Star, TrendingUp, Sparkles } from 'lucide-react';
import { useSession } from '@/lib/session';
import type { ProductId } from '@/lib/product-types';
import { MysticApp } from '@/components/apps/mystic-app';
import { StorybookApp } from '@/components/apps/storybook-app';
import { DreamApp } from '@/components/apps/dream-app';
import { MemorialApp } from '@/components/apps/memorial-app';
import { GenealogyApp } from '@/components/apps/genealogy-app';
import { CaregiverApp } from '@/components/apps/caregiver-app';
import { DirectoryApp } from '@/components/apps/directory-app';
import { LocaleProvider } from '@/components/locale-provider';

interface ProductConfig {
  name: string;
  tagline: string;
  icon: string;
  theme: string;
  domain: string; // independent brand, no "Lumina Constellation" mention
  heroTitle: string;
  heroSubtitle: string;
  features: { title: string; desc: string }[];
  examples: string[];
  faqs: { q: string; a: string }[];
  market: string;
  badge: string;
  footerLinks: { label: string; href: string }[];
}

const CONFIGS: Record<ProductId, ProductConfig> = {
  mystic: {
    name: 'Lumina Spiritual', tagline: 'Astrology · Tarot · Numerology · Daily Energy', icon: '✦', theme: 'theme-mystic', domain: 'spiritual',
    heroTitle: 'Discover Your Cosmic Blueprint',
    heroSubtitle: 'Birth charts, tarot readings, numerology, and daily energy reports — all in one place. Deep, insightful, warm guidance for your spiritual journey.',
    features: [
      { title: 'Birth Chart Reading', desc: 'AI-powered natal chart analysis. Sun, Moon, Rising signs and planetary aspects explained in depth.' },
      { title: 'Tarot Spreads', desc: '3, 5, or 7 card spreads with full interpretation. Past, present, future guidance.' },
      { title: 'Bazi Numerology', desc: 'Chinese Four Pillars analysis. Five Elements, Ten Gods, life cycles.' },
      { title: 'Daily Energy Report', desc: 'Personalized daily guidance combining astrology, moon phase, and numerology.' },
    ],
    examples: ['"Your Sun in Leo gives you natural leadership..."', '"The Three of Swords suggests..."', '"Your Day Master is Yang Fire..."'],
    faqs: [
      { q: 'Do I need to know my exact birth time?', a: 'Exact birth time improves accuracy but is optional. Date and place are sufficient for a basic reading.' },
      { q: 'Which tarot deck do you use?', a: 'We use the Rider-Waite tradition with 22 Major Arcana, including reversed positions.' },
      { q: 'Is this entertainment or real guidance?', a: 'Our readings are for entertainment and self-reflection. They are not medical, psychological, or financial advice.' },
    ],
    market: 'CAGR 19.8% · $5.69B → $11.71B', badge: 'TOP PICK',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
  storybook: {
    name: 'Storybook Studio', tagline: 'Personalized children\'s stories · Illustrated · Printable', icon: '★', theme: 'theme-storybook', domain: 'storybook',
    heroTitle: 'Create Magical Stories for Your Child',
    heroSubtitle: 'Turn your child into the hero of their own adventure. Personalized names, themes, illustration styles, and moral lessons. Print-ready format.',
    features: [
      { title: 'Personalized Protagonist', desc: 'Your child\'s name woven into the story. They become the hero.' },
      { title: '5 Illustration Styles', desc: 'Watercolor, cartoon, Pixar 3D, anime, or classic picture book — pick your aesthetic.' },
      { title: 'Moral + Parent Questions', desc: 'Each story ends with a life lesson and 2-3 discussion questions for parents.' },
      { title: 'Print-Ready Format', desc: 'Download as PDF with per-page illustration prompts. Print at home or via POD services.' },
    ],
    examples: ['"Once upon a time, little Emma discovered..."', '"The dragon was not scary, but lonely..."', '"And so, Lucas learned that kindness..."'],
    faqs: [
      { q: 'What ages are the stories for?', a: 'Ages 3-10. The language complexity adjusts to the age you specify.' },
      { q: 'Can I print the stories?', a: 'Yes! Each story includes illustration prompts per page. Use Print-on-Demand services like Gelato or Lulu.' },
      { q: 'How long are the stories?', a: '800-1200 words across 5-8 illustrated pages. Perfect for bedtime reading.' },
    ],
    market: 'CAGR 21.8% · $3.2B → $18.7B', badge: 'HIGH VALUE',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
  dream: {
    name: 'Dream Journal', tagline: 'Record · Interpret · Track your subconscious', icon: '🌙', theme: 'theme-dream', domain: 'dream',
    heroTitle: 'Understand What Your Dreams Are Telling You',
    heroSubtitle: 'Record your dreams and get multi-perspective interpretations. Track recurring themes. Discover patterns in your subconscious over time.',
    features: [
      { title: '4 Interpretation Frameworks', desc: 'Jungian archetypes, Freudian psychoanalysis, Gestalt therapy, and spiritual perspective.' },
      { title: 'Dream Mood Tracking', desc: 'Tag emotions: calm, joyful, fearful, anxious, sad, or mysterious.' },
      { title: 'Recurring Theme Analysis', desc: 'See which symbols and themes appear across your dreams over weeks and months.' },
      { title: 'Dream History Archive', desc: 'All your dreams saved, searchable, and organized by date.' },
    ],
    examples: ['"Flying often represents freedom and ambition..."', '"The shadow figure in your dream may be..."', '"Water in dreams symbolizes emotions..."'],
    faqs: [
      { q: 'Which framework should I choose?', a: 'Jungian is best for archetypes and personal growth. Freudian explores unconscious desires. Gestalt focuses on present experience. Spiritual connects to higher meaning.' },
      { q: 'Do you save my dreams?', a: 'Yes, all dreams are saved to your account. You can view and re-interpret them anytime.' },
      { q: 'Can I track patterns over time?', a: 'Yes, your dream history is always available. Look for recurring symbols, emotions, and themes.' },
    ],
    market: '$2.99B · CAGR 16.3%', badge: 'DAILY USE',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
  memorial: {
    name: 'Memorial', tagline: 'Tribute biographies · Healing letters · Forever memories', icon: '✧', theme: 'theme-memorial', domain: 'memorial',
    heroTitle: 'Honor Those Who Matter Most',
    heroSubtitle: 'Create a beautiful tribute biography for your loved one. Capture their personality, memories, and legacy. Receive a letter in their voice — a gentle farewell.',
    features: [
      { title: 'Memorial Biography', desc: 'A 500-800 word narrative capturing their life story, personality, and the love they shared.' },
      { title: 'Letter from the Departed', desc: 'A 200-300 word letter written in their voice — warm, personal, and healing.' },
      { title: 'Photo + Memory Preservation', desc: 'Save personality traits, beautiful memories, and your feelings about them.' },
      { title: 'Shareable Tribute', desc: 'Generate a tribute page you can share with family and friends.' },
    ],
    examples: ['"Grandma Rose always said the best things in life..."', '"Your father taught you courage by example..."', '"In her final letter to you, she writes..."'],
    faqs: [
      { q: 'Can I create a memorial for a pet?', a: 'Absolutely. We support pets, friends, family members, and any loved one who has passed.' },
      { q: 'Is the letter really in their voice?', a: 'The letter is written in a warm, personal tone based on the personality traits and memories you provide. It is a creative tribute, not a literal channeling.' },
      { q: 'How long does it take?', a: 'About 20-30 seconds. The biography and letter are generated instantly.' },
    ],
    market: 'Pre-Need Death Care $120B · CAGR 6.5%', badge: 'BLUE OCEAN',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
  genealogy: {
    name: 'Family Atlas', tagline: 'Family stories · Origins · Heritage narratives', icon: '✦', theme: 'theme-genealogy', domain: 'family-atlas',
    heroTitle: 'Weave Your Family\'s Story',
    heroSubtitle: 'Document your family members, origins, and traditions. Preserve your bloodline story in a beautiful narrative for future generations.',
    features: [
      { title: 'Family Story Generation', desc: 'AI weaves your family info into a 1000+ word narrative spanning origins, members, and traditions.' },
      { title: 'Member Profiles', desc: 'Document each family member — their role, personality, and contributions.' },
      { title: 'Origin + Tradition Weaving', desc: 'Capture migration stories, family sayings, recipes, and rituals.' },
      { title: 'Heritage Narrative', desc: 'A cohesive story that connects past, present, and future generations.' },
    ],
    examples: ['"The Chen family originated from Guangdong Province..."', '"Grandfather was a blacksmith known for..."', '"The family motto, passed down through generations..."'],
    faqs: [
      { q: 'Do I need to know my full family tree?', a: 'No. Share what you know — even fragments create a meaningful narrative. You can always add more later.' },
      { q: 'Can I create stories for both sides of my family?', a: 'Yes, create as many family narratives as you like. Each is saved separately.' },
      { q: 'Is this suitable for creating a family heirloom?', a: 'Absolutely. The narrative format is perfect for printing and passing down to children.' },
    ],
    market: 'r/Genealogy 500K+ · Long-tail high-paying', badge: 'LONG TAIL',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
  caregiver: {
    name: 'AI Caregiver Support', tagline: '24/7 assistant for family caregivers', icon: '★', theme: 'theme-caregiver', domain: 'caregiver',
    heroTitle: 'You\'re Not Alone in This',
    heroSubtitle: '63 million Americans care for sick or elderly family members. Get 24/7 guidance on symptoms, emotional support, medication questions, and care logging.',
    features: [
      { title: 'Symptom Analysis', desc: 'Describe what you observe — get possible causes and actionable next steps (non-diagnostic).' },
      { title: 'Emotional Support', desc: 'Caregiving is exhausting. Talk through your feelings with a compassionate AI assistant.' },
      { title: 'Care Log with AI Advice', desc: 'Record daily care observations. Get AI-generated insights and patterns over time.' },
      { title: 'Emergency Red Flags', desc: 'Know which symptoms need immediate medical attention vs. home care.' },
    ],
    examples: ['"Mom\'s blood pressure is high this morning, should I..."', '"I\'m feeling overwhelmed and guilty about..."', '"Dad hasn\'t eaten well in 3 days..."'],
    faqs: [
      { q: 'Is this a medical device?', a: 'No. This is a support tool for caregivers. It provides general information only, not medical diagnosis. Always consult a doctor for medical concerns.' },
      { q: 'What if it\'s an emergency?', a: 'Call 911 (or your local emergency number) immediately. Do not rely on this tool for emergencies.' },
      { q: 'Can it help with caregiver burnout?', a: 'Yes. The emotional support feature is designed specifically for caregiver burnout, stress, and guilt.' },
    ],
    market: 'CAGR 16% · $1.71B → $7.5B · 63M US caregivers', badge: 'ESSENTIAL',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
  directory: {
    name: 'AI Toolkit', tagline: 'AI Tools Directory + Prompt Library', icon: '✧', theme: 'theme-directory', domain: 'toolkit',
    heroTitle: 'Find the Right AI Tool, Every Time',
    heroSubtitle: 'Browse curated AI tools, agents, and SaaS products. Generate, save, and share powerful prompts. Everything AI, in one place.',
    features: [
      { title: 'AI Tools Directory', desc: '6 categories: AI Tools, AI Agents, SaaS, Newsletters, Resources. Submit and upvote.' },
      { title: 'Prompt Generator', desc: 'Generate reusable prompt templates for ChatGPT, Claude, Gemini, and Midjourney.' },
      { title: 'Prompt Library', desc: 'Browse community prompts across writing, image, business, coding, marketing, and personal growth.' },
      { title: 'Save + Share', desc: 'Copy prompts with one click. Submit your own to the community library.' },
    ],
    examples: ['"Write a viral Twitter thread about..."', '"Generate a product requirements document for..."', '"Create a Midjourney prompt for a sunset..."'],
    faqs: [
      { q: 'Can I submit my own AI tool?', a: 'Yes! Click "Submit" on the Directory tab. All submissions are reviewed before going live.' },
      { q: 'Are the prompts free to use?', a: 'Yes, all public prompts are free. You can copy, modify, and use them however you like.' },
      { q: 'What models are supported?', a: 'ChatGPT, Claude, Gemini, and Midjourney prompt templates are available.' },
    ],
    market: '$34K MRR directory + $1.3B prompts market', badge: 'AI TOOL',
    footerLinks: [
      { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' }, { label: 'Contact', href: '/contact' },
    ],
  },
};

interface Props { productId: ProductId; }

export function ProductPage({ productId }: Props) {
  const { user, setUser } = useSession();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [aiProvider, setAiProvider] = useState('');
  const [aiFree, setAiFree] = useState(true);
  const cfg = CONFIGS[productId];

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const authRes = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'me' }) });
        const authData = await authRes.json();
        if (authData.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || authData.user.locale || 'en';
          setUser({ userId: authData.user.id, email: authData.user.email, name: authData.user.name, plan: authData.user.plan, locale: savedLocale, isAuthed: true, subStatus: authData.user.subStatus, currentPeriodEnd: authData.user.currentPeriodEnd, birthDate: authData.user.birthDate, birthTime: authData.user.birthTime, birthPlace: authData.user.birthPlace, gender: authData.user.gender });
          if (!cancelled) setBootstrapped(true);
          return;
        }
      } catch {}
      try {
        const res = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        const data = await res.json();
        if (!cancelled && data.user) {
          const savedLocale = (localStorage.getItem('lumina-locale') as any) || 'en';
          setUser({ userId: data.user.id, name: data.user.name || undefined, birthDate: data.user.birthDate || undefined, birthTime: data.user.birthTime || undefined, birthPlace: data.user.birthPlace || undefined, gender: data.user.gender || undefined, plan: data.user.plan || 'free', trialEndsAt: data.user.trialEndsAt || undefined, locale: savedLocale, isAuthed: false });
        }
      } catch (e) { console.error('init error:', e); }
      finally { if (!cancelled) setBootstrapped(true); }
    };
    init();
    return () => { cancelled = true; };
  }, [setUser]);

  useEffect(() => {
    fetch('/api/ai-info').then(r => r.json()).then(d => {
      setAiProvider(d.provider === 'deepseek' ? 'DeepSeek' : d.provider === 'openai' ? 'OpenAI' : 'GLM');
      setAiFree(d.isFree !== false);
    }).catch(() => {});
  }, []);

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

  if (!bootstrapped) {
    return (
      <div className={`product-app-root ${cfg.theme} flex items-center justify-center min-h-screen`}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-float" />
          <p className="product-app-header mt-4 text-sm tracking-widest">LOADING {cfg.name.toUpperCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <LocaleProvider>
      <div className={`product-app-root ${cfg.theme} relative overflow-hidden min-h-screen`}>
        {/* Header — independent brand, no "Sky" back button */}
        <header className="relative z-10 border-b border-[var(--p-border)] bg-black/20 backdrop-blur-md sticky top-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{cfg.icon}</span>
              <h1 className="text-sm sm:text-lg font-bold product-app-header truncate" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{cfg.name}</h1>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <LanguageSwitcher /><ThemeToggle />
              {user?.isAuthed && <NotificationBell />}
              <AccountButton /><UpgradeButton />
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
          <Badge className={`mb-4 ${cfg.badge === 'TOP PICK' ? 'bg-amber-500 text-black' : cfg.badge === 'HIGH VALUE' ? 'bg-rose-500 text-white' : cfg.badge === 'DAILY USE' ? 'bg-sky-600 text-white' : cfg.badge === 'BLUE OCEAN' ? 'bg-purple-600 text-white' : cfg.badge === 'ESSENTIAL' ? 'bg-pink-600 text-white' : cfg.badge === 'LONG TAIL' ? 'bg-yellow-700 text-white' : 'bg-emerald-600 text-white'} text-[10px]`}>{cfg.badge}</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold product-app-header mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{cfg.heroTitle}</h2>
          <p className="product-app-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{cfg.heroSubtitle}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-[10px] product-app-muted flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {cfg.market}</span>
            {aiProvider && <Badge variant="outline" className={`text-[9px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : ''}`}>{aiProvider}{aiFree && ' · Free'}</Badge>}
          </div>
          <ShareButtons title={cfg.name} description={cfg.heroSubtitle} />
        </section>

        {/* Features */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cfg.features.map((f, i) => (
              <div key={i} className="product-app-card rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 product-app-accent mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold product-app-header">{f.title}</h3>
                    <p className="text-xs product-app-muted mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* App */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg product-app-header font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Try It Now</h3>
            <p className="text-xs product-app-muted mt-1">3 free uses · No credit card needed</p>
          </div>
          {renderApp()}
        </section>

        {/* Examples */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <h3 className="text-lg product-app-header font-semibold mb-3 text-center" style={{ fontFamily: 'var(--font-cormorant), serif' }}>What You&apos;ll Get</h3>
          <div className="space-y-2">
            {cfg.examples.map((ex, i) => (
              <div key={i} className="product-app-card rounded-lg p-3 flex items-start gap-2">
                <Star className="w-3 h-3 product-app-accent mt-1 shrink-0" />
                <p className="text-xs product-app-muted italic">{ex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="product-app-card rounded-xl p-5 text-center">
            <h3 className="text-lg product-app-header font-semibold mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Simple Pricing</h3>
            <div className="grid grid-cols-3 gap-3">
              <div><p className="text-xl font-bold product-app-header">$0</p><p className="text-[10px] product-app-muted">3 free uses</p></div>
              <div className="border-x border-[var(--p-border)]"><p className="text-xl font-bold product-app-header">$4.99<span className="text-xs">/mo</span></p><p className="text-[10px] product-app-muted">Unlimited</p></div>
              <div><p className="text-xl font-bold product-app-header">$47.90<span className="text-xs">/yr</span></p><p className="text-[10px] product-app-muted">Save 20%</p></div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <h3 className="text-lg product-app-header font-semibold mb-3 text-center" style={{ fontFamily: 'var(--font-cormorant), serif' }}>FAQ</h3>
          <div className="space-y-2">
            {cfg.faqs.map((faq, i) => (
              <div key={i} className="product-app-card rounded-lg p-3">
                <p className="text-sm font-semibold product-app-header">{faq.q}</p>
                <p className="text-xs product-app-muted mt-1 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer — independent, no "Lumina Constellation" mention */}
        <footer className="relative z-10 mt-4 pt-4 border-t border-[var(--p-border)] pb-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="product-app-muted text-[10px] mb-3">© 2025 {cfg.name}. All rights reserved.</p>
            <div className="flex items-center justify-center gap-3 text-[10px] product-app-muted flex-wrap">
              {cfg.footerLinks.map((link, i) => (
                <a key={i} href={link.href} className="hover:opacity-80">{link.label}</a>
              ))}
              {aiProvider && (
                <Badge variant="outline" className={`text-[8px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : ''}`}>
                  <Cpu className="w-2 h-2 mr-0.5" />{aiProvider}{aiFree && ' · Free'}
                </Badge>
              )}
            </div>
            <p className="product-app-muted text-[9px] mt-3 italic max-w-md mx-auto">
              For entertainment and self-reflection purposes only. Not medical, psychological, legal, or financial advice.
            </p>
          </div>
        </footer>

        <Toaster />
        <InstallPrompt />
      </div>
    </LocaleProvider>
  );
}
