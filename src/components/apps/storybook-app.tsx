'use client';
// ✦ Lumina Storybook — AI Personalized Children's Story Generator
// Independent Product App — rose/orange theme
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
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
      toast({ title: '✨ Story Ready' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  if (loading) return <Card className="product-app-card [var(--p-border)] mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 product-app-accent animate-float" /><p className="product-app-muted text-sm">Spinning a tale...</p></CardContent></Card>;
  if (!result) return null;
  return <Card className="product-app-card [var(--p-border)] mt-4 animate-glow-pulse"><CardContent className="pt-6"><div className="text-rose-50/90 leading-relaxed space-y-3 text-sm sm:text-base"><ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-2xl font-bold product-app-accent mt-4 mb-2">{children}</h1>, h2: ({ children }) => <h2 className="text-xl font-semibold product-app-header mt-4 mb-2">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold product-app-header mt-3 mb-1">{children}</h3>, p: ({ children }) => <p className="[color:var(--p-text)] leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 [color:var(--p-text)]">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 [color:var(--p-text)]">{children}</ol>, strong: ({ children }) => <strong className="product-app-header font-semibold">{children}</strong>, blockquote: ({ children }) => <blockquote className="border-l-2 [var(--p-border)] pl-4 italic product-app-muted/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown></div></CardContent></Card>;
}

export function StorybookApp() {
  const { loading, result, metadata, call } = useAI();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('5');
  const [theme, setTheme] = useState('brave');
  const [artStyle, setArtStyle] = useState('watercolor');
  const [specialRequest, setSpecialRequest] = useState('');

  const submit = () => {
    if (!childName.trim()) return;
    call('storybook', { childName, childAge: Number(childAge), theme, artStyle, specialRequest });
  };

  return (
    <div className="space-y-4">
      <Card className="product-app-card [var(--p-border)]">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 product-app-muted">
            <BookOpen className="w-5 h-5 product-app-accent" />
            <h2 className="text-lg font-semibold">Create a Personalized Story</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="product-app-muted text-xs">Child's Name</Label>
              <Input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="e.g. Emma" className="product-app-input" />
            </div>
            <div className="space-y-1.5">
              <Label className="product-app-muted text-xs">Age</Label>
              <Select value={childAge} onValueChange={setChildAge}>
                <SelectTrigger className="product-app-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((a) => <SelectItem key={a} value={String(a)}>{a} years old</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="product-app-muted text-xs">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="product-app-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brave">Bravery</SelectItem>
                  <SelectItem value="friendship">Friendship</SelectItem>
                  <SelectItem value="sleep">Bedtime / Sleep</SelectItem>
                  <SelectItem value="explore">Exploration</SelectItem>
                  <SelectItem value="growth">Growing Up</SelectItem>
                  <SelectItem value="magic">Magic & Wonder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="product-app-muted text-xs">Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger className="product-app-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="watercolor">Watercolor</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="pixar">Pixar 3D</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="picturebook">Picture Book</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="product-app-muted text-xs">Special Request (optional)</Label>
            <Input value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} placeholder="e.g. Include a pet dragon named Pickle" className="product-app-input" />
          </div>
          <Button onClick={submit} disabled={loading || !childName.trim()} className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}Create Story
          </Button>
        </CardContent>
      </Card>
      {metadata?.imagePrompt && <Card className="product-app-card border-orange-400/30 mt-3"><CardContent className="pt-4"><p className="text-xs product-app-header/70 mb-1">Image Prompt</p><p className="text-xs text-orange-100/80 italic">{metadata.imagePrompt}</p></CardContent></Card>}
      <Result result={result} loading={loading} />
    </div>
  );
}
