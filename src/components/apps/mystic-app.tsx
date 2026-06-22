'use client';
// ✦ Vega · AI Spiritual Companion — Astrology + Tarot + Bazi + Daily Energy
// Independent Product App with internal tab navigation
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Star, Sun, Gem, Hash, Loader2, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

function useAI() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const call = async (module: string, input: any) => {
    setLoading(true); setResult(''); setMetadata(null);
    try {
      const res = await fetch('/api/mystic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module, input, userId: user?.userId }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setResult(data.result); setMetadata(data.metadata);
      toast({ title: '✨ Complete' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  if (loading) return <Card className="product-app-card border-gold/30 mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 text-gold animate-float" /><p className="text-purple-200/80 text-sm">AI is generating...</p></CardContent></Card>;
  if (!result) return null;
  return <Card className="product-app-card border-gold/30 mt-4 animate-glow-pulse"><CardContent className="pt-6"><div className="text-purple-50/90 leading-relaxed space-y-3 text-sm sm:text-base"><ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-2xl font-bold text-gold mt-4 mb-2">{children}</h1>, h2: ({ children }) => <h2 className="text-xl font-semibold text-amber-200 mt-4 mb-2">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold text-amber-100 mt-3 mb-1">{children}</h3>, p: ({ children }) => <p className="text-purple-50/85 leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-purple-50/85">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-purple-50/85">{children}</ol>, strong: ({ children }) => <strong className="text-amber-200 font-semibold">{children}</strong>, blockquote: ({ children }) => <blockquote className="border-l-2 border-gold/50 pl-4 italic text-purple-200/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown></div></CardContent></Card>;
}

function ProfileCard() {
  const { user, updateProfile } = useSession();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', birthDate: user?.birthDate || '', birthTime: user?.birthTime || '', birthPlace: user?.birthPlace || '', gender: user?.gender || '' });
  const save = async () => { if (!user) return; updateProfile(form); setEditing(false); toast({ title: 'Saved' }); fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.userId, profile: form }) }).catch(() => {}); };
  if (!user) return null;
  return <Card className="product-app-card mb-4 border-gold/30"><CardHeader className="pb-2"><div className="flex items-center justify-between"><span className="text-gold text-sm font-semibold">{user.name || 'Anonymous'} · {user.birthDate || 'No birth info'}</span><Button variant="ghost" size="sm" className="text-gold text-xs" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</Button></div></CardHeader>{editing && <CardContent className="space-y-2 pt-2 border-t border-gold/20"><div className="grid grid-cols-2 gap-2"><div><Label className="text-purple-200/80 text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-gold/30 text-white" /></div><div><Label className="text-purple-200/80 text-xs">Birth Date</Label><Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="bg-white/5 border-gold/30 text-white" /></div><div><Label className="text-purple-200/80 text-xs">Birth Time</Label><Input type="time" value={form.birthTime} onChange={(e) => setForm({ ...form, birthTime: e.target.value })} className="bg-white/5 border-gold/30 text-white" /></div><div><Label className="text-purple-200/80 text-xs">Birth Place</Label><Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} className="bg-white/5 border-gold/30 text-white" /></div></div><Button onClick={save} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs">Save</Button></CardContent>}</Card>;
}

