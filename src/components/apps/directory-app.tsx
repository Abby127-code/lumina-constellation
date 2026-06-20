'use client';
// AI Toolkit — Directory + Prompt Library combined
// emerald/teal theme
import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LayoutGrid, ThumbsUp, ExternalLink, MessageSquareCode, Copy, Check, Sparkles, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

function useAI() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const call = async (module: string, input: any) => {
    setLoading(true); setResult('');
    try {
      const res = await fetch('/api/mystic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module, input, userId: user?.userId }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setResult(data.result);
      toast({ title: '✨ Prompt generated' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, call };
}

export function DirectoryApp() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="directory">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-emerald-400/20 p-1 rounded-xl">
          <TabsTrigger value="directory" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-purple-200/70 text-xs py-2">
            <LayoutGrid className="w-3 h-3 mr-1" /> AI Tools Directory
          </TabsTrigger>
          <TabsTrigger value="prompts" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-purple-200/70 text-xs py-2">
            <MessageSquareCode className="w-3 h-3 mr-1" /> Prompt Library
          </TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="mt-4"><DirectoryTab /></TabsContent>
        <TabsContent value="prompts" className="mt-4"><PromptsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function DirectoryTab() {
  const { user } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'free' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?type=directory&category=${category}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {} finally { setLoading(false); }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const upvote = async (id: string) => {
    await fetch('/api/directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'directory', action: 'upvote', payload: { id } }) });
    setItems(prev => prev.map(it => it.id === id ? { ...it, upvotes: it.upvotes + 1 } : it));
  };

  const submit = async () => {
    if (!form.name || !form.url) { toast({ title: 'Please fill name and URL', variant: 'destructive' }); return; }
    const res = await fetch('/api/directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'directory', action: 'create', payload: { ...form, userId: user?.userId } }) });
    if (res.ok) { toast({ title: '✅ Submitted' }); setForm({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'free' }); setShowSubmit(false); load(); }
  };

  const cats = [
    { id: 'all', name: 'All' }, { id: 'ai-tool', name: 'AI Tools' }, { id: 'ai-agent', name: 'AI Agents' },
    { id: 'saas', name: 'SaaS' }, { id: 'newsletter', name: 'Newsletter' }, { id: 'resource', name: 'Resources' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {cats.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs ${category === c.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-purple-200/70 hover:bg-emerald-600/20'}`}>{c.name}</button>
        ))}
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setShowSubmit(!showSubmit)} className="border-emerald-400/40 text-emerald-300 text-xs">+ Submit</Button>
      </div>
      {showSubmit && (
        <Card className="glass-card-dark border-emerald-400/30">
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tool name" className="bg-white/5 border-emerald-400/30 text-white" />
              <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="bg-white/5 border-emerald-400/30 text-white" />
            </div>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="One-line description" className="bg-white/5 border-emerald-400/30 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-tool">AI Tool</SelectItem><SelectItem value="ai-agent">AI Agent</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem><SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.pricing} onValueChange={v => setForm({ ...form, pricing: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem><SelectItem value="freemium">Freemium</SelectItem><SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submit} className="w-full bg-emerald-600 text-white">Submit</Button>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? <div className="col-span-full text-center py-12"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" /></div>
        : items.length === 0 ? <div className="col-span-full text-center py-12 text-purple-200/60 text-sm">No tools yet. Submit the first!</div>
        : items.map(item => (
          <Card key={item.id} className="glass-card-dark border-emerald-400/20 hover:border-emerald-400/50 transition-all">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-emerald-200 flex items-center gap-1">{item.name}<ExternalLink className="w-3 h-3 opacity-50" /></h3>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-purple-300/40 text-[10px] hover:text-emerald-300 truncate block">{item.url}</a>
                </div>
              </div>
              <p className="text-purple-100/70 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-300">{item.category}</Badge>
                <button onClick={() => upvote(item.id)} className="flex items-center gap-1 text-[10px] text-purple-200/60 hover:text-emerald-300"><ThumbsUp className="w-3 h-3" /> {item.upvotes || 0}</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PromptsTab() {
  const { user } = useSession();
  const { toast } = useToast();
  const { loading, result, call } = useAI();
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ purpose: '', model: 'ChatGPT', style: 'professional', scene: '' });
  const [copied, setCopied] = useState(false);

  const loadPrompts = useCallback(async () => {
    try {
      const res = await fetch(`/api/directory?type=prompts&category=${category}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {}
  }, [category]);

  useEffect(() => { const t = setTimeout(() => loadPrompts(), 0); return () => clearTimeout(t); }, [loadPrompts]);

  const cats = [
    { id: 'all', name: 'All' }, { id: 'writing', name: 'Writing' }, { id: 'image', name: 'Image' },
    { id: 'business', name: 'Business' }, { id: 'coding', name: 'Coding' }, { id: 'marketing', name: 'Marketing' },
  ];

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true); toast({ title: '✅ Copied' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {cats.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs ${category === c.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-purple-200/70 hover:bg-emerald-600/20'}`}>{c.name}</button>
        ))}
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowGen(!showGen)} className="bg-emerald-600 text-white text-xs"><Sparkles className="w-3 h-3 mr-1" /> Generate Prompt</Button>
      </div>
      {showGen && (
        <Card className="glass-card-dark border-emerald-400/30">
          <CardContent className="space-y-3 pt-4">
            <Input value={genForm.purpose} onChange={e => setGenForm({ ...genForm, purpose: e.target.value })} placeholder="What do you need? e.g., write a blog post" className="bg-white/5 border-emerald-400/30 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={genForm.model} onValueChange={v => setGenForm({ ...genForm, model: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem><SelectItem value="Claude">Claude</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem><SelectItem value="Midjourney">Midjourney</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genForm.style} onValueChange={v => setGenForm({ ...genForm, style: v })}>
                <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem><SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem><SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => call('promptGenerator', genForm)} disabled={loading} className="w-full bg-emerald-600 text-white">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Generate
            </Button>
          </CardContent>
        </Card>
      )}
      {result && (
        <Card className="glass-card-dark border-emerald-400/30 mt-3">
          <CardContent className="pt-4">
            <div className="flex items-center justify-end mb-2"><Button size="sm" variant="ghost" onClick={() => copy(result)} className="text-purple-200/60 text-xs">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</Button></div>
            <div className="text-purple-50/90 text-sm"><ReactMarkdown>{result}</ReactMarkdown></div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.length === 0 ? <div className="col-span-full text-center py-12 text-purple-200/60 text-sm">No prompts yet. Generate one!</div>
        : items.map(item => (
          <Card key={item.id} className="glass-card-dark border-emerald-400/20 hover:border-emerald-400/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-emerald-200">{item.title}</h3>
                <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-300">{item.model}</Badge>
              </div>
              <pre className="bg-black/40 border border-emerald-400/20 p-2 rounded text-[10px] text-emerald-300 max-h-32 overflow-y-auto">{item.promptText?.slice(0, 300)}{item.promptText?.length > 300 ? '...' : ''}</pre>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-[9px] border-purple-400/40 text-purple-300">{item.category}</Badge>
                <button onClick={() => copy(item.promptText)} className="text-[10px] text-purple-200/60 hover:text-emerald-300"><Copy className="w-3 h-3" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
