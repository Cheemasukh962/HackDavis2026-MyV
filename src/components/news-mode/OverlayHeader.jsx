import styles from '../../styles/news-mode/overlays.module.css';

export default function OverlayHeader({ title, onClose }) {
  return (
    <div className={styles.overlayHeader}>
      <h2>{title}</h2>
      <button className={styles.closeButton} type="button" aria-label={`Close ${title}`} onClick={onClose}>
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
