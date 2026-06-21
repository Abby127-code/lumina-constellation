'use client';
// ✦ Lumina Dream — AI Dream Interpretation & Journal
// Independent Product App — blue/indigo theme
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Loader2, Sparkles } from 'lucide-react';
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
      toast({ title: '🌙 Interpretation Ready' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  if (loading) return <Card className="glass-card-dark border-blue-400/30 mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 text-blue-300 animate-float" /><p className="text-blue-200/80 text-sm">Reading the dream...</p></CardContent></Card>;
  if (!result) return null;
  return <Card className="glass-card-dark border-blue-400/30 mt-4 animate-glow-pulse"><CardContent className="pt-6"><div className="text-blue-50/90 leading-relaxed space-y-3 text-sm sm:text-base"><ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-2xl font-bold text-blue-300 mt-4 mb-2">{children}</h1>, h2: ({ children }) => <h2 className="text-xl font-semibold text-indigo-200 mt-4 mb-2">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold text-indigo-100 mt-3 mb-1">{children}</h3>, p: ({ children }) => <p className="text-blue-50/85 leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-blue-50/85">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-blue-50/85">{children}</ol>, strong: ({ children }) => <strong className="text-indigo-200 font-semibold">{children}</strong>, blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-400/50 pl-4 italic text-blue-200/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown></div></CardContent></Card>;
}

export function DreamApp() {
  const { loading, result, metadata, call } = useAI();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('calm');
  const [framework, setFramework] = useState('jungian');

  const submit = () => {
    if (!content.trim()) return;
    call('dream', { title: title || 'Untitled Dream', content, mood, framework });
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-blue-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-200">
            <Moon className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-semibold">Dream Interpretation</h2>
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200/80 text-xs">Dream Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Flying over the ocean" className="bg-white/5 border-blue-400/30 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200/80 text-xs">Describe Your Dream</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What happened in your dream? Include colors, people, places, and feelings..." className="bg-white/5 border-blue-400/30 text-white min-h-[120px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-blue-200/80 text-xs">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-white/5 border-blue-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="joy">Joyful</SelectItem>
                  <SelectItem value="fear">Fearful</SelectItem>
                  <SelectItem value="anxious">Anxious</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-blue-200/80 text-xs">Interpretation Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-white/5 border-blue-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jungian">Jungian</SelectItem>
                  <SelectItem value="freudian">Freudian</SelectItem>
                  <SelectItem value="gestalt">Gestalt</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={submit} disabled={loading || !content.trim()} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Moon className="w-4 h-4 mr-2" />}Interpret Dream
          </Button>
        </CardContent>
      </Card>
      {metadata?.symbols && <Card className="glass-card-dark border-indigo-400/30 mt-3"><CardContent className="pt-4"><p className="text-xs text-indigo-200/70 mb-2">Key Symbols</p><div className="flex flex-wrap gap-2">{metadata.symbols.map((s: string, i: number) => <span key={i} className="px-2 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs">{s}</span>)}</div></CardContent></Card>}
      <Result result={result} loading={loading} />
    </div>
  );
}
