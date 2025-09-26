import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/config', '@repo/types'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:3001/api/:path*',
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
