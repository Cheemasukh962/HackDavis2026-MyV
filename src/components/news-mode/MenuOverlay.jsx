import styles from '../../styles/news-mode/overlays.module.css';
import OverlayHeader from './OverlayHeader';

const MENU_ITEMS = [
  ['Notifications',       '3'],
  ['Saved Stories',        null],
  ['Downloaded Issues',    null],
  ['Shared with You',     '1'],
  ['Settings and Privacy', null],
];

export default function MenuOverlay({ onClose }) {
  return (
    <div className={`${styles.overlay} ${styles.menuOverlay}`}>
      <OverlayHeader title="Menu" onClose={onClose} />

      <div className={styles.overlayBody}>
        {MENU_ITEMS.map(([label, badge]) => (
          <button className={styles.menuItem} type="button" key={label}>
            <span className={styles.menuItemIcon} aria-hidden="true" />
            <span>{label}</span>
            {badge && <span className={styles.badge}>{badge}</span>}
          </button>
        ))}
      </div>

      <div className={styles.overlayFooter}>Daily News Reader</div>
    </div>
  );
}
