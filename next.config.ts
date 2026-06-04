import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Static export for Cloudflare Pages
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'evergrowlandscaping.com',
      },
      {
        protocol: 'https',
        hostname: 'www.evergrowlandscaping.com',
      },
      {
        protocol: 'https',
        hostname: 'evergrowlandscaping.pages.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  trailingSlash: true, // Better routing for static sites
};

export default nextConfig;
