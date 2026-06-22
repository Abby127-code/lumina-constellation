'use client';
// ✦ Lumina Caregiver — AI Caregiver Support Companion
// Independent Product App — pink/rose theme (not medical advice)
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Loader2, Sparkles, AlertCircle } from 'lucide-react';
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
      toast({ title: '💗 Support Ready' });
    } catch (e: any) { toast({ title: 'Error', description: e?.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };
  return { loading, result, metadata, call };
}

function Result({ result, loading }: { result: string; loading: boolean }) {
  if (loading) return <Card className="product-app-card border-pink-400/30 mt-4"><CardContent className="py-12 flex flex-col items-center gap-3"><Sparkles className="w-10 h-10 text-pink-300 animate-float" /><p className="text-pink-200/80 text-sm">Preparing support...</p></CardContent></Card>;
  if (!result) return null;
  return <Card className="product-app-card border-pink-400/30 mt-4 animate-glow-pulse"><CardContent className="pt-6"><div className="text-pink-50/90 leading-relaxed space-y-3 text-sm sm:text-base"><ReactMarkdown components={{ h1: ({ children }) => <h1 className="text-2xl font-bold text-pink-300 mt-4 mb-2">{children}</h1>, h2: ({ children }) => <h2 className="text-xl font-semibold text-rose-200 mt-4 mb-2">{children}</h2>, h3: ({ children }) => <h3 className="text-base font-semibold text-rose-100 mt-3 mb-1">{children}</h3>, p: ({ children }) => <p className="text-pink-50/85 leading-relaxed">{children}</p>, ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-pink-50/85">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-pink-50/85">{children}</ol>, strong: ({ children }) => <strong className="text-rose-200 font-semibold">{children}</strong>, blockquote: ({ children }) => <blockquote className="border-l-2 border-pink-400/50 pl-4 italic text-pink-200/70 my-2">{children}</blockquote> }}>{result}</ReactMarkdown></div></CardContent></Card>;
}

export function CaregiverApp() {
  const { loading, result, metadata, call } = useAI();
  const [careRecipient, setCareRecipient] = useState('elder');
  const [careType, setCareType] = useState('general');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('ok');
  const [triedAlready, setTriedAlready] = useState('');

  const submit = () => {
    if (!description.trim()) return;
    call('caregiver', { careRecipient, careType, description, mood, triedAlready });
  };

  return (
    <div className="space-y-4">
      <Card className="product-app-card border-pink-400/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-pink-200">
            <Heart className="w-5 h-5 text-pink-300" />
            <h2 className="text-lg font-semibold">Caregiver Support</h2>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-pink-500/10 border border-pink-400/20">
            <AlertCircle className="w-4 h-4 text-pink-300 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-pink-100/80">This tool provides general information only, not medical diagnosis. Seek immediate medical attention for emergencies.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-pink-200/80 text-xs">Care Recipient</Label>
              <Select value={careRecipient} onValueChange={setCareRecipient}>
                <SelectTrigger className="bg-white/5 border-pink-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="elder">Elder</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-pink-200/80 text-xs">Care Type</Label>
              <Select value={careType} onValueChange={setCareType}>
                <SelectTrigger className="bg-white/5 border-pink-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="symptom">Symptom</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-pink-200/80 text-xs">Describe the Situation</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's happening? Be specific about what you observed, when it started, and any context..." className="bg-white/5 border-pink-400/30 text-white min-h-[120px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-pink-200/80 text-xs">Your Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-white/5 border-pink-400/30 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="stressed">Stressed</SelectItem>
                  <SelectItem value="exhausted">Exhausted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-pink-200/80 text-xs">What You've Already Tried (optional)</Label>
              <Input value={triedAlready} onChange={(e) => setTriedAlready(e.target.value)} placeholder="e.g. Offered water, called doctor" className="bg-white/5 border-pink-400/30 text-white" />
            </div>
          </div>
          <Button onClick={submit} disabled={loading || !description.trim()} className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}Get Support
          </Button>
        </CardContent>
      </Card>
      <Result result={result} loading={loading} />
    </div>
  );
}
