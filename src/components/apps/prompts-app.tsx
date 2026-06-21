'use client';
// ✦ Lumina Prompts — AI Prompt Generator + Public Prompt Library
// Independent Product App — sky/indigo theme
import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareCode, Loader2, Sparkles, Copy, Search } from 'lucide-react';
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
      toast({ title: '✦ Prompt Generated' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  const { toast } = useToast();
  if (loading) return <Card className="glass-card-dark border-sky-400/30 mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 text-sky-300 animate-float" /><p className="text-sky-200/80 text-sm">Crafting your prompt...</p></CardContent></Card>;
  if (!result) return null;
  return (
    <Card className="glass-card-dark border-sky-400/30 mt-4 animate-glow-pulse">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sky-200 text-xs font-semibold">Generated Prompt</span>
          <Button size="sm" variant="ghost" className="text-sky-200 hover:bg-sky-500/10 text-xs" onClick={() => { navigator.clipboard.writeText(result); toast({ title: '📋 Copied' }); }}>
            <Copy className="w-3 h-3 mr-1" />Copy
          </Button>
        </div>
        <div className="text-sky-50/90 leading-relaxed space-y-2 text-sm">
          <ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-xl font-bold text-sky-300 mt-2 mb-1">{children}</h1>, h2: ({ children }) => <h2 className="text-lg font-semibold text-indigo-200 mt-3 mb-1">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold text-indigo-100 mt-2 mb-1">{children}</h3>, p: ({ children }) => <p className="text-sky-50/85 leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-sky-50/85">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-sky-50/85">{children}</ol>, strong: ({ children }) => <strong className="text-indigo-200 font-semibold">{children}</strong>, code: ({ children }) => <code className="bg-sky-500/15 text-sky-100 px-1.5 py-0.5 rounded text-xs">{children}</code>, blockquote: ({ children }) => <blockquote className="border-l-2 border-sky-400/50 pl-4 italic text-sky-200/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

const PROMPT_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'writing', label: 'Writing' },
  { value: 'image', label: 'Image' },
  { value: 'business', label: 'Business' },
  { value: 'coding', label: 'Coding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'personal', label: 'Personal' },
];

type PromptItem = {
  id: string;
  title?: string;
  content: string;
  category: string;
  upvotes?: number;
  model?: string;
  createdAt?: string;
};

export function PromptsApp() {
  const { loading, result, metadata, call } = useAI();
  const { toast } = useToast();
  const [purpose, setPurpose] = useState('');
  const [model, setModel] = useState('ChatGPT');
  const [style, setStyle] = useState('professional');
  const [scene, setScene] = useState('');

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [category, setCategory] = useState('all');

  const loadPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    try {
      const res = await fetch(`/api/directory?type=prompts&category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setPrompts(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []);
      } else {
        setPrompts([]);
      }
    } catch (e) {
      setPrompts([]);
    } finally {
      setLoadingPrompts(false);
    }
  }, [category]);

  useEffect(() => { loadPrompts(); }, [loadPrompts]);

  const submit = () => {
    if (!purpose.trim()) return;
    call('promptGenerator', { purpose, model, style, scene });
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied' });
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-sky-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-sky-200">
            <MessageSquareCode className="w-5 h-5 text-sky-300" />
            <h2 className="text-lg font-semibold">Prompt Generator</h2>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sky-200/80 text-xs">Purpose / What do you want the prompt to do?</Label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Write a product description for a coffee brand" className="bg-white/5 border-sky-400/30 text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sky-200/80 text-xs">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                  <SelectItem value="Claude">Claude</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                  <SelectItem value="Midjourney">Midjourney</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sky-200/80 text-xs">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-white/5 border-sky-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sky-200/80 text-xs">Scene / Context (optional)</Label>
              <Input value={scene} onChange={(e) => setScene(e.target.value)} placeholder="e.g. For Instagram" className="bg-white/5 border-sky-400/30 text-white" />
            </div>
          </div>
          <Button onClick={submit} disabled={loading || !purpose.trim()} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquareCode className="w-4 h-4 mr-2" />}Generate Prompt
          </Button>
        </CardContent>
      </Card>

      <Result result={result} loading={loading} />

      <Card className="glass-card-dark border-indigo-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-200">
            <Search className="w-4 h-4 text-indigo-300" />
            <h3 className="text-sm font-semibold">Community Prompt Library</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPT_CATEGORIES.map((c) => (
              <Button
                key={c.value}
                size="sm"
                variant={category === c.value ? 'default' : 'outline'}
                onClick={() => setCategory(c.value)}
                className={category === c.value
                  ? 'bg-sky-500/20 border-sky-400/40 text-sky-200'
                  : 'border-sky-400/20 text-sky-200/70 hover:bg-sky-500/10'}
              >
                {c.label}
              </Button>
            ))}
          </div>
          {loadingPrompts ? (
            <div className="py-8 flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 text-sky-300 animate-spin" /><p className="text-sky-200/70 text-xs">Loading prompts...</p></div>
          ) : prompts.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2"><Sparkles className="w-6 h-6 text-sky-300/50" /><p className="text-sky-200/60 text-xs">No prompts yet in this category.</p></div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {prompts.map((p) => (
                <div key={p.id} className="p-3 rounded-lg bg-sky-500/5 border border-sky-400/20 hover:border-sky-400/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="border-sky-400/40 text-sky-200 text-[10px]">{p.category}</Badge>
                      {p.model && <Badge variant="outline" className="border-indigo-400/40 text-indigo-200 text-[10px]">{p.model}</Badge>}
                    </div>
                    <Button size="sm" variant="ghost" className="text-sky-200 hover:bg-sky-500/10 h-6 px-2 text-xs" onClick={() => copyPrompt(p.content)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {p.title && <p className="text-sky-100 font-medium text-xs mb-1">{p.title}</p>}
                  <p className="text-sky-100/70 text-xs leading-relaxed whitespace-pre-wrap line-clamp-4">{p.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
