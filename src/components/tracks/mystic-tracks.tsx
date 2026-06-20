'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Moon, Star, Sun, Gem, Hash, Loader2, Calendar,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

function useMysticCall() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);

  const call = async (module: string, input: any) => {
    setLoading(true);
    setResult('');
    setMetadata(null);
    try {
      const res = await fetch('/api/mystic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, input, userId: user?.userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setResult(data.result);
      setMetadata(data.metadata);
      toast({ title: '✨ 生成完成' });
    } catch (e: any) {
      toast({ title: '调用失败', description: e?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, metadata, call, setResult };
}

function AIResult({ result, loading }: { result: string; loading: boolean }) {
  if (loading) {
    return (
      <Card className="glass-card-dark border-gold/30 mt-4">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <Moon className="w-12 h-12 text-gold animate-float" />
          <p className="text-purple-200/80 text-sm tracking-widest">AI is generating...</p>
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
              blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/50 pl-4 italic text-purple-200/70 my-2">{children}</blockquote>,
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

function TrackHeader({ icon, starSymbol, starName, starMeaning, title, subtitle, color }: {
  icon: React.ReactNode; starSymbol: string; starName: string; starMeaning: string;
  title: string; subtitle: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    amber: 'from-amber-500/30 to-purple-700/30 border-amber-400/40',
    purple: 'from-purple-500/30 to-indigo-700/30 border-purple-400/40',
    rose: 'from-rose-500/30 to-orange-500/30 border-rose-400/40',
    blue: 'from-blue-500/30 to-cyan-700/30 border-blue-400/40',
    pink: 'from-pink-500/30 to-rose-700/30 border-pink-400/40',
    yellow: 'from-yellow-500/30 to-amber-700/30 border-yellow-400/40',
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color] || colorMap.amber} border flex items-center justify-center text-gold shrink-0 relative`}>
        {icon}
        <span className="absolute -top-1 -right-1 text-sm">{starSymbol}</span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-amber-300 text-xs font-semibold tracking-wider" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            {starSymbol} {starName}
          </span>
        </div>
        <p className="text-purple-300/50 text-[10px] italic">{starMeaning}</p>
        <h2 className="text-lg sm:text-xl font-semibold text-gold mt-1">{title}</h2>
        <p className="text-purple-200/70 text-xs sm:text-sm mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Profile Section (shared by mystic products) ───
function ProfileSection() {
  const { user, updateProfile } = useSession();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    birthDate: user?.birthDate || '',
    birthTime: user?.birthTime || '',
    birthPlace: user?.birthPlace || '',
    gender: user?.gender || '',
  });
  const save = async () => {
    if (!user) return;
    updateProfile(form);
    setEditing(false);
    toast({ title: 'Profile saved' });
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, profile: form }),
    }).catch(() => {});
  };
  if (!user) return null;
  return (
    <Card className="glass-card-dark mb-6 border-gold/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {(user.name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-base text-gold flex items-center gap-2 font-semibold">
                {user.name || 'Anonymous Traveler'}
              </p>
              <p className="text-purple-200/70 text-xs mt-0.5">
                {user.birthDate ? `Born ${user.birthDate} ${user.birthTime || ''}` : 'No birth info (affects astrology/numerology accuracy)'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10 text-xs" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </CardHeader>
      {editing && (
        <CardContent className="space-y-3 pt-2 border-t border-gold/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-200/80 text-xs">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">Birth Date</Label>
              <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">Birth Time</Label>
              <Input type="time" value={form.birthTime} onChange={(e) => setForm({ ...form, birthTime: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
            <div>
              <Label className="text-purple-200/80 text-xs">Birth Place</Label>
              <Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} className="bg-white/5 border-gold/30 text-white" />
            </div>
          </div>
          <Button onClick={save} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">
            <Sparkles className="w-4 h-4 mr-2" /> Save Profile
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// ─── ✦ Vega · Astrology ───
export function AstrologyTrack() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  return (
    <div className="space-y-4">
      <ProfileSection />
      <TrackHeader
        icon={<Star className="w-5 h-5" />} starSymbol="✦" starName="Vega" starMeaning="The Weaver of Fate"
        title="AI Astrology Reading" subtitle="Birth chart · Sun/Moon/Rising · Deep AI interpretation"
        color="amber"
      />
      <Card className="glass-card-dark border-amber-400/30">
        <CardContent className="pt-6 space-y-4">
          {user?.birthDate ? (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-purple-100">{user.birthDate} {user.birthTime || ''} {user.birthPlace || ''}</span>
              {metadata?.sunSign && <Badge variant="outline" className="border-gold/40 text-gold">{metadata.sunSign}</Badge>}
            </div>
          ) : <p className="text-purple-200/70 text-sm">Please set your birth date in profile above</p>}
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What do you want to know? (optional)" className="bg-white/5 border-amber-400/30 text-white min-h-[80px]" />
          <Button
            onClick={() => call('astrology', { birthDate: user?.birthDate || '1995-01-01', birthTime: user?.birthTime || '', birthPlace: user?.birthPlace || '', gender: user?.gender || '', question })}
            disabled={loading || !user?.birthDate}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />} Read My Chart
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─── ✦ Sirius · Tarot ───
export function TarotTrack() {
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  const [cardCount, setCardCount] = useState(3);
  return (
    <div className="space-y-4">
      <TrackHeader
        icon={<Gem className="w-5 h-5" />} starSymbol="✦" starName="Sirius" starMeaning="The Illuminator"
        title="AI Tarot Reading" subtitle="Draw cards · AI deep interpretation · Multi-framework insights"
        color="purple"
      />
      <Card className="glass-card-dark border-purple-400/30">
        <CardContent className="pt-6 space-y-4">
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Your question for the cards" className="bg-white/5 border-purple-400/30 text-white min-h-[80px]" />
          <Select value={String(cardCount)} onValueChange={(v) => setCardCount(Number(v))}>
            <SelectTrigger className="bg-white/5 border-purple-400/30 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 cards (Past · Present · Future)</SelectItem>
              <SelectItem value="5">5 cards (Extended)</SelectItem>
              <SelectItem value="7">7 cards (Deep Spread)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => call('tarot', { question, cardCount })} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gem className="w-4 h-4 mr-2" />} Draw Cards
          </Button>
        </CardContent>
      </Card>
      {metadata?.cards && (
        <Card className="glass-card-dark border-purple-400/30">
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metadata.cards.map((c: any, i: number) => (
                <div key={i} className="bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border border-gold/30 rounded-lg p-3 animate-card-flip" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-gold border-gold/40 text-xs">{c.position}</Badge>
                    {c.reversed && <Badge variant="outline" className="text-red-300 border-red-300/40 text-xs">Reversed</Badge>}
                  </div>
                  <div className="text-2xl text-center my-2 text-gold font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>{c.card.symbol}</div>
                  <p className="text-amber-100 font-medium text-sm text-center">{c.card.name}</p>
                  <p className="text-purple-200/60 text-xs text-center mt-1">{c.card.keywords}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─── 🌙 Selene · Dream Interpretation (INDEPENDENT BRAND) ───
export function DreamTrack() {
  const { loading, result, call } = useMysticCall();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [framework, setFramework] = useState('jungian');
  return (
    <div className="space-y-4">
      <TrackHeader
        icon={<Moon className="w-5 h-5" />} starSymbol="🌙" starName="Selene" starMeaning="Goddess of the Moon · Keeper of Dreams"
        title="AI Dream Interpretation" subtitle="Record dreams · Multi-framework AI analysis · Long-term subconscious tracking"
        color="blue"
      />
      <Card className="glass-card-dark border-blue-400/30">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">Dream Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Flying over the ocean" className="bg-white/5 border-blue-400/30 text-white" />
          </div>
          <div>
            <Label className="text-purple-200/80 text-xs mb-2 block">Dream Content (describe in detail)</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe your dream: people, places, events, feelings..." className="bg-white/5 border-blue-400/30 text-white min-h-[120px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-white/5 border-blue-400/30 text-white"><SelectValue placeholder="Dream mood" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="joy">Joyful</SelectItem>
                <SelectItem value="fear">Fearful</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
                <SelectItem value="mysterious">Mysterious</SelectItem>
              </SelectContent>
            </Select>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger className="bg-white/5 border-blue-400/30 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jungian">Jungian Archetypes</SelectItem>
                <SelectItem value="freudian">Freudian Psychoanalysis</SelectItem>
                <SelectItem value="gestalt">Gestalt Therapy</SelectItem>
                <SelectItem value="spiritual">Spiritual Perspective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => call('dream', { title, content, mood, framework })} disabled={loading || !title || !content} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Moon className="w-4 h-4 mr-2" />} Interpret Dream
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─── 🔮 Vesta · Numerology / Bazi ───
export function BaziTrack() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [question, setQuestion] = useState('');
  return (
    <div className="space-y-4">
      <ProfileSection />
      <TrackHeader
        icon={<Hash className="w-5 h-5" />} starSymbol="🔮" starName="Vesta" starMeaning="Goddess of the Hearth · Keeper of Destiny"
        title="AI Numerology & Bazi" subtitle="Heavenly Stems · Five Elements · Ten Gods · Life Cycles"
        color="rose"
      />
      <Card className="glass-card-dark border-rose-400/30">
        <CardContent className="pt-6 space-y-4">
          {user?.birthDate ? (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-purple-100">{user.birthDate} {user.birthTime || ''}</span>
              {metadata?.dayMaster && <Badge variant="outline" className="border-gold/40 text-gold">Day Master: {metadata.dayMaster}</Badge>}
            </div>
          ) : <p className="text-purple-200/70 text-sm">Please set your birth date in profile above</p>}
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What to explore? (e.g., career, relationships, health)" className="bg-white/5 border-rose-400/30 text-white" />
          <Button
            onClick={() => call('bazi', { birthDate: user?.birthDate || '1995-01-01', birthTime: user?.birthTime || '', gender: user?.gender || '', question })}
            disabled={loading || !user?.birthDate}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />} Read My Destiny
          </Button>
        </CardContent>
      </Card>
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// ─── 🌅 Aurora · Daily Energy Report ───
export function DailyEnergyTrack() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useMysticCall();
  const [focus, setFocus] = useState('');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="space-y-4">
      <TrackHeader
        icon={<Sun className="w-5 h-5" />} starSymbol="🌅" starName="Aurora" starMeaning="Goddess of Dawn · Daily Renewal"
        title="AI Daily Energy Report" subtitle={`Today is ${today} · Astrology + Tarot + Moon Phase + Numerology`}
        color="yellow"
      />
      <Card className="glass-card-dark border-yellow-400/30">
        <CardContent className="pt-6 space-y-4">
          <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Today's focus (optional): job interview / relationship / stress..." className="bg-white/5 border-yellow-400/30 text-white" />
          <Button
            onClick={() => call('daily', { birthDate: user?.birthDate, sunSign: user?.birthDate, focus })}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sun className="w-4 h-4 mr-2" />} Generate Daily Report
          </Button>
        </CardContent>
      </Card>
      {metadata?.moonPhase && (
        <div className="flex items-center justify-center gap-3 text-purple-200/80 text-sm">
          <span className="text-2xl">{metadata.moonPhase.emoji}</span>
          <span>Moon: <span className="text-gold">{metadata.moonPhase.phase}</span> · {metadata.moonPhase.meaning}</span>
        </div>
      )}
      <AIResult result={result} loading={loading} />
    </div>
  );
}

// Export shared components for legacy tracks
export { ProfileSection, useMysticCall, AIResult, TrackHeader };
