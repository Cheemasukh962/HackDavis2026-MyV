import styles from '../../styles/news-mode/filterrow.module.css';

export default function FilterRow({ filters, active, onSelect }) {
  return (
    <div className={styles.filterRow} role="toolbar" aria-label="Filter stories">
      <div className={styles.filterScroll}>
        {filters.map((f) => (
          <button
            key={f}
            className={`${styles.chip} ${active === f ? styles.chipActive : ''}`}
            type="button"
            onClick={() => onSelect(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
