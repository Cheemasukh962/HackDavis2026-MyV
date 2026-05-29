/**
 * colorExtract.js — canvas-based dominant color extraction.
 *
 * extractAccentColor(imageUrl) samples a downscaled version of an image using
 * the HTML Canvas API and returns the most saturated non-white, non-black pixel
 * as a hex color string. Used by HeroStory to tint the news feed background to
 * match the lead article's cover image.
 *
 * Browser-only — do not call from API routes or server-side code.
 */

/**
 * Samples a downscaled version of an image and returns the average color as an
 * "r,g,b" string (no #, no rgb() wrapper) for use in CSS rgba() values.
 * Resolves null on error, missing URL, or cross-origin failure.
 *
 * @param {string} imageUrl - Fully qualified image URL.
 * @returns {Promise<string|null>} e.g. "120,80,200" or null.
 */
export function extractAccentColor(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 40;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        resolve(`${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)}`);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
