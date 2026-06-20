'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles, BookOpen, LayoutGrid, MessageSquareCode, Ghost, Heart,
  Users, Zap, ArrowRight, Rocket, TrendingUp, Trophy, Bot, Video, Star,
} from 'lucide-react';
import { useLocale } from '@/components/locale-provider';

type Track = 'home' | 'mystic' | 'storybook' | 'directory' | 'prompts' | 'memorial' | 'caregiver' | 'genealogy' | 'microsaas' | 'agent' | 'tiktok' | 'account';

// 8 Stars of Lumina Constellation
// Each product maps to a real star/constellation with mystical meaning
const TRACKS = [
  {
    id: 'mystic' as const,
    star: 'Vega',
    starSymbol: '✦',
    starMeaning: { zh: '织女星 · 命运编织者', en: 'Vega · The Weaver of Fate', es: 'Vega · Tejedora del Destino', pt: 'Vega · Tecelã do Destino', ja: 'ベガ · 運命の織り手', hi: 'वेगा · भाग्य के बुनकर', ar: 'النسر الواقع · ناسج القدر' },
    name: { zh: 'AI 灵性陪伴', en: 'AI Spiritual Companion', es: 'Espiritual IA', pt: 'Espiritual IA', ja: 'スピリチュアル', hi: 'आध्यात्मिक', ar: 'روحاني' },
    tagline: { zh: '占星 · 塔罗 · 解梦 · 命理 · 能量', en: 'Astrology · Tarot · Dream · Numerology', es: 'Astrología · Tarot · Sueños', pt: 'Astrologia · Tarot · Sonhos', ja: '占星・タロット・夢', hi: 'ज्योतिष · टैरो · स्वप्न', ar: 'تنجيم · تاروت · أحلام' },
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-amber-500/20 to-purple-700/20',
    border: 'border-amber-400/40',
    badge: 'top1',
    market: 'CAGR 19.8% · $5.69B → $11.71B',
    description: {
      zh: '一体化 AI 玄学超级 App，整合西方占星、塔罗、解梦、八字、每日能量报告。',
      en: 'All-in-one AI spiritual super app: Western astrology, tarot, dream interpretation, Bazi, daily energy.',
      es: 'App espiritual IA todo en uno: astrología, tarot, sueños, energía diaria.',
      pt: 'App espiritual IA: astrologia, tarot, sonhos, energia diária.',
      ja: 'AI スピリチュアル統合アプリ：占星、タロット、夢分析、エネルギーレポート。',
      hi: 'सभी आध्यात्मिक सेवाएं: ज्योतिष, टैरो, स्वप्न, ऊर्जा रिपोर्ट।',
      ar: 'تطبيق روحاني متكامل: تنجيم، تاروت، أحلام، طاقة.',
    },
    status: 'online',
  },
  {
    id: 'storybook' as const,
    star: 'Andromeda',
    starSymbol: '★',
    starMeaning: { zh: '仙女座 · 想象力解放者', en: 'Andromeda · Liberator of Imagination', es: 'Andrómeda · Liberadora de la Imaginación', pt: 'Andrômeda · Libertadora da Imaginação', ja: 'アンドロメダ · 想像力の解放者', hi: 'एंड्रोमेडा · कल्पना का मुक्तिदाता', ar: 'أندروميدا · محرر الخيال' },
    name: { zh: 'AI 儿童故事书', en: 'AI Kids Storybook', es: 'Cuentos IA', pt: 'Livros IA', ja: '絵本作成', hi: 'बच्चों की किताब', ar: 'كتب الأطفال' },
    tagline: { zh: '个性化 · 教育性 · 可印刷', en: 'Personalized · Educational · Printable', es: 'Personalizado · Educativo', pt: 'Personalizado · Educativo', ja: 'パーソナライズ・教育', hi: 'व्यक्तिगत · शैक्षणिक', ar: 'شخصي · تعليمي' },
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-rose-400/20 to-orange-500/20',
    border: 'border-rose-400/40',
    badge: 'highTicket',
    market: 'CAGR 21.8% · $3.2B → $18.7B',
    description: {
      zh: '输入孩子名字+主题，AI 生成专属故事书，每页配插图。DreamStories.ai 验证 $6M 营收。',
      en: 'Personalized kids storybooks with AI. DreamStories.ai reached $6M ARR.',
      es: 'Libros personalizados para niños. DreamStories.ai: $6M ARR.',
      pt: 'Livros personalizados. DreamStories.ai: $6M ARR.',
      ja: 'パーソナライズ絵本。DreamStories.ai は $6M 達成。',
      hi: 'व्यक्तिगत बच्चों की किताबें। DreamStories.ai: $6M ARR।',
      ar: 'كتب أطفال شخصية. DreamStories.ai: $6M ARR.',
    },
    status: 'online',
  },
  {
    id: 'directory' as const,
    star: 'Polaris',
    starSymbol: '✧',
    starMeaning: { zh: '北极星 · 永恒指引者', en: 'Polaris · The Eternal Guide', es: 'Polaris · La Guía Eterna', pt: 'Polaris · A Guia Eterna', ja: 'ポラリス · 永遠の導き手', hi: 'पोलारिस · शाश्वत मार्गदर्शक', ar: 'الجدي · المرشد الأبدي' },
    name: { zh: 'AI 目录站', en: 'AI Directory', es: 'Directorio IA', pt: 'Diretório IA', ja: 'AIディレクトリ', hi: 'AI निर्देशिका', ar: 'دليل AI' },
    tagline: { zh: '已验证 · 被动收入 · SEO 复利', en: 'Verified · Passive · SEO', es: 'Verificado · Pasivo', pt: 'Verificado · Passivo', ja: '受動収入・SEO', hi: 'निष्क्रिय आय · SEO', ar: 'دخل سلبي · SEO' },
    icon: <LayoutGrid className="w-6 h-6" />,
    color: 'from-emerald-400/20 to-teal-600/20',
    border: 'border-emerald-400/40',
    badge: 'light',
    market: '$34K MRR 案例 · 3 小时/月维护',
    description: {
      zh: '收录 AI 工具、AI Agent、SaaS，构建程序化 SEO 目录站。已验证 $34K MRR。',
      en: 'AI tools directory with programmatic SEO. Verified $34K MRR.',
      es: 'Directorio de herramientas IA. MRR verificado: $34K.',
      pt: 'Diretório de ferramentas IA. MRR: $34K.',
      ja: 'AIツールディレクトリ。$34K MRR 実績。',
      hi: 'AI उपकरण निर्देशिका। $34K MRR।',
      ar: 'دليل أدوات AI. $34K MRR.',
    },
    status: 'online',
  },
  {
    id: 'prompts' as const,
    star: 'Sirius',
    starSymbol: '✦',
    starMeaning: { zh: '天狼星 · 语言点亮者', en: 'Sirius · The Illuminator of Language', es: 'Sirio · Iluminador del Lenguaje', pt: 'Sírius · Iluminador da Linguagem', ja: 'シリウス · 言語の照らし手', hi: 'सिरियस · भाषा का प्रकाशक', ar: 'الشعرى اليمانية · منير اللغة' },
    name: { zh: 'AI Prompt 库', en: 'AI Prompt Library', es: 'Prompts IA', pt: 'Prompts IA', ja: 'プロンプト集', hi: 'प्रॉम्प्ट लाइब्रेरी', ar: 'مكتبة البرومبت' },
    tagline: { zh: '创作 · 收藏 · 分享 · 变现', en: 'Create · Save · Share · Sell', es: 'Crear · Guardar · Vender', pt: 'Criar · Salvar · Vender', ja: '作成・保存・販売', hi: 'बनाएं · सहेजें · बेचें', ar: 'إنشاء · حفظ · بيع' },
    icon: <MessageSquareCode className="w-6 h-6" />,
    color: 'from-sky-400/20 to-indigo-600/20',
    border: 'border-sky-400/40',
    badge: 'highFreq',
    market: 'CAGR 23.3% · $1.3B → $12.1B',
    description: {
      zh: 'AI Prompt 交易与收藏平台，覆盖写作、营销、编程、设计、个人成长。',
      en: 'AI Prompt marketplace: writing, marketing, coding, design.',
      es: 'Mercado de prompts IA: escritura, marketing, programación.',
      pt: 'Mercado de prompts: escrita, marketing, programação.',
      ja: 'プロンプトマーケット。執筆、マーケ、プログラミング。',
      hi: 'प्रॉम्प्ट मार्केट। लेखन, मार्केटिंग, प्रोग्रामिंग।',
      ar: 'سوق البرومبت. كتابة، تسويق، برمجة.',
    },
    status: 'online',
  },
  {
    id: 'memorial' as const,
    star: 'Pleiades',
    starSymbol: '✧',
    starMeaning: { zh: '昴宿星团 · 跨越时间的记忆', en: 'Pleiades · Memory Across Time', es: 'Pléyades · Memoria a Través del Tiempo', pt: 'Plêiades · Memória Através do Tempo', ja: 'プレアデス · 時を超える記憶', hi: 'कृत्तिकाएं · समय के पार स्मृति', ar: 'الثريا · ذاكرة عبر الزمن' },
    name: { zh: 'AI 数字纪念', en: 'AI Memorial', es: 'Memorial IA', pt: 'Memorial IA', ja: 'メモリアル', hi: 'स्मारक', ar: 'تذكاري' },
    tagline: { zh: '为逝者撰写传记 · 疗愈告别', en: 'Tribute biographies · Healing', es: 'Biografías · Sanación', pt: 'Biografias · Cura', ja: '追悼・癒し', hi: 'जीवनी · उपचार', ar: 'سير · شفاء' },
    icon: <Ghost className="w-6 h-6" />,
    color: 'from-purple-400/20 to-indigo-700/20',
    border: 'border-purple-400/40',
    badge: 'blueOcean',
    market: 'Pre-Need Death Care $120B · CAGR 6.5%',
    description: {
      zh: '为逝去的亲人、朋友或宠物撰写纪念传记，AI 模拟逝者口吻写一封信。',
      en: 'Tribute biographies for loved ones. AI-generated letters from the departed.',
      es: 'Biografías para seres queridos. Cartas generadas por IA.',
      pt: 'Biografias para entes queridos.',
      ja: '大切な人への追悼。AI による手紙。',
      hi: 'प्रियजनों के लिए जीवनी।',
      ar: 'سير للأحباء.',
    },
    status: 'online',
  },
  {
    id: 'caregiver' as const,
    star: 'Lyra',
    starSymbol: '★',
    starMeaning: { zh: '天琴座 · 疗愈之歌', en: 'Lyra · The Healing Song', es: 'Lira · La Canción Sanadora', pt: 'Lira · A Canção Curativa', ja: 'リラ · 癒しの歌', hi: 'वीणा · चिकित्सा गीत', ar: 'القيثارة · أغنية الشفاء' },
    name: { zh: 'AI 照护者支持', en: 'AI Caregiver', es: 'Cuidador IA', pt: 'Cuidador IA', ja: '介護者支援', hi: 'देखभालकर्ता', ar: 'مقدم رعاية' },
    tagline: { zh: '为家庭照护者提供 24/7 后盾', en: '24/7 Family Caregiver Support', es: 'Soporte 24/7', pt: 'Suporte 24/7', ja: '24時間支援', hi: '24/7 सहायता', ar: 'دعم 24/7' },
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-400/20 to-rose-600/20',
    border: 'border-pink-400/40',
    badge: 'rigidDemand',
    market: 'CAGR 16% · $1.71B → $7.5B',
    description: {
      zh: '面向家庭照护者的 AI 助手：症状解读、情绪支持、用药提醒、照护日志。',
      en: 'AI assistant for family caregivers: symptoms, mood, medication, logs.',
      es: 'Asistente IA para cuidadores: síntomas, humor, medicación.',
      pt: 'Assistente IA para cuidadores.',
      ja: '介護者向け AI アシスタント。',
      hi: 'देखभालकर्ताओं के लिए AI सहायक।',
      ar: 'مساعد AI لمقدمي الرعاية.',
    },
    status: 'online',
  },
  {
    id: 'genealogy' as const,
    star: 'Cassiopeia',
    starSymbol: '✦',
    starMeaning: { zh: '仙后座 · 家族血脉', en: 'Cassiopeia · The Bloodline Queen', es: 'Casiopea · La Reina del Linaje', pt: 'Cassiopeia · A Rainha da Linhagem', ja: 'カシオペア · 血脈の女王', hi: 'कैसिओपिया · वंश की रानी', ar: 'ذات الكرسي · ملكة النسب' },
    name: { zh: 'AI 家谱研究', en: 'AI Genealogy', es: 'Genealogía IA', pt: 'Genealogia IA', ja: '家系図', hi: 'वंशावली', ar: 'نسب' },
    tagline: { zh: '老照片修复 · 文档 OCR · 家族叙事', en: 'Photo Restore · OCR · Stories', es: 'Fotos · OCR · Historias', pt: 'Fotos · OCR · Histórias', ja: '写真・OCR・物語', hi: 'फोटो · OCR · कहानी', ar: 'صور · OCR · قصص' },
    icon: <Users className="w-6 h-6" />,
    color: 'from-yellow-400/20 to-amber-700/20',
    border: 'border-yellow-400/40',
    badge: 'longTail',
    market: 'r/Genealogy 50 万订阅 · 长尾高付费',
    description: {
      zh: 'AI 增强家谱研究：老照片修复、历史文档 OCR、家族故事 AI 撰写。',
      en: 'AI genealogy: photo restoration, OCR, family narratives.',
      es: 'Genealogía IA: restauración, OCR, narrativas.',
      pt: 'Genealogia IA: restauração, OCR, narrativas.',
      ja: 'AI で家系図：写真修復、OCR、物語。',
      hi: 'AI वंशावली: फोटो, OCR, कहानी।',
      ar: 'AI نسب: صور، OCR، قصص.',
    },
    status: 'online',
  },
  {
    id: 'microsaas' as const,
    star: 'Orion',
    starSymbol: '✧',
    starMeaning: { zh: '猎户座 · 机会猎手', en: 'Orion · The Opportunity Hunter', es: 'Orión · El Cazador de Oportunidades', pt: 'Orion · O Caçador de Oportunidades', ja: 'オリオン · 機会の狩人', hi: 'ओरियन · अवसर का शिकारी', ar: 'الجبار · صياد الفرص' },
    name: { zh: '垂直 AI 微 SaaS', en: 'AI Micro SaaS', es: 'Micro SaaS IA', pt: 'Micro SaaS IA', ja: 'マイクロ SaaS', hi: 'माइक्रो SaaS', ar: 'مايكرو SaaS' },
    tagline: { zh: 'Chrome 扩展 · Notion 插件 · Slack Bot', en: 'Chrome · Notion · Slack · Zapier', es: 'Chrome · Notion · Slack', pt: 'Chrome · Notion · Slack', ja: 'Chrome・Notion・Slack', hi: 'Chrome · Notion · Slack', ar: 'Chrome · Notion · Slack' },
    icon: <Zap className="w-6 h-6" />,
    color: 'from-cyan-400/20 to-blue-700/20',
    border: 'border-cyan-400/40',
    badge: 'fastValidate',
    market: '70% MRR<$1K · 中位 $4.2K',
    description: {
      zh: '基于已验证模式快速孵化微 SaaS：Chrome 扩展、Notion 插件、Slack Bot。',
      en: 'Rapid Micro SaaS incubation: Chrome, Notion, Slack, Zapier.',
      es: 'Incubación rápida: Chrome, Notion, Slack, Zapier.',
      pt: 'Incubação rápida: Chrome, Notion, Slack.',
      ja: 'マイクロ SaaS の迅速孵化。',
      hi: 'माइक्रो SaaS इनक्यूबेशन।',
      ar: 'حضانة مايكرو SaaS.',
    },
    status: 'online',
  },
  {
    id: 'agent' as const,
    star: 'Shooting Star',
    starSymbol: '🌠',
    starMeaning: { zh: '流星 · 划过天际的运营者', en: 'Shooting Star · The Operator Across the Sky', es: 'Estrella Fugaz · Operador a Través del Cielo', pt: 'Estrela Cadente · Operador Através do Céu', ja: '流れ星 · 空を駆ける運営者', hi: 'उल्का · आकाश का संचालक', ar: 'الشهاب · المشغل عبر السماء' },
    name: { zh: 'AI Agent 自动化运营', en: 'AI Agent Operations', es: 'Agent IA Operaciones', pt: 'Agent IA', ja: 'AI Agent 運営', hi: 'AI एजेंट संचालन', ar: 'وكيل AI' },
    tagline: { zh: 'SEO 内容 · 社交批量 · Newsletter · 用户跟进', en: 'SEO · Social · Newsletter · Followup', es: 'SEO · Social · Newsletter', pt: 'SEO · Social · Newsletter', ja: 'SEO・SNS・メール', hi: 'SEO · सोशल · ईमेल', ar: 'SEO · اجتماعي · بريد' },
    icon: <Bot className="w-6 h-6" />,
    color: 'from-emerald-400/20 to-cyan-700/20',
    border: 'border-emerald-400/40',
    badge: 'top1',
    market: '一键生成 30 天运营内容',
    description: {
      zh: 'AI 自动化运营中心：SEO 博客生成、社交媒体批量内容、个性化 Newsletter、用户流失预警与跟进。',
      en: 'AI operations center: SEO blog, social content, personalized newsletter, churn prediction.',
      es: 'Centro de operaciones IA: SEO, social, newsletter, predicción de abandono.',
      pt: 'Centro de operações IA: SEO, social, newsletter.',
      ja: 'AI 運営センター：SEO、SNS、メール、離脱予測。',
      hi: 'AI संचालन केंद्र: SEO, सोशल, ईमेल, चर्न पूर्वानुमान।',
      ar: 'مركز عمليات AI: SEO، اجتماعي، بريد، توقع المغادرة.',
    },
    status: 'online',
  },
  {
    id: 'tiktok' as const,
    star: 'Comet',
    starSymbol: '☄',
    starMeaning: { zh: '彗星 · 病毒式传播者', en: 'Comet · The Viral Messenger', es: 'Cometa · El Mensajero Viral', pt: 'Cometa · O Mensageiro Viral', ja: '彗星 · ヴァイラルの伝達者', hi: 'धूमकेतु · वायरल संदेशवाहक', ar: 'المذنب · الرسول الفيروسي' },
    name: { zh: 'TikTok 内容生成器', en: 'TikTok Content Generator', es: 'Generador TikTok', pt: 'Gerador TikTok', ja: 'TikTok 生成器', hi: 'TikTok जनरेटर', ar: 'مولد TikTok' },
    tagline: { zh: '脚本 · 字幕 · BGM · Hashtag · 发布时间', en: 'Scripts · Captions · BGM · Hashtag · Timing', es: 'Guiones · BGM · Hashtag', pt: 'Roteiros · BGM · Hashtag', ja: '脚本・BGM・ハッシュタグ', hi: 'स्क्रिप्ट · BGM · हैशटैग', ar: 'سيناريو · BGM · هاشتاج' },
    icon: <Video className="w-6 h-6" />,
    color: 'from-rose-400/20 to-purple-700/20',
    border: 'border-rose-400/40',
    badge: 'highFreq',
    market: '#tarot 50 亿+ · #astrology 200 亿+ 播放',
    description: {
      zh: '批量生成 TikTok 爆款短视频脚本：前 3 秒钩子、分镜描述、BGM 推荐、Hashtag 优化、发布时间预测。',
      en: 'Batch TikTok viral scripts: 3s hooks, storyboard, BGM, hashtag, timing.',
      es: 'Guiones virales TikTok: ganchos, storyboard, BGM, hashtag.',
      pt: 'Roteiros virais TikTok: ganchos, storyboard, BGM, hashtag.',
      ja: 'TikTok バズスクリプト：3秒フック、絵コンテ、BGM、ハッシュタグ。',
      hi: 'TikTok वायरल स्क्रिप्ट: 3s हुक, स्टोरीबोर्ड, BGM, हैशटैग।',
      ar: 'سيناريوهات TikTok: خطافات 3s، لوحة قصص، BGM، هاشتاج.',
    },
    status: 'online',
  },
];

