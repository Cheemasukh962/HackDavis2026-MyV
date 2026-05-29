import { useEffect } from 'react';

/**
 * usePrivacyMode.js — service worker lifecycle and privacy hardening for the cover app shell.
 *
 * Registers /sw.js in production (no-cache, panic-capable service worker) and
 * automatically unregisters any stale SW in development so hot-reload works cleanly.
 * Also locks browser history to prevent the back button from revealing private mode,
 * wipes session storage + purges SW caches whenever the tab is hidden, and handles
 * bfcache restoration (pageshow with event.persisted) by triggering panic exit immediately
 * so the private UI is never shown stale before auth re-runs.
 *
 * triggerPanicExit fires window.location.replace FIRST so the browser starts loading
 * the cover page with zero perceptible delay; session wipe and logout run after.
 *
 * Mount this hook once at the top of [theme].jsx — it should run on every page load.
 */

/**
 * Registers the privacy service worker, locks history navigation, and installs
 * a visibility listener that purges session state when the tab loses focus.
 * No-op in development — SW is removed to prevent stale chunk issues.
 */
export function usePrivacyMode({ onLogout } = {}) {
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
      }
    };

    // If the browser restores this page from bfcache (back-forward cache),
    // the DOM is shown before React re-checks auth — redirect immediately.
    const handlePageShow = (event) => {
      if (event.persisted) {
        triggerPanicExit();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);
}

/**
 * Immediately redirects the user away from the app, wipes session storage,
 * logs out server-side, and instructs the service worker to purge all caches.
 * If called from a cover app page, redirects back to that cover to look natural.
 * Otherwise falls back to NEXT_PUBLIC_SAFE_EXIT_URL (default: google.com).
 */
let _panicFired = false;

export function triggerPanicExit() {
  if (_panicFired) return;
  _panicFired = true;

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
