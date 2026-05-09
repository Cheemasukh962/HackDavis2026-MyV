/**
 * applySecurityHeaders — call at the top of every auth API route handler.
 *
 * Cache headers prevent the browser from storing auth responses in its
 * HTTP cache, back/forward cache, or disk cache — a core zero-trace
 * requirement so shared or abuser-controlled devices leave no trail.
 *
 * @param {import('next').NextApiResponse} res
 */
function applySecurityHeaders(res) {
  // Prevent any caching layer (browser, CDN, proxy) from storing the response.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Defense-in-depth headers.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

module.exports = { applySecurityHeaders };
