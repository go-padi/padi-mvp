/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // KAN-167: disable Next.js's build-time ESLint pass. We run ESLint
    // separately via `pnpm lint` (gated in validate.sh). The flat-config
    // setup in eslint.config.mjs uses @next/eslint-plugin-next directly
    // with core-web-vitals rules, but Next.js's build-time lint pass
    // doesn't recognize flat-config and emits a noisy advisory.
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      serverActions: {
        allowedOrigins: ['*'],
      },
    },
    async headers() {
      // X-Robots-Tag covers what robots.txt and the meta tag can't —
      // non-HTML responses (API/JSON), and crawlers that honor headers
      // but not in-page meta. Belt-and-suspenders no-index.
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          ],
        },
      ];
    },
  };

  export default nextConfig;
