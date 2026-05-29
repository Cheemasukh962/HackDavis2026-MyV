const { requireAuth } = require('../../../lib/requireAuth');
const { applySecurityHeaders } = require('../../../middleware/securityHeaders');
const config = require('../../../config/config');
const { createChatCompletion } = require('../../../lib/openrouter');

const MAPBOX_SEARCH_URL = 'https://api.mapbox.com/search/searchbox/v1/forward';
const SEARCH_RADIUS_TIERS_MILES = [20, 40, 75];
const CATEGORY_CANDIDATE_LIMIT = 12;
const FINAL_CATEGORY_LIMIT = 3;
const FALLBACK_QUERY_LIMIT = 5;
const MAPBOX_BATCH_SIZE = 3;
const MAPBOX_BATCH_DELAY_MS = 150;

const AI_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
];

const RESOURCE_QUERIES = {
  shelter: [
    'homeless shelter',
    'emergency shelter',
    'women shelter',
    'crisis center',
    'transitional housing',
    'domestic violence shelter',
    'family shelter',
  ],
  legal: [
    'legal aid',
    'domestic violence legal help',
    'family law assistance',
    'restraining order help',
    'victim legal services',
    'court self help',
    'law clinic',
    'pro bono legal services',
  ],
  financial: [
    'financial assistance',
    'emergency assistance',
    'community assistance',
    'family resource center',
    'human assistance',
    'social services',
    'food bank',
    'benefits assistance',
  ],
  counseling: [
    'trauma counseling',
    'domestic violence counseling',
    'mental health clinic',
    'crisis counseling',
    'family counseling',
    'therapy',
    'behavioral health',
    'community counseling',
  ],
};

function parseCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function radians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceMiles(fromLat, fromLng, toLat, toLng) {
  const earthRadiusMiles = 3958.8;
  const dLat = radians(toLat - fromLat);
  const dLng = radians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(fromLat)) *
      Math.cos(radians(toLat)) *
      Math.sin(dLng / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bboxAround(origin, radiusMiles) {
  const latitudeDelta = radiusMiles / 69;
  const longitudeScale = 69 * Math.cos(radians(origin.latitude));
  const longitudeDelta = radiusMiles / (Math.abs(longitudeScale) || 1);

  return [
    origin.longitude - longitudeDelta,
    origin.latitude - latitudeDelta,
    origin.longitude + longitudeDelta,
    origin.latitude + latitudeDelta,
  ].map((value) => value.toFixed(6)).join(',');
}

function compact(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function firstValue(object, keys) {
  if (!object || typeof object !== 'object') return null;

  for (const key of keys) {
    const value = object[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  for (const value of Object.values(object)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = firstValue(value, keys);
      if (nested !== null) return nested;
    }
  }

  return null;
}

function normalizeRating(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 10) / 10 : null;
}

function normalizeReviewCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
}

function formatHours(metadata) {
  const openNow = firstValue(metadata, ['open_now', 'is_open']);
  if (typeof openNow === 'boolean') return openNow ? 'Open now' : 'Closed now';
  return compact(firstValue(metadata, ['open_hours', 'opening_hours', 'hours']));
}

function imageFromMetadata(metadata) {
  const primaryPhoto = firstValue(metadata, ['primary_photo', 'photo', 'image', 'image_url']);
  if (typeof primaryPhoto === 'string') return primaryPhoto;
  if (primaryPhoto && typeof primaryPhoto === 'object') {
    return compact(firstValue(primaryPhoto, ['url', 'href', 'uri']));
  }
  return null;
}

function normalizeFeature(feature, category, origin, radiusMiles) {
  const properties = feature.properties || {};
  const metadata = properties.metadata || {};
  const [longitude, latitude] = feature.geometry?.coordinates || [];

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const miles = distanceMiles(origin.latitude, origin.longitude, latitude, longitude);
  if (miles > radiusMiles) return null;

  const roundedMiles = Math.round(miles * 10) / 10;
  const hours = formatHours(metadata);
  const rating = normalizeRating(firstValue(metadata, [
    'rating', 'average_rating', 'avg_rating', 'star_rating',
  ]));
  const reviewCount = normalizeReviewCount(firstValue(metadata, [
    'review_count', 'reviews_count', 'num_reviews', 'rating_count',
  ]));

  return {
    id: properties.mapbox_id || `${properties.name || properties.name_preferred}:${latitude}:${longitude}`,
    name: properties.name || properties.name_preferred || 'Resource',
    meta: `${roundedMiles.toFixed(roundedMiles < 10 ? 1 : 0)} mi away${hours ? ` - ${hours}` : ''}`,
    phone: compact(firstValue(metadata, ['phone', 'telephone', 'tel'])),
    website: compact(firstValue(metadata, ['website', 'url', 'homepage'])),
    address: properties.full_address || properties.address || properties.place_formatted || '',
    latitude,
    longitude,
    distanceMiles: roundedMiles,
    category,
    rating,
    reviewCount,
    hours,
    imageUrl: imageFromMetadata(metadata),
    mapboxId: properties.mapbox_id,
  };
}

function sortResources(resources) {
  return [...resources].sort((a, b) => {
    if (a.distanceMiles !== b.distanceMiles) return a.distanceMiles - b.distanceMiles;
    return String(a.name).localeCompare(String(b.name));
  });
}

function dedupeAndLimit(resources, limit = FINAL_CATEGORY_LIMIT) {
  const seen = new Set();
  const next = [];

  for (const resource of sortResources(resources)) {
    const key = resource.mapboxId || `${resource.name}:${resource.address}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(resource);
    if (next.length >= limit) break;
  }

  return next;
}

async function searchMapbox(query, category, origin, token, radiusMiles, source) {
  const params = new URLSearchParams({
    q: query,
    access_token: token,
    proximity: `${origin.longitude},${origin.latitude}`,
    bbox: bboxAround(origin, radiusMiles),
    types: 'poi',
    limit: '10',
    country: 'US',
  });

  const response = await fetch(`${MAPBOX_SEARCH_URL}?${params.toString()}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[Mapbox Search] ${response.status}: ${body}`);
  }

  const body = await response.json();
  return (body.features || [])
    .map((feature) => normalizeFeature(feature, category, origin, radiusMiles))
    .filter(Boolean)
    .map((resource) => ({
      ...resource,
      source,
      searchQuery: query,
      searchRadiusMiles: radiusMiles,
    }));
}

async function runQueries(category, queries, origin, token, radiusMiles, source) {
  const allResults = [];

  for (let i = 0; i < queries.length; i += MAPBOX_BATCH_SIZE) {
    if (i > 0) await new Promise((r) => setTimeout(r, MAPBOX_BATCH_DELAY_MS));

    const batch = queries.slice(i, i + MAPBOX_BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map((query) => searchMapbox(query, category, origin, token, radiusMiles, source))
    );

    for (const result of settled) {
      if (result.status === 'fulfilled') allResults.push(...result.value);
      else console.error('[AidAPI] Mapbox query failed:', result.reason?.message);
    }

    const candidates = dedupeAndLimit(allResults, CATEGORY_CANDIDATE_LIMIT);
    if (candidates.length >= CATEGORY_CANDIDATE_LIMIT) return candidates;
  }

  return dedupeAndLimit(allResults, CATEGORY_CANDIDATE_LIMIT);
}

async function generateFallbackQueries(category, origin) {
  if (!config.env.OPENROUTER_API_KEY) return [];

  try {
    const response = await createChatCompletion({
      models: AI_MODELS,
      max_tokens: 240,
      messages: [
        {
          role: 'system',
          content: `Generate Mapbox POI search queries for a survivor safety resource directory.
Return ONLY valid JSON in this exact shape:
{"queries":["query"]}

Rules:
- Generate at most ${FALLBACK_QUERY_LIMIT} concise search phrases.
- Do not invent resources or organization names.
- The phrases must be suitable for Mapbox POI text search.
- For shelter: include victim services, survivor services, emergency shelter, family shelter, crisis center terms.
- For legal: include legal aid, family law, restraining order, victim legal services terms.
- For financial: include social services, family resource center, food bank, emergency assistance terms.
- For counseling: include behavioral health, trauma counseling, crisis counseling terms.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            category,
            latitude: origin.latitude,
            longitude: origin.longitude,
            currentQueries: RESOURCE_QUERIES[category],
          }),
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content || '{}';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const body = JSON.parse(text.slice(jsonStart, jsonEnd));
    const queries = Array.isArray(body.queries) ? body.queries : [];

    return queries
      .map((query) => String(query || '').trim())
      .filter(Boolean)
      .filter((query) => !RESOURCE_QUERIES[category].includes(query))
      .slice(0, FALLBACK_QUERY_LIMIT);
  } catch (err) {
    console.error('[AidAPI] AI query fallback error:', err.message);
    return [];
  }
}

