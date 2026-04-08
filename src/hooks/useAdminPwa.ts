import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useAdminPwa(enabled: boolean) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const userAgent = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIos(iosDevice);

    const standaloneMatch = window.matchMedia('(display-mode: standalone)');
    const fromSafariStandalone = typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean'
      ? Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
      : false;
    setIsStandalone(standaloneMatch.matches || fromSafariStandalone);

    function handleDisplayModeChange(event: MediaQueryListEvent) {
      const nextStandalone = event.matches;
      setIsStandalone(nextStandalone || fromSafariStandalone);
    }

    function handleBeforeInstallPrompt(event: Event) {
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    standaloneMatch.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      standaloneMatch.removeEventListener('change', handleDisplayModeChange);
    };
  }, [enabled]);

  const canInstallPrompt = useMemo(() => deferredPrompt !== null, [deferredPrompt]);
  const canShowIosGuide = useMemo(() => isIos && !isStandalone, [isIos, isStandalone]);
  const canInstall = useMemo(() => !isStandalone, [isStandalone]);

  async function installApp() {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice.outcome === 'accepted';
  }

  return {
    canInstall,
    canInstallPrompt,
    canShowIosGuide,
    isStandalone,
    isIos,
    installApp,
  };
}
