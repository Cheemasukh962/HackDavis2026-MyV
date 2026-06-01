import { useState, useRef } from 'react';
import { Home, Siren, MessageCircle, PenLine, LifeBuoy } from 'lucide-react';
import { RedLockIcon } from './index-icons';
import styles from '../../styles/marketing/marketing.module.css';

export function StatusBar() {
  return (
    <div className={styles.screenStatus}>
      <span>9:41</span>
      <span>••• 5G ▮</span>
    </div>
  );
}

export function AppHeader({ title }) {
  return (
    <>
      <StatusBar />
      <div className={styles.appHeader}>
        <div className={styles.headerSpacer} aria-hidden="true" />
        <span>{title}</span>
        <RedLockIcon className={styles.redLock} />
      </div>
    </>
  );
}

export function BottomTabs({ active }) {
  const tabs = [
    ['Home', Home],
    ['SOS', Siren],
    ['Chat', MessageCircle],
    ['Journal', PenLine],
    ['Aid', LifeBuoy],
  ];
  return (
    <div className={styles.bottomTabs}>
      {tabs.map(([label, Icon]) => (
        <div className={`${styles.tabItem} ${active === label ? styles.activeTab : ''}`} key={label}>
          <Icon size={18} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function Phone({ children, float = false, callout }) {
  return (
    <div className={`${styles.phoneWrap} ${float ? styles.phoneWrapFloat : ''}`}>
      <div className={styles.phone}>
        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>{children}</div>
      </div>
      {callout}
    </div>
  );
}

export function MobileSlideshow({ items, renderItem, className }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(null);
  const go = (i) => setActive(Math.max(0, Math.min(i, items.length - 1)));
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) go(active + (dx > 0 ? 1 : -1));
    touchStartX.current = null;
  };
  return (
    <div className={`${styles.mobileSlideshow} ${className || ''}`}>
      <div className={styles.slideshowOuter}>
        <div
          className={styles.slideshowTrack}
          style={{ transform: `translateX(-${active * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {items.map((item, i) => (
            <div className={styles.slideshowSlide} key={i}>{renderItem(item, i)}</div>
          ))}
        </div>
      </div>
      <div className={styles.slideshowDots}>
        {items.map((_, i) => (
          <button
            key={i}
            className={`${styles.slideshowDot} ${i === active ? styles.slideshowDotActive : ''}`}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
