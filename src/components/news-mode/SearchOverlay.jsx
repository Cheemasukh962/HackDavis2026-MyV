import styles from '../../styles/news-mode/overlays.module.css';
import { TRENDING_SEARCHES } from './newsData';

export default function SearchOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.searchHeader}>
        <label className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden="true" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus placeholder="Search News" type="text" />
        </label>
        <button className={styles.cancelButton} type="button" onClick={onClose}>
          Cancel
        </button>
      </div>

      <div className={styles.overlayBody}>
        <h2 className={styles.overlaySectionTitle}>Trending Searches</h2>
        <div className={styles.searchList}>
          {TRENDING_SEARCHES.map((term) => (
            <button className={styles.searchTerm} type="button" key={term}>
              <span>{term}</span>
              <span className={styles.searchIcon} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
