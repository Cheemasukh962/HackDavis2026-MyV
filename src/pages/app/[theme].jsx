import Head from 'next/head';
import { useEffect, useState } from 'react';
import PanicExit from '../../components/PanicExit';
import { usePrivacyMode } from '../../hooks/usePrivacyMode';

// Theme metadata lives here, not in the manifest files, to keep one source of truth.
const THEMES = {
  calculator: {
    appName: 'Calculator Pro',
    manifestUrl: '/manifests/calculator.json',
    themeColor: '#1a1a2e',
    appleTouchIcon: '/resources/images/logos/calculator_icon_192x192.png',
  },
  news: {
    appName: 'Daily News Reader',
    manifestUrl: '/manifests/news.json',
    themeColor: '#0d1b2a',
    appleTouchIcon: '/resources/images/logos/news_icon_192x192.png',
  },
  weather: {
    appName: 'Weather Now',
    manifestUrl: '/manifests/weather.json',
    themeColor: '#0c2340',
    appleTouchIcon: '/resources/images/logos/weather_icon_192x192.png',
  },
};

export default function AppShell({ appName, manifestUrl, themeColor, appleTouchIcon }) {
  usePrivacyMode();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  // Capture the browser's install prompt so we can trigger it on demand.
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setInstallPrompt(null);
    });
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <>
      <Head>
        <title>{appName}</title>
        <meta name="application-name" content={appName} />
        <meta name="theme-color" content={themeColor} />

        {/* PWA manifest — unique per theme so Chrome installs them as separate apps */}
        <link rel="manifest" href={manifestUrl} />

        {/* iOS home screen support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={appName} />
        <link rel="apple-touch-icon" href={appleTouchIcon} />

        {/* Zero-trace: prevent indexing and referrer leakage */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />

        {/* Prevent iOS from auto-linking phone numbers, addresses, dates */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />

        {/* Disable autocomplete at the document level (best-effort) */}
        <meta httpEquiv="autocomplete" content="off" />
      </Head>

      <main style={{ minHeight: '100dvh', background: themeColor }}>
        {/* ── Install banner (only shown when browser offers a prompt) ── */}
        {installPrompt && !installed && (
          <div style={styles.installBanner}>
            <span>Add {appName} to your home screen for the best experience.</span>
            <button onClick={handleInstall} style={styles.installBtn}>
              Install
            </button>
          </div>
        )}

        {/* ── App content placeholder ── */}
        {/* Replace this section with your real feature components */}
        <div style={styles.placeholder}>
          <p style={styles.placeholderText}>{appName}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            App content renders here.
          </p>
        </div>
      </main>

      {/* Always mounted — Escape / triple-tap / corner button */}
      <PanicExit />
    </>
  );
}

// ── Data fetching ─────────────────────────────────────────────────────────────

export function getStaticPaths() {
  return {
    paths: Object.keys(THEMES).map((theme) => ({ params: { theme } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const theme = THEMES[params.theme];
  if (!theme) return { notFound: true };
  return { props: theme };
}

// ── Minimal styles ────────────────────────────────────────────────────────────

const styles = {
  installBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '14px',
  },
  installBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    gap: '8px',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '18px',
    margin: 0,
  },
};
