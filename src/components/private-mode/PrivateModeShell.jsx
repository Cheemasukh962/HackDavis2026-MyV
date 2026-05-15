import { useMemo, useState } from 'react';
import { BookLock, Home, LifeBuoy, MessageCircle, Siren } from 'lucide-react';

function RedLockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M7 11V8a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="4" y="11" width="16" height="13" rx="3" fill="currentColor" />
      <circle cx="12" cy="17" r="2" fill="white" />
      <rect x="11" y="18" width="2" height="3" rx="1" fill="white" />
    </svg>
  );
}
import HomePanel from './HomePanel';
import SosPanel from './SosPanel';
import ChatPanel from './ChatPanel';
import AidPanel from './AidPanel';
import JournalPanel from './JournalPanel';
import { triggerPanicExit } from '../../hooks/usePrivacyMode';
import styles from '../../styles/private-mode/shell.module.css';

const TABS = [
  { id: 'home', title: 'Home', label: 'Home', Icon: Home },
  { id: 'sos', title: 'SOS', label: 'SOS', Icon: Siren },
  { id: 'chat', title: 'Chat', label: 'Chat', Icon: MessageCircle },
  { id: 'journal', title: 'Journal', label: 'Journal', Icon: BookLock },
  { id: 'aid', title: 'Resources', label: 'Aid', Icon: LifeBuoy },
];

export default function PrivateModeShell({ displayName, sosEnabled = false, onBackToApp, appName }) {
  const [activeTab, setActiveTab] = useState('home');

  const activeTitle = useMemo(
    () => TABS.find((tab) => tab.id === activeTab)?.title || 'Home',
    [activeTab]
  );

  return (
    <section className={styles.page} aria-label="Private safety tools">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerSpacer} aria-hidden="true" />
          <div className={styles.headerTitle}>{activeTitle}</div>
          <button
            type="button"
            className={styles.exitButton}
            aria-label="Quick exit"
            title="Quick exit"
            onClick={triggerPanicExit}
          >
            <RedLockIcon className={styles.exitIcon} />
          </button>
        </header>

        <main className={styles.content}>
          <Panel active={activeTab === 'home'}>
            <HomePanel onNavigate={setActiveTab} active={activeTab === 'home'} onBackToApp={onBackToApp} appName={appName} />
          </Panel>
          <Panel active={activeTab === 'sos'}>
            <SosPanel enabled={sosEnabled} />
          </Panel>
          <Panel active={activeTab === 'chat'}>
            <ChatPanel displayName={displayName} />
          </Panel>
          <Panel active={activeTab === 'journal'}>
            <JournalPanel />
          </Panel>
          <Panel active={activeTab === 'aid'}>
            <AidPanel />
          </Panel>
        </main>

        <nav className={styles.tabBar} aria-label="Private mode sections">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                className={`${styles.tabButton} ${active ? styles.tabButtonActive : ''}`}
                aria-pressed={active}
                onClick={() => setActiveTab(id)}
              >
                <Icon className={styles.tabIcon} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

function Panel({ active, children }) {
  return (
    <div
      className={`${styles.panel} ${active ? styles.panelActive : styles.panelHidden}`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}
