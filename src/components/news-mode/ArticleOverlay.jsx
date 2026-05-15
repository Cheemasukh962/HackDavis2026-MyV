import styles from '../../styles/news-mode/overlays.module.css';
import OverlayHeader from './OverlayHeader';
import { toBackgroundImage } from '../../utils/newsUtils';

export default function ArticleOverlay({ article, onClose }) {
  const image = article.image || article.color;
  const articleText = article.content || article.description || 'More details are developing. Check back later for updates on this story.';
  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <article className={`${styles.overlay} ${styles.articleOverlay}`}>
      <OverlayHeader title="Story" onClose={onClose} />

      <div className={styles.articleBody}>
        {image && (
          <div
            className={styles.articleImage}
            style={{ backgroundImage: toBackgroundImage(image) }}
            aria-hidden="true"
          />
        )}

        <div className={styles.articleMeta}>
          <span>{article.source || 'Daily News'}</span>
          {published && <span>{published}</span>}
        </div>

        <h1 className={styles.articleTitle}>{article.title || article.headline}</h1>

        {article.description && (
          <p className={styles.articleDescription}>{article.description}</p>
        )}

        <p className={styles.articleText}>{articleText}</p>
      </div>
    </article>
  );
}
