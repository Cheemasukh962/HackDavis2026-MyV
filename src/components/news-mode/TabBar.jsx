import styles from '../../styles/news-mode/tabbar.module.css';
import { TABS } from './newsData';

function TabIcon({ id, active }) {
  if (id === 'today') return (
    <img
      src={active
        ? '/resources/images/logos/news_icon_selected.png'
        : '/resources/images/logos/news_icon_unselected.png'}
      width={26}
      height={26}
      alt=""
      aria-hidden="true"
      style={{ display: 'block', mixBlendMode: 'multiply', transform: 'scale(1.55)' }}
    />
  );
  if (id === 'world') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9.5" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" />
    </svg>
  );
  if (id === 'sports') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 21h8M12 17v4" />
      <path d="M6 3h12v8a6 6 0 0 1-12 0V3z" />
      <path d="M6 7H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
      <path d="M18 7h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
    </svg>
  );
  return null;
}

export default function TabBar({ activeTab, collapsed, onSearch, onTabChange }) {
  return (
    <nav
      className={`${styles.tabBar} ${collapsed ? styles.tabBarCollapsed : ''}`}
      aria-label="News sections"
    >
      <div className={styles.tabsGroup}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${active ? styles.tabButtonActive : ''}`}
              type="button"
              aria-pressed={active}
              onClick={() => onTabChange(tab.id)}
            >
              <span className={styles.tabIcon}><TabIcon id={tab.id} active={active} /></span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <button
        className={styles.searchCircleBtn}
        type="button"
        aria-label="Search news"
        onClick={onSearch}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="7" />
          <line x1="16" y1="16" x2="21" y2="21" />
        </svg>
      </button>
    </nav>
  );
}
