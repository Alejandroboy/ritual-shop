import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  transpilePackages: ['@repo/ui', '@repo/config', '@repo/types'],
};

export default nextConfig;
