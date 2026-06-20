'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from '@/lib/session';
import { useLocale } from '@/components/locale-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Heart, Activity, Pill, Moon, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useMysticCall } from '@/components/tracks/shared';

const TRACK_TEXT = {
  memorial: {
    title: { zh: 'AI 数字纪念', en: 'AI Digital Memorial', es: 'Memorial Digital IA', pt: 'Memorial Digital IA', ja: 'AI メモリアル', hi: 'AI स्मारक', ar: 'تذكاري رقمي' },
    subtitle: { zh: '为逝者撰写传记 · 收到一封来自TA的信', en: 'Tribute biography · A letter from them', es: 'Biografía tributo · Carta suya', pt: 'Biografia · Carta', ja: '追悼伝記・TAからの手紙', hi: 'जीवनी · TA का पत्र', ar: 'سيرة · رسالة منهم' },
    fields: {
      personName: { zh: '纪念对象姓名', en: 'Person name', es: 'Nombre', pt: 'Nome', ja: '名前', hi: 'नाम', ar: 'الاسم' },
      relationship: { zh: '与你的关系', en: 'Relationship', es: 'Relación', pt: 'Relação', ja: '関係', hi: 'संबंध', ar: 'العلاقة' },
      personality: { zh: 'TA的性格特点', en: 'Personality', es: 'Personalidad', pt: 'Personalidade', ja: '性格', hi: 'व्यक्तित्व', ar: 'الشخصية' },
      memories: { zh: '美好回忆', en: 'Memories', es: 'Recuerdos', pt: 'Memórias', ja: '思い出', hi: 'स्मृतियाँ', ar: 'ذكريات' },
      userFeeling: { zh: '你想对TA说的话', en: 'What you want to say', es: 'Lo que quieres decir', pt: 'O que quer dizer', ja: '伝えたい言葉', hi: 'आप क्या कहना चाहते हैं', ar: 'ما تريد قوله' },
    },
    cta: { zh: '撰写纪念', en: 'Write Memorial', es: 'Escribir', pt: 'Escrever', ja: '執筆', hi: 'लिखें', ar: 'اكتب' },
  },
  caregiver: {
    title: { zh: 'AI 照护者支持', en: 'AI Caregiver Support', es: 'Soporte IA Cuidador', pt: 'Suporte IA Cuidador', ja: 'AI 介護者支援', hi: 'AI देखभालकर्ता', ar: 'دعم مقدم الرعاية' },
    subtitle: { zh: '24/7 专业支持 · 共情 · 行动建议', en: '24/7 Empathic AI Support', es: 'Soporte empático 24/7', pt: 'Suporte empático 24/7', ja: '24時間サポート', hi: '24/7 सहायता', ar: 'دعم 24/7' },
    fields: {
      careRecipient: { zh: '照护对象', en: 'Care recipient', es: 'Persona cuidada', pt: 'Pessoa cuidada', ja: '介護対象', hi: 'देखभाल पात्र', ar: 'مستلم الرعاية' },
      careType: { zh: '状况类型', en: 'Situation type', es: 'Tipo de situación', pt: 'Tipo de situação', ja: '状況タイプ', hi: 'स्थिति प्रकार', ar: 'نوع الحالة' },
      description: { zh: '描述当前状况', en: 'Describe situation', es: 'Describe la situación', pt: 'Descreva a situação', ja: '状況を描述', hi: 'स्थिति का वर्णन', ar: 'وصف الحالة' },
      mood: { zh: '你的情绪', en: 'Your mood', es: 'Tu humor', pt: 'Seu humor', ja: '気分', hi: 'आपका मूड', ar: 'مزاجك' },
      triedAlready: { zh: '已尝试的措施', en: 'Already tried', es: 'Ya intentado', pt: 'Já tentado', ja: '試したこと', hi: 'पहले प्रयास', ar: 'ما جربته' },
    },
    cta: { zh: '获取支持', en: 'Get Support', es: 'Obtener Apoyo', pt: 'Obter Apoio', ja: 'サポート受信', hi: 'सहायता प्राप्त', ar: 'احصل على دعم' },
  },
  genealogy: {
    title: { zh: 'AI 家谱故事', en: 'AI Family Genealogy', es: 'Genealogía IA', pt: 'Genealogia IA', ja: 'AI 家系図', hi: 'AI वंशावली', ar: 'AI نسب' },
    subtitle: { zh: '将家族成员、起源、传统编织成动人叙事', en: 'Weave members, origins, traditions into narrative', es: 'Tejer miembros, orígenes en narrativa', pt: 'Tecer membros, origens', ja: '家族の物語を紡ぐ', hi: 'परिवार की कहानी', ar: 'حكاية العائلة' },
    fields: {
      familyName: { zh: '家族姓氏', en: 'Family name', es: 'Apellido', pt: 'Sobrenome', ja: '家姓', hi: 'परिवार नाम', ar: 'اسم العائلة' },
      members: { zh: '已知家族成员', en: 'Known members', es: 'Miembros conocidos', pt: 'Membros conhecidos', ja: '既知の成員', hi: 'ज्ञात सदस्य', ar: 'أعضاء معروفون' },
      origins: { zh: '家族起源', en: 'Origins', es: 'Orígenes', pt: 'Origens', ja: '起源', hi: 'उत्पत्ति', ar: 'الأصول' },
      traditions: { zh: '家族传统', en: 'Traditions', es: 'Tradiciones', pt: 'Tradições', ja: '伝統', hi: 'परंपराएं', ar: 'تقاليد' },
    },
    cta: { zh: '撰写家族故事', en: 'Write Family Story', es: 'Escribir Historia', pt: 'Escrever História', ja: '物語を執筆', hi: 'कहानी लिखें', ar: 'اكتب القصة' },
  },
  microsaas: {
    title: { zh: 'AI 微 SaaS 创意生成', en: 'AI Micro SaaS Idea Generator', es: 'Generador Micro SaaS IA', pt: 'Gerador Micro SaaS IA', ja: 'AI マイクロ SaaS アイデア', hi: 'AI माइक्रो SaaS', ar: 'مولد أفكار مايكرو SaaS' },
    subtitle: { zh: '从 0 到 $10K MRR 的可执行创意', en: 'From 0 to $10K MRR actionable ideas', es: 'De 0 a $10K MRR', pt: 'De 0 a $10K MRR', ja: '0 から $10K MRR へ', hi: '0 से $10K MRR', ar: 'من 0 إلى $10K MRR' },
    fields: {
      field: { zh: '兴趣领域', en: 'Interest field', es: 'Campo de interés', pt: 'Campo de interesse', ja: '興味分野', hi: 'रुचि क्षेत्र', ar: 'مجال الاهتمام' },
      techStack: { zh: '技术能力', en: 'Tech stack', es: 'Stack técnico', pt: 'Stack técnico', ja: '技術スタック', hi: 'तकनीक', ar: 'التقنية' },
      targetMrr: { zh: '目标 MRR', en: 'Target MRR', es: 'MRR objetivo', pt: 'MRR alvo', ja: '目標 MRR', hi: 'लक्ष्य MRR', ar: 'الهدف MRR' },
      category: { zh: '偏好类型', en: 'Preferred type', es: 'Tipo preferido', pt: 'Tipo preferido', ja: '希望タイプ', hi: 'पसंदीदा प्रकार', ar: 'النوع المفضل' },
      notes: { zh: '其他要求', en: 'Other notes', es: 'Otras notas', pt: 'Outras notas', ja: 'その他', hi: 'अन्य', ar: 'أخرى' },
    },
    cta: { zh: '生成创意', en: 'Generate Idea', es: 'Generar Idea', pt: 'Gerar Ideia', ja: 'アイデア生成', hi: 'आइडिया बनाएं', ar: 'ولد فكرة' },
  },
} as const;

