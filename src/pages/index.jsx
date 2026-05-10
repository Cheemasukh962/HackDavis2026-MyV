import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Marketing.module.css';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safe Harbor — Everyday Apps</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Private, everyday utility apps." />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>Safe Harbor</div>
          <nav className={styles.nav}><Link href="/downloads" className={styles.navLink}>Downloads</Link></nav>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              <h1 className={styles.title}>Safety in plain sight</h1>
              <p className={styles.subtitle}>Safe Harbor hides essential support tools inside everyday utilities. Discreet, private, and built for survivors.</p>
              <div className={styles.ctaRow}>
                <Link href="/downloads" className={styles.primary}>Download apps</Link>
                <a href="#learn" className={styles.secondary}>Learn more</a>
              </div>
            </div>
            <div className={styles.heroRight}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/resources/images/logos/other_help_logo.png" alt="other help" className={styles.logoImg} />
            </div>
          </section>

          <section id="learn" className={styles.info}>
            <h2 className={styles.h2}>What we provide</h2>
            <ul className={styles.bullets}>
              <li>Zero-trace journal and secure attachments</li>
              <li>Anonymous, ephemeral chat rooms</li>
              <li>Quick-exit and decoy interfaces</li>
            </ul>
          </section>
        </main>

        <footer className={styles.footer}>
          <small>Safe and private. No data collected.</small>
        </footer>
      </div>
    </>
  );
}
