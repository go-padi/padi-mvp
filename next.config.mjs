/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
