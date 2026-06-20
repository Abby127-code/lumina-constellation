'use client';
// ✦ Lumina Memorial — AI Memorial Writing Companion
// Independent Product App — purple/indigo theme
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Loader2, Sparkles } from 'lucide-react';
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
      toast({ title: '💜 Memorial Written' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  if (loading) return <Card className="glass-card-dark border-purple-400/30 mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 text-purple-300 animate-float" /><p className="text-purple-200/80 text-sm">Honoring their memory...</p></CardContent></Card>;
  if (!result) return null;
  return <Card className="glass-card-dark border-purple-400/30 mt-4 animate-glow-pulse"><CardContent className="pt-6"><div className="text-purple-50/90 leading-relaxed space-y-3 text-sm sm:text-base"><ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-2xl font-bold text-purple-300 mt-4 mb-2">{children}</h1>, h2: ({ children }) => <h2 className="text-xl font-semibold text-indigo-200 mt-4 mb-2">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold text-indigo-100 mt-3 mb-1">{children}</h3>, p: ({ children }) => <p className="text-purple-50/85 leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-purple-50/85">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-purple-50/85">{children}</ol>, strong: ({ children }) => <strong className="text-indigo-200 font-semibold">{children}</strong>, blockquote: ({ children }) => <blockquote className="border-l-2 border-purple-400/50 pl-4 italic text-purple-200/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown></div></CardContent></Card>;
}

export function MemorialApp() {
  const { loading, result, metadata, call } = useAI();
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('grandparent');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [personality, setPersonality] = useState('');
  const [memories, setMemories] = useState('');
  const [userFeeling, setUserFeeling] = useState('');

  const submit = () => {
    if (!personName.trim()) return;
    call('memorial', { personName, relationship, birthYear, deathYear, personality, memories, userFeeling });
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-purple-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-purple-200">
            <Heart className="w-5 h-5 text-purple-300" />
            <h2 className="text-lg font-semibold">Write a Memorial</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-purple-200/80 text-xs">Person's Name</Label>
              <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="e.g. Margaret" className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-purple-200/80 text-xs">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="bg-white/5 border-purple-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="spouse">Spouse / Partner</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="pet">Pet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-purple-200/80 text-xs">Birth Year (optional)</Label>
              <Input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="e.g. 1942" className="bg-white/5 border-purple-400/30 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-purple-200/80 text-xs">Death Year (optional)</Label>
              <Input value={deathYear} onChange={(e) => setDeathYear(e.target.value)} placeholder="e.g. 2024" className="bg-white/5 border-purple-400/30 text-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-purple-200/80 text-xs">Their Personality & Traits</Label>
            <Textarea value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="What were they like? Their passions, quirks, values..." className="bg-white/5 border-purple-400/30 text-white min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-purple-200/80 text-xs">Cherished Memories</Label>
            <Textarea value={memories} onChange={(e) => setMemories(e.target.value)} placeholder="Specific moments, stories, lessons they taught you..." className="bg-white/5 border-purple-400/30 text-white min-h-[100px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-purple-200/80 text-xs">How You're Feeling Now (optional)</Label>
            <Input value={userFeeling} onChange={(e) => setUserFeeling(e.target.value)} placeholder="e.g. Grateful, missing them, at peace..." className="bg-white/5 border-purple-400/30 text-white" />
          </div>
          <Button onClick={submit} disabled={loading || !personName.trim()} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}Write Memorial
          </Button>
        </CardContent>
      </Card>
      <Result result={result} loading={loading} />
    </div>
  );
}
