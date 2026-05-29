/**
 * sourceBrands.js — publisher brand map for the Kiwi News cover.
 *
 * SOURCE_BRANDS maps publisher names to their brand color and logo.dev domain.
 * getSourceBrand(source) does a case-insensitive lookup and returns the match
 * or an empty object if the publisher isn't in the map.
 *
 * Used by StorySection.jsx (story cards) and ArticleOverlay.jsx (article header)
 * to render color-coded source names and favicon icons consistently.
 */

export const SOURCE_BRANDS = {
  'Reuters':                 { color: '#FF6600', domain: 'reuters.com' },
  'BBC News':                { color: '#BB1919', domain: 'bbc.co.uk' },
  'BBC Sport':               { color: '#BB1919', domain: 'bbc.co.uk' },
  'BBC':                     { color: '#BB1919', domain: 'bbc.co.uk' },
  'Associated Press':        { color: '#C8102E', domain: 'apnews.com' },
  'AP News':                 { color: '#C8102E', domain: 'apnews.com' },
  'AP':                      { color: '#C8102E', domain: 'apnews.com' },
  'The Guardian':            { color: '#052962', domain: 'theguardian.com' },
  'The New York Times':      { color: '#000000', domain: 'nytimes.com' },
  'ESPN':                    { color: '#CC0000', domain: 'espn.com' },
  'ESPN FC':                 { color: '#CC0000', domain: 'espn.com' },
  'The Athletic':            { color: '#000000', domain: 'theathletic.com' },
  'TIME':                    { color: '#CC0000', domain: 'time.com' },
  'The Wall Street Journal': { color: '#000000', domain: 'wsj.com' },
  'Bloomberg':               { color: '#000000', domain: 'bloomberg.com' },
  'CNN':                     { color: '#CC0000', domain: 'cnn.com' },
  'Fox Sports':              { color: '#003DA5', domain: 'foxsports.com' },
  'Politico':                { color: '#CC0000', domain: 'politico.com' },
  'NPR':                     { color: '#1E4B8E', domain: 'npr.org' },
  'Al Jazeera':              { color: '#009E4E', domain: 'aljazeera.com' },
  'Forbes':                  { color: '#000000', domain: 'forbes.com' },
  'Wired':                   { color: '#000000', domain: 'wired.com' },
  'TechCrunch':              { color: '#0A8C17', domain: 'techcrunch.com' },
  'The Verge':               { color: '#FA4522', domain: 'theverge.com' },
  'Bleacher Report':         { color: '#000000', domain: 'bleacherreport.com' },
  'Sports Illustrated':      { color: '#CC0000', domain: 'si.com' },
  'Yahoo Sports':            { color: '#6001D2', domain: 'sports.yahoo.com' },
  'Foreign Policy':          { color: '#1A1A1A', domain: 'foreignpolicy.com' },
  'The Economist':           { color: '#CC0000', domain: 'economist.com' },
  'National Geographic':     { color: '#FFCC00', domain: 'nationalgeographic.com' },
  'The Atlantic':            { color: '#1A1A1A', domain: 'theatlantic.com' },
  'Sky News':                { color: '#E8003D', domain: 'skynews.com' },
  'Sky Sports':              { color: '#0057B8', domain: 'skysports.com' },
  'Financial Times':         { color: '#C9A96E', domain: 'ft.com' },
  'Washington Post':         { color: '#231F20', domain: 'washingtonpost.com' },
  'Axios':                   { color: '#FF4136', domain: 'axios.com' },
  'CBS Sports':              { color: '#003087', domain: 'cbssports.com' },
  'NBC Sports':              { color: '#0B4EA2', domain: 'nbcsports.com' },
};

/**
 * Looks up a publisher's brand by name using case-insensitive partial matching.
 * Returns the matching { color, domain } entry, or {} if not found.
 * Callers should treat missing color/domain as optional — not all sources are in the map.
 *
 * @param {string} source - Publisher name from the article data.
 * @returns {{ color?: string, domain?: string }}
 */
export function getSourceBrand(source) {
  if (!source) return {};
  const key = Object.keys(SOURCE_BRANDS).find(
    (k) => source.toLowerCase().includes(k.toLowerCase())
  );
  return key ? SOURCE_BRANDS[key] : {};
}