async function searchCategory(category, origin, token) {
  let collected = [];

  for (const radiusMiles of SEARCH_RADIUS_TIERS_MILES) {
    const resources = await runQueries(
      category,
      RESOURCE_QUERIES[category],
      origin,
      token,
      radiusMiles,
      'baseline'
    );
    collected = dedupeAndLimit([...collected, ...resources], CATEGORY_CANDIDATE_LIMIT);
    if (collected.length >= FINAL_CATEGORY_LIMIT) return collected;
  }

  const fallbackQueries = await generateFallbackQueries(category, origin);
  if (fallbackQueries.length === 0) return collected;

  for (const radiusMiles of SEARCH_RADIUS_TIERS_MILES.slice(1)) {
    const resources = await runQueries(
      category,
      fallbackQueries,
      origin,
      token,
      radiusMiles,
      'ai-query-fallback'
    );
    collected = dedupeAndLimit([...collected, ...resources], CATEGORY_CANDIDATE_LIMIT);
    if (collected.length >= FINAL_CATEGORY_LIMIT) return collected;
  }

  return collected;
}

export default requireAuth(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const latitude = parseCoordinate(req.body?.latitude);
  const longitude = parseCoordinate(req.body?.longitude);

  if (latitude === null || latitude < -90 || latitude > 90) {
    return res.status(400).json({ error: 'latitude must be between -90 and 90.' });
  }
  if (longitude === null || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'longitude must be between -180 and 180.' });
  }

  const token = config.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'Mapbox token is not configured.' });
  }

  const origin = { latitude, longitude };
  const result = {};

  for (const category of Object.keys(RESOURCE_QUERIES)) {
    try {
      const resources = await searchCategory(category, origin, token);
      result[category] = dedupeAndLimit(resources, FINAL_CATEGORY_LIMIT);
    } catch {
      result[category] = [];
    }
  }

  return res.status(200).json(result);
});
