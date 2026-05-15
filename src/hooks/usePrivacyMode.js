import { useEffect } from 'react';

/**
 * usePrivacyMode
 *
 * Production keeps the privacy service worker enabled. Development removes it
 * so localhost never gets stuck serving stale/blank Next.js chunks.
 */
export function usePrivacyMode() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((reg) => reg.unregister())))
        .then(() => purgeBrowserCaches())
        .catch((err) => console.debug('[SW] Dev cleanup failed', err));
      return undefined;
    }

    let active = true;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => console.debug('[SW] Registered', reg.scope))
      .catch((err) => console.error('[SW] Registration failed', err));

    const onMessage = (event) => {
      if (active && event.data?.type === 'PANIC_REDIRECT') {
        triggerPanicExit();
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', window.location.href);

    const lockHistory = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', lockHistory);
    return () => window.removeEventListener('popstate', lockHistory);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.clear();
        postToSW({ type: 'PURGE_CACHE' });
        navigator.sendBeacon('/api/auth/logout');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
}

export function triggerPanicExit() {
  // If we're inside a cover app (/app/calculator|news|weather), go back to that
  // cover page — it looks like a normal app launch to anyone watching.
  // Otherwise fall back to the configured safe-exit URL.
  const coverMatch =
    window.location.pathname.match(/^\/app\/(calculator|news|weather)/) ||
    decodeURIComponent(window.location.search).match(/\/app\/(calculator|news|weather)/);
  const safeUrl = coverMatch
    ? `/app/${coverMatch[1]}`
    : (process.env.NEXT_PUBLIC_SAFE_EXIT_URL || 'https://www.google.com');

  sessionStorage.clear();
  postToSW({ type: 'PANIC' });

  fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => {});

  window.location.replace(safeUrl);
}

function postToSW(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

function purgeBrowserCaches() {
  if (!('caches' in window)) return Promise.resolve();
  return caches
    .keys()
    .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
}
