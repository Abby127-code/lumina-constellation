'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      const t = setTimeout(() => setInstalled(true), 0);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  if (installed || !show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in slide-in-from-bottom">
      <div className="glass-card-dark border-gold/40 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gold text-sm font-semibold">Install Lumina Constellation</p>
            <p className="text-purple-200/60 text-xs mt-0.5">Add to your home screen for a native app experience</p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={handleInstall} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs">
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShow(false)} className="text-purple-200/50 text-xs">
                Later
              </Button>
            </div>
          </div>
          <button onClick={() => setShow(false)} className="text-purple-200/40 hover:text-purple-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