export function MemorialTrack() {
  const { call, loading, result } = useMysticCall('memorial');
  const { locale } = useLocale();
  const txt = TRACK_TEXT.memorial;
  const [form, setForm] = useState({
    personName: '', relationship: '', birthYear: '', deathYear: '',
    personality: '', memories: '', userFeeling: '',
  });
  return (
    <div className="space-y-4">
      <TrackHeader icon={<Heart className="w-5 h-5" />} title={txt.title[locale]} subtitle={txt.subtitle[locale]} color="purple" />
      <Card className="glass-card-dark border-purple-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.personName[locale]}</Label>
              <Input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.relationship[locale]}</Label>
              <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                <SelectTrigger className="bg-white/5 border-purple-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grandparent">祖父母</SelectItem>
                  <SelectItem value="parent">父母</SelectItem>
                  <SelectItem value="spouse">配偶</SelectItem>
                  <SelectItem value="sibling">兄弟姐妹</SelectItem>
                  <SelectItem value="friend">朋友</SelectItem>
                  <SelectItem value="pet">宠物</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.personality[locale]}</Label>
            <Textarea value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} className="bg-white/5 border-purple-400/30 text-white min-h-[80px]" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.memories[locale]}</Label>
            <Textarea value={form.memories} onChange={(e) => setForm({ ...form, memories: e.target.value })} className="bg-white/5 border-purple-400/30 text-white min-h-[100px]" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.userFeeling[locale]}</Label>
            <Input value={form.userFeeling} onChange={(e) => setForm({ ...form, userFeeling: e.target.value })} className="bg-white/5 border-purple-400/30 text-white" />
          </div>
          <Button onClick={() => call(form)} disabled={loading || !form.personName} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}
            {txt.cta[locale]}
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

