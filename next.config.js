/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    const noCache = [
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      { key: 'Pragma', value: 'no-cache' },
      { key: 'Expires', value: '0' },
      { key: 'Surrogate-Control', value: 'no-store' },
    ];

    const securityDefaults = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
    ];

    return [
      // All API routes: no caching.
      {
        source: '/api/:path*',
        headers: [...noCache, ...securityDefaults],
      },
      // App pages and login: no-store prevents browser HTTP cache and bfcache.
      {
        source: '/login',
        headers: noCache,
      },
      {
        source: '/app/:path*',
        headers: noCache,
      },
      {
        source: '/preview/:path*',
        headers: noCache,
      },
      // Security defaults site-wide.
      {
        source: '/:path*',
        headers: securityDefaults,
      },
    ];
  },
};

module.exports = nextConfig;
