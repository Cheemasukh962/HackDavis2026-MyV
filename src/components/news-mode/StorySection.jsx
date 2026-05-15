import styles from '../../styles/news-mode/storysection.module.css';
import { toBackgroundImage } from '../../utils/newsUtils';

function ThumbnailPattern({ index }) {
  const pattern = index % 4;
  return (
    <svg className={styles.thumbnailSvg} viewBox="0 0 56 56" focusable="false">
      {pattern === 0 && (<>
        <circle cx="28" cy="20" r="8" />
        <circle cx="20" cy="35" r="5" />
        <circle cx="36" cy="35" r="5" />
      </>)}
      {pattern === 1 && (<>
        <rect x="12" y="16" width="32" height="4" rx="2" />
        <rect x="12" y="25" width="24" height="3" rx="1.5" />
        <rect x="12" y="33" width="28" height="3" rx="1.5" />
      </>)}
      {pattern === 2 && (<>
        <circle cx="28" cy="18" r="7" />
        <rect x="16" y="31" width="24" height="2" rx="1" />
        <rect x="16" y="37" width="18" height="2" rx="1" />
      </>)}
      {pattern === 3 && (<>
        <rect x="10" y="12" width="36" height="20" rx="3" />
        <rect x="14" y="37" width="28" height="2" rx="1" />
        <rect x="14" y="43" width="20" height="2" rx="1" />
      </>)}
    </svg>
  );
}

function StoryRow({ story, index, onOpen }) {
  const bg = story.image ? toBackgroundImage(story.image) : story.color;
  return (
    <button className={styles.storyRow} type="button" onClick={onOpen}>
      <span
        className={`${styles.thumbnail} ${story.image ? styles.thumbnailImage : ''}`}
        style={{ background: bg }}
        aria-hidden="true"
      >
        {!story.image && <ThumbnailPattern index={index} />}
      </span>
      <span className={styles.storyCopy}>
        <span className={styles.storySource}>{story.source}</span>
        <span className={styles.storyHeadline}>{story.headline}</span>
      </span>
    </button>
  );
}

export default function StorySection({ section, onOpenStory }) {
  return (
    <section className={styles.storySection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <span className={styles.sectionLabel}>News+</span>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
        </div>
        <button className={styles.seeAllBtn} type="button">See All</button>
      </div>
      {section.stories.map((story, index) => (
        <StoryRow
          key={`${section.title}-${story.headline}`}
          story={story}
          index={index}
          onOpen={() => onOpenStory(story)}
        />
      ))}
    </section>
  );
}