export function CaregiverTrack() {
  const { call, loading, result } = useMysticCall('caregiver');
  const { locale } = useLocale();
  const txt = TRACK_TEXT.caregiver;
  const [form, setForm] = useState({
    careRecipient: '长辈', careType: 'symptom', description: '', mood: 'stressed', triedAlready: '',
  });
  return (
    <div className="space-y-4">
      <TrackHeader icon={<Heart className="w-5 h-5" />} title={txt.title[locale]} subtitle={txt.subtitle[locale]} color="pink" />
      <Card className="glass-card-dark border-pink-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.careRecipient[locale]}</Label>
              <Select value={form.careRecipient} onValueChange={(v) => setForm({ ...form, careRecipient: v })}>
                <SelectTrigger className="bg-white/5 border-pink-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="长辈">长辈 / Elder</SelectItem>
                  <SelectItem value="配偶">配偶 / Spouse</SelectItem>
                  <SelectItem value="孩子">孩子 / Child</SelectItem>
                  <SelectItem value="朋友">朋友 / Friend</SelectItem>
                  <SelectItem value="其他">其他 / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.careType[locale]}</Label>
              <Select value={form.careType} onValueChange={(v) => setForm({ ...form, careType: v })}>
                <SelectTrigger className="bg-white/5 border-pink-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="symptom">症状咨询 / Symptom</SelectItem>
                  <SelectItem value="medication">用药疑问 / Medication</SelectItem>
                  <SelectItem value="mood">情绪支持 / Mood</SelectItem>
                  <SelectItem value="incident">事件记录 / Incident</SelectItem>
                  <SelectItem value="general">综合咨询 / General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.description[locale]}</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="如：母亲今早血压偏高，伴有头晕..." className="bg-white/5 border-pink-400/30 text-white min-h-[120px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.mood[locale]}</Label>
              <Select value={form.mood} onValueChange={(v) => setForm({ ...form, mood: v })}>
                <SelectTrigger className="bg-white/5 border-pink-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">平和 / Calm</SelectItem>
                  <SelectItem value="ok">尚可 / Okay</SelectItem>
                  <SelectItem value="stressed">压力 / Stressed</SelectItem>
                  <SelectItem value="exhausted">疲惫 / Exhausted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.triedAlready[locale]}</Label>
              <Input value={form.triedAlready} onChange={(e) => setForm({ ...form, triedAlready: e.target.value })} className="bg-white/5 border-pink-400/30 text-white" />
            </div>
          </div>
          <Button onClick={() => call(form)} disabled={loading || !form.description} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}
            {txt.cta[locale]}
          </Button>
          <p className="text-pink-200/60 text-[10px] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            本工具提供的信息仅供参考，不构成医疗诊断。紧急情况请立即就医。
          </p>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

export function GenealogyTrack() {
  const { call, loading, result } = useMysticCall('genealogy');
  const { locale } = useLocale();
  const txt = TRACK_TEXT.genealogy;
  const [form, setForm] = useState({
    familyName: '', members: '', origins: '', traditions: '', focus: '',
  });
  return (
    <div className="space-y-4">
      <TrackHeader icon={<Activity className="w-5 h-5" />} title={txt.title[locale]} subtitle={txt.subtitle[locale]} color="yellow" />
      <Card className="glass-card-dark border-yellow-400/30">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.familyName[locale]}</Label>
            <Input value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })} className="bg-white/5 border-yellow-400/30 text-white" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.members[locale]}</Label>
            <Textarea value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} placeholder="如：祖父王大山（铁匠）、祖母李秀英..." className="bg-white/5 border-yellow-400/30 text-white min-h-[100px]" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.origins[locale]}</Label>
            <Textarea value={form.origins} onChange={(e) => setForm({ ...form, origins: e.target.value })} className="bg-white/5 border-yellow-400/30 text-white min-h-[80px]" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.traditions[locale]}</Label>
            <Textarea value={form.traditions} onChange={(e) => setForm({ ...form, traditions: e.target.value })} className="bg-white/5 border-yellow-400/30 text-white min-h-[80px]" />
          </div>
          <Button onClick={() => call(form)} disabled={loading || !form.familyName} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {txt.cta[locale]}
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

