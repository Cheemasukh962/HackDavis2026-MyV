/**
 * newsUtils.js — article normalization and CSS helpers for the Kiwi News cover.
 *
 * toBackgroundImage()     — converts a URL or gradient string into a CSS background-image value.
 * normalizeLiveArticles() — maps raw NewsAPI.ai response data into the shape
 *                           NewsShell expects (hero + sections), falling back to
 *                           static data from newsData.js when the API returns nothing.
 */

/**
 * Converts an image value to a CSS background-image string.
 * Pass-through for gradient strings; wraps URLs in url("...").
 * @param {string} image - A URL or CSS gradient string.
 * @returns {string} CSS background-image value, or '' if falsy.
 */
export function toBackgroundImage(image) {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return `url("${image.replace(/"/g, '\\"')}")`;
  return image;
}

/**
 * Maps a raw NewsAPI.ai response into the shape NewsShell expects.
 * Returns null if the data is empty or unusable, so the caller can fall back to static data.
 *
 * @param {string} tab - Active tab id ('today' | 'world' | 'sports').
 * @param {Object} data - Raw API response with an `articles` array.
 * @param {Object} fallbacks
 * @param {Object} fallbacks.heroStories - Static hero fallbacks keyed by tab.
 * @param {Object} fallbacks.storySections - Static section fallbacks keyed by tab.
 * @param {Object} fallbacks.liveSectionTitles - Default section title per tab.
 * @param {string[]} fallbacks.thumbnailFallbacks - Gradient fallbacks for missing images.
 * @returns {{ hero: Object, sections: Object[], filters: string[]|null }|null}
 */
export function normalizeLiveArticles(tab, data, { heroStories, storySections, liveSectionTitles, thumbnailFallbacks }) {
  if (!Array.isArray(data?.articles) || data.articles.length === 0) return null;

  const [lead, ...rest] = data.articles;
  if (!lead?.headline) return null;

  const fallbackHero = heroStories[tab];
  const fallbackStories = storySections[tab]?.[0]?.stories || [];
  const stories = rest
    .filter((a) => a?.headline)
    .map((a, i) => ({
      ...a,
      color: fallbackStories[i % fallbackStories.length]?.color
        || thumbnailFallbacks[i % thumbnailFallbacks.length],
    }));

  if (stories.length === 0) return null;

  // Group stories into sections by their top category so filter chips are backed by real content.
  // Stories with no category go into the default section for this tab.
  const defaultTitle = liveSectionTitles[tab] || 'Top Stories';
  const sectionMap = {};
  stories.forEach((story) => {
    const title = story.categories?.[0] || defaultTitle;
    if (!sectionMap[title]) sectionMap[title] = [];
    sectionMap[title].push(story);
  });

  // Always put the default section first
  const orderedTitles = [
    defaultTitle,
    ...Object.keys(sectionMap).filter((t) => t !== defaultTitle),
  ].filter((t) => sectionMap[t]);

  const sections = orderedTitles.map((title) => ({ title, stories: sectionMap[title] }));
  const filters = sections.length > 1 ? ['All', ...orderedTitles] : null;

  return {
    hero: {
      ...lead,
      tag: data.tag || fallbackHero.tag,
      title: lead.headline,
      source: lead.source || fallbackHero.source,
      image: lead.image || fallbackHero.image,
    },
    sections,
    filters,
  };
}
