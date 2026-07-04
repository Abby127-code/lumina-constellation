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
import { LocaleProvider, useLocale } from '@/components/locale-provider';
import { ShareButtons } from '@/components/share-buttons';

// Bilingual content type
interface BiContent {
  en: string;
  zh: string;
}
interface BiFeature { title: BiContent; desc: BiContent; }
interface BiFAQ { q: BiContent; a: BiContent; }

interface ProductConfig {
  name: BiContent;
  tagline: BiContent;
  icon: string;
  theme: string;
  heroTitle: BiContent;
  heroSubtitle: BiContent;
  features: BiFeature[];
  examples: BiContent[];
  faqs: BiFAQ[];
  market: string;
  badge: BiContent;
  footerLinks: { label: BiContent; href: string }[];
}

const CONFIGS: Record<ProductId, ProductConfig> = {
  mystic: {
    name: { en: 'Lumina Spiritual', zh: 'Lumina Spiritual' },
    tagline: { en: 'Astrology · Tarot · Numerology · Daily Energy', zh: '占星 · 塔罗 · 命理 · 每日能量' },
    icon: '✦', theme: 'theme-mystic',
    heroTitle: { en: 'Discover Your Cosmic Blueprint', zh: '探索你的宇宙蓝图' },
    heroSubtitle: {
      en: 'Birth charts, tarot readings, numerology, and daily energy reports — all in one place. Deep, insightful, warm guidance for your spiritual journey.',
      zh: '本命盘解读、塔罗占卜、命理八字、每日能量报告——一站式灵性陪伴。深度、洞察、温暖的灵性指引。'
    },
    features: [
      { title: { en: 'Birth Chart Reading', zh: '本命盘解读' }, desc: { en: 'AI-powered natal chart analysis. Sun, Moon, Rising signs and planetary aspects explained in depth.', zh: 'AI 本命盘深度分析，解读太阳、月亮、上升星座及行星相位。' } },
      { title: { en: 'Tarot Spreads', zh: '塔罗占卜' }, desc: { en: '3, 5, or 7 card spreads with full interpretation. Past, present, future guidance.', zh: '3/5/7 张牌阵，含完整解读。过去、现在、未来的指引。' } },
      { title: { en: 'Bazi Numerology', zh: '命理八字' }, desc: { en: 'Chinese Four Pillars analysis. Five Elements, Ten Gods, life cycles.', zh: '中国四柱八字分析。五行生克、十神关系、大运流年。' } },
      { title: { en: 'Daily Energy Report', zh: '每日能量报告' }, desc: { en: 'Personalized daily guidance combining astrology, moon phase, and numerology.', zh: '融合占星、月相、数字能量学的个性化每日指引。' } },
    ],
    examples: [
      { en: '"Your Sun in Leo gives you natural leadership..."', zh: '"你的太阳在狮子座，赋予你天生的领导力……"' },
      { en: '"The Three of Swords suggests..."', zh: '"宝剑三暗示着……"' },
      { en: '"Your Day Master is Yang Fire..."', zh: '"你的日主是丙火……"' },
    ],
    faqs: [
      { q: { en: 'Do I need to know my exact birth time?', zh: '我需要知道确切的出生时间吗？' }, a: { en: 'Exact birth time improves accuracy but is optional. Date and place are sufficient for a basic reading.', zh: '确切的出生时间会提高准确度，但不是必须的。日期和地点足够做基础解读。' } },
      { q: { en: 'Which tarot deck do you use?', zh: '你们用哪种塔罗牌？' }, a: { en: 'We use the Rider-Waite tradition with 22 Major Arcana, including reversed positions.', zh: '我们使用韦特塔罗体系，22张大阿卡那，含正逆位。' } },
      { q: { en: 'Is this entertainment or real guidance?', zh: '这是娱乐还是真正的指引？' }, a: { en: 'Our readings are for entertainment and self-reflection. They are not medical, psychological, or financial advice.', zh: '我们的解读仅供娱乐与自我反思，不构成医疗、心理或财务建议。' } },
    ],
    market: 'CAGR 19.8% · $5.69B → $11.71B',
    badge: { en: 'TOP PICK', zh: '首选推荐' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
    ],
  },
  storybook: {
    name: { en: 'Storybook Studio', zh: 'Storybook Studio' },
    tagline: { en: "Personalized children's stories · Illustrated · Printable", zh: '个性化儿童故事 · 精美插图 · 可打印' },
    icon: '★', theme: 'theme-storybook',
    heroTitle: { en: 'Create Magical Stories for Your Child', zh: '为你的孩子创造神奇故事' },
    heroSubtitle: {
      en: "Turn your child into the hero of their own adventure. Personalized names, themes, illustration styles, and moral lessons. Print-ready format.",
      zh: '让你的孩子成为自己冒险故事的主角。个性化名字、主题、插图风格和寓意。可打印格式。'
    },
    features: [
      { title: { en: 'Personalized Protagonist', zh: '个性化主角' }, desc: { en: "Your child's name woven into the story. They become the hero.", zh: '你孩子的名字融入故事，成为主角。' } },
      { title: { en: '5 Illustration Styles', zh: '5 种插图风格' }, desc: { en: 'Watercolor, cartoon, Pixar 3D, anime, or classic picture book — pick your aesthetic.', zh: '水彩、卡通、皮克斯3D、动漫或经典绘本——选择你的风格。' } },
      { title: { en: 'Moral + Parent Questions', zh: '寓意 + 家长问题' }, desc: { en: 'Each story ends with a life lesson and 2-3 discussion questions for parents.', zh: '每个故事结尾有寓意和2-3个家长讨论问题。' } },
      { title: { en: 'Print-Ready Format', zh: '可打印格式' }, desc: { en: 'Download as PDF with per-page illustration prompts. Print at home or via POD services.', zh: '下载PDF，每页含插图提示。可在家打印或用按需印刷服务。' } },
    ],
    examples: [
      { en: '"Once upon a time, little Emma discovered..."', zh: '"从前，小艾玛发现了一个……"' },
      { en: '"The dragon was not scary, but lonely..."', zh: '"那条龙并不可怕，只是孤独……"' },
      { en: '"And so, Lucas learned that kindness..."', zh: '"就这样，卢卡斯学会了善良……"' },
    ],
    faqs: [
      { q: { en: 'What ages are the stories for?', zh: '故事适合什么年龄？' }, a: { en: 'Ages 3-10. The language complexity adjusts to the age you specify.', zh: '3-10岁。语言复杂度会根据你指定的年龄调整。' } },
      { q: { en: 'Can I print the stories?', zh: '我可以打印故事吗？' }, a: { en: 'Yes! Each story includes illustration prompts per page. Use Print-on-Demand services like Gelato or Lulu.', zh: '可以！每个故事每页含插图提示。可使用 Gelato 或 Lulu 按需印刷服务。' } },
      { q: { en: 'How long are the stories?', zh: '故事有多长？' }, a: { en: '800-1200 words across 5-8 illustrated pages. Perfect for bedtime reading.', zh: '800-1200字，5-8个插图页面。完美适合睡前阅读。' } },
    ],
    market: 'CAGR 21.8% · $3.2B → $18.7B',
    badge: { en: 'HIGH VALUE', zh: '高价值' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
    ],
  },
  dream: {
    name: { en: 'Dream Journal', zh: 'Dream Journal' },
    tagline: { en: 'Record · Interpret · Track your subconscious', zh: '记录 · 解读 · 追踪你的潜意识' },
    icon: '🌙', theme: 'theme-dream',
    heroTitle: { en: 'Understand What Your Dreams Are Telling You', zh: '理解你的梦境在告诉你什么' },
    heroSubtitle: {
      en: 'Record your dreams and get multi-perspective interpretations. Track recurring themes. Discover patterns in your subconscious over time.',
      zh: '记录你的梦境，获得多视角解读。追踪反复出现的主题。发现潜意识中的模式。'
    },
    features: [
      { title: { en: '4 Interpretation Frameworks', zh: '4 种解读框架' }, desc: { en: 'Jungian archetypes, Freudian psychoanalysis, Gestalt therapy, and spiritual perspective.', zh: '荣格原型、弗洛伊德精神分析、格式塔疗法和灵性视角。' } },
      { title: { en: 'Dream Mood Tracking', zh: '梦境情绪追踪' }, desc: { en: 'Tag emotions: calm, joyful, fearful, anxious, sad, or mysterious.', zh: '标记情绪：平静、喜悦、恐惧、焦虑、悲伤或神秘。' } },
      { title: { en: 'Recurring Theme Analysis', zh: '反复主题分析' }, desc: { en: 'See which symbols and themes appear across your dreams over weeks and months.', zh: '查看哪些符号和主题在数周数月的梦境中反复出现。' } },
      { title: { en: 'Dream History Archive', zh: '梦境历史档案' }, desc: { en: 'All your dreams saved, searchable, and organized by date.', zh: '所有梦境已保存，可搜索，按日期整理。' } },
    ],
    examples: [
      { en: '"Flying often represents freedom and ambition..."', zh: '"飞翔通常代表自由和抱负……"' },
      { en: '"The shadow figure in your dream may be..."', zh: '"梦中的阴影人物可能是……"' },
      { en: '"Water in dreams symbolizes emotions..."', zh: '"梦中的水象征着情感……"' },
    ],
    faqs: [
      { q: { en: 'Which framework should I choose?', zh: '我该选哪个解读框架？' }, a: { en: 'Jungian is best for archetypes and personal growth. Freudian explores unconscious desires. Gestalt focuses on present experience. Spiritual connects to higher meaning.', zh: '荣格适合原型和个人成长。弗洛伊德探索潜意识欲望。格式塔关注当下体验。灵性视角连接更高意义。' } },
      { q: { en: 'Do you save my dreams?', zh: '你们会保存我的梦境吗？' }, a: { en: 'Yes, all dreams are saved to your account. You can view and re-interpret them anytime.', zh: '是的，所有梦境保存在你的账户中。你可以随时查看和重新解读。' } },
      { q: { en: 'Can I track patterns over time?', zh: '我可以追踪长期模式吗？' }, a: { en: 'Yes, your dream history is always available. Look for recurring symbols, emotions, and themes.', zh: '可以，你的梦境历史始终可用。留意反复出现的符号、情绪和主题。' } },
    ],
    market: '$2.99B · CAGR 16.3%',
    badge: { en: 'DAILY USE', zh: '日常使用' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
    ],
  },
  memorial: {
    name: { en: 'Memorial', zh: 'Memorial' },
    tagline: { en: 'Tribute biographies · Healing letters · Forever memories', zh: '纪念传记 · 疗愈信件 · 永恒记忆' },
    icon: '✧', theme: 'theme-memorial',
    heroTitle: { en: 'Honor Those Who Matter Most', zh: '致敬最重要的人' },
    heroSubtitle: {
      en: "Create a beautiful tribute biography for your loved one. Capture their personality, memories, and legacy. Receive a letter in their voice — a gentle farewell.",
      zh: '为你挚爱的人创建美好的纪念传记。记录他们的性格、回忆和精神遗产。收到一封以他们口吻写的信——温柔的告别。'
    },
    features: [
      { title: { en: 'Memorial Biography', zh: '纪念传记' }, desc: { en: 'A 500-800 word narrative capturing their life story, personality, and the love they shared.', zh: '500-800字的叙述，记录他们的生命故事、性格和分享的爱。' } },
      { title: { en: 'Letter from the Departed', zh: '来自逝者的信' }, desc: { en: 'A 200-300 word letter written in their voice — warm, personal, and healing.', zh: '200-300字的信，以他们的口吻书写——温暖、个人化、疗愈。' } },
      { title: { en: 'Photo + Memory Preservation', zh: '照片 + 回忆保存' }, desc: { en: 'Save personality traits, beautiful memories, and your feelings about them.', zh: '保存性格特点、美好回忆和你的感受。' } },
      { title: { en: 'Shareable Tribute', zh: '可分享的纪念' }, desc: { en: 'Generate a tribute page you can share with family and friends.', zh: '生成可分享给家人和朋友的纪念页面。' } },
    ],
    examples: [
      { en: '"Grandma Rose always said the best things in life..."', zh: '"奶奶罗斯总说，生命中最美好的事物……"' },
      { en: '"Your father taught you courage by example..."', zh: '"你的父亲以身作则教会了你勇气……"' },
      { en: '"In her final letter to you, she writes..."', zh: '"在她给你的最后一封信中，她写道……"' },
    ],
    faqs: [
      { q: { en: 'Can I create a memorial for a pet?', zh: '我可以为宠物创建纪念吗？' }, a: { en: 'Absolutely. We support pets, friends, family members, and any loved one who has passed.', zh: '当然。我们支持宠物、朋友、家人和任何已逝去的挚爱。' } },
      { q: { en: 'Is the letter really in their voice?', zh: '信真的是他们的口吻吗？' }, a: { en: 'The letter is written in a warm, personal tone based on the personality traits and memories you provide. It is a creative tribute, not a literal channeling.', zh: '信件根据你提供的性格特点和回忆，以温暖个人化的口吻撰写。这是创意致敬，不是通灵。' } },
      { q: { en: 'How long does it take?', zh: '需要多长时间？' }, a: { en: 'About 20-30 seconds. The biography and letter are generated instantly.', zh: '大约20-30秒。传记和信件即时生成。' } },
    ],
    market: 'Pre-Need Death Care $120B · CAGR 6.5%',
    badge: { en: 'BLUE OCEAN', zh: '蓝海' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
    ],
  },
  genealogy: {
    name: { en: 'Family Atlas', zh: 'Family Atlas' },
    tagline: { en: 'Family stories · Origins · Heritage narratives', zh: '家族故事 · 起源 · 传承叙事' },
    icon: '✦', theme: 'theme-genealogy',
    heroTitle: { en: "Weave Your Family's Story", zh: '编织你的家族故事' },
    heroSubtitle: {
      en: "Document your family members, origins, and traditions. Preserve your bloodline story in a beautiful narrative for future generations.",
      zh: '记录你的家族成员、起源和传统。用优美的叙事保存你的血脉故事，留给后代。'
    },
    features: [
      { title: { en: 'Family Story Generation', zh: '家族故事生成' }, desc: { en: 'AI weaves your family info into a 1000+ word narrative spanning origins, members, and traditions.', zh: 'AI 将你的家族信息编织成1000+字的叙事，涵盖起源、成员和传统。' } },
      { title: { en: 'Member Profiles', zh: '成员档案' }, desc: { en: 'Document each family member — their role, personality, and contributions.', zh: '记录每位家族成员——角色、性格和贡献。' } },
      { title: { en: 'Origin + Tradition Weaving', zh: '起源 + 传统编织' }, desc: { en: 'Capture migration stories, family sayings, recipes, and rituals.', zh: '记录迁徙故事、家训、食谱和仪式。' } },
      { title: { en: 'Heritage Narrative', zh: '传承叙事' }, desc: { en: 'A cohesive story that connects past, present, and future generations.', zh: '一个连贯的故事，连接过去、现在和未来。' } },
    ],
    examples: [
      { en: '"The Chen family originated from Guangdong Province..."', zh: '"陈家起源于广东省……"' },
      { en: '"Grandfather was a blacksmith known for..."', zh: '"祖父是一个铁匠，以……闻名"' },
      { en: '"The family motto, passed down through generations..."', zh: '"家训，代代相传……"' },
    ],
    faqs: [
      { q: { en: 'Do I need to know my full family tree?', zh: '我需要知道完整的家谱吗？' }, a: { en: "No. Share what you know — even fragments create a meaningful narrative. You can always add more later.", zh: '不需要。分享你所知道的——即使是片段也能创造有意义的叙事。以后可以随时补充。' } },
      { q: { en: 'Can I create stories for both sides of my family?', zh: '我可以为双方家族创建故事吗？' }, a: { en: 'Yes, create as many family narratives as you like. Each is saved separately.', zh: '可以，创建任意数量的家族叙事。每个单独保存。' } },
      { q: { en: 'Is this suitable for creating a family heirloom?', zh: '这适合做传家宝吗？' }, a: { en: 'Absolutely. The narrative format is perfect for printing and passing down to children.', zh: '当然。叙事格式非常适合打印并传给孩子。' } },
    ],
    market: 'r/Genealogy 500K+ · Long-tail high-paying',
    badge: { en: 'LONG TAIL', zh: '长尾' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
    ],
  },
  caregiver: {
    name: { en: 'AI Caregiver Support', zh: 'AI Caregiver Support' },
    tagline: { en: '24/7 assistant for family caregivers', zh: '家庭照护者的 24/7 助手' },
    icon: '★', theme: 'theme-caregiver',
    heroTitle: { en: "You're Not Alone in This", zh: '你不是一个人在战斗' },
    heroSubtitle: {
      en: '63 million Americans care for sick or elderly family members. Get 24/7 guidance on symptoms, emotional support, medication questions, and care logging.',
      zh: '6300万美国人在照顾生病或年迈的家人。获得24/7的症状指导、情绪支持、用药问题和照护日志。'
    },
    features: [
      { title: { en: 'Symptom Analysis', zh: '症状分析' }, desc: { en: 'Describe what you observe — get possible causes and actionable next steps (non-diagnostic).', zh: '描述你观察到的——获得可能的原因和可执行的下一步（非诊断）。' } },
      { title: { en: 'Emotional Support', zh: '情绪支持' }, desc: { en: 'Caregiving is exhausting. Talk through your feelings with a compassionate AI assistant.', zh: '照护很累。和有同理心的 AI 助手倾诉你的感受。' } },
      { title: { en: 'Care Log with AI Advice', zh: '照护日志 + AI 建议' }, desc: { en: 'Record daily care observations. Get AI-generated insights and patterns over time.', zh: '记录日常照护观察。获得 AI 生成的洞察和长期模式。' } },
      { title: { en: 'Emergency Red Flags', zh: '紧急警示' }, desc: { en: 'Know which symptoms need immediate medical attention vs. home care.', zh: '了解哪些症状需要立即就医，哪些可以居家护理。' } },
    ],
    examples: [
      { en: "\"Mom's blood pressure is high this morning, should I...\"", zh: '"妈妈今早血压偏高，我应该……"' },
      { en: '"I\'m feeling overwhelmed and guilty about..."', zh: '"我感到不堪重负和内疚，因为……"' },
      { en: "\"Dad hasn't eaten well in 3 days...\"", zh: '"爸爸已经3天没好好吃饭了……"' },
    ],
    faqs: [
      { q: { en: 'Is this a medical device?', zh: '这是医疗设备吗？' }, a: { en: 'No. This is a support tool for caregivers. It provides general information only, not medical diagnosis. Always consult a doctor for medical concerns.', zh: '不是。这是照护者的支持工具。仅提供一般信息，不是医疗诊断。有医疗问题请咨询医生。' } },
      { q: { en: 'What if it\'s an emergency?', zh: '如果紧急怎么办？' }, a: { en: 'Call 911 (or your local emergency number) immediately. Do not rely on this tool for emergencies.', zh: '立即拨打120（或当地急救电话）。紧急情况不要依赖此工具。' } },
      { q: { en: 'Can it help with caregiver burnout?', zh: '能帮助照护者倦怠吗？' }, a: { en: 'Yes. The emotional support feature is designed specifically for caregiver burnout, stress, and guilt.', zh: '可以。情绪支持功能专门为照护者倦怠、压力和内疚而设计。' } },
    ],
    market: 'CAGR 16% · $1.71B → $7.5B · 63M US caregivers',
    badge: { en: 'ESSENTIAL', zh: '刚需' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
    ],
  },
  directory: {
    name: { en: 'AI Toolkit', zh: 'AI Toolkit' },
    tagline: { en: 'AI Tools Directory + Prompt Library', zh: 'AI 工具目录 + Prompt 库' },
    icon: '✧', theme: 'theme-directory',
    heroTitle: { en: 'Find the Right AI Tool, Every Time', zh: '每次都找到对的 AI 工具' },
    heroSubtitle: {
      en: 'Browse curated AI tools, agents, and SaaS products. Generate, save, and share powerful prompts. Everything AI, in one place.',
      zh: '浏览精选 AI 工具、Agent 和 SaaS 产品。生成、保存和分享强大的 Prompt。AI 的一切，尽在一处。'
    },
    features: [
      { title: { en: 'AI Tools Directory', zh: 'AI 工具目录' }, desc: { en: '6 categories: AI Tools, AI Agents, SaaS, Newsletters, Resources. Submit and upvote.', zh: '6 大分类：AI 工具、AI Agent、SaaS、Newsletter、资源。提交和投票。' } },
      { title: { en: 'Prompt Generator', zh: 'Prompt 生成器' }, desc: { en: 'Generate reusable prompt templates for ChatGPT, Claude, Gemini, and Midjourney.', zh: '为 ChatGPT、Claude、Gemini 和 Midjourney 生成可复用的 Prompt 模板。' } },
      { title: { en: 'Prompt Library', zh: 'Prompt 库' }, desc: { en: 'Browse community prompts across writing, image, business, coding, marketing, and personal growth.', zh: '浏览社区 Prompt，涵盖写作、图像、商业、编程、营销和个人成长。' } },
      { title: { en: 'Save + Share', zh: '保存 + 分享' }, desc: { en: 'Copy prompts with one click. Submit your own to the community library.', zh: '一键复制 Prompt。提交你自己的到社区库。' } },
    ],
    examples: [
      { en: '"Write a viral Twitter thread about..."', zh: '"写一个关于……的爆款 Twitter 主题"' },
      { en: '"Generate a product requirements document for..."', zh: '"生成一个……的产品需求文档"' },
      { en: '"Create a Midjourney prompt for a sunset..."', zh: '"创建一个日落主题的 Midjourney Prompt"' },
    ],
    faqs: [
      { q: { en: 'Can I submit my own AI tool?', zh: '我可以提交自己的 AI 工具吗？' }, a: { en: 'Yes! Click "Submit" on the Directory tab. All submissions are reviewed before going live.', zh: '可以！在目录标签页点"提交"。所有提交在上线前会审核。' } },
      { q: { en: 'Are the prompts free to use?', zh: 'Prompt 是免费的吗？' }, a: { en: 'Yes, all public prompts are free. You can copy, modify, and use them however you like.', zh: '是的，所有公开 Prompt 免费。你可以复制、修改和使用。' } },
      { q: { en: 'What models are supported?', zh: '支持哪些模型？' }, a: { en: 'ChatGPT, Claude, Gemini, and Midjourney prompt templates are available.', zh: '支持 ChatGPT、Claude、Gemini 和 Midjourney 的 Prompt 模板。' } },
    ],
    market: '$34K MRR directory + $1.3B prompts market',
    badge: { en: 'AI TOOL', zh: 'AI 工具' },
    footerLinks: [
      { label: { en: 'Privacy', zh: '隐私' }, href: '/privacy' },
      { label: { en: 'Terms', zh: '条款' }, href: '/terms' },
      { label: { en: 'Disclaimer', zh: '免责' }, href: '/disclaimer' },
      { label: { en: 'GDPR', zh: 'GDPR' }, href: '/gdpr' },
      { label: { en: 'CCPA', zh: 'CCPA' }, href: '/ccpa' },
      { label: { en: 'DMCA', zh: 'DMCA' }, href: '/dmca' },
      { label: { en: 'Contact', zh: '联系' }, href: '/contact' },
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

  // Get locale - responsive to language changes
  const [locale, setLocale] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    // Initial detection
    const detectLocale = () => {
      const saved = localStorage.getItem('lumina-locale');
      if (saved === 'zh') return 'zh';
      if (saved) return 'en';
      // Auto-detect from browser
      const browserLang = navigator.language?.toLowerCase().split('-')[0];
      return browserLang === 'zh' ? 'zh' : 'en';
    };

    const t = setTimeout(() => setLocale(detectLocale()), 0);

    // Listen for locale changes
    const checkLocale = () => setLocale(detectLocale());
    window.addEventListener('storage', checkLocale);
    // Also poll every 500ms for 3 seconds (covers in-page language switch)
    const interval = setInterval(checkLocale, 500);
    const stopInterval = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearTimeout(t);
      clearTimeout(stopInterval);
      clearInterval(interval);
      window.removeEventListener('storage', checkLocale);
    };
  }, []);

  // Bootstrap user
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
          <p className="product-app-header mt-4 text-sm tracking-widest">LOADING...</p>
        </div>
      </div>
    );
  }

  const t = (content: BiContent) => content[locale] || content.en;

  return (
    <LocaleProvider>
      <div className={`product-app-root ${cfg.theme} relative overflow-hidden min-h-screen`}>
        {/* Header */}
        <header className="relative z-10 border-b border-[var(--p-border)] bg-black/20 backdrop-blur-md sticky top-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{cfg.icon}</span>
              <h1 className="text-sm sm:text-lg font-bold product-app-header truncate" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t(cfg.name)}</h1>
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
          <Badge className={`mb-4 text-[10px]`}>{t(cfg.badge)}</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold product-app-header mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t(cfg.heroTitle)}</h2>
          <p className="product-app-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{t(cfg.heroSubtitle)}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-[10px] product-app-muted flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {cfg.market}</span>
            {aiProvider && <Badge variant="outline" className={`text-[9px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : ''}`}>{aiProvider}{aiFree && ' · Free'}</Badge>}
          </div>
          <ShareButtons title={t(cfg.name)} description={t(cfg.heroSubtitle)} />
        </section>

        {/* Features */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cfg.features.map((f, i) => (
              <div key={i} className="product-app-card rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 product-app-accent mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold product-app-header">{t(f.title)}</h3>
                    <p className="text-xs product-app-muted mt-0.5 leading-relaxed">{t(f.desc)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* App */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg product-app-header font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{locale === 'zh' ? '立即体验' : 'Try It Now'}</h3>
            <p className="text-xs product-app-muted mt-1">{locale === 'zh' ? '3 次免费 · 无需信用卡' : '3 free uses · No credit card needed'}</p>
          </div>
          {renderApp()}
        </section>

        {/* Examples */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <h3 className="text-lg product-app-header font-semibold mb-3 text-center" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{locale === 'zh' ? '你将获得' : "What You'll Get"}</h3>
          <div className="space-y-2">
            {cfg.examples.map((ex, i) => (
              <div key={i} className="product-app-card rounded-lg p-3 flex items-start gap-2">
                <Star className="w-3 h-3 product-app-accent mt-1 shrink-0" />
                <p className="text-xs product-app-muted italic">{t(ex)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="product-app-card rounded-xl p-5 text-center">
            <h3 className="text-lg product-app-header font-semibold mb-3" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{locale === 'zh' ? '简单定价' : 'Simple Pricing'}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div><p className="text-xl font-bold product-app-header">$0</p><p className="text-[10px] product-app-muted">{locale === 'zh' ? '3 次免费' : '3 free uses'}</p></div>
              <div className="border-x border-[var(--p-border)]"><p className="text-xl font-bold product-app-header">$4.99<span className="text-xs">/mo</span></p><p className="text-[10px] product-app-muted">{locale === 'zh' ? '无限使用' : 'Unlimited'}</p></div>
              <div><p className="text-xl font-bold product-app-header">$47.90<span className="text-xs">/yr</span></p><p className="text-[10px] product-app-muted">{locale === 'zh' ? '省 20%' : 'Save 20%'}</p></div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <h3 className="text-lg product-app-header font-semibold mb-3 text-center" style={{ fontFamily: 'var(--font-cormorant), serif' }}>FAQ</h3>
          <div className="space-y-2">
            {cfg.faqs.map((faq, i) => (
              <div key={i} className="product-app-card rounded-lg p-3">
                <p className="text-sm font-semibold product-app-header">{t(faq.q)}</p>
                <p className="text-xs product-app-muted mt-1 leading-relaxed">{t(faq.a)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 mt-4 pt-4 border-t border-[var(--p-border)] pb-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="product-app-muted text-[10px] mb-3">© 2025 {t(cfg.name)}. All rights reserved. · support@dealcanny.com</p>
            <div className="flex items-center justify-center gap-2 text-[10px] product-app-muted flex-wrap">
              {cfg.footerLinks.map((link, i) => (
                <a key={i} href={link.href} className="hover:opacity-80">{t(link.label)}</a>
              ))}
              {aiProvider && (
                <Badge variant="outline" className={`text-[8px] ${aiFree ? 'border-emerald-400/30 text-emerald-300/70' : ''}`}>
                  <Cpu className="w-2 h-2 mr-0.5" />{aiProvider}{aiFree && ' · Free'}
                </Badge>
              )}
            </div>
            <p className="product-app-muted text-[9px] mt-3 italic max-w-md mx-auto">
              {locale === 'zh'
                ? '仅供娱乐与自我反思，不构成医疗、心理、法律或财务建议。'
                : 'For entertainment and self-reflection purposes only. Not medical, psychological, legal, or financial advice.'}
            </p>
          </div>
        </footer>

        <Toaster />
        <InstallPrompt />
      </div>
    </LocaleProvider>
  );
}