export function MicrosaasTrack() {
  const { call, loading, result } = useMysticCall('microsaas');
  const { locale } = useLocale();
  const txt = TRACK_TEXT.microsaas;
  const [form, setForm] = useState({
    field: '', techStack: 'Next.js + API', targetMrr: '$1K-10K', category: 'chrome-ext', notes: '',
  });
  return (
    <div className="space-y-4">
      <TrackHeader icon={<Zap className="w-5 h-5" />} title={txt.title[locale]} subtitle={txt.subtitle[locale]} color="cyan" />
      <Card className="glass-card-dark border-cyan-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.field[locale]}</Label>
              <Input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} placeholder="如：开发者工具 / 营销 / 教育" className="bg-white/5 border-cyan-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.techStack[locale]}</Label>
              <Input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} className="bg-white/5 border-cyan-400/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.targetMrr[locale]}</Label>
              <Select value={form.targetMrr} onValueChange={(v) => setForm({ ...form, targetMrr: v })}>
                <SelectTrigger className="bg-white/5 border-cyan-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="$100-1K">$100-1K / 月</SelectItem>
                  <SelectItem value="$1K-10K">$1K-10K / 月</SelectItem>
                  <SelectItem value="$10K-100K">$10K-100K / 月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.category[locale]}</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-white/5 border-cyan-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome-ext">Chrome 扩展</SelectItem>
                  <SelectItem value="notion-plugin">Notion 插件</SelectItem>
                  <SelectItem value="slack-bot">Slack Bot</SelectItem>
                  <SelectItem value="zapier">Zapier 集成</SelectItem>
                  <SelectItem value="shopify-app">Shopify 应用</SelectItem>
                  <SelectItem value="stripe-tool">Stripe 工具</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">{txt.fields.notes[locale]}</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-white/5 border-cyan-400/30 text-white min-h-[80px]" />
          </div>
          <Button onClick={() => call(form)} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            {txt.cta[locale]}
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// 通用头部
function TrackHeader({ icon, title, subtitle, color }: { icon: React.ReactNode; title: string; subtitle: string; color: string }) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500/30 to-indigo-700/30 border-purple-400/40',
    pink: 'from-pink-500/30 to-rose-700/30 border-pink-400/40',
    yellow: 'from-yellow-500/30 to-amber-700/30 border-yellow-400/40',
    cyan: 'from-cyan-500/30 to-blue-700/30 border-cyan-400/40',
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color] || colorMap.purple} border flex items-center justify-center text-gold shrink-0`}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gold">{title}</h2>
        <p className="text-purple-200/70 text-xs sm:text-sm mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// 通用 AI 结果
function AIResult({ result, loading }: { result: string; loading: boolean }) {
  if (loading) {
    return (
      <Card className="glass-card-dark border-gold/30 mt-4">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <Sparkles className="w-10 h-10 text-gold animate-float" />
          <p className="text-purple-200/80 text-sm tracking-widest">AI 正在生成内容...</p>
        </CardContent>
      </Card>
    );
  }
  if (!result) return null;
  return (
    <Card className="glass-card-dark border-gold/30 mt-4 animate-glow-pulse">
      <CardContent className="pt-6">
        <div className="text-purple-50/90 leading-relaxed space-y-3 text-sm sm:text-base">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold text-gold mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold text-amber-200 mt-4 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-amber-100 mt-3 mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-purple-50/85 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-purple-50/85">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-purple-50/85">{children}</ol>,
              strong: ({ children }) => <strong className="text-amber-200 font-semibold">{children}</strong>,
              code: ({ children }) => <code className="bg-black/40 text-emerald-300 px-1.5 py-0.5 rounded text-xs">{children}</code>,
              pre: ({ children }) => <pre className="bg-black/40 border border-gold/20 p-3 rounded-lg overflow-x-auto text-xs text-emerald-300 my-2">{children}</pre>,
            }}
          >
            {result}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