export function MysticApp() {
  return (
    <div className="space-y-4">
      <ProfileCard />
      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-gold/20 p-1 rounded-xl">
          <TabsTrigger value="daily" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2"><Sun className="w-3 h-3 mr-1" />Daily</TabsTrigger>
          <TabsTrigger value="astrology" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2"><Star className="w-3 h-3 mr-1" />Astrology</TabsTrigger>
          <TabsTrigger value="tarot" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2"><Gem className="w-3 h-3 mr-1" />Tarot</TabsTrigger>
          <TabsTrigger value="bazi" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-purple-200/70 text-xs py-2"><Hash className="w-3 h-3 mr-1" />Bazi</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-4"><DailyTab /></TabsContent>
        <TabsContent value="astrology" className="mt-4"><AstrologyTab /></TabsContent>
        <TabsContent value="tarot" className="mt-4"><TarotTab /></TabsContent>
        <TabsContent value="bazi" className="mt-4"><BaziTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function DailyTab() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useAI();
  const [focus, setFocus] = useState('');
  return <div><Card className="product-app-card border-gold/30"><CardContent className="pt-6 space-y-3"><Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Today's focus (optional)" className="bg-white/5 border-gold/30 text-white" /><Button onClick={() => call('daily', { birthDate: user?.birthDate, sunSign: user?.birthDate, focus })} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sun className="w-4 h-4 mr-2" />}Generate Daily Report</Button></CardContent></Card>{metadata?.moonPhase && <div className="flex items-center justify-center gap-2 text-purple-200/80 text-sm mt-3"><span className="text-xl">{metadata.moonPhase.emoji}</span><span>Moon: <span className="text-gold">{metadata.moonPhase.phase}</span></span></div>}<Result result={result} loading={loading} /></div>;
}

function AstrologyTab() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useAI();
  const [q, setQ] = useState('');
  return <div><Card className="product-app-card border-gold/30"><CardContent className="pt-6 space-y-3">{user?.birthDate ? <div className="flex items-center gap-2 text-xs text-purple-100"><Calendar className="w-3 h-3 text-gold" />{user.birthDate} {user.birthTime || ''} {user.birthPlace || ''}{metadata?.sunSign && <Badge variant="outline" className="border-gold/40 text-gold text-[9px]">{metadata.sunSign}</Badge>}</div> : <p className="text-purple-200/60 text-xs">Set birth date in profile</p>}<Textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to know?" className="bg-white/5 border-gold/30 text-white min-h-[60px]" /><Button onClick={() => call('astrology', { birthDate: user?.birthDate || '1995-01-01', birthTime: user?.birthTime || '', birthPlace: user?.birthPlace || '', gender: user?.gender || '', question: q })} disabled={loading || !user?.birthDate} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}Read My Chart</Button></CardContent></Card><Result result={result} loading={loading} /></div>;
}

function TarotTab() {
  const { loading, result, metadata, call } = useAI();
  const [q, setQ] = useState('');
  const [n, setN] = useState(3);
  return <div><Card className="product-app-card border-gold/30"><CardContent className="pt-6 space-y-3"><Textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Your question" className="bg-white/5 border-gold/30 text-white min-h-[60px]" /><Select value={String(n)} onValueChange={(v) => setN(Number(v))}><SelectTrigger className="bg-white/5 border-gold/30 text-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3 cards</SelectItem><SelectItem value="5">5 cards</SelectItem><SelectItem value="7">7 cards</SelectItem></SelectContent></Select><Button onClick={() => call('tarot', { question: q, cardCount: n })} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gem className="w-4 h-4 mr-2" />}Draw Cards</Button></CardContent></Card>{metadata?.cards && <Card className="product-app-card border-purple-400/30 mt-3"><CardContent><div className="grid grid-cols-3 gap-2">{metadata.cards.map((c: any, i: number) => <div key={i} className="bg-purple-900/40 border border-gold/20 rounded-lg p-2 text-center"><Badge variant="outline" className="text-gold border-gold/30 text-[8px]">{c.position}</Badge>{c.reversed && <Badge variant="outline" className="text-red-300 text-[8px]">Rev</Badge>}<div className="text-xl text-gold my-1" style={{ fontFamily: 'var(--font-cormorant)' }}>{c.card.symbol}</div><p className="text-amber-100 text-[10px]">{c.card.name}</p></div>)}</div></CardContent></Card>}<Result result={result} loading={loading} /></div>;
}

function BaziTab() {
  const { user } = useSession();
  const { loading, result, metadata, call } = useAI();
  const [q, setQ] = useState('');
  return <div><Card className="product-app-card border-gold/30"><CardContent className="pt-6 space-y-3">{user?.birthDate ? <div className="flex items-center gap-2 text-xs text-purple-100"><Calendar className="w-3 h-3 text-gold" />{user.birthDate} {user.birthTime || ''}{metadata?.dayMaster && <Badge variant="outline" className="border-gold/40 text-gold text-[9px]">{metadata.dayMaster}</Badge>}</div> : <p className="text-purple-200/60 text-xs">Set birth date in profile</p>}<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Career? Relationships? Health?" className="bg-white/5 border-gold/30 text-white" /><Button onClick={() => call('bazi', { birthDate: user?.birthDate || '1995-01-01', birthTime: user?.birthTime || '', gender: user?.gender || '', question: q })} disabled={loading || !user?.birthDate} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}Read Destiny</Button></CardContent></Card><Result result={result} loading={loading} /></div>;
}
