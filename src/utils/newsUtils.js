export function toBackgroundImage(image) {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return `url("${image.replace(/"/g, '\\"')}")`;
  return image;
}

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

  return {
    hero: {
      ...lead,
      tag: data.tag || fallbackHero.tag,
      title: lead.headline,
      source: lead.source || fallbackHero.source,
      image: lead.image || fallbackHero.image,
    },
    sections: [{ title: liveSectionTitles[tab] || 'Top Stories', stories }],
  };
}
