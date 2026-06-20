'use client';
// ✦ Lumina Directory — Community Curated AI Tools & Resources Directory
// CRUD app — emerald/teal theme (no AI call)
import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Loader2, Plus, ThumbsUp, ExternalLink, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DirectoryItem = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  pricing: string;
  upvotes: number;
  createdAt?: string;
};

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'ai-tool', label: 'AI Tools' },
  { value: 'ai-agent', label: 'AI Agents' },
  { value: 'saas', label: 'SaaS' },
  { value: 'newsletter', label: 'Newsletters' },
  { value: 'resource', label: 'Resources' },
];

const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Open Source'];

export function DirectoryApp() {
  const { toast } = useToast();
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'Free' });
  const [voting, setVoting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/directory?type=directory&category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setItems(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast({ title: 'Missing fields', description: 'Name and URL are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'directory', action: 'create', payload: form }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.error || 'Failed to submit');
      toast({ title: '✓ Submitted', description: 'Your entry has been added' });
      setForm({ name: '', url: '', description: '', category: 'ai-tool', pricing: 'Free' });
      setShowForm(false);
      load();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const upvote = async (id: string) => {
    setVoting(id);
    try {
      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'directory', action: 'upvote', payload: { id } }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.error || 'Failed to upvote');
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, upvotes: (it.upvotes || 0) + 1 } : it));
      toast({ title: '👍 Upvoted' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message, variant: 'destructive' });
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card-dark border-emerald-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-200">
              <LayoutGrid className="w-5 h-5 text-emerald-300" />
              <h2 className="text-lg font-semibold">AI Tools & Resources Directory</h2>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <Plus className="w-4 h-4 mr-1" />Submit
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                size="sm"
                variant={category === c.value ? 'default' : 'outline'}
                onClick={() => setCategory(c.value)}
                className={category === c.value
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                  : 'border-emerald-400/20 text-emerald-200/70 hover:bg-emerald-500/10'}
              >
                {c.label}
              </Button>
            ))}
          </div>

          {showForm && (
            <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-400/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-emerald-200/80 text-xs">Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="bg-white/5 border-emerald-400/30 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-emerald-200/80 text-xs">URL *</Label>
                  <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="bg-white/5 border-emerald-400/30 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-emerald-200/80 text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c.value !== 'all').map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-emerald-200/80 text-xs">Pricing</Label>
                  <Select value={form.pricing} onValueChange={(v) => setForm({ ...form, pricing: v })}>
                    <SelectTrigger className="bg-white/5 border-emerald-400/30 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRICING_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-emerald-200/80 text-xs">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does it do? Who is it for?" className="bg-white/5 border-emerald-400/30 text-white min-h-[80px]" />
              </div>
              <div className="flex gap-2">
                <Button onClick={submit} disabled={submitting} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Submit Entry
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="border-emerald-400/30 text-emerald-200/70">Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card className="glass-card-dark border-emerald-400/30"><CardContent className="py-12 flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 text-emerald-300 animate-spin" /><p className="text-emerald-200/80 text-sm">Loading directory...</p></CardContent></Card>
      ) : items.length === 0 ? (
        <Card className="glass-card-dark border-emerald-400/30"><CardContent className="py-12 flex flex-col items-center gap-3"><Search className="w-8 h-8 text-emerald-300/60" /><p className="text-emerald-200/70 text-sm">No entries yet. Be the first to submit!</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <Card key={item.id} className="glass-card-dark border-emerald-400/30 hover:border-emerald-400/50 transition-colors">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-200 font-semibold hover:text-emerald-100">
                      <span className="truncate">{item.name}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Badge variant="outline" className="border-emerald-400/40 text-emerald-200 text-[10px]">{item.category}</Badge>
                      <Badge variant="outline" className="border-teal-400/40 text-teal-200 text-[10px]">{item.pricing}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={voting === item.id}
                    onClick={() => upvote(item.id)}
                    className="border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/10 flex-shrink-0"
                  >
                    {voting === item.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ThumbsUp className="w-3 h-3 mr-1" />}
                    {item.upvotes || 0}
                  </Button>
                </div>
                {item.description && <p className="text-emerald-100/70 text-xs leading-relaxed">{item.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
