/**
 * rateLimit.js — in-memory sliding window rate limiter for Next.js API routes.
 *
 * Tracks request counts per IP address in a Map. Entries expire automatically
 * after the window passes. For multi-instance deployments, swap the Map for a
 * Redis store — the logic stays the same.
 *
 * Usage:
 *   if (applyRateLimit(req, res, { max: 10, windowMs: 15 * 60 * 1000 })) return;
 *   // request is allowed — continue handler
 */

const store = new Map();

/**
 * Extracts the client IP from the request, accounting for proxies.
 * @param {import('next').NextApiRequest} req
 * @returns {string}
 */
function getIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Cleans up expired entries to prevent unbounded memory growth.
 */
function purgeExpired() {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
}

/**
 * Checks the rate limit for the incoming request. If the limit is exceeded,
 * sends a 429 response and returns true. Returns false if the request is allowed.
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 * @param {{ max: number, windowMs: number }} options
 * @returns {boolean} true if rate limited (caller should return immediately)
 */
function applyRateLimit(req, res, { max, windowMs }) {
  const ip = getIP(req);
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    if (store.size > 10000) purgeExpired();
    return false;
  }

  if (record.count >= max) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({
      error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
    });
    return true;
  }

  record.count++;
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(max - record.count));
  return false;
}

module.exports = { applyRateLimit };
