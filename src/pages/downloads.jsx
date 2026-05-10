import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Landing.module.css';

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

export default function Downloads() {
  return (
    <>
      <Head>
        <title>Download Safe Harbor Apps</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>← Back</Link>
          <span className={styles.logo}>Download</span>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>Get Started</h1>
            <p className={styles.heroSubtitle}>Choose an app to install. Each app hides your real support tools.</p>
          </section>

          <section aria-label="Available apps">
            <p className={styles.appsHeading}>Choose an app</p>
            <div className={styles.appGrid}>
              {APPS.map((app) => (
                <Link key={app.theme} href={`/app/${app.theme}`} className={styles.appCard}>
                  <img src={app.icon} alt={`${app.name} icon`} className={styles.appIcon} />
                  <div className={styles.appInfo}>
                    <p className={styles.appName}>{app.name}</p>
                    <p className={styles.appDesc}>{app.description}</p>
                  </div>
                  <span className={styles.installChip}>Install</span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>Safe and private. Your data stays with you.</p>
        </footer>
      </div>
    </>
  );
}
