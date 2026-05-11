import type { NextConfig } from "next";

const allowedHosts = (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS ?? 'images.unsplash.com,res.cloudinary.com')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
