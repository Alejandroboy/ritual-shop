import type { NextConfig } from 'next';

const INTERNAL_API_ORIGIN =
  process.env.INTERNAL_API_ORIGIN ??
  (process.env.DOCKER === '1' ? 'http://api:3001' : 'http://localhost:3001');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
        pathname: '/e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367/**',
      },
    ],
  },
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
