import type { NextConfig } from 'next';

const INTERNAL_API_ORIGIN =
  process.env.INTERNAL_API_ORIGIN ??
  (process.env.DOCKER === '1' ? 'http://api:3001' : 'http://localhost:3001');

const nextConfig: NextConfig = {
  experimental: {},
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/config', '@repo/types'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${INTERNAL_API_ORIGIN}/api/:path*`,
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
