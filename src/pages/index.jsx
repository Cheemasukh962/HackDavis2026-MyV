import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Landing.module.css';

/*
 * Landing page — describes the platform and offers 3 disguised PWA installs.
 *
 * UI PLACEHOLDER: This markup will be replaced with the Figma/Open Design
 * handoff. The class names in Landing.module.css map 1-to-1 with the design
 * tokens so swapping styles requires only editing the CSS file.
 */

const APPS = [
  {
    theme: 'calculator',
    name: 'Calculator Pro',
    description: 'A clean, fast calculator for everyday math.',
    icon: '/resources/images/logos/calculator_icon.png',
  },
  {
    theme: 'news',
    name: 'Daily News Reader',
    description: 'Curated headlines from trusted sources, updated live.',
    icon: '/resources/images/logos/news_icon.png',
  },
  {
    theme: 'weather',
    name: 'Weather Now',
    description: 'Real-time forecasts and alerts for your location.',
    icon: '/resources/images/logos/weather_icon.png',
  },
];

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safe Harbor — Everyday Apps</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Private, everyday utility apps." />
        {/* Allow indexing of the landing page — it looks like a normal app-download site */}
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <span className={styles.logo}>Everyday Apps</span>
        </header>

        <main className={styles.main}>
          {/* Hero */}
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>Apps for every day.</h1>
            <p className={styles.heroSubtitle}>
              Install directly to your home screen. No account required to get started.
              Works on Android and iOS.
            </p>
          </section>

          {/* Download cards */}
          <section aria-label="Available apps">
            <p className={styles.appsHeading}>Choose an app</p>
            <div className={styles.appGrid}>
              {APPS.map((app) => (
                <Link
                  key={app.theme}
                  href={`/app/${app.theme}`}
                  className={styles.appCard}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.icon}
                    alt={`${app.name} icon`}
                    className={styles.appIcon}
                  />
                  <div className={styles.appInfo}>
                    <p className={styles.appName}>{app.name}</p>
                    <p className={styles.appDesc}>{app.description}</p>
                  </div>
                  <span className={styles.installChip} aria-hidden="true">
                    Install
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>Safe and private. No data collected.</p>
        </footer>
      </div>
    </>
  );
}
