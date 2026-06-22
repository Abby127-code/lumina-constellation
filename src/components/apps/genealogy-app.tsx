'use client';
// ✦ Lumina Genealogy — AI Family Story & Heritage Writer
// Independent Product App — yellow/amber theme
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2, Sparkles } from 'lucide-react';
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
      toast({ title: '✦ Family Story Written' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  if (loading) return <Card className="product-app-card border-yellow-400/30 mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 text-yellow-300 animate-float" /><p className="text-yellow-200/80 text-sm">Weaving your family saga...</p></CardContent></Card>;
  if (!result) return null;
  return <Card className="product-app-card border-yellow-400/30 mt-4 animate-glow-pulse"><CardContent className="pt-6"><div className="text-yellow-50/90 leading-relaxed space-y-3 text-sm sm:text-base"><ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-2xl font-bold text-yellow-300 mt-4 mb-2">{children}</h1>, h2: ({ children }) => <h2 className="text-xl font-semibold text-amber-200 mt-4 mb-2">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold text-amber-100 mt-3 mb-1">{children}</h3>, p: ({ children }) => <p className="text-yellow-50/85 leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-yellow-50/85">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-yellow-50/85">{children}</ol>, strong: ({ children }) => <strong className="text-amber-200 font-semibold">{children}</strong>, blockquote: ({ children }) => <blockquote className="border-l-2 border-yellow-400/50 pl-4 italic text-yellow-200/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown></div></CardContent></Card>;
}

export function GenealogyApp() {
  const { loading, result, metadata, call } = useAI();
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState('');
  const [origins, setOrigins] = useState('');
  const [traditions, setTraditions] = useState('');
  const [focus, setFocus] = useState('');

  const submit = () => {
    if (!familyName.trim()) return;
    call('genealogy', { familyName, members, origins, traditions, focus });
  };

  return (
    <div className="space-y-4">
      <Card className="product-app-card border-yellow-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-200">
            <Users className="w-5 h-5 text-yellow-300" />
            <h2 className="text-lg font-semibold">Write Your Family Story</h2>
          </div>
          <div className="space-y-1.5">
            <Label className="text-yellow-200/80 text-xs">Family Name</Label>
            <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. The Chen Family" className="bg-white/5 border-yellow-400/30 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-yellow-200/80 text-xs">Family Members</Label>
            <Textarea value={members} onChange={(e) => setMembers(e.target.value)} placeholder="List key members, their roles, generations, relationships..." className="bg-white/5 border-yellow-400/30 text-white min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-yellow-200/80 text-xs">Origins & Migration</Label>
            <Textarea value={origins} onChange={(e) => setOrigins(e.target.value)} placeholder="Where did the family come from? Migration stories, ancestral lands..." className="bg-white/5 border-yellow-400/30 text-white min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-yellow-200/80 text-xs">Traditions & Values</Label>
            <Textarea value={traditions} onChange={(e) => setTraditions(e.target.value)} placeholder="Family traditions, recipes, celebrations, beliefs, sayings..." className="bg-white/5 border-yellow-400/30 text-white min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-yellow-200/80 text-xs">Focus / What to Emphasize (optional)</Label>
            <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Resilience across generations" className="bg-white/5 border-yellow-400/30 text-white" />
          </div>
          <Button onClick={submit} disabled={loading || !familyName.trim()} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}Write Family Story
          </Button>
        </CardContent>
      </Card>
      <Result result={result} loading={loading} />
    </div>
  );
}
