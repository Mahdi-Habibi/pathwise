import type { NextConfig } from 'next';
import path from 'node:path';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const isDockerBuild = process.env.DOCKER_BUILD === 'true';
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? 'http://localhost:3001').replace(/\/$/, '');

const nextConfig: NextConfig = {
  ...(isDockerBuild
    ? {
        output: 'standalone' as const,
        outputFileTracingRoot: path.join(process.cwd(), '../..'),
      }
    : {}),
  transpilePackages: ['@pathwise/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