export function HomePage({ onNavigate }: { onNavigate: (t: Track) => void }) {
  const { t, locale } = useLocale();

  return (
    <div className="space-y-8">
      {/* Hero with star constellation */}
      <section className="text-center py-8 sm:py-12 relative">
        {/* Decorative star constellation background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
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
            {locale === 'zh' ? '八颗星，一片天空' :
             locale === 'es' ? 'Ocho estrellas, un cielo' :
             locale === 'pt' ? 'Oito estrelas, um céu' :
             locale === 'ja' ? '八つの星、一つの空' :
             locale === 'hi' ? 'आठ सितारे, एक आसमान' :
             locale === 'ar' ? 'ثمانية نجوم، سماء واحدة' :
             'Eight stars, one sky'}
          </p>
          <p className="text-purple-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t('app.cta')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
              <Trophy className="w-3 h-3 text-gold" /> {TRACKS.filter(t => t.status === 'online').length} {locale === 'zh' ? '颗星已点亮' : 'stars lit'}
            </div>
            <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
              <TrendingUp className="w-3 h-3 text-gold" /> 综合 CAGR 19.8%+
            </div>
            <div className="flex items-center gap-1.5 text-purple-200/70 text-xs">
              <Zap className="w-3 h-3 text-gold" /> AI 原生 · 免费
            </div>
          </div>
        </div>
      </section>

      {/* The Constellation Story */}
      <section className="glass-card-dark border-gold/30 rounded-xl p-5 sm:p-6 text-center">
        <p className="text-purple-100/80 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
          {locale === 'zh' ?
            '在古代，迷失的水手仰望天空，找到八颗永远指引他们归途的星。Lumina 把这八颗星带到人间——每一颗，都是你生命不同旅程的引路人。' :
            'In ancient times, sailors lost at sea looked up and found eight stars that always pointed them home. Lumina brings those stars down to earth — each one a guide for a different journey of your life.'}
        </p>
        <p className="text-amber-200/70 text-xs mt-3 italic">
          ✦ Vega · ★ Andromeda · ✧ Polaris · ✦ Sirius · ✧ Pleiades · ★ Lyra · ✦ Cassiopeia · ✧ Orion ✦
        </p>
      </section>

      {/* 8 Star Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRACKS.map((track) => (
          <Card
            key={track.id}
            className={`glass-card-dark ${track.border} hover:border-gold/60 transition-all hover:scale-[1.01] cursor-pointer group relative overflow-hidden`}
            onClick={() => track.status === 'online' && onNavigate(track.id)}
          >
            {/* Star symbol watermark */}
            <div className="absolute top-2 right-3 text-5xl opacity-15 group-hover:opacity-30 transition-opacity">
              {track.starSymbol}
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} border ${track.border} flex items-center justify-center text-gold`}>
                  {track.icon}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] px-2 py-0.5 ${
                    track.badge === 'top1' ? 'bg-amber-500 text-black' :
                    track.badge === 'highTicket' ? 'bg-rose-500 text-white' :
                    track.badge === 'light' ? 'bg-emerald-600 text-white' :
                    track.badge === 'highFreq' ? 'bg-sky-600 text-white' :
                    track.badge === 'blueOcean' ? 'bg-purple-600 text-white' :
                    track.badge === 'rigidDemand' ? 'bg-pink-600 text-white' :
                    track.badge === 'longTail' ? 'bg-yellow-700 text-white' :
                    'bg-cyan-600 text-white'
                  }`}>
                    {t(`badge.${track.badge}`)}
                  </Badge>
                  {track.status === 'online' ? (
                    <Badge variant="outline" className="border-emerald-400/50 text-emerald-300 text-[10px] px-2 py-0.5">
                      ● {t('badge.online')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-purple-400/40 text-purple-300/70 text-[10px] px-2 py-0.5">
                      {t('badge.roadmap')}
                    </Badge>
                  )}
                </div>
              </div>
              {/* Star name + meaning */}
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-300 text-lg">{track.starSymbol}</span>
                  <span className="text-amber-200/90 text-xs font-semibold tracking-wider" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {track.star}
                  </span>
                </div>
                <p className="text-purple-300/60 text-[10px] italic mb-2">{track.starMeaning[locale]}</p>
                <CardTitle className="text-lg text-gold flex items-center gap-2">
                  {track.name[locale]}
                  {track.status === 'online' && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </CardTitle>
                <CardDescription className="text-purple-200/70 text-xs">{track.tagline[locale]}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-purple-100/80 text-xs leading-relaxed mb-3">{track.description[locale]}</p>
              <div className="flex items-center justify-between text-[10px] text-purple-200/60 mb-3">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {track.market}
                </span>
              </div>
              {track.status === 'online' ? (
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 text-xs"
                >
                  {t('cta.start')} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="w-full text-xs border-purple-400/30 text-purple-300/50">
                  {t('cta.comingSoon')}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
