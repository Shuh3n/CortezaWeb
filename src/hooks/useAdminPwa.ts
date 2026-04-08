import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function upsertHeadTag<K extends keyof HTMLElementTagNameMap>(selector: string, factory: () => HTMLElementTagNameMap[K]) {
  let element = document.head.querySelector(selector) as HTMLElementTagNameMap[K] | null;

  if (!element) {
    element = factory();
    document.head.appendChild(element);
  }

  return element;
}

export function useAdminPwa(enabled: boolean) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const previousTitle = document.title;
    document.title = 'Panel administrativo | Fundación Corteza Terrestre';

    const manifestLink = upsertHeadTag<HTMLLinkElement>('link[rel="manifest"]', () => document.createElement('link'));
    manifestLink.rel = 'manifest';
    manifestLink.href = '/admin-manifest.webmanifest';

    const themeMeta = upsertHeadTag<HTMLMetaElement>('meta[name="theme-color"]', () => document.createElement('meta'));
    themeMeta.name = 'theme-color';
    themeMeta.content = '#2d5a27';

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' });
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
      setIsStandalone(event.matches || fromSafariStandalone);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    standaloneMatch.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      standaloneMatch.removeEventListener('change', handleDisplayModeChange);
      document.title = previousTitle;
    };
  }, [enabled]);

  const canInstallPrompt = useMemo(() => deferredPrompt !== null, [deferredPrompt]);
  const canShowIosGuide = useMemo(() => isIos && !isStandalone, [isIos, isStandalone]);
  const canInstall = useMemo(() => canInstallPrompt || canShowIosGuide, [canInstallPrompt, canShowIosGuide]);

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
