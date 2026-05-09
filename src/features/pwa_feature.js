/**
 * PwaFeature — Progressive Web App shell.
 *
 * Server-side responsibility: validate that required environment
 * variables exist and log PWA readiness. All actual PWA behavior
 * (service worker, manifests, install prompt) is client-side and
 * lives in src/pages/app/[theme].jsx and src/hooks/usePrivacyMode.js.
 *
 * The three cover identities (Calculator / News / Weather) are
 * configured entirely in the static manifests under public/manifests/.
 * Switching icons or names never requires a server restart.
 */

const path = require('path');
const fs = require('fs');

const MANIFEST_DIR = path.join(process.cwd(), 'public', 'manifests');
const REQUIRED_MANIFESTS = ['calculator.json', 'news.json', 'weather.json'];

class PwaFeature {
  static init() {
    // Fail fast if any manifest file is missing — the app shell would
    // silently break without a valid manifest link in the HTML head.
    const missing = REQUIRED_MANIFESTS.filter(
      (file) => !fs.existsSync(path.join(MANIFEST_DIR, file))
    );

    if (missing.length > 0) {
      throw new Error(
        `[PwaFeature] Missing manifest files: ${missing.join(', ')}. ` +
          `Expected at public/manifests/.`
      );
    }

    const safeExitUrl = process.env.NEXT_PUBLIC_SAFE_EXIT_URL || 'https://www.google.com';
    console.log(`[PwaFeature] PWA ready. Safe-exit URL: ${safeExitUrl}`);
    console.log(`[PwaFeature] Cover identities: ${REQUIRED_MANIFESTS.join(', ')}`);
  }
}

module.exports = { PwaFeature };
