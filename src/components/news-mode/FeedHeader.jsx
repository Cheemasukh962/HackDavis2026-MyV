import styles from '../../styles/news-mode/feedheader.module.css';

export default function FeedHeader({ title }) {
  const isToday = title === 'For You';

  if (isToday) {
    return (
      <div className={styles.feedHeader}>
        <div className={styles.feedHeaderRow}>
          <div>
            <p className={styles.feedHeaderEyebrow}>
              <span className={styles.kiwiIcon}>🥝</span>{' '}News+
            </p>
            <h1 className={styles.feedHeaderTitle}>Discover</h1>
          </div>
          <img
            src="/resources/images/logos/news_icon_selected.png"
            alt=""
            aria-hidden="true"
            className={styles.feedHeaderLogo}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedHeader}>
      <h1 className={styles.feedHeaderTitleStandalone}>{title}</h1>
    </div>
  );
}
