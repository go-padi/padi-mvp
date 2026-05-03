import type { MetadataRoute } from 'next';

/**
 * No-index policy for padi-mvp.vercel.app.
 *
 * The teacher app exposes curriculum content (preview mode is intentional
 * per KAN-127), but we don't want search engines surfacing it. Well-behaved
 * crawlers honor robots.txt; the meta tag in app/layout.tsx and the
 * X-Robots-Tag header in next.config.mjs cover the same intent for crawlers
 * that ignore robots.txt or hit non-HTML routes.
 *
 * This does NOT prevent scraping by determined actors — see GTM/PROD docs
 * if rate limiting becomes necessary.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
