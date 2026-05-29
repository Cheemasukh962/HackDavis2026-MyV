/**
 * HeroStory — Featured article card.
 *
 * Prominent display of top story with:
 *  - Large hero image
 *  - Story headline and category tag
 *  - News source attribution
 *  - Tap to expand full article
 */

import styles from '../../styles/news-mode/herostory.module.css';
import { toBackgroundImage } from '../../utils/newsUtils';

export default function HeroStory({ hero, scrollOffset, onOpen }) {
  return (
    <button className={styles.hero} type="button" onClick={onOpen}>
      <div
        className={styles.heroImage}
        style={{
          backgroundImage: toBackgroundImage(hero.image),
        }}
      />

      <div className={styles.heroTopFade} aria-hidden="true" />
      <div className={styles.heroOverlay}>
        <div className={styles.heroTag}>{hero.tag}</div>
        <h2 className={styles.heroTitle}>{hero.title}</h2>
        <div className={styles.heroSource}>{hero.source}</div>
      </div>
    </button>
  );
}
