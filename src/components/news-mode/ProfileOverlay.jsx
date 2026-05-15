import styles from '../../styles/news-mode/overlays.module.css';
import OverlayHeader from './OverlayHeader';

function Stat({ value, label }) {
  return (
    <div className={styles.stat}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function ProfileOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      <OverlayHeader title="Profile" onClose={onClose} />

      <div className={styles.profileBlock}>
        <div className={styles.profileAvatar} aria-hidden="true" />
        <div className={styles.profileName}>John Appleseed</div>
        <div className={styles.profileEmail}>john.appleseed@example.com</div>
      </div>

      <div className={styles.statsGrid}>
        <Stat value="1,247" label="Stories Read" />
        <Stat value="89"    label="Saved"         />
        <Stat value="24"    label="Following"      />
      </div>

      <div className={styles.overlayBody}>
        <h2 className={styles.overlaySectionTitle}>Quick Actions</h2>
        {['Reading History', 'Favorites', 'Downloads'].map((label) => (
          <button className={styles.menuItem} type="button" key={label}>
            <span className={styles.menuItemIcon} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
