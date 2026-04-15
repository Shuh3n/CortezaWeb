import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/** Swap the <link rel="manifest"> tag to the given href and return a cleanup fn. */
function swapManifest(href: string): () => void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  const previousHref = existing?.getAttribute('href') ?? null;
  const hadExistingManifest = Boolean(existing);

  if (existing) {
    existing.setAttribute('href', href);
  } else {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = href;
    document.head.appendChild(link);
  }

  return () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (link) {
      if (hadExistingManifest && previousHref) {
        link.setAttribute('href', previousHref);
      } else {
        link.remove();
      }
    }
  };
}

/** Register the admin SW (scoped to /admin/) and return a cleanup fn. */
async function registerAdminSw(): Promise<() => void> {
  if (!('serviceWorker' in navigator)) {
    return () => undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/admin-sw.js', {
      scope: '/admin',
    });

    return () => {
      void registration.unregister();
    };
  } catch {
    // SW registration is non-critical; silently ignore in unsupported envs.
    return () => undefined;
  }
}

export function useAdminPwa(enabled: boolean) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Swap manifest + register admin SW when entering admin routes.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const restoreManifest = swapManifest('/admin-manifest.webmanifest');

    let cleanupSw: () => void = () => undefined;
    void registerAdminSw().then((fn) => {
      cleanupSw = fn;
    });

    return () => {
      restoreManifest();
      cleanupSw();
    };
  }, [enabled]);

  // Detect device + standalone mode + install prompt.
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const userAgent = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIos(iosDevice);

    const standaloneMatch = window.matchMedia('(display-mode: standalone)');
    const fromSafariStandalone =
      typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean'
        ? Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
        : false;
    setIsStandalone(standaloneMatch.matches || fromSafariStandalone);

    function handleDisplayModeChange(event: MediaQueryListEvent) {
      setIsStandalone(event.matches || fromSafariStandalone);
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
