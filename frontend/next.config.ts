import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              `connect-src 'self' ${API_URL} ws:`,
              "frame-ancestors 'none'",
              // NOTE: intentionally no `upgrade-insecure-requests`. It upgrades the
              // App Router's same-origin RSC fetches (plain http) to https, which
              // breaks client-side navigation whenever the app is served over HTTP
              // (local `next start`, e2e, self-hosted without TLS): the router gets
              // ERR_SSL_PROTOCOL_ERROR, falls back to a full browser navigation and
              // fixtures see ERR_ABORTED. HTTPS deployments rely on HSTS instead.
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
